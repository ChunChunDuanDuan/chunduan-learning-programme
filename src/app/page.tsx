import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-950 sm:px-6 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <Link href="/" className="text-sm font-medium tracking-tight">
            ChunDuan&apos;s Learning Programme
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/blog"
              className="text-neutral-500 underline-offset-4 hover:text-neutral-950 hover:underline"
            >
              Blog
            </Link>

            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-4 py-2 text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
            >
              Login
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
              Personal Learning Website
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl xl:text-6xl">
              ChunDuan&apos;s Learning Programme
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
              A personal learning space for language study, daily reflection,
              philosophy, science, and long-form notes. The private learning
              system is available after login, while the public Blog collects
              selected writings and reflections.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/blog"
                className="inline-flex rounded-xl bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Read Blog
              </Link>

              <Link
                href="/login"
                className="inline-flex rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
              >
                Login to private area
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-neutral-200 pt-6 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Public
            </p>
            <h2 className="mt-3 text-lg font-semibold">Blog</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Public essays, notes, and reflections available without login.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Private
            </p>
            <h2 className="mt-3 text-lg font-semibold">Language Learning</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              English, Deutsch, and Русский learning modules for personal study.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Private
            </p>
            <h2 className="mt-3 text-lg font-semibold">Daily Logs</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Structured daily records for learning progress and reflection.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}