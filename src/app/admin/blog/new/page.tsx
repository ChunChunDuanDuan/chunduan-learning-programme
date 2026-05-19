"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase/client";

type SaveStatus = "idle" | "saving" | "success" | "error";

function createSlug(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function NewBlogPostPage() {
    const router = useRouter();

    const [checkingUser, setCheckingUser] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [publishedAt, setPublishedAt] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [status, setStatus] = useState<SaveStatus>("idle");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function checkUser() {
            const { data } = await supabase.auth.getUser();
            const email = data.user?.email;

            setAuthorized(email === "chiang.haoyueh2@gmail.com");
            setCheckingUser(false);
        }

        checkUser();
    }, []);

    function handleTitleChange(value: string) {
        setTitle(value);

        if (!slug) {
            setSlug(createSlug(value));
        }
    }

    async function uploadCoverImage() {
        if (!imageFile) {
            return null;
        }

        const fileExtension = imageFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("blog-images")
            .upload(filePath, imageFile, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage
            .from("blog-images")
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    async function handleSave() {
        setStatus("saving");
        setMessage("");

        if (!title.trim()) {
            setStatus("error");
            setMessage("Title is required.");
            return;
        }

        if (!slug.trim()) {
            setStatus("error");
            setMessage("Slug is required.");
            return;
        }

        if (!content.trim()) {
            setStatus("error");
            setMessage("Content is required.");
            return;
        }

        try {
            const coverImageUrl = await uploadCoverImage();

            const { error } = await supabase.from("blog_posts").insert({
                title: title.trim(),
                slug: slug.trim(),
                excerpt: excerpt.trim() || null,
                content: content.trim(),
                cover_image_url: coverImageUrl,
                published_at: publishedAt,
                is_public: isPublic,
            });

            if (error) {
                setStatus("error");
                setMessage(error.message);
                return;
            }

            setStatus("success");
            setMessage("Blog post saved successfully.");

            setTimeout(() => {
                router.push("/blog");
            }, 800);
        } catch (error) {
            setStatus("error");

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("Something went wrong.");
            }
        }
    }

    if (checkingUser) {
        return (
            <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
                <div className="mx-auto max-w-3xl">
                    <p className="text-sm text-neutral-600">Checking permission...</p>
                </div>
            </main>
        );
    }

    if (!authorized) {
        return (
            <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
                <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <h1 className="text-xl font-semibold">Not authorized</h1>

                    <p className="mt-2 text-sm">
                        You need to sign in as the Blog admin to create posts.
                    </p>

                    <Link
                        href="/login"
                        className="mt-4 inline-block text-sm underline underline-offset-4"
                    >
                        Go to login
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 border-b border-neutral-200 pb-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Blog Admin
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        New Blog Post
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Write a public or draft Blog post using Markdown. Images are
                        uploaded to Supabase Storage.
                    </p>

                    <div className="mt-5 flex gap-4">
                        <Link
                            href="/blog"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            View Blog
                        </Link>

                        <Link
                            href="/"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            Back to home
                        </Link>
                    </div>
                </header>

                <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Title
                        </label>

                        <input
                            value={title}
                            onChange={(event) => handleTitleChange(event.target.value)}
                            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                            placeholder="My first blog post"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Slug
                        </label>

                        <input
                            value={slug}
                            onChange={(event) => setSlug(createSlug(event.target.value))}
                            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                            placeholder="my-first-blog-post"
                        />

                        <p className="mt-2 text-xs text-neutral-500">
                            This becomes the URL: /blog/{slug || "your-slug"}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Published date
                        </label>

                        <input
                            type="date"
                            value={publishedAt}
                            onChange={(event) => setPublishedAt(event.target.value)}
                            className="mt-2 rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-950"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Excerpt
                        </label>

                        <textarea
                            value={excerpt}
                            onChange={(event) => setExcerpt(event.target.value)}
                            rows={3}
                            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-neutral-950"
                            placeholder="A short summary of this post."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Cover image
                        </label>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                setImageFile(file);
                            }}
                            className="mt-2 block w-full text-sm text-neutral-600"
                        />

                        <p className="mt-2 text-xs text-neutral-500">
                            Supported: JPG, PNG, WEBP, GIF.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Markdown content
                        </label>

                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            rows={16}
                            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-neutral-950"
                            placeholder={`## Heading

Write your Markdown here.

- Point one
- Point two

> Quote`}
                        />
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <input
                            id="is-public"
                            type="checkbox"
                            checked={isPublic}
                            onChange={(event) => setIsPublic(event.target.checked)}
                            className="h-4 w-4"
                        />

                        <label htmlFor="is-public" className="text-sm text-neutral-700">
                            Publish this post publicly
                        </label>
                    </div>

                    {message ? (
                        <div
                            className={`rounded-xl border p-4 text-sm ${status === "error"
                                    ? "border-red-200 bg-red-50 text-red-700"
                                    : "border-green-200 bg-green-50 text-green-700"
                                }`}
                        >
                            {message}
                        </div>
                    ) : null}

                    <button
                        onClick={handleSave}
                        disabled={status === "saving"}
                        className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400"
                    >
                        {status === "saving" ? "Saving..." : "Save post"}
                    </button>
                </section>
            </div>
        </main>
    );
}