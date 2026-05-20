import Link from "next/link";

export default function RussianPage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Language Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Русский
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            Your Russian module is designed for beginner-level learning:
            alphabet, pronunciation, basic vocabulary, simple sentences, and
            grammatical foundations.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Level
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Beginner</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Focus on Cyrillic, pronunciation, essential words, and simple
              sentence formation.
            </p>
          </div>

          <Link
            href={{
              pathname: "/vocabulary",
              query: { language: "Русский" },
            }}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-neutral-300 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Database
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Vocabulary</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Save Russian words, meanings, example sentences, and learning
              status.
            </p>
          </Link>

          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Coming Soon
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Alphabet</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Learn Cyrillic letters, pronunciation, and basic sound patterns.
            </p>
          </div>

          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Coming Soon
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Sentence Practice</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Practice short beginner-level sentences with Traditional Chinese
              explanations.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Current Focus
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Alphabet and basic sentence formation
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
            Russian should begin from the immediate form of the language:
            Cyrillic letters, pronunciation, simple vocabulary, and basic
            patterns of sentence construction.
          </p>
        </section>
      </div>
    </main>
  );
}