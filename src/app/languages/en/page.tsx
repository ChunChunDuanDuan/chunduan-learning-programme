import Link from "next/link";

export default function EnglishLanguagePage() {
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
            C1-level English learning space for vocabulary, sentence analysis,
            article reading, grammar review, and academic expression.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/vocabulary?language=en"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Vocabulary</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Review English words, collocations, usage notes, and example
              sentences.
            </p>
          </Link>

          <Link
            href="/sentences?language=en"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Sentence Practice</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Practise English sentence structure, style, and word-by-word
              analysis.
            </p>
          </Link>

          <Link
            href="/articles?language=en"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Articles</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Read English articles on culture, philosophy, science, history,
              literature, and daily life.
            </p>
          </Link>
        </section>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">English Tense Reference</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            A compact table for reviewing the basic tense-aspect system.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Form</th>
                  <th className="p-3 font-semibold">Example</th>
                  <th className="p-3 font-semibold">Main Use</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Simple</td>
                  <td className="p-3">I study every day.</td>
                  <td className="p-3">Habits, facts, regular actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Continuous</td>
                  <td className="p-3">I am studying now.</td>
                  <td className="p-3">Actions happening now or around now.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Present Perfect</td>
                  <td className="p-3">I have studied this before.</td>
                  <td className="p-3">Past action with present relevance.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Past Simple</td>
                  <td className="p-3">I studied yesterday.</td>
                  <td className="p-3">Completed past actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Past Continuous</td>
                  <td className="p-3">I was studying at eight.</td>
                  <td className="p-3">Ongoing past actions.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Future with will</td>
                  <td className="p-3">I will study tomorrow.</td>
                  <td className="p-3">Predictions, promises, spontaneous decisions.</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">Going to</td>
                  <td className="p-3">I am going to study tonight.</td>
                  <td className="p-3">Plans, intentions, visible future results.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Clause Patterns</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Basic sentence structures useful for reading and writing analysis.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Pattern</th>
                  <th className="p-3 font-semibold">Example</th>
                  <th className="p-3 font-semibold">Structure</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V</td>
                  <td className="p-3">She sleeps.</td>
                  <td className="p-3">Subject + verb.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V + O</td>
                  <td className="p-3">She reads a book.</td>
                  <td className="p-3">Subject + verb + object.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">S + V + C</td>
                  <td className="p-3">She is tired.</td>
                  <td className="p-3">Subject + linking verb + complement.</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">S + V + O + C</td>
                  <td className="p-3">They made him angry.</td>
                  <td className="p-3">Object followed by object complement.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}