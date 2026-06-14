export type TextSourceType = "web_upload" | "backend_folder" | "storage_bucket";

export type TextIngestionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type TextRecord = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  translator: string | null;
  language: string | null;
  file_name: string;
  source_type: TextSourceType;
  source_path: string | null;
  file_hash: string;
  uploaded_at: string;
  processed_at: string | null;
  ingestion_status: TextIngestionStatus;
  ingestion_error: string | null;
  chunk_count?: number;
};

export type TextChunk = {
  id: string;
  text_id: string;
  chunk_text: string;
  page_start: number | null;
  page_end: number | null;
  chapter: string | null;
  section_title: string | null;
  created_at: string;
};

export type TextLinkMode = "strict" | "explore";
export type TextLinkLanguageMode = "balanced" | "original_first";

export type TextLinkSearchResult = {
  result_id?: string;
  text_id: string;
  chunk_id: string;
  title: string;
  author: string | null;
  translator: string | null;
  language: string | null;
  chunk_text: string;
  page_start: number | null;
  page_end: number | null;
  chapter: string | null;
  section_title: string | null;
  similarity_score: number | null;
  keyword_rank: number | null;
  match_type: "semantic" | "keyword" | "hybrid";
  relevance: "High" | "Medium" | "Low";
  why_relevant: string;
  user_saved?: boolean;
};

export type TextLinkSearchResponse = {
  query_id: string | null;
  found_count: number;
  fallback_message?: string;
  results: TextLinkSearchResult[];
};