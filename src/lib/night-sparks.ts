import { supabase } from "./supabase/client";
import type { NightSparkEntry } from "../types/night-sparks";

export type CreateNightSparkInput = Omit<
  NightSparkEntry,
  "id" | "user_id" | "created_at" | "updated_at"
>;

const LOCAL_STORAGE_KEY = "night_sparks_entries";

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User is not logged in.");

  return user.id;
}

function readLocalEntries() {
  if (typeof window === "undefined") return [] as NightSparkEntry[];

  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return [] as NightSparkEntry[];

  try {
    return JSON.parse(stored) as NightSparkEntry[];
  } catch {
    return [] as NightSparkEntry[];
  }
}

function createLocalEntry(input: CreateNightSparkInput) {
  const now = new Date().toISOString();
  const entry: NightSparkEntry = {
    id: crypto.randomUUID(),
    user_id: "local",
    created_at: now,
    updated_at: now,
    ...input,
  };

  const entries = readLocalEntries();
  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify([entry, ...entries])
  );

  return entry;
}

export async function getNightSparkEntries() {
  const { data, error } = await supabase
    .from("night_sparks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return readLocalEntries();
  }

  return data as NightSparkEntry[];
}

export async function createNightSparkEntry(input: CreateNightSparkInput) {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("night_sparks")
      .insert({
        ...input,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return data as NightSparkEntry;
  } catch (error) {
    if (typeof window === "undefined") throw error;

    return createLocalEntry(input);
  }
}
