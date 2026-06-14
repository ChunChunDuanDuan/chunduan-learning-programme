import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseUserClient } from "../../../../../../lib/supabase/server";
import { ingestTextFile } from "../../../../../../lib/text-ingestion/pipeline";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const serviceClient = createSupabaseServiceClient();
    const { data: text, error } = await serviceClient
      .from("texts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    if (!text.source_path) {
      return NextResponse.json({ error: "Original PDF path is missing." }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(text.source_path);
    await serviceClient.from("text_chunks").delete().eq("text_id", id);
    await serviceClient.from("texts").delete().eq("id", id);

    const result = await ingestTextFile({
      fileBuffer,
      metadata: {
        title: text.title,
        author: text.author,
        translator: text.translator,
        language: text.language,
        fileName: text.file_name,
      },
      sourceInfo: {
        source_type: text.source_type,
        source_path: text.source_path,
        user_id: user.id,
      },
      supabase: serviceClient,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reprocess failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}