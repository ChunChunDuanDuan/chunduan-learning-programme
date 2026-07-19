import assert from "node:assert/strict";
import test from "node:test";
import {
  calendarDayDistance,
  filterWeightsByRange,
  getRangeBounds,
  shiftCalendarDate,
  summarizeWeights,
  validateWeight,
} from "../src/lib/fitness";
import type { WeightEntry } from "../src/types/fitness";

function entry(date: string, weight: number): WeightEntry {
  return {
    id: date,
    user_id: "user",
    date,
    weight_kg: weight,
    created_at: "",
    updated_at: "",
  };
}

test("calendar date helpers do not drift through UTC", () => {
  assert.equal(shiftCalendarDate("2026-03-01", -1), "2026-02-28");
  assert.equal(calendarDayDistance("2026-02-28", "2026-03-02"), 2);
});

test("recent ranges include today and the requested number of calendar days", () => {
  assert.deepEqual(getRangeBounds("7d", "2026-07-19", []), {
    start: "2026-07-13",
    end: "2026-07-19",
  });
  assert.deepEqual(getRangeBounds("4w", "2026-07-19", []), {
    start: "2026-06-22",
    end: "2026-07-19",
  });
  assert.deepEqual(
    getRangeBounds("all", "2026-07-19", [entry("2026-07-01", 64), entry("2026-07-10", 63.8)]),
    { start: "2026-07-01", end: "2026-07-10" }
  );
});

test("weight filtering preserves real dates and chronological order", () => {
  const values = [
    entry("2026-07-19", 64.1),
    entry("2026-07-01", 64.8),
    entry("2026-07-18", 64.2),
  ];
  assert.deepEqual(
    filterWeightsByRange(values, "7d", "2026-07-19").map((item) => item.date),
    ["2026-07-18", "2026-07-19"]
  );
});

test("weight summary follows first and last entries", () => {
  assert.deepEqual(summarizeWeights([entry("2026-07-03", 64.1)]), {
    latest: 64.1,
    latestDate: "2026-07-03",
    first: 64.1,
    firstDate: "2026-07-03",
    change: 0,
    highest: 64.1,
    lowest: 64.1,
  });
});

test("weight validation rejects invalid and out-of-range values", () => {
  assert.equal(validateWeight("64.25"), null);
  assert.ok(validateWeight(""));
  assert.ok(validateWeight("0"));
  assert.ok(validateWeight("64.222"));
  assert.ok(validateWeight("301"));
});
