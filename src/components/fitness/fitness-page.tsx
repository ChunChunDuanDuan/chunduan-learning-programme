"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { DailyFoodLog } from "./daily-food-log";
import { WeightLog } from "./weight-log";

type FitnessTab = "food" | "weight";

export function FitnessPage() {
  const [tab, setTab] = useState<FitnessTab>("food");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) {
        setError("We could not verify your account. Sign in again and retry.");
        return;
      }
      setUserId(data.user.id);
    }
    void loadUser();
  }, []);

  return (
    <main className="fitness-theme mx-auto max-w-6xl text-neutral-950">
      <header className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight">Fitness</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Keep a simple daily record of your meals and weight.
        </p>
      </header>

      <div className="mb-6 flex border-b border-neutral-200" role="tablist" aria-label="Fitness record type">
        {([
          ["food", "Food Log"],
          ["weight", "Weight Log"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`border-b-2 px-5 py-3 text-sm font-medium transition ${tab === value ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : !userId ? (
        <div className="rounded-2xl border border-neutral-200 p-8 text-sm text-neutral-500">Loading fitness records…</div>
      ) : tab === "food" ? (
        <DailyFoodLog userId={userId} />
      ) : (
        <WeightLog userId={userId} />
      )}
    </main>
  );
}
