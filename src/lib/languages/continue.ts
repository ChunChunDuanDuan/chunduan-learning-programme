import type { LanguageCode } from "./config";

export function continueStorageKey(language: LanguageCode) { return `lp:language:${language}:last-page`; }

export function safeContinuePath(language: LanguageCode, value: string | null): string | null {
  if (!value || !value.startsWith(`/languages/${language}/`) || /[?#\\\u0000-\u0020]/.test(value)) return null;
  const rest=value.slice(`/languages/${language}/`.length).split("/");
  if(!["vocabulary","sentences","texts","grammar","concepts","search",...((language==="grc"||language==="la")?["grammar-tables"]:[]),...(language==="ja"?["kana","analysis","anki"]:[])].includes(rest[0]))return null;
  if(rest.length>2||rest.some(part=>!part||part==="."||part===".."))return null;
  if(rest.length===2&&!(rest[0]==="grammar-tables"?/^[a-z0-9-]+$/.test(rest[1]):/^[0-9a-f-]{36}$/i.test(rest[1])))return null;
  return value;
}
