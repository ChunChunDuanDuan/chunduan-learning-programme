"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type VocabularyDirection = "zh-to-target" | "target-to-zh";

type VocabularyItem = {
  id: string;
  user_id: string;
  language: string;
  direction: VocabularyDirection | null;
  prompt_zh: string | null;
  word: string;
  meaning_zh: string | null;
  part_of_speech: string | null;
  example_sentence: string | null;
  example_translation_zh: string | null;
  usage_notes: string | null;
  notes: string | null;
  created_at: string;
};

type VocabularyAIResult = {
  word: string;
  meaning_zh: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation_zh: string;
  usage_notes: string;
  notes: string;
};

const languages = ["English", "Deutsch", "Русский"];

function getDirectionLabel(direction: VocabularyDirection) {
  if (direction === "zh-to-target") return "Chinese → target language";
  return "Target language → Chinese";
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);

  const [language, setLanguage] = useState("English");
  const [direction, setDirection] =
    useState<VocabularyDirection>("zh-to-target");

  const [promptZh, setPromptZh] = useState("");
  const [word, setWord] = useState("");
  const [meaningZh, setMeaningZh] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [exampleTranslationZh, setExampleTranslationZh] = useState("");
  const [usageNotes, setUsageNotes] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLanguage, setEditLanguage] = useState("English");
  const [editDirection, setEditDirection] =
    useState<VocabularyDirection>("zh-to-target");
  const [editPromptZh, setEditPromptZh] = useState("");
  const [editWord, setEditWord] = useState("");
  const [editMeaningZh, setEditMeaningZh] = useState("");
  const [editPartOfSpeech, setEditPartOfSpeech] = useState("");
  const [editExampleSentence, setEditExampleSentence] = useState("");
  const [editExampleTranslationZh, setEditExampleTranslationZh] = useState("");
  const [editUsageNotes, setEditUsageNotes] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [explainingId, setExplainingId] = useState<string | null>(null);

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
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load vocabulary error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else {
      setItems((data ?? []) as VocabularyItem[]);
    }

    setLoading(false);
  }

  async function generateVocabularyExplanation() {
    if (direction === "zh-to-target" && !promptZh.trim()) {
      alert("Please enter a Chinese prompt first.");
      return;
    }

    if (direction === "target-to-zh" && !word.trim()) {
      alert("Please enter a word or phrase first.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/explain-vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          direction,
          prompt_zh: promptZh,
          word,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to generate vocabulary: ${data.error ?? "Unknown error"}`);
        setGenerating(false);
        return;
      }

      const result = data as VocabularyAIResult;

      setWord(result.word ?? "");
      setMeaningZh(result.meaning_zh ?? "");
      setPartOfSpeech(result.part_of_speech ?? "");
      setExampleSentence(result.example_sentence ?? "");
      setExampleTranslationZh(result.example_translation_zh ?? "");
      setUsageNotes(result.usage_notes ?? "");
      setNotes(result.notes ?? "");
    } catch (error) {
      console.error("Generate vocabulary explanation error:", error);
      alert("Failed to generate vocabulary.");
    }

    setGenerating(false);
  }

  async function explainSavedItem(item: VocabularyItem) {
    setExplainingId(item.id);

    const itemDirection = item.direction ?? "zh-to-target";

    try {
      const response = await fetch("/api/explain-vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: item.language,
          direction: itemDirection,
          prompt_zh: item.prompt_zh ?? "",
          word: item.word,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Failed to explain vocabulary: ${data.error ?? "Unknown error"}`);
        setExplainingId(null);
        return;
      }

      const result = data as VocabularyAIResult;

      const { error } = await supabase
        .from("vocabulary")
        .update({
          direction: itemDirection,
          word: result.word.trim(),
          meaning_zh: result.meaning_zh.trim(),
          part_of_speech: result.part_of_speech.trim(),
          example_sentence: result.example_sentence.trim(),
          example_translation_zh: result.example_translation_zh.trim(),
          usage_notes: result.usage_notes.trim(),
          notes: result.notes.trim(),
        })
        .eq("id", item.id);

      if (error) {
        console.error("Update AI vocabulary error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });

        alert(`Generated explanation, but failed to save it: ${error.message}`);
        setExplainingId(null);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
              ...currentItem,
              direction: itemDirection,
              word: result.word.trim(),
              meaning_zh: result.meaning_zh.trim(),
              part_of_speech: result.part_of_speech.trim(),
              example_sentence: result.example_sentence.trim(),
              example_translation_zh: result.example_translation_zh.trim(),
              usage_notes: result.usage_notes.trim(),
              notes: result.notes.trim(),
            }
            : currentItem
        )
      );
    } catch (error) {
      console.error("Explain saved vocabulary error:", error);
      alert("Failed to explain vocabulary.");
    }

    setExplainingId(null);
  }

  async function saveItem() {
    if (direction === "zh-to-target" && !promptZh.trim()) {
      alert("Please enter a Chinese prompt.");
      return;
    }

    if (!word.trim()) {
      alert(
        direction === "zh-to-target"
          ? "Please generate or enter a target translation."
          : "Please enter a target-language word or phrase."
      );
      return;
    }

    if (direction === "target-to-zh" && !meaningZh.trim()) {
      alert("Please generate or enter a Chinese meaning.");
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

    const { error } = await supabase.from("vocabulary").insert({
      user_id: user.id,
      language,
      direction,
      prompt_zh: direction === "zh-to-target" ? promptZh.trim() : "",
      word: word.trim(),
      meaning_zh: meaningZh.trim(),
      part_of_speech: partOfSpeech.trim(),
      example_sentence: exampleSentence.trim(),
      example_translation_zh: exampleTranslationZh.trim(),
      usage_notes: usageNotes.trim(),
      notes: notes.trim(),
    });

    if (error) {
      console.error("Save vocabulary error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      alert(`Failed to save vocabulary: ${error.message}`);
      setSaving(false);
      return;
    }

    setPromptZh("");
    setWord("");
    setMeaningZh("");
    setPartOfSpeech("");
    setExampleSentence("");
    setExampleTranslationZh("");
    setUsageNotes("");
    setNotes("");

    await loadItems();
    setShowAddForm(false);
    setSaving(false);
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vocabulary item?"
    );

    if (!confirmed) return;

    const { error } = await supabase.from("vocabulary").delete().eq("id", id);

    if (error) {
      console.error("Delete vocabulary error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      alert(`Failed to delete vocabulary: ${error.message}`);
      return;
    }

    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  function startEdit(item: VocabularyItem) {
    setEditingId(item.id);
    setEditLanguage(item.language);
    setEditDirection(item.direction ?? "zh-to-target");
    setEditPromptZh(item.prompt_zh ?? "");
    setEditWord(item.word);
    setEditMeaningZh(item.meaning_zh ?? "");
    setEditPartOfSpeech(item.part_of_speech ?? "");
    setEditExampleSentence(item.example_sentence ?? "");
    setEditExampleTranslationZh(item.example_translation_zh ?? "");
    setEditUsageNotes(item.usage_notes ?? "");
    setEditNotes(item.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLanguage("English");
    setEditDirection("zh-to-target");
    setEditPromptZh("");
    setEditWord("");
    setEditMeaningZh("");
    setEditPartOfSpeech("");
    setEditExampleSentence("");
    setEditExampleTranslationZh("");
    setEditUsageNotes("");
    setEditNotes("");
  }

  async function updateItem(id: string) {
    if (editDirection === "zh-to-target" && !editPromptZh.trim()) {
      alert("Please enter a Chinese prompt.");
      return;
    }

    if (!editWord.trim()) {
      alert("Please enter a word or translation.");
      return;
    }

    if (editDirection === "target-to-zh" && !editMeaningZh.trim()) {
      alert("Please enter a Chinese meaning.");
      return;
    }

    const { error } = await supabase
      .from("vocabulary")
      .update({
        language: editLanguage,
        direction: editDirection,
        prompt_zh: editDirection === "zh-to-target" ? editPromptZh.trim() : "",
        word: editWord.trim(),
        meaning_zh: editMeaningZh.trim(),
        part_of_speech: editPartOfSpeech.trim(),
        example_sentence: editExampleSentence.trim(),
        example_translation_zh: editExampleTranslationZh.trim(),
        usage_notes: editUsageNotes.trim(),
        notes: editNotes.trim(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update vocabulary error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      alert(`Failed to update vocabulary: ${error.message}`);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
            ...item,
            language: editLanguage,
            direction: editDirection,
            prompt_zh:
              editDirection === "zh-to-target" ? editPromptZh.trim() : "",
            word: editWord.trim(),
            meaning_zh: editMeaningZh.trim(),
            part_of_speech: editPartOfSpeech.trim(),
            example_sentence: editExampleSentence.trim(),
            example_translation_zh: editExampleTranslationZh.trim(),
            usage_notes: editUsageNotes.trim(),
            notes: editNotes.trim(),
          }
          : item
      )
    );

    cancelEdit();
  }

  const filteredItems = items.filter((item) => {
    const keyword = searchText.toLowerCase();

    const matchesSearch =
      item.prompt_zh?.toLowerCase().includes(keyword) ||
      item.word.toLowerCase().includes(keyword) ||
      item.meaning_zh?.toLowerCase().includes(keyword) ||
      item.part_of_speech?.toLowerCase().includes(keyword) ||
      item.example_sentence?.toLowerCase().includes(keyword) ||
      item.example_translation_zh?.toLowerCase().includes(keyword) ||
      item.usage_notes?.toLowerCase().includes(keyword) ||
      item.notes?.toLowerCase().includes(keyword) ||
      item.direction?.toLowerCase().includes(keyword);

    const matchesLanguage =
      languageFilter === "All" || item.language === languageFilter;

    return matchesSearch && matchesLanguage;
  });

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
            Vocabulary
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Generate vocabulary in both directions: Chinese to target language,
            or target-language words back into Chinese.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Add vocabulary</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Use brackets like 規定性[黑格爾哲學] to specify context.
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
                  Direction
                </label>

                <select
                  value={direction}
                  onChange={(event) =>
                    setDirection(event.target.value as VocabularyDirection)
                  }
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                >
                  <option value="zh-to-target">
                    Chinese → target language
                  </option>
                  <option value="target-to-zh">
                    Target language → Chinese
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Language
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {direction === "zh-to-target" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Chinese prompt
                  </label>

                  <textarea
                    value={promptZh}
                    onChange={(event) => setPromptZh(event.target.value)}
                    placeholder="例如：規定性[黑格爾哲學]"
                    rows={3}
                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  {direction === "zh-to-target"
                    ? "Target translation candidates"
                    : "Original word or phrase"}
                </label>

                <textarea
                  value={word}
                  onChange={(event) => setWord(event.target.value)}
                  placeholder={
                    direction === "zh-to-target"
                      ? "AI will generate possible translations here."
                      : "Enter an English, German, or Russian word/phrase here."
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <button
                onClick={generateVocabularyExplanation}
                disabled={generating || saving}
                className="rounded-2xl border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
              >
                {generating
                  ? "Generating..."
                  : direction === "zh-to-target"
                    ? "Generate target vocabulary with AI"
                    : "Translate into Chinese with AI"}
              </button>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Chinese meaning
                </label>

                <textarea
                  value={meaningZh}
                  onChange={(event) => setMeaningZh(event.target.value)}
                  placeholder="中文意思"
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Part of speech
                </label>

                <input
                  value={partOfSpeech}
                  onChange={(event) => setPartOfSpeech(event.target.value)}
                  placeholder="noun, verb, adjective..."
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Example sentence
                </label>

                <textarea
                  value={exampleSentence}
                  onChange={(event) => setExampleSentence(event.target.value)}
                  placeholder="Example sentence in the selected language"
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Example translation
                </label>

                <textarea
                  value={exampleTranslationZh}
                  onChange={(event) =>
                    setExampleTranslationZh(event.target.value)
                  }
                  placeholder="例句中文翻譯"
                  rows={3}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Usage notes
                </label>

                <textarea
                  value={usageNotes}
                  onChange={(event) => setUsageNotes(event.target.value)}
                  placeholder="Usage, nuance, collocations..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Nuance comparison
                </label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Subtle differences between candidate translations or meanings..."
                  rows={4}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                />
              </div>

              <button
                onClick={saveItem}
                disabled={saving || generating}
                className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save vocabulary"}
              </button>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Saved vocabulary</h2>

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
                placeholder="Search vocabulary..."
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
              No vocabulary yet.
            </p>
          )}

          {!loading && items.length > 0 && filteredItems.length === 0 && (
            <p className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
              No matching vocabulary.
            </p>
          )}

          <div className="mt-5 grid gap-4">
            {filteredItems.map((item) => {
              const itemDirection = item.direction ?? "zh-to-target";

              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        {item.language}
                      </span>

                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                        {getDirectionLabel(itemDirection)}
                      </span>

                      {item.part_of_speech && (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                          {item.part_of_speech}
                        </span>
                      )}

                      <span className="text-xs text-neutral-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {editingId !== item.id && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => explainSavedItem(item)}
                          disabled={explainingId === item.id}
                          className="rounded-xl border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                        >
                          {explainingId === item.id
                            ? "Explaining..."
                            : "AI Explain"}
                        </button>

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
                        value={editDirection}
                        onChange={(event) =>
                          setEditDirection(
                            event.target.value as VocabularyDirection
                          )
                        }
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      >
                        <option value="zh-to-target">
                          Chinese → target language
                        </option>
                        <option value="target-to-zh">
                          Target language → Chinese
                        </option>
                      </select>

                      <select
                        value={editLanguage}
                        onChange={(event) =>
                          setEditLanguage(event.target.value)
                        }
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      >
                        {languages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>

                      {editDirection === "zh-to-target" && (
                        <textarea
                          value={editPromptZh}
                          onChange={(event) =>
                            setEditPromptZh(event.target.value)
                          }
                          placeholder="Chinese prompt"
                          rows={3}
                          className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                        />
                      )}

                      <textarea
                        value={editWord}
                        onChange={(event) => setEditWord(event.target.value)}
                        placeholder={
                          editDirection === "zh-to-target"
                            ? "Target translation candidates"
                            : "Original word or phrase"
                        }
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editMeaningZh}
                        onChange={(event) =>
                          setEditMeaningZh(event.target.value)
                        }
                        placeholder="Chinese meaning"
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <input
                        value={editPartOfSpeech}
                        onChange={(event) =>
                          setEditPartOfSpeech(event.target.value)
                        }
                        placeholder="Part of speech"
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editExampleSentence}
                        onChange={(event) =>
                          setEditExampleSentence(event.target.value)
                        }
                        placeholder="Example sentence"
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editExampleTranslationZh}
                        onChange={(event) =>
                          setEditExampleTranslationZh(event.target.value)
                        }
                        placeholder="Example translation"
                        rows={3}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editUsageNotes}
                        onChange={(event) =>
                          setEditUsageNotes(event.target.value)
                        }
                        placeholder="Usage notes"
                        rows={4}
                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                      />

                      <textarea
                        value={editNotes}
                        onChange={(event) => setEditNotes(event.target.value)}
                        placeholder="Nuance comparison"
                        rows={4}
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
                      {itemDirection === "zh-to-target" && item.prompt_zh && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Chinese prompt
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-500">
                            {item.prompt_zh}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                          {itemDirection === "zh-to-target"
                            ? "Target translation candidates"
                            : "Original word or phrase"}
                        </p>

                        <h3 className="mt-2 whitespace-pre-wrap text-2xl font-semibold leading-8 text-neutral-950">
                          {item.word}
                        </h3>
                      </div>

                      {item.meaning_zh && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Chinese meaning
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                            {item.meaning_zh}
                          </p>
                        </div>
                      )}

                      {item.example_sentence && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Example sentence
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                            {item.example_sentence}
                          </p>

                          {item.example_translation_zh && (
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-500">
                              {item.example_translation_zh}
                            </p>
                          )}
                        </div>
                      )}

                      {item.usage_notes && (
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Usage notes
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                            {item.usage_notes}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Nuance comparison
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