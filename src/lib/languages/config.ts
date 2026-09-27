export const LANGUAGE_CODES = ["en", "de", "ru", "ja", "grc", "la"] as const;
export type LanguageCode = (typeof LANGUAGE_CODES)[number];
export const CORE_MODULES = ["vocabulary", "sentences", "texts", "grammar", "search"] as const;
export type LanguageModule = (typeof CORE_MODULES)[number] | "grammar-tables";
export const DEFAULT_LANGUAGE_BACKGROUND_OPACITY = 0.14;
export type LanguageBackgroundConfig = {
  src: string;
  opacity?: number;
  position?: string;
  repeat?: "no-repeat" | "repeat-y" | "repeat";
};
export type MetadataField = { key: string; label: string; options?: readonly string[] };
type LanguageDefinition = {
  code: LanguageCode; name: string; route: string; visual: string; background: LanguageBackgroundConfig;
  aliases: string[]; legacyValue: string; sentenceColumn?: string;
  normalization: "unicode" | "polytonic"; modules: readonly LanguageModule[];
  metadataSchema: Record<string, MetadataField[]>;
};
const fields = (...items: string[]): MetadataField[] => items.map((label) => ({ key: label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replace(/_$/, ""), label }));
const definitions: Record<LanguageCode, Omit<LanguageDefinition, "code" | "route" | "visual" | "background" | "modules">> = {
  en: { name: "English", aliases: ["en", "English"], legacyValue: "English", sentenceColumn: "english", normalization: "unicode", metadataSchema: {
    noun: fields("Plural"), verb: fields("Principal forms"), adjective: fields("Comparative", "Superlative"),
  } },
  de: { name: "German", aliases: ["de", "German", "Deutsch"], legacyValue: "Deutsch", sentenceColumn: "german", normalization: "unicode", metadataSchema: {
    noun: fields("Gender", "Plural"),
    verb: [
      ...fields("Infinitive", "Principal forms"),
      { key: "separability", label: "Prefix behavior", options: ["", "separable", "inseparable", "both"] },
      ...fields("Separable prefix", "Case government / valency", "Reflexive status"),
    ],
    adjective: fields("Relevant forms", "Usage notes"),
  } },
  ru: { name: "Russian", aliases: ["ru", "Russian", "Русский"], legacyValue: "Русский", sentenceColumn: "russian", normalization: "unicode", metadataSchema: {
    shared: fields("Case government"), noun: fields("Gender"), verb: fields("Aspect", "Imperfective / perfective pair"),
  } },
  ja: { name: "Japanese", aliases: ["ja", "Japanese", "日本語"], legacyValue: "日本語", sentenceColumn: "japanese", normalization: "unicode", metadataSchema: {
    shared: fields("Kanji form", "Reading"), verb: fields("Transitivity", "Verb / adjective type"), adjective: fields("Verb / adjective type"),
  } },
  grc: { name: "Ancient Greek", aliases: ["grc", "Ancient Greek"], legacyValue: "grc", normalization: "polytonic", metadataSchema: {
    noun: fields("Nominative", "Genitive", "Article", "Gender", "Declension / noun class"), adjective: fields("Dictionary forms", "Adjective class"), verb: fields("Principal parts", "Verb class"),
  } },
  la: { name: "Latin", aliases: ["la", "Latin"], legacyValue: "la", normalization: "unicode", metadataSchema: {
    noun: fields("Nominative", "Genitive", "Gender", "Declension"), verb: fields("Principal parts", "Conjugation"), adjective: fields("Dictionary forms", "Adjective class / declension pattern"),
  } },
};
export const languages = Object.fromEntries(LANGUAGE_CODES.map((code) => [code, {
  ...definitions[code], code, route: `/languages/${code}`, visual: `/visuals/languages/${code}/cover.webp`,
  background: {src:`/visuals/languages/${code}/background.webp`,opacity:DEFAULT_LANGUAGE_BACKGROUND_OPACITY,position:"top center",repeat:"no-repeat"},
  modules: code==="grc"||code==="la" ? ["vocabulary","sentences","texts","grammar","grammar-tables","search"] : CORE_MODULES,
}])) as unknown as Record<LanguageCode, LanguageDefinition>;
export const crossLanguageVisual = "/visuals/languages/cross-language/cover.webp";
export function isLanguageCode(value: string): value is LanguageCode { return LANGUAGE_CODES.includes(value as LanguageCode); }
export function languageCode(value: unknown): LanguageCode | undefined {
  return LANGUAGE_CODES.find((code) => languages[code].aliases.some((alias) => alias.toLowerCase() === String(value ?? "").trim().toLowerCase()));
}
export const PARTS_OF_SPEECH = ["noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "particle", "interjection", "other"];
export function normalizePartOfSpeech(value: string): string {
  return ({ 名詞: "noun", 動詞: "verb", 形容詞: "adjective", 副詞: "adverb", 助詞: "particle", 其他: "other" } as Record<string, string>)[value] ?? value.toLowerCase();
}
export function vocabularyFields(language: LanguageCode, partOfSpeech: string) {
  const schema = languages[language].metadataSchema;
  return [...(schema.shared ?? []), ...(schema[normalizePartOfSpeech(partOfSpeech)] ?? [])];
}
