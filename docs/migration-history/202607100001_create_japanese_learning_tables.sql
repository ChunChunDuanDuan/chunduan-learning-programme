create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.japanese_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  writing text not null,
  reading_kana text not null,
  romaji text,
  meaning_zh text not null,
  part_of_speech text,
  example_sentence text,
  tags text[] not null default '{}',
  source text,
  notes text,
  mastery text not null default '未學' check (mastery in ('未學', '學習中', '熟悉', '已掌握')),
  add_to_anki boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.japanese_sentences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  japanese_text text not null,
  furigana_text text,
  romaji text,
  translation_zh text not null,
  structure_notes text,
  grammar_points text,
  source text,
  tags text[] not null default '{}',
  notes text,
  add_to_anki boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.japanese_sentence_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  japanese_text text not null,
  furigana_text text,
  romaji text,
  translation_zh text,
  sentence_core text,
  grammar_notes text,
  source text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.japanese_sentence_analysis_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.japanese_sentence_analyses(id) on delete cascade,
  original_text text not null,
  reading text,
  dictionary_form text,
  part_of_speech text,
  meaning_zh text,
  grammar_function text,
  notes text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kana_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kana_key text not null,
  answer_count integer not null default 0,
  correct_count integer not null default 0,
  last_answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kana_key)
);

create table if not exists public.anki_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_type text not null check (card_type in ('japanese_vocabulary', 'japanese_sentence', 'custom')),
  front text not null,
  back text not null,
  source_item_type text,
  source_item_id uuid,
  tags text[] not null default '{}',
  status text not null default '待處理' check (status in ('待處理', '已確認', '已匯出')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (user_id, card_type, source_item_type, source_item_id)
);

create table if not exists public.comparison_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  comparison_type text not null default '句子' check (comparison_type in ('句子', '術語', '段落')),
  chinese_text text,
  english_text text,
  german_text text,
  japanese_text text,
  japanese_furigana text,
  japanese_romaji text,
  source text,
  tags text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.term_alignments (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparison_documents(id) on delete cascade,
  chinese_term text,
  english_term text,
  german_term text,
  japanese_term text,
  note text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists japanese_vocabulary_user_updated_idx
  on public.japanese_vocabulary (user_id, updated_at desc);
create index if not exists japanese_vocabulary_user_created_idx
  on public.japanese_vocabulary (user_id, created_at desc);
create index if not exists japanese_vocabulary_tags_idx
  on public.japanese_vocabulary using gin (tags);
create index if not exists japanese_vocabulary_duplicate_idx
  on public.japanese_vocabulary (user_id, writing, reading_kana);

create index if not exists japanese_sentences_user_updated_idx
  on public.japanese_sentences (user_id, updated_at desc);
create index if not exists japanese_sentences_user_created_idx
  on public.japanese_sentences (user_id, created_at desc);
create index if not exists japanese_sentences_tags_idx
  on public.japanese_sentences using gin (tags);
create index if not exists japanese_sentences_duplicate_idx
  on public.japanese_sentences (user_id, japanese_text);

create index if not exists japanese_sentence_analyses_user_updated_idx
  on public.japanese_sentence_analyses (user_id, updated_at desc);
create index if not exists japanese_sentence_analysis_items_analysis_idx
  on public.japanese_sentence_analysis_items (analysis_id, display_order);

create index if not exists kana_progress_user_key_idx
  on public.kana_progress (user_id, kana_key);

create index if not exists anki_drafts_user_updated_idx
  on public.anki_drafts (user_id, updated_at desc);
create index if not exists anki_drafts_tags_idx
  on public.anki_drafts using gin (tags);

create index if not exists comparison_documents_user_updated_idx
  on public.comparison_documents (user_id, updated_at desc);
create index if not exists comparison_documents_tags_idx
  on public.comparison_documents using gin (tags);
create index if not exists term_alignments_comparison_idx
  on public.term_alignments (comparison_id, display_order);

drop trigger if exists set_japanese_vocabulary_updated_at on public.japanese_vocabulary;
create trigger set_japanese_vocabulary_updated_at
before update on public.japanese_vocabulary
for each row execute function public.set_updated_at();

drop trigger if exists set_japanese_sentences_updated_at on public.japanese_sentences;
create trigger set_japanese_sentences_updated_at
before update on public.japanese_sentences
for each row execute function public.set_updated_at();

drop trigger if exists set_japanese_sentence_analyses_updated_at on public.japanese_sentence_analyses;
create trigger set_japanese_sentence_analyses_updated_at
before update on public.japanese_sentence_analyses
for each row execute function public.set_updated_at();

drop trigger if exists set_japanese_sentence_analysis_items_updated_at on public.japanese_sentence_analysis_items;
create trigger set_japanese_sentence_analysis_items_updated_at
before update on public.japanese_sentence_analysis_items
for each row execute function public.set_updated_at();

drop trigger if exists set_kana_progress_updated_at on public.kana_progress;
create trigger set_kana_progress_updated_at
before update on public.kana_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_anki_drafts_updated_at on public.anki_drafts;
create trigger set_anki_drafts_updated_at
before update on public.anki_drafts
for each row execute function public.set_updated_at();

drop trigger if exists set_comparison_documents_updated_at on public.comparison_documents;
create trigger set_comparison_documents_updated_at
before update on public.comparison_documents
for each row execute function public.set_updated_at();

drop trigger if exists set_term_alignments_updated_at on public.term_alignments;
create trigger set_term_alignments_updated_at
before update on public.term_alignments
for each row execute function public.set_updated_at();

alter table public.japanese_vocabulary enable row level security;
alter table public.japanese_sentences enable row level security;
alter table public.japanese_sentence_analyses enable row level security;
alter table public.japanese_sentence_analysis_items enable row level security;
alter table public.kana_progress enable row level security;
alter table public.anki_drafts enable row level security;
alter table public.comparison_documents enable row level security;
alter table public.term_alignments enable row level security;

create policy "Users can read own Japanese vocabulary" on public.japanese_vocabulary for select using (auth.uid() = user_id);
create policy "Users can insert own Japanese vocabulary" on public.japanese_vocabulary for insert with check (auth.uid() = user_id);
create policy "Users can update own Japanese vocabulary" on public.japanese_vocabulary for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own Japanese vocabulary" on public.japanese_vocabulary for delete using (auth.uid() = user_id);

create policy "Users can read own Japanese sentences" on public.japanese_sentences for select using (auth.uid() = user_id);
create policy "Users can insert own Japanese sentences" on public.japanese_sentences for insert with check (auth.uid() = user_id);
create policy "Users can update own Japanese sentences" on public.japanese_sentences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own Japanese sentences" on public.japanese_sentences for delete using (auth.uid() = user_id);

create policy "Users can read own Japanese analyses" on public.japanese_sentence_analyses for select using (auth.uid() = user_id);
create policy "Users can insert own Japanese analyses" on public.japanese_sentence_analyses for insert with check (auth.uid() = user_id);
create policy "Users can update own Japanese analyses" on public.japanese_sentence_analyses for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own Japanese analyses" on public.japanese_sentence_analyses for delete using (auth.uid() = user_id);

create policy "Users can read own Japanese analysis items" on public.japanese_sentence_analysis_items for select using (
  exists (select 1 from public.japanese_sentence_analyses where japanese_sentence_analyses.id = japanese_sentence_analysis_items.analysis_id and japanese_sentence_analyses.user_id = auth.uid())
);
create policy "Users can insert own Japanese analysis items" on public.japanese_sentence_analysis_items for insert with check (
  exists (select 1 from public.japanese_sentence_analyses where japanese_sentence_analyses.id = japanese_sentence_analysis_items.analysis_id and japanese_sentence_analyses.user_id = auth.uid())
);
create policy "Users can update own Japanese analysis items" on public.japanese_sentence_analysis_items for update using (
  exists (select 1 from public.japanese_sentence_analyses where japanese_sentence_analyses.id = japanese_sentence_analysis_items.analysis_id and japanese_sentence_analyses.user_id = auth.uid())
) with check (
  exists (select 1 from public.japanese_sentence_analyses where japanese_sentence_analyses.id = japanese_sentence_analysis_items.analysis_id and japanese_sentence_analyses.user_id = auth.uid())
);
create policy "Users can delete own Japanese analysis items" on public.japanese_sentence_analysis_items for delete using (
  exists (select 1 from public.japanese_sentence_analyses where japanese_sentence_analyses.id = japanese_sentence_analysis_items.analysis_id and japanese_sentence_analyses.user_id = auth.uid())
);

create policy "Users can read own kana progress" on public.kana_progress for select using (auth.uid() = user_id);
create policy "Users can insert own kana progress" on public.kana_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own kana progress" on public.kana_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own kana progress" on public.kana_progress for delete using (auth.uid() = user_id);

create policy "Users can read own Anki drafts" on public.anki_drafts for select using (auth.uid() = user_id);
create policy "Users can insert own Anki drafts" on public.anki_drafts for insert with check (auth.uid() = user_id);
create policy "Users can update own Anki drafts" on public.anki_drafts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own Anki drafts" on public.anki_drafts for delete using (auth.uid() = user_id);

create policy "Users can read own comparison documents" on public.comparison_documents for select using (auth.uid() = user_id);
create policy "Users can insert own comparison documents" on public.comparison_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own comparison documents" on public.comparison_documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own comparison documents" on public.comparison_documents for delete using (auth.uid() = user_id);

create policy "Users can read own term alignments" on public.term_alignments for select using (
  exists (select 1 from public.comparison_documents where comparison_documents.id = term_alignments.comparison_id and comparison_documents.user_id = auth.uid())
);
create policy "Users can insert own term alignments" on public.term_alignments for insert with check (
  exists (select 1 from public.comparison_documents where comparison_documents.id = term_alignments.comparison_id and comparison_documents.user_id = auth.uid())
);
create policy "Users can update own term alignments" on public.term_alignments for update using (
  exists (select 1 from public.comparison_documents where comparison_documents.id = term_alignments.comparison_id and comparison_documents.user_id = auth.uid())
) with check (
  exists (select 1 from public.comparison_documents where comparison_documents.id = term_alignments.comparison_id and comparison_documents.user_id = auth.uid())
);
create policy "Users can delete own term alignments" on public.term_alignments for delete using (
  exists (select 1 from public.comparison_documents where comparison_documents.id = term_alignments.comparison_id and comparison_documents.user_id = auth.uid())
);
