"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createNightSparkEntry,
  getNightSparkEntries,
} from "../lib/night-sparks";
import { createPhilosophyConcept } from "../lib/philosophy";
import { supabase } from "../lib/supabase/client";
import type {
  NightSparkEntry,
  NightSparkMode,
  NightSparkReaction,
} from "../types/night-sparks";
import type {
  TextLinkLanguageMode,
  TextLinkMode,
  TextLinkSearchResponse,
  TextLinkSearchResult,
  TextRecord,
} from "../types/text-linker";

const socraticQuestions = [
  "你現在理解的「存在者」是某個具體東西，還是凡是能被說為存在的東西？",
  "如果「自由」不是任意選擇，那它是什麼？",
  "一個體系要如何容納真正的差異？",
  "「根據」和「原因」的差別是否只是語詞差異，還是存在論差異？",
];

const sparkSentences = [
  "真正的開始不是第一個東西，而是能夠解釋為何有開始的東西。",
  "自由不是體系的外部，而是體系必須能說明的裂縫。",
  "概念不是標籤，而是一種讓事物被理解的方式。",
  "問題意識比答案更能顯示一個思想的方向。",
];

const reactionOptions: {
  label: string;
  value: Exclude<NightSparkReaction, null>;
}[] = [
  { label: "I Agree", value: "agree" },
  { label: "I Disagree", value: "disagree" },
  { label: "Another Text", value: "association" },
];

const noBasisMessage = "目前文本資料庫中找不到明確文本依據。";

function nextIndex(current: number, total: number) {
  return (current + 1) % total;
}

function makeQuestion(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/[?？]$/.test(trimmed)) return trimmed;

  return `What question is hidden in this thought: ${trimmed}`;
}

function entryModeLabel(mode: NightSparkMode) {
  if (mode === "socratic") return "Socratic";
  if (mode === "spark_sentence") return "Spark Sentence";
  return "One Thought";
}

function locationLabel(result: TextLinkSearchResult) {
  const page = result.page_start
    ? result.page_end && result.page_end !== result.page_start
      ? `pp. ${result.page_start}-${result.page_end}`
      : `p. ${result.page_start}`
    : null;
  const section = [result.chapter, result.section_title].filter(Boolean).join(" / ");

  return [page, section].filter(Boolean).join(" · ") || "Location not detected";
}

function excerpt(text: string, length = 420) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > length ? `${compact.slice(0, length)}...` : compact;
}

function toConceptSource(result: TextLinkSearchResult) {
  return `${result.author || "Unknown author"}, ${result.title}, ${locationLabel(result)}`;
}

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("User is not logged in.");
  return token;
}

export default function NightSparks() {
  const [socraticIndex, setSocraticIndex] = useState(0);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [socraticAnswer, setSocraticAnswer] = useState("");
  const [reaction, setReaction] = useState<NightSparkReaction>(null);
  const [reactionNote, setReactionNote] = useState("");
  const [oneThought, setOneThought] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [recentEntries, setRecentEntries] = useState<NightSparkEntry[]>([]);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkMode, setLinkMode] = useState<TextLinkMode>("strict");
  const [languageMode, setLanguageMode] = useState<TextLinkLanguageMode>("balanced");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkResponse, setLinkResponse] = useState<TextLinkSearchResponse | null>(null);
  const [visibleResultCount, setVisibleResultCount] = useState(5);
  const [texts, setTexts] = useState<TextRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    author: "",
    translator: "",
    language: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    getNightSparkEntries()
      .then(setRecentEntries)
      .catch(() => setRecentEntries([]));
    loadTexts();
  }, []);

  const visibleResults = useMemo(
    () => (linkResponse?.results || []).slice(0, visibleResultCount),
    [linkResponse, visibleResultCount]
  );

  async function loadTexts() {
    const { data, error } = await supabase
      .from("texts")
      .select("*, text_chunks(count)")
      .order("uploaded_at", { ascending: false });

    if (error) {
      setTexts([]);
      return;
    }

    setTexts(
      (data || []).map((item) => ({
        ...(item as TextRecord),
        chunk_count: Array.isArray(item.text_chunks)
          ? item.text_chunks[0]?.count ?? 0
          : 0,
      }))
    );
  }

  async function saveEntry(input: {
    mode: NightSparkMode;
    prompt_text: string | null;
    user_response: string;
    reaction?: NightSparkReaction;
    marked_for_development?: boolean;
    message: string;
  }) {
    setSaving(true);

    try {
      const entry = await createNightSparkEntry({
        mode: input.mode,
        prompt_text: input.prompt_text,
        user_response: input.user_response,
        reaction: input.reaction ?? null,
        marked_for_development: input.marked_for_development ?? false,
      });

      setRecentEntries((current) => [entry, ...current].slice(0, 6));
      setFeedback(input.message);
    } finally {
      setSaving(false);
      window.setTimeout(() => setFeedback(""), 2600);
    }
  }

  async function saveSocratic() {
    const answer = socraticAnswer.trim();
    if (!answer) {
      setFeedback("Leave even one short answer first.");
      return;
    }

    await saveEntry({
      mode: "socratic",
      prompt_text: socraticQuestions[socraticIndex],
      user_response: answer,
      message: "Saved this spark.",
    });

    setSocraticAnswer("");
  }

  async function saveSentence() {
    const note = reactionNote.trim();

    if (!reaction) {
      setFeedback("Choose one reaction first.");
      return;
    }

    if (!note) {
      setFeedback("Add one reason or association first.");
      return;
    }

    await saveEntry({
      mode: "spark_sentence",
      prompt_text: sparkSentences[sentenceIndex],
      user_response: note,
      reaction,
      message: "Saved this sentence.",
    });

    setReactionNote("");
  }

  async function saveOneThought(options?: {
    markedForDevelopment?: boolean;
    asQuestion?: boolean;
  }) {
    const response = options?.asQuestion
      ? makeQuestion(oneThought)
      : oneThought.trim();

    if (!response) {
      setFeedback("Leave one sentence first.");
      return;
    }

    await saveEntry({
      mode: "one_sentence",
      prompt_text: options?.asQuestion
        ? "Turned into question"
        : "One Thought Tonight",
      user_response: response,
      marked_for_development:
        options?.markedForDevelopment || options?.asQuestion || false,
      message:
        options?.markedForDevelopment || options?.asQuestion
          ? "Saved for later development."
          : "Saved this spark.",
    });

    setOneThought("");
  }

  async function searchTextualLinks() {
    const query = linkQuery.trim();
    if (!query) {
      setFeedback("Enter a concept, proposition, sentence, or question first.");
      return;
    }

    setLinkLoading(true);
    setVisibleResultCount(5);

    try {
      const token = await getAccessToken();
      const response = await fetch("/api/text-link/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query,
          mode: linkMode,
          languageMode,
        }),
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Search failed.");

      setLinkResponse(body as TextLinkSearchResponse);
    } catch (error) {
      setLinkResponse({
        query_id: null,
        found_count: 0,
        fallback_message: error instanceof Error ? error.message : noBasisMessage,
        results: [],
      });
    } finally {
      setLinkLoading(false);
    }
  }

  async function saveTextLinkResult(result: TextLinkSearchResult) {
    await saveEntry({
      mode: "one_sentence",
      prompt_text: linkQuery || "Textual Linker result",
      user_response: `${toConceptSource(result)}\n\n${excerpt(result.chunk_text, 700)}\n\n${result.why_relevant}`,
      marked_for_development: true,
      message: "Saved text link to Night Sparks.",
    });
  }

  async function addConceptFromResult(result: TextLinkSearchResult) {
    await createPhilosophyConcept({
      title: linkQuery.trim() || result.title,
      philosophers: result.author,
      current_understanding: result.why_relevant,
      source_texts: toConceptSource(result),
      key_quotes: excerpt(result.chunk_text, 1000),
      unresolved_questions: null,
      related_concepts: null,
    });

    setFeedback("Added to concept dictionary.");
    window.setTimeout(() => setFeedback(""), 2600);
  }

  async function uploadText() {
    if (!selectedFile) {
      setFeedback("Choose a PDF first.");
      return;
    }

    setUploading(true);

    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadForm.title);
      formData.append("author", uploadForm.author);
      formData.append("translator", uploadForm.translator);
      formData.append("language", uploadForm.language);

      const response = await fetch("/api/text-database/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const body = await response.json();

      if (!response.ok) throw new Error(body.error || "Upload failed.");

      setFeedback(
        body.status === "completed"
          ? "Text imported into the database."
          : body.reason || "Text upload finished."
      );
      setSelectedFile(null);
      setUploadForm({ title: "", author: "", translator: "", language: "" });
      await loadTexts();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      window.setTimeout(() => setFeedback(""), 3200);
    }
  }

  async function reprocessText(id: string) {
    const token = await getAccessToken();
    const response = await fetch(`/api/text-database/texts/${id}/reprocess`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Reprocess failed.");
    await loadTexts();
  }

  async function deleteText(id: string) {
    const token = await getAccessToken();
    const response = await fetch(`/api/text-database/texts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Delete failed.");
    await loadTexts();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-sm sm:p-8">
        <header className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">
            思想餘燼
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
            Night Sparks
          </h1>
        </header>

        {feedback ? (
          <p className="mt-6 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {feedback}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          <article className="flex min-h-[31rem] flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-2xl font-bold text-neutral-950">
              ?
            </div>
            <h2 className="mt-6 text-2xl font-bold">Socratic Questions</h2>
            <p className="mt-4 min-h-28 text-sm leading-7 text-neutral-600">
              {socraticQuestions[socraticIndex]}
            </p>

            <label className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
              Short Answer
            </label>
            <textarea
              value={socraticAnswer}
              onChange={(event) => setSocraticAnswer(event.target.value)}
              rows={4}
              placeholder="Write a few words, not a finished argument."
              className="mt-2 rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950"
            />

            <div className="mt-auto flex flex-wrap justify-end gap-2 pt-5">
              <button type="button" onClick={() => { setSocraticIndex((current) => nextIndex(current, socraticQuestions.length)); setSocraticAnswer(""); }} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
                Next Question
              </button>
              <button type="button" onClick={saveSocratic} disabled={saving} className="rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
                Save This Thought
              </button>
            </div>
          </article>

          <article className="flex min-h-[31rem] flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-xl font-bold text-neutral-950">!</div>
            <h2 className="mt-6 text-2xl font-bold">Spark Sentence</h2>
            <p className="mt-4 min-h-28 text-sm leading-7 text-neutral-600">
              {sparkSentences[sentenceIndex]}
            </p>

            <div className="mt-4 grid gap-2">
              {reactionOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => setReaction(option.value)} className={reaction === option.value ? "rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white" : "rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"}>
                  {option.label}
                </button>
              ))}
            </div>

            {reaction ? (
              <div className="mt-4">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Reason or Association</label>
                <textarea value={reactionNote} onChange={(event) => setReactionNote(event.target.value)} rows={4} placeholder="Name the reason, friction, or text it calls up." className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950" />
              </div>
            ) : null}

            <div className="mt-auto flex flex-wrap justify-end gap-2 pt-5">
              <button type="button" onClick={() => { setSentenceIndex((current) => nextIndex(current, sparkSentences.length)); setReaction(null); setReactionNote(""); }} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
                Next Sentence
              </button>
              <button type="button" onClick={saveSentence} disabled={saving} className="rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
                Save This Sentence
              </button>
            </div>
          </article>

          <article className="flex min-h-[31rem] flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-neutral-50 text-xl font-bold text-neutral-950">1</div>
            <h2 className="mt-6 text-2xl font-bold">One Thought Tonight</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">Leave only one ember. It can be unclear, unfinished, or small.</p>

            <label className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Tonight&apos;s Thought</label>
            <textarea value={oneThought} onChange={(event) => setOneThought(event.target.value)} rows={6} placeholder="例如：我還是不懂謝林為什麼要區分『根據』和『原因』，但我感覺這和自由有關。" className="mt-2 rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950" />

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
              <button type="button" onClick={() => saveOneThought()} disabled={saving} className="rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">Save to Night Sparks</button>
              <button type="button" onClick={() => saveOneThought({ markedForDevelopment: true })} disabled={saving} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">Mark for Later</button>
              <button type="button" onClick={() => saveOneThought({ asQuestion: true })} disabled={saving} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">Turn Into Question</button>
            </div>
          </article>

          <article className="flex min-h-[31rem] flex-col rounded-xl border border-neutral-300 bg-neutral-50 p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-400 bg-white text-xl font-bold text-neutral-950">T</div>
            <h2 className="mt-6 text-2xl font-bold">文本連結</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              輸入一個概念、命題或句子，只從你的文本資料庫中尋找相關文本依據。
            </p>
            <textarea value={linkQuery} onChange={(event) => setLinkQuery(event.target.value)} rows={5} placeholder="例如：存在者與存在的差別、根據不是原因、自由是否是體系的裂縫、一不能與自身相同" className="mt-4 rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950" />

            <div className="mt-4 grid gap-2">
              <button type="button" onClick={searchTextualLinks} disabled={linkLoading} className="rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
                {linkLoading ? "Searching..." : "搜尋文本連結"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setLinkMode("strict")} className={linkMode === "strict" ? "rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white" : "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"}>嚴格模式</button>
                <button type="button" onClick={() => setLinkMode("explore")} className={linkMode === "explore" ? "rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white" : "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"}>探索模式</button>
              </div>
              <button type="button" onClick={() => setLanguageMode((current) => current === "original_first" ? "balanced" : "original_first")} className={languageMode === "original_first" ? "rounded-lg border border-neutral-950 bg-neutral-950 px-3 py-2 text-sm font-bold text-white" : "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50"}>原文優先</button>
              <button type="button" onClick={() => saveEntry({ mode: "one_sentence", prompt_text: "Textual Linker query", user_response: linkQuery, marked_for_development: true, message: "Saved query to Night Sparks." })} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">保存到思想餘燼</button>
              <button type="button" onClick={() => createPhilosophyConcept({ title: linkQuery || "Textual Linker concept", philosophers: null, current_understanding: null, source_texts: null, key_quotes: null, unresolved_questions: null, related_concepts: null }).then(() => setFeedback("Added to concept dictionary."))} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">加入概念詞典</button>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Textual Link Results</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-500">
              Answers below are retrieved context, not general AI knowledge. If no completed text chunk supports the query, the system says so directly.
            </p>
          </div>
          {linkResponse ? <p className="text-sm text-neutral-500">找到的文本數量: {linkResponse.found_count}</p> : null}
        </div>

        {linkResponse?.fallback_message ? (
          <p className="mt-5 rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">
            {linkResponse.fallback_message || noBasisMessage}
          </p>
        ) : null}

        {visibleResults.length > 0 ? (
          <div className="mt-5 space-y-4">
            {visibleResults.map((result) => (
              <article key={result.chunk_id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">相關度: {result.relevance}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => saveTextLinkResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">保存</button>
                    <button type="button" onClick={() => addConceptFromResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">加入概念詞典</button>
                    <button type="button" onClick={() => saveTextLinkResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">建立概念連結</button>
                  </div>
                </div>
                <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <div><dt className="font-bold">作者</dt><dd className="text-neutral-600">{result.author || "Unknown"}</dd></div>
                  <div><dt className="font-bold">書名</dt><dd className="text-neutral-600">{result.title}</dd></div>
                  <div><dt className="font-bold">位置</dt><dd className="text-neutral-600">{locationLabel(result)}</dd></div>
                  <div><dt className="font-bold">Match Type</dt><dd className="text-neutral-600">{result.match_type}</dd></div>
                </dl>
                <div className="mt-4 rounded-lg bg-white p-4 text-sm leading-7 text-neutral-700">
                  <p className="font-bold text-neutral-950">原文片段</p>
                  <p className="mt-2">{excerpt(result.chunk_text)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600"><span className="font-bold text-neutral-950">關聯說明: </span>{result.why_relevant}</p>
              </article>
            ))}
            {linkResponse && linkResponse.results.length > visibleResultCount ? (
              <button type="button" onClick={() => setVisibleResultCount((count) => count + 5)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">展開更多</button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="text-xl font-bold">文本資料庫</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            你可以在這裡上傳自己的哲學文本 PDF。文本連結功能只會根據這些已匯入的文本回答，不會憑空補充資料庫中不存在的哲學家或著作。
          </p>
        </div>

        <div className="mt-5 grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
          <div className="space-y-3">
            <input type="file" accept="application/pdf,.pdf" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={uploadForm.title} onChange={(event) => setUploadForm({ ...uploadForm, title: event.target.value })} placeholder="Title" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
              <input value={uploadForm.author} onChange={(event) => setUploadForm({ ...uploadForm, author: event.target.value })} placeholder="Author" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
              <input value={uploadForm.translator} onChange={(event) => setUploadForm({ ...uploadForm, translator: event.target.value })} placeholder="Translator" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
              <input value={uploadForm.language} onChange={(event) => setUploadForm({ ...uploadForm, language: event.target.value })} placeholder="Language" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
            </div>
            <button type="button" onClick={uploadText} disabled={uploading} className="rounded-lg border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-50">
              {uploading ? "Processing..." : "Upload PDF"}
            </button>
          </div>
          <div className="rounded-lg bg-white p-4 text-sm leading-6 text-neutral-600">
            <p className="font-bold text-neutral-950">Backend folder import</p>
            <p className="mt-2">Place PDFs in <code>backend-import/texts/</code>, then run <code>npm run ingest-texts</code>. Web uploads and folder imports use the same ingestion pipeline.</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              <tr>
                <th className="border-b border-neutral-200 px-3 py-2">Title</th>
                <th className="border-b border-neutral-200 px-3 py-2">Author</th>
                <th className="border-b border-neutral-200 px-3 py-2">Translator</th>
                <th className="border-b border-neutral-200 px-3 py-2">Language</th>
                <th className="border-b border-neutral-200 px-3 py-2">Uploaded</th>
                <th className="border-b border-neutral-200 px-3 py-2">Status</th>
                <th className="border-b border-neutral-200 px-3 py-2">Chunks</th>
                <th className="border-b border-neutral-200 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {texts.map((text) => (
                <tr key={text.id} className="align-top">
                  <td className="border-b border-neutral-100 px-3 py-3 font-medium">{text.title}<p className="mt-1 text-xs text-neutral-400">{text.file_name}</p>{text.ingestion_error ? <p className="mt-1 text-xs text-red-600">{text.ingestion_error}</p> : null}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.author || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.translator || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.language || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{new Date(text.uploaded_at).toLocaleString()}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.ingestion_status}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.chunk_count ?? 0}</td>
                  <td className="border-b border-neutral-100 px-3 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => reprocessText(text.id).catch((error) => setFeedback(error.message))} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">Reprocess</button><button type="button" onClick={() => deleteText(text.id).catch((error) => setFeedback(error.message))} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {texts.length === 0 ? <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">No texts uploaded yet.</p> : null}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Recent Sparks</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              Small notes saved here are not tasks. They are traces you can return to when energy comes back.
            </p>
          </div>
        </div>

        {recentEntries.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">No sparks saved yet.</p>
        ) : (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recentEntries.slice(0, 6).map((entry) => (
              <article key={entry.id} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">{entryModeLabel(entry.mode)}</p>
                  {entry.marked_for_development ? <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-xs font-bold text-white">Later</span> : null}
                </div>
                {entry.prompt_text ? <p className="mt-3 text-sm leading-6 text-neutral-500">{entry.prompt_text}</p> : null}
                <p className="mt-3 text-sm leading-6 text-neutral-950">{entry.user_response}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}