"use client";

import { useEffect, useState } from "react";
import type { StudyDailyResult } from "../types/daily-result";
import { getDailyResults } from "../lib/daily-results";

function formatDate(date: string) {
    return date;
}

function formatMinutes(minutes: number) {
    if (minutes < 60) return `${minutes} 分鐘`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (rest === 0) return `${hours} 小時`;

    return `${hours} 小時 ${rest} 分鐘`;
}

export default function LearningProgress() {
    const [results, setResults] = useState<StudyDailyResult[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadResults() {
        setLoading(true);

        try {
            const data = await getDailyResults();
            setResults(data);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadResults();
    }, []);

    const latestResult = results[0] || null;

    const totalStudyDays = results.length;

    const averageCompletionRate =
        results.length === 0
            ? 0
            : Math.round(
                results.reduce((sum, result) => sum + Number(result.completion_rate), 0) /
                results.length
            );

    const totalCompletedMinutes = results.reduce(
        (sum, result) => sum + result.completed_minutes,
        0
    );

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Learning Progress
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    這裡會顯示你從 Study Schedule 上傳的每日學習成果。
                </p>
            </header>

            {loading && <p className="text-sm text-neutral-500">載入中……</p>}

            {!loading && results.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
                    目前還沒有上傳任何每日成果。請先到 Study Schedule 按「上傳今日成果」。
                </p>
            )}

            {!loading && results.length > 0 && (
                <>
                    <section className="mb-8 grid gap-4 md:grid-cols-3">
                        <SummaryCard
                            title="累積學習日"
                            value={`${totalStudyDays} 天`}
                            description="已上傳成果的天數"
                        />

                        <SummaryCard
                            title="平均完成率"
                            value={`${averageCompletionRate}%`}
                            description="依每日完成區塊比例計算"
                        />

                        <SummaryCard
                            title="累積完成時間"
                            value={formatMinutes(totalCompletedMinutes)}
                            description="只計算已完成區塊"
                        />
                    </section>

                    {latestResult && (
                        <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-medium">最近一次成果</h2>
                                    <p className="mt-1 text-sm text-neutral-500">
                                        {formatDate(latestResult.result_date)}
                                    </p>
                                </div>

                                <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
                                    完成率 {Number(latestResult.completion_rate)}%
                                </span>
                            </div>

                            <ProgressBar value={Number(latestResult.completion_rate)} />

                            <div className="mt-5 grid gap-3 text-sm md:grid-cols-4">
                                <InfoBox title="總區塊" value={`${latestResult.total_blocks}`} />
                                <InfoBox title="已完成" value={`${latestResult.completed_blocks}`} />
                                <InfoBox title="已暫停" value={`${latestResult.paused_blocks}`} />
                                <InfoBox title="進行中" value={`${latestResult.in_progress_blocks}`} />
                            </div>
                        </section>
                    )}

                    <section className="space-y-5">
                        <h2 className="text-xl font-medium">每日成果紀錄</h2>

                        {results.map((result) => (
                            <article
                                key={result.id}
                                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                            >
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {formatDate(result.result_date)}
                                        </h3>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            完成 {result.completed_blocks} / {result.total_blocks} 個區塊，
                                            完成時間 {formatMinutes(result.completed_minutes)}
                                        </p>
                                    </div>

                                    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
                                        {Number(result.completion_rate)}%
                                    </span>
                                </div>

                                <ProgressBar value={Number(result.completion_rate)} />

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">已完成</h4>

                                        {result.completed_items.length === 0 ? (
                                            <p className="text-sm text-neutral-500">沒有已完成項目。</p>
                                        ) : (
                                            <ul className="space-y-2 text-sm">
                                                {result.completed_items.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="rounded-xl bg-neutral-50 p-3"
                                                    >
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="mt-1 text-neutral-500">
                                                            {item.start_time.slice(0, 5)}–
                                                            {item.end_time.slice(0, 5)}
                                                            {item.source_title ? `｜${item.source_title}` : ""}
                                                        </p>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">未完成 / 待接續</h4>

                                        {result.unfinished_items.length === 0 ? (
                                            <p className="text-sm text-neutral-500">沒有未完成項目。</p>
                                        ) : (
                                            <ul className="space-y-2 text-sm">
                                                {result.unfinished_items.map((item) => (
                                                    <li
                                                        key={item.id}
                                                        className="rounded-xl bg-neutral-50 p-3"
                                                    >
                                                        <p className="font-medium">{item.title}</p>
                                                        <p className="mt-1 text-neutral-500">
                                                            {item.start_time.slice(0, 5)}–
                                                            {item.end_time.slice(0, 5)}
                                                            {item.source_title ? `｜${item.source_title}` : ""}
                                                        </p>

                                                        {item.next_entry_point && (
                                                            <p className="mt-2 text-neutral-600">
                                                                下次接續：{item.next_entry_point}
                                                            </p>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </>
            )}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    description,
}: {
    title: string;
    value: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
            <p className="mt-2 text-sm text-neutral-500">{description}</p>
        </div>
    );
}

function InfoBox({ title, value }: { title: string; value: string }) {
    return (
        <div className="rounded-xl border border-neutral-200 p-3">
            <p className="mb-1 text-xs text-neutral-500">{title}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

function ProgressBar({ value }: { value: number }) {
    const safeValue = Math.max(0, Math.min(value, 100));

    return (
        <div>
            <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                <div
                    className="h-full rounded-full bg-black transition-all"
                    style={{ width: `${safeValue}%` }}
                />
            </div>

            <p className="mt-2 text-xs text-neutral-500">完成率 {safeValue}%</p>
        </div>
    );
}