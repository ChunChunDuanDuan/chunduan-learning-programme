import { supabase } from "./supabase/client";
import type { StudyScheduleBlock } from "../types/schedule";

export async function getScheduleBlocks(date: string) {
  const { data, error } = await supabase
    .from("study_schedule_blocks")
    .select("*")
    .eq("schedule_date", date)
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  return data as StudyScheduleBlock[];
}

export async function createScheduleBlock(
  block: Omit<
    StudyScheduleBlock,
    "id" | "user_id" | "created_at" | "updated_at" | "status"
  >
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not logged in.");
  }

  const { data, error } = await supabase
    .from("study_schedule_blocks")
    .insert({
      ...block,
      user_id: user.id,
      status: "planned",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as StudyScheduleBlock;
}

export async function updateScheduleBlock(
  id: string,
  updates: Partial<StudyScheduleBlock>
) {
  const { data, error } = await supabase
    .from("study_schedule_blocks")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as StudyScheduleBlock;
}

export async function deleteScheduleBlock(id: string) {
  const { error } = await supabase
    .from("study_schedule_blocks")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}