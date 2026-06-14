import { NextResponse } from "next/server";
import { createSupabaseServiceClient, createSupabaseUserClient } from "../../../../lib/supabase/server";
import { searchTextLinks } from "../../../../lib/text-ingestion/search";
import type { TextLinkLanguageMode, TextLinkMode } from "../../../../types/text-linker";

function getBearerToken(request: Request) {
  const header = request.headers.get("authorization") || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

function getMode(value: unknown): TextLinkMode {
  return value === "explore" ? "explore" : "strict";
}

function getLanguageMode(value: unknown): TextLinkLanguageMode {
  return value === "original_first" ? "original_first" : "balanced";
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

    const body = await request.json();
    const query = String(body.query || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const result = await searchTextLinks({
      query,
      mode: getMode(body.mode),
      languageMode: getLanguageMode(body.languageMode),
      userId: user.id,
      supabase: createSupabaseServiceClient(),
      limit: 10,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}