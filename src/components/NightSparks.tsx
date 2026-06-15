"use client";

import Link from "next/link";
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
} from "../types/text-linker";

type QuestionTemplate = (topic: string, companion: string) => string;

type SentenceTemplate = (topic: string, companion: string) => string;

function buildTextBank(
  seed: string[],
  targetCount: number,
  topics: string[],
  templates: Array<QuestionTemplate | SentenceTemplate>
) {
  const bank = [...seed];

  for (const template of templates) {
    for (const topic of topics) {
      for (const companion of topics) {
        const candidate = template(topic, companion);

        if (!bank.includes(candidate)) {
          bank.push(candidate);
        }

        if (bank.length >= targetCount) {
          return bank;
        }
      }
    }
  }

  return bank.slice(0, targetCount);
}

const philosophyTopics = [
  "being",
  "ground",
  "freedom",
  "necessity",
  "difference",
  "identity",
  "negation",
  "beginning",
  "concept",
  "system",
  "cause",
  "reason",
  "appearance",
  "essence",
  "subjectivity",
  "nature",
  "spirit",
  "time",
  "truth",
  "limit",
  "contradiction",
  "mediation",
  "immediacy",
  "actuality",
  "possibility",
  "finitude",
  "infinity",
  "relation",
  "experience",
  "language",
  "history",
  "desire",
  "law",
  "form",
  "matter",
  "unity",
  "plurality",
  "origin",
  "becoming",
  "nothingness",
];

const curatedSocraticQuestions = [
  "Is the being you understand now a concrete thing, or anything that can be said to be?",
  "If freedom is not arbitrary choice, what is it?",
  "How can a system make room for genuine difference?",
  "Is the difference between ground and cause only verbal, or ontological?",
  "What must a beginning explain besides the fact that something came first?",
  "When a concept clarifies something, what does it also hide?",
  "Can contradiction be a failure of thought and also a motor of thought?",
  "What would count as evidence that a philosophical distinction is necessary?",
  "Does a limit merely stop thinking, or does it give thinking its shape?",
  "If identity already contains relation, what happens to pure self-sameness?",
  "What is lost when an experience is translated too quickly into a concept?",
  "Can a ground remain hidden while still determining what appears?",
  "What kind of freedom can exist inside necessity rather than outside it?",
  "When does explanation become reduction?",
  "Is a philosophical system strongest where it is complete, or where it can transform?",
  "What makes a question philosophical rather than merely difficult?",
  "Can something be intelligible without being fully transparent?",
  "What does it mean for a concept to generate its own opposite?",
  "If a text resists you, is the resistance in the text, in the concept, or in your expectation?",
  "What is the difference between beginning from experience and grounding experience?",
  "Can the same concept function differently in two thinkers without becoming a different concept?",
  "What would it mean to understand freedom as a structure rather than a feeling?",
  "When does difference become conflict?",
  "Can a principle explain what escapes it?",
  "What is the relation between a problem and the language that makes it visible?",
  "If reason needs a ground, does that ground have to be rational?",
  "Can a contradiction preserve truth rather than destroy it?",
  "What kind of unity does not erase plurality?",
  "When a philosopher defines something, what are they trying to protect from confusion?",
  "What would change if you treated this passage as a map of tensions instead of a list of claims?",
];

const socraticQuestionTemplates: QuestionTemplate[] = [
  (topic) => `What does ${topic} explain that a simpler term would leave untouched?`,
  (topic, companion) => `How would ${topic} change if it had to pass through ${companion}?`,
  (topic) => `Where does ${topic} become more than a word in the text you are reading?`,
  (topic, companion) => `Is the tension between ${topic} and ${companion} accidental, or does it carry the argument?`,
  (topic) => `What would be misunderstood if ${topic} were treated as merely psychological?`,
  (topic) => `What condition must hold before ${topic} can become thinkable?`,
  (topic, companion) => `Does ${topic} limit ${companion}, or does it make ${companion} possible?`,
  (topic) => `What kind of evidence would show that ${topic} is a structural concept?`,
  (topic, companion) => `If ${topic} depends on ${companion}, what kind of dependence is it?`,
  (topic) => `What remains unclear when you try to define ${topic} too quickly?`,
  (topic, companion) => `Could ${topic} be the hidden problem behind ${companion}?`,
  (topic) => `What does the text ask you to give up in order to understand ${topic}?`,
  (topic, companion) => `Where does ${topic} resist being reduced to ${companion}?`,
  (topic) => `What does ${topic} make visible that ordinary explanation tends to miss?`,
  (topic, companion) => `Can ${topic} and ${companion} belong to one movement without becoming the same?`,
];

const socraticQuestions = buildTextBank(
  curatedSocraticQuestions,
  200,
  philosophyTopics,
  socraticQuestionTemplates
);

const curatedSparkSentences = [
  "A true beginning is not the first thing, but what can explain why beginning is possible.",
  "Freedom is not outside the system; it is the fracture the system must account for.",
  "A concept is not a label, but a way for things to become intelligible.",
  "A problem shows the direction of a thought more clearly than an answer does.",
  "A ground is not yet an explanation unless it can show why something follows.",
  "Difference becomes philosophical when it cannot be treated as a mere variation.",
  "The hardest texts often preserve a question before they preserve a doctrine.",
  "A system is tested by what it cannot easily absorb.",
  "To name a concept is already to decide what kind of relation matters.",
  "Sometimes the unclear sentence is the most honest record of thought beginning.",
  "The limit of a concept is also part of its meaning.",
  "A philosophical distinction matters when removing it makes the problem disappear too easily.",
  "The obscure passage may be where the system is doing its most delicate work.",
  "Ground is not background; it is the condition that lets something stand forth.",
  "A contradiction can mark the place where thought has not yet learned its own movement.",
  "Freedom becomes serious only when it has to answer to necessity.",
  "A concept begins to live when it can survive contact with its opposite.",
  "Interpretation is often the art of slowing down a sentence that looks obvious.",
  "A system without remainder may be less complete than one that knows where it trembles.",
  "The question of being is never only about what exists, but about how existence becomes sayable.",
  "A thinker is often closest to their problem where their vocabulary becomes strained.",
  "A definition does not close thought; it decides where thought must begin again.",
  "What looks like a technical distinction may be the hinge of the whole argument.",
  "The most productive confusion is the one that can name what it cannot yet solve.",
  "A text becomes useful when it teaches you how to ask a better question of it.",
  "Necessity is not the enemy of freedom if freedom is the power to belong otherwise.",
  "A concept does not merely represent reality; it organizes the field in which reality can appear.",
  "The relation between two terms can matter more than either term alone.",
  "A philosophical answer is often a disciplined way of keeping the right question open.",
  "The point of returning to a hard passage is not mastery, but renewed precision.",
];

const sparkSentenceTemplates: SentenceTemplate[] = [
  (topic) => `${topic} becomes philosophical when it stops being obvious.`,
  (topic, companion) => `${topic} is sharpened by the pressure of ${companion}.`,
  (topic) => `A text thinks through ${topic} before it teaches a doctrine about it.`,
  (topic, companion) => `${topic} and ${companion} become interesting where their border starts to move.`,
  (topic) => `The meaning of ${topic} depends on the problem it is asked to solve.`,
  (topic) => `${topic} is not only a term; it is a way of arranging a field of thought.`,
  (topic, companion) => `${topic} can conceal ${companion} as much as it reveals it.`,
  (topic) => `The difficulty of ${topic} may be the sign that the question is finally precise.`,
  (topic, companion) => `A distinction between ${topic} and ${companion} matters only if it changes the argument.`,
  (topic) => `To understand ${topic}, it may be necessary to notice what the text refuses to simplify.`,
  (topic, companion) => `${topic} becomes unstable when ${companion} is no longer treated as secondary.`,
  (topic) => `The first task is not to master ${topic}, but to locate why it becomes necessary.`,
  (topic, companion) => `${topic} and ${companion} may name two sides of one unresolved movement.`,
  (topic) => `The concept of ${topic} gains force when it explains a tension rather than naming a thing.`,
  (topic, companion) => `${topic} is clearest where it cannot simply replace ${companion}.`,
];

const sparkSentences = buildTextBank(
  curatedSparkSentences,
  200,
  philosophyTopics,
  sparkSentenceTemplates
);

const reactionOptions: {
  label: string;
  value: Exclude<NightSparkReaction, null>;
}[] = [
  { label: "I Agree", value: "agree" },
  { label: "I Disagree", value: "disagree" },
  { label: "Another Text", value: "association" },
];

const noBasisMessage = "目前文本資料庫中找不到明確文本依據。";

function createRandomBag(total: number, exclude?: number) {
  const indexes = Array.from({ length: total }, (_, index) => index).filter(
    (index) => index !== exclude
  );

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[swapIndex]] = [indexes[swapIndex], indexes[index]];
  }

  return indexes;
}

function randomInitialIndex(total: number) {
  return Math.floor(Math.random() * total);
}

function takeRandomFromBag(
  current: number,
  total: number,
  bag: number[],
  setBag: (nextBag: number[]) => void
) {
  const nextBag = bag.length > 0 ? [...bag] : createRandomBag(total, current);
  const next = nextBag.shift() ?? current;
  setBag(nextBag);
  return next;
}

function makeQuestion(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/[?？]$/.test(trimmed)) return trimmed;

  return `What question is hidden in this thought: ${trimmed}?`;
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
  const [socraticIndex, setSocraticIndex] = useState(() =>
    randomInitialIndex(socraticQuestions.length)
  );
  const [sentenceIndex, setSentenceIndex] = useState(() =>
    randomInitialIndex(sparkSentences.length)
  );
  const [socraticBag, setSocraticBag] = useState<number[]>(() =>
    createRandomBag(socraticQuestions.length, socraticIndex)
  );
  const [sentenceBag, setSentenceBag] = useState<number[]>(() =>
    createRandomBag(sparkSentences.length, sentenceIndex)
  );
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

  useEffect(() => {
    getNightSparkEntries()
      .then(setRecentEntries)
      .catch(() => setRecentEntries([]));
  }, []);

  const visibleResults = useMemo(
    () => (linkResponse?.results || []).slice(0, visibleResultCount),
    [linkResponse, visibleResultCount]
  );

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
              <button type="button" onClick={() => {
                  setSocraticIndex((current) =>
                    takeRandomFromBag(
                      current,
                      socraticQuestions.length,
                      socraticBag,
                      setSocraticBag
                    )
                  );
                  setSocraticAnswer("");
                }} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
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
              <button type="button" onClick={() => {
                  setSentenceIndex((current) =>
                    takeRandomFromBag(
                      current,
                      sparkSentences.length,
                      sentenceBag,
                      setSentenceBag
                    )
                  );
                  setReaction(null);
                  setReactionNote("");
                }} className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
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
          {linkResponse ? <p className="text-sm text-neutral-500">Found texts: {linkResponse.found_count}</p> : null}
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
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Relevance: {result.relevance}</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => saveTextLinkResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">保存</button>
                    <button type="button" onClick={() => addConceptFromResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">加入概念詞典</button>
                    <button type="button" onClick={() => saveTextLinkResult(result)} className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">建立概念連結</button>
                  </div>
                </div>
                <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                  <div><dt className="font-bold">Author</dt><dd className="text-neutral-600">{result.author || "Unknown"}</dd></div>
                  <div><dt className="font-bold">Title</dt><dd className="text-neutral-600">{result.title}</dd></div>
                  <div><dt className="font-bold">Location</dt><dd className="text-neutral-600">{locationLabel(result)}</dd></div>
                  <div><dt className="font-bold">Match Type</dt><dd className="text-neutral-600">{result.match_type}</dd></div>
                </dl>
                <div className="mt-4 rounded-lg bg-white p-4 text-sm leading-7 text-neutral-700">
                  <p className="font-bold text-neutral-950">Original Passage</p>
                  <p className="mt-2">{excerpt(result.chunk_text)}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600"><span className="font-bold text-neutral-950">Why relevant: </span>{result.why_relevant}</p>
              </article>
            ))}
            {linkResponse && linkResponse.results.length > visibleResultCount ? (
              <button type="button" onClick={() => setVisibleResultCount((count) => count + 5)} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">展開更多</button>
            ) : null}
          </div>
        ) : null}
      </section>

      <Link
        href="/night-sparks/text-database"
        className="mt-8 block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-neutral-950 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">
              Private Text Archive
            </p>
            <h2 className="mt-2 text-xl font-bold">Text Database</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
              Open the full database page to upload PDFs, search by title or author, review ingestion status, and manage imported texts.
            </p>
          </div>
          <span className="rounded-lg border border-neutral-950 bg-neutral-950 px-4 py-2 text-sm font-bold text-white">
            Open Database
          </span>
        </div>
      </Link>

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

