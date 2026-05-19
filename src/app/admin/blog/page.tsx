"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase/client";

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

export default function BlogAdminPage() {
    const [checkingUser, setCheckingUser] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    async function loadPosts() {
        setLoadingPosts(true);
        setErrorMessage("");

        const { data: blogPosts, error } = await supabase
            .from("blog_posts")
            .select("*")
            .order("published_at", { ascending: false });

        if (error) {
            setErrorMessage(error.message);
            setLoadingPosts(false);
            return;
        }

        setPosts((blogPosts ?? []) as BlogPost[]);
        setLoadingPosts(false);
    }

    useEffect(() => {
        async function checkUserAndLoadPosts() {
            setCheckingUser(true);
            setErrorMessage("");

            const { data } = await supabase.auth.getUser();
            const email = data.user?.email;

            if (email !== "chiang.haoyueh2@gmail.com") {
                setAuthorized(false);
                setCheckingUser(false);
                return;
            }

            setAuthorized(true);
            setCheckingUser(false);

            await loadPosts();
        }

        checkUserAndLoadPosts();
    }, []);

    async function handleDeletePost(post: BlogPost) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${post.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(post.id);
        setDeleteMessage("");
        setErrorMessage("");

        const { error } = await supabase
            .from("blog_posts")
            .delete()
            .eq("id", post.id);

        if (error) {
            setErrorMessage(error.message);
            setDeletingId(null);
            return;
        }

        setPosts((currentPosts) =>
            currentPosts.filter((currentPost) => currentPost.id !== post.id)
        );

        setDeleteMessage("Blog post deleted successfully.");
        setDeletingId(null);
    }

    if (checkingUser) {
        return (
            <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
                <div className="mx-auto max-w-5xl">
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
                        You need to sign in as the Blog admin to manage posts.
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
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 border-b border-neutral-200 pb-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Blog Admin
                    </p>

                    <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-4xl font-semibold tracking-tight">
                                Manage Blog Posts
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                                View, edit, and delete all public and draft Blog posts.
                            </p>
                        </div>

                        <Link
                            href="/admin/blog/new"
                            className="inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium !text-white transition hover:bg-neutral-700"
                        >
                            New post
                        </Link>
                    </div>

                    <div className="mt-5 flex gap-4">
                        <Link
                            href="/blog"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            View public Blog
                        </Link>

                        <Link
                            href="/"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            Back to home
                        </Link>
                    </div>
                </header>

                {deleteMessage ? (
                    <section className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        {deleteMessage}
                    </section>
                ) : null}

                {loadingPosts ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-neutral-600">Loading posts...</p>
                    </section>
                ) : errorMessage ? (
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                        Failed: {errorMessage}
                    </section>
                ) : posts.length === 0 ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium">No posts yet.</h2>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            Create your first Blog post from the admin page.
                        </p>

                        <Link
                            href="/admin/blog/new"
                            className="mt-5 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium !text-white transition hover:bg-neutral-700"
                        >
                            Create first post
                        </Link>
                    </section>
                ) : (
                    <section className="space-y-4">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                                {post.published_at}
                                            </p>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${post.is_public
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-neutral-100 text-neutral-600"
                                                    }`}
                                            >
                                                {post.is_public ? "Public" : "Draft"}
                                            </span>
                                        </div>

                                        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                                            {post.title}
                                        </h2>

                                        <p className="mt-2 text-sm text-neutral-500">
                                            /blog/{post.slug}
                                        </p>

                                        {post.excerpt ? (
                                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                                {post.excerpt}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-3">
                                        {post.is_public ? (
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                                            >
                                                View
                                            </Link>
                                        ) : null}

                                        <Link
                                            href={`/admin/blog/${post.id}/edit`}
                                            className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() => handleDeletePost(post)}
                                            disabled={deletingId === post.id}
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {deletingId === post.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}