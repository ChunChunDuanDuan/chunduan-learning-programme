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

create table if not exists public.food_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_period text not null check (
    meal_period in (
      'BREAKFAST',
      'BREAKFAST_TO_LUNCH',
      'LUNCH',
      'LUNCH_TO_DINNER',
      'DINNER',
      'AFTER_DINNER'
    )
  ),
  food_name text not null check (char_length(trim(food_name)) > 0),
  amount text,
  note text,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5, 2) not null check (weight_kg between 20 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists food_entries_user_date_period_idx
  on public.food_entries (user_id, date, meal_period, sort_order, created_at);

create index if not exists weight_entries_user_date_idx
  on public.weight_entries (user_id, date);

drop trigger if exists set_food_entries_updated_at on public.food_entries;
create trigger set_food_entries_updated_at
before update on public.food_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_weight_entries_updated_at on public.weight_entries;
create trigger set_weight_entries_updated_at
before update on public.weight_entries
for each row execute function public.set_updated_at();

alter table public.food_entries enable row level security;
alter table public.weight_entries enable row level security;

grant select, insert, update, delete on public.food_entries to authenticated;
grant select, insert, update, delete on public.weight_entries to authenticated;

create policy "Users can read own food entries"
on public.food_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own food entries"
on public.food_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own food entries"
on public.food_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own food entries"
on public.food_entries for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own weight entries"
on public.weight_entries for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own weight entries"
on public.weight_entries for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own weight entries"
on public.weight_entries for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own weight entries"
on public.weight_entries for delete
to authenticated
using ((select auth.uid()) = user_id);
