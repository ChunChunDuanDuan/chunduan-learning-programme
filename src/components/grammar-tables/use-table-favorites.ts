"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import {currentUserId} from "@/lib/languages/repository";
import {favoritesStorageKey,parseFavorites} from "@/lib/grammar-tables/favorites";
import {tablesForLanguage} from "@/lib/grammar-tables/registry";
import type {GrammarTableLanguage} from "@/lib/grammar-tables/types";

export function useTableFavorites(language:GrammarTableLanguage){
  const [key,setKey]=useState<string|null>(null);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [error,setError]=useState("");
  const allowed=useMemo(()=>tablesForLanguage(language).map(table=>table.id),[language]);
  useEffect(()=>{
    let active=true;
    void currentUserId().then(id=>{
      if(!active)return;
      const storageKey=favoritesStorageKey(id,language);
      setKey(storageKey);
      try{setFavorites(parseFavorites(localStorage.getItem(storageKey),allowed));}
      catch{setError("Favorites are unavailable in this browser.");}
    }).catch(()=>{if(active)setError("Sign in to save favorites.");});
    return()=>{active=false;};
  },[language,allowed]);
  useEffect(()=>{
    if(!key)return;
    const onStorage=(event:StorageEvent)=>{
      if(event.key===key)setFavorites(parseFavorites(event.newValue,allowed));
    };
    window.addEventListener("storage",onStorage);
    return()=>window.removeEventListener("storage",onStorage);
  },[key,allowed]);
  const toggle=useCallback((id:string)=>{
    if(!key||!allowed.includes(id))return;
    try{
      const current=parseFavorites(localStorage.getItem(key),allowed);
      const next=current.includes(id)?current.filter(item=>item!==id):[...current,id];
      localStorage.setItem(key,JSON.stringify(next));
      setFavorites(next);
    }catch{setError("Favorites could not be saved in this browser.");}
  },[key,allowed]);
  return {favorites:new Set(favorites),toggle,ready:!!key,error};
}
