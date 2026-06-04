export default function DashboardPage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <header className="mb-8">
                <h1 className="text-3xl font-semibold tracking-tight">
                    Dashboard
                </h1>
                <p className="mt-2 text-sm text-neutral-500">
                    這裡是 ChunDuan&apos;s Learning Programme 的總覽頁。
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                <a
                    href="/schedule"
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
                >
                    <h2 className="text-lg font-medium">Study Schedule</h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        安排今日學習區塊、收束筆記與下次返回接口。
                    </p>
                </a>

                <a
                    href="/progress"
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
                >
                    <h2 className="text-lg font-medium">Learning Progress</h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        查看每日上傳成果、完成率與累積學習時間。
                    </p>
                </a>

                <a
                    href="/daily-log"
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:bg-neutral-50"
                >
                    <h2 className="text-lg font-medium">Daily Log</h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        記錄今日學習、困難、反思與明日接續。
                    </p>
                </a>
            </section>
        </main>
    );
}