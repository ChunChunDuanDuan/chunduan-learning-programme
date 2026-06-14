import fs from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { ingestTextFile } from "../src/lib/text-ingestion/pipeline";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const IMPORT_DIR = path.join(process.cwd(), "backend-import", "texts");

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function inferMetadata(fileName: string) {
  const title = fileName.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();

  return {
    title,
    author: null,
    translator: null,
    language: null,
    fileName,
  };
}

async function main() {
  await fs.mkdir(IMPORT_DIR, { recursive: true });

  const userId = process.env.TEXT_INGEST_USER_ID?.trim();
  if (!userId) {
    throw new Error("Missing TEXT_INGEST_USER_ID. Set it to the owner auth.users.id for backend folder imports.");
  }

  const supabase = createServiceClient();
  const entries = await fs.readdir(IMPORT_DIR, { withFileTypes: true });
  const pdfFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));

  const summary: {
    imported: number;
    skipped: number;
    failed: Array<{ file: string; reason: string }>;
  } = {
    imported: 0,
    skipped: 0,
    failed: [],
  };

  for (const file of pdfFiles) {
    const filePath = path.join(IMPORT_DIR, file.name);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const result = await ingestTextFile({
        fileBuffer,
        metadata: inferMetadata(file.name),
        sourceInfo: {
          source_type: "backend_folder",
          source_path: filePath,
          user_id: userId,
        },
        supabase,
      });

      if (result.status === "completed") {
        summary.imported += 1;
        console.log(`Imported ${file.name}: ${result.chunkCount} chunks`);
      } else if (result.status === "skipped") {
        summary.skipped += 1;
        console.log(`Skipped duplicate ${file.name}`);
      } else {
        summary.failed.push({ file: file.name, reason: result.reason });
        console.log(`Failed ${file.name}: ${result.reason}`);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      summary.failed.push({ file: file.name, reason });
      console.log(`Failed ${file.name}: ${reason}`);
    }
  }

  console.log("\nText ingestion summary");
  console.log(`Successful imports: ${summary.imported}`);
  console.log(`Skipped duplicates: ${summary.skipped}`);
  console.log(`Failed imports: ${summary.failed.length}`);

  if (summary.failed.length > 0) {
    for (const failure of summary.failed) {
      console.log(`- ${failure.file}: ${failure.reason}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});