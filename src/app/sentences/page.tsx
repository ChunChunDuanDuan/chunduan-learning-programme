"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type SentenceItem = {
  id: string;
  language: string;
  source_zh: string | null;
  target_sentence: string;
  translation_zh: string | null;
  explanation: string | null;
  notes: string | null;
  created_at: string;
};

type SentenceAIResult = {
  target_sentence: string;
  translation_zh: string;
  explanation: string;
  notes: string;
};

const languages = ["English", "Deutsch", "Русский"];

export default function SentencesPage() {
  const [items, setItems] = useState<SentenceItem[]>([]);
  const [language, setLanguage] = useState("English");
  const [sourceZh, setSourceZh] = useState("");
  const [targetSentence, setTargetSentence] = useState("");
  const [translationZh, setTranslationZh] = useState("");
  const [explanation, setExplanation] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLanguage, setEditLanguage] = useState("English");
  const [editSourceZh, setEditSourceZh] = useState("");
  const [editTargetSentence, setEditTargetSentence] = useState("");
  const [editTranslationZh, setEditTranslationZh] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
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
      .from("sentences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load error:", error);
    } else {
      setItems(data ?? []);
    }

    setLoading(false);
  }

  async function generateDraftExplanation() {
    if (!sourceZh.trim()) {
      alert("Please enter a Chinese prompt first.");
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch("/api/explain-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          source_zh: sourceZh,
          target_sentence: targetSentence,
          translation_zh: translationZh,
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

  async function saveItem() {
    if (!targetSentence.trim()) {
      alert("Please enter a target sentence.");
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

    const { error } = await supabase.from("sentences").insert({
      user_id: user.id,
      language,
      source_zh: sourceZh.trim(),
      target_sentence: targetSentence.trim(),
      translation_zh: translationZh.trim(),
      explanation: explanation.trim(),
      notes: notes.trim(),
    });

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

    await loadItems();
    setShowAddForm(false);
    setSaving(false);
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sentence?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("sentences")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      alert("Failed to delete sentence.");
      return;
    }

    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  async function explainSavedItem(item: SentenceItem) {
    setExplainingId(item.id);

    try {
      const response = await fetch("/api/explain-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: item.language,
          source_zh: item.source_zh ?? "",
          target_sentence: item.target_sentence,
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

      const { error } = await supabase
        .from("sentences")
        .update({
          target_sentence: result.target_sentence.trim(),
          translation_zh: result.translation_zh.trim(),
          explanation: result.explanation.trim(),
          notes: result.notes.trim(),
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

  function startEdit(item: SentenceItem) {
    setEditingId(item.id);
    setEditLanguage(item.language);
    setEditSourceZh(item.source_zh ?? "");
    setEditTargetSentence(item.target_sentence);
    setEditTranslationZh(item.translation_zh ?? "");
    setEditExplanation(item.explanation ?? "");
    setEditNotes(item.notes ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLanguage("English");
    setEditSourceZh("");
    setEditTargetSentence("");
    setEditTranslationZh("");
    setEditExplanation("");
    setEditNotes("");
  }

  async function updateItem(id: string) {
    if (!editTargetSentence.trim()) {
      alert("Please enter a target sentence.");
      return;
    }

    const { error } = await supabase
      .from("sentences")
      .update({
        language: editLanguage,
        source_zh: editSourceZh.trim(),
        target_sentence: editTargetSentence.trim(),
        translation_zh: editTranslationZh.trim(),
        explanation: editExplanation.trim(),
        notes: editNotes.trim(),
      })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update sentence.");
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? {
            ...item,
            language: editLanguage,
            source_zh: editSourceZh.trim(),
            target_sentence: editTargetSentence.trim(),
            translation_zh: editTranslationZh.trim(),
            explanation: editExplanation.trim(),
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
      item.source_zh?.toLowerCase().includes(keyword) ||
      item.target_sentence.toLowerCase().includes(keyword) ||
      item.translation_zh?.toLowerCase().includes(keyword) ||
      item.explanation?.toLowerCase().includes(keyword) ||
      item.notes?.toLowerCase().includes(keyword);

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
            Sentence Practice
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Generate sentences from Chinese prompts, then save explanations and
            notes for English, Deutsch, and Русский.
          </p>
        </header>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Add sentence</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Enter a Chinese prompt and generate a sentence in your target
                language.
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

              <button
                onClick={generateDraftExplanation}
                disabled={generating || saving}
                className="rounded-2xl border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
              >
                {generating ? "Generating..." : "Generate sentence with AI"}
              </button>

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
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                      {item.language}
                    </span>

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

                    <textarea
                      value={editSourceZh}
                      onChange={(event) =>
                        setEditSourceZh(event.target.value)
                      }
                      placeholder="Chinese prompt"
                      rows={3}
                      className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                    />

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
                    {item.source_zh && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                          Prompt
                        </p>

                        <p className="mt-2 text-sm leading-6 text-neutral-500">
                          {item.source_zh}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                        Target sentence
                      </p>

                      <h3 className="mt-2 text-xl font-semibold leading-8 text-neutral-950">
                        {item.target_sentence}
                      </h3>
                    </div>

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
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}