const languageMap: Record<
  string,
  {
    title: string;
    level: string;
    explanation: string;
  }
> = {
  en: {
    title: "English",
    level: "C1",
    explanation: "Explanations are mainly in Traditional Chinese.",
  },
  de: {
    title: "Deutsch",
    level: "A1",
    explanation: "Sentence explanations are in English.",
  },
  ru: {
    title: "Русский",
    level: "Beginner",
    explanation: "Explanations are mainly in Traditional Chinese.",
  },
};

export default async function LanguageOverviewPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language: languageCode } = await params;
  const language = languageMap[languageCode] ?? languageMap.en;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-neutral-500">Language</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          {language.title}
        </h2>

        <p className="mt-3 text-neutral-600">
          Level: {language.level}. {language.explanation}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {["Vocabulary", "Grammar", "Sentences", "Articles"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5"
          >
            <h3 className="font-semibold text-neutral-950">{item}</h3>

            <p className="mt-2 text-sm text-neutral-600">
              This module will be connected to Supabase and AI tools later.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}