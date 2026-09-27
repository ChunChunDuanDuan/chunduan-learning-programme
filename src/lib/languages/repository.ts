import { supabase } from "../supabase/client";
import { languages, type LanguageCode } from "./config";
import { adaptRow, entryKey, entryPayload, type Comparison, type EntryRef, type EntryTable, type LanguageEntry, type LegacyRow } from "./model";
export const referenceColumns: Record<EntryTable, string> = { vocabulary: "vocabulary_id", japanese_vocabulary: "japanese_vocabulary_id", sentences: "sentence_id", japanese_sentences: "japanese_sentence_id", articles: "text_id", language_notes: "concept_id" };
export type RelationRow = { id: string; text_id: string; language_code: LanguageCode; vocabulary_id?: string; japanese_vocabulary_id?: string; sentence_id?: string; japanese_sentence_id?: string; location?: string; notes?: string };
export type WorkspaceData = { entries: LanguageEntry[]; compared: Set<string>; occurrences: RelationRow[]; sources: RelationRow[]; warnings: string[]; ready: boolean };
const schemaMessage = "New language fields are not available yet. Existing records remain readable. Apply the Phase 1 database migration before saving.";
function message(error: { message: string; code?: string }) {
  return /schema cache|does not exist/.test(error.message) || ["42P01","42703","PGRST204","PGRST205"].includes(error.code ?? "") ? schemaMessage : error.message;
}
async function rows(table: string, userId: string, scope?: LanguageCode, select = "*"): Promise<{ data: LegacyRow[]; error: string | null }> {
  const all: LegacyRow[] = [];
  for (let offset=0; ; offset+=500) {
    let query = supabase.from(table).select(select).eq("user_id", userId).order("id").range(offset,offset+499);
    if (scope) {
      if (["language_notes","language_comparison_links","sentence_text_sources","vocabulary_text_occurrences"].includes(table)) query = query.eq("language_code", scope);
      else if (!table.startsWith("japanese_")) query = query.in("language", languages[scope].aliases);
    }
    let { data, error } = await query;
    if(error && table === "sentences" && select.includes("metadata") && ["42703","PGRST204"].includes(error.code)) {
      const fallback = await supabase.from(table).select(select.replace(",metadata,language_metadata", "")).eq("user_id",userId).in("language",languages[scope!].aliases).order("id").range(offset,offset+499);
      data=fallback.data;error=fallback.error;
    }
    if (error) return { data: [], error: message(error) };
    all.push(...(data ?? []) as unknown as LegacyRow[]);
    if (!data || data.length < 500) break;
  }
  return { data: all, error: null };
}
export async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error(error?.message ?? "Please sign in again.");
  return data.user.id;
}
export function refFromLink(row: LegacyRow, kind: EntryRef["kind"]): EntryRef | null {
  const table = (Object.keys(referenceColumns) as EntryTable[]).find((key) => row[referenceColumns[key]]);
  return table ? { table, id: String(row[referenceColumns[table]]), language: row.language_code as LanguageCode, kind } : null;
}
export async function loadLanguage(language: LanguageCode): Promise<WorkspaceData> {
  const uid = await currentUserId();
  const warnings: string[] = [];
  const tables: EntryTable[] = ["vocabulary","sentences","articles","language_notes", ...(language === "ja" ? ["japanese_vocabulary","japanese_sentences"] as EntryTable[] : [])];
  const results = await Promise.all(tables.map(async (table) => {
    // Projection prevents other languages' text from crossing the single-language boundary.
    const selection = table === "sentences" ? "id,user_id,language,target_sentence,translation_zh,source_zh,explanation,notes,tags,created_at,mode,metadata,language_metadata" : "*";
    return rows(table,uid,language,selection);
  }));
  const entries = results.flatMap((result,i) => {
    if(result.error) warnings.push(result.error);
    return result.data.map((row)=>adaptRow(row,tables[i],language)).filter((entry): entry is LanguageEntry => !!entry && entry.legacyMode !== "all");
  });
  const col=languages[language].sentenceColumn;
  if(col) {
    for(let offset=0; ; offset+=500) {
      const { data,error } = await supabase.from("sentences").select(`id,mode,created_at,${col}`).eq("user_id",uid).eq("mode","all").order("id").range(offset,offset+499);
      if(error) { warnings.push(message(error)); break; }
      entries.push(...((data ?? []) as unknown as LegacyRow[]).map(row=>adaptRow(row,"sentences",language)).filter((entry): entry is LanguageEntry=>!!entry));
      if(!data || data.length<500) break;
    }
  }
  const [links,sources,occurrences] = await Promise.all([
    rows("language_comparison_links",uid,language),rows("sentence_text_sources",uid,language),rows("vocabulary_text_occurrences",uid,language),
  ]);
  for(const result of [links,sources,occurrences]) if(result.error) warnings.push(result.error);
  const compared = new Set(links.data.map(row=>refFromLink(row,"vocabulary")).filter((ref): ref is EntryRef=>!!ref).map(entryKey));
  const sourceRows=sources.data as unknown as RelationRow[];
  for(const entry of entries) {
    if(entry.kind==="sentence") entry.sourceTextId=sourceRows.find(row=>row[referenceColumns[entry.table] as "sentence_id"]===entry.id)?.text_id ?? "";
  }
  return { entries: entries.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)), compared, sources:sourceRows, occurrences:occurrences.data as unknown as RelationRow[], warnings:[...new Set(warnings)], ready:warnings.length===0 };
}
export async function saveEntry(entry: LanguageEntry): Promise<LanguageEntry> {
  const uid=await currentUserId();
  const id=entry.id || crypto.randomUUID();
  const query = entry.persisted
    ? supabase.from(entry.table).update(entryPayload(entry)).eq("id",id).eq("user_id",uid)
    : supabase.from(entry.table).insert({ ...entryPayload(entry),id,user_id:uid });
  const selection = entry.table === "sentences" && entry.legacyMode === "all"
    ? `id,mode,created_at,${languages[entry.language].sentenceColumn}`
    : "*";
  const { data,error } = await query.select(selection).single();
  if(error) throw new Error(message(error));
  const saved=adaptRow(data as unknown as LegacyRow,entry.table,entry.language);
  if(!saved) throw new Error("Saved entry has an invalid language.");
  return { ...saved,sourceTextId:entry.sourceTextId };
}
export async function saveSentenceSource(entry: LanguageEntry) {
  const uid=await currentUserId();
  const column=referenceColumns[entry.table];
  const existing=supabase.from("sentence_text_sources").delete().eq("user_id",uid).eq(column,entry.id).eq("language_code",entry.language);
  if(!entry.sourceTextId) { const {error}=await existing; if(error) throw new Error(error.message); return; }
  const { error } = await supabase.from("sentence_text_sources").upsert({ user_id:uid,language_code:entry.language,sentence_id:entry.table==="sentences"?entry.id:null,japanese_sentence_id:entry.table==="japanese_sentences"?entry.id:null,text_id:entry.sourceTextId }, { onConflict:"sentence_id,japanese_sentence_id,language_code" });
  if(error) throw new Error(error.message);
}
export async function deleteEntry(entry: LanguageEntry) {
  if(entry.legacyMode==="all") throw new Error("A legacy multilingual sentence is shared. Edit its language text instead of deleting the whole record.");
  const uid=await currentUserId();
  const {error}=await supabase.from(entry.table).delete().eq("id",entry.id).eq("user_id",uid);
  if(error) throw new Error(error.code==="23503"?"This entry is still linked. Remove its comparison/source relations first.":error.message);
}
export async function loadComparisons(): Promise<Comparison[]> {
  const uid=await currentUserId();
  const result=await rows("language_comparisons",uid,undefined,"*,language_comparison_links(*)");
  if(result.error) throw new Error(result.error);
  return result.data.map(row=>({id:String(row.id),title:String(row.title),kind:row.kind as Comparison["kind"],languages:row.languages as LanguageCode[],notes:String(row.notes??""),links:((row.language_comparison_links??[]) as LegacyRow[]).map(link=>refFromLink(link,row.kind as Comparison["kind"])).filter((ref):ref is EntryRef=>!!ref)}));
}
export async function saveComparison(comparison: Omit<Comparison,"id"> & {id?:string}) {
  const {error}=await supabase.rpc("save_language_comparison",{ document:{...comparison,links:undefined},entry_links:comparison.links });
  if(error) throw new Error(message(error));
}
export async function deleteComparison(id:string) {
  const uid=await currentUserId();
  const {error}=await supabase.from("language_comparisons").delete().eq("id",id).eq("user_id",uid);
  if(error) throw new Error(error.message);
}
export async function addOccurrence(vocabulary: LanguageEntry,textId:string,location:string) {
  const uid=await currentUserId();
  const {error}=await supabase.from("vocabulary_text_occurrences").insert({user_id:uid,language_code:vocabulary.language,[referenceColumns[vocabulary.table]]:vocabulary.id,text_id:textId,location});
  if(error) throw new Error(error.message);
}
export async function removeOccurrence(id:string) {
  const uid=await currentUserId();
  const {error}=await supabase.from("vocabulary_text_occurrences").delete().eq("id",id).eq("user_id",uid);
  if(error) throw new Error(error.message);
}
export async function loadLegacyComparisons() {
  const uid=await currentUserId();
  const result=await rows("comparison_documents",uid,undefined,"*,term_alignments(*)");
  if(result.error) throw new Error(result.error);
  return result.data;
}
export async function loadLegacyMixedSentences() {
  const uid=await currentUserId();
  const all:LegacyRow[]=[];
  for(let offset=0;;offset+=500){
    const {data,error}=await supabase.from("sentences").select("*").eq("user_id",uid).eq("mode","all").order("id").range(offset,offset+499);
    if(error)throw new Error(error.message);
    all.push(...(data??[]) as LegacyRow[]);
    if(!data||data.length<500)break;
  }
  return all;
}
export async function addJapaneseAnkiDraft(entry: LanguageEntry) {
  if(entry.table!=="japanese_vocabulary"&&entry.table!=="japanese_sentences")throw new Error("Anki drafts require a Japanese vocabulary or sentence entry.");
  const uid=await currentUserId();
  const cardType=entry.kind==="vocabulary"?"japanese_vocabulary":"japanese_sentence";
  const {data:existing,error:lookupError}=await supabase.from("anki_drafts").select("id").eq("user_id",uid).eq("card_type",cardType).eq("source_item_id",entry.id).limit(1);
  if(lookupError)throw new Error(lookupError.message);
  if(existing?.length)return "An Anki draft already exists for this entry.";
  const back=[entry.languageMetadata.reading,entry.metadata.furigana_text,entry.metadata.romaji,entry.meanings.join("\n"),entry.translation,entry.kind==="vocabulary"?entry.partOfSpeech:"",entry.explanation,entry.metadata.grammar_points,entry.metadata.example_sentence,entry.notes].filter(Boolean).join("\n\n");
  const {error}=await supabase.from("anki_drafts").insert({user_id:uid,card_type:cardType,source_item_type:cardType,source_item_id:entry.id,front:entry.title,back,tags:entry.tags,status:"待處理"});
  if(error)throw new Error(error.message);
  return "Anki draft created.";
}
