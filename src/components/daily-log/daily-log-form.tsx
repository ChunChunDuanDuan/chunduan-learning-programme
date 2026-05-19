"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";

type DailyLog = {
  learned_today: string;
  important_additions: string;
  difficulties_or_questions: string;
  key_sentence_or_concept: string;
  reflection: string;
  next_step: string;
};

const emptyLog: DailyLog = {
  learned_today: "",
  important_additions: "",
  difficulties_or_questions: "",
  key_sentence_or_concept: "",
  reflection: "",
  next_step: "",
};

const fields: {
  key: keyof DailyLog;
  label: string;
}[] = [
  { key: "learned_today", label: "今天學了什麼？" },
  { key: "important_additions", label: "今天新增了哪些重要內容？" },
  { key: "difficulties_or_questions", label: "今天遇到什麼困難或疑問？" },
  {
    key: "key_sentence_or_concept",
    label: "今天最值得記住的一句話 / 一個概念是什麼？",
  },
  { key: "reflection", label: "自由心得" },
  { key: "next_step", label: "明天想接續什麼？" },
];

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyLogForm() {
  const [log, setLog] = useState<DailyLog>(emptyLog);
  const [date, setDate] = useState(getTodayDateString());
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "idle" | "saving" | "saved" | "error" | "not-authenticated"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUserAndLog() {
      setStatus("loading");
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatus("not-authenticated");
        setMessage("Please login before saving your daily log.");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("daily_logs")
        .select(
          "learned_today, important_additions, difficulties_or_questions, key_sentence_or_concept, reflection, next_step"
        )
        .eq("user_id", user.id)
        .eq("date", date)
        .maybeSingle();

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      if (data) {
        setLog({
          learned_today: data.learned_today ?? "",
          important_additions: data.important_additions ?? "",
          difficulties_or_questions: data.difficulties_or_questions ?? "",
          key_sentence_or_concept: data.key_sentence_or_concept ?? "",
          reflection: data.reflection ?? "",
          next_step: data.next_step ?? "",
        });
      } else {
        setLog(emptyLog);
      }

      setStatus("idle");
    }

    loadUserAndLog();
  }, [date]);

  function updateField(key: keyof DailyLog, value: string) {
    setLog((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveLog() {
    if (!userId) {
      setStatus("not-authenticated");
      setMessage("Please login before saving your daily log.");
      return;
    }

    setStatus("saving");
    setMessage("");

    const { error } = await supabase.from("daily_logs").upsert(
      {
        user_id: userId,
        date,
        ...log,
      },
      {
        onConflict: "user_id,date",
      }
    );

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("saved");
    setMessage("Saved.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-neutral-800">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-400"
          />
        </label>

        {message ? (
          <p
            className={`mt-4 text-sm ${
              status === "error" || status === "not-authenticated"
                ? "text-red-600"
                : "text-neutral-600"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>

      <form className="space-y-4">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="text-sm font-medium text-neutral-800">
              {field.label}
            </span>

            <textarea
              value={log[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              className="mt-2 min-h-24 w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm outline-none transition focus:border-neutral-400"
              placeholder="Write here..."
            />
          </label>
        ))}

        <button
          type="button"
          onClick={saveLog}
          disabled={status === "saving" || status === "loading"}
          className="rounded-xl bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}