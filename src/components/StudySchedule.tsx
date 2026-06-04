"use client";

import { useEffect, useState } from "react";
import type { StudyScheduleBlock, StudyScheduleStatus } from "../types/schedule";
import {
  getScheduleBlocks,
  createScheduleBlock,
  updateScheduleBlock,
  deleteScheduleBlock,
} from "../lib/schedule";
import { uploadDailyResultFromBlocks } from "../lib/daily-results";

type VisibleStatus = "planned" | "in_progress" | "paused" | "completed";

type ScheduleFormState = {
  title: string;
  category: string;
  source_title: string;
  source_author: string;
  start_time: string;
  end_time: string;
  no_new_section_after: string;
  buffer_minutes: number;
  max_extension_minutes: number;
  minimum_goal: string;
  ideal_goal: string;
  stop_point: string;
};

type RescheduleFormState = {
  schedule_date: string;
  start_time: string;
  end_time: string;
  no_new_section_after: string;
};

function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function makeDefaultForm(): ScheduleFormState {
  return {
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
  };
}

function makeEditForm(block: StudyScheduleBlock): ScheduleFormState {
  return {
    title: block.title || "",
    category: block.category || "reading",
    source_title: block.source_title || "",
    source_author: block.source_author || "",
    start_time: block.start_time?.slice(0, 5) || "09:00",
    end_time: block.end_time?.slice(0, 5) || "10:15",
    no_new_section_after: block.no_new_section_after?.slice(0, 5) || "",
    buffer_minutes: block.buffer_minutes ?? 15,
    max_extension_minutes: block.max_extension_minutes ?? 15,
    minimum_goal: block.minimum_goal || "",
    ideal_goal: block.ideal_goal || "",
    stop_point: block.stop_point || "",
  };
}

function makeRescheduleForm(block: StudyScheduleBlock): RescheduleFormState {
  return {
    schedule_date: block.schedule_date || todayString(),
    start_time: block.start_time?.slice(0, 5) || "09:00",
    end_time: block.end_time?.slice(0, 5) || "10:15",
    no_new_section_after: block.no_new_section_after?.slice(0, 5) || "",
  };
}

export default function StudySchedule() {
  const [date, setDate] = useState(todayString());
  const [blocks, setBlocks] = useState<StudyScheduleBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingResult, setUploadingResult] = useState(false);

  // 預設全部摺疊：只有被放進 expandedBlockIds 的卡片會展開
  const [expandedBlockIds, setExpandedBlockIds] = useState<string[]>([]);

  // 預設打開「已安排」區域
  const [activeStatus, setActiveStatus] = useState<VisibleStatus>("planned");

  const [form, setForm] = useState<ScheduleFormState>(makeDefaultForm());

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ScheduleFormState>(makeDefaultForm());

  const [reschedulingBlockId, setReschedulingBlockId] = useState<string | null>(
    null
  );
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleFormState>({
    schedule_date: todayString(),
    start_time: "09:00",
    end_time: "10:15",
    no_new_section_after: "10:00",
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

  function toggleExpand(blockId: string) {
    setExpandedBlockIds((current) =>
      current.includes(blockId)
        ? current.filter((id) => id !== blockId)
        : [...current, blockId]
    );
  }

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

    setForm(makeDefaultForm());
    setActiveStatus("planned");

    await loadBlocks();
  }

  async function handleUploadDailyResult() {
    setUploadingResult(true);

    try {
      await uploadDailyResultFromBlocks(date, blocks);
      window.location.href = "/progress";
    } finally {
      setUploadingResult(false);
    }
  }

  function startEditing(block: StudyScheduleBlock) {
    setEditingBlockId(block.id);
    setEditForm(makeEditForm(block));
    setReschedulingBlockId(null);

    if (!expandedBlockIds.includes(block.id)) {
      setExpandedBlockIds((current) => [...current, block.id]);
    }
  }

  function cancelEditing() {
    setEditingBlockId(null);
    setEditForm(makeDefaultForm());
  }

  async function saveEditing(block: StudyScheduleBlock) {
    if (!editForm.title.trim()) return;

    await updateScheduleBlock(block.id, {
      title: editForm.title,
      category: editForm.category,
      source_title: editForm.source_title || null,
      source_author: editForm.source_author || null,
      start_time: editForm.start_time,
      end_time: editForm.end_time,
      no_new_section_after: editForm.no_new_section_after || null,
      buffer_minutes: Number(editForm.buffer_minutes),
      max_extension_minutes: Number(editForm.max_extension_minutes),
      minimum_goal: editForm.minimum_goal || null,
      ideal_goal: editForm.ideal_goal || null,
      stop_point: editForm.stop_point || null,
    });

    setEditingBlockId(null);
    await loadBlocks();
  }

  async function startBlock(block: StudyScheduleBlock) {
    await updateScheduleBlock(block.id, {
      status: "in_progress",
      actual_start_time: new Date().toISOString(),
    });

    setActiveStatus("in_progress");
    await loadBlocks();
  }

  async function pauseBlock(block: StudyScheduleBlock) {
    await updateScheduleBlock(block.id, {
      status: "paused",
    });

    setActiveStatus("paused");
    await loadBlocks();
  }

  async function completeBlock(block: StudyScheduleBlock) {
    await updateScheduleBlock(block.id, {
      status: "completed",
      actual_end_time: new Date().toISOString(),
    });

    setActiveStatus("completed");
    await loadBlocks();
  }

  function openReschedule(block: StudyScheduleBlock) {
    setReschedulingBlockId(block.id);
    setRescheduleForm(makeRescheduleForm(block));
    setEditingBlockId(null);

    if (!expandedBlockIds.includes(block.id)) {
      setExpandedBlockIds((current) => [...current, block.id]);
    }
  }

  function cancelReschedule() {
    setReschedulingBlockId(null);
    setRescheduleForm({
      schedule_date: todayString(),
      start_time: "09:00",
      end_time: "10:15",
      no_new_section_after: "10:00",
    });
  }

  async function saveReschedule(block: StudyScheduleBlock) {
    await updateScheduleBlock(block.id, {
      schedule_date: rescheduleForm.schedule_date,
      start_time: rescheduleForm.start_time,
      end_time: rescheduleForm.end_time,
      no_new_section_after: rescheduleForm.no_new_section_after || null,
      status: "planned",
      actual_start_time: null,
      actual_end_time: null,
    });

    setReschedulingBlockId(null);
    setActiveStatus("planned");

    // 如果重新安排到不同日期，切換到那一天
    if (rescheduleForm.schedule_date !== date) {
      setDate(rescheduleForm.schedule_date);
    } else {
      await loadBlocks();
    }
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

  function getVisibleStatus(block: StudyScheduleBlock): VisibleStatus {
    // 若舊資料裡還有 carried_over，先視為 planned，避免消失
    if (block.status === "carried_over") return "planned";

    return block.status as VisibleStatus;
  }

  const statusSections: {
    key: VisibleStatus;
    label: string;
  }[] = [
      { key: "planned", label: "已安排" },
      { key: "in_progress", label: "進行中" },
      { key: "paused", label: "已暫停" },
      { key: "completed", label: "已完成" },
    ];

  const activeBlocks = blocks.filter(
    (block) => getVisibleStatus(block) === activeStatus
  );

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
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2"
        />
      </section>

      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-medium">新增學習區塊</h2>

        <ScheduleForm
          form={form}
          onChange={setForm}
          submitLabel="新增區塊"
          onSubmit={handleCreate}
        />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-medium">今日學習日程</h2>
            <p className="mt-1 text-sm text-neutral-500">
              完成今日學習後，可以上傳成每日成果。
            </p>
          </div>

          <button
            type="button"
            onClick={handleUploadDailyResult}
            disabled={uploadingResult || blocks.length === 0}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploadingResult ? "上傳中……" : "上傳今日成果"}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {statusSections.map((section) => {
            const count = blocks.filter(
              (block) => getVisibleStatus(block) === section.key
            ).length;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveStatus(section.key)}
                className={
                  activeStatus === section.key
                    ? "rounded-full bg-black px-4 py-2 text-sm text-white"
                    : "rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
                }
              >
                {section.label}
                <span className="ml-2 text-xs opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {loading && <p className="text-sm text-neutral-500">載入中……</p>}

        {!loading && activeBlocks.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
            這個區域目前沒有學習區塊。
          </p>
        )}

        <div className="space-y-5">
          {activeBlocks.map((block) => {
            const isExpanded = expandedBlockIds.includes(block.id);
            const isEditing = editingBlockId === block.id;
            const isRescheduling = reschedulingBlockId === block.id;

            return (
              <article
                key={block.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(block.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-400">
                        {isExpanded ? "－" : "＋"}
                      </span>

                      <h3 className="text-lg font-semibold">{block.title}</h3>
                    </div>

                    <p className="mt-1 text-sm text-neutral-500">
                      {block.start_time.slice(0, 5)}–
                      {block.end_time.slice(0, 5)}
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
                        {block.source_author
                          ? `｜${block.source_author}`
                          : ""}
                      </p>
                    )}
                  </button>

                  <StatusBadge status={block.status} />
                </div>

                {isExpanded && (
                  <>
                    {isEditing ? (
                      <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="mb-4 font-medium">編輯學習區塊</h4>

                        <ScheduleForm
                          form={editForm}
                          onChange={setEditForm}
                          submitLabel="儲存修改"
                          onSubmit={() => saveEditing(block)}
                          secondaryAction={{
                            label: "取消",
                            onClick: cancelEditing,
                          }}
                        />
                      </div>
                    ) : null}

                    {isRescheduling ? (
                      <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        <h4 className="mb-4 font-medium">重新安排到下次</h4>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            label="日期"
                            type="date"
                            value={rescheduleForm.schedule_date}
                            onChange={(value) =>
                              setRescheduleForm({
                                ...rescheduleForm,
                                schedule_date: value,
                              })
                            }
                          />

                          <Input
                            label="開始時間"
                            type="time"
                            value={rescheduleForm.start_time}
                            onChange={(value) =>
                              setRescheduleForm({
                                ...rescheduleForm,
                                start_time: value,
                              })
                            }
                          />

                          <Input
                            label="結束時間"
                            type="time"
                            value={rescheduleForm.end_time}
                            onChange={(value) =>
                              setRescheduleForm({
                                ...rescheduleForm,
                                end_time: value,
                              })
                            }
                          />

                          <Input
                            label="此時間後不開新段落"
                            type="time"
                            value={rescheduleForm.no_new_section_after}
                            onChange={(value) =>
                              setRescheduleForm({
                                ...rescheduleForm,
                                no_new_section_after: value,
                              })
                            }
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => saveReschedule(block)}
                            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
                          >
                            儲存新時間
                          </button>

                          <button
                            type="button"
                            onClick={cancelReschedule}
                            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-white"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {!isEditing && (
                      <>
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
                            type="button"
                            onClick={() => startBlock(block)}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                          >
                            開始
                          </button>

                          <button
                            type="button"
                            onClick={() => pauseBlock(block)}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                          >
                            暫停
                          </button>

                          <button
                            type="button"
                            onClick={() => completeBlock(block)}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                          >
                            完成
                          </button>

                          <button
                            type="button"
                            onClick={() => openReschedule(block)}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                          >
                            留到下次
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(block)}
                            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50"
                          >
                            編輯
                          </button>

                          <button
                            type="button"
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
                            onBlur={(value) =>
                              updateInterruptionNote(
                                block,
                                "current_position",
                                value
                              )
                            }
                            placeholder="例如：第 X 頁，第 X 段，討論世界內存在的地方"
                          />

                          <Textarea
                            label="目前論證在說"
                            value={block.current_argument || ""}
                            onBlur={(value) =>
                              updateInterruptionNote(
                                block,
                                "current_argument",
                                value
                              )
                            }
                            placeholder="用 2–4 句寫下目前論證推進到哪裡"
                          />

                          <Textarea
                            label="我已經理解的是"
                            value={block.understood || ""}
                            onBlur={(value) =>
                              updateInterruptionNote(
                                block,
                                "understood",
                                value
                              )
                            }
                            placeholder="例如：世界不是物的總和，而是意義關聯整體"
                          />

                          <Textarea
                            label="我還沒弄懂的是"
                            value={block.unresolved_question || ""}
                            onBlur={(value) =>
                              updateInterruptionNote(
                                block,
                                "unresolved_question",
                                value
                              )
                            }
                            placeholder="例如：為什麼順手性比現成性更原初？"
                          />

                          <Textarea
                            label="下次回來先從這裡開始"
                            value={block.next_entry_point || ""}
                            onBlur={(value) =>
                              updateInterruptionNote(
                                block,
                                "next_entry_point",
                                value
                              )
                            }
                            placeholder="例如：先重讀順手性與現成性的區分，再接下一段"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ScheduleForm({
  form,
  onChange,
  submitLabel,
  onSubmit,
  secondaryAction,
}: {
  form: ScheduleFormState;
  onChange: (form: ScheduleFormState) => void;
  submitLabel: string;
  onSubmit: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="標題"
          value={form.title}
          onChange={(value) => onChange({ ...form, title: value })}
          placeholder="例如：海德格爾深讀"
        />

        <Input
          label="文本 / 科目"
          value={form.source_title}
          onChange={(value) => onChange({ ...form, source_title: value })}
          placeholder="例如：《存在與時間》"
        />

        <Input
          label="作者"
          value={form.source_author}
          onChange={(value) => onChange({ ...form, source_author: value })}
          placeholder="例如：Heidegger"
        />

        <Select
          label="類型"
          value={form.category}
          onChange={(value) => onChange({ ...form, category: value })}
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
          onChange={(value) => onChange({ ...form, start_time: value })}
        />

        <Input
          label="結束時間"
          type="time"
          value={form.end_time}
          onChange={(value) => onChange({ ...form, end_time: value })}
        />

        <Input
          label="此時間後不開新段落"
          type="time"
          value={form.no_new_section_after}
          onChange={(value) =>
            onChange({ ...form, no_new_section_after: value })
          }
        />

        <Input
          label="緩衝分鐘"
          type="number"
          value={String(form.buffer_minutes)}
          onChange={(value) =>
            onChange({ ...form, buffer_minutes: Number(value) })
          }
        />

        <Input
          label="最多延展分鐘"
          type="number"
          value={String(form.max_extension_minutes)}
          onChange={(value) =>
            onChange({ ...form, max_extension_minutes: Number(value) })
          }
        />

        <Input
          label="最低完成"
          value={form.minimum_goal}
          onChange={(value) => onChange({ ...form, minimum_goal: value })}
          placeholder="例如：讀完 2 頁"
        />

        <Input
          label="理想完成"
          value={form.ideal_goal}
          onChange={(value) => onChange({ ...form, ideal_goal: value })}
          placeholder="例如：推進到本小節結尾"
        />

        <Input
          label="可停止點"
          value={form.stop_point}
          onChange={(value) => onChange({ ...form, stop_point: value })}
          placeholder="例如：論證轉折前或段落收束處"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-xl bg-black px-4 py-2 text-white hover:bg-neutral-800"
        >
          {submitLabel}
        </button>

        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
          >
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </>
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => setLocalValue(event.target.value)}
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

function StatusBadge({ status }: { status: StudyScheduleStatus }) {
  const labelMap: Record<string, string> = {
    planned: "已安排",
    in_progress: "進行中",
    paused: "已暫停",
    completed: "已完成",
    carried_over: "已安排",
  };

  return (
    <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
      {labelMap[status] || status}
    </span>
  );
}
