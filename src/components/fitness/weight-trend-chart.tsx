"use client";

import { useMemo, useState } from "react";
import {
  calendarDayDistance,
  formatDateLabel,
  getRangeBounds,
} from "../../lib/fitness";
import {
  WEIGHT_RANGES,
  WEIGHT_RANGE_LABELS,
  type WeightEntry,
  type WeightRange,
} from "../../types/fitness";

const WIDTH = 960;
const HEIGHT = 390;
const MARGIN = { top: 52, right: 22, bottom: 54, left: 54 };
const MIN_WEIGHT = 60;
const MAX_WEIGHT = 66;

type WeightTrendChartProps = {
  entries: WeightEntry[];
  range: WeightRange;
  today: string;
  onRangeChange: (range: WeightRange) => void;
};

export function WeightTrendChart({ entries, range, today, onRangeChange }: WeightTrendChartProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const bounds = useMemo(() => getRangeBounds(range, today, entries), [range, today, entries]);
  const totalDays = Math.max(1, calendarDayDistance(bounds.start, bounds.end));
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (date: string) => MARGIN.left + (calendarDayDistance(bounds.start, date) / totalDays) * plotWidth;
  const y = (weight: number) => MARGIN.top + ((MAX_WEIGHT - weight) / (MAX_WEIGHT - MIN_WEIGHT)) * plotHeight;
  const inRangeEntries = entries.filter((entry) => Number(entry.weight_kg) >= MIN_WEIGHT && Number(entry.weight_kg) <= MAX_WEIGHT);
  const outOfRangeCount = entries.length - inRangeEntries.length;
  const activeEntry = entries.find((entry) => entry.id === activeId) ?? null;

  const dayTickStep = totalDays <= 7 ? 1 : totalDays <= 14 ? 2 : totalDays <= 60 ? 7 : totalDays <= 200 ? 14 : totalDays <= 400 ? 30 : Math.max(30, Math.round(totalDays / 12));
  const dateTicks = Array.from({ length: Math.floor(totalDays / dayTickStep) + 1 }, (_, index) => {
    const day = Math.min(index * dayTickStep, totalDays);
    const date = new Date(Date.parse(`${bounds.start}T00:00:00Z`) + day * 86_400_000).toISOString().slice(0, 10);
    return { date, day };
  });

  const weekCount = range === "4w" ? 4 : range === "8w" ? 8 : 0;
  const points = inRangeEntries.map((entry) => `${x(entry.date)},${y(Number(entry.weight_kg))}`).join(" ");

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Weight Trend</h3>
          <p className="mt-1 text-sm text-neutral-500">The vertical axis is fixed at 60–66 kg.</p>
        </div>
        <label className="flex items-center gap-3 text-sm text-neutral-600">
          <span>Display Range</span>
          <select
            value={range}
            onChange={(event) => onRangeChange(event.target.value as WeightRange)}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-950"
          >
            {WEIGHT_RANGES.map((value) => <option key={value} value={value}>{WEIGHT_RANGE_LABELS[value]}</option>)}
          </select>
        </label>
      </div>

      {entries.length === 0 ? (
        <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl bg-neutral-50 px-6 text-center text-sm text-neutral-500">
          No weight entries for this period yet.
        </div>
      ) : (
        <div className="mt-5 w-full" aria-label="Weight line chart">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={`${WEIGHT_RANGE_LABELS[range]} weight trend, vertical axis 60 to 66 kilograms`}>
            {weekCount > 0 ? Array.from({ length: weekCount }, (_, index) => {
              const weekWidth = plotWidth / weekCount;
              return (
                <g key={index}>
                  {index % 2 === 1 ? <rect x={MARGIN.left + weekWidth * index} y={MARGIN.top} width={weekWidth} height={plotHeight} className="fill-neutral-50" /> : null}
                  {index > 0 ? <line x1={MARGIN.left + weekWidth * index} x2={MARGIN.left + weekWidth * index} y1={MARGIN.top - 8} y2={MARGIN.top + plotHeight} className="stroke-neutral-300" strokeDasharray="4 4" /> : null}
                  <text x={MARGIN.left + weekWidth * (index + 0.5)} y={MARGIN.top - 20} textAnchor="middle" className="fill-neutral-500 text-[12px]">Week {index + 1}</text>
                </g>
              );
            }) : null}

            {Array.from({ length: 7 }, (_, index) => MIN_WEIGHT + index).map((weight) => (
              <g key={weight}>
                <line x1={MARGIN.left} x2={WIDTH - MARGIN.right} y1={y(weight)} y2={y(weight)} className="stroke-neutral-200" />
                <text x={MARGIN.left - 12} y={y(weight) + 4} textAnchor="end" className="fill-neutral-500 text-[12px]">{weight}</text>
              </g>
            ))}
            <text x={12} y={MARGIN.top - 14} className="fill-neutral-500 text-[12px]">kg</text>

            {dateTicks.map((tick, index) => (
              <g key={tick.date}>
                <line x1={x(tick.date)} x2={x(tick.date)} y1={MARGIN.top + plotHeight} y2={MARGIN.top + plotHeight + 5} className="stroke-neutral-400" />
                <text x={x(tick.date)} y={HEIGHT - 22} textAnchor={index === 0 ? "start" : "middle"} className="fill-neutral-500 text-[11px]">{formatDateLabel(tick.date, totalDays > 365)}</text>
              </g>
            ))}

            {points ? <polyline points={points} fill="none" className="stroke-neutral-950" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /> : null}
            {inRangeEntries.map((entry) => (
              <circle
                key={entry.id}
                cx={x(entry.date)}
                cy={y(Number(entry.weight_kg))}
                r={activeId === entry.id ? 6 : 4}
                className="cursor-pointer fill-neutral-950 stroke-white"
                strokeWidth="2"
                tabIndex={0}
                onMouseEnter={() => setActiveId(entry.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(entry.id)}
                onBlur={() => setActiveId(null)}
                onClick={() => setActiveId((current) => current === entry.id ? null : entry.id)}
              />
            ))}

            {activeEntry && Number(activeEntry.weight_kg) >= MIN_WEIGHT && Number(activeEntry.weight_kg) <= MAX_WEIGHT ? (
              <g pointerEvents="none">
                <rect x={Math.min(WIDTH - 156, Math.max(8, x(activeEntry.date) - 70))} y={Math.max(8, y(Number(activeEntry.weight_kg)) - 62)} width="140" height="44" rx="9" className="fill-neutral-950" />
                <text x={Math.min(WIDTH - 86, Math.max(78, x(activeEntry.date)))} y={Math.max(27, y(Number(activeEntry.weight_kg)) - 43)} textAnchor="middle" className="fill-white text-[12px]">{formatDateLabel(activeEntry.date, true)}</text>
                <text x={Math.min(WIDTH - 86, Math.max(78, x(activeEntry.date)))} y={Math.max(43, y(Number(activeEntry.weight_kg)) - 27)} textAnchor="middle" className="fill-white text-[13px] font-semibold">{Number(activeEntry.weight_kg).toFixed(2)} kg</text>
              </g>
            ) : null}
          </svg>
        </div>
      )}

      {outOfRangeCount > 0 ? (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {outOfRangeCount} {outOfRangeCount === 1 ? "entry is" : "entries are"} outside the chart&apos;s 60–66 kg display range.
        </p>
      ) : null}
    </section>
  );
}
