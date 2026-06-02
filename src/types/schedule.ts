export type StudyScheduleStatus =
    | "planned"
    | "in_progress"
    | "paused"
    | "completed"
    | "carried_over";

export type StudyScheduleBlock = {
    id: string;
    user_id: string;

    schedule_date: string;

    title: string;
    category: string;

    source_title?: string | null;
    source_author?: string | null;

    start_time: string;
    end_time: string;

    no_new_section_after?: string | null;
    buffer_minutes: number;
    max_extension_minutes: number;

    minimum_goal?: string | null;
    ideal_goal?: string | null;
    stop_point?: string | null;

    status: StudyScheduleStatus;

    actual_start_time?: string | null;
    actual_end_time?: string | null;

    current_position?: string | null;
    current_argument?: string | null;
    understood?: string | null;
    unresolved_question?: string | null;
    next_entry_point?: string | null;

    reflection?: string | null;

    created_at: string;
    updated_at: string;
};