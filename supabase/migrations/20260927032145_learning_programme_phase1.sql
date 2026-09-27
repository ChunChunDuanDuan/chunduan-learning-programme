-- Additive Phase 1 migration. Original tables, row IDs and payloads are retained.
-- Prerequisite: all earlier repository migrations (including Japanese sentences).
begin;
alter table public.vocabulary add column if not exists meanings text[] not null default '{}';
alter table public.vocabulary add column if not exists tags text[] not null default '{}';
alter table public.japanese_vocabulary add column if not exists meanings text[] not null default '{}';
do $$
declare t text;
begin
  foreach t in array array['vocabulary','japanese_vocabulary','sentences','japanese_sentences','articles'] loop
    execute format('alter table public.%I add column if not exists metadata jsonb not null default ''{}''', t);
    execute format('alter table public.%I add column if not exists language_metadata jsonb not null default ''{}''', t);
  end loop;
end $$;
alter table public.sentences add column if not exists japanese text;
alter table public.articles add column if not exists tags text[] not null default '{}';
alter table public.articles add column if not exists text_type text not null default 'Article';
alter table public.articles add column if not exists custom_type text not null default '';
-- Recover the old FK-only language information without overwriting explicit language values.
update public.articles a set language = l.code from public.languages l where a.language is null and a.language_id = l.id;
update public.sentences s set language = l.code from public.languages l where s.language is null and s.language_id = l.id;

create or replace function public.lp_language_code(value text)
returns text language sql immutable set search_path = '' as $$
  select case lower(trim(value))
    when 'en' then 'en' when 'english' then 'en'
    when 'de' then 'de' when 'german' then 'de' when 'deutsch' then 'de'
    when 'ru' then 'ru' when 'russian' then 'ru' when 'русский' then 'ru'
    when 'ja' then 'ja' when 'japanese' then 'ja' when '日本語' then 'ja'
    when 'grc' then 'grc' when 'ancient greek' then 'grc'
    when 'la' then 'la' when 'latin' then 'la' else null end
$$;

create table public.language_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null check (language_code in ('en','de','ru','ja','grc','la')),
  kind text not null check (kind in ('grammar','concept')),
  title text not null check (length(trim(title)) > 0),
  content text not null default '', topic text not null default '', rule text not null default '',
  examples text not null default '', exceptions text not null default '',
  tags text[] not null default '{}', notes text not null default '',
  metadata jsonb not null default '{}', language_metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.language_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  kind text not null check (kind in ('vocabulary','sentence','concept','text')),
  languages text[] not null check (cardinality(languages) between 2 and 6 and languages <@ array['en','de','ru','ja','grc','la']::text[]),
  notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.language_comparison_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  comparison_id uuid not null references public.language_comparisons(id) on delete cascade,
  language_code text not null check (language_code in ('en','de','ru','ja','grc','la')),
  vocabulary_id uuid references public.vocabulary(id) on delete restrict,
  japanese_vocabulary_id uuid references public.japanese_vocabulary(id) on delete restrict,
  sentence_id uuid references public.sentences(id) on delete restrict,
  japanese_sentence_id uuid references public.japanese_sentences(id) on delete restrict,
  text_id uuid references public.articles(id) on delete restrict,
  concept_id uuid references public.language_notes(id) on delete restrict,
  check (num_nonnulls(vocabulary_id,japanese_vocabulary_id,sentence_id,japanese_sentence_id,text_id,concept_id)=1),
  unique (comparison_id,language_code)
);
create table public.sentence_text_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null check (language_code in ('en','de','ru','ja','grc','la')),
  sentence_id uuid references public.sentences(id) on delete cascade,
  japanese_sentence_id uuid references public.japanese_sentences(id) on delete cascade,
  text_id uuid not null references public.articles(id) on delete restrict,
  check (num_nonnulls(sentence_id,japanese_sentence_id)=1),
  unique nulls not distinct (sentence_id,japanese_sentence_id,language_code)
);
create table public.vocabulary_text_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language_code text not null check (language_code in ('en','de','ru','ja','grc','la')),
  vocabulary_id uuid references public.vocabulary(id) on delete cascade,
  japanese_vocabulary_id uuid references public.japanese_vocabulary(id) on delete cascade,
  text_id uuid not null references public.articles(id) on delete restrict,
  location text not null default '', notes text not null default '',
  check (num_nonnulls(vocabulary_id,japanese_vocabulary_id)=1),
  unique nulls not distinct (vocabulary_id,japanese_vocabulary_id,text_id,location)
);
do $$
declare t text;
begin
  foreach t in array array['language_notes','language_comparisons','language_comparison_links','sentence_text_sources','vocabulary_text_occurrences'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select,insert,update,delete on public.%I to authenticated', t);
    execute format('create policy own_rows on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)', t);
    execute format('create index on public.%I(user_id)', t);
  end loop;
end $$;
create index on public.language_notes(user_id,language_code,kind);
create index on public.language_comparison_links(comparison_id);
create index on public.sentence_text_sources(text_id);
create index on public.vocabulary_text_occurrences(text_id);
create trigger language_notes_updated before update on public.language_notes for each row execute function public.set_updated_at();
create trigger language_comparisons_updated before update on public.language_comparisons for each row execute function public.set_updated_at();

-- Shared reference checker: normal invoker rights, RLS applies to all target reads.
create or replace function public.lp_reference_valid(t text, target uuid, lang text, owner_id uuid, expected_kind text)
returns boolean language plpgsql stable set search_path = '' as $$
declare r jsonb; actual_kind text; actual_language text; col text;
begin
  if t not in ('vocabulary','japanese_vocabulary','sentences','japanese_sentences','articles','language_notes') then return false; end if;
  execute format('select to_jsonb(x) from public.%I x where id=$1 and user_id=$2',t) into r using target,owner_id;
  if r is null then return false; end if;
  actual_kind := case when t in ('vocabulary','japanese_vocabulary') then 'vocabulary' when t in ('sentences','japanese_sentences') then 'sentence' when t='articles' then 'text' else r->>'kind' end;
  if actual_kind is distinct from expected_kind then return false; end if;
  if t='sentences' and r->>'mode'='all' then
    col := case lang when 'en' then 'english' when 'de' then 'german' when 'ru' then 'russian' when 'ja' then 'japanese' else null end;
    return coalesce(length(trim(r->>col))>0,false);
  end if;
  actual_language := case when t like 'japanese_%' then 'ja' else public.lp_language_code(coalesce(r->>'language_code',r->>'language')) end;
  return actual_language is not distinct from lang;
end $$;

create or replace function public.lp_validate_relation()
returns trigger language plpgsql set search_path = '' as $$
declare r jsonb:=to_jsonb(new); t text; target uuid; kind text; parent public.language_comparisons;
begin
  if new.user_id is distinct from auth.uid() then raise exception 'Relation owner must match the signed-in user'; end if;
  if tg_table_name='language_comparison_links' then
    if tg_op='UPDATE' and (new.comparison_id is distinct from old.comparison_id or new.user_id is distinct from old.user_id) then raise exception 'Comparison link ownership is immutable'; end if;
    select * into parent from public.language_comparisons where id=new.comparison_id and user_id=new.user_id;
    if parent.id is null or not(new.language_code=any(parent.languages)) then raise exception 'Invalid comparison owner or language'; end if;
    kind:=parent.kind;
  else
    if not public.lp_reference_valid('articles',new.text_id,new.language_code,new.user_id,'text') then raise exception 'Text must belong to the same user and language'; end if;
    kind:=case when tg_table_name='sentence_text_sources' then 'sentence' else 'vocabulary' end;
  end if;
  if r->>'vocabulary_id' is not null then t:='vocabulary'; target:=(r->>'vocabulary_id')::uuid;
  elsif r->>'japanese_vocabulary_id' is not null then t:='japanese_vocabulary'; target:=(r->>'japanese_vocabulary_id')::uuid;
  elsif r->>'sentence_id' is not null then t:='sentences'; target:=(r->>'sentence_id')::uuid;
  elsif r->>'japanese_sentence_id' is not null then t:='japanese_sentences'; target:=(r->>'japanese_sentence_id')::uuid;
  elsif r->>'concept_id' is not null then t:='language_notes'; target:=(r->>'concept_id')::uuid;
  else t:='articles'; target:=(r->>'text_id')::uuid;
  end if;
  if not public.lp_reference_valid(t,target,new.language_code,new.user_id,kind) then raise exception 'Entry must match the owner, language and type'; end if;
  return new;
end $$;
create trigger validate_comparison_link before insert or update on public.language_comparison_links for each row execute function public.lp_validate_relation();
create trigger validate_sentence_source before insert or update on public.sentence_text_sources for each row execute function public.lp_validate_relation();
create trigger validate_vocabulary_occurrence before insert or update on public.vocabulary_text_occurrences for each row execute function public.lp_validate_relation();

-- Deferred check makes direct API writes obey the same 2–6 language invariant as the UI.
create or replace function public.lp_complete_comparison()
returns trigger language plpgsql set search_path = '' as $$
declare cid uuid; c public.language_comparisons; n integer; link public.language_comparison_links; target_table text; target_id uuid;
begin
  cid:=(case when tg_table_name='language_comparisons' then coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id') else coalesce(to_jsonb(new)->>'comparison_id',to_jsonb(old)->>'comparison_id') end)::uuid;
  select * into c from public.language_comparisons where id=cid;
  if c.id is null then return null; end if;
  select count(*) into n from public.language_comparison_links where comparison_id=cid and user_id=c.user_id and language_code=any(c.languages);
  if n<>cardinality(c.languages) or n<2 then raise exception 'A comparison needs one linked entry per selected language, at least two'; end if;
  for link in select * from public.language_comparison_links where comparison_id=cid loop
    if link.user_id is distinct from c.user_id or not(link.language_code=any(c.languages)) then raise exception 'Linked languages must match the comparison selection'; end if;
    if link.vocabulary_id is not null then target_table:='vocabulary';target_id:=link.vocabulary_id;
    elsif link.japanese_vocabulary_id is not null then target_table:='japanese_vocabulary';target_id:=link.japanese_vocabulary_id;
    elsif link.sentence_id is not null then target_table:='sentences';target_id:=link.sentence_id;
    elsif link.japanese_sentence_id is not null then target_table:='japanese_sentences';target_id:=link.japanese_sentence_id;
    elsif link.text_id is not null then target_table:='articles';target_id:=link.text_id;
    else target_table:='language_notes';target_id:=link.concept_id;end if;
    if not public.lp_reference_valid(target_table,target_id,link.language_code,c.user_id,c.kind) then raise exception 'Comparison type does not match linked entries';end if;
  end loop;
  return null;
end $$;
create constraint trigger complete_comparison after insert or update on public.language_comparisons deferrable initially deferred for each row execute function public.lp_complete_comparison();
create constraint trigger complete_comparison_links after insert or update or delete on public.language_comparison_links deferrable initially deferred for each row execute function public.lp_complete_comparison();

create or replace function public.save_language_comparison(document jsonb, entry_links jsonb)
returns uuid language plpgsql set search_path = '' as $$
declare cid uuid:=coalesce(nullif(document->>'id','')::uuid,gen_random_uuid()); uid uuid:=auth.uid(); item jsonb; langs text[];
begin
  if uid is null then raise exception 'Sign in required'; end if;
  select array_agg(value) into langs from jsonb_array_elements_text(document->'languages');
  if cardinality(langs)<2 or cardinality(langs)>6 or cardinality(langs)<>(select count(distinct v) from unnest(langs) v) then raise exception 'Select 2–6 distinct languages'; end if;
  insert into public.language_comparisons(id,user_id,title,kind,languages,notes)
    values(cid,uid,document->>'title',document->>'kind',langs,coalesce(document->>'notes',''))
    on conflict(id) do update set title=excluded.title,kind=excluded.kind,languages=excluded.languages,notes=excluded.notes;
  delete from public.language_comparison_links where comparison_id=cid;
  for item in select value from jsonb_array_elements(entry_links) loop
    insert into public.language_comparison_links(user_id,comparison_id,language_code,vocabulary_id,japanese_vocabulary_id,sentence_id,japanese_sentence_id,text_id,concept_id)
      values(uid,cid,item->>'language',
        case when item->>'table'='vocabulary' then (item->>'id')::uuid end,
        case when item->>'table'='japanese_vocabulary' then (item->>'id')::uuid end,
        case when item->>'table'='sentences' then (item->>'id')::uuid end,
        case when item->>'table'='japanese_sentences' then (item->>'id')::uuid end,
        case when item->>'table'='articles' then (item->>'id')::uuid end,
        case when item->>'table'='language_notes' then (item->>'id')::uuid end);
  end loop;
  return cid;
end $$;
revoke all on function public.save_language_comparison(jsonb,jsonb) from public,anon;
grant execute on function public.save_language_comparison(jsonb,jsonb) to authenticated;
revoke all on function public.lp_reference_valid(text,uuid,text,uuid,text) from public,anon;
grant execute on function public.lp_reference_valid(text,uuid,text,uuid,text) to authenticated;
commit;
