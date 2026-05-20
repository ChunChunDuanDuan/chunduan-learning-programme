"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type Language = "English" | "Deutsch" | "Русский";
type AddMode = "single" | "all";

type SentenceItem = {
  id: string;
  language: string | null;
  source_zh: string | null;
  target_sentence: string | null;
  translation_zh: string | null;
  explanation: string | null;
  notes: string | null;
  created_at: string;

  chinese: string | null;
  english: string | null;
  german: string | null;
  russian: string | null;
  mode: string | null;
};

type SentenceAIResult = {
  target_sentence: string;
  translation_zh: string;
  explanation: string;
  notes: string;
};

type SentenceAllAIResult = {
  english: string;
  german: string;
  russian: string;
  explanation?: string;
  notes?: string;
};
type RandomSentenceAIResult = {
  chinese: string;
  target_sentence: string;
  translation_zh: string;
  explanation: string;
  notes: string;
  english: string;
  german: string;
  russian: string;
};

const languages: Language[] = ["English", "Deutsch", "Русский"];

function languageToColumn(language: string) {
  if (language === "English") return "english";
  if (language === "Deutsch") return "german";
  if (language === "Русский") return "russian";
  return "english";
}

function languageToSpeechLabel(language: string) {
  if (language === "English") return "English";
  if (language === "Deutsch") return "German";
  if (language === "Русский") return "Russian";
  return "English";
}
function languageToApiValue(language: string) {
  if (language === "English") return "English";
  if (language === "Deutsch") return "Deutsch";
  if (language === "Русский") return "Русский";
  return "English";
}

function getTextByLanguage(item: SentenceItem, language: string) {
  if (item.mode === "all") {
    if (language === "English") return item.english ?? "";
    if (language === "Deutsch") return item.german ?? "";
    if (language === "Русский") return item.russian ?? "";
    return "";
  }

  return item.target_sentence ?? "";
}

function getVisibleLanguages(item: SentenceItem, languageFilter: string) {
  if (item.mode !== "all") {
    return [item.language ?? "English"];
  }

  if (languageFilter === "All") {
    return languages;
  }

  return [languageFilter as Language];
}

export default function SentencesPage() {
  const [items, setItems] = useState<SentenceItem[]>([]);

  const [addMode, setAddMode] = useState<AddMode>("single");
  const [language, setLanguage] = useState<Language>("English");

  const [sourceZh, setSourceZh] = useState("");
  const [targetSentence, setTargetSentence] = useState("");
  const [translationZh, setTranslationZh] = useState("");
  const [explanation, setExplanation] = useState("");
  const [notes, setNotes] = useState("");

  const [allEnglish, setAllEnglish] = useState("");
  const [allGerman, setAllGerman] = useState("");
  const [allRussian, setAllRussian] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<AddMode>("single");
  const [editLanguage, setEditLanguage] = useState<Language>("English");
  const [editSourceZh, setEditSourceZh] = useState("");
  const [editTargetSentence, setEditTargetSentence] = useState("");
  const [editTranslationZh, setEditTranslationZh] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editEnglish, setEditEnglish] = useState("");
  const [editGerman, setEditGerman] = useState("");
  const [editRussian, setEditRussian] = useState("");

  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [speechLoadingKey, setSpeechLoadingKey] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      setLoading(false);
      return;
    }

    if (!user) {
      console.log("No user logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("sentences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load error:", error);
    } else {
      setItems((data ?? []) as SentenceItem[]);
    }

    setLoading(false);
  }

  async function generateDraftExplanation() {
    if (!sourceZh.trim()) {
      alert("Please enter a Chinese prompt first.");
      return;
    }

    setGenerating(true);

    // 先清掉舊結果，避免英文殘留
    setTargetSentence("");
    setTranslationZh("");
    setExplanation("");
    setNotes("");

    try {
      const selectedLanguage = languageToApiValue(language);

      const response = await fetch("/api/explain-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage,
          source_zh: sourceZh.trim(),
          target_sentence: "",
          translation_zh: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to generate sentence: ${data.error ?? "Unknown error"}`);
        setGenerating(false);
        return;
      }

      const result = data as SentenceAIResult;

      setTargetSentence(result.target_sentence ?? "");
      setTranslationZh(result.translation_zh ?? "");
      setExplanation(result.explanation ?? "");
      setNotes(result.notes ?? "");
    } catch (error) {
      console.error("Generate sentence error:", error);
      alert("Failed to generate sentence.");
    }

    setGenerating(false);
  }
  async function clearGeneratedFields() {
    setTargetSentence("");
    setTranslationZh("");
    setExplanation("");
    setNotes("");
    setAllEnglish("");
    setAllGerman("");
    setAllRussian("");
  }
  async function generateAllLanguages() {
    if (!sourceZh.trim()) {
      alert("Please enter a Chinese prompt first.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/ai/translate-sentence-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chinese: sourceZh.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to generate sentences: ${data.error ?? "Unknown error"}`);
        setGenerating(false);
        return;
      }

      const result = data as SentenceAllAIResult;

      setAllEnglish(result.english ?? "");
      setAllGerman(result.german ?? "");
      setAllRussian(result.russian ?? "");
      setExplanation(result.explanation ?? "");
      setNotes(result.notes ?? "");
    } catch (error) {
      console.error("Generate all languages error:", error);
      alert("Failed to generate all language sentences.");
    }

    setGenerating(false);
  }
  async function generateRandomSentence() {
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/random-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: addMode,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to generate random sentence: ${data.error ?? "Unknown error"}`);
        setGenerating(false);
        return;
      }

      const result = data as RandomSentenceAIResult;

      if (addMode === "single") {
        setSourceZh(result.chinese ?? result.translation_zh ?? "");
        setTargetSentence(result.target_sentence ?? "");
        setTranslationZh(result.translation_zh ?? result.chinese ?? "");
        setExplanation(result.explanation ?? "");
        setNotes(result.notes ?? "");
      }

      if (addMode === "all") {
        setSourceZh(result.chinese ?? "");
        setAllEnglish(result.english ?? "");
        setAllGerman(result.german ?? "");
        setAllRussian(result.russian ?? "");
        setTranslationZh(result.chinese ?? "");
        setExplanation(result.explanation ?? "");
        setNotes(result.notes ?? "");
      }
    } catch (error) {
      console.error("Generate random sentence error:", error);
      alert("Failed to generate random sentence.");
    }

    setGenerating(false);
  }
  async function saveItem() {
    if (addMode === "single" && !targetSentence.trim()) {
      alert("Please enter a target sentence.");
      return;
    }

    if (addMode === "all" && !sourceZh.trim()) {
      alert("Please enter a Chinese prompt.");
      return;
    }

    if (
      addMode === "all" &&
      !allEnglish.trim() &&
      !allGerman.trim() &&
      !allRussian.trim()
    ) {
      alert("Please generate or enter at least one language sentence.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      alert("User error.");
      setSaving(false);
      return;
    }

    if (!user) {
      alert("You need to log in first.");
      setSaving(false);
      return;
    }

    let insertPayload: Record<string, string> = {
      user_id: user.id,
      source_zh: sourceZh.trim(),
      translation_zh: translationZh.trim(),
      explanation: explanation.trim(),
      notes: notes.trim(),
      chinese: sourceZh.trim(),
      mode: addMode,
    };

    if (addMode === "single") {
      const targetColumn = languageToColumn(language);

      insertPayload = {
        ...insertPayload,
        language,
        target_sentence: targetSentence.trim(),
        [targetColumn]: targetSentence.trim(),
      };
    }

    if (addMode === "all") {
      insertPayload = {
        ...insertPayload,
        language: "All",
        target_sentence:
          allEnglish.trim() || allGerman.trim() || allRussian.trim(),
        translation_zh: sourceZh.trim(),
        english: allEnglish.trim(),
        german: allGerman.trim(),
        russian: allRussian.trim(),
      };
    }

    const { error } = await supabase.from("sentences").insert(insertPayload);

    if (error) {
      console.error("Save error:", error);
      alert("Failed to save sentence.");
      setSaving(false);
      return;
    }

    setSourceZh("");
    setTargetSentence("");
    setTranslationZh("");
    setExplanation("");
    setNotes("");
    setAllEnglish("");
    setAllGerman("");
    setAllRussian("");

    await loadItems();
    setShowAddForm(false);
    setSaving(false);
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sentence?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("sentences").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete sentence.");
      return;
    }

    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  async function explainSavedItem(item: SentenceItem) {
    if (item.mode === "all") {
      alert("AI Explain is currently for single-language cards only.");
      return;
    }

    setExplainingId(item.id);

    try {
      const response = await fetch("/api/explain-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: languageToApiValue(item.language ?? "English"),
          source_zh: item.source_zh ?? "",
          target_sentence: item.target_sentence ?? "",
          translation_zh: item.translation_zh ?? "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to generate explanation: ${data.error ?? "Unknown error"}`);
        setExplainingId(null);
        return;
      }

      const result = data as SentenceAIResult;

      const targetColumn = languageToColumn(item.language ?? "English");

      const { error } = await supabase
        .from("sentences")
        .update({
          target_sentence: result.target_sentence.trim(),
          translation_zh: result.translation_zh.trim(),
          explanation: result.explanation.trim(),
          notes: result.notes.trim(),
          [targetColumn]: result.target_sentence.trim(),
        })
        .eq("id", item.id);

      if (error) {
        console.error("Update AI explanation error:", error);
        alert("Generated explanation, but failed to save it.");
        setExplainingId(null);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
              ...currentItem,
              target_sentence: result.target_sentence.trim(),
              translation_zh: result.translation_zh.trim(),
              explanation: result.explanation.trim(),
              notes: result.notes.trim(),
              [targetColumn]: result.target_sentence.trim(),
            }
            : currentItem
        )
      );
    } catch (error) {
      console.error("Explain saved sentence error:", error);
      alert("Failed to generate explanation.");
    }

    setExplainingId(null);
  }

  async function playSpeech(text: string, language: string, key: string) {
    if (!text.trim()) {
      alert("There is no sentence to play.");
      return;
    }

    setSpeechLoadingKey(key);

    try {
      const response = await fetch("/api/ai/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          language: languageToSpeechLabel(language),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        alert(`Failed to generate audio: ${data?.error ?? "Unknown error"}`);
        setSpeechLoadingKey(null);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Speech error:", error);
      alert("Failed to play audio.");
    }

    setSpeechLoadingKey(null);
  }

  function startEdit(item: SentenceItem) {
    const isAll = item.mode === "all";

    setEditingId(item.id);
    setEditMode(isAll ? "all" : "single");

    setEditLanguage((item.language as Language) ?? "English");
    setEditSourceZh(item.chinese ?? item.source_zh ?? "");
    setEditTargetSentence(item.target_sentence ?? "");
    setEditTranslationZh(item.translation_zh ?? "");
    setEditExplanation(item.explanation ?? "");
    setEditNotes(item.notes ?? "");

    setEditEnglish(item.english ?? "");
    setEditGerman(item.german ?? "");
    setEditRussian(item.russian ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditMode("single");
    setEditLanguage("English");
    setEditSourceZh("");
    setEditTargetSentence("");
    setEditTranslationZh("");
    setEditExplanation("");
    setEditNotes("");
    setEditEnglish("");
    setEditGerman("");
    setEditRussian("");
  }

  async function updateItem(id: string) {
    if (editMode === "single" && !editTargetSentence.trim()) {
      alert("Please enter a target sentence.");
      return;
    }

    if (
      editMode === "all" &&
      !editEnglish.trim() &&
      !editGerman.trim() &&
      !editRussian.trim()
    ) {
      alert("Please enter at least one language sentence.");
      return;
    }

    let updatePayload: Record<string, string> = {
      source_zh: editSourceZh.trim(),
      translation_zh: editTranslationZh.trim(),
      explanation: editExplanation.trim(),
      notes: editNotes.trim(),
      chinese: editSourceZh.trim(),
      mode: editMode,
    };

    if (editMode === "single") {
      const targetColumn = languageToColumn(editLanguage);

      updatePayload = {
        ...updatePayload,
        language: editLanguage,
        target_sentence: editTargetSentence.trim(),
        [targetColumn]: editTargetSentence.trim(),
      };
    }

    if (editMode === "all") {
      updatePayload = {
        ...updatePayload,
        language: "All",
        target_sentence:
          editEnglish.trim() || editGerman.trim() || editRussian.trim(),
        translation_zh: editSourceZh.trim(),
        english: editEnglish.trim(),
        german: editGerman.trim(),
        russian: editRussian.trim(),
      };
    }

    const { error } = await supabase
      .from("sentences")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update sentence.");
      return;
    }

    await loadItems();
    cancelEdit();
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const keyword = searchText.toLowerCase();

      const searchableText = [
        item.source_zh,
        item.target_sentence,
        item.translation_zh,
        item.explanation,
        item.notes,
        item.chinese,
        item.english,
        item.german,
        item.russian,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(keyword);

      const matchesLanguage =
        languageFilter === "All" ||
        item.mode === "all" ||
        item.language === languageFilter;

      return matchesSearch && matchesLanguage;
    });
  }, [items, searchText, languageFilter]);

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Language Module
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Sentence Practice
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Generate sentences from Chinese prompts, save multilingual versions,
            and practise listening with AI audio.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Add sentence</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Choose single-language generation or generate all languages from
                one Chinese prompt.
              </p>
            </div>

            <button
              onClick={() => setShowAddForm((prev) => !prev)}
              className="rounded-2xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              {showAddForm ? "Close" : "Add"}
            </button>
          </div>

          {showAddForm && (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Add mode
                </label>

                <select
                  value={addMode}
                  onChange={(event) => setAddMode(event.target.value as AddMode)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                >
                  <option value="single">Single language</option>
                  <option value="all">All languages</option>
                </select>
              </div>

              {addMode === "single" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Language
                  </label>

                  <select
                    value={language}
                    onChange={(event) => {
                      setLanguage(event.target.value as Language);
                      clearGeneratedFields();
                    }}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Chinese prompt
                </label>

                <textarea
                  value={sourceZh}
                  onChange={(event) => setSourceZh(event.target.value)}
                  placeholder="例如：我到時候再看看吧。"
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {addMode === "single" ? (
                  <button
                    onClick={generateDraftExplanation}
                    disabled={generating || saving}
                    className="rounded-2xl border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {generating ? "Generating..." : "Generate sentence with AI"}
                  </button>
                ) : (
                  <button
                    onClick={generateAllLanguages}
                    disabled={generating || saving}
                    className="rounded-2xl border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
                  >
                    {generating
                      ? "Generating..."
                      : "Generate English + Deutsch + Русский"}
                  </button>
                )}

                <button
                  onClick={generateRandomSentence}
                  disabled={generating || saving}
                  className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {generating ? "Generating..." : "Generate random sentence"}
                </button>
              </div>

              {addMode === "single" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Target sentence
                    </label>

                    <textarea
                      value={targetSentence}
                      onChange={(event) => setTargetSentence(event.target.value)}
                      placeholder="AI will generate the target sentence here."
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Chinese translation
                    </label>

                    <textarea
                      value={translationZh}
                      onChange={(event) => setTranslationZh(event.target.value)}
                      placeholder="中文翻譯，可先留空"
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </>
              )}

              {addMode === "all" && (
                <div className="grid gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      English
                    </label>

                    <textarea
                      value={allEnglish}
                      onChange={(event) => setAllEnglish(event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Deutsch
                    </label>

                    <textarea
                      value={allGerman}
                      onChange={(event) => setAllGerman(event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                      Русский
                    </label>

                    <textarea
                      value={allRussian}
                      onChange={(event) => setAllRussian(event.target.value)}
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Explanation
                </label>

                <textarea
                  value={explanation}
                  onChange={(event) => setExplanation(event.target.value)}
                  placeholder="Grammar, usage, structure, or word-by-word explanation..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Personal notes..."
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <button
                onClick={saveItem}
                disabled={saving || generating}
                className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save sentence"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Saved sentences</h2>

              <p className="mt-1 text-sm text-neutral-500">
                {filteredItems.length === items.length
                  ? `${items.length} items`
                  : `${filteredItems.length} / ${items.length} items`}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search sentences..."
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm"
              />

              <select
                value={languageFilter}
                onChange={(event) => setLanguageFilter(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm"
              >
                <option value="All">All languages</option>

                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p className="mt-4 text-neutral-500">Loading...</p>}

          {!loading && items.length === 0 && (
            <p className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
              No sentences yet.
            </p>
          )}

          {!loading && items.length > 0 && filteredItems.length === 0 && (
            <p className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
              No matching sentences.
            </p>
          )}

          <div className="mt-5 grid gap-4">
            {filteredItems.map((item) => {
              const visibleLanguages = getVisibleLanguages(item, languageFilter);

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        {item.mode === "all"
                          ? "All languages"
                          : item.language ?? "English"}
                      </span>

                      <span className="text-xs text-neutral-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {editingId !== item.id && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.mode !== "all" && (
                          <button
                            onClick={() => explainSavedItem(item)}
                            disabled={explainingId === item.id}
                            className="rounded-xl border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                          >
                            {explainingId === item.id
                              ? "Explaining..."
                              : "AI Explain"}
                          </button>
                        )}

                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-xl border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="rounded-xl border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {editingId === item.id ? (
                    <div className="mt-5 grid gap-4">
                      <select
                        value={editMode}
                        onChange={(event) =>
                          setEditMode(event.target.value as AddMode)
                        }
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      >
                        <option value="single">Single language</option>
                        <option value="all">All languages</option>
                      </select>

                      {editMode === "single" && (
                        <select
                          value={editLanguage}
                          onChange={(event) =>
                            setEditLanguage(event.target.value as Language)
                          }
                          className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                        >
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      )}

                      <textarea
                        value={editSourceZh}
                        onChange={(event) => setEditSourceZh(event.target.value)}
                        placeholder="Chinese prompt"
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      {editMode === "single" ? (
                        <>
                          <textarea
                            value={editTargetSentence}
                            onChange={(event) =>
                              setEditTargetSentence(event.target.value)
                            }
                            placeholder="Target sentence"
                            rows={3}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                          />

                          <textarea
                            value={editTranslationZh}
                            onChange={(event) =>
                              setEditTranslationZh(event.target.value)
                            }
                            placeholder="Chinese translation"
                            rows={3}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                          />
                        </>
                      ) : (
                        <>
                          <textarea
                            value={editEnglish}
                            onChange={(event) =>
                              setEditEnglish(event.target.value)
                            }
                            placeholder="English"
                            rows={3}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                          />

                          <textarea
                            value={editGerman}
                            onChange={(event) =>
                              setEditGerman(event.target.value)
                            }
                            placeholder="Deutsch"
                            rows={3}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                          />

                          <textarea
                            value={editRussian}
                            onChange={(event) =>
                              setEditRussian(event.target.value)
                            }
                            placeholder="Русский"
                            rows={3}
                            className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                          />
                        </>
                      )}

                      <textarea
                        value={editExplanation}
                        onChange={(event) =>
                          setEditExplanation(event.target.value)
                        }
                        placeholder="Explanation"
                        rows={4}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editNotes}
                        onChange={(event) => setEditNotes(event.target.value)}
                        placeholder="Notes"
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateItem(item.id)}
                          className="rounded-xl bg-neutral-950 px-4 py-2 text-xs font-medium text-white"
                        >
                          Save changes
                        </button>

                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-4">
                      {(item.chinese || item.source_zh) && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Chinese prompt
                          </p>

                          <p className="mt-2 text-sm leading-6 text-neutral-500">
                            {item.chinese ?? item.source_zh}
                          </p>
                        </div>
                      )}

                      {visibleLanguages.map((visibleLanguage) => {
                        const sentenceText = getTextByLanguage(
                          item,
                          visibleLanguage
                        );

                        if (!sentenceText) return null;

                        const speechKey = `${item.id}-${visibleLanguage}`;

                        return (
                          <div
                            key={visibleLanguage}
                            className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                {visibleLanguage}
                              </p>

                              <button
                                onClick={() =>
                                  playSpeech(
                                    sentenceText,
                                    visibleLanguage,
                                    speechKey
                                  )
                                }
                                disabled={speechLoadingKey === speechKey}
                                className="rounded-xl border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                              >
                                {speechLoadingKey === speechKey
                                  ? "Loading..."
                                  : "Play audio"}
                              </button>
                            </div>

                            <h3 className="text-xl font-semibold leading-8 text-neutral-950">
                              {sentenceText}
                            </h3>
                          </div>
                        );
                      })}

                      {item.mode !== "all" && item.translation_zh && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Chinese translation
                          </p>

                          <p className="mt-2 text-sm leading-6 text-neutral-500">
                            {item.translation_zh}
                          </p>
                        </div>
                      )}

                      {item.explanation && (
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Explanation
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                            {item.explanation}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Notes
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}