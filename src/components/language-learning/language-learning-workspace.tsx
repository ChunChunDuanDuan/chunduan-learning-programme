"use client";

/* eslint-disable react-hooks/static-components */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase/client";
import {
  ANKI_STATUSES,
  COMPARISON_TYPES,
  KANA_ENTRIES,
  MASTERY_OPTIONS,
  PARTS_OF_SPEECH,
  ankiDraftsToCsv,
  buildSentenceAnkiDraft,
  buildVocabularyAnkiDraft,
  hasSentenceDuplicate,
  hasVocabularyDuplicate,
  moveItem,
  searchInFields,
  splitTags,
  tagsToInput,
  type AnalysisItemDraft,
  type AnkiDraft,
  type AnkiStatus,
  type ComparisonDocument,
  type ComparisonType,
  type JapaneseSentence,
  type JapaneseSentenceAnalysis,
  type JapaneseVocabulary,
  type KanaEntry,
  type KanaMode,
  type KanaProgress,
  type Mastery,
  type TermAlignment,
} from "../../lib/language-learning";

type WorkspaceView = "home" | "kana" | "vocabulary" | "sentences" | "analysis" | "anki" | "comparison";
type FormState = Record<string, string>;
type AlignmentDraft = Partial<TermAlignment> & { display_order: number };

const japaneseLinks = [
  { href: "/languages/ja", label: "日文首頁", view: "home" },
  { href: "/languages/ja/kana", label: "五十音", view: "kana" },
  { href: "/languages/ja/vocabulary", label: "單字庫", view: "vocabulary" },
  { href: "/languages/ja/sentences", label: "句子庫", view: "sentences" },
  { href: "/languages/ja/analysis", label: "句子分析", view: "analysis" },
  { href: "/languages/ja/anki", label: "Anki 待處理", view: "anki" },
] as const;

const emptyVocabularyForm = {
  writing: "",
  reading_kana: "",
  romaji: "",
  meaning_zh: "",
  part_of_speech: "名詞",
  example_sentence: "",
  tags: "",
  source: "",
  notes: "",
  mastery: "未學",
};

const emptySentenceForm = {
  japanese_text: "",
  furigana_text: "",
  romaji: "",
  translation_zh: "",
  structure_notes: "",
  grammar_points: "",
  source: "",
  tags: "",
  notes: "",
};

const emptyAnalysisForm = {
  japanese_text: "",
  furigana_text: "",
  romaji: "",
  translation_zh: "",
  sentence_core: "",
  grammar_notes: "",
  source: "",
  tags: "",
  notes: "",
};

const emptyComparisonForm = {
  title: "",
  comparison_type: "句子",
  chinese_text: "",
  english_text: "",
  german_text: "",
  japanese_text: "",
  japanese_furigana: "",
  japanese_romaji: "",
  source: "",
  tags: "",
  notes: "",
};

const emptyAnalysisItem: AnalysisItemDraft = {
  original_text: "",
  reading: "",
  dictionary_form: "",
  part_of_speech: "",
  meaning_zh: "",
  grammar_function: "",
  notes: "",
  display_order: 0,
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

function Field({ label, value, onChange, required, rows, placeholder }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700">{label} {required ? <span className="text-red-500">*</span> : null}</span>
      {rows ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-950" />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950" />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: readonly string[] }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950">
        {options.map((option) => <option key={option} value={option}>{option || "全部"}</option>)}
      </select>
    </label>
  );
}

function EmptyState({ title }: { title: string }) {
  return <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">{title}</div>;
}

const primaryButton = (extra = "") => `rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-medium !text-white disabled:opacity-50 ${extra}`;
const secondaryButton = (extra = "") => `rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 ${extra}`;
const dangerButton = (extra = "") => `rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 ${extra}`;

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "尚未記錄";
}

function getKanaDisplay(entry: KanaEntry, mode: KanaMode) {
  if (mode === "hiragana") return entry.hiragana;
  if (mode === "katakana") return entry.katakana;
  return `${entry.hiragana} / ${entry.katakana}`;
}

export function LanguageLearningWorkspace({ initialView }: { initialView: WorkspaceView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJapaneseText = searchParams.get("ja") ?? "";
  const initialChineseText = searchParams.get("zh") ?? "";
  const initialWriting = searchParams.get("writing") ?? "";
  const [activeView, setActiveView] = useState<WorkspaceView>(initialView);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [vocabulary, setVocabulary] = useState<JapaneseVocabulary[]>([]);
  const [sentences, setSentences] = useState<JapaneseSentence[]>([]);
  const [analyses, setAnalyses] = useState<JapaneseSentenceAnalysis[]>([]);
  const [ankiDrafts, setAnkiDrafts] = useState<AnkiDraft[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonDocument[]>([]);
  const [kanaProgress, setKanaProgress] = useState<KanaProgress[]>([]);

  const [vocabForm, setVocabForm] = useState<FormState>({
    ...emptyVocabularyForm,
    writing: initialWriting,
  });
  const [vocabEditingId, setVocabEditingId] = useState<string | null>(null);
  const [vocabSearch, setVocabSearch] = useState("");
  const [vocabTagFilter, setVocabTagFilter] = useState("");
  const [vocabPosFilter, setVocabPosFilter] = useState("All");
  const [vocabMasteryFilter, setVocabMasteryFilter] = useState("All");
  const [vocabSort, setVocabSort] = useState("updated_at");

  const [sentenceForm, setSentenceForm] = useState<FormState>(emptySentenceForm);
  const [sentenceEditingId, setSentenceEditingId] = useState<string | null>(null);
  const [sentenceSearch, setSentenceSearch] = useState("");
  const [sentenceTagFilter, setSentenceTagFilter] = useState("");
  const [sentenceSort, setSentenceSort] = useState("updated_at");

  const [analysisForm, setAnalysisForm] = useState<FormState>(emptyAnalysisForm);
  const [analysisItems, setAnalysisItems] = useState<AnalysisItemDraft[]>([emptyAnalysisItem]);

  const [ankiSearch, setAnkiSearch] = useState("");
  const [ankiStatusFilter, setAnkiStatusFilter] = useState("All");
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [customCard, setCustomCard] = useState({ front: "", back: "", tags: "" });

  const [comparisonForm, setComparisonForm] = useState<FormState>({
    ...emptyComparisonForm,
    title: initialJapaneseText.slice(0, 32) || "",
    chinese_text: initialChineseText,
    japanese_text: initialJapaneseText,
  });
  const [comparisonEditingId, setComparisonEditingId] = useState<string | null>(null);
  const [alignmentDrafts, setAlignmentDrafts] = useState<AlignmentDraft[]>([]);
  const [comparisonSearch, setComparisonSearch] = useState("");
  const [comparisonTypeFilter, setComparisonTypeFilter] = useState("All");
  const [comparisonTagFilter, setComparisonTagFilter] = useState("");
  const [comparisonSort, setComparisonSort] = useState("updated_at");
  const [visibleLanguages, setVisibleLanguages] = useState({ chinese: true, english: true, german: true, japanese: true, furigana: true, romaji: true });
  const [comparisonLayout, setComparisonLayout] = useState<"side" | "stack">("side");

  const [kanaMode, setKanaMode] = useState<KanaMode>("both");
  const [showRomaji, setShowRomaji] = useState(true);
  const [quizType, setQuizType] = useState<"kana-to-romaji" | "romaji-to-kana">("kana-to-romaji");
  const [quizEntry, setQuizEntry] = useState<KanaEntry>(KANA_ENTRIES[0]);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [selectedKana, setSelectedKana] = useState("");
  const [quizResult, setQuizResult] = useState("");

  async function loadAll() {
    setLoading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData.user;
    if (userError || !user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const [vocabularyResult, sentencesResult, analysesResult, ankiResult, comparisonsResult, progressResult] = await Promise.all([
      supabase.from("japanese_vocabulary").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("japanese_sentences").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("japanese_sentence_analyses").select("*, japanese_sentence_analysis_items(*)").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("anki_drafts").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("comparison_documents").select("*, term_alignments(*)").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("kana_progress").select("*").eq("user_id", user.id),
    ]);
    if (vocabularyResult.data) setVocabulary(vocabularyResult.data as JapaneseVocabulary[]);
    if (sentencesResult.data) setSentences(sentencesResult.data as JapaneseSentence[]);
    if (analysesResult.data) setAnalyses(analysesResult.data as JapaneseSentenceAnalysis[]);
    if (ankiResult.data) setAnkiDrafts(ankiResult.data as AnkiDraft[]);
    if (comparisonsResult.data) setComparisons(comparisonsResult.data as ComparisonDocument[]);
    if (progressResult.data) setKanaProgress(progressResult.data as KanaProgress[]);
    const firstError = [vocabularyResult.error, sentencesResult.error, analysesResult.error, ankiResult.error, comparisonsResult.error, progressResult.error].find(Boolean);
    if (firstError) {
      const isMissingLanguageTable =
        firstError.message.includes("schema cache") &&
        firstError.message.includes("japanese_");

      setNotice(
        isMissingLanguageTable
          ? "日文學習資料表尚未建立。請先在 Supabase 套用 supabase/migrations/202607100001_create_japanese_learning_tables.sql，完成後重新整理此頁。"
          : `載入失敗：${firstError.message}`
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAll();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredVocabulary = useMemo(() => vocabulary
    .filter((item) => searchInFields(vocabSearch, [item.writing, item.reading_kana, item.romaji, item.meaning_zh, item.part_of_speech, item.example_sentence, item.source, item.notes, item.tags.join(" ")]))
    .filter((item) => !vocabTagFilter || item.tags.includes(vocabTagFilter))
    .filter((item) => vocabPosFilter === "All" || item.part_of_speech === vocabPosFilter)
    .filter((item) => vocabMasteryFilter === "All" || item.mastery === vocabMasteryFilter)
    .toSorted((a, b) => new Date(b[vocabSort as "created_at" | "updated_at"]).getTime() - new Date(a[vocabSort as "created_at" | "updated_at"]).getTime()), [vocabulary, vocabSearch, vocabTagFilter, vocabPosFilter, vocabMasteryFilter, vocabSort]);

  const filteredSentences = useMemo(() => sentences
    .filter((item) => searchInFields(sentenceSearch, [item.japanese_text, item.furigana_text, item.romaji, item.translation_zh, item.structure_notes, item.grammar_points, item.source, item.notes, item.tags.join(" ")]))
    .filter((item) => !sentenceTagFilter || item.tags.includes(sentenceTagFilter))
    .toSorted((a, b) => new Date(b[sentenceSort as "created_at" | "updated_at"]).getTime() - new Date(a[sentenceSort as "created_at" | "updated_at"]).getTime()), [sentences, sentenceSearch, sentenceTagFilter, sentenceSort]);

  const filteredDrafts = useMemo(() => ankiDrafts
    .filter((item) => searchInFields(ankiSearch, [item.front, item.back, item.card_type, item.status, item.tags.join(" ")]))
    .filter((item) => ankiStatusFilter === "All" || item.status === ankiStatusFilter), [ankiDrafts, ankiSearch, ankiStatusFilter]);

  const filteredComparisons = useMemo(() => comparisons
    .filter((item) => searchInFields(comparisonSearch, [item.title, item.chinese_text, item.english_text, item.german_text, item.japanese_text, item.notes, item.tags.join(" ")]))
    .filter((item) => comparisonTypeFilter === "All" || item.comparison_type === comparisonTypeFilter)
    .filter((item) => !comparisonTagFilter || item.tags.includes(comparisonTagFilter))
    .toSorted((a, b) => new Date(b[comparisonSort as "created_at" | "updated_at"]).getTime() - new Date(a[comparisonSort as "created_at" | "updated_at"]).getTime()), [comparisons, comparisonSearch, comparisonTypeFilter, comparisonTagFilter, comparisonSort]);

  const allVocabTags = Array.from(new Set(vocabulary.flatMap((item) => item.tags))).toSorted();
  const allSentenceTags = Array.from(new Set(sentences.flatMap((item) => item.tags))).toSorted();
  const allComparisonTags = Array.from(new Set(comparisons.flatMap((item) => item.tags))).toSorted();

  function updateForm(setter: (value: FormState) => void, form: FormState, key: string, value: string) {
    setter({ ...form, [key]: value });
  }

  async function saveVocabulary() {
    if (!userId) return;
    if (!vocabForm.writing.trim() || !vocabForm.reading_kana.trim() || !vocabForm.meaning_zh.trim()) {
      setNotice("請填寫表記、假名讀音與中文意思。");
      return;
    }
    if (hasVocabularyDuplicate(vocabulary, vocabForm.writing, vocabForm.reading_kana, vocabEditingId ?? undefined) && !window.confirm("可能已有相同表記與讀音的單字。仍要儲存嗎？")) return;
    const payload = {
      user_id: userId,
      writing: vocabForm.writing.trim(),
      reading_kana: vocabForm.reading_kana.trim(),
      romaji: vocabForm.romaji.trim(),
      meaning_zh: vocabForm.meaning_zh.trim(),
      part_of_speech: vocabForm.part_of_speech,
      example_sentence: vocabForm.example_sentence.trim(),
      tags: splitTags(vocabForm.tags),
      source: vocabForm.source.trim(),
      notes: vocabForm.notes.trim(),
      mastery: vocabForm.mastery as Mastery,
    };
    const result = vocabEditingId ? await supabase.from("japanese_vocabulary").update(payload).eq("id", vocabEditingId) : await supabase.from("japanese_vocabulary").insert(payload);
    if (result.error) setNotice(`儲存單字失敗：${result.error.message}`);
    else {
      setNotice("單字已儲存。");
      setVocabForm(emptyVocabularyForm);
      setVocabEditingId(null);
      await loadAll();
    }
  }

  function editVocabulary(item: JapaneseVocabulary) {
    setVocabEditingId(item.id);
    setVocabForm({ writing: item.writing, reading_kana: item.reading_kana, romaji: item.romaji ?? "", meaning_zh: item.meaning_zh, part_of_speech: item.part_of_speech ?? "名詞", example_sentence: item.example_sentence ?? "", tags: tagsToInput(item.tags), source: item.source ?? "", notes: item.notes ?? "", mastery: item.mastery });
  }

  async function deleteVocabulary(id: string) {
    if (!window.confirm("確定刪除此單字？")) return;
    const { error } = await supabase.from("japanese_vocabulary").delete().eq("id", id);
    if (error) setNotice(`刪除失敗：${error.message}`);
    await loadAll();
  }

  async function saveSentence() {
    if (!userId) return;
    if (!sentenceForm.japanese_text.trim() || !sentenceForm.translation_zh.trim()) {
      setNotice("請填寫日文原句與中文翻譯。");
      return;
    }
    if (hasSentenceDuplicate(sentences, sentenceForm.japanese_text, sentenceEditingId ?? undefined) && !window.confirm("可能已有完全相同的日文句子。仍要儲存嗎？")) return;
    const payload = {
      user_id: userId,
      japanese_text: sentenceForm.japanese_text.trim(),
      furigana_text: sentenceForm.furigana_text.trim(),
      romaji: sentenceForm.romaji.trim(),
      translation_zh: sentenceForm.translation_zh.trim(),
      structure_notes: sentenceForm.structure_notes.trim(),
      grammar_points: sentenceForm.grammar_points.trim(),
      source: sentenceForm.source.trim(),
      tags: splitTags(sentenceForm.tags),
      notes: sentenceForm.notes.trim(),
    };
    const result = sentenceEditingId ? await supabase.from("japanese_sentences").update(payload).eq("id", sentenceEditingId) : await supabase.from("japanese_sentences").insert(payload);
    if (result.error) setNotice(`儲存句子失敗：${result.error.message}`);
    else {
      setNotice("句子已儲存。");
      setSentenceForm(emptySentenceForm);
      setSentenceEditingId(null);
      await loadAll();
    }
  }

  function editSentence(item: JapaneseSentence) {
    setSentenceEditingId(item.id);
    setSentenceForm({ japanese_text: item.japanese_text, furigana_text: item.furigana_text ?? "", romaji: item.romaji ?? "", translation_zh: item.translation_zh, structure_notes: item.structure_notes ?? "", grammar_points: item.grammar_points ?? "", source: item.source ?? "", tags: tagsToInput(item.tags), notes: item.notes ?? "" });
  }

  async function deleteSentence(id: string) {
    if (!window.confirm("確定刪除此句子？")) return;
    const { error } = await supabase.from("japanese_sentences").delete().eq("id", id);
    if (error) setNotice(`刪除失敗：${error.message}`);
    await loadAll();
  }

  async function addDraftFromVocabulary(item: JapaneseVocabulary) {
    const draft = buildVocabularyAnkiDraft(item);
    if (ankiDrafts.some((candidate) => candidate.card_type === draft.card_type && candidate.source_item_id === item.id)) {
      setNotice("此單字已有 Anki 草稿，已帶你到待處理區。");
      setActiveView("anki");
      return;
    }
    const { error } = await supabase.from("anki_drafts").insert({ ...draft, user_id: userId, status: "待處理" });
    setNotice(error ? `加入 Anki 失敗：${error.message}` : "已建立可編輯的 Anki 草稿。");
    await loadAll();
  }

  async function addDraftFromSentence(item: JapaneseSentence) {
    const draft = buildSentenceAnkiDraft(item);
    if (ankiDrafts.some((candidate) => candidate.card_type === draft.card_type && candidate.source_item_id === item.id)) {
      setNotice("此句子已有 Anki 草稿，已帶你到待處理區。");
      setActiveView("anki");
      return;
    }
    const { error } = await supabase.from("anki_drafts").insert({ ...draft, user_id: userId, status: "待處理" });
    setNotice(error ? `加入 Anki 失敗：${error.message}` : "已建立可編輯的 Anki 草稿。");
    await loadAll();
  }

  async function saveCustomCard() {
    if (!customCard.front.trim() || !customCard.back.trim()) {
      setNotice("自訂卡片需要正面與背面。");
      return;
    }
    const { error } = await supabase.from("anki_drafts").insert({ user_id: userId, card_type: "custom", front: customCard.front.trim(), back: customCard.back.trim(), tags: splitTags(customCard.tags), status: "待處理" });
    if (error) setNotice(`新增自訂卡失敗：${error.message}`);
    else {
      setCustomCard({ front: "", back: "", tags: "" });
      setNotice("自訂卡片已建立。");
    }
    await loadAll();
  }

  async function updateDraft(id: string, updates: Partial<AnkiDraft>) {
    const { error } = await supabase.from("anki_drafts").update(updates).eq("id", id);
    if (error) setNotice(`更新草稿失敗：${error.message}`);
    await loadAll();
  }

  async function deleteDraft(id: string) {
    if (!window.confirm("確定刪除此 Anki 草稿？")) return;
    const { error } = await supabase.from("anki_drafts").delete().eq("id", id);
    if (error) setNotice(`刪除草稿失敗：${error.message}`);
    await loadAll();
  }

  async function batchDraftStatus(status: AnkiStatus) {
    if (selectedDraftIds.length === 0) return;
    const { error } = await supabase.from("anki_drafts").update({ status }).in("id", selectedDraftIds);
    setNotice(error ? `批次更新失敗：${error.message}` : `已更新 ${selectedDraftIds.length} 張卡片。`);
    setSelectedDraftIds([]);
    await loadAll();
  }

  async function exportCsv(markExported: boolean) {
    const drafts = selectedDraftIds.length ? ankiDrafts.filter((draft) => selectedDraftIds.includes(draft.id)) : filteredDrafts;
    const blob = new Blob([`\uFEFF${ankiDraftsToCsv(drafts)}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "japanese-anki-drafts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    if (markExported && drafts.length > 0) {
      await supabase.from("anki_drafts").update({ status: "已匯出" }).in("id", drafts.map((draft) => draft.id));
      await loadAll();
    }
  }

  async function saveAnalysis(saveSentenceToo: boolean, addSentenceToAnki: boolean) {
    if (!analysisForm.japanese_text.trim()) {
      setNotice("請填寫日文原句。");
      return;
    }
    const { data, error } = await supabase.from("japanese_sentence_analyses").insert({ user_id: userId, japanese_text: analysisForm.japanese_text.trim(), furigana_text: analysisForm.furigana_text.trim(), romaji: analysisForm.romaji.trim(), translation_zh: analysisForm.translation_zh.trim(), sentence_core: analysisForm.sentence_core.trim(), grammar_notes: analysisForm.grammar_notes.trim(), source: analysisForm.source.trim(), tags: splitTags(analysisForm.tags), notes: analysisForm.notes.trim() }).select("id").single();
    if (error || !data) {
      setNotice(`儲存分析失敗：${error?.message ?? "未知錯誤"}`);
      return;
    }
    const items = analysisItems.filter((item) => item.original_text.trim()).map((item, index) => ({ analysis_id: data.id, original_text: item.original_text.trim(), reading: item.reading.trim(), dictionary_form: item.dictionary_form.trim(), part_of_speech: item.part_of_speech.trim(), meaning_zh: item.meaning_zh.trim(), grammar_function: item.grammar_function.trim(), notes: item.notes.trim(), display_order: index }));
    if (items.length > 0) await supabase.from("japanese_sentence_analysis_items").insert(items);
    let savedSentence: JapaneseSentence | null = null;
    if (saveSentenceToo && analysisForm.translation_zh.trim()) {
      if (!hasSentenceDuplicate(sentences, analysisForm.japanese_text) || window.confirm("句子庫已有相同原句。仍要另存新句子嗎？")) {
        const sentenceResult = await supabase.from("japanese_sentences").insert({ user_id: userId, japanese_text: analysisForm.japanese_text.trim(), furigana_text: analysisForm.furigana_text.trim(), romaji: analysisForm.romaji.trim(), translation_zh: analysisForm.translation_zh.trim(), structure_notes: analysisForm.sentence_core.trim(), grammar_points: analysisForm.grammar_notes.trim(), source: analysisForm.source.trim(), tags: splitTags(analysisForm.tags), notes: analysisForm.notes.trim() }).select("*").single();
        savedSentence = (sentenceResult.data as JapaneseSentence | null) ?? null;
      }
    }
    if (addSentenceToAnki && savedSentence) await addDraftFromSentence(savedSentence);
    setAnalysisForm(emptyAnalysisForm);
    setAnalysisItems([emptyAnalysisItem]);
    setNotice("句子分析已儲存。");
    await loadAll();
  }

  async function saveComparison() {
    if (!comparisonForm.title.trim()) {
      setNotice("比較項目需要標題。");
      return;
    }
    const possibleDuplicate = comparisons.some((item) => item.id !== comparisonEditingId && (item.title.trim() === comparisonForm.title.trim() || Boolean(item.japanese_text && item.japanese_text === comparisonForm.japanese_text)));
    if (possibleDuplicate && !window.confirm("可能已有相同標題或文本的比較項目。仍要儲存嗎？")) return;
    const payload = { user_id: userId, title: comparisonForm.title.trim(), comparison_type: comparisonForm.comparison_type as ComparisonType, chinese_text: comparisonForm.chinese_text.trim(), english_text: comparisonForm.english_text.trim(), german_text: comparisonForm.german_text.trim(), japanese_text: comparisonForm.japanese_text.trim(), japanese_furigana: comparisonForm.japanese_furigana.trim(), japanese_romaji: comparisonForm.japanese_romaji.trim(), source: comparisonForm.source.trim(), tags: splitTags(comparisonForm.tags), notes: comparisonForm.notes.trim() };
    const result = comparisonEditingId ? await supabase.from("comparison_documents").update(payload).eq("id", comparisonEditingId).select("id").single() : await supabase.from("comparison_documents").insert(payload).select("id").single();
    if (result.error || !result.data) {
      setNotice(`儲存比較項目失敗：${result.error?.message ?? "未知錯誤"}`);
      return;
    }
    const comparisonId = result.data.id;
    if (comparisonEditingId) await supabase.from("term_alignments").delete().eq("comparison_id", comparisonId);
    const alignments = alignmentDrafts.filter((item) => item.chinese_term || item.english_term || item.german_term || item.japanese_term || item.note).map((item, index) => ({ comparison_id: comparisonId, chinese_term: item.chinese_term ?? "", english_term: item.english_term ?? "", german_term: item.german_term ?? "", japanese_term: item.japanese_term ?? "", note: item.note ?? "", display_order: index }));
    if (alignments.length > 0) await supabase.from("term_alignments").insert(alignments);
    setComparisonForm(emptyComparisonForm);
    setAlignmentDrafts([]);
    setComparisonEditingId(null);
    setNotice("比較項目已儲存。");
    await loadAll();
  }

  function editComparison(item: ComparisonDocument) {
    setComparisonEditingId(item.id);
    setComparisonForm({ title: item.title, comparison_type: item.comparison_type, chinese_text: item.chinese_text ?? "", english_text: item.english_text ?? "", german_text: item.german_text ?? "", japanese_text: item.japanese_text ?? "", japanese_furigana: item.japanese_furigana ?? "", japanese_romaji: item.japanese_romaji ?? "", source: item.source ?? "", tags: tagsToInput(item.tags), notes: item.notes ?? "" });
    setAlignmentDrafts((item.term_alignments ?? []).toSorted((a, b) => a.display_order - b.display_order));
  }

  async function deleteComparison(id: string) {
    if (!window.confirm("確定刪除此比較項目？")) return;
    const { error } = await supabase.from("comparison_documents").delete().eq("id", id);
    if (error) setNotice(`刪除比較項目失敗：${error.message}`);
    await loadAll();
  }

  function copyComparison(item: ComparisonDocument) {
    setComparisonForm({ title: `${item.title} copy`, comparison_type: item.comparison_type, chinese_text: item.chinese_text ?? "", english_text: item.english_text ?? "", german_text: item.german_text ?? "", japanese_text: item.japanese_text ?? "", japanese_furigana: item.japanese_furigana ?? "", japanese_romaji: item.japanese_romaji ?? "", source: item.source ?? "", tags: tagsToInput(item.tags), notes: item.notes ?? "" });
    setAlignmentDrafts((item.term_alignments ?? []).map((alignment, index) => ({ ...alignment, id: undefined, display_order: index })));
    setComparisonEditingId(null);
    setNotice("已複製到上方表單，確認後可儲存。");
  }

  async function saveComparisonAsSentence(item: ComparisonDocument) {
    if (!item.japanese_text || !item.chinese_text) {
      setNotice("需要日文欄與中文欄才能存入句子庫。");
      return;
    }
    if (hasSentenceDuplicate(sentences, item.japanese_text) && !window.confirm("句子庫可能已有相同原句。仍要另存嗎？")) return;
    const { error } = await supabase.from("japanese_sentences").insert({ user_id: userId, japanese_text: item.japanese_text, furigana_text: item.japanese_furigana ?? "", romaji: item.japanese_romaji ?? "", translation_zh: item.chinese_text, source: item.source ?? "", tags: item.tags, notes: item.notes ?? "" });
    setNotice(error ? `存入句子庫失敗：${error.message}` : "已存入日文句子庫。");
    await loadAll();
  }

  async function submitQuiz() {
    const correct = quizType === "kana-to-romaji" ? quizAnswer.trim().toLowerCase() === quizEntry.romaji : selectedKana === quizEntry.hiragana || selectedKana === quizEntry.katakana;
    setQuizResult(correct ? "答對了。" : `答錯了，正解是 ${quizEntry.romaji} / ${quizEntry.hiragana} / ${quizEntry.katakana}`);
    if (!userId) return;
    const existing = kanaProgress.find((progress) => progress.kana_key === quizEntry.key);
    await supabase.from("kana_progress").upsert({ user_id: userId, kana_key: quizEntry.key, answer_count: (existing?.answer_count ?? 0) + 1, correct_count: (existing?.correct_count ?? 0) + (correct ? 1 : 0), last_answered_at: new Date().toISOString() }, { onConflict: "user_id,kana_key" });
    await loadAll();
  }

  function nextQuiz() {
    setQuizEntry(KANA_ENTRIES[Math.floor(Math.random() * KANA_ENTRIES.length)]);
    setQuizAnswer("");
    setSelectedKana("");
    setQuizResult("");
  }

  function Shell({ children }: { children: React.ReactNode }) {
    return (
      <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 border-b border-neutral-200 pb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Language Learning</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{activeView === "comparison" ? "語言比較工作台" : "日文學習"}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">手動整理日文、比較中文／英文／德文／日文文本，並把要複習的內容匯出成 Anki CSV。</p>
          </header>
          <nav className="mb-6 flex flex-wrap gap-2">
            {japaneseLinks.map((link) => <Link key={link.href} href={link.href} className={secondaryButton(activeView === link.view ? " border-neutral-950 text-neutral-950" : "")}>{link.label}</Link>)}
            <Link href="/language-comparison" className={secondaryButton(activeView === "comparison" ? " border-neutral-950 text-neutral-950" : "")}>語言比較工作台</Link>
          </nav>
          {notice ? <div className="mb-5 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700">{notice}</div> : null}
          {loading ? <p className="text-sm text-neutral-500">Loading...</p> : children}
        </div>
      </main>
    );
  }

  function HomeView() {
    const pendingAnkiCount = ankiDrafts.filter((draft) => draft.status === "待處理").length;
    return (
      <Shell>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="text-sm text-neutral-500">日文單字總數</p><p className="mt-2 text-4xl font-semibold">{vocabulary.length}</p></Card>
          <Card><p className="text-sm text-neutral-500">日文句子總數</p><p className="mt-2 text-4xl font-semibold">{sentences.length}</p></Card>
          <Card><p className="text-sm text-neutral-500">Anki 待處理</p><p className="mt-2 text-4xl font-semibold">{pendingAnkiCount}</p></Card>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card><h2 className="text-xl font-semibold">最近新增的單字</h2>{vocabulary.slice(0, 5).length ? vocabulary.slice(0, 5).map((item) => <p key={item.id} className="mt-3 text-sm text-neutral-600">{item.writing} · {item.reading_kana} · {item.meaning_zh}</p>) : <div className="mt-4"><EmptyState title="還沒有日文單字。" /></div>}</Card>
          <Card><h2 className="text-xl font-semibold">最近新增的句子</h2>{sentences.slice(0, 5).length ? sentences.slice(0, 5).map((item) => <p key={item.id} className="mt-3 text-sm leading-6 text-neutral-600">{item.japanese_text}<br />{item.translation_zh}</p>) : <div className="mt-4"><EmptyState title="還沒有日文句子。" /></div>}</Card>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/languages/ja/vocabulary" className={primaryButton()}>快速新增單字</Link>
          <Link href="/languages/ja/sentences" className={primaryButton()}>快速新增句子</Link>
          <Link href="/languages/ja/kana" className={secondaryButton()}>進入五十音</Link>
          <Link href="/language-comparison" className={secondaryButton()}>進入語言比較工作台</Link>
        </div>
      </Shell>
    );
  }

  function KanaView() {
    const progressMap = new Map(kanaProgress.map((item) => [item.kana_key, item]));
    const options = [...KANA_ENTRIES].sort(() => 0.5 - Math.random()).slice(0, 5);
    if (!options.some((item) => item.key === quizEntry.key)) options[0] = quizEntry;
    return (
      <Shell>
        <Card><div className="grid gap-3 md:grid-cols-4"><SelectField label="顯示模式" value={kanaMode} onChange={(value) => setKanaMode(value as KanaMode)} options={["hiragana", "katakana", "both"]} /><label className="flex items-end gap-2 pb-3 text-sm text-neutral-700"><input type="checkbox" checked={showRomaji} onChange={(event) => setShowRomaji(event.target.checked)} />顯示羅馬字</label></div></Card>
        {(["basic", "dakuten", "handakuten", "youon"] as const).map((group) => <section key={group} className="mt-6"><h2 className="mb-3 text-xl font-semibold">{group}</h2><div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">{KANA_ENTRIES.filter((entry) => entry.group === group).map((entry) => { const progress = progressMap.get(entry.key); return <div key={entry.key} className="rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm"><p className="text-2xl font-semibold leading-8">{getKanaDisplay(entry, kanaMode)}</p>{showRomaji ? <p className="mt-1 text-xs text-neutral-500">{entry.romaji}</p> : null}<p className="mt-2 text-[11px] text-neutral-400">{progress?.correct_count ?? 0}/{progress?.answer_count ?? 0}</p></div>; })}</div></section>)}
        <Card className="mt-8"><h2 className="text-xl font-semibold">基礎測驗</h2><div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButton(quizType === "kana-to-romaji" ? " border-neutral-950" : "")} onClick={() => setQuizType("kana-to-romaji")}>假名轉羅馬字</button><button className={secondaryButton(quizType === "romaji-to-kana" ? " border-neutral-950" : "")} onClick={() => setQuizType("romaji-to-kana")}>羅馬字選假名</button></div><div className="mt-5 rounded-3xl bg-neutral-50 p-5"><p className="text-sm text-neutral-500">題目</p><p className="mt-2 text-5xl font-semibold">{quizType === "kana-to-romaji" ? getKanaDisplay(quizEntry, kanaMode) : quizEntry.romaji}</p>{quizType === "kana-to-romaji" ? <input value={quizAnswer} onChange={(event) => setQuizAnswer(event.target.value)} className="mt-5 w-full rounded-2xl border border-neutral-300 px-4 py-3 text-sm" placeholder="輸入 romaji" /> : <div className="mt-5 flex flex-wrap gap-2">{options.map((option) => <button key={option.key} className={secondaryButton(selectedKana === option.hiragana ? " border-neutral-950" : "")} onClick={() => setSelectedKana(option.hiragana)}>{getKanaDisplay(option, kanaMode)}</button>)}</div>}<div className="mt-5 flex gap-2"><button className={primaryButton()} onClick={submitQuiz}>提交</button><button className={secondaryButton()} onClick={nextQuiz}>下一題</button></div>{quizResult ? <p className="mt-4 text-sm text-neutral-700">{quizResult}</p> : null}</div></Card>
      </Shell>
    );
  }

  function VocabularyView() {
    return <Shell><Card><h2 className="text-xl font-semibold">{vocabEditingId ? "編輯單字" : "新增單字"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="表記" required value={vocabForm.writing} onChange={(value) => updateForm(setVocabForm, vocabForm, "writing", value)} /><Field label="假名讀音" required value={vocabForm.reading_kana} onChange={(value) => updateForm(setVocabForm, vocabForm, "reading_kana", value)} /><Field label="羅馬拼音" value={vocabForm.romaji} onChange={(value) => updateForm(setVocabForm, vocabForm, "romaji", value)} /><Field label="中文意思" required value={vocabForm.meaning_zh} onChange={(value) => updateForm(setVocabForm, vocabForm, "meaning_zh", value)} /><SelectField label="詞性" value={vocabForm.part_of_speech} onChange={(value) => updateForm(setVocabForm, vocabForm, "part_of_speech", value)} options={PARTS_OF_SPEECH} /><SelectField label="熟練度" value={vocabForm.mastery} onChange={(value) => updateForm(setVocabForm, vocabForm, "mastery", value)} options={MASTERY_OPTIONS} /><Field label="標籤" value={vocabForm.tags} onChange={(value) => updateForm(setVocabForm, vocabForm, "tags", value)} placeholder="以逗號分隔" /><Field label="來源" value={vocabForm.source} onChange={(value) => updateForm(setVocabForm, vocabForm, "source", value)} /><div className="md:col-span-2"><Field label="例句" rows={3} value={vocabForm.example_sentence} onChange={(value) => updateForm(setVocabForm, vocabForm, "example_sentence", value)} /></div><div className="md:col-span-2"><Field label="個人筆記" rows={3} value={vocabForm.notes} onChange={(value) => updateForm(setVocabForm, vocabForm, "notes", value)} /></div></div><div className="mt-5 flex gap-2"><button className={primaryButton()} onClick={saveVocabulary}>儲存單字</button>{vocabEditingId ? <button className={secondaryButton()} onClick={() => { setVocabEditingId(null); setVocabForm(emptyVocabularyForm); }}>取消編輯</button> : null}</div></Card><Card className="mt-6"><div className="grid gap-3 md:grid-cols-5"><Field label="搜尋" value={vocabSearch} onChange={setVocabSearch} /><SelectField label="標籤" value={vocabTagFilter} onChange={setVocabTagFilter} options={["", ...allVocabTags]} /><SelectField label="詞性" value={vocabPosFilter} onChange={setVocabPosFilter} options={["All", ...PARTS_OF_SPEECH]} /><SelectField label="熟練度" value={vocabMasteryFilter} onChange={setVocabMasteryFilter} options={["All", ...MASTERY_OPTIONS]} /><SelectField label="排序" value={vocabSort} onChange={setVocabSort} options={["updated_at", "created_at"]} /></div></Card><div className="mt-5 grid gap-4">{filteredVocabulary.length ? filteredVocabulary.map((item) => <Card key={item.id}><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h3 className="text-2xl font-semibold">{item.writing}</h3><p className="mt-1 text-sm text-neutral-500">{item.reading_kana} · {item.romaji} · {item.meaning_zh}</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{item.example_sentence}</p><p className="mt-2 text-xs text-neutral-400">{item.part_of_speech} · {item.mastery} · {item.tags.join(", ")} · updated {formatDate(item.updated_at)}</p></div><div className="flex flex-wrap gap-2 md:justify-end"><button className={secondaryButton()} onClick={() => editVocabulary(item)}>編輯</button><button className={secondaryButton()} onClick={() => addDraftFromVocabulary(item)}>加入 Anki</button><button className={dangerButton()} onClick={() => deleteVocabulary(item.id)}>刪除</button></div></div></Card>) : <EmptyState title="沒有符合條件的單字。" />}</div></Shell>;
  }

  function SentencesView() {
    return <Shell><Card><h2 className="text-xl font-semibold">{sentenceEditingId ? "編輯句子" : "新增句子"}</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><Field label="日文原句" required rows={3} value={sentenceForm.japanese_text} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "japanese_text", value)} /></div><Field label="振假名版" value={sentenceForm.furigana_text} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "furigana_text", value)} /><Field label="羅馬拼音" value={sentenceForm.romaji} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "romaji", value)} /><div className="md:col-span-2"><Field label="中文翻譯" required rows={3} value={sentenceForm.translation_zh} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "translation_zh", value)} /></div><Field label="文法重點" rows={3} value={sentenceForm.grammar_points} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "grammar_points", value)} /><Field label="句子結構說明" rows={3} value={sentenceForm.structure_notes} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "structure_notes", value)} /><Field label="標籤" value={sentenceForm.tags} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "tags", value)} /><Field label="來源" value={sentenceForm.source} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "source", value)} /><div className="md:col-span-2"><Field label="個人筆記" rows={3} value={sentenceForm.notes} onChange={(value) => updateForm(setSentenceForm, sentenceForm, "notes", value)} /></div></div><div className="mt-5 flex gap-2"><button className={primaryButton()} onClick={saveSentence}>儲存句子</button>{sentenceEditingId ? <button className={secondaryButton()} onClick={() => { setSentenceEditingId(null); setSentenceForm(emptySentenceForm); }}>取消編輯</button> : null}</div></Card><Card className="mt-6"><div className="grid gap-3 md:grid-cols-3"><Field label="搜尋" value={sentenceSearch} onChange={setSentenceSearch} /><SelectField label="標籤" value={sentenceTagFilter} onChange={setSentenceTagFilter} options={["", ...allSentenceTags]} /><SelectField label="排序" value={sentenceSort} onChange={setSentenceSort} options={["updated_at", "created_at"]} /></div></Card><div className="mt-5 grid gap-4">{filteredSentences.length ? filteredSentences.map((item) => <Card key={item.id}><h3 className="text-xl font-semibold leading-8">{item.japanese_text}</h3><p className="mt-2 text-sm leading-6 text-neutral-600">{item.translation_zh}</p>{item.grammar_points ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-500">{item.grammar_points}</p> : null}<p className="mt-2 text-xs text-neutral-400">{item.tags.join(", ")} · updated {formatDate(item.updated_at)}</p><div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButton()} onClick={() => editSentence(item)}>編輯</button><button className={secondaryButton()} onClick={() => addDraftFromSentence(item)}>加入 Anki</button><button className={secondaryButton()} onClick={() => router.push(`/language-comparison?ja=${encodeURIComponent(item.japanese_text)}&zh=${encodeURIComponent(item.translation_zh)}`)}>在語言比較工作台開啟</button><button className={dangerButton()} onClick={() => deleteSentence(item.id)}>刪除</button></div></Card>) : <EmptyState title="沒有符合條件的句子。" />}</div></Shell>;
  }

  function AnalysisView() {
    return <Shell><Card><h2 className="text-xl font-semibold">手動句子分析</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><Field label="日文原句" required rows={3} value={analysisForm.japanese_text} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "japanese_text", value)} /></div><Field label="振假名版" value={analysisForm.furigana_text} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "furigana_text", value)} /><Field label="羅馬拼音" value={analysisForm.romaji} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "romaji", value)} /><Field label="中文翻譯" rows={2} value={analysisForm.translation_zh} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "translation_zh", value)} /><Field label="句子主幹" rows={2} value={analysisForm.sentence_core} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "sentence_core", value)} /><Field label="整體文法說明" rows={3} value={analysisForm.grammar_notes} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "grammar_notes", value)} /><Field label="來源" value={analysisForm.source} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "source", value)} /><Field label="標籤" value={analysisForm.tags} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "tags", value)} /><Field label="個人筆記" rows={3} value={analysisForm.notes} onChange={(value) => updateForm(setAnalysisForm, analysisForm, "notes", value)} /></div></Card><Card className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">詞語分析列</h2><button className={secondaryButton()} onClick={() => setAnalysisItems([...analysisItems, { ...emptyAnalysisItem, display_order: analysisItems.length }])}>新增分析列</button></div><div className="mt-4 grid gap-4">{analysisItems.map((item, index) => <div key={index} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><div className="grid gap-3 md:grid-cols-4">{(["original_text", "reading", "dictionary_form", "part_of_speech", "meaning_zh", "grammar_function", "notes"] as const).map((key) => <Field key={key} label={key} value={item[key]} onChange={(value) => setAnalysisItems(analysisItems.map((current, itemIndex) => itemIndex === index ? { ...current, [key]: value } : current))} />)}</div><div className="mt-3 flex flex-wrap gap-2"><button className={secondaryButton()} onClick={() => setAnalysisItems(moveItem(analysisItems, index, Math.max(0, index - 1)))}>上移</button><button className={secondaryButton()} onClick={() => setAnalysisItems(moveItem(analysisItems, index, Math.min(analysisItems.length - 1, index + 1)))}>下移</button><button className={secondaryButton()} onClick={() => { setVocabForm({ ...emptyVocabularyForm, writing: item.original_text, reading_kana: item.reading, meaning_zh: item.meaning_zh, part_of_speech: item.part_of_speech || "名詞" }); setActiveView("vocabulary"); }}>詞語加入單字庫</button><button className={dangerButton()} onClick={() => setAnalysisItems(analysisItems.filter((_, itemIndex) => itemIndex !== index))}>刪除</button></div></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button className={primaryButton()} onClick={() => saveAnalysis(false, false)}>儲存分析</button><button className={secondaryButton()} onClick={() => saveAnalysis(true, false)}>儲存分析並存到句子庫</button><button className={secondaryButton()} onClick={() => saveAnalysis(true, true)}>儲存並加入 Anki</button></div></Card><div className="mt-5 grid gap-4">{analyses.map((item) => <Card key={item.id}><h3 className="text-lg font-semibold">{item.japanese_text}</h3><p className="mt-2 text-sm text-neutral-500">{item.translation_zh}</p></Card>)}</div></Shell>;
  }

  function AnkiView() {
    return <Shell><Card><h2 className="text-xl font-semibold">自訂卡片</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="正面" required rows={3} value={customCard.front} onChange={(value) => setCustomCard({ ...customCard, front: value })} /><Field label="背面" required rows={3} value={customCard.back} onChange={(value) => setCustomCard({ ...customCard, back: value })} /><Field label="標籤" value={customCard.tags} onChange={(value) => setCustomCard({ ...customCard, tags: value })} /></div><button className={`${primaryButton()} mt-4`} onClick={saveCustomCard}>新增自訂卡</button></Card><Card className="mt-6"><div className="grid gap-3 md:grid-cols-4"><Field label="搜尋" value={ankiSearch} onChange={setAnkiSearch} /><SelectField label="狀態" value={ankiStatusFilter} onChange={setAnkiStatusFilter} options={["All", ...ANKI_STATUSES]} /><SelectField label="批次狀態" value="待處理" onChange={(value) => batchDraftStatus(value as AnkiStatus)} options={ANKI_STATUSES} /><button className={secondaryButton(" mt-7")} onClick={() => exportCsv(true)}>CSV 匯出並標記</button></div></Card><div className="mt-5 grid gap-4">{filteredDrafts.length ? filteredDrafts.map((draft) => <Card key={draft.id}><div className="flex items-start gap-3"><input type="checkbox" checked={selectedDraftIds.includes(draft.id)} onChange={(event) => setSelectedDraftIds(event.target.checked ? [...selectedDraftIds, draft.id] : selectedDraftIds.filter((id) => id !== draft.id))} /><div className="min-w-0 flex-1"><p className="text-xs text-neutral-400">{draft.card_type} · {draft.status}</p><textarea value={draft.front} onChange={(event) => updateDraft(draft.id, { front: event.target.value })} className="mt-2 w-full rounded-2xl border border-neutral-300 px-3 py-2 text-sm" rows={2} /><textarea value={draft.back} onChange={(event) => updateDraft(draft.id, { back: event.target.value })} className="mt-2 w-full rounded-2xl border border-neutral-300 px-3 py-2 text-sm" rows={4} /><div className="mt-2 flex flex-wrap gap-2">{ANKI_STATUSES.map((status) => <button key={status} className={secondaryButton(draft.status === status ? " border-neutral-950" : "")} onClick={() => updateDraft(draft.id, { status })}>{status}</button>)}<button className={dangerButton()} onClick={() => deleteDraft(draft.id)}>刪除</button></div></div></div></Card>) : <EmptyState title="沒有 Anki 草稿。" />}</div></Shell>;
  }

  function ComparisonView() {
    const panelClass = comparisonLayout === "side" ? "grid gap-4 xl:grid-cols-4" : "grid gap-4";
    return <Shell><Card><h2 className="text-xl font-semibold">{comparisonEditingId ? "編輯比較項目" : "新增比較項目"}</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><Field label="標題" required value={comparisonForm.title} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "title", value)} /><SelectField label="比較類型" value={comparisonForm.comparison_type} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "comparison_type", value)} options={COMPARISON_TYPES} /><Field label="標籤" value={comparisonForm.tags} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "tags", value)} /></div><div className={`${panelClass} mt-5`}>{visibleLanguages.chinese ? <Field label="中文" rows={6} value={comparisonForm.chinese_text} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "chinese_text", value)} /> : null}{visibleLanguages.english ? <Field label="英文" rows={6} value={comparisonForm.english_text} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "english_text", value)} /> : null}{visibleLanguages.german ? <Field label="德文" rows={6} value={comparisonForm.german_text} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "german_text", value)} /> : null}{visibleLanguages.japanese ? <Field label="日文" rows={6} value={comparisonForm.japanese_text} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "japanese_text", value)} /> : null}</div><div className="mt-4 grid gap-4 md:grid-cols-2">{visibleLanguages.furigana ? <Field label="日文振假名版" value={comparisonForm.japanese_furigana} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "japanese_furigana", value)} /> : null}{visibleLanguages.romaji ? <Field label="日文羅馬拼音" value={comparisonForm.japanese_romaji} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "japanese_romaji", value)} /> : null}<Field label="來源" value={comparisonForm.source} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "source", value)} /><Field label="整體筆記" rows={3} value={comparisonForm.notes} onChange={(value) => updateForm(setComparisonForm, comparisonForm, "notes", value)} /></div><div className="mt-5 flex flex-wrap gap-2">{Object.entries(visibleLanguages).map(([key, checked]) => <label key={key} className={secondaryButton()}><input className="mr-2" type="checkbox" checked={checked} onChange={(event) => setVisibleLanguages({ ...visibleLanguages, [key]: event.target.checked })} />{key}</label>)}<button className={secondaryButton()} onClick={() => setComparisonLayout(comparisonLayout === "side" ? "stack" : "side")}>{comparisonLayout === "side" ? "上下模式" : "並排模式"}</button></div></Card><Card className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">手動語詞對齊</h2><button className={secondaryButton()} onClick={() => setAlignmentDrafts([...alignmentDrafts, { display_order: alignmentDrafts.length }])}>新增對齊組</button></div><div className="mt-4 grid gap-4">{alignmentDrafts.map((item, index) => <div key={index} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"><div className="grid gap-3 md:grid-cols-5">{(["chinese_term", "english_term", "german_term", "japanese_term", "note"] as const).map((key) => <Field key={key} label={key} value={String(item[key] ?? "")} onChange={(value) => setAlignmentDrafts(alignmentDrafts.map((current, itemIndex) => itemIndex === index ? { ...current, [key]: value } : current))} />)}</div><div className="mt-3 flex flex-wrap gap-2"><button className={secondaryButton()} onClick={() => setAlignmentDrafts(moveItem(alignmentDrafts, index, Math.max(0, index - 1)))}>上移</button><button className={secondaryButton()} onClick={() => setAlignmentDrafts(moveItem(alignmentDrafts, index, Math.min(alignmentDrafts.length - 1, index + 1)))}>下移</button>{item.japanese_term ? <button className={secondaryButton()} onClick={() => router.push(`/languages/ja/vocabulary?writing=${encodeURIComponent(item.japanese_term ?? "")}`)}>加入日文單字庫</button> : null}<button className={dangerButton()} onClick={() => setAlignmentDrafts(alignmentDrafts.filter((_, itemIndex) => itemIndex !== index))}>刪除</button></div></div>)}</div><div className="mt-5 flex gap-2"><button className={primaryButton()} onClick={saveComparison}>儲存比較項目</button>{comparisonEditingId ? <button className={secondaryButton()} onClick={() => { setComparisonEditingId(null); setComparisonForm(emptyComparisonForm); setAlignmentDrafts([]); }}>取消編輯</button> : null}</div></Card><Card className="mt-6"><div className="grid gap-3 md:grid-cols-4"><Field label="搜尋" value={comparisonSearch} onChange={setComparisonSearch} /><SelectField label="類型" value={comparisonTypeFilter} onChange={setComparisonTypeFilter} options={["All", ...COMPARISON_TYPES]} /><SelectField label="標籤" value={comparisonTagFilter} onChange={setComparisonTagFilter} options={["", ...allComparisonTags]} /><SelectField label="排序" value={comparisonSort} onChange={setComparisonSort} options={["updated_at", "created_at"]} /></div></Card><div className="mt-5 grid gap-4">{filteredComparisons.length ? filteredComparisons.map((item) => <Card key={item.id}><h3 className="text-xl font-semibold">{item.title}</h3><p className="mt-1 text-xs text-neutral-400">{item.comparison_type} · {item.tags.join(", ")} · updated {formatDate(item.updated_at)}</p><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{item.chinese_text ? <p className="rounded-2xl bg-neutral-50 p-3 text-sm leading-6">{item.chinese_text}</p> : null}{item.english_text ? <p className="rounded-2xl bg-neutral-50 p-3 text-sm leading-6">{item.english_text}</p> : null}{item.german_text ? <p className="rounded-2xl bg-neutral-50 p-3 text-sm leading-6">{item.german_text}</p> : null}{item.japanese_text ? <p className="rounded-2xl bg-neutral-50 p-3 text-sm leading-6">{item.japanese_text}</p> : null}</div>{(item.term_alignments ?? []).length ? <div className="mt-4 grid gap-2">{(item.term_alignments ?? []).toSorted((a, b) => a.display_order - b.display_order).map((alignment) => <p key={alignment.id} className="text-sm text-neutral-600">{alignment.chinese_term} / {alignment.english_term} / {alignment.german_term} / {alignment.japanese_term} - {alignment.note}</p>)}</div> : null}<div className="mt-4 flex flex-wrap gap-2"><button className={secondaryButton()} onClick={() => editComparison(item)}>編輯</button><button className={secondaryButton()} onClick={() => copyComparison(item)}>複製</button><button className={secondaryButton()} onClick={() => saveComparisonAsSentence(item)}>存入日文句子庫</button><button className={dangerButton()} onClick={() => deleteComparison(item.id)}>刪除</button></div></Card>) : <EmptyState title="沒有符合條件的比較項目。" />}</div></Shell>;
  }

  if (activeView === "home") return <HomeView />;
  if (activeView === "kana") return <KanaView />;
  if (activeView === "vocabulary") return <VocabularyView />;
  if (activeView === "sentences") return <SentencesView />;
  if (activeView === "analysis") return <AnalysisView />;
  if (activeView === "anki") return <AnkiView />;
  return <ComparisonView />;
}
