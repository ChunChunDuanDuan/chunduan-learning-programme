create extension if not exists vector;

create table if not exists public.texts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  translator text,
  language text,
  file_name text not null,
  source_type text not null default 'web_upload' check (source_type in ('web_upload', 'backend_folder', 'storage_bucket')),
  source_path text,
  file_hash text not null unique,
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz,
  ingestion_status text not null default 'pending' check (ingestion_status in ('pending', 'processing', 'completed', 'failed')),
  ingestion_error text
);

create table if not exists public.text_chunks (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.texts(id) on delete cascade,
  chunk_text text not null,
  page_start integer,
  page_end integer,
  chapter text,
  section_title text,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create table if not exists public.text_link_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query_text text not null,
  mode text not null default 'strict' check (mode in ('strict', 'explore')),
  language_mode text not null default 'balanced' check (language_mode in ('balanced', 'original_first')),
  created_at timestamptz not null default now()
);

create table if not exists public.text_link_results (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.text_link_queries(id) on delete cascade,
  text_id uuid not null references public.texts(id) on delete cascade,
  chunk_id uuid not null references public.text_chunks(id) on delete cascade,
  similarity_score double precision,
  match_type text not null default 'semantic' check (match_type in ('semantic', 'keyword', 'hybrid')),
  user_saved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists texts_user_uploaded_idx
  on public.texts (user_id, uploaded_at desc);

create index if not exists texts_hash_idx
  on public.texts (file_hash);

create index if not exists text_chunks_text_idx
  on public.text_chunks (text_id);

create index if not exists text_chunks_embedding_idx
  on public.text_chunks using hnsw (embedding vector_cosine_ops);

create index if not exists text_link_queries_user_created_idx
  on public.text_link_queries (user_id, created_at desc);

alter table public.texts enable row level security;
alter table public.text_chunks enable row level security;
alter table public.text_link_queries enable row level security;
alter table public.text_link_results enable row level security;

create policy "Users can read own texts"
on public.texts for select
using (auth.uid() = user_id);

create policy "Users can insert own texts"
on public.texts for insert
with check (auth.uid() = user_id);

create policy "Users can update own texts"
on public.texts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own texts"
on public.texts for delete
using (auth.uid() = user_id);

create policy "Users can read chunks from own texts"
on public.text_chunks for select
using (
  exists (
    select 1 from public.texts
    where texts.id = text_chunks.text_id
      and texts.user_id = auth.uid()
  )
);

create policy "Users can insert chunks for own texts"
on public.text_chunks for insert
with check (
  exists (
    select 1 from public.texts
    where texts.id = text_chunks.text_id
      and texts.user_id = auth.uid()
  )
);

create policy "Users can delete chunks from own texts"
on public.text_chunks for delete
using (
  exists (
    select 1 from public.texts
    where texts.id = text_chunks.text_id
      and texts.user_id = auth.uid()
  )
);

create policy "Users can read own text link queries"
on public.text_link_queries for select
using (auth.uid() = user_id);

create policy "Users can insert own text link queries"
on public.text_link_queries for insert
with check (auth.uid() = user_id);

create policy "Users can read own text link results"
on public.text_link_results for select
using (
  exists (
    select 1 from public.text_link_queries
    where text_link_queries.id = text_link_results.query_id
      and text_link_queries.user_id = auth.uid()
  )
);

create policy "Users can insert own text link results"
on public.text_link_results for insert
with check (
  exists (
    select 1 from public.text_link_queries
    where text_link_queries.id = text_link_results.query_id
      and text_link_queries.user_id = auth.uid()
  )
);

create or replace function public.match_text_chunks(
  query_embedding vector(1536),
  query_text text,
  match_count int default 10,
  strict_mode boolean default true,
  original_first boolean default false
)
returns table (
  text_id uuid,
  chunk_id uuid,
  title text,
  author text,
  translator text,
  language text,
  chunk_text text,
  page_start integer,
  page_end integer,
  chapter text,
  section_title text,
  similarity_score double precision,
  keyword_rank double precision,
  match_type text
)
language sql
stable
as $$
  with semantic_matches as (
    select
      texts.id as text_id,
      text_chunks.id as chunk_id,
      texts.title,
      texts.author,
      texts.translator,
      texts.language,
      text_chunks.chunk_text,
      text_chunks.page_start,
      text_chunks.page_end,
      text_chunks.chapter,
      text_chunks.section_title,
      1 - (text_chunks.embedding <=> query_embedding) as similarity_score,
      null::double precision as keyword_rank,
      'semantic'::text as match_type
    from public.text_chunks
    join public.texts on texts.id = text_chunks.text_id
    where texts.ingestion_status = 'completed'
      and text_chunks.embedding is not null
      and (not strict_mode or 1 - (text_chunks.embedding <=> query_embedding) >= 0.60)
    order by
      case when original_first and texts.language in ('German', 'Deutsch', 'Greek', 'Latin', 'French') then 0 else 1 end,
      text_chunks.embedding <=> query_embedding
    limit match_count
  ),
  keyword_matches as (
    select
      texts.id as text_id,
      text_chunks.id as chunk_id,
      texts.title,
      texts.author,
      texts.translator,
      texts.language,
      text_chunks.chunk_text,
      text_chunks.page_start,
      text_chunks.page_end,
      text_chunks.chapter,
      text_chunks.section_title,
      null::double precision as similarity_score,
      ts_rank_cd(to_tsvector('simple', text_chunks.chunk_text), plainto_tsquery('simple', query_text))::double precision as keyword_rank,
      'keyword'::text as match_type
    from public.text_chunks
    join public.texts on texts.id = text_chunks.text_id
    where texts.ingestion_status = 'completed'
      and (
        to_tsvector('simple', text_chunks.chunk_text) @@ plainto_tsquery('simple', query_text)
        or text_chunks.chunk_text ilike '%' || query_text || '%'
      )
    order by
      case when original_first and texts.language in ('German', 'Deutsch', 'Greek', 'Latin', 'French') then 0 else 1 end,
      keyword_rank desc nulls last
    limit match_count
  )
  select distinct on (chunk_id) *
  from (
    select * from semantic_matches
    union all
    select * from keyword_matches
  ) matches
  order by chunk_id, similarity_score desc nulls last, keyword_rank desc nulls last
  limit match_count;
$$;