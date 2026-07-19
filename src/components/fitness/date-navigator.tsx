import { formatDateLabel, shiftCalendarDate, todayInTaipei } from "../../lib/fitness";

type DateNavigatorProps = {
  date: string;
  onChange: (date: string) => void;
  disabled?: boolean;
};

export function DateNavigator({ date, onChange, disabled }: DateNavigatorProps) {
  const today = todayInTaipei();

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Date navigation">
      <button
        type="button"
        onClick={() => onChange(shiftCalendarDate(date, -1))}
        disabled={disabled}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 disabled:opacity-50"
        aria-label="Previous day"
      >
        ←
      </button>
      <label className="relative">
        <span className="sr-only">Select date</span>
        <input
          type="date"
          value={date}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-900 outline-none transition focus:border-neutral-950 disabled:opacity-50"
        />
      </label>
      <button
        type="button"
        onClick={() => onChange(shiftCalendarDate(date, 1))}
        disabled={disabled}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 disabled:opacity-50"
        aria-label="Next day"
      >
        →
      </button>
      {date !== today ? (
        <button
          type="button"
          onClick={() => onChange(today)}
          disabled={disabled}
          className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium !text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          Back to Today
        </button>
      ) : null}
      <span className="ml-1 text-sm text-neutral-500">
        {formatDateLabel(date, true)}
      </span>
    </div>
  );
}
