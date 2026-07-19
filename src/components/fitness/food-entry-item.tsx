"use client";

import { useState } from "react";
import type { FoodEntry } from "../../types/fitness";
import { FoodEntryForm, type FoodEntryDraft } from "./food-entry-form";

type FoodEntryItemProps = {
  entry: FoodEntry;
  pending: boolean;
  onUpdate: (entry: FoodEntry, draft: FoodEntryDraft) => Promise<boolean>;
  onDelete: (entry: FoodEntry) => Promise<void>;
};

export function FoodEntryItem({ entry, pending, onUpdate, onDelete }: FoodEntryItemProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <FoodEntryForm
        initial={{
          foodName: entry.food_name,
          amount: entry.amount ?? "",
          note: entry.note ?? "",
        }}
        submitLabel="Save"
        pending={pending}
        onCancel={() => setEditing(false)}
        onSubmit={async (draft) => {
          const saved = await onUpdate(entry, draft);
          if (saved) setEditing(false);
          return saved;
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-100 py-4 first:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-neutral-900">{entry.food_name}</p>
        {entry.amount ? <p className="mt-1 text-sm text-neutral-600">{entry.amount}</p> : null}
        {entry.note ? <p className="mt-1 text-sm leading-6 text-neutral-500">{entry.note}</p> : null}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={pending}
          className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-950 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry)}
          disabled={pending}
          className="text-sm text-red-600 underline-offset-4 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
