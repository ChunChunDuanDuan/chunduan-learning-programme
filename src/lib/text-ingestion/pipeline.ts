
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";
import { PDFParse } from "pdf-parse";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TextSourceType } from "../../types/text-linker";

export type TextMetadataInput = {
  title?: string | null;
  author?: string | null;
  translator?: string | null;
  language?: string | null;
  fileName: string;
};

export type TextSourceInfo = {
  source_type: TextSourceType;
  source_path?: string | null;
  user_id: string;
};

export type IngestTextFileOptions = {
  fileBuffer: Buffer;
  metadata: TextMetadataInput;
  sourceInfo: TextSourceInfo;
  supabase: SupabaseClient;
};

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
const OCR_ERROR = "此 PDF 可能需要 OCR 後才能加入文本資料庫。";
const STORAGE_DIR = path.join(process.cwd(), "storage", "texts");

function cleanMetadataValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeTitle(metadata: TextMetadataInput) {
  return cleanMetadataValue(metadata.title) || metadata.fileName.replace(/\.pdf$/i, "");
}

function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  const paragraphs = normalized.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs.length ? paragraphs : [normalized]) {
    if ((current + "\n\n" + paragraph).trim().length > 1800 && current.length > 0) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.filter((chunk) => chunk.length >= 80).slice(0, 1200);
}

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

async function createEmbedding(text: string) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Text chunks were extracted, but embeddings could not be created.");
  }

  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000),
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0]?.embedding;
}

function estimatePage(index: number, totalChunks: number, pageCount: number | undefined) {
  if (!pageCount || pageCount < 1 || totalChunks < 1) return null;
  return Math.max(1, Math.min(pageCount, Math.ceil(((index + 1) / totalChunks) * pageCount)));
}

async function saveOriginalPdf(fileHash: string, fileBuffer: Buffer, fileName: string) {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const storagePath = path.join(STORAGE_DIR, `${fileHash}-${safeName}`);
  await fs.writeFile(storagePath, fileBuffer);
  return storagePath;
}

async function markFailed(supabase: SupabaseClient, textId: string, error: string) {
  await supabase
    .from("texts")
    .update({
      ingestion_status: "failed",
      ingestion_error: error,
      processed_at: new Date().toISOString(),
    })
    .eq("id", textId);
}

export async function ingestTextFile({
  fileBuffer,
  metadata,
  sourceInfo,
  supabase,
}: IngestTextFileOptions) {
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  const fileName = metadata.fileName;
  const sourcePath = sourceInfo.source_path || (await saveOriginalPdf(fileHash, fileBuffer, fileName));

  const { data: existing, error: existingError } = await supabase
    .from("texts")
    .select("id, title, ingestion_status")
    .eq("file_hash", fileHash)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    return {
      textId: existing.id as string,
      status: "skipped" as const,
      reason: "duplicate_file_hash",
    };
  }

  const { data: textRecord, error: insertError } = await supabase
    .from("texts")
    .insert({
      user_id: sourceInfo.user_id,
      title: normalizeTitle(metadata),
      author: cleanMetadataValue(metadata.author),
      translator: cleanMetadataValue(metadata.translator),
      language: cleanMetadataValue(metadata.language),
      file_name: fileName,
      source_type: sourceInfo.source_type,
      source_path: sourcePath,
      file_hash: fileHash,
      ingestion_status: "processing",
      ingestion_error: null,
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  const textId = textRecord.id as string;

  let parser: PDFParse | null = null;

  try {
    parser = new PDFParse({ data: fileBuffer });
    const parsed = await parser.getText();
    const extracted = parsed.text?.trim() || "";

    if (extracted.length < 80) {
      await parser.destroy();
      parser = null;
      await markFailed(supabase, textId, OCR_ERROR);
      return {
        textId,
        status: "failed" as const,
        reason: OCR_ERROR,
      };
    }

    const chunks = chunkText(extracted);

    if (chunks.length === 0) {
      await parser.destroy();
      parser = null;
      await markFailed(supabase, textId, OCR_ERROR);
      return {
        textId,
        status: "failed" as const,
        reason: OCR_ERROR,
      };
    }

    await supabase.from("text_chunks").delete().eq("text_id", textId);

    const pageCount = parsed.total;
    const rows = [];

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index];
      const embedding = await createEmbedding(chunk);
      const page = estimatePage(index, chunks.length, pageCount);

      rows.push({
        text_id: textId,
        chunk_text: chunk,
        page_start: page,
        page_end: page,
        chapter: null,
        section_title: null,
        embedding,
      });
    }

    const { error: chunkError } = await supabase.from("text_chunks").insert(rows);
    if (chunkError) throw chunkError;

    const { error: updateError } = await supabase
      .from("texts")
      .update({
        ingestion_status: "completed",
        ingestion_error: null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", textId);

    if (updateError) throw updateError;

    await parser.destroy();
    parser = null;

    return {
      textId,
      status: "completed" as const,
      chunkCount: rows.length,
    };
  } catch (error) {
    if (parser) await parser.destroy();
    const message = error instanceof Error ? error.message : "Unknown ingestion error.";
    await markFailed(supabase, textId, message);

    return {
      textId,
      status: "failed" as const,
      reason: message,
    };
  }
}
