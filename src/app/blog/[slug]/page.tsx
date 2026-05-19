"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    published_at: string;
    is_public: boolean;
};

export default function BlogPostPage() {
    const params = useParams();
    const slug = typeof params.slug === "string" ? params.slug : "";

    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadPost() {
            if (!slug) {
                setErrorMessage("Missing slug.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMessage("");

            const { data, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("slug", slug)
                .eq("is_public", true)
                .limit(1);

            if (error) {
                setErrorMessage(error.message);
                setLoading(false);
                return;
            }

            if (!data || data.length === 0) {
                setPost(null);
                setLoading(false);
                return;
            }

            setPost(data[0] as BlogPost);
            setLoading(false);
        }

        loadPost();
    }, [slug]);

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
                    >
                        ← Back to Blog
                    </Link>
                </div>

                {loading ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <p className="text-sm text-neutral-600">Loading post...</p>
                    </section>
                ) : errorMessage ? (
                    <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                        Failed to load blog post: {errorMessage}
                    </section>
                ) : !post ? (
                    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h1 className="text-xl font-semibold">Post not found.</h1>
                        <p className="mt-2 text-sm text-neutral-600">
                            This post may not exist, may not be public, or the slug may be
                            incorrect.
                        </p>
                    </section>
                ) : (
                    <article>
                        <header className="mb-8 border-b border-neutral-200 pb-6">
                            <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                                {post.published_at}
                            </p>

                            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                                {post.title}
                            </h1>

                            {post.excerpt ? (
                                <p className="mt-4 text-base leading-7 text-neutral-600">
                                    {post.excerpt}
                                </p>
                            ) : null}
                        </header>

                        {post.cover_image_url ? (
                            <div className="mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm">
                                <img
                                    src={post.cover_image_url}
                                    alt={post.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        ) : null}

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ children }) => (
                                        <h1 className="mb-4 mt-8 text-3xl font-semibold tracking-tight first:mt-0">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="mb-3 mt-7 text-2xl font-semibold tracking-tight">
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="mb-2 mt-6 text-xl font-semibold">{children}</h3>
                                    ),
                                    p: ({ children }) => (
                                        <p className="my-4 text-base leading-8 text-neutral-700">
                                            {children}
                                        </p>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="my-4 list-disc space-y-2 pl-6 text-neutral-700">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="my-4 list-decimal space-y-2 pl-6 text-neutral-700">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => <li className="leading-7">{children}</li>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="my-5 border-l-4 border-neutral-300 pl-4 text-neutral-600">
                                            {children}
                                        </blockquote>
                                    ),
                                    code: ({ children }) => (
                                        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
                                            {children}
                                        </code>
                                    ),
                                    pre: ({ children }) => (
                                        <pre className="my-5 overflow-x-auto rounded-xl bg-neutral-950 p-4 text-sm text-neutral-50">
                                            {children}
                                        </pre>
                                    ),
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline underline-offset-4 hover:text-neutral-500"
                                        >
                                            {children}
                                        </a>
                                    ),
                                }}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                    </article>
                )}
            </div>
        </main>
    );
}