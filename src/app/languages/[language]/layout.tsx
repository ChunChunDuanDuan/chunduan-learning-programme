import { notFound } from "next/navigation";
import { isLanguageCode, languages } from "@/lib/languages/config";
import { LocalNavigation } from "@/components/layout/local-navigation";
import {LanguageVisitTracker} from "@/components/languages/language-continue";
import {LanguageBackground} from "@/components/languages/language-background";
import {visualAsset} from "@/lib/pwa";
export async function generateMetadata({ params }: { params: Promise<{ language: string }> }) {
  const { language } = await params;
  return { title: isLanguageCode(language) ? `${languages[language].name} | Learning Programme` : "Language not found" };
}
export default async function LanguageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ language: string }> }) {
  const { language } = await params;
  if (!isLanguageCode(language)) notFound();
  const config = languages[language];
  return <LanguageBackground background={config.background} source={visualAsset(config.background.src)}><LanguageVisitTracker language={language}/><p className="mb-4 text-lg font-semibold">{config.name}</p><LocalNavigation className="language-navigation-surface" label={`${config.name} modules`} links={[
    { label: "Overview", href: config.route },
    ...config.modules.map((module) => ({ label: module==="grammar-tables"?"Grammar Tables":module[0].toUpperCase() + module.slice(1), href: `${config.route}/${module}` })),
  ]} />{children}</LanguageBackground>;
}
