import assert from "node:assert/strict";
import test from "node:test";
import {
  ankiDraftsToCsv,
  hasSentenceDuplicate,
  hasVocabularyDuplicate,
  moveItem,
  splitTags,
  type AnkiDraft,
  type JapaneseSentence,
  type JapaneseVocabulary,
} from "../src/lib/language-learning";

function vocabulary(overrides: Partial<JapaneseVocabulary>): JapaneseVocabulary {
  return {
    id: "vocab-1",
    user_id: "user-1",
    writing: "現実",
    reading_kana: "げんじつ",
    romaji: "genjitsu",
    meaning_zh: "現實",
    part_of_speech: "名詞",
    example_sentence: null,
    tags: [],
    source: null,
    notes: null,
    mastery: "未學",
    add_to_anki: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function sentence(overrides: Partial<JapaneseSentence>): JapaneseSentence {
  return {
    id: "sentence-1",
    user_id: "user-1",
    japanese_text: "これは現実です。",
    furigana_text: null,
    romaji: null,
    translation_zh: "這是現實。",
    structure_notes: null,
    grammar_points: null,
    source: null,
    tags: [],
    notes: null,
    add_to_anki: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("splitTags trims Chinese and western separators", () => {
  assert.deepEqual(splitTags("哲學, 日文，語法、哲學"), ["哲學", "日文", "語法"]);
});

test("detects duplicate Japanese vocabulary by writing and kana", () => {
  const items = [vocabulary({})];
  assert.equal(hasVocabularyDuplicate(items, "現実", "げんじつ"), true);
  assert.equal(hasVocabularyDuplicate(items, "現実性", "げんじつせい"), false);
  assert.equal(hasVocabularyDuplicate(items, "現実", "げんじつ", "vocab-1"), false);
});

test("detects duplicate Japanese sentences by exact original sentence", () => {
  const items = [sentence({})];
  assert.equal(hasSentenceDuplicate(items, "これは現実です。"), true);
  assert.equal(hasSentenceDuplicate(items, "これは可能性です。"), false);
});

test("moveItem reorders analysis and alignment rows safely", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 5, 1), ["a", "b", "c"]);
});

test("Anki CSV escapes quotes, commas, newlines, and UTF-8 content", () => {
  const drafts: AnkiDraft[] = [
    {
      id: "draft-1",
      user_id: "user-1",
      card_type: "custom",
      front: "現実, actuality",
      back: "第一行\n包含 \"引號\"",
      source_item_type: null,
      source_item_id: null,
      tags: ["日文", "哲學"],
      status: "待處理",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ];

  assert.equal(
    ankiDraftsToCsv(drafts),
    'Front,Back,Tags,CardType\r\n"現実, actuality","第一行\n包含 ""引號""","日文 哲學","custom"'
  );
});
