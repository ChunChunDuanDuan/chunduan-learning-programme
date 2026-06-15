"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { TextRecord } from "../types/text-linker";

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("User is not logged in.");
  return token;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function TextDatabase() {
  const [texts, setTexts] = useState<TextRecord[]>([]);
  const [loadingTexts, setLoadingTexts] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    author: "",
    translator: "",
    language: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadTexts();
  }, []);

  const filteredTexts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return texts;

    return texts.filter((text) => {
      const title = text.title.toLowerCase();
      const author = (text.author || "").toLowerCase();
      return title.includes(query) || author.includes(query);
    });
  }, [searchTerm, texts]);

  async function loadTexts() {
    setLoadingTexts(true);

    const { data, error } = await supabase
      .from("texts")
      .select("*, text_chunks(count)")
      .order("uploaded_at", { ascending: false });

    if (error) {
      setTexts([]);
      setFeedback("Could not load texts.");
      setLoadingTexts(false);
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
    setLoadingTexts(false);
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
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/text-database/texts/${id}/reprocess`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Reprocess failed.");
      setFeedback("Text sent for reprocessing.");
      await loadTexts();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Reprocess failed.");
    }
  }

  async function deleteText(id: string) {
    try {
      const token = await getAccessToken();
      const response = await fetch(`/api/text-database/texts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Delete failed.");
      setFeedback("Text deleted.");
      await loadTexts();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Delete failed.");
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link href="/night-sparks" className="text-sm font-bold text-neutral-500 hover:text-neutral-950">
          Back to Night Sparks
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-950 shadow-sm sm:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-400">Private Text Archive</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Text Database</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-500">
              你可以在這裡上傳自己的哲學文本 PDF。文本連結功能只會根據這些已匯入的文本回答，不會憑空補充資料庫中不存在的哲學家或著作。
            </p>
          </div>
          <Link href="/night-sparks" className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50">
            Use Textual Linker
          </Link>
        </header>

        {feedback ? (
          <p className="mt-6 rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">{feedback}</p>
        ) : null}

        <div className="mt-8 grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Upload Text</h2>
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
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">All Texts</h2>
            <p className="mt-1 text-sm text-neutral-500">Search by title or author, then manage the matching records.</p>
          </div>
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search title or author" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-950 sm:w-80" />
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
              {filteredTexts.map((text) => (
                <tr key={text.id} className="align-top">
                  <td className="border-b border-neutral-100 px-3 py-3 font-medium">
                    {text.title}
                    <p className="mt-1 text-xs text-neutral-400">{text.file_name}</p>
                    {text.ingestion_error ? <p className="mt-1 text-xs text-red-600">{text.ingestion_error}</p> : null}
                  </td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.author || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.translator || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.language || "-"}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{formatDate(text.uploaded_at)}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.ingestion_status}</td>
                  <td className="border-b border-neutral-100 px-3 py-3 text-neutral-600">{text.chunk_count ?? 0}</td>
                  <td className="border-b border-neutral-100 px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => reprocessText(text.id)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50">Reprocess</button>
                      <button type="button" onClick={() => deleteText(text.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingTexts && filteredTexts.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">{texts.length === 0 ? "No texts uploaded yet." : "No matching texts found."}</p>
          ) : null}
          {loadingTexts ? (
            <p className="rounded-xl border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">Loading texts...</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
