import Link from "next/link";
import { notFound } from "next/navigation";
import { isLanguageCode, languages } from "@/lib/languages/config";
import {ContinueLink} from "@/components/languages/language-continue";
export default async function Overview({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  if (!isLanguageCode(language)) notFound();
  const config = languages[language];
  return <div className="space-y-6"><h1 className="text-3xl font-semibold">{config.name}</h1>
    <div className="grid gap-3 sm:grid-cols-2">{config.modules.map((module) => <Link className="language-surface rounded-xl border border-neutral-200 p-5 text-lg capitalize hover:bg-white/95" key={module} href={`${config.route}/${module}`}>{module==="grammar-tables"?"Grammar Tables":module}</Link>)}</div>
    <ContinueLink language={language}/>
    <Link className="inline-flex min-h-11 items-center text-sm underline" href={`${config.route}/concepts`}>Concepts</Link>
    {language === "ja" ? <div className="flex flex-wrap gap-3">{["kana", "analysis", "anki"].map((tool) => <Link key={tool} className="rounded-lg border px-4 py-3 capitalize" href={`${config.route}/${tool}`}>{tool === "kana" ? "Kana practice" : tool === "analysis" ? "Sentence analysis" : "Anki drafts"}</Link>)}</div> : null}
  </div>;
}
