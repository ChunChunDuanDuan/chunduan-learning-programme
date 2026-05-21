import Link from "next/link";

export default function GermanLanguagePage() {
  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-8 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-neutral-200 pb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Language Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Deutsch
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
            A1-level German learning space for vocabulary, articles, cases,
            sentence patterns, and everyday expressions.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/vocabulary?language=de"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Vocabulary</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Review German words, articles, translations, collocations, and
              example sentences.
            </p>
          </Link>

          <Link
            href="/sentences?language=de"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Sentence Practice</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Practise A1-level German sentence patterns and grammar.
            </p>
          </Link>

          <Link
            href="/articles?language=de"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Articles</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Read short German texts with English explanations.
            </p>
          </Link>
        </section>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">German Article and Case Table</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            Definite and indefinite articles by case and gender.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Case</th>
                  <th className="p-3 font-semibold">Masculine</th>
                  <th className="p-3 font-semibold">Feminine</th>
                  <th className="p-3 font-semibold">Neuter</th>
                  <th className="p-3 font-semibold">Plural</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Nominativ</td>
                  <td className="p-3">der / ein</td>
                  <td className="p-3">die / eine</td>
                  <td className="p-3">das / ein</td>
                  <td className="p-3">die / —</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Akkusativ</td>
                  <td className="p-3">den / einen</td>
                  <td className="p-3">die / eine</td>
                  <td className="p-3">das / ein</td>
                  <td className="p-3">die / —</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Dativ</td>
                  <td className="p-3">dem / einem</td>
                  <td className="p-3">der / einer</td>
                  <td className="p-3">dem / einem</td>
                  <td className="p-3">den / —</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">Genitiv</td>
                  <td className="p-3">des / eines</td>
                  <td className="p-3">der / einer</td>
                  <td className="p-3">des / eines</td>
                  <td className="p-3">der / —</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Personal Pronouns</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            A compact table of nominative, accusative, and dative forms.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Meaning</th>
                  <th className="p-3 font-semibold">Nominativ</th>
                  <th className="p-3 font-semibold">Akkusativ</th>
                  <th className="p-3 font-semibold">Dativ</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3">I</td>
                  <td className="p-3">ich</td>
                  <td className="p-3">mich</td>
                  <td className="p-3">mir</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">you</td>
                  <td className="p-3">du</td>
                  <td className="p-3">dich</td>
                  <td className="p-3">dir</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">he</td>
                  <td className="p-3">er</td>
                  <td className="p-3">ihn</td>
                  <td className="p-3">ihm</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">she</td>
                  <td className="p-3">sie</td>
                  <td className="p-3">sie</td>
                  <td className="p-3">ihr</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">we</td>
                  <td className="p-3">wir</td>
                  <td className="p-3">uns</td>
                  <td className="p-3">uns</td>
                </tr>

                <tr>
                  <td className="p-3">they / formal you</td>
                  <td className="p-3">sie / Sie</td>
                  <td className="p-3">sie / Sie</td>
                  <td className="p-3">ihnen / Ihnen</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Common Verb Patterns</h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Pattern</th>
                  <th className="p-3 font-semibold">Example</th>
                  <th className="p-3 font-semibold">Meaning</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3">über etwas nachdenken</td>
                  <td className="p-3">Ich denke darüber nach.</td>
                  <td className="p-3">to think about something</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">mit jemandem sprechen</td>
                  <td className="p-3">Ich spreche mit dir.</td>
                  <td className="p-3">to speak with someone</td>
                </tr>

                <tr>
                  <td className="p-3">sich für etwas interessieren</td>
                  <td className="p-3">Ich interessiere mich für Philosophie.</td>
                  <td className="p-3">to be interested in something</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}