import Link from "next/link";

export default function EnglishPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Language Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            English
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Your English module is designed for C1-level development: vocabulary
            refinement, sentence analysis, academic expression, and advanced
            reading practice.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Level
            </p>
            <h2 className="mt-2 text-2xl font-semibold">C1</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Focus on nuance, academic vocabulary, sentence structure, and
              precise expression.
            </p>
          </div>

          <Link
            href="/vocabulary"
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Database
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Vocabulary</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Save and review English words, meanings, examples, and familiarity
              status.
            </p>
          </Link>

          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Coming Soon
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Sentence Practice</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Practice translation, rewriting, and word-by-word analysis.
            </p>
          </div>

          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Coming Soon
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Articles</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Read advanced short articles with vocabulary and sentence notes.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Current Focus
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Advanced expression and analysis
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
            English should support not only vocabulary storage, but also
            sentence-level explanation, multiple translation versions, and
            detailed analysis of academic or philosophical passages.
          </p>
        </section>
      </div>
    </main>
  );
}