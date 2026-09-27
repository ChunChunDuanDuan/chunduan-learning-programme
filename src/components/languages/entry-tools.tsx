"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import {languages} from "@/lib/languages/config";
import type {LanguageEntry} from "@/lib/languages/model";
import {addJapaneseAnkiDraft} from "@/lib/languages/repository";
import {buttonClass} from "./entry-form";

export function EntryTools({entry}:{entry:LanguageEntry}) {
  const [busy,setBusy]=useState(false),[notice,setNotice]=useState(""),[error,setError]=useState("");
  const audio=useRef<HTMLAudioElement|null>(null),audioUrl=useRef<string|null>(null);
  useEffect(()=>()=>{audio.current?.pause();if(audioUrl.current)URL.revokeObjectURL(audioUrl.current);},[]);
  async function play(){
    setBusy(true);setError("");
    try{
      audio.current?.pause();if(audioUrl.current)URL.revokeObjectURL(audioUrl.current);
      const response=await fetch("/api/ai/speech",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:entry.title,language:languages[entry.language].name})});
      if(!response.ok){const result=await response.json();throw new Error(result.error??"Audio generation failed.");}
      audioUrl.current=URL.createObjectURL(await response.blob());audio.current=new Audio(audioUrl.current);
      await audio.current.play();
    }catch(cause){setError(cause instanceof Error?cause.message:String(cause));}finally{setBusy(false);}
  }
  async function addDraft(){setBusy(true);setError("");try{setNotice(await addJapaneseAnkiDraft(entry));}catch(cause){setError(cause instanceof Error?cause.message:String(cause));}finally{setBusy(false);}}
  const speech=entry.kind==="sentence"&&["en","de","ru","ja"].includes(entry.language);
  const anki=["japanese_vocabulary","japanese_sentences"].includes(entry.table);
  if(!speech&&!anki)return null;
  return <div className="mt-4 space-y-2"><div className="flex flex-wrap gap-3">{speech?<button type="button" className={buttonClass} disabled={busy} onClick={()=>void play()}>Read aloud</button>:null}{anki?<button type="button" className={buttonClass} disabled={busy} onClick={()=>void addDraft()}>Add to Anki</button>:null}</div>{notice?<p role="status" className="text-sm">{notice} <Link href="/languages/ja/anki" className="inline-flex min-h-11 items-center underline">Open Anki drafts</Link></p>:null}{error?<p role="alert" className="text-sm text-red-700">{error}</p>:null}</div>;
}
