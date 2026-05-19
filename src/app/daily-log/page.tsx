import { DailyLogForm } from "../../components/daily-log/daily-log-form";

export default function DailyLogPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-neutral-500">Daily Log</p>

        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
          Today&apos;s Learning Record
        </h2>

        <p className="mt-3 max-w-2xl text-neutral-600">
          Record your daily learning process, questions, reflections, and the
          next step for tomorrow.
        </p>
      </section>

      <DailyLogForm />
    </div>
  );
}