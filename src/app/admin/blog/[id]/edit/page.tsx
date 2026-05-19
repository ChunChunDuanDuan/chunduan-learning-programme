"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../../lib/supabase/client";

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    published_at: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
};

type SaveStatus = "idle" | "loading" | "saving" | "success" | "error";

function createSlug(text: string) {
    return text
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = typeof params.id === "string" ? params.id : "";

    const [checkingUser, setCheckingUser] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const [post, setPost] = useState<BlogPost | null>(null);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [status, setStatus] = useState<SaveStatus>("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function checkUserAndLoadPost() {
            setCheckingUser(true);
            setStatus("loading");
            setMessage("");

            const { data: userData } = await supabase.auth.getUser();
            const email = userData.user?.email;

            if (email !== "chiang.haoyueh2@gmail.com") {
                setAuthorized(false);
                setCheckingUser(false);
                setStatus("idle");
                return;
            }

            setAuthorized(true);
            setCheckingUser(false);

            if (!id) {
                setStatus("error");
                setMessage("Missing blog post id.");
                return;
            }

            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("id", id)
                .limit(1);

            if (error) {
                setStatus("error");
                setMessage(error.message);
                return;
            }

            if (!data || data.length === 0) {
                setStatus("error");
                setMessage("Blog post not found.");
                return;
            }

            const loadedPost = data[0] as BlogPost;

            setPost(loadedPost);
            setTitle(loadedPost.title);
            setSlug(loadedPost.slug);
            setPublishedAt(loadedPost.published_at);
            setExcerpt(loadedPost.excerpt ?? "");
            setContent(loadedPost.content);
            setIsPublic(loadedPost.is_public);
            setCoverImageUrl(loadedPost.cover_image_url);

            setStatus("idle");
        }

        checkUserAndLoadPost();
    }, [id]);

    function handleTitleChange(value: string) {
        setTitle(value);
    }

    async function uploadNewCoverImage() {
        if (!imageFile) {
            return coverImageUrl;
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
            const finalCoverImageUrl = await uploadNewCoverImage();

            const { error } = await supabase
                .from("blog_posts")
                .update({
                    title: title.trim(),
                    slug: slug.trim(),
                    excerpt: excerpt.trim() || null,
                    content: content.trim(),
                    cover_image_url: finalCoverImageUrl,
                    published_at: publishedAt,
                    is_public: isPublic,
                })
                .eq("id", id);

            if (error) {
                setStatus("error");
                setMessage(error.message);
                return;
            }

            setStatus("success");
            setMessage("Blog post updated successfully.");

            setTimeout(() => {
                router.push("/admin/blog");
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
                <div className="mx-auto max-w-4xl">
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
                        You need to sign in as the Blog admin to edit posts.
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

    if (status === "loading") {
        return (
            <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
                <div className="mx-auto max-w-4xl">
                    <p className="text-sm text-neutral-600">Loading blog post...</p>
                </div>
            </main>
        );
    }

    if (status === "error" && !post) {
        return (
            <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
                <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                    <h1 className="text-xl font-semibold">Cannot load post</h1>
                    <p className="mt-2 text-sm">{message}</p>

                    <Link
                        href="/admin/blog"
                        className="mt-4 inline-block text-sm underline underline-offset-4"
                    >
                        Back to Blog Admin
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
                        Edit Blog Post
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Update title, slug, Markdown content, cover image, and publication
                        status.
                    </p>

                    <div className="mt-5 flex gap-4">
                        <Link
                            href="/admin/blog"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            Back to Blog Admin
                        </Link>

                        {isPublic ? (
                            <Link
                                href={`/blog/${slug}`}
                                className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                            >
                                View public post
                            </Link>
                        ) : null}
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Current cover image
                        </label>

                        {coverImageUrl ? (
                            <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                                <img
                                    src={coverImageUrl}
                                    alt={title}
                                    className="max-h-72 w-full object-cover"
                                />
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-neutral-500">
                                No cover image yet.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Upload new cover image
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
                            Leave empty if you do not want to change the current image.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700">
                            Markdown content
                        </label>

                        <textarea
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            rows={18}
                            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-neutral-950"
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
                        {status === "saving" ? "Saving..." : "Save changes"}
                    </button>
                </section>
            </div>
        </main>
    );
}