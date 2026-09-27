"use client";
import { useState, type FormEvent } from "react";
import { languages, PARTS_OF_SPEECH, vocabularyFields } from "@/lib/languages/config";
import { TEXT_TYPES, type LanguageEntry } from "@/lib/languages/model";
import { saveEntry, saveSentenceSource } from "@/lib/languages/repository";
export const inputClass="mt-1 w-full min-w-0 rounded-lg border border-neutral-300 bg-white px-3 py-3 text-base";
export const buttonClass="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-100 disabled:opacity-50";
export function Field({label,value,onChange,rows,required=false}:{label:string;value:string;onChange:(value:string)=>void;rows?:number;required?:boolean}) {
  return <label className="block min-w-0 text-sm font-medium">{label}{rows?<textarea className={inputClass} rows={rows} value={value} onChange={e=>onChange(e.target.value)} required={required}/>:<input className={inputClass} value={value} onChange={e=>onChange(e.target.value)} required={required}/>}</label>;
}
export function EntryForm({initial,texts,onSaved,onCancel}:{initial:LanguageEntry;texts:LanguageEntry[];onSaved:(entry:LanguageEntry)=>void;onCancel:()=>void}) {
  const [entry,setEntry]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const [metadataJson,setMetadataJson]=useState(JSON.stringify(initial.metadata,null,2));
  const [author,setAuthor]=useState(typeof initial.metadata.author==="string"?initial.metadata.author:"");
  const [source,setSource]=useState(typeof initial.metadata.source==="string"?initial.metadata.source:"");
  const [aiPrompt,setAiPrompt]=useState("");
  const set=<K extends keyof LanguageEntry>(key:K,value:LanguageEntry[K])=>setEntry(current=>({...current,[key]:value}));
  async function save(event:FormEvent) {
    event.preventDefault();setBusy(true);setError("");
    try {
      const metadata:unknown=JSON.parse(metadataJson);
      if(!metadata||typeof metadata!=="object"||Array.isArray(metadata))throw new Error("Metadata must be a JSON object.");
      if(entry.kind==="text"&&entry.textType==="Custom"&&!entry.customType.trim())throw new Error("Enter the custom text type.");
      const textMetadata=entry.kind==="text"?{author:author.trim(),source:source.trim()}:{};
      const saved=await saveEntry({...entry,title:entry.title.trim(),tags:entry.tags.map(t=>t.trim()).filter(Boolean),meanings:entry.meanings.map(t=>t.trim()).filter(Boolean),metadata:{...metadata as Record<string,unknown>,...textMetadata}});
      setEntry(saved); // Preserve identity on a partial relation failure; retry cannot duplicate the entry.
      if(saved.kind==="sentence")try{await saveSentenceSource(saved);}catch(cause){throw new Error(`Entry saved; source relation failed. Retry to save the relation: ${String(cause)}`);}
      onSaved(saved);
    }catch(cause){setError(cause instanceof Error?cause.message:String(cause));}finally{setBusy(false);}
  }
  async function generate(randomSentence=false) {
    setBusy(true);setError("");
    try {
      const currentMetadata=JSON.parse(metadataJson);
      if(!currentMetadata||typeof currentMetadata!=="object"||Array.isArray(currentMetadata))throw new Error("Metadata must be a JSON object.");
      const endpoint=randomSentence?"/api/ai/random-sentence":entry.kind==="vocabulary"?"/api/explain-vocabulary":entry.kind==="sentence"?"/api/explain-sentence":"/api/generate-article";
      const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({mode:"single",language:languages[entry.language].legacyValue,direction:aiPrompt?"zh-to-target":"target-to-zh",prompt_zh:aiPrompt,word:entry.title,source_zh:aiPrompt,target_sentence:entry.title,translation_zh:entry.translation,topic:entry.topic||"daily life",level:String(currentMetadata.level||"beginner")})});
      const result=await response.json();if(!response.ok)throw new Error(result.error??"Generation failed.");
      if(entry.kind==="vocabulary"){
        setEntry(current=>({...current,title:result.word??current.title,meanings:[result.meaning_zh??""],partOfSpeech:result.part_of_speech??current.partOfSpeech,notes:result.notes??current.notes}));
        setMetadataJson(JSON.stringify({...currentMetadata,example_sentence:result.example_sentence,example_translation_zh:result.example_translation_zh,usage_notes:result.usage_notes,prompt_zh:aiPrompt},null,2));
      }else if(entry.kind==="sentence"){
        setEntry(current=>({...current,title:result.target_sentence??current.title,translation:result.translation_zh??result.chinese??"",explanation:result.explanation??"",notes:result.notes??current.notes}));
        setMetadataJson(JSON.stringify({...currentMetadata,source_zh:result.chinese??aiPrompt},null,2));
      }else{
        setEntry(current=>({...current,title:result.title??current.title,content:result.content??"",translation:result.translation_zh??"",notes:result.notes??current.notes}));
        setMetadataJson(JSON.stringify({...currentMetadata,key_vocabulary:result.key_vocabulary,key_grammar_points:result.key_grammar_points,suggested_sentences:result.suggested_sentences},null,2));
      }
    }catch(cause){setError(cause instanceof Error?cause.message:String(cause));}finally{setBusy(false);}
  }
  return <form onSubmit={save} className="space-y-5 rounded-xl border border-neutral-300 bg-neutral-50 p-4 sm:p-6">
    <h2 className="text-xl font-semibold">{entry.persisted?"Edit":"New"} {entry.kind} · {languages[entry.language].name}</h2>
    {entry.legacyMode==="all"?<p className="text-sm text-neutral-600">This sentence comes from a legacy comparison. Only this language’s text and source Text are editable here; shared annotations remain in Cross-language.</p>:null}
    <Field label={entry.kind==="vocabulary"?"Lemma":entry.kind==="sentence"?"Sentence":"Title"} value={entry.title} onChange={v=>set("title",v)} rows={entry.kind==="sentence"?3:undefined} required/>
    {entry.legacyMode!=="all"?<>
      {entry.kind==="vocabulary"?<>
        <Field label="Meanings (one per line)" value={entry.meanings.join("\n")} onChange={v=>set("meanings",v.split("\n"))} rows={3} required/>
        <label className="block text-sm font-medium">Part of speech<select className={inputClass} value={entry.partOfSpeech} onChange={e=>set("partOfSpeech",e.target.value)}>{[...new Set([...PARTS_OF_SPEECH,entry.partOfSpeech])].map(pos=><option key={pos}>{pos}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">{vocabularyFields(entry.language,entry.partOfSpeech).map(field=>field.options?<label className="block text-sm font-medium" key={field.key}>{field.label}<select className={inputClass} value={entry.languageMetadata[field.key]??""} onChange={event=>set("languageMetadata",{...entry.languageMetadata,[field.key]:event.target.value})}>{field.options.map(option=><option key={option} value={option}>{option||"Unspecified"}</option>)}</select></label>:<Field key={field.key} label={field.label} value={entry.languageMetadata[field.key]??""} onChange={value=>set("languageMetadata",{...entry.languageMetadata,[field.key]:value})}/>)}</div>
      </>:null}
      {entry.kind==="text"?<>
        <label className="block text-sm font-medium">Text type<select className={inputClass} value={entry.textType} onChange={e=>set("textType",e.target.value)}>{[...new Set([...TEXT_TYPES,entry.textType])].map(type=><option key={type}>{type}</option>)}</select></label>
        {entry.textType==="Custom"?<><Field label="Custom type" value={entry.customType} onChange={v=>set("customType",v)} required/><label className="block text-sm">Reuse an existing type<select className={inputClass} value="" onChange={event=>set("customType",event.target.value)}><option value="">Select an existing custom type</option>{[...new Set(texts.filter(text=>text.language===entry.language&&text.textType==="Custom").map(text=>text.customType).filter(Boolean))].sort().map(type=><option key={type} value={type}>{type}</option>)}</select></label></>:null}
        <Field label="Author (optional)" value={author} onChange={setAuthor}/>
        <Field label="Source (optional)" value={source} onChange={setSource}/>
        <Field label="Content" value={entry.content} onChange={v=>set("content",v)} rows={10} required/>
      </>:null}
      {entry.kind==="grammar"||entry.kind==="concept"?<>
        <Field label="Topic" value={entry.topic} onChange={v=>set("topic",v)} required={entry.kind==="grammar"}/>
        <Field label={entry.kind==="grammar"?"Explanation / rule":"Definition / explanation"} value={entry.explanation} onChange={v=>set("explanation",v)} rows={5} required/>
        <Field label="Examples" value={entry.examples} onChange={v=>set("examples",v)} rows={3}/>
        <Field label="Exceptions" value={entry.exceptions} onChange={v=>set("exceptions",v)} rows={3}/>
      </>:null}
      {entry.kind==="sentence"||entry.kind==="text"?<Field label="Translation" value={entry.translation} onChange={v=>set("translation",v)} rows={3}/>:null}
      {entry.kind==="sentence"?<Field label="Explanation" value={entry.explanation} onChange={v=>set("explanation",v)} rows={4}/>:null}
      <Field label="Tags (comma separated)" value={entry.tags.join(",")} onChange={v=>set("tags",v.split(","))}/>
      <Field label="Notes" value={entry.notes} onChange={v=>set("notes",v)} rows={3}/>
      <details><summary className="min-h-11 cursor-pointer py-3 text-sm">Additional metadata</summary><Field label="Metadata (JSON object)" value={metadataJson} onChange={setMetadataJson} rows={6}/></details>
    </>:null}
    {entry.kind==="sentence"?<label className="block text-sm font-medium">Source Text<select className={inputClass} value={entry.sourceTextId} onChange={e=>set("sourceTextId",e.target.value)}><option value="">No source Text</option>{texts.filter(text=>text.language===entry.language).map(text=><option key={text.id} value={text.id}>{text.title}</option>)}</select></label>:null}
    {["en","de","ru","ja"].includes(entry.language)&&["vocabulary","sentence","text"].includes(entry.kind)&&entry.legacyMode!=="all"?<details><summary className="min-h-11 cursor-pointer py-3 text-sm">AI assistance</summary><div className="space-y-3">
      {entry.kind==="text"?<Field label="Topic for generation" value={entry.topic} onChange={v=>set("topic",v)}/>:<Field label="Chinese prompt (optional when original text is provided)" value={aiPrompt} onChange={setAiPrompt} rows={2}/>}
      <div className="flex flex-wrap gap-3"><button className={buttonClass} type="button" disabled={busy} onClick={()=>void generate()}>Generate draft</button>{entry.kind==="sentence"?<button className={buttonClass} type="button" disabled={busy} onClick={()=>void generate(true)}>Generate random sentence</button>:null}</div>
    </div></details>:null}
    {error?<p role="alert" className="whitespace-pre-wrap text-sm text-red-700">{error}</p>:null}
    <div className="flex flex-wrap gap-3"><button className={buttonClass+" bg-neutral-900 !text-white"} disabled={busy}>{busy?"Saving…":"Save"}</button><button type="button" className={buttonClass} disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>;
}
