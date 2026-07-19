export type KanaGroup = "basic" | "dakuten" | "handakuten" | "youon";
export type KanaMode = "hiragana" | "katakana" | "both";
export type Mastery = "未學" | "學習中" | "熟悉" | "已掌握";
export type AnkiStatus = "待處理" | "已確認" | "已匯出";
export type AnkiCardType = "japanese_vocabulary" | "japanese_sentence" | "custom";
export type ComparisonType = "句子" | "術語" | "段落";

export type KanaEntry = {
  key: string;
  group: KanaGroup;
  hiragana: string;
  katakana: string;
  romaji: string;
};

export type KanaProgress = {
  kana_key: string;
  answer_count: number;
  correct_count: number;
  last_answered_at: string | null;
};

export type JapaneseVocabulary = {
  id: string;
  user_id: string;
  writing: string;
  reading_kana: string;
  romaji: string | null;
  meaning_zh: string;
  part_of_speech: string | null;
  example_sentence: string | null;
  tags: string[];
  source: string | null;
  notes: string | null;
  mastery: Mastery;
  add_to_anki: boolean;
  created_at: string;
  updated_at: string;
};

export type JapaneseSentence = {
  id: string;
  user_id: string;
  japanese_text: string;
  furigana_text: string | null;
  romaji: string | null;
  translation_zh: string;
  structure_notes: string | null;
  grammar_points: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  add_to_anki: boolean;
  created_at: string;
  updated_at: string;
};

export type AnalysisItemDraft = {
  id?: string;
  original_text: string;
  reading: string;
  dictionary_form: string;
  part_of_speech: string;
  meaning_zh: string;
  grammar_function: string;
  notes: string;
  display_order: number;
};

export type JapaneseSentenceAnalysis = {
  id: string;
  user_id: string;
  japanese_text: string;
  furigana_text: string | null;
  romaji: string | null;
  translation_zh: string | null;
  sentence_core: string | null;
  grammar_notes: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  japanese_sentence_analysis_items?: AnalysisItemDraft[];
};

export type AnkiDraft = {
  id: string;
  user_id: string;
  card_type: AnkiCardType;
  front: string;
  back: string;
  source_item_type: string | null;
  source_item_id: string | null;
  tags: string[];
  status: AnkiStatus;
  created_at: string;
  updated_at: string;
};

export type TermAlignment = {
  id: string;
  comparison_id: string;
  chinese_term: string | null;
  english_term: string | null;
  german_term: string | null;
  japanese_term: string | null;
  note: string | null;
  display_order: number;
};

export type ComparisonDocument = {
  id: string;
  user_id: string;
  title: string;
  comparison_type: ComparisonType;
  chinese_text: string | null;
  english_text: string | null;
  german_text: string | null;
  japanese_text: string | null;
  japanese_furigana: string | null;
  japanese_romaji: string | null;
  source: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  term_alignments?: TermAlignment[];
};

export const PARTS_OF_SPEECH = [
  "名詞",
  "動詞",
  "形容詞",
  "副詞",
  "助詞",
  "助動詞",
  "連體詞",
  "接續詞",
  "感動詞",
  "其他",
] as const;

export const MASTERY_OPTIONS: Mastery[] = ["未學", "學習中", "熟悉", "已掌握"];
export const ANKI_STATUSES: AnkiStatus[] = ["待處理", "已確認", "已匯出"];
export const COMPARISON_TYPES: ComparisonType[] = ["句子", "術語", "段落"];

const basicRows = [
  ["あ", "ア", "a"], ["い", "イ", "i"], ["う", "ウ", "u"], ["え", "エ", "e"], ["お", "オ", "o"],
  ["か", "カ", "ka"], ["き", "キ", "ki"], ["く", "ク", "ku"], ["け", "ケ", "ke"], ["こ", "コ", "ko"],
  ["さ", "サ", "sa"], ["し", "シ", "shi"], ["す", "ス", "su"], ["せ", "セ", "se"], ["そ", "ソ", "so"],
  ["た", "タ", "ta"], ["ち", "チ", "chi"], ["つ", "ツ", "tsu"], ["て", "テ", "te"], ["と", "ト", "to"],
  ["な", "ナ", "na"], ["に", "ニ", "ni"], ["ぬ", "ヌ", "nu"], ["ね", "ネ", "ne"], ["の", "ノ", "no"],
  ["は", "ハ", "ha"], ["ひ", "ヒ", "hi"], ["ふ", "フ", "fu"], ["へ", "ヘ", "he"], ["ほ", "ホ", "ho"],
  ["ま", "マ", "ma"], ["み", "ミ", "mi"], ["む", "ム", "mu"], ["め", "メ", "me"], ["も", "モ", "mo"],
  ["や", "ヤ", "ya"], ["ゆ", "ユ", "yu"], ["よ", "ヨ", "yo"],
  ["ら", "ラ", "ra"], ["り", "リ", "ri"], ["る", "ル", "ru"], ["れ", "レ", "re"], ["ろ", "ロ", "ro"],
  ["わ", "ワ", "wa"], ["を", "ヲ", "wo"], ["ん", "ン", "n"],
];

const dakutenRows = [
  ["が", "ガ", "ga"], ["ぎ", "ギ", "gi"], ["ぐ", "グ", "gu"], ["げ", "ゲ", "ge"], ["ご", "ゴ", "go"],
  ["ざ", "ザ", "za"], ["じ", "ジ", "ji"], ["ず", "ズ", "zu"], ["ぜ", "ゼ", "ze"], ["ぞ", "ゾ", "zo"],
  ["だ", "ダ", "da"], ["ぢ", "ヂ", "ji"], ["づ", "ヅ", "zu"], ["で", "デ", "de"], ["ど", "ド", "do"],
  ["ば", "バ", "ba"], ["び", "ビ", "bi"], ["ぶ", "ブ", "bu"], ["べ", "ベ", "be"], ["ぼ", "ボ", "bo"],
];

const handakutenRows = [
  ["ぱ", "パ", "pa"], ["ぴ", "ピ", "pi"], ["ぷ", "プ", "pu"], ["ぺ", "ペ", "pe"], ["ぽ", "ポ", "po"],
];

const youonRows = [
  ["きゃ", "キャ", "kya"], ["きゅ", "キュ", "kyu"], ["きょ", "キョ", "kyo"],
  ["しゃ", "シャ", "sha"], ["しゅ", "シュ", "shu"], ["しょ", "ショ", "sho"],
  ["ちゃ", "チャ", "cha"], ["ちゅ", "チュ", "chu"], ["ちょ", "チョ", "cho"],
  ["にゃ", "ニャ", "nya"], ["にゅ", "ニュ", "nyu"], ["にょ", "ニョ", "nyo"],
  ["ひゃ", "ヒャ", "hya"], ["ひゅ", "ヒュ", "hyu"], ["ひょ", "ヒョ", "hyo"],
  ["みゃ", "ミャ", "mya"], ["みゅ", "ミュ", "myu"], ["みょ", "ミョ", "myo"],
  ["りゃ", "リャ", "rya"], ["りゅ", "リュ", "ryu"], ["りょ", "リョ", "ryo"],
  ["ぎゃ", "ギャ", "gya"], ["ぎゅ", "ギュ", "gyu"], ["ぎょ", "ギョ", "gyo"],
  ["じゃ", "ジャ", "ja"], ["じゅ", "ジュ", "ju"], ["じょ", "ジョ", "jo"],
  ["びゃ", "ビャ", "bya"], ["びゅ", "ビュ", "byu"], ["びょ", "ビョ", "byo"],
  ["ぴゃ", "ピャ", "pya"], ["ぴゅ", "ピュ", "pyu"], ["ぴょ", "ピョ", "pyo"],
];

function kanaRowsToEntries(group: KanaGroup, rows: string[][]): KanaEntry[] {
  return rows.map(([hiragana, katakana, romaji]) => ({
    key: `${group}-${romaji}-${hiragana}`,
    group,
    hiragana,
    katakana,
    romaji,
  }));
}

export const KANA_ENTRIES: KanaEntry[] = [
  ...kanaRowsToEntries("basic", basicRows),
  ...kanaRowsToEntries("dakuten", dakutenRows),
  ...kanaRowsToEntries("handakuten", handakutenRows),
  ...kanaRowsToEntries("youon", youonRows),
];

export function splitTags(value: string): string[] {
  return value
    .split(/[,\n，、]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, tags) => tags.indexOf(tag) === index);
}

export function tagsToInput(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function hasVocabularyDuplicate(
  items: JapaneseVocabulary[],
  writing: string,
  readingKana: string,
  ignoreId?: string
): boolean {
  const normalizedWriting = normalizeText(writing);
  const normalizedReading = normalizeText(readingKana);
  return items.some(
    (item) =>
      item.id !== ignoreId &&
      normalizeText(item.writing) === normalizedWriting &&
      normalizeText(item.reading_kana) === normalizedReading
  );
}

export function hasSentenceDuplicate(
  items: JapaneseSentence[],
  japaneseText: string,
  ignoreId?: string
): boolean {
  const normalizedSentence = normalizeText(japaneseText);
  return items.some(
    (item) =>
      item.id !== ignoreId && normalizeText(item.japanese_text) === normalizedSentence
  );
}

export function buildVocabularyAnkiDraft(item: JapaneseVocabulary) {
  return {
    card_type: "japanese_vocabulary" as const,
    front: item.writing,
    back: [
      item.reading_kana,
      item.romaji,
      item.meaning_zh,
      item.part_of_speech,
      item.example_sentence,
      item.notes,
    ].filter(Boolean).join("\n\n"),
    source_item_type: "japanese_vocabulary",
    source_item_id: item.id,
    tags: item.tags,
  };
}

export function buildSentenceAnkiDraft(item: JapaneseSentence) {
  return {
    card_type: "japanese_sentence" as const,
    front: item.japanese_text,
    back: [
      item.furigana_text,
      item.romaji,
      item.translation_zh,
      item.grammar_points,
      item.notes,
    ].filter(Boolean).join("\n\n"),
    source_item_type: "japanese_sentence",
    source_item_id: item.id,
    tags: item.tags,
  };
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function ankiDraftsToCsv(drafts: AnkiDraft[]): string {
  const rows = drafts.map((draft) =>
    [
      draft.front,
      draft.back,
      draft.tags.join(" "),
      draft.card_type,
    ].map(csvEscape).join(",")
  );

  return [["Front", "Back", "Tags", "CardType"].join(","), ...rows].join("\r\n");
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  if (fromIndex >= items.length || toIndex >= items.length) return items;

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

export function searchInFields(keyword: string, fields: Array<string | null | undefined>) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return true;
  return fields.some((field) => normalizeText(field).includes(normalizedKeyword));
}
