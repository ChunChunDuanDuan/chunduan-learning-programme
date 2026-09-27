import { VisualEntryCard } from "@/components/visual-entry-card";
import { LANGUAGE_CODES, languages, crossLanguageVisual } from "@/lib/languages/config";
import { visualAsset } from "@/lib/pwa";
export default function LanguagesPage() {
  return <div className="space-y-10"><section aria-labelledby="languages-heading">
    <h1 id="languages-heading" className="mb-6 text-3xl font-semibold">Languages</h1>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{LANGUAGE_CODES.map((code) => <VisualEntryCard key={code} title={languages[code].name} href={languages[code].route} image={visualAsset(languages[code].visual)} />)}</div>
  </section><section aria-labelledby="comparison-heading" className="border-t border-neutral-200 pt-8">
    <h2 id="comparison-heading" className="mb-5 text-xl font-semibold">Cross-language</h2>
    <div className="max-w-sm"><VisualEntryCard title="Cross-language" href="/languages/cross-language" image={visualAsset(crossLanguageVisual)} /></div>
  </section></div>;
}
