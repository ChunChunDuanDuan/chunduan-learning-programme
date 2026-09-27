"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {languages,type LanguageCode} from "@/lib/languages/config";
import {searchEntries,type EntryKind,type LanguageEntry} from "@/lib/languages/model";
import {loadLanguage} from "@/lib/languages/repository";
import {inputClass} from "./entry-form";

const filters:{label:string;kind:EntryKind|null;route:string}[]=[
  {label:"All",kind:null,route:""},
  {label:"Vocabulary",kind:"vocabulary",route:"vocabulary"},
  {label:"Sentences",kind:"sentence",route:"sentences"},
  {label:"Texts",kind:"text",route:"texts"},
  {label:"Grammar",kind:"grammar",route:"grammar"},
  {label:"Concepts",kind:"concept",route:"concepts"},
];
const routeForKind=(kind:EntryKind)=>filters.find(filter=>filter.kind===kind)?.route??"";

export function LanguageSearch({language}:{language:LanguageCode}){
  const [entries,setEntries]=useState<LanguageEntry[]>([]),[query,setQuery]=useState(""),[kind,setKind]=useState<EntryKind|null>(null);
  const [warnings,setWarnings]=useState<string[]>([]),[error,setError]=useState(""),[loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    void loadLanguage(language).then(data=>{if(active){setEntries(data.entries);setWarnings(data.warnings);setLoading(false);}}).catch(cause=>{if(active){setError(String(cause));setLoading(false);}});
    return()=>{active=false;};
  },[language]);
  const results=query.trim()?searchEntries(entries,query,language).filter(entry=>!kind||entry.kind===kind):[];
  return <section className="min-w-0 space-y-5"><h1 className="text-3xl font-semibold">Search {languages[language].name}</h1>
    <label className="block text-sm font-medium">Search this language<input className={inputClass} type="search" value={query} onChange={event=>setQuery(event.target.value)} autoFocus/></label>
    <fieldset><legend className="text-sm font-medium">Entry type</legend><div className="mt-2 flex flex-wrap gap-2">{filters.map(filter=><label key={filter.label} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm"><input type="radio" name="search-kind" checked={kind===filter.kind} onChange={()=>setKind(filter.kind)}/>{filter.label}</label>)}</div></fieldset>
    {loading?<p role="status">Loading…</p>:null}{error?<p role="alert" className="text-red-700">{error}</p>:null}
    {warnings.map(warning=><p role="status" key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">{warning}</p>)}
    {query.trim()&&!loading?<p className="text-sm text-neutral-500">{results.length} results</p>:null}
    <div className="grid gap-3 sm:grid-cols-2">{results.map(entry=><Link key={`${entry.table}:${entry.id}:${entry.language}`} href={`/languages/${language}/${routeForKind(entry.kind)}/${entry.id}`} className="language-surface min-w-0 rounded-xl border border-neutral-200 p-4 hover:border-neutral-500"><span className="text-xs text-neutral-500">{filters.find(filter=>filter.kind===entry.kind)?.label}</span><h2 className="mt-1 break-words text-lg font-semibold">{entry.title}</h2><p className="mt-2 line-clamp-2 break-words text-sm text-neutral-600">{entry.meanings.join("; ")||entry.content||entry.explanation||entry.translation}</p></Link>)}</div>
    {!query.trim()&&!loading?<p className="text-sm text-neutral-500">Search vocabulary, sentences, texts and grammar in {languages[language].name}.</p>:null}
  </section>;
}
