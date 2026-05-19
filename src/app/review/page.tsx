"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type VocabularyItem = {
    id: string;
    language: string;
    prompt_zh: string | null;
    word: string;
    meaning_zh: string | null;
    notes: string | null;
    created_at: string;
};

type SentenceItem = {
    id: string;
    language: string;
    source_zh: string | null;
    target_sentence: string;
    explanation: string | null;
    notes: string | null;
    created_at: string;
};

type ArticleItem = {
    id: string;
    language: string;
    title: string;
    topic: string | null;
    level: string | null;
    content: string;
    notes: string | null;
    created_at: string;
};

export default function ReviewPage() {
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [sentences, setSentences] = useState<SentenceItem[]>([]);
    const [articles, setArticles] = useState<ArticleItem[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadReviewItems() {
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

        const [vocabularyResult, sentencesResult, articlesResult] =
            await Promise.all([
                supabase
                    .from("vocabulary")
                    .select("id, language, prompt_zh, word, meaning_zh, notes, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5),

                supabase
                    .from("sentences")
                    .select(
                        "id, language, source_zh, target_sentence, explanation, notes, created_at"
                    )
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5),

                supabase
                    .from("articles")
                    .select("id, language, title, topic, level, content, notes, created_at")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(5),
            ]);

        if (vocabularyResult.error) {
            console.error("Load vocabulary error:", vocabularyResult.error);
        } else {
            setVocabulary(vocabularyResult.data ?? []);
        }

        if (sentencesResult.error) {
            console.error("Load sentences error:", sentencesResult.error);
        } else {
            setSentences(sentencesResult.data ?? []);
        }

        if (articlesResult.error) {
            console.error("Load articles error:", articlesResult.error);
        } else {
            setArticles(articlesResult.data ?? []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadReviewItems();
    }, []);

    const totalItems = vocabulary.length + sentences.length + articles.length;

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
            <div className="mx-auto max-w-6xl">
                <header className="mb-8 border-b border-neutral-200 pb-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Learning Dashboard
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Review
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        A compact overview of your recent vocabulary, sentences, and
                        articles.
                    </p>
                </header>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Vocabulary
                        </p>

                        <p className="mt-3 text-4xl font-semibold">{vocabulary.length}</p>

                        <Link
                            href="/vocabulary"
                            className="mt-4 inline-block text-sm font-medium text-neutral-700 hover:text-neutral-950"
                        >
                            Open vocabulary →
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Sentences
                        </p>

                        <p className="mt-3 text-4xl font-semibold">{sentences.length}</p>

                        <Link
                            href="/sentences"
                            className="mt-4 inline-block text-sm font-medium text-neutral-700 hover:text-neutral-950"
                        >
                            Open sentences →
                        </Link>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                            Articles
                        </p>

                        <p className="mt-3 text-4xl font-semibold">{articles.length}</p>

                        <Link
                            href="/articles"
                            className="mt-4 inline-block text-sm font-medium text-neutral-700 hover:text-neutral-950"
                        >
                            Open articles →
                        </Link>
                    </div>
                </section>

                {loading && <p className="mt-8 text-neutral-500">Loading...</p>}

                {!loading && totalItems === 0 && (
                    <p className="mt-8 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
                        No recent learning items yet.
                    </p>
                )}

                <section className="mt-10 grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                    Recent
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold">Vocabulary</h2>
                            </div>

                            <Link
                                href="/vocabulary"
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {vocabulary.length === 0 && (
                                <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-500">
                                    No vocabulary yet.
                                </p>
                            )}

                            {vocabulary.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                                >
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                            {item.language}
                                        </span>

                                        <span className="text-xs text-neutral-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {item.prompt_zh && (
                                        <p className="text-sm leading-6 text-neutral-500">
                                            {item.prompt_zh}
                                        </p>
                                    )}

                                    <h3 className="mt-2 text-lg font-semibold leading-7">
                                        {item.word}
                                    </h3>

                                    {item.meaning_zh && (
                                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                                            {item.meaning_zh}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                    Recent
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold">Sentences</h2>
                            </div>

                            <Link
                                href="/sentences"
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {sentences.length === 0 && (
                                <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-500">
                                    No sentences yet.
                                </p>
                            )}

                            {sentences.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                                >
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                            {item.language}
                                        </span>

                                        <span className="text-xs text-neutral-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {item.source_zh && (
                                        <p className="text-sm leading-6 text-neutral-500">
                                            {item.source_zh}
                                        </p>
                                    )}

                                    <h3 className="mt-2 text-lg font-semibold leading-7">
                                        {item.target_sentence}
                                    </h3>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                    Recent
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold">Articles</h2>
                            </div>

                            <Link
                                href="/articles"
                                className="text-sm font-medium text-neutral-500 hover:text-neutral-950"
                            >
                                View all
                            </Link>
                        </div>

                        <div className="mt-5 grid gap-4">
                            {articles.length === 0 && (
                                <p className="rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-500">
                                    No articles yet.
                                </p>
                            )}

                            {articles.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
                                >
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                            {item.language}
                                        </span>

                                        {item.topic && (
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                                {item.topic}
                                            </span>
                                        )}

                                        {item.level && (
                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-700">
                                                {item.level}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-semibold leading-7">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-neutral-600">
                                        {item.content}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}