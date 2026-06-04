export type StudyDailyResultItem = {
    id: string;
    title: string;
    category: string;
    source_title?: string | null;
    source_author?: string | null;
    start_time: string;
    end_time: string;
    status: string;
    minimum_goal?: string | null;
    ideal_goal?: string | null;
    stop_point?: string | null;
    current_position?: string | null;
    current_argument?: string | null;
    understood?: string | null;
    unresolved_question?: string | null;
    next_entry_point?: string | null;
};

export type StudyDailyResult = {
    id: string;
    user_id: string;

    result_date: string;

    total_blocks: number;
    planned_blocks: number;
    in_progress_blocks: number;
    paused_blocks: number;
    completed_blocks: number;

    completion_rate: number;

    total_planned_minutes: number;
    completed_minutes: number;

    completed_items: StudyDailyResultItem[];
    unfinished_items: StudyDailyResultItem[];
    all_items: StudyDailyResultItem[];

    uploaded_at: string;
    created_at: string;
    updated_at: string;
};

export { };