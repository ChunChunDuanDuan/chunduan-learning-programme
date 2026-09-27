import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {PGlite} from "@electric-sql/pglite";
const uid="00000000-0000-4000-8000-000000000001",other="00000000-0000-4000-8000-000000000002";
const de="10000000-0000-4000-8000-000000000001",grc="10000000-0000-4000-8000-000000000002",foreign="10000000-0000-4000-8000-000000000003";
const textId="20000000-0000-4000-8000-000000000001",sentence="30000000-0000-4000-8000-000000000001";
test("Phase 1 migration preserves legacy data and enforces relations/RLS in PostgreSQL",async(t)=>{
  const db=new PGlite();
  try{
    await db.exec(`
      create role anon;create role authenticated;create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;
      create table public.languages(id uuid primary key,code text);
      create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
      create table public.vocabulary(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),language text not null,word text not null,meaning_zh text,part_of_speech text,notes text,created_at timestamptz default now());
      create table public.japanese_vocabulary(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),writing text not null,reading_kana text not null,meaning_zh text not null,part_of_speech text,tags text[],notes text,created_at timestamptz default now());
      create table public.sentences(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),language_id uuid references public.languages(id),language text,target_sentence text not null,mode text,english text,german text,russian text,translation_zh text,notes text,tags text[],created_at timestamptz default now());
      create table public.japanese_sentences(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),japanese_text text not null,translation_zh text not null,notes text,tags text[],created_at timestamptz default now());
      create table public.articles(id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),language_id uuid references public.languages(id),language text,title text not null,content text,translation text,notes text,created_at timestamptz default now());
      insert into auth.users values('${uid}'),('${other}');
      insert into public.languages values('40000000-0000-4000-8000-000000000001','de');
      insert into public.vocabulary(id,user_id,language,word,meaning_zh) values('${de}','${uid}','Deutsch','Wissen','知識'),('${grc}','${uid}','grc','ἄνθρωπος','人'),('${foreign}','${other}','Deutsch','Private','secret');
      insert into public.articles(id,user_id,language_id,title,content) values('${textId}','${uid}','40000000-0000-4000-8000-000000000001','Original article','Original content');
      insert into public.sentences(id,user_id,language,target_sentence,mode,english,german) values('${sentence}','${uid}','English','','all','knowledge','Wissen');
      do $$declare t text;begin foreach t in array array['vocabulary','japanese_vocabulary','sentences','japanese_sentences','articles'] loop
        execute format('alter table public.%I enable row level security',t);
        execute format('grant select,insert,update,delete on public.%I to authenticated',t);
        execute format('create policy own_rows on public.%I for all to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id)',t);
      end loop;end$$;
    `);
    await db.exec(readFileSync(new URL("../supabase/migrations/20260927032145_learning_programme_phase1.sql",import.meta.url),"utf8"));
    await db.exec(`set role authenticated;set request.jwt.claim.sub='${uid}'`);
    await t.test("existing article and polytonic vocabulary survive",async()=>{
      const a=await db.query<{title:string;content:string;language:string;text_type:string}>(`select title,content,language,text_type from articles where id='${textId}'`);
      assert.deepEqual(a.rows,[{title:"Original article",content:"Original content",language:"de",text_type:"Article"}]);
      const v=await db.query<{word:string}>(`select word from vocabulary where id='${grc}'`);assert.equal(v.rows[0].word,"ἄνθρωπος");
    });
    const document={title:"Two languages",kind:"vocabulary",languages:["de","grc"],notes:""};
    const refs=[{id:de,table:"vocabulary",language:"de"},{id:grc,table:"vocabulary",language:"grc"}];
    let cid="";
    await t.test("atomic comparison can link exactly two languages",async()=>{
      const result=await db.query<{id:string}>("select public.save_language_comparison($1::jsonb,$2::jsonb) as id",[JSON.stringify(document),JSON.stringify(refs)]);cid=result.rows[0].id;
      const count=await db.query<{n:number}>("select count(*)::int n from language_comparison_links");assert.equal(count.rows[0].n,2);
      await db.exec(`update vocabulary set word='Wissen updated' where id='${de}'`);
      const joined=await db.query<{word:string}>(`select v.word from language_comparison_links l join vocabulary v on v.id=l.vocabulary_id where l.language_code='de'`);assert.equal(joined.rows[0].word,"Wissen updated");
    });
    await t.test("comparison can add then remove Latin without copying or deleting vocabulary",async()=>{
      const latin="10000000-0000-4000-8000-000000000004";
      await db.exec(`insert into vocabulary(id,user_id,language,word,meaning_zh) values('${latin}','${uid}','la','scientia','知識')`);
      const three={...document,id:cid,languages:["de","grc","la"]};
      await db.query("select public.save_language_comparison($1::jsonb,$2::jsonb)",[JSON.stringify(three),JSON.stringify([...refs,{id:latin,table:"vocabulary",language:"la"}])]);
      const added=await db.query<{n:number}>(`select count(*)::int n from language_comparison_links where comparison_id='${cid}'`);
      assert.equal(added.rows[0].n,3);
      await db.query("select public.save_language_comparison($1::jsonb,$2::jsonb)",[JSON.stringify({...document,id:cid}),JSON.stringify(refs)]);
      const removed=await db.query<{n:number}>(`select count(*)::int n from language_comparison_links where comparison_id='${cid}'`);
      const retained=await db.query<{word:string}>(`select word from vocabulary where id='${latin}'`);
      assert.equal(removed.rows[0].n,2);
      assert.equal(retained.rows[0].word,"scientia");
    });
    await t.test("one-language/incomplete/foreign-owner/wrong-language comparisons are rejected atomically",async()=>{
      for(const [doc,links] of [[{...document,languages:["de"]},[refs[0]]],[document,[refs[0]]],[document,[{...refs[0],id:foreign},refs[1]]],[document,[{...refs[0],id:grc},refs[1]]],[{...document,kind:"text"},refs]]){
        await assert.rejects(db.query("select public.save_language_comparison($1::jsonb,$2::jsonb)",[JSON.stringify(doc),JSON.stringify(links)]));
      }
      const result=await db.query<{n:number}>("select count(*)::int n from language_comparisons");assert.equal(result.rows[0].n,1);
    });
    await t.test("direct edits cannot invalidate comparison type or selected languages",async()=>{
      await assert.rejects(db.exec(`update language_comparisons set kind='text' where id='${cid}'`));
      await assert.rejects(db.exec(`update language_comparisons set languages=array['de','grc','la'] where id='${cid}'`));
      await assert.rejects(db.exec(`delete from language_comparison_links where comparison_id='${cid}' and language_code='de'`));
    });
    await t.test("sources and occurrences check language and protect linked texts",async()=>{
      await db.exec(`insert into sentence_text_sources(user_id,language_code,sentence_id,text_id) values('${uid}','de','${sentence}','${textId}');insert into vocabulary_text_occurrences(user_id,language_code,vocabulary_id,text_id) values('${uid}','de','${de}','${textId}')`);
      await assert.rejects(db.exec(`insert into vocabulary_text_occurrences(user_id,language_code,vocabulary_id,text_id) values('${uid}','grc','${grc}','${textId}')`));
      await assert.rejects(db.exec(`delete from articles where id='${textId}'`));
      await assert.rejects(db.exec(`delete from vocabulary where id='${de}'`));
    });
    await t.test("six language notes support scoped CRUD and sentence source can be replaced",async()=>{
      for(const language of ["en","de","ru","ja","grc","la"]){
        await db.query("insert into language_notes(user_id,language_code,kind,title) values($1,$2,'grammar',$3)",[uid,language,`${language} grammar`]);
      }
      const before=await db.query<{language_code:string}>("select language_code from language_notes order by language_code");
      assert.deepEqual(before.rows.map(row=>row.language_code),["de","en","grc","ja","la","ru"]);
      await db.exec("update language_notes set title='Updated Greek grammar' where language_code='grc'");
      const greek=await db.query<{title:string}>("select title from language_notes where language_code='grc'");
      assert.equal(greek.rows[0].title,"Updated Greek grammar");
      await db.exec("delete from language_notes where language_code='ru'");
      const after=await db.query<{n:number}>("select count(*)::int n from language_notes where language_code='ru'");
      assert.equal(after.rows[0].n,0);
      const replacement="20000000-0000-4000-8000-000000000002";
      await db.exec(`insert into articles(id,user_id,language,title,content,metadata) values('${replacement}','${uid}','Deutsch','Another text','Body','{"author":"A","source":"Book"}')`);
      await db.exec(`insert into sentence_text_sources(user_id,language_code,sentence_id,text_id) values('${uid}','de','${sentence}','${replacement}') on conflict(sentence_id,japanese_sentence_id,language_code) do update set text_id=excluded.text_id`);
      const source=await db.query<{text_id:string}>(`select text_id from sentence_text_sources where sentence_id='${sentence}'`);
      assert.deepEqual(source.rows,[{text_id:replacement}]);
    });
    await t.test("RLS excludes another user's comparisons and source records",async()=>{
      await db.exec(`set request.jwt.claim.sub='${other}'`);
      for(const table of ["language_comparisons","language_comparison_links","sentence_text_sources","vocabulary_text_occurrences"]){const result=await db.query<{n:number}>(`select count(*)::int n from ${table}`);assert.equal(result.rows[0].n,0);}
      await assert.rejects(db.exec(`insert into language_notes(user_id,language_code,kind,title) values('${uid}','de','concept','Forbidden')`));
      await db.exec(`set request.jwt.claim.sub='${uid}'`);
    });
    await t.test("comparison removal preserves its underlying entries",async()=>{
      await db.exec(`delete from language_comparisons where id='${cid}'`);
      const result=await db.query<{n:number}>(`select count(*)::int n from vocabulary where id in ('${de}','${grc}')`);assert.equal(result.rows[0].n,2);
    });
  }finally{await db.close();}
});
