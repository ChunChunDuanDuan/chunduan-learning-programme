"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type ArticleItem = {
    id: string;
    user_id: string;
    language: string;
    title: string;
    topic: string | null;
    level: string | null;
    content: string;
    translation_zh: string | null;
    notes: string | null;
    created_at: string;
};

type GeneratedArticle = {
    title: string;
    content: string;
    translation_zh: string;
    notes: string;
};

const languages = ["English", "Deutsch", "Русский"];

const topics = [
    "daily life",
    "culture",
    "philosophy",
    "science",
    "history",
    "literature",
    "random",
];

const levels = ["C1", "A1", "beginner"];

export default function ArticlesPage() {
    const [items, setItems] = useState<ArticleItem[]>([]);

    const [language, setLanguage] = useState("English");
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("daily life");
    const [level, setLevel] = useState("C1");
    const [content, setContent] = useState("");
    const [translationZh, setTranslationZh] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [languageFilter, setLanguageFilter] = useState("All");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLanguage, setEditLanguage] = useState("English");
    const [editTitle, setEditTitle] = useState("");
    const [editTopic, setEditTopic] = useState("daily life");
    const [editLevel, setEditLevel] = useState("C1");
    const [editContent, setEditContent] = useState("");
    const [editTranslationZh, setEditTranslationZh] = useState("");
    const [editNotes, setEditNotes] = useState("");

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
            .from("articles")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Load articles error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
        } else {
            setItems(data ?? []);
        }

        setLoading(false);
    }

    async function generateArticle() {
        setGenerating(true);

        try {
            const response = await fetch("/api/generate-article", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    language,
                    topic,
                    level,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Failed to generate article: ${data.error ?? "Unknown error"}`);
                setGenerating(false);
                return;
            }

            const generated = data as GeneratedArticle;

            setTitle(generated.title ?? "");
            setContent(generated.content ?? "");
            setTranslationZh(generated.translation_zh ?? "");
            setNotes(generated.notes ?? "");
        } catch (error) {
            console.error("Generate article error:", error);
            alert("Failed to generate article.");
        }

        setGenerating(false);
    }

    async function saveItem() {
        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }

        if (!content.trim()) {
            alert("Please enter article content.");
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

        const { error } = await supabase.from("articles").insert({
            user_id: user.id,
            language,
            title: title.trim(),
            topic,
            level,
            content: content.trim(),
            translation_zh: translationZh.trim(),
            notes: notes.trim(),
        });

        if (error) {
            console.error("Save article error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            alert(`Failed to save article: ${error.message}`);
            setSaving(false);
            return;
        }

        setTitle("");
        setContent("");
        setTranslationZh("");
        setNotes("");

        await loadItems();
        setShowAddForm(false);
        setSaving(false);
    }

    async function deleteItem(id: string) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this article?"
        );

        if (!confirmed) return;

        const { error } = await supabase
            .from("articles")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete article error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            alert(`Failed to delete article: ${error.message}`);
            return;
        }

        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }

    function startEdit(item: ArticleItem) {
        setEditingId(item.id);
        setEditLanguage(item.language);
        setEditTitle(item.title);
        setEditTopic(item.topic ?? "daily life");
        setEditLevel(item.level ?? "C1");
        setEditContent(item.content);
        setEditTranslationZh(item.translation_zh ?? "");
        setEditNotes(item.notes ?? "");
    }

    function cancelEdit() {
        setEditingId(null);
        setEditLanguage("English");
        setEditTitle("");
        setEditTopic("daily life");
        setEditLevel("C1");
        setEditContent("");
        setEditTranslationZh("");
        setEditNotes("");
    }

    async function updateItem(id: string) {
        if (!editTitle.trim()) {
            alert("Please enter a title.");
            return;
        }

        if (!editContent.trim()) {
            alert("Please enter article content.");
            return;
        }

        const { error } = await supabase
            .from("articles")
            .update({
                language: editLanguage,
                title: editTitle.trim(),
                topic: editTopic,
                level: editLevel,
                content: editContent.trim(),
                translation_zh: editTranslationZh.trim(),
                notes: editNotes.trim(),
            })
            .eq("id", id);

        if (error) {
            console.error("Update article error:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });

            alert(`Failed to update article: ${error.message}`);
            return;
        }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        language: editLanguage,
                        title: editTitle.trim(),
                        topic: editTopic,
                        level: editLevel,
                        content: editContent.trim(),
                        translation_zh: editTranslationZh.trim(),
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
            item.title.toLowerCase().includes(keyword) ||
            item.content.toLowerCase().includes(keyword) ||
            item.topic?.toLowerCase().includes(keyword) ||
            item.level?.toLowerCase().includes(keyword) ||
            item.translation_zh?.toLowerCase().includes(keyword) ||
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
                        Articles / Reading Practice
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Save reading materials, translations, and notes for English,
                        Deutsch, and Русский.
                    </p>
                </header>

                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Add article</h2>

                            <p className="mt-1 text-sm text-neutral-500">
                                Generate with AI or create a reading card manually.
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
                            <div className="grid gap-5 md:grid-cols-3">
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
                                        Topic
                                    </label>

                                    <select
                                        value={topic}
                                        onChange={(event) => setTopic(event.target.value)}
                                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                    >
                                        {topics.map((topicItem) => (
                                            <option key={topicItem} value={topicItem}>
                                                {topicItem}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Level
                                    </label>

                                    <select
                                        value={level}
                                        onChange={(event) => setLevel(event.target.value)}
                                        className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                    >
                                        {levels.map((levelItem) => (
                                            <option key={levelItem} value={levelItem}>
                                                {levelItem}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={generateArticle}
                                disabled={generating || saving}
                                className="rounded-2xl border border-neutral-300 bg-neutral-50 px-5 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-100 disabled:opacity-50"
                            >
                                {generating ? "Generating..." : "Generate article with AI"}
                            </button>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Title
                                </label>

                                <input
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    placeholder="Article title"
                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Content
                                </label>

                                <textarea
                                    value={content}
                                    onChange={(event) => setContent(event.target.value)}
                                    placeholder="Paste, write, or generate the article here..."
                                    rows={8}
                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
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
                                    rows={5}
                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    Notes
                                </label>

                                <textarea
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Reading notes, vocabulary, grammar points..."
                                    rows={4}
                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                                />
                            </div>

                            <button
                                onClick={saveItem}
                                disabled={saving || generating}
                                className="rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save article"}
                            </button>
                        </div>
                    )}
                </section>

                <section className="mt-10">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold">Saved articles</h2>

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
                                placeholder="Search articles..."
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
                            No articles yet.
                        </p>
                    )}

                    {!loading && items.length > 0 && filteredItems.length === 0 && (
                        <p className="mt-4 rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-neutral-500">
                            No matching articles.
                        </p>
                    )}

                    <div className="mt-5 grid gap-4">
                        {filteredItems.map((item) => (
                            <article
                                key={item.id}
                                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
                            >
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                            {item.language}
                                        </span>

                                        {item.topic && (
                                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                                {item.topic}
                                            </span>
                                        )}

                                        {item.level && (
                                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                                                {item.level}
                                            </span>
                                        )}

                                        <span className="text-xs text-neutral-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {editingId !== item.id && (
                                        <div className="flex gap-2">
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
                                    <div className="mt-5 grid gap-5">
                                        <div className="grid gap-5 md:grid-cols-3">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                    Language
                                                </label>

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
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                    Topic
                                                </label>

                                                <select
                                                    value={editTopic}
                                                    onChange={(event) =>
                                                        setEditTopic(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                                >
                                                    {topics.map((topicItem) => (
                                                        <option key={topicItem} value={topicItem}>
                                                            {topicItem}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                    Level
                                                </label>

                                                <select
                                                    value={editLevel}
                                                    onChange={(event) =>
                                                        setEditLevel(event.target.value)
                                                    }
                                                    className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                                >
                                                    {levels.map((levelItem) => (
                                                        <option key={levelItem} value={levelItem}>
                                                            {levelItem}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                Title
                                            </label>

                                            <input
                                                value={editTitle}
                                                onChange={(event) => setEditTitle(event.target.value)}
                                                placeholder="Article title"
                                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                Content
                                            </label>

                                            <textarea
                                                value={editContent}
                                                onChange={(event) =>
                                                    setEditContent(event.target.value)
                                                }
                                                placeholder="Article content"
                                                rows={8}
                                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                Chinese translation
                                            </label>

                                            <textarea
                                                value={editTranslationZh}
                                                onChange={(event) =>
                                                    setEditTranslationZh(event.target.value)
                                                }
                                                placeholder="中文翻譯，可先留空"
                                                rows={5}
                                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                                Notes
                                            </label>

                                            <textarea
                                                value={editNotes}
                                                onChange={(event) => setEditNotes(event.target.value)}
                                                placeholder="Reading notes, vocabulary, grammar points..."
                                                rows={4}
                                                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6"
                                            />
                                        </div>

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
                                    <div className="mt-5 grid gap-5">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                                Title
                                            </p>

                                            <h3 className="mt-2 text-2xl font-semibold leading-8 text-neutral-950">
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                                Content
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-700">
                                                {item.content}
                                            </p>
                                        </div>

                                        {item.translation_zh && (
                                            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                                    Chinese translation
                                                </p>

                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
                                                    {item.translation_zh}
                                                </p>
                                            </div>
                                        )}

                                        {item.notes && (
                                            <div className="rounded-2xl bg-neutral-50 px-4 py-3">
                                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                                    Notes
                                                </p>

                                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-neutral-600">
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