"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {languages} from "@/lib/languages/config";
import {tablesForLanguage} from "@/lib/grammar-tables/registry";
import {searchGrammarTables} from "@/lib/grammar-tables/relations";
import {GRAMMAR_CATEGORIES,type GrammarTableDefinition,type GrammarTableLanguage} from "@/lib/grammar-tables/types";
import {useTableFavorites} from "./use-table-favorites";

function TableCard({table,isFavorite,onToggle,ready}:{table:GrammarTableDefinition;isFavorite:boolean;onToggle:(id:string)=>void;ready:boolean}){
  const href=`/languages/${table.language}/grammar-tables/${table.id}`;
  return <article className="language-surface flex min-w-0 flex-col rounded-xl border border-neutral-200 p-4 shadow-sm">
    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{table.category}</span>
    <Link href={href} className="mt-2 block min-w-0 rounded-md hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"><h3 className="break-words text-lg font-semibold">{table.title}</h3>{table.subtitle?<p className="mt-1 break-words text-sm text-neutral-600">{table.subtitle}</p>:null}</Link>
    <p className="mt-3 flex-1 text-sm text-neutral-600">{table.description}</p>
    <div className="mt-4 flex flex-wrap gap-1">{table.tags.slice(0,4).map(tag=><span key={tag} className="rounded-full bg-neutral-100 px-2 py-1 text-xs">{tag}</span>)}</div>
    <div className="mt-4 flex items-center justify-between gap-3"><Link href={href} className="inline-flex min-h-11 items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium !text-white hover:bg-neutral-700">Open table</Link><button type="button" disabled={!ready} aria-label={`${isFavorite?"Remove":"Add"} ${table.title} ${isFavorite?"from":"to"} favorites`} aria-pressed={isFavorite} onClick={()=>onToggle(table.id)} className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50">{isFavorite?"★ Saved":"☆ Save"}</button></div>
  </article>;
}
export function GrammarTablesIndex({language}:{language:GrammarTableLanguage}){
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const {favorites,toggle,ready,error}=useTableFavorites(language);
  const tables=useMemo(()=>tablesForLanguage(language),[language]);
  const categories=GRAMMAR_CATEGORIES[language].filter(item=>tables.some(table=>table.category===item));
  const results=searchGrammarTables(tables,language,query,category==="Favorites"?"All":category).filter(table=>category!=="Favorites"||favorites.has(table.id));
  const pinned=category==="All"&&!query.trim()?tables.filter(table=>favorites.has(table.id)):[];
  return <main className="min-w-0 space-y-6">
    <header className="space-y-2"><p className="text-sm font-medium text-neutral-500">{languages[language].name} / Grammar</p><h1 className="text-3xl font-semibold">Grammar Tables</h1><p className="max-w-2xl text-neutral-600">Quick reference tables for forms, patterns, and case use. Open a table for notes and related entries.</p></header>
    <label className="block max-w-xl text-sm font-medium">Search table titles, categories, and tags<input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search grammar tables" className="mt-2 min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base"/></label>
    <div aria-label="Table categories" className="flex flex-wrap gap-2">{["All","Favorites",...categories].map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)} className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${category===item?"border-neutral-900 bg-neutral-900 text-white":"border-neutral-300 bg-white hover:bg-neutral-100"}`}>{item}</button>)}</div>
    {error?<p role="status" className="text-sm text-amber-800">{error}</p>:null}
    {pinned.length?<section aria-labelledby="favorite-tables-title" className="space-y-3"><h2 id="favorite-tables-title" className="text-xl font-semibold">Favorites</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{pinned.map(table=><TableCard key={table.id} table={table} isFavorite onToggle={toggle} ready={ready}/>)}</div></section>:null}
    <section aria-labelledby="all-tables-title" className="space-y-3"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 id="all-tables-title" className="text-xl font-semibold">{category==="All"?"All tables":category}</h2><p role="status" className="text-sm text-neutral-500">{results.length} tables</p></div>{results.length?<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{results.map(table=><TableCard key={table.id} table={table} isFavorite={favorites.has(table.id)} onToggle={toggle} ready={ready}/>)}</div>:<p className="rounded-xl border border-neutral-200 p-5 text-sm text-neutral-600">{category==="Favorites"?"No favorite tables yet.":"No tables match this search."}</p>}</section>
  </main>;
}
