"use client";

import { useEffect, useState } from "react";
import type { StudyScheduleBlock } from "../types/schedule";
import {
    getScheduleBlocks,
    createScheduleBlock,
    updateScheduleBlock,
    deleteScheduleBlock,
} from "../lib/schedule";

function todayString() {
    return new Date().toISOString().slice(0, 10);
}

export default function StudySchedule() {
    const [date, setDate] = useState(todayString());
    const [blocks, setBlocks] = useState<StudyScheduleBlock[]>([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        title: "",
        category: "reading",
        source_title: "",
        source_author: "",
        start_time: "09:00",
        end_time: "10:15",
        no_new_section_after: "10:00",
        buffer_minutes: 15,
        max_extension_minutes: 15,
        minimum_goal: "",
        ideal_goal: "",
        stop_point: "",
    });

    async function loadBlocks() {
        setLoading(true);
        try {
            const data = await getScheduleBlocks(date);
            setBlocks(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadBlocks();
    }, [date]);

    async function handleCreate() {
        if (!form.title.trim()) return;

        await createScheduleBlock({
            schedule_date: date,
            title: form.title,
            category: form.category,
            source_title: form.source_title || null,
            source_author: form.source_author || null,
            start_time: form.start_time,
            end_time: form.end_time,
            no_new_section_after: form.no_new_section_after || null,
            buffer_minutes: Number(form.buffer_minutes),
            max_extension_minutes: Number(form.max_extension_minutes),
            minimum_goal: form.minimum_goal || null,
            ideal_goal: form.ideal_goal || null,
            stop_point: form.stop_point || null,
            actual_start_time: null,
            actual_end_time: null,
            current_position: null,
            current_argument: null,
            understood: null,
            unresolved_question: null,
            next_entry_point: null,
            reflection: null,
        });

        setForm({
            ...form,
            title: "",
            source_title: "",
            source_author: "",
            minimum_goal: "",
            ideal_goal: "",
            stop_point: "",
        });

        await loadBlocks();
    }

    async function startBlock(block: StudyScheduleBlock) {
        await updateScheduleBlock(block.id, {
            status: "in_progress",
            actual_start_time: new Date().toISOString(),
        });
        await loadBlocks();
    }

    async function pauseBlock(block: StudyScheduleBlock) {
        await updateScheduleBlock(block.id, {
            status: "paused",
        });
        await loadBlocks();
    }

    async function completeBlock(block: StudyScheduleBlock) {
        await updateScheduleBlock(block.id, {
            status: "completed",
            actual_end_time: new Date().toISOString(),
        });
        await loadBlocks();
    }

    async function carryOverBlock(block: StudyScheduleBlock) {
        await updateScheduleBlock(block.id, {
            status: "carried_over",
            actual_end_time: new Date().toISOString(),
        });
        await loadBlocks();
    }

    async function updateInterruptionNote(
        block: StudyScheduleBlock,
        field: keyof StudyScheduleBlock,
        value: string
    ) {
        await updateScheduleBlock(block.id, {
            [field]: value,
        });
        await loadBlocks();
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Study Schedule
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    用於深讀、收束、緩衝與下次返回的學習日程表。
                </p>
            </header>

            <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <label className="mb-2 block text-sm font-medium">日期</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-lg border border-neutral-300 px-3 py-2"
                />
            </section>

            <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-medium">新增學習區塊</h2>

                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        label="標題"
                        value={form.title}
                        onChange={(v) => setForm({ ...form, title: v })}
                        placeholder="例如：海德格爾深讀"
                    />

                    <Input
                        label="文本 / 科目"
                        value={form.source_title}
                        onChange={(v) => setForm({ ...form, source_title: v })}
                        placeholder="例如：《存在與時間》"
                    />

                    <Input
                        label="作者"
                        value={form.source_author}
                        onChange={(v) => setForm({ ...form, source_author: v })}
                        placeholder="例如：Heidegger"
                    />

                    <Select
                        label="類型"
                        value={form.category}
                        onChange={(v) => setForm({ ...form, category: v })}
                        options={[
                            ["reading", "深讀"],
                            ["review", "回顧"],
                            ["language", "語言"],
                            ["problem_solving", "解題"],
                            ["writing", "寫作"],
                            ["admin", "行政"],
                        ]}
                    />

                    <Input
                        label="開始時間"
                        type="time"
                        value={form.start_time}
                        onChange={(v) => setForm({ ...form, start_time: v })}
                    />

                    <Input
                        label="結束時間"
                        type="time"
                        value={form.end_time}
                        onChange={(v) => setForm({ ...form, end_time: v })}
                    />

                    <Input
                        label="此時間後不開新段落"
                        type="time"
                        value={form.no_new_section_after}
                        onChange={(v) =>
                            setForm({ ...form, no_new_section_after: v })
                        }
                    />

                    <Input
                        label="緩衝分鐘"
                        type="number"
                        value={String(form.buffer_minutes)}
                        onChange={(v) =>
                            setForm({ ...form, buffer_minutes: Number(v) })
                        }
                    />

                    <Input
                        label="最多延展分鐘"
                        type="number"
                        value={String(form.max_extension_minutes)}
                        onChange={(v) =>
                            setForm({ ...form, max_extension_minutes: Number(v) })
                        }
                    />

                    <Input
                        label="最低完成"
                        value={form.minimum_goal}
                        onChange={(v) => setForm({ ...form, minimum_goal: v })}
                        placeholder="例如：讀完 2 頁"
                    />

                    <Input
                        label="理想完成"
                        value={form.ideal_goal}
                        onChange={(v) => setForm({ ...form, ideal_goal: v })}
                        placeholder="例如：推進到本小節結尾"
                    />

                    <Input
                        label="可停止點"
                        value={form.stop_point}
                        onChange={(v) => setForm({ ...form, stop_point: v })}
                        placeholder="例如：論證轉折前或段落收束處"
                    />
                </div>

                <button
                    onClick={handleCreate}
                    className="mt-5 rounded-xl bg-black px-4 py-2 text-white hover:bg-neutral-800"
                >
                    新增區塊
                </button>
            </section>

            <section>
                <h2 className="mb-4 text-xl font-medium">今日學習日程</h2>

                {loading && <p className="text-sm text-neutral-500">載入中……</p>}

                {!loading && blocks.length === 0 && (
                    <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
                        今天還沒有安排學習區塊。
                    </p>
                )}

                <div className="space-y-5">
                    {blocks.map((block) => (
                        <article
                            key={block.id}
                            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold">{block.title}</h3>
                                    <p className="text-sm text-neutral-500">
                                        {block.start_time.slice(0, 5)}–{block.end_time.slice(0, 5)}
                                        {block.no_new_section_after
                                            ? `｜${block.no_new_section_after.slice(
                                                0,
                                                5
                                            )} 後不開新段落`
                                            : ""}
                                    </p>
                                    {block.source_title && (
                                        <p className="mt-1 text-sm text-neutral-500">
                                            {block.source_title}
                                            {block.source_author ? `｜${block.source_author}` : ""}
                                        </p>
                                    )}
                                </div>

                                <StatusBadge status={block.status} />
                            </div>

                            <div className="mb-4 grid gap-3 text-sm md:grid-cols-3">
                                <InfoBox title="最低完成" value={block.minimum_goal} />
                                <InfoBox title="理想完成" value={block.ideal_goal} />
                                <InfoBox title="可停止點" value={block.stop_point} />
                            </div>

                            <div className="mb-4 rounded-xl bg-neutral-50 p-4 text-sm">
                                <p>
                                    緩衝：{block.buffer_minutes} 分鐘｜最多延展：
                                    {block.max_extension_minutes} 分鐘
                                </p>
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() => startBlock(block)}
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                                >
                                    開始
                                </button>
                                <button
                                    onClick={() => pauseBlock(block)}
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                                >
                                    暫停
                                </button>
                                <button
                                    onClick={() => completeBlock(block)}
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                                >
                                    完成
                                </button>
                                <button
                                    onClick={() => carryOverBlock(block)}
                                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                                >
                                    留到下次
                                </button>
                                <button
                                    onClick={async () => {
                                        await deleteScheduleBlock(block.id);
                                        await loadBlocks();
                                    }}
                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                    刪除
                                </button>
                            </div>

                            <div className="grid gap-4">
                                <Textarea
                                    label="今日停止處"
                                    value={block.current_position || ""}
                                    onBlur={(v) =>
                                        updateInterruptionNote(block, "current_position", v)
                                    }
                                    placeholder="例如：第 X 頁，第 X 段，討論世界內存在的地方"
                                />

                                <Textarea
                                    label="目前論證在說"
                                    value={block.current_argument || ""}
                                    onBlur={(v) =>
                                        updateInterruptionNote(block, "current_argument", v)
                                    }
                                    placeholder="用 2–4 句寫下目前論證推進到哪裡"
                                />

                                <Textarea
                                    label="我已經理解的是"
                                    value={block.understood || ""}
                                    onBlur={(v) =>
                                        updateInterruptionNote(block, "understood", v)
                                    }
                                    placeholder="例如：世界不是物的總和，而是意義關聯整體"
                                />

                                <Textarea
                                    label="我還沒弄懂的是"
                                    value={block.unresolved_question || ""}
                                    onBlur={(v) =>
                                        updateInterruptionNote(block, "unresolved_question", v)
                                    }
                                    placeholder="例如：為什麼順手性比現成性更原初？"
                                />

                                <Textarea
                                    label="下次回來先從這裡開始"
                                    value={block.next_entry_point || ""}
                                    onBlur={(v) =>
                                        updateInterruptionNote(block, "next_entry_point", v)
                                    }
                                    placeholder="例如：先重讀順手性與現成性的區分，再接下一段"
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
        </label>
    );
}

function Select({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: [string, string][];
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
                {options.map(([value, label]) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function Textarea({
    label,
    value,
    onBlur,
    placeholder,
}: {
    label: string;
    value: string;
    onBlur: (value: string) => void;
    placeholder?: string;
}) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <label className="block">
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <textarea
                value={localValue}
                placeholder={placeholder}
                onChange={(e) => setLocalValue(e.target.value)}
                onBlur={() => onBlur(localValue)}
                rows={3}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
        </label>
    );
}

function InfoBox({
    title,
    value,
}: {
    title: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-xl border border-neutral-200 p-3">
            <p className="mb-1 text-xs text-neutral-500">{title}</p>
            <p className="text-sm">{value || "未設定"}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const labelMap: Record<string, string> = {
        planned: "已安排",
        in_progress: "進行中",
        paused: "已暫停",
        completed: "已完成",
        carried_over: "留到下次",
    };

    return (
        <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
            {labelMap[status] || status}
        </span>
    );
}