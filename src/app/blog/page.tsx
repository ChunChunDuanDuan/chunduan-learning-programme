"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";

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

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            setErrorMessage("");

            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("is_public", true)
                .order("published_at", { ascending: false });

            if (error) {
                setErrorMessage(error.message);
                setLoading(false);
                return;
            }

            setPosts((data ?? []) as BlogPost[]);
            setLoading(false);
        }

        loadPosts();
    }, []);

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 border-b border-neutral-200 pb-6">
                    <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                        Public Blog
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">Blog</h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
                        Public notes, reflections, and essays from ChunDuan&apos;s Learning
                        Programme.
                    </p>

                    <div className="mt-5">
                        <Link
                            href="/"
                            className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                        >
                            Back to home
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-neutral-600">Loading blog posts...</p>
                    </section>
                ) : errorMessage ? (
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                        Failed to load blog posts: {errorMessage}
                    </section>
                ) : posts.length === 0 ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium">No public posts yet.</h2>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                            Blog posts will appear here after they are published.
                        </p>
                    </section>
                ) : (
                    <section className="grid gap-5">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <Link href={`/blog/${post.slug}`} className="block">
                                    {post.cover_image_url ? (
                                        <div className="aspect-[16/7] w-full overflow-hidden bg-neutral-100">
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : null}

                                    <div className="p-6">
                                        <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                            {post.published_at}
                                        </p>

                                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
                                            {post.title}
                                        </h2>

                                        {post.excerpt ? (
                                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                                {post.excerpt}
                                            </p>
                                        ) : (
                                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                                {post.content.slice(0, 160)}
                                                {post.content.length > 160 ? "..." : ""}
                                            </p>
                                        )}

                                        <p className="mt-5 text-sm font-medium text-neutral-950">
                                            Read post →
                                        </p>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}