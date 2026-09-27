import { languages, type LanguageCode } from "./config";
// Search keys only: never replace the original spelling in storage or UI.
export function normalizeSearch(value: string, language: LanguageCode): string {
  const text = value.trim().toLowerCase();
  return languages[language].normalization === "polytonic"
    ? text.normalize("NFD").replace(/\p{M}/gu, "").replaceAll("ς", "σ").normalize("NFC")
    : text.normalize("NFC");
}
export function matchesSearch(values: unknown[], query: string, language: LanguageCode) {
  const text = normalizeSearch(values.map((value) => typeof value === "object" ? JSON.stringify(value) : String(value ?? "")).join(" "), language);
  return normalizeSearch(query, language).split(/\s+/).every((token) => text.includes(token));
}
