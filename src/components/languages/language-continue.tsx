"use client";
import {useCallback,useEffect,useSyncExternalStore} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import type {LanguageCode} from "@/lib/languages/config";
import {continueStorageKey,safeContinuePath} from "@/lib/languages/continue";
const continueChanged="lp:language:continue-changed";
function subscribe(callback:()=>void){
  window.addEventListener("storage",callback);
  window.addEventListener(continueChanged,callback);
  return ()=>{window.removeEventListener("storage",callback);window.removeEventListener(continueChanged,callback);};
}
function serverSnapshot(){return null;}

export function LanguageVisitTracker({language}:{language:LanguageCode}){
  const pathname=usePathname();
  useEffect(()=>{
    const safe=safeContinuePath(language,pathname);
    if(safe)try{localStorage.setItem(continueStorageKey(language),safe);window.dispatchEvent(new Event(continueChanged));}catch{/* Storage is optional. */}
  },[language,pathname]);
  return null;
}

export function ContinueLink({language}:{language:LanguageCode}){
  const snapshot=useCallback(()=>{try{return safeContinuePath(language,localStorage.getItem(continueStorageKey(language)));}catch{return null;}},[language]);
  const path=useSyncExternalStore(subscribe,snapshot,serverSnapshot);
  return <section className="border-t border-neutral-200 pt-5"><h2 className="text-lg font-semibold">Continue where you left off</h2>
    {path?<Link href={path} className="mt-2 inline-flex min-h-11 items-center text-sm underline">{path.split("/").slice(3).join(" / ")}</Link>:<p className="mt-2 text-sm text-neutral-500">Your last language page will appear here.</p>}
  </section>;
}
