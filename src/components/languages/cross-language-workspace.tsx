"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {LANGUAGE_CODES,languages,type LanguageCode} from "@/lib/languages/config";
import {emptyEntry,entryKey,resolveComparison,searchEntries,validateComparison,type Comparison,type ComparisonKind,type LanguageEntry,type LegacyRow} from "@/lib/languages/model";
import {matchesSearch} from "@/lib/languages/search";
import {deleteComparison,loadComparisons,loadLanguage,loadLegacyComparisons,loadLegacyMixedSentences,saveComparison} from "@/lib/languages/repository";
import {EntryForm,Field,buttonClass,inputClass} from "./entry-form";
const kinds:ComparisonKind[]=["vocabulary","sentence","concept","text"];
export function CrossLanguageWorkspace(){
  const [entries,setEntries]=useState<LanguageEntry[]>([]),[comparisons,setComparisons]=useState<Comparison[]>([]),[legacy,setLegacy]=useState<LegacyRow[]>([]);
  const [selected,setSelected]=useState<LanguageCode[]>([]),[kind,setKind]=useState<ComparisonKind>("vocabulary"),[links,setLinks]=useState<Record<string,string>>({});
  const [title,setTitle]=useState(""),[notes,setNotes]=useState(""),[editingId,setEditingId]=useState<string|undefined>(),[query,setQuery]=useState("");
  const [filterKind,setFilterKind]=useState<ComparisonKind|"all">("all"),[filterLanguage,setFilterLanguage]=useState<LanguageCode|"all">("all");
  const [pickerQueries,setPickerQueries]=useState<Record<string,string>>({}),[creating,setCreating]=useState<LanguageEntry|null>(null);
  const [error,setError]=useState(""),[warnings,setWarnings]=useState<string[]>([]),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
  const reload=useCallback(async()=>{
    const results=await Promise.all(LANGUAGE_CODES.map(code=>loadLanguage(code)));
    setEntries(results.flatMap(result=>result.entries));setWarnings([...new Set(results.flatMap(result=>result.warnings))]);setReady(results.every(result=>result.ready));
    const [comparisonResult,archiveResult,mixedResult]=await Promise.allSettled([loadComparisons(),loadLegacyComparisons(),loadLegacyMixedSentences()]);
    if(comparisonResult.status==="fulfilled")setComparisons(comparisonResult.value);else {setReady(false);setWarnings(current=>[...new Set([...current,comparisonResult.reason instanceof Error?comparisonResult.reason.message:String(comparisonResult.reason)])]);}
    setLegacy([...(archiveResult.status==="fulfilled"?archiveResult.value:[]),...(mixedResult.status==="fulfilled"?mixedResult.value:[])]);
    if(archiveResult.status==="rejected"||mixedResult.status==="rejected")setWarnings(current=>[...current,"Some legacy comparisons could not be loaded. Retry before assuming the archive is empty."]);
  },[]);
  useEffect(()=>{let active=true;const timer=setTimeout(()=>{if(active)void reload().catch(cause=>setError(String(cause))).finally(()=>setLoading(false));},0);return()=>{active=false;clearTimeout(timer);};},[reload]);
  function reset(){setTitle("");setNotes("");setLinks({});setSelected([]);setEditingId(undefined);setCreating(null);setError("");}
  async function save(){
    setError("");const refs=selected.map(code=>entries.find(entry=>entryKey(entry)===links[code])).filter((entry):entry is LanguageEntry=>!!entry).map(({id,table,language,kind})=>({id,table,language,kind}));
    const invalid=validateComparison(kind,selected,refs);if(invalid||!title.trim()){setError(invalid??"Enter a title.");return;}
    setBusy(true);try{await saveComparison({id:editingId,title:title.trim(),notes,kind,languages:selected,links:refs});reset();await reload();}catch(cause){setError(String(cause));}finally{setBusy(false);}
  }
  function edit(comparison:Comparison){setEditingId(comparison.id);setTitle(comparison.title);setNotes(comparison.notes);setKind(comparison.kind);setSelected(comparison.languages);setLinks(Object.fromEntries(comparison.links.map(link=>[link.language,entryKey(link)])));window.scrollTo({top:0,behavior:"smooth"});}
  async function remove(comparison:Comparison){if(!window.confirm(`Delete comparison “${comparison.title}”? Linked entries will remain.`))return;setBusy(true);try{await deleteComparison(comparison.id);await reload();}catch(cause){setError(String(cause));}finally{setBusy(false);}}
  const visible=comparisons.filter(comparison=>(filterKind==="all"||comparison.kind===filterKind)&&(filterLanguage==="all"||comparison.languages.includes(filterLanguage))&&(!query||matchesSearch([comparison.title,comparison.notes],query,"grc")||resolveComparison(comparison,entries).some(entry=>searchEntries([entry],query,entry.language).length)));
  return <div className="min-w-0 space-y-8"><h1 className="text-3xl font-semibold">Cross-language</h1>
    {loading?<p role="status">Loading…</p>:null}{warnings.map((warning,index)=><p role="status" key={index} className="rounded-lg border border-amber-200 p-4 text-sm">{warning}</p>)}
    <section className="space-y-5 rounded-xl border border-neutral-200 p-4 sm:p-6"><h2 className="text-xl font-semibold">{editingId?"Edit comparison":"Create comparison"}</h2>
      <fieldset><legend className="mb-3 text-sm font-medium">1. Select at least two languages</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{LANGUAGE_CODES.map(code=><label key={code} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-neutral-300 p-4"><input type="checkbox" checked={selected.includes(code)} onChange={e=>{setSelected(current=>e.target.checked?[...current,code]:current.filter(v=>v!==code));setCreating(null);}}/>{languages[code].name}</label>)}</div></fieldset>
      {selected.length>=2?<><label className="block text-sm font-medium">2. Comparison type<select className={inputClass} value={kind} onChange={e=>{setKind(e.target.value as ComparisonKind);setLinks({});setCreating(null);}}>{kinds.map(value=><option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></label>
      <Field label="Comparison title" value={title} onChange={setTitle} required/>
      <div className="grid gap-4 lg:grid-cols-2">{selected.map(code=><section key={code} className="min-w-0 space-y-3 rounded-lg border border-neutral-200 p-4"><h3 className="font-semibold">{languages[code].name}</h3>
        <Field label={`Find ${languages[code].name} entries`} value={pickerQueries[code]??""} onChange={value=>setPickerQueries(current=>({...current,[code]:value}))}/>
        <label className="block text-sm">Link existing entry<select className={inputClass} value={links[code]??""} onChange={e=>setLinks(current=>({...current,[code]:e.target.value}))}><option value="">Select an entry</option>{entries.filter(entry=>entry.language===code&&entry.kind===kind&&(entryKey(entry)===links[code]||searchEntries([entry],pickerQueries[code]??"",code).length)).map(entry=><option key={entryKey(entry)} value={entryKey(entry)}>{entry.title}</option>)}</select></label>
        <button className={buttonClass} disabled={!ready||busy} onClick={()=>setCreating(emptyEntry(code,kind))}>Create {languages[code].name} entry</button>
      </section>)}</div>
      {creating?<EntryForm key={entryKey(creating)} initial={creating} texts={entries.filter(entry=>entry.kind==="text"&&entry.language===creating.language)} onCancel={()=>setCreating(null)} onSaved={entry=>{setEntries(current=>[...current.filter(other=>entryKey(other)!==entryKey(entry)),entry]);setLinks(current=>({...current,[entry.language]:entryKey(entry)}));setCreating(null);}}/>:null}
      <Field label="Comparison notes" value={notes} onChange={setNotes} rows={3}/></>:<p className="text-sm text-neutral-600">Choose the languages you want to compare.</p>}
      {error?<p role="alert" className="text-sm text-red-700">{error}</p>:null}
      <div className="flex flex-wrap gap-3"><button className={buttonClass+" bg-neutral-900 !text-white"} disabled={!ready||busy||selected.length<2||!!creating} onClick={()=>void save()}>Save comparison</button><button className={buttonClass} disabled={busy} onClick={reset}>Clear</button></div>
    </section>
    <div className="grid gap-3 sm:grid-cols-3"><label className="block text-sm">Search comparisons and linked entries<input className={inputClass} type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label className="block text-sm">Type<select className={inputClass} value={filterKind} onChange={e=>setFilterKind(e.target.value as ComparisonKind|"all")}><option value="all">All types</option>{kinds.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
      <label className="block text-sm">Participating language<select className={inputClass} value={filterLanguage} onChange={e=>setFilterLanguage(e.target.value as LanguageCode|"all")}><option value="all">All languages</option>{LANGUAGE_CODES.map(code=><option key={code} value={code}>{languages[code].name}</option>)}</select></label></div>
    <section className="space-y-5">{visible.map(comparison=><article key={comparison.id} className="space-y-4 rounded-xl border border-neutral-200 p-4 sm:p-6"><h2 className="text-xl font-semibold">{comparison.title}</h2><p className="text-sm capitalize text-neutral-500">{comparison.kind}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{comparison.links.map(link=>{const entry=entries.find(item=>entryKey(item)===entryKey(link));const route=link.kind==="sentence"?"sentences":link.kind==="text"?"texts":link.kind==="vocabulary"?"vocabulary":"concepts";return <div key={entryKey(link)} className="min-w-0 break-words rounded-lg bg-neutral-50 p-4"><h3 className="text-sm font-medium">{languages[link.language].name}</h3>{entry?<><Link className="mt-3 inline-flex min-h-11 items-center whitespace-pre-wrap font-semibold underline" href={`/languages/${link.language}/${route}/${link.id}`}>{entry.title}</Link><p className="mt-2 whitespace-pre-wrap text-sm">{entry.meanings.join("\n")||entry.content||entry.explanation||entry.translation}</p></>:<p className="mt-3 text-sm">Linked entry is unavailable. Reload to try again.</p>}</div>;})}</div>
      <p className="whitespace-pre-wrap text-sm">{comparison.notes}</p><div className="flex gap-3"><button className={buttonClass} disabled={busy} onClick={()=>edit(comparison)}>Edit comparison</button><button className={buttonClass} disabled={busy} onClick={()=>void remove(comparison)}>Delete comparison</button></div>
    </article>)}{!loading&&!visible.length?<p className="text-neutral-500">No matching comparisons.</p>:null}</section>
    <details className="rounded-xl border border-neutral-200 p-4"><summary className="cursor-pointer py-3">Legacy comparison archive ({legacy.length})</summary><p className="my-3 text-sm text-neutral-500">Original multilingual records and term alignments are preserved here. New comparisons link official entries.</p>{legacy.filter(row=>matchesSearch([row],query,"grc")).map(row=><article key={String(row.id)} className="my-4 rounded-lg border border-neutral-200 p-4"><h3 className="font-semibold">{String(row.title??"Legacy sentence")}</h3><pre className="mt-3 whitespace-pre-wrap break-words text-sm">{JSON.stringify(Object.fromEntries(Object.entries(row).filter(([key])=>!["user_id","id"].includes(key))),null,2)}</pre></article>)}</details>
  </div>;
}
