"use client";

import { useEffect, useRef, useState } from "react";
import { todayInTaipei } from "../../lib/fitness";
import { supabase } from "../../lib/supabase/client";
import {
  MEAL_PERIOD_LABELS,
  MEAL_PERIODS,
  type FoodEntry,
  type MealPeriod,
} from "../../types/fitness";
import { DateNavigator } from "./date-navigator";
import { FoodEntryForm, type FoodEntryDraft } from "./food-entry-form";
import { FoodEntryItem } from "./food-entry-item";

type DailyFoodLogProps = { userId: string };
type LoadStatus = "loading" | "idle" | "error";

export function DailyFoodLog({ userId }: DailyFoodLogProps) {
  const [date, setDate] = useState(todayInTaipei);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState<MealPeriod | null>(null);
  const [message, setMessage] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    const currentRequest = ++requestId.current;

    async function load() {
      const { data, error } = await supabase
        .from("food_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("date", date)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (currentRequest !== requestId.current) return;
      if (error) {
        setStatus("error");
        setMessage(`Failed to load food entries: ${error.message}`);
        return;
      }

      setEntries((data ?? []) as FoodEntry[]);
      setStatus("idle");
    }

    void load();
  }, [date, userId]);

  function changeDate(nextDate: string) {
    setStatus("loading");
    setMessage("");
    setOpenForm(null);
    setDate(nextDate);
  }

  function success(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage((current) => (current === text ? "" : current)), 2500);
  }

  async function addEntry(period: MealPeriod, draft: FoodEntryDraft) {
    const operationId = `add-${period}`;
    setPendingId(operationId);
    setMessage("");
    const periodEntries = entries.filter((entry) => entry.meal_period === period);
    const sortOrder = periodEntries.length
      ? Math.max(...periodEntries.map((entry) => entry.sort_order)) + 1
      : 0;

    const { data, error } = await supabase
      .from("food_entries")
      .insert({
        user_id: userId,
        date,
        meal_period: period,
        food_name: draft.foodName.trim(),
        amount: draft.amount.trim() || null,
        note: draft.note.trim() || null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    setPendingId(null);
    if (error) {
      setMessage(`Failed to add food entry: ${error.message}`);
      return false;
    }

    setEntries((current) => [...current, data as FoodEntry]);
    setOpenForm(null);
    success("Food entry added.");
    return true;
  }

  async function updateEntry(entry: FoodEntry, draft: FoodEntryDraft) {
    setPendingId(entry.id);
    setMessage("");
    const { data, error } = await supabase
      .from("food_entries")
      .update({
        food_name: draft.foodName.trim(),
        amount: draft.amount.trim() || null,
        note: draft.note.trim() || null,
      })
      .eq("id", entry.id)
      .eq("user_id", userId)
      .select()
      .single();

    setPendingId(null);
    if (error) {
      setMessage(`Failed to update food entry: ${error.message}`);
      return false;
    }

    setEntries((current) => current.map((item) => (item.id === entry.id ? (data as FoodEntry) : item)));
    success("Food entry updated.");
    return true;
  }

  async function deleteEntry(entry: FoodEntry) {
    if (!window.confirm(`Delete “${entry.food_name}”?`)) return;

    setPendingId(entry.id);
    setMessage("");
    const { error } = await supabase
      .from("food_entries")
      .delete()
      .eq("id", entry.id)
      .eq("user_id", userId);
    setPendingId(null);

    if (error) {
      setMessage(`Failed to delete food entry: ${error.message}`);
      return;
    }

    setEntries((current) => current.filter((item) => item.id !== entry.id));
    success("Food entry deleted.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Daily Food Log</h2>
          <p className="mt-1 text-sm text-neutral-500">Entries follow your local calendar date. Calories are not calculated.</p>
        </div>
        <DateNavigator date={date} onChange={changeDate} disabled={status === "loading" || pendingId !== null} />
      </div>

      {message ? (
        <p className={`rounded-xl border px-4 py-3 text-sm ${message.startsWith("Failed") ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-700"}`} role="status">
          {message}
        </p>
      ) : null}

      {status === "loading" ? (
        <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500">Loading food entries…</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {MEAL_PERIODS.map((period) => {
            const periodEntries = entries.filter((entry) => entry.meal_period === period);
            return (
              <section key={period} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{MEAL_PERIOD_LABELS[period]}</h3>
                  <button
                    type="button"
                    onClick={() => setOpenForm(period)}
                    disabled={pendingId !== null || openForm === period}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 disabled:opacity-50"
                  >
                    + Add
                  </button>
                </div>

                {openForm === period ? (
                  <FoodEntryForm
                    pending={pendingId === `add-${period}`}
                    onCancel={() => setOpenForm(null)}
                    onSubmit={(draft) => addEntry(period, draft)}
                  />
                ) : null}

                <div className="mt-3">
                  {periodEntries.length === 0 ? (
                    <p className="py-5 text-sm text-neutral-400">No entries yet</p>
                  ) : (
                    periodEntries.map((entry) => (
                      <FoodEntryItem
                        key={entry.id}
                        entry={entry}
                        pending={pendingId === entry.id}
                        onUpdate={updateEntry}
                        onDelete={deleteEntry}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
