"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {languages} from "@/lib/languages/config";
import {loadLanguage} from "@/lib/languages/repository";
import {vocabularyHeadword,type LanguageEntry} from "@/lib/languages/model";
import {relatedGrammarNotes,relatedVocabulary} from "@/lib/grammar-tables/relations";
import type {GrammarTableDefinition} from "@/lib/grammar-tables/types";
import {TableRenderer} from "./table-renderer";
import {useTableFavorites} from "./use-table-favorites";

export function GrammarTableDetail({table}:{table:GrammarTableDefinition}){
  const [entries,setEntries]=useState<LanguageEntry[]>([]);
  const [warnings,setWarnings]=useState<string[]>([]);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);
  const {favorites,toggle,ready,error:favoriteError}=useTableFavorites(table.language);
  useEffect(()=>{
    let active=true;
    void loadLanguage(table.language).then(data=>{if(active){setEntries(data.entries);setWarnings(data.warnings);setLoading(false);}}).catch(cause=>{if(active){setError(cause instanceof Error?cause.message:String(cause));setLoading(false);}});
    return()=>{active=false;};
  },[table.language]);
  const grammar=relatedGrammarNotes(table,entries);
  const vocabulary=relatedVocabulary(table,entries);
  const base=`/languages/${table.language}`;
  return <main className="min-w-0 space-y-8">
    <header className="space-y-3"><Link href={`${base}/grammar-tables`} className="inline-flex min-h-11 items-center text-sm underline">← All Grammar Tables</Link><p className="text-sm font-medium text-neutral-500">{languages[table.language].name} / {table.category}</p><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-3xl font-semibold">{table.title}</h1>{table.subtitle?<p className="mt-1 text-lg text-neutral-600">{table.subtitle}</p>:null}</div><button type="button" disabled={!ready} aria-pressed={favorites.has(table.id)} onClick={()=>toggle(table.id)} className="min-h-11 rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50">{favorites.has(table.id)?"★ Saved to favorites":"☆ Save to favorites"}</button></div><p className="max-w-3xl text-neutral-700">{table.description}</p>{favoriteError?<p role="status" className="text-sm text-amber-800">{favoriteError}</p>:null}</header>
    {table.sections.length>1?<nav aria-label="Sections" className="flex flex-wrap gap-2">{table.sections.map(section=><a key={section.id} href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200">{section.title}</a>)}</nav>:null}
    <div className="min-w-0 space-y-10">{table.sections.map(section=><TableRenderer key={section.id} section={section}/>)}</div>
    {table.notes?.length?<section className="space-y-2 rounded-xl bg-neutral-50 p-5"><h2 className="text-xl font-semibold">Usage notes</h2><ul className="list-disc space-y-2 pl-5 text-sm text-neutral-700">{table.notes.map(note=><li key={note}>{note}</li>)}</ul></section>:null}
    {table.source?<p className="text-sm text-neutral-600">Reference: <a href={table.source.url} target="_blank" rel="noopener noreferrer" className="underline">{table.source.label}</a></p>:null}
    <section className="space-y-4 border-t border-neutral-200 pt-6" aria-labelledby="related-title"><h2 id="related-title" className="text-xl font-semibold">Related entries</h2><p className="text-sm text-neutral-600">Matched within {languages[table.language].name} using grammar topics and vocabulary metadata.</p>{loading?<p role="status" className="text-sm">Loading related entries…</p>:null}{error?<p role="alert" className="text-sm text-red-700">{error}</p>:null}{warnings.map(warning=><p role="status" key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">{warning}</p>)}
      {!loading&&!error?<div className="grid min-w-0 gap-6 lg:grid-cols-2"><div className="space-y-2"><h3 className="font-semibold">Grammar notes</h3>{grammar.length?<ul className="space-y-2">{grammar.map(entry=><li key={entry.id}><Link className="inline-flex min-h-11 items-center underline" href={`${base}/grammar/${entry.id}`}>{entry.title}</Link></li>)}</ul>:<p className="text-sm text-neutral-500">No matching grammar notes yet.</p>}</div><div className="space-y-2"><h3 className="font-semibold">Vocabulary examples</h3>{vocabulary.length?<ul className="space-y-2">{vocabulary.map(({entry})=><li key={`${entry.table}:${entry.id}`} className="rounded-lg border border-neutral-200 p-3"><Link className="inline-flex min-h-11 items-center break-words font-medium underline" href={`${base}/vocabulary/${entry.id}`}>{vocabularyHeadword(entry)}</Link>{entry.meanings.length?<p className="text-sm text-neutral-600">{entry.meanings.join("; ")}</p>:null}</li>)}</ul>:<p className="text-sm text-neutral-500">No matching vocabulary yet. Add structured class or conjugation metadata to connect entries.</p>}</div></div>:null}
    </section>
  </main>;
}
