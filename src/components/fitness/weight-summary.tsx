import { formatDateLabel, summarizeWeights } from "../../lib/fitness";
import type { WeightEntry } from "../../types/fitness";

export function WeightSummary({ entries }: { entries: WeightEntry[] }) {
  const summary = summarizeWeights(entries);
  const change = summary
    ? `${summary.change > 0 ? "+" : ""}${summary.change.toFixed(1)} kg`
    : "—";
  const items = [
    { label: "Latest Weight", value: summary ? `${summary.latest.toFixed(1)} kg` : "—", detail: summary ? formatDateLabel(summary.latestDate, true) : "" },
    { label: "Starting Weight", value: summary ? `${summary.first.toFixed(1)} kg` : "—", detail: summary ? formatDateLabel(summary.firstDate, true) : "" },
    { label: "Change", value: change, detail: "" },
    { label: "Highest", value: summary ? `${summary.highest.toFixed(1)} kg` : "—", detail: "" },
    { label: "Lowest", value: summary ? `${summary.lowest.toFixed(1)} kg` : "—", detail: "" },
  ];

  return (
    <section className="grid overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="border-b border-neutral-200 p-5 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0">
          <p className="text-sm text-neutral-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
          {item.detail ? <p className="mt-1 text-xs text-neutral-400">{item.detail}</p> : null}
        </div>
      ))}
    </section>
  );
}
