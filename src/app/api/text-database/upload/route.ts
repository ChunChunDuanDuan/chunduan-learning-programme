import { NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseUserClient } from "../../../../lib/supabase/server";
import { ingestTextFile } from "../../../../lib/text-ingestion/pipeline";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json({ error: "Missing user session." }, { status: 401 });
    }

    const userClient = createSupabaseUserClient(token);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token);

    if (userError) throw userError;
    if (!user) {
      return NextResponse.json({ error: "User is not logged in." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "PDF file is required." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const serviceClient = createSupabaseServiceClient();

    const result = await ingestTextFile({
      fileBuffer: buffer,
      metadata: {
        title: String(formData.get("title") || ""),
        author: String(formData.get("author") || ""),
        translator: String(formData.get("translator") || ""),
        language: String(formData.get("language") || ""),
        fileName: file.name,
      },
      sourceInfo: {
        source_type: "web_upload",
        user_id: user.id,
      },
      supabase: serviceClient,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}