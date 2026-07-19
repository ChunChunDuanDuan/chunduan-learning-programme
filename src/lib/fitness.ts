import type { WeightEntry, WeightRange } from "../types/fitness";

const DAY_MS = 86_400_000;

function datePartsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function todayInTaipei(now = new Date()) {
  return datePartsInTimeZone(now, "Asia/Taipei");
}

export function parseCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatCalendarDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function shiftCalendarDate(value: string, days: number) {
  const date = parseCalendarDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatCalendarDate(date);
}

export function calendarDayDistance(from: string, to: string) {
  return Math.round(
    (parseCalendarDate(to).getTime() - parseCalendarDate(from).getTime()) / DAY_MS
  );
}

export function formatDateLabel(value: string, includeYear = false) {
  const date = parseCalendarDate(value);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: includeYear ? "numeric" : undefined,
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function subtractMonths(dateValue: string, months: number) {
  const date = parseCalendarDate(dateValue);
  const originalDay = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() - months);
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)
  ).getUTCDate();
  date.setUTCDate(Math.min(originalDay, lastDay));
  return formatCalendarDate(date);
}

export function getRangeBounds(
  range: WeightRange,
  today: string,
  entries: WeightEntry[]
) {
  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = ordered.at(-1)?.date ?? today;

  if (range === "all") {
    return {
      start: ordered[0]?.date ?? today,
      end: latest,
    };
  }

  const start =
    range === "7d"
      ? shiftCalendarDate(today, -6)
      : range === "14d"
        ? shiftCalendarDate(today, -13)
        : range === "4w"
          ? shiftCalendarDate(today, -27)
          : range === "8w"
            ? shiftCalendarDate(today, -55)
            : range === "3m"
              ? subtractMonths(today, 3)
              : range === "6m"
                ? subtractMonths(today, 6)
                : subtractMonths(today, 12);

  return { start, end: today };
}

export function filterWeightsByRange(
  entries: WeightEntry[],
  range: WeightRange,
  today: string
) {
  const bounds = getRangeBounds(range, today, entries);
  return [...entries]
    .filter((entry) => entry.date >= bounds.start && entry.date <= bounds.end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function summarizeWeights(entries: WeightEntry[]) {
  if (entries.length === 0) {
    return null;
  }

  const ordered = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const first = ordered[0];
  const latest = ordered[ordered.length - 1];
  const values = ordered.map((entry) => Number(entry.weight_kg));

  return {
    latest: Number(latest.weight_kg),
    latestDate: latest.date,
    first: Number(first.weight_kg),
    firstDate: first.date,
    change: Number(latest.weight_kg) - Number(first.weight_kg),
    highest: Math.max(...values),
    lowest: Math.min(...values),
  };
}

export function validateWeight(value: string) {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) {
    return "Enter a valid weight with up to two decimal places.";
  }

  const weight = Number(value);
  if (weight < 20 || weight > 300) {
    return "Weight must be between 20 and 300 kg.";
  }

  return null;
}
