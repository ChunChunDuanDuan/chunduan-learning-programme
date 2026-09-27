import { languageCode, languages, normalizePartOfSpeech, type LanguageCode } from "./config";
import { matchesSearch } from "./search";
export type EntryKind = "vocabulary" | "sentence" | "text" | "grammar" | "concept";
export type EntryTable = "vocabulary" | "japanese_vocabulary" | "sentences" | "japanese_sentences" | "articles" | "language_notes";
export type EntryRef = { id: string; table: EntryTable; language: LanguageCode; kind: EntryKind };
export type LanguageEntry = EntryRef & {
  title: string; content: string; meanings: string[]; partOfSpeech: string; notes: string; tags: string[];
  metadata: Record<string, unknown>; languageMetadata: Record<string, string>;
  translation: string; textType: string; customType: string; topic: string;
  explanation: string; examples: string; exceptions: string; createdAt: string;
  sourceTextId: string; legacyMode?: string; persisted?: boolean;
};
export type VocabularyEntry = LanguageEntry & { kind: "vocabulary" };
export type TextEntry = LanguageEntry & { kind: "text" };
export type GrammarEntry = LanguageEntry & { kind: "grammar" };
export type ComparisonKind = Exclude<EntryKind, "grammar">;
export type Comparison = { id: string; title: string; kind: ComparisonKind; languages: LanguageCode[]; notes: string; links: EntryRef[] };
export const TEXT_TYPES = ["Article", "Literature", "Textbook", "Dialogue", "News", "Philosophy", "Other", "Custom"];
export function vocabularyHeadword(entry: LanguageEntry): string {
  if(entry.kind!=="vocabulary")return entry.title;
  const fields=entry.languageMetadata;
  const part=normalizePartOfSpeech(entry.partOfSpeech);
  if(entry.language==="grc"&&part==="noun")return [fields.nominative||entry.title,fields.genitive,fields.article].filter(Boolean).join(", ");
  if(entry.language==="la"&&part==="noun")return [fields.nominative||entry.title,fields.genitive,fields.gender].filter(Boolean).join(", ");
  if((entry.language==="la"||entry.language==="grc")&&part==="verb"&&fields.principal_parts)return fields.principal_parts.startsWith(entry.title)?fields.principal_parts:`${entry.title}, ${fields.principal_parts}`;
  return entry.title;
}
export function entryKey(ref: EntryRef) { return `${ref.table}:${ref.id}:${ref.language}`; }
export function emptyEntry(language: LanguageCode, kind: EntryKind): LanguageEntry {
  return { id: "", table: kind === "vocabulary" ? (language === "ja" ? "japanese_vocabulary" : "vocabulary") : kind === "sentence" ? (language === "ja" ? "japanese_sentences" : "sentences") : kind === "text" ? "articles" : "language_notes",
    language, kind, title: "", content: "", meanings: [], partOfSpeech: "noun", notes: "", tags: [], metadata: {}, languageMetadata: {}, translation: "", textType: "Article", customType: "", topic: "", explanation: "", examples: "", exceptions: "", createdAt: "", sourceTextId: "" };
}
export type LegacyRow = Record<string, unknown>;
const str = (v: unknown) => typeof v === "string" ? v : "";
const object = (v: unknown): Record<string, unknown> => v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
export function adaptRow(row: LegacyRow, table: EntryTable, scope: LanguageCode): LanguageEntry | null {
  const kind: EntryKind = table.includes("vocabulary") ? "vocabulary" : table.includes("sentences") ? "sentence" : table === "articles" ? "text" : row.kind === "grammar" ? "grammar" : "concept";
  const mixed = table === "sentences" && row.mode === "all";
  const rowLanguage = table.startsWith("japanese_") ? "ja" : languageCode(row.language_code ?? row.language);
  if (!mixed && rowLanguage !== scope) return null;
  const column = languages[scope].sentenceColumn;
  const sentence = mixed ? (column ? str(row[column]) : "") : str(row.target_sentence ?? row.japanese_text);
  if (mixed && !sentence.trim()) return null;
  return { ...emptyEntry(scope, kind), id: str(row.id), table, persisted: true,
    title: kind === "vocabulary" ? str(row.word ?? row.writing) : kind === "sentence" ? sentence : str(row.title),
    content: str(row.content), meanings: strings(row.meanings).length ? strings(row.meanings) : [str(row.meaning_zh)].filter(Boolean),
    partOfSpeech: str(row.part_of_speech) || "other", notes: str(row.notes), tags: strings(row.tags),
    metadata: { ...Object.fromEntries(["topic", "level", "source", "source_zh", "romaji", "mastery", "example_sentence", "example_translation_zh", "usage_notes", "prompt_zh", "direction", "furigana_text", "structure_notes", "grammar_points", "key_vocabulary", "key_grammar_points", "suggested_sentences", "add_to_anki"].filter((key) => row[key] !== undefined && row[key] !== null).map((key) => [key, row[key]])), ...object(row.metadata) },
    languageMetadata: { ...(table === "japanese_vocabulary" ? { reading: str(row.reading_kana), kanji_form: str(row.writing) } : {}), ...object(row.language_metadata) } as Record<string, string>,
    translation: str(row.translation_zh ?? row.translation ?? row.chinese), textType: str(row.text_type) || "Article", customType: str(row.custom_type),
    topic: str(row.topic), explanation: str(row.explanation ?? row.rule ?? row.structure_notes), examples: str(row.examples), exceptions: str(row.exceptions),
    createdAt: str(row.created_at), legacyMode: mixed ? "all" : undefined,
  };
}
export function searchEntries(entries: LanguageEntry[], query: string, language: LanguageCode) {
  return entries.filter((entry) => entry.language === language && matchesSearch([entry.title, entry.content, entry.meanings, entry.notes, entry.tags, entry.topic, entry.explanation, entry.examples, entry.exceptions, entry.translation, entry.metadata, entry.languageMetadata], query, language));
}
export function resolveComparison(comparison: Comparison, entries: LanguageEntry[]) {
  const byKey = new Map(entries.map((entry) => [entryKey(entry), entry]));
  return comparison.links.map((link) => byKey.get(entryKey(link))).filter((entry): entry is LanguageEntry => !!entry);
}
export function validateComparison(kind: ComparisonKind, selected: LanguageCode[], links: EntryRef[]): string | null {
  if (new Set(selected).size < 2) return "Select at least two languages.";
  if (new Set(selected).size !== selected.length) return "Languages must be unique.";
  if (links.length !== selected.length || !selected.every((language) => links.some((link) => link.language === language && link.kind === kind && !!link.id))) return "Link one matching entry for every selected language.";
  return null;
}
export function entryPayload(entry: LanguageEntry): Record<string, unknown> {
  const common = { notes: entry.notes, tags: entry.tags, metadata: entry.metadata, language_metadata: entry.languageMetadata };
  if (entry.table === "vocabulary") return { ...common, language: languages[entry.language].legacyValue, word: entry.title, meaning_zh: entry.meanings.join("\n"), meanings: entry.meanings, part_of_speech: entry.partOfSpeech };
  if (entry.table === "japanese_vocabulary") return { ...common, writing: entry.title, reading_kana: entry.languageMetadata.reading ?? "", meaning_zh: entry.meanings.join("\n"), meanings: entry.meanings, part_of_speech: entry.partOfSpeech };
  // Updating a legacy multilingual sentence must never erase its other language columns.
  if (entry.table === "sentences" && entry.legacyMode === "all") return { [languages[entry.language].sentenceColumn!]: entry.title };
  if (entry.table === "sentences") return { ...common, language: languages[entry.language].legacyValue, target_sentence: entry.title, translation_zh: entry.translation, explanation: entry.explanation, mode: "single" };
  if (entry.table === "japanese_sentences") return { ...common, japanese_text: entry.title, translation_zh: entry.translation, structure_notes: entry.explanation };
  if (entry.table === "articles") return { ...common, language: languages[entry.language].legacyValue, title: entry.title, content: entry.content, translation_zh: entry.translation, text_type: entry.textType, custom_type: entry.customType, topic: entry.topic };
  return { ...common, language_code: entry.language, kind: entry.kind, title: entry.title, content: entry.content, topic: entry.topic, rule: entry.explanation, examples: entry.examples, exceptions: entry.exceptions };
}
