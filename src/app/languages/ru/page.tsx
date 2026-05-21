import Link from "next/link";

export default function RussianLanguagePage() {
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
            Beginner Russian learning space for vocabulary, Cyrillic, everyday
            expressions, cases, conjugation, and sentence patterns.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/vocabulary?language=ru"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Vocabulary</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Review Russian words, translations, usage notes, collocations,
              and example sentences.
            </p>
          </Link>

          <Link
            href="/sentences?language=ru"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Sentence Practice</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Practise beginner Russian sentence patterns and everyday phrases.
            </p>
          </Link>

          <Link
            href="/articles?language=ru"
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">Articles</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Read short Russian texts with Traditional Chinese explanations.
            </p>
          </Link>
        </section>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Russian Present-Tense Conjugation</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            A beginner reference using говорить.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Pronoun</th>
                  <th className="p-3 font-semibold">Form</th>
                  <th className="p-3 font-semibold">Meaning</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3">я</td>
                  <td className="p-3">говорю</td>
                  <td className="p-3">I speak</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">ты</td>
                  <td className="p-3">говоришь</td>
                  <td className="p-3">you speak</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">он / она / оно</td>
                  <td className="p-3">говорит</td>
                  <td className="p-3">he / she / it speaks</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">мы</td>
                  <td className="p-3">говорим</td>
                  <td className="p-3">we speak</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">вы</td>
                  <td className="p-3">говорите</td>
                  <td className="p-3">you speak</td>
                </tr>

                <tr>
                  <td className="p-3">они</td>
                  <td className="p-3">говорят</td>
                  <td className="p-3">they speak</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Basic Russian Cases</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            A compact overview of the six main Russian cases.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-100">
                  <th className="p-3 font-semibold">Case</th>
                  <th className="p-3 font-semibold">Basic Function</th>
                  <th className="p-3 font-semibold">Example</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Именительный</td>
                  <td className="p-3">Subject</td>
                  <td className="p-3">Студент читает.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Винительный</td>
                  <td className="p-3">Direct object</td>
                  <td className="p-3">Я читаю книгу.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Родительный</td>
                  <td className="p-3">Of, from, absence</td>
                  <td className="p-3">У меня нет книги.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Дательный</td>
                  <td className="p-3">To, for</td>
                  <td className="p-3">Я даю книгу студенту.</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3 font-medium">Творительный</td>
                  <td className="p-3">With, by means of</td>
                  <td className="p-3">Я пишу ручкой.</td>
                </tr>

                <tr>
                  <td className="p-3 font-medium">Предложный</td>
                  <td className="p-3">About, in, on</td>
                  <td className="p-3">Я говорю о книге.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Essential Everyday Patterns</h2>

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
                  <td className="p-3">У меня есть...</td>
                  <td className="p-3">У меня есть книга.</td>
                  <td className="p-3">I have...</td>
                </tr>

                <tr className="border-b border-neutral-200">
                  <td className="p-3">Мне нравится...</td>
                  <td className="p-3">Мне нравится русский язык.</td>
                  <td className="p-3">I like...</td>
                </tr>

                <tr>
                  <td className="p-3">Я хочу...</td>
                  <td className="p-3">Я хочу пить.</td>
                  <td className="p-3">I want...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}