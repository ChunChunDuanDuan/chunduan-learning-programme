"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {languages,type LanguageCode} from "@/lib/languages/config";
import {emptyEntry,entryKey,searchEntries,vocabularyHeadword,type EntryKind,type LanguageEntry} from "@/lib/languages/model";
import {addOccurrence,deleteEntry,loadLanguage,referenceColumns,removeOccurrence,saveSentenceSource,type WorkspaceData} from "@/lib/languages/repository";
import {EntryForm,buttonClass,inputClass} from "./entry-form";
import {EntryTools} from "./entry-tools";
export function LanguageModule({language,kind,reference,entryId}:{language:LanguageCode;kind:EntryKind;reference?:React.ReactNode;entryId?:string}) {
  const [data,setData]=useState<WorkspaceData|null>(null),[error,setError]=useState(""),[query,setQuery]=useState("");
  const [editing,setEditing]=useState<LanguageEntry|null>(null),[busy,setBusy]=useState(false),[partOfSpeech,setPartOfSpeech]=useState("All"),[tag,setTag]=useState("All");
  const reload=useCallback(async()=>{try{setData(await loadLanguage(language));}catch(cause){setError(String(cause));}},[language]);
  useEffect(()=>{let active=true;void loadLanguage(language).then(value=>{if(active)setData(value);}).catch(cause=>{if(active)setError(String(cause));});return()=>{active=false;};},[language]);
  const title=kind==="text"?"Texts":kind==="sentence"?"Sentences":kind==="concept"?"Concepts":kind==="grammar"?"Grammar":"Vocabulary";
  const entries=searchEntries(data?.entries??[],query,language).filter(entry=>entry.kind===kind&&(!entryId||entry.id===entryId)&&(partOfSpeech==="All"||entry.partOfSpeech===partOfSpeech)&&(tag==="All"||entry.tags.includes(tag)));
  const texts=(data?.entries??[]).filter(entry=>entry.kind==="text");
  const kindEntries=(data?.entries??[]).filter(entry=>entry.kind===kind);
  const parts=[...new Set(kindEntries.map(entry=>entry.partOfSpeech))].sort();
  const tags=[...new Set(kindEntries.flatMap(entry=>entry.tags))].sort();
  const route=kind==="vocabulary"?"vocabulary":kind==="sentence"?"sentences":kind==="text"?"texts":kind==="grammar"?"grammar":"concepts";
  async function remove(entry:LanguageEntry){
    if(!window.confirm(`Delete “${entry.title}”?`))return;
    setBusy(true);setError("");try{await deleteEntry(entry);await reload();}catch(cause){setError(String(cause));}finally{setBusy(false);}
  }
  return <section className="min-w-0 space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">{title}</h1>{entryId?<Link className={buttonClass} href={`/languages/${language}/${route}`}>All {title}</Link>:<button className={buttonClass} disabled={!data?.ready} onClick={()=>setEditing(emptyEntry(language,kind))}>New {kind}</button>}</div>
    {data?.warnings.map(warning=><p role="status" key={warning} className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">{warning}</p>)}
    {error?<p role="alert" className="text-red-700">{error}</p>:null}
    {editing?<EntryForm key={entryKey(editing)} initial={editing} texts={texts} onCancel={()=>setEditing(null)} onSaved={()=>{setEditing(null);void reload();}}/>:null}
    {!entryId?<div className="grid gap-3 sm:grid-cols-3"><label className="block text-sm">Search {languages[language].name} {title.toLowerCase()}<input type="search" className={inputClass} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      {kind==="vocabulary"?<label className="block text-sm">Part of speech<select className={inputClass} value={partOfSpeech} onChange={event=>setPartOfSpeech(event.target.value)}><option>All</option>{parts.map(part=><option key={part}>{part}</option>)}</select></label>:<span/>}
      <label className="block text-sm">Tag<select className={inputClass} value={tag} onChange={event=>setTag(event.target.value)}><option>All</option>{tags.map(value=><option key={value}>{value}</option>)}</select></label></div>:null}
    {!data&&!error?<p role="status">Loading…</p>:null}
    {data&&!entries.length?<p className="py-8 text-neutral-500">{entryId?"Entry not found in this language.":query||tag!=="All"||partOfSpeech!=="All"?"No matching entries.":"No entries yet."}</p>:null}
    <div className="space-y-4">{entries.map(entry=><article id={entry.id} key={entryKey(entry)} className="language-surface min-w-0 scroll-mt-6 break-words rounded-xl border border-neutral-200 p-4 sm:p-6">
      <h2 className="whitespace-pre-wrap text-xl font-semibold">{vocabularyHeadword(entry)}</h2>
      {data?.compared.has(entryKey(entry))?<span className="mt-2 inline-block rounded bg-neutral-100 px-3 py-1 text-xs">Cross-language comparison exists</span>:null}
      {entry.meanings.length?<p className="mt-3 whitespace-pre-wrap">{entry.meanings.join("\n")}</p>:null}
      {entry.kind==="vocabulary"?<p className="mt-2 text-sm text-neutral-500">{entry.partOfSpeech}</p>:null}
      {entry.kind==="text"?<div className="mt-2 text-sm text-neutral-500"><p>{entry.textType==="Custom"?entry.customType:entry.textType}</p>{typeof entry.metadata.author==="string"&&entry.metadata.author?<p>Author: {entry.metadata.author}</p>:null}{typeof entry.metadata.source==="string"&&entry.metadata.source?<p>Source: {entry.metadata.source}</p>:null}</div>:null}
      <div className="mt-3 space-y-3 whitespace-pre-wrap leading-7">{entry.content?<p>{entry.content}</p>:null}{entry.translation?<p className="text-neutral-600">{entry.translation}</p>:null}{entry.topic?<p><strong>Topic:</strong> {entry.topic}</p>:null}{entry.explanation?<p>{entry.explanation}</p>:null}{entry.examples?<p><strong>Examples:</strong> {entry.examples}</p>:null}{entry.exceptions?<p><strong>Exceptions:</strong> {entry.exceptions}</p>:null}{entry.notes?<p className="text-neutral-600">{entry.notes}</p>:null}</div>
      {Object.entries(entry.languageMetadata).some(([,v])=>v)?<dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(entry.languageMetadata).filter(([,v])=>v).map(([key,value])=><div key={key}><dt className="text-xs capitalize text-neutral-500">{key.replaceAll("_"," ")}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}</dl>:null}
      {entry.tags.length?<p className="mt-3 text-sm text-neutral-500">{entry.tags.join(" · ")}</p>:null}
      {Object.keys(entry.metadata).length?<details className="mt-3"><summary className="cursor-pointer py-3 text-sm">Metadata</summary><pre className="whitespace-pre-wrap break-words text-xs">{JSON.stringify(entry.metadata,null,2)}</pre></details>:null}
      {entry.sourceTextId?<Link className="mt-4 inline-flex min-h-11 items-center text-sm underline" href={`/languages/${language}/texts/${entry.sourceTextId}`}>Source Text: {texts.find(text=>text.id===entry.sourceTextId)?.title??"Text"}</Link>:null}
      {entry.kind==="text"&&data?<div className="mt-4 space-y-2"><p className="text-sm font-medium">Related sentences and vocabulary</p>{data.entries.filter(other=>other.sourceTextId===entry.id||data.occurrences.some(row=>row.text_id===entry.id&&row[referenceColumns[other.table] as "vocabulary_id"]===other.id)).map(other=><Link className="block min-h-11 py-2 text-sm underline" key={entryKey(other)} href={`/languages/${language}/${other.kind==="sentence"?"sentences":"vocabulary"}/${other.id}`}>{other.title}</Link>)}</div>:null}
      {entry.kind==="vocabulary"&&data?<OccurrenceEditor entry={entry} data={data} onChange={reload}/>:null}
      {entry.kind==="text"&&data?<TextRelationEditor entry={entry} data={data} onChange={reload} onCreateSentence={()=>setEditing({...emptyEntry(language,"sentence"),sourceTextId:entry.id})}/>:null}
      <EntryTools entry={entry}/>
      <div className="mt-4 flex flex-wrap gap-3">{!entryId?<Link className={buttonClass} href={`/languages/${language}/${route}/${entry.id}`}>View details</Link>:null}<button className={buttonClass} disabled={!data?.ready||busy} onClick={()=>setEditing(entry)}>Edit</button><button className={buttonClass} disabled={!data?.ready||busy||entry.legacyMode==="all"} onClick={()=>void remove(entry)}>Delete</button></div>
    </article>)}</div>
    {reference?<details className="language-surface rounded-xl border border-neutral-200 p-4"><summary className="cursor-pointer py-3">Existing grammar reference</summary>{reference}</details>:null}
  </section>;
}
function OccurrenceEditor({entry,data,onChange}:{entry:LanguageEntry;data:WorkspaceData;onChange:()=>Promise<void>}) {
  const [textId,setTextId]=useState(""),[location,setLocation]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const related=data.occurrences.filter(row=>row[referenceColumns[entry.table] as "vocabulary_id"]===entry.id);
  async function change(action:()=>Promise<void>){setBusy(true);setError("");try{await action();await onChange();}catch(cause){setError(String(cause));}finally{setBusy(false);}}
  return <details className="mt-4"><summary className="cursor-pointer py-3 text-sm">Text occurrences ({related.length})</summary><div className="space-y-3">
    {related.map(row=><div key={row.id} className="flex flex-wrap items-center gap-3"><Link className="text-sm underline" href={`/languages/${entry.language}/texts/${row.text_id}`}>{data.entries.find(text=>text.id===row.text_id&&text.kind==="text")?.title??"Text"}{row.location?` · ${row.location}`:""}</Link><button className={buttonClass} disabled={busy} onClick={()=>void change(()=>removeOccurrence(row.id))}>Remove relation</button></div>)}
    <label className="block text-sm">Text<select className={inputClass} value={textId} onChange={e=>setTextId(e.target.value)}><option value="">Select a Text</option>{data.entries.filter(text=>text.kind==="text").map(text=><option key={text.id} value={text.id}>{text.title}</option>)}</select></label>
    <label className="block text-sm">Location / passage<input className={inputClass} value={location} onChange={e=>setLocation(e.target.value)}/></label>
    <button className={buttonClass} disabled={!textId||busy||!data.ready} onClick={()=>void change(()=>addOccurrence(entry,textId,location))}>Link Text</button>
    {error?<p role="alert" className="text-sm text-red-700">{error}</p>:null}
  </div></details>;
}
function TextRelationEditor({entry,data,onChange,onCreateSentence}:{entry:LanguageEntry;data:WorkspaceData;onChange:()=>Promise<void>;onCreateSentence:()=>void}){
  const [sentenceId,setSentenceId]=useState(""),[vocabularyId,setVocabularyId]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const sentences=data.entries.filter(candidate=>candidate.kind==="sentence"&&candidate.language===entry.language&&candidate.sourceTextId!==entry.id);
  const vocabulary=data.entries.filter(candidate=>candidate.kind==="vocabulary"&&candidate.language===entry.language&&!data.occurrences.some(row=>row.text_id===entry.id&&row[referenceColumns[candidate.table] as "vocabulary_id"]===candidate.id));
  const linkedSentences=data.entries.filter(candidate=>candidate.kind==="sentence"&&candidate.sourceTextId===entry.id);
  const linkedOccurrences=data.occurrences.filter(row=>row.text_id===entry.id);
  async function change(action:()=>Promise<void>){setBusy(true);setError("");try{await action();setSentenceId("");setVocabularyId("");await onChange();}catch(cause){setError(String(cause));}finally{setBusy(false);}}
  return <details className="mt-4"><summary className="cursor-pointer py-3 text-sm">Manage related entries</summary><div className="space-y-3">
    {linkedSentences.map(sentence=><div key={`${sentence.table}:${sentence.id}`} className="flex flex-wrap items-center gap-3"><span className="text-sm">{sentence.title}</span><button type="button" className={buttonClass} disabled={!data.ready||busy} onClick={()=>void change(()=>saveSentenceSource({...sentence,sourceTextId:""}))}>Unlink sentence</button></div>)}
    {linkedOccurrences.map(row=>{const word=data.entries.find(candidate=>candidate.kind==="vocabulary"&&row[referenceColumns[candidate.table] as "vocabulary_id"]===candidate.id);return <div key={row.id} className="flex flex-wrap items-center gap-3"><span className="text-sm">{word?.title??"Vocabulary"}{row.location?` · ${row.location}`:""}</span><button type="button" className={buttonClass} disabled={!data.ready||busy} onClick={()=>void change(()=>removeOccurrence(row.id))}>Unlink vocabulary</button></div>;})}
    <button type="button" className={buttonClass} disabled={!data.ready||busy} onClick={onCreateSentence}>Add sentence from this text</button>
    <label className="block text-sm">Link existing sentence<select className={inputClass} value={sentenceId} onChange={event=>setSentenceId(event.target.value)}><option value="">Select a sentence</option>{sentences.map(sentence=><option key={`${sentence.table}:${sentence.id}`} value={`${sentence.table}:${sentence.id}`}>{sentence.title}</option>)}</select></label>
    <button type="button" className={buttonClass} disabled={!sentenceId||!data.ready||busy} onClick={()=>{const sentence=sentences.find(item=>`${item.table}:${item.id}`===sentenceId);if(sentence)void change(()=>saveSentenceSource({...sentence,sourceTextId:entry.id}));}}>Link sentence</button>
    <label className="block text-sm">Link existing vocabulary<select className={inputClass} value={vocabularyId} onChange={event=>setVocabularyId(event.target.value)}><option value="">Select vocabulary</option>{vocabulary.map(word=><option key={`${word.table}:${word.id}`} value={`${word.table}:${word.id}`}>{word.title}</option>)}</select></label>
    <button type="button" className={buttonClass} disabled={!vocabularyId||!data.ready||busy} onClick={()=>{const word=vocabulary.find(item=>`${item.table}:${item.id}`===vocabularyId);if(word)void change(()=>addOccurrence(word,entry.id,""));}}>Link vocabulary</button>
    {error?<p role="alert" className="text-sm text-red-700">{error}</p>:null}
  </div></details>;
}
