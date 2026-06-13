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

create table if not exists public.philosophy_concepts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  philosophers text,
  current_understanding text,
  source_texts text,
  key_quotes text,
  unresolved_questions text,
  related_concepts text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.philosophy_text_maps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text,
  section text,
  core_problem text,
  argument_steps text,
  relation_to_previous text,
  relation_to_next text,
  difficulties text,
  related_concepts text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.philosophy_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  source_context text,
  current_answer text,
  unresolved_part text,
  related_concepts text,
  related_texts text,
  status text not null default 'Unresolved' check (status in ('Unresolved', 'Initial understanding', 'Organized')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.philosophy_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  type text,
  source_materials text,
  content text,
  status text not null default 'Drafting' check (status in ('Drafting', 'Completed', 'Ready to publish')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists philosophy_concepts_user_updated_idx
  on public.philosophy_concepts (user_id, updated_at desc);

create index if not exists philosophy_text_maps_user_updated_idx
  on public.philosophy_text_maps (user_id, updated_at desc);

create index if not exists philosophy_questions_user_updated_idx
  on public.philosophy_questions (user_id, updated_at desc);

create index if not exists philosophy_outputs_user_updated_idx
  on public.philosophy_outputs (user_id, updated_at desc);

drop trigger if exists set_philosophy_concepts_updated_at on public.philosophy_concepts;
create trigger set_philosophy_concepts_updated_at
before update on public.philosophy_concepts
for each row execute function public.set_updated_at();

drop trigger if exists set_philosophy_text_maps_updated_at on public.philosophy_text_maps;
create trigger set_philosophy_text_maps_updated_at
before update on public.philosophy_text_maps
for each row execute function public.set_updated_at();

drop trigger if exists set_philosophy_questions_updated_at on public.philosophy_questions;
create trigger set_philosophy_questions_updated_at
before update on public.philosophy_questions
for each row execute function public.set_updated_at();

drop trigger if exists set_philosophy_outputs_updated_at on public.philosophy_outputs;
create trigger set_philosophy_outputs_updated_at
before update on public.philosophy_outputs
for each row execute function public.set_updated_at();

alter table public.philosophy_concepts enable row level security;
alter table public.philosophy_text_maps enable row level security;
alter table public.philosophy_questions enable row level security;
alter table public.philosophy_outputs enable row level security;

create policy "Users can read own philosophy concepts"
on public.philosophy_concepts for select
using (auth.uid() = user_id);

create policy "Users can insert own philosophy concepts"
on public.philosophy_concepts for insert
with check (auth.uid() = user_id);

create policy "Users can update own philosophy concepts"
on public.philosophy_concepts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own philosophy concepts"
on public.philosophy_concepts for delete
using (auth.uid() = user_id);

create policy "Users can read own philosophy text maps"
on public.philosophy_text_maps for select
using (auth.uid() = user_id);

create policy "Users can insert own philosophy text maps"
on public.philosophy_text_maps for insert
with check (auth.uid() = user_id);

create policy "Users can update own philosophy text maps"
on public.philosophy_text_maps for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own philosophy text maps"
on public.philosophy_text_maps for delete
using (auth.uid() = user_id);

create policy "Users can read own philosophy questions"
on public.philosophy_questions for select
using (auth.uid() = user_id);

create policy "Users can insert own philosophy questions"
on public.philosophy_questions for insert
with check (auth.uid() = user_id);

create policy "Users can update own philosophy questions"
on public.philosophy_questions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own philosophy questions"
on public.philosophy_questions for delete
using (auth.uid() = user_id);

create policy "Users can read own philosophy outputs"
on public.philosophy_outputs for select
using (auth.uid() = user_id);

create policy "Users can insert own philosophy outputs"
on public.philosophy_outputs for insert
with check (auth.uid() = user_id);

create policy "Users can update own philosophy outputs"
on public.philosophy_outputs for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own philosophy outputs"
on public.philosophy_outputs for delete
using (auth.uid() = user_id);
