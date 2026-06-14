create table if not exists public.night_sparks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('socratic', 'spark_sentence', 'one_sentence')),
  prompt_text text,
  user_response text not null,
  reaction text check (reaction in ('agree', 'disagree', 'association')),
  marked_for_development boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists night_sparks_user_created_idx
  on public.night_sparks (user_id, created_at desc);

drop trigger if exists set_night_sparks_updated_at on public.night_sparks;
create trigger set_night_sparks_updated_at
before update on public.night_sparks
for each row execute function public.set_updated_at();

alter table public.night_sparks enable row level security;

create policy "Users can read own night sparks"
on public.night_sparks for select
using (auth.uid() = user_id);

create policy "Users can insert own night sparks"
on public.night_sparks for insert
with check (auth.uid() = user_id);

create policy "Users can update own night sparks"
on public.night_sparks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own night sparks"
on public.night_sparks for delete
using (auth.uid() = user_id);
