import { supabase } from "./supabase/client";
import type {
  PhilosophyConcept,
  PhilosophyOutput,
  PhilosophyQuestion,
  PhilosophyTextMap,
} from "../types/philosophy";

export type CreatePhilosophyConceptInput = Omit<
  PhilosophyConcept,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CreatePhilosophyTextMapInput = Omit<
  PhilosophyTextMap,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CreatePhilosophyQuestionInput = Omit<
  PhilosophyQuestion,
  "id" | "user_id" | "created_at" | "updated_at"
>;

export type CreatePhilosophyOutputInput = Omit<
  PhilosophyOutput,
  "id" | "user_id" | "created_at" | "updated_at"
>;

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User is not logged in.");

  return user.id;
}

async function createRow<T>(
  table: string,
  payload: Record<string, string | null>
) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from(table)
    .insert({
      ...payload,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data as T;
}

async function updateRow<T>(
  table: string,
  id: string,
  updates: Record<string, string | null | undefined>
) {
  const { data, error } = await supabase
    .from(table)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data as T;
}

async function deleteRow(table: string, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) throw error;
}

export async function getPhilosophyConcepts() {
  const { data, error } = await supabase
    .from("philosophy_concepts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data as PhilosophyConcept[];
}

export async function createPhilosophyConcept(
  concept: CreatePhilosophyConceptInput
) {
  return createRow<PhilosophyConcept>("philosophy_concepts", concept);
}

export async function updatePhilosophyConcept(
  id: string,
  updates: Partial<CreatePhilosophyConceptInput>
) {
  return updateRow<PhilosophyConcept>("philosophy_concepts", id, updates);
}

export async function deletePhilosophyConcept(id: string) {
  await deleteRow("philosophy_concepts", id);
}

export async function getPhilosophyTextMaps() {
  const { data, error } = await supabase
    .from("philosophy_text_maps")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data as PhilosophyTextMap[];
}

export async function createPhilosophyTextMap(
  textMap: CreatePhilosophyTextMapInput
) {
  return createRow<PhilosophyTextMap>("philosophy_text_maps", textMap);
}

export async function updatePhilosophyTextMap(
  id: string,
  updates: Partial<CreatePhilosophyTextMapInput>
) {
  return updateRow<PhilosophyTextMap>("philosophy_text_maps", id, updates);
}

export async function deletePhilosophyTextMap(id: string) {
  await deleteRow("philosophy_text_maps", id);
}

export async function getPhilosophyQuestions() {
  const { data, error } = await supabase
    .from("philosophy_questions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data as PhilosophyQuestion[];
}

export async function createPhilosophyQuestion(
  question: CreatePhilosophyQuestionInput
) {
  return createRow<PhilosophyQuestion>("philosophy_questions", question);
}

export async function updatePhilosophyQuestion(
  id: string,
  updates: Partial<CreatePhilosophyQuestionInput>
) {
  return updateRow<PhilosophyQuestion>("philosophy_questions", id, updates);
}

export async function deletePhilosophyQuestion(id: string) {
  await deleteRow("philosophy_questions", id);
}

export async function getPhilosophyOutputs() {
  const { data, error } = await supabase
    .from("philosophy_outputs")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return data as PhilosophyOutput[];
}

export async function createPhilosophyOutput(
  output: CreatePhilosophyOutputInput
) {
  return createRow<PhilosophyOutput>("philosophy_outputs", output);
}

export async function updatePhilosophyOutput(
  id: string,
  updates: Partial<CreatePhilosophyOutputInput>
) {
  return updateRow<PhilosophyOutput>("philosophy_outputs", id, updates);
}

export async function deletePhilosophyOutput(id: string) {
  await deleteRow("philosophy_outputs", id);
}
