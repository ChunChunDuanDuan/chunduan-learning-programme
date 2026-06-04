import { supabase } from "./supabase/client";
import type { StudyScheduleBlock } from "../types/schedule";
import type { StudyDailyResult, StudyDailyResultItem } from "../types/daily-result";

function timeToMinutes(time: string) {
    const [hours, minutes] = time.slice(0, 5).split(":").map(Number);
    return hours * 60 + minutes;
}

function getBlockDurationMinutes(block: StudyScheduleBlock) {
    const start = timeToMinutes(block.start_time);
    const end = timeToMinutes(block.end_time);

    if (Number.isNaN(start) || Number.isNaN(end)) return 0;

    return Math.max(end - start, 0);
}

function toResultItem(block: StudyScheduleBlock): StudyDailyResultItem {
    return {
        id: block.id,
        title: block.title,
        category: block.category,
        source_title: block.source_title,
        source_author: block.source_author,
        start_time: block.start_time,
        end_time: block.end_time,
        status: block.status,
        minimum_goal: block.minimum_goal,
        ideal_goal: block.ideal_goal,
        stop_point: block.stop_point,
        current_position: block.current_position,
        current_argument: block.current_argument,
        understood: block.understood,
        unresolved_question: block.unresolved_question,
        next_entry_point: block.next_entry_point,
    };
}

export async function uploadDailyResultFromBlocks(
    resultDate: string,
    blocks: StudyScheduleBlock[]
) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error("User is not logged in.");

    const totalBlocks = blocks.length;

    const plannedBlocks = blocks.filter(
        (block) => block.status === "planned" || block.status === "carried_over"
    ).length;

    const inProgressBlocks = blocks.filter(
        (block) => block.status === "in_progress"
    ).length;

    const pausedBlocks = blocks.filter((block) => block.status === "paused").length;

    const completedBlocks = blocks.filter(
        (block) => block.status === "completed"
    ).length;

    const completionRate =
        totalBlocks === 0 ? 0 : Math.round((completedBlocks / totalBlocks) * 100);

    const totalPlannedMinutes = blocks.reduce(
        (sum, block) => sum + getBlockDurationMinutes(block),
        0
    );

    const completedMinutes = blocks
        .filter((block) => block.status === "completed")
        .reduce((sum, block) => sum + getBlockDurationMinutes(block), 0);

    const completedItems = blocks
        .filter((block) => block.status === "completed")
        .map(toResultItem);

    const unfinishedItems = blocks
        .filter((block) => block.status !== "completed")
        .map(toResultItem);

    const allItems = blocks.map(toResultItem);

    const { data, error } = await supabase
        .from("study_daily_results")
        .upsert(
            {
                user_id: user.id,
                result_date: resultDate,

                total_blocks: totalBlocks,
                planned_blocks: plannedBlocks,
                in_progress_blocks: inProgressBlocks,
                paused_blocks: pausedBlocks,
                completed_blocks: completedBlocks,

                completion_rate: completionRate,

                total_planned_minutes: totalPlannedMinutes,
                completed_minutes: completedMinutes,

                completed_items: completedItems,
                unfinished_items: unfinishedItems,
                all_items: allItems,

                uploaded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                onConflict: "user_id,result_date",
            }
        )
        .select()
        .single();

    if (error) throw error;

    return data as StudyDailyResult;
}

export async function getDailyResults() {
    const { data, error } = await supabase
        .from("study_daily_results")
        .select("*")
        .order("result_date", { ascending: false });

    if (error) throw error;

    return data as StudyDailyResult[];
}

export async function getDailyResultByDate(resultDate: string) {
    const { data, error } = await supabase
        .from("study_daily_results")
        .select("*")
        .eq("result_date", resultDate)
        .maybeSingle();

    if (error) throw error;

    return data as StudyDailyResult | null;
}