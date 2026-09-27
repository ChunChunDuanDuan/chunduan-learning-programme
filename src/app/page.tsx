import { VisualEntryCard } from "@/components/visual-entry-card";
import { ENVIRONMENT_KEYS, environments } from "@/lib/environments";
import { visualAsset } from "@/lib/pwa";
export default function HomePage() {
  return <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2" aria-label="Choose an environment">
    {ENVIRONMENT_KEYS.map((key) => <VisualEntryCard key={key} title={environments[key].title} href={environments[key].href} image={visualAsset(environments[key].visual)} variant="primary" />)}
  </div>;
}
