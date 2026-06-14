
import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TextLinkLanguageMode,
  TextLinkMode,
  TextLinkSearchResponse,
  TextLinkSearchResult,
} from "../../types/text-linker";

const NO_BASIS = "目前文本資料庫中找不到明確文本依據。";
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

type RawMatch = Omit<TextLinkSearchResult, "relevance" | "why_relevant">;

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

async function createQueryEmbedding(query: string) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY for semantic search.");

  const client = new OpenAI({ apiKey });
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0]?.embedding;
}

function getRelevance(score: number | null, mode: TextLinkMode): "High" | "Medium" | "Low" {
  if (score === null) return mode === "strict" ? "Low" : "Medium";
  if (score >= 0.78) return "High";
  if (score >= 0.68) return "Medium";
  return "Low";
}

function makeWhyRelevant(result: RawMatch, query: string) {
  const source = result.match_type === "keyword" ? "keyword overlap" : "semantic similarity";
  return `Retrieved from the text database by ${source} for the query "${query}". The connection is limited to this retrieved passage.`;
}

function dedupeResults(results: RawMatch[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (seen.has(result.chunk_id)) return false;
    seen.add(result.chunk_id);
    return true;
  });
}

export async function searchTextLinks({
  query,
  mode,
  languageMode,
  userId,
  supabase,
  limit = 10,
}: {
  query: string;
  mode: TextLinkMode;
  languageMode: TextLinkLanguageMode;
  userId: string;
  supabase: SupabaseClient;
  limit?: number;
}): Promise<TextLinkSearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query_id: null, found_count: 0, fallback_message: NO_BASIS, results: [] };
  }

  const { data: queryRow, error: queryError } = await supabase
    .from("text_link_queries")
    .insert({
      user_id: userId,
      query_text: trimmed,
      mode,
      language_mode: languageMode,
    })
    .select("id")
    .single();

  if (queryError) throw queryError;

  const queryId = queryRow.id as string;
  const embedding = await createQueryEmbedding(trimmed);

  const { data, error } = await supabase.rpc("match_text_chunks", {
    query_embedding: embedding,
    query_text: trimmed,
    match_count: limit,
    strict_mode: mode === "strict",
    original_first: languageMode === "original_first",
  });

  if (error) throw error;

  const rawResults = dedupeResults((data || []) as RawMatch[]);
  const filtered = mode === "strict"
    ? rawResults.filter((result) => (result.similarity_score ?? 0) >= 0.64 || result.match_type !== "semantic")
    : rawResults;

  if (filtered.length === 0) {
    return { query_id: queryId, found_count: 0, fallback_message: NO_BASIS, results: [] };
  }

  const insertRows = filtered.map((result) => ({
    query_id: queryId,
    text_id: result.text_id,
    chunk_id: result.chunk_id,
    similarity_score: result.similarity_score,
    match_type: result.match_type,
    user_saved: false,
  }));

  const { data: savedResults, error: saveError } = await supabase
    .from("text_link_results")
    .insert(insertRows)
    .select("id, chunk_id");

  if (saveError) throw saveError;

  const idByChunk = new Map(
    (savedResults || []).map((item: { id: string; chunk_id: string }) => [
      item.chunk_id,
      item.id,
    ])
  );

  const results = filtered.slice(0, limit).map((result) => ({
    ...result,
    result_id: idByChunk.get(result.chunk_id),
    relevance: getRelevance(result.similarity_score, mode),
    why_relevant: makeWhyRelevant(result, trimmed),
    user_saved: false,
  }));

  return {
    query_id: queryId,
    found_count: results.length,
    results,
  };
}
