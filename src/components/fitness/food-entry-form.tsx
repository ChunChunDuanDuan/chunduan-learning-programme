"use client";

import { useState } from "react";

export type FoodEntryDraft = {
  foodName: string;
  amount: string;
  note: string;
};

type FoodEntryFormProps = {
  initial?: FoodEntryDraft;
  submitLabel?: string;
  pending: boolean;
  onSubmit: (draft: FoodEntryDraft) => Promise<boolean>;
  onCancel: () => void;
};

const emptyDraft: FoodEntryDraft = { foodName: "", amount: "", note: "" };

export function FoodEntryForm({
  initial = emptyDraft,
  submitLabel = "Add",
  pending,
  onSubmit,
  onCancel,
}: FoodEntryFormProps) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.foodName.trim()) {
      setError("Food name is required.");
      return;
    }

    setError("");
    if (await onSubmit(draft)) {
      setDraft(emptyDraft);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-xl bg-neutral-50 p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Food Name *</span>
          <input
            value={draft.foodName}
            onChange={(event) => setDraft({ ...draft, foodName: event.target.value })}
            disabled={pending}
            autoFocus
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-neutral-700">Amount</span>
          <input
            value={draft.amount}
            onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            disabled={pending}
            placeholder="For example: 115 g, 2 pieces, one bowl"
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-950"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-neutral-700">Notes</span>
          <input
            value={draft.note}
            onChange={(event) => setDraft({ ...draft, note: event.target.value })}
            disabled={pending}
            className="mt-2 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-950"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium !text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
