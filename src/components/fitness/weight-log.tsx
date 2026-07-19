"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { filterWeightsByRange, todayInTaipei, validateWeight } from "../../lib/fitness";
import { supabase } from "../../lib/supabase/client";
import type { WeightEntry, WeightRange } from "../../types/fitness";
import { DateNavigator } from "./date-navigator";
import { WeightSummary } from "./weight-summary";
import { WeightTrendChart } from "./weight-trend-chart";

export function WeightLog({ userId }: { userId: string }) {
  const today = todayInTaipei();
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [range, setRange] = useState<WeightRange>("4w");
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "deleting">("loading");
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;

    async function load() {
      const { data, error } = await supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (currentRequest !== requestId.current) return;
      if (error) {
        setMessage(`Failed to load weight entries: ${error.message}`);
        setStatus("idle");
        return;
      }

      const loadedEntries = (data ?? []).map((item) => ({ ...item, weight_kg: Number(item.weight_kg) })) as WeightEntry[];
      setEntries(loadedEntries);
      const currentEntry = loadedEntries.find((entry) => entry.date === today);
      setWeight(currentEntry ? Number(currentEntry.weight_kg).toString() : "");
      setStatus("idle");
    }

    void load();
  }, [today, userId]);

  const selectedEntry = entries.find((entry) => entry.date === date) ?? null;

  const visibleEntries = useMemo(
    () => filterWeightsByRange(entries, range, today),
    [entries, range, today]
  );

  function success(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => current === text ? "" : current), 2500);
  }

  function changeDate(nextDate: string) {
    setDate(nextDate);
    const nextEntry = entries.find((entry) => entry.date === nextDate);
    setWeight(nextEntry ? Number(nextEntry.weight_kg).toString() : "");
    setMessage("");
  }

  async function save() {
    const validationError = validateWeight(weight);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setStatus("saving");
    setMessage("");
    const { data, error } = await supabase
      .from("weight_entries")
      .upsert(
        { user_id: userId, date, weight_kg: Number(Number(weight).toFixed(2)) },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    setStatus("idle");
    if (error) {
      setMessage(`Failed to save weight entry: ${error.message}`);
      return;
    }

    const saved = { ...data, weight_kg: Number(data.weight_kg) } as WeightEntry;
    setEntries((current) => [...current.filter((entry) => entry.date !== date), saved].sort((a, b) => a.date.localeCompare(b.date)));
    success(selectedEntry ? "Weight entry updated." : "Weight entry saved.");
  }

  async function remove() {
    if (!selectedEntry || !window.confirm(`Delete the weight entry for ${date}?`)) return;
    setStatus("deleting");
    setMessage("");
    const { error } = await supabase
      .from("weight_entries")
      .delete()
      .eq("id", selectedEntry.id)
      .eq("user_id", userId);
    setStatus("idle");

    if (error) {
      setMessage(`Failed to delete weight entry: ${error.message}`);
      return;
    }

    setEntries((current) => current.filter((entry) => entry.id !== selectedEntry.id));
    setWeight("");
    success("Weight entry deleted.");
  }

  const busy = status !== "idle";

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">This Morning&apos;s Weight</h2>
            <p className="mt-1 text-sm text-neutral-500">Only one entry is kept for each date.</p>
          </div>
          <DateNavigator date={date} onChange={changeDate} disabled={busy} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block sm:max-w-xs">
            <span className="text-sm font-medium text-neutral-700">Weight</span>
            <span className="mt-2 flex overflow-hidden rounded-xl border border-neutral-300 bg-white focus-within:border-neutral-950">
              <input
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                disabled={busy}
                placeholder="64.2"
                aria-label="Weight in kilograms"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-lg outline-none"
              />
              <span className="border-l border-neutral-300 px-4 py-3 text-sm text-neutral-500">kg</span>
            </span>
          </label>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium !text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : selectedEntry ? "Update" : "Save"}
          </button>
          {selectedEntry ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-600 transition hover:border-red-400 disabled:opacity-50"
            >
              {status === "deleting" ? "Deleting…" : "Delete"}
            </button>
          ) : null}
        </div>
        <p className="mt-4 text-sm leading-6 text-neutral-500">For consistent results, measure after waking up and using the bathroom, before eating.</p>
        {message ? (
          <p role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.startsWith("Failed") || message.startsWith("Weight must") || message.startsWith("Enter a valid") ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`}>
            {message}
          </p>
        ) : null}
      </section>

      {status === "loading" ? (
        <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500">Loading weight entries…</div>
      ) : (
        <>
          <WeightTrendChart entries={visibleEntries} range={range} today={today} onRangeChange={setRange} />
          <WeightSummary entries={visibleEntries} />
        </>
      )}
    </div>
  );
}
