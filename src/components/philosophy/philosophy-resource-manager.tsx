"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPhilosophyConcept,
  createPhilosophyOutput,
  createPhilosophyQuestion,
  createPhilosophyTextMap,
  deletePhilosophyConcept,
  deletePhilosophyOutput,
  deletePhilosophyQuestion,
  deletePhilosophyTextMap,
  getPhilosophyConcepts,
  getPhilosophyOutputs,
  getPhilosophyQuestions,
  getPhilosophyTextMaps,
  updatePhilosophyConcept,
  updatePhilosophyOutput,
  updatePhilosophyQuestion,
  updatePhilosophyTextMap,
} from "../../lib/philosophy";
import type {
  PhilosophyConcept,
  PhilosophyOutput,
  PhilosophyQuestion,
  PhilosophyTextMap,
} from "../../types/philosophy";

type PhilosophyResource = "concepts" | "texts" | "questions" | "outputs";

type FormState = Record<string, string>;

type PhilosophyRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: string | null | undefined;
};

type FieldConfig = {
  name: string;
  label: string;
  placeholder?: string;
  inputType?: "text" | "textarea" | "select";
  options?: string[];
  rows?: number;
  required?: boolean;
};

type ResourceConfig = {
  title: string;
  description: string;
  addLabel: string;
  emptyText: string;
  primaryField: string;
  primaryLabel: string;
  secondaryFields: string[];
  fields: FieldConfig[];
  initialForm: FormState;
  load: () => Promise<PhilosophyRecord[]>;
  create: (form: FormState) => Promise<unknown>;
  update: (id: string, form: FormState) => Promise<unknown>;
  delete: (id: string) => Promise<void>;
};

const questionStatuses = ["Unresolved", "Initial understanding", "Organized"];
const outputStatuses = ["Drafting", "Completed", "Ready to publish"];

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toRecord<T extends { id: string; created_at: string; updated_at: string }>(
  item: T
) {
  return item as unknown as PhilosophyRecord;
}

function getQuestionStatus(value: string) {
  return value === "Initial understanding" || value === "Organized"
    ? value
    : "Unresolved";
}

function getOutputStatus(value: string) {
  return value === "Completed" || value === "Ready to publish"
    ? value
    : "Drafting";
}

function getConfig(resource: PhilosophyResource): ResourceConfig {
  const conceptFields: FieldConfig[] = [
    {
      name: "title",
      label: "Concept name",
      placeholder: "Example: Ground / Grund",
      required: true,
    },
    {
      name: "philosophers",
      label: "Related philosophers",
      placeholder: "Example: Schelling, Hegel, Aristotle",
    },
    {
      name: "current_understanding",
      label: "Current understanding",
      inputType: "textarea",
      rows: 4,
    },
    {
      name: "source_texts",
      label: "Source texts",
      placeholder: "Example: Introduction to the Philosophy of Mythology, Lecture 17",
      inputType: "textarea",
    },
    {
      name: "key_quotes",
      label: "Key quotes",
      inputType: "textarea",
      rows: 4,
    },
    {
      name: "unresolved_questions",
      label: "Unresolved questions",
      inputType: "textarea",
    },
    {
      name: "related_concepts",
      label: "Related concepts",
      placeholder: "Example: cause, being, actuality, freedom",
    },
  ];

  const textFields: FieldConfig[] = [
    {
      name: "title",
      label: "Text title",
      placeholder: "Example: Introduction to the Philosophy of Mythology",
      required: true,
    },
    { name: "author", label: "Author", placeholder: "Example: Schelling" },
    { name: "section", label: "Section or lecture", placeholder: "Example: Lecture 17" },
    { name: "core_problem", label: "Core problem", inputType: "textarea" },
    { name: "argument_steps", label: "Argument steps", inputType: "textarea", rows: 5 },
    { name: "relation_to_previous", label: "Relation to previous section", inputType: "textarea" },
    { name: "relation_to_next", label: "Relation to next section", inputType: "textarea" },
    { name: "difficulties", label: "Difficulties", inputType: "textarea" },
    { name: "related_concepts", label: "Related concepts" },
  ];

  const questionFields: FieldConfig[] = [
    {
      name: "question",
      label: "Question",
      placeholder: "Example: Can late Schelling still be called an idealist?",
      required: true,
    },
    {
      name: "source_context",
      label: "Source context",
      placeholder: "Example: book, lecture, page, or daily result context",
    },
    { name: "current_answer", label: "Current provisional answer", inputType: "textarea" },
    { name: "unresolved_part", label: "Unresolved part", inputType: "textarea" },
    { name: "related_concepts", label: "Related concepts" },
    { name: "related_texts", label: "Related texts" },
    {
      name: "status",
      label: "Status",
      inputType: "select",
      options: questionStatuses,
    },
  ];

  const outputFields: FieldConfig[] = [
    { name: "title", label: "Output title", required: true },
    {
      name: "type",
      label: "Type",
      placeholder: "Example: short essay, reading report, concept entry, research plan",
    },
    { name: "source_materials", label: "Source materials", inputType: "textarea" },
    { name: "content", label: "Content", inputType: "textarea", rows: 6 },
    {
      name: "status",
      label: "Status",
      inputType: "select",
      options: outputStatuses,
    },
  ];

  const configs: Record<PhilosophyResource, ResourceConfig> = {
    concepts: {
      title: "Concept Dictionary",
      description:
        "Organize recurring philosophical concepts into a searchable network that can grow beyond daily notes.",
      addLabel: "Add concept",
      emptyText:
        "No concept entries yet. Start with a term that keeps appearing in your daily results.",
      primaryField: "title",
      primaryLabel: "Concept name",
      secondaryFields: ["philosophers", "source_texts", "related_concepts"],
      fields: conceptFields,
      initialForm: {
        title: "",
        philosophers: "",
        current_understanding: "",
        source_texts: "",
        key_quotes: "",
        unresolved_questions: "",
        related_concepts: "",
      },
      load: async () => (await getPhilosophyConcepts()).map(toRecord<PhilosophyConcept>),
      create: (form) =>
        createPhilosophyConcept({
          title: form.title.trim(),
          philosophers: blankToNull(form.philosophers),
          current_understanding: blankToNull(form.current_understanding),
          source_texts: blankToNull(form.source_texts),
          key_quotes: blankToNull(form.key_quotes),
          unresolved_questions: blankToNull(form.unresolved_questions),
          related_concepts: blankToNull(form.related_concepts),
        }),
      update: (id, form) =>
        updatePhilosophyConcept(id, {
          title: form.title.trim(),
          philosophers: blankToNull(form.philosophers),
          current_understanding: blankToNull(form.current_understanding),
          source_texts: blankToNull(form.source_texts),
          key_quotes: blankToNull(form.key_quotes),
          unresolved_questions: blankToNull(form.unresolved_questions),
          related_concepts: blankToNull(form.related_concepts),
        }),
      delete: deletePhilosophyConcept,
    },
    texts: {
      title: "Text Maps",
      description:
        "Organize the argument of a book, chapter, lecture, or section, including its place in the surrounding text.",
      addLabel: "Add text map",
      emptyText:
        "No text maps yet. Start with the chapter, section, or lecture you are reading now.",
      primaryField: "title",
      primaryLabel: "Text title",
      secondaryFields: ["author", "section", "related_concepts"],
      fields: textFields,
      initialForm: {
        title: "",
        author: "",
        section: "",
        core_problem: "",
        argument_steps: "",
        relation_to_previous: "",
        relation_to_next: "",
        difficulties: "",
        related_concepts: "",
      },
      load: async () => (await getPhilosophyTextMaps()).map(toRecord<PhilosophyTextMap>),
      create: (form) =>
        createPhilosophyTextMap({
          title: form.title.trim(),
          author: blankToNull(form.author),
          section: blankToNull(form.section),
          core_problem: blankToNull(form.core_problem),
          argument_steps: blankToNull(form.argument_steps),
          relation_to_previous: blankToNull(form.relation_to_previous),
          relation_to_next: blankToNull(form.relation_to_next),
          difficulties: blankToNull(form.difficulties),
          related_concepts: blankToNull(form.related_concepts),
        }),
      update: (id, form) =>
        updatePhilosophyTextMap(id, {
          title: form.title.trim(),
          author: blankToNull(form.author),
          section: blankToNull(form.section),
          core_problem: blankToNull(form.core_problem),
          argument_steps: blankToNull(form.argument_steps),
          relation_to_previous: blankToNull(form.relation_to_previous),
          relation_to_next: blankToNull(form.relation_to_next),
          difficulties: blankToNull(form.difficulties),
          related_concepts: blankToNull(form.related_concepts),
        }),
      delete: deletePhilosophyTextMap,
    },
    questions: {
      title: "Question Tracking",
      description:
        "Track live philosophical problems, provisional answers, and the parts that still need work.",
      addLabel: "Add question",
      emptyText:
        "No questions yet. Promote one unresolved point from a daily result into a tracked question.",
      primaryField: "question",
      primaryLabel: "Question",
      secondaryFields: ["status", "source_context", "related_concepts"],
      fields: questionFields,
      initialForm: {
        question: "",
        source_context: "",
        current_answer: "",
        unresolved_part: "",
        related_concepts: "",
        related_texts: "",
        status: "Unresolved",
      },
      load: async () => (await getPhilosophyQuestions()).map(toRecord<PhilosophyQuestion>),
      create: (form) =>
        createPhilosophyQuestion({
          question: form.question.trim(),
          source_context: blankToNull(form.source_context),
          current_answer: blankToNull(form.current_answer),
          unresolved_part: blankToNull(form.unresolved_part),
          related_concepts: blankToNull(form.related_concepts),
          related_texts: blankToNull(form.related_texts),
          status: getQuestionStatus(form.status),
        }),
      update: (id, form) =>
        updatePhilosophyQuestion(id, {
          question: form.question.trim(),
          source_context: blankToNull(form.source_context),
          current_answer: blankToNull(form.current_answer),
          unresolved_part: blankToNull(form.unresolved_part),
          related_concepts: blankToNull(form.related_concepts),
          related_texts: blankToNull(form.related_texts),
          status: getQuestionStatus(form.status),
        }),
      delete: deletePhilosophyQuestion,
    },
    outputs: {
      title: "Outputs",
      description:
        "Turn concepts, text maps, and question threads into essays, reading reports, and research plans.",
      addLabel: "Add output",
      emptyText:
        "No outputs yet. Start with a draft that develops one concept, text map, or question thread.",
      primaryField: "title",
      primaryLabel: "Output title",
      secondaryFields: ["type", "status", "source_materials"],
      fields: outputFields,
      initialForm: {
        title: "",
        type: "",
        source_materials: "",
        content: "",
        status: "Drafting",
      },
      load: async () => (await getPhilosophyOutputs()).map(toRecord<PhilosophyOutput>),
      create: (form) =>
        createPhilosophyOutput({
          title: form.title.trim(),
          type: blankToNull(form.type),
          source_materials: blankToNull(form.source_materials),
          content: blankToNull(form.content),
          status: getOutputStatus(form.status),
        }),
      update: (id, form) =>
        updatePhilosophyOutput(id, {
          title: form.title.trim(),
          type: blankToNull(form.type),
          source_materials: blankToNull(form.source_materials),
          content: blankToNull(form.content),
          status: getOutputStatus(form.status),
        }),
      delete: deletePhilosophyOutput,
    },
  };

  return configs[resource];
}

function makeFormFromItem(config: ResourceConfig, item: PhilosophyRecord) {
  return config.fields.reduce<FormState>((form, field) => {
    form[field.name] = item[field.name] || "";
    return form;
  }, {});
}

export function PhilosophyResourceManager({
  resource,
}: {
  resource: PhilosophyResource;
}) {
  const config = useMemo(() => getConfig(resource), [resource]);
  const [items, setItems] = useState<PhilosophyRecord[]>([]);
  const [form, setForm] = useState<FormState>(config.initialForm);
  const [editForm, setEditForm] = useState<FormState>(config.initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setItems(await config.load());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
  }, [loadItems]);

  async function handleCreate() {
    if (!form[config.primaryField]?.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await config.create(form);
      setForm(config.initialForm);
      await loadItems();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(itemId: string) {
    if (!editForm[config.primaryField]?.trim()) return;

    setSaving(true);
    setError(null);

    try {
      await config.update(itemId, editForm);
      setEditingId(null);
      setEditForm(config.initialForm);
      await loadItems();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;

    setError(null);

    try {
      await config.delete(itemId);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete item.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <Link href="/philosophy" className="text-sm text-neutral-500 hover:text-neutral-950">
          Back to Philosophy
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{config.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{config.description}</p>
      </header>

      <section className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">{config.addLabel}</h2>
        <ResourceForm
          fields={config.fields}
          form={form}
          onChange={setForm}
          submitLabel={saving ? "Saving..." : config.addLabel}
          onSubmit={handleCreate}
          disabled={saving}
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Entries</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Study Schedule records what happened today; this area organizes it
            into long-term, reusable philosophical material.
          </p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {loading ? <p className="text-sm text-neutral-500">Loading...</p> : null}

        {!loading && items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-neutral-500">
            {config.emptyText}
          </p>
        ) : null}

        <div className="space-y-5">
          {items.map((item) => {
            const isEditing = editingId === item.id;

            return (
              <article
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                {isEditing ? (
                  <div>
                    <ResourceForm
                      fields={config.fields}
                      form={editForm}
                      onChange={setEditForm}
                      submitLabel={saving ? "Saving..." : "Save changes"}
                      onSubmit={() => handleUpdate(item.id)}
                      disabled={saving}
                      secondaryAction={{
                        label: "Cancel",
                        onClick: () => {
                          setEditingId(null);
                          setEditForm(config.initialForm);
                        },
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">{config.primaryLabel}</p>
                        <h3 className="mt-1 text-lg font-bold">
                          {item[config.primaryField]}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditForm(makeFormFromItem(config, item));
                          }}
                          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm md:grid-cols-3">
                      {config.secondaryFields.map((fieldName) => (
                        <InfoBox
                          key={fieldName}
                          title={
                            config.fields.find((field) => field.name === fieldName)?.label ||
                            fieldName
                          }
                          value={item[fieldName] || "Not filled yet"}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid gap-4">
                      {config.fields
                        .filter(
                          (field) =>
                            field.name !== config.primaryField &&
                            !config.secondaryFields.includes(field.name) &&
                            item[field.name]
                        )
                        .map((field) => (
                          <div key={field.name} className="rounded-xl bg-neutral-50 p-4">
                            <p className="mb-2 text-xs font-bold text-neutral-500">
                              {field.label}
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
                              {item[field.name]}
                            </p>
                          </div>
                        ))}
                    </div>

                    <p className="mt-4 text-xs text-neutral-400">
                      Created: {formatDateTime(item.created_at)} | Updated:{" "}
                      {formatDateTime(item.updated_at)}
                    </p>
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

function ResourceForm({
  fields,
  form,
  onChange,
  submitLabel,
  onSubmit,
  disabled,
  secondaryAction,
}: {
  fields: FieldConfig[];
  form: FormState;
  onChange: (form: FormState) => void;
  submitLabel: string;
  onSubmit: () => void;
  disabled?: boolean;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.name}
            field={field}
            value={form[field.name] || ""}
            onChange={(value) => onChange({ ...form, [field.name]: value })}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitLabel}
        </button>

        {secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="rounded-xl border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  const commonLabel = (
    <span className="mb-1 block text-sm font-bold">
      {field.label}
      {field.required ? <span className="text-red-500"> *</span> : null}
    </span>
  );

  if (field.inputType === "textarea") {
    return (
      <label className="block md:col-span-2">
        {commonLabel}
        <textarea
          value={value}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>
    );
  }

  if (field.inputType === "select") {
    return (
      <label className="block">
        {commonLabel}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="block">
      {commonLabel}
      <input
        type="text"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
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
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <p className="mb-1 text-xs text-neutral-500">{title}</p>
      <p className="whitespace-pre-wrap text-sm">{value || "Not filled yet"}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
