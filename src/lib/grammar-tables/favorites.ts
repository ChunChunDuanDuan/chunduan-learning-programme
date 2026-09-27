import type {GrammarTableLanguage} from "./types";

export function favoritesStorageKey(userId:string,language:GrammarTableLanguage){return `lp:grammar-tables:${userId}:${language}:favorites`;}
export function parseFavorites(value:string|null,allowed:readonly string[]):string[]{
  try {const parsed=JSON.parse(value??"[]");return Array.isArray(parsed)?[...new Set(parsed.filter((id):id is string=>typeof id==="string"&&allowed.includes(id)))]:[];}
  catch{return [];}
}
