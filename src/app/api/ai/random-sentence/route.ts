import OpenAI from "openai";
import { NextResponse } from "next/server";

type RandomSentenceRequest = {
    mode?: "single" | "all";
    language?: string;
};

type RandomSentenceResult = {
    chinese: string;
    target_sentence: string;
    translation_zh: string;
    explanation: string;
    notes: string;
    english: string;
    german: string;
    russian: string;
};

type NormalisedLanguage = "English" | "Deutsch" | "Русский";

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim();
}

function normaliseLanguage(language: string): NormalisedLanguage {
    const value = language.trim().toLowerCase();

    if (value === "deutsch" || value === "german" || value === "de") {
        return "Deutsch";
    }

    if (value === "русский" || value === "russian" || value === "ru") {
        return "Русский";
    }

    return "English";
}

function extractJson(text: string): Partial<RandomSentenceResult> {
    const cleaned = text.trim();

    try {
        return JSON.parse(cleaned) as Partial<RandomSentenceResult>;
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error(`AI did not return JSON. Raw output: ${cleaned}`);
        }

        return JSON.parse(match[0]) as Partial<RandomSentenceResult>;
    }
}

function toStringValue(value: unknown) {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
}

function normaliseResult(raw: Partial<RandomSentenceResult>): RandomSentenceResult {
    return {
        chinese: toStringValue(raw.chinese),
        target_sentence: toStringValue(raw.target_sentence),
        translation_zh: toStringValue(raw.translation_zh),
        explanation: toStringValue(raw.explanation),
        notes: toStringValue(raw.notes),
        english: toStringValue(raw.english),
        german: toStringValue(raw.german),
        russian: toStringValue(raw.russian),
    };
}

function hasLatin(text: string) {
    return /[A-Za-z]/.test(text);
}

function hasCyrillic(text: string) {
    return /[\u0400-\u04FF]/.test(text);
}

function cleanExplanation(explanation: string) {
    return explanation
        .replace(/^English:\s*/gim, "")
        .replace(/^Deutsch:\s*/gim, "")
        .replace(/^German:\s*/gim, "")
        .replace(/^Русский:\s*/gim, "")
        .replace(/^Russian:\s*/gim, "")
        .replace(/^英文:\s*/gim, "")
        .replace(/^德文:\s*/gim, "")
        .replace(/^俄文:\s*/gim, "")
        .trim();
}

function buildSinglePrompt(language: NormalisedLanguage) {
    if (language === "Deutsch") {
        return `
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

JSON shape:
{
  "chinese": "string",
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string",
  "english": "string",
  "german": "string",
  "russian": "string"
}

Generate ONE random German sentence for an A1 learner.

Content rules:
- The sentence must be useful in everyday daily life.
- It should sound like something people actually say.
- Prefer situations such as buying food, asking for help, studying, going out, making plans, being tired, being late, ordering drinks, asking directions, or simple feelings.
- Avoid abstract slogans, philosophical sayings, moral maxims, academic statements, and literary aphorisms.
- Keep it short and practical.

Language rules:
- target_sentence MUST be German.
- target_sentence MUST NOT be English.
- german must contain the same German sentence.
- english must be an empty string.
- russian must be an empty string.
- chinese and translation_zh must both be the Traditional Chinese meaning.

Explanation rules:
- explanation must explain the German target_sentence word by word in English.
- Do not include labels like "Deutsch:" or "German:".
- Format:
  German word: English meaning
  German word: English meaning

Notes:
- notes must be Traditional Chinese.
- notes should briefly explain grammar or usage.

Example:
{
  "chinese": "我想買一杯咖啡。",
  "target_sentence": "Ich möchte einen Kaffee kaufen.",
  "translation_zh": "我想買一杯咖啡。",
  "explanation": "Ich: I\\nmöchte: would like\\neinen: a\\nKaffee: coffee\\nkaufen: buy",
  "notes": "這是一句很常見的日常句子。möchte 表示「想要」，語氣比直接說 will 更禮貌。",
  "english": "",
  "german": "Ich möchte einen Kaffee kaufen.",
  "russian": ""
}
`;
    }

    if (language === "Русский") {
        return `
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

JSON shape:
{
  "chinese": "string",
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string",
  "english": "string",
  "german": "string",
  "russian": "string"
}

Generate ONE random Russian sentence for a beginner learner.

Content rules:
- The sentence must be useful in everyday daily life.
- It should sound like something people actually say.
- Prefer situations such as buying food, asking for help, studying, going out, making plans, being tired, being late, ordering drinks, asking directions, or simple feelings.
- Avoid abstract slogans, philosophical sayings, moral maxims, academic statements, and literary aphorisms.
- Keep it short and practical.

Language rules:
- target_sentence MUST be Russian.
- target_sentence MUST use Cyrillic script.
- target_sentence MUST NOT be English.
- russian must contain the same Russian sentence.
- english must be an empty string.
- german must be an empty string.
- chinese and translation_zh must both be the Traditional Chinese meaning.

Explanation rules:
- explanation must explain the Russian target_sentence word by word in Traditional Chinese.
- explanation must NOT explain the Chinese sentence.
- Do not include labels like "Русский:" or "Russian:".
- Format:
  Russian word: Traditional Chinese meaning
  Russian word: Traditional Chinese meaning

Notes:
- notes must be Traditional Chinese.
- notes should briefly explain grammar or usage.

Example:
{
  "chinese": "我想買咖啡。",
  "target_sentence": "Я хочу купить кофе.",
  "translation_zh": "我想買咖啡。",
  "explanation": "Я: 我\\nхочу: 想要\\nкупить: 買\\nкофе: 咖啡",
  "notes": "這是一句很常見的日常句子。хочу 後面接動詞原形 купить，表示「我想要做某事」。",
  "english": "",
  "german": "",
  "russian": "Я хочу купить кофе."
}
`;
    }

    return `
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

JSON shape:
{
  "chinese": "string",
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string",
  "english": "string",
  "german": "string",
  "russian": "string"
}

Generate ONE random English sentence for a language learner.

Content rules:
- The sentence must be useful in everyday daily life.
- It should sound like something people actually say.
- Prefer situations such as buying food, asking for help, studying, going out, making plans, being tired, being late, ordering drinks, asking directions, or simple feelings.
- Avoid abstract slogans, philosophical sayings, moral maxims, academic statements, and literary aphorisms.
- Keep it short and practical.

Language rules:
- target_sentence MUST be English.
- english must contain the same English sentence.
- german must be an empty string.
- russian must be an empty string.
- chinese and translation_zh must both be the Traditional Chinese meaning.
- explanation must be an empty string.

Notes:
- notes must be Traditional Chinese.
- notes should briefly explain usage or naturalness.

Example:
{
  "chinese": "我今天有點累。",
  "target_sentence": "I'm a bit tired today.",
  "translation_zh": "我今天有點累。",
  "explanation": "",
  "notes": "這是一句很自然的日常英文。a bit tired 比 very tired 語氣更輕，常用於日常對話。",
  "english": "I'm a bit tired today.",
  "german": "",
  "russian": ""
}
`;
}

function buildAllPrompt() {
    return `
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.

JSON shape:
{
  "chinese": "string",
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string",
  "english": "string",
  "german": "string",
  "russian": "string"
}

Generate ONE random everyday-life Chinese sentence, then translate it into English, German, and Russian.

Content rules:
- The Chinese sentence must be useful in everyday daily life.
- It should sound like something people actually say.
- Prefer situations such as buying food, asking for help, studying, going out, making plans, being tired, being late, ordering drinks, asking directions, or simple feelings.
- Avoid abstract slogans, philosophical sayings, moral maxims, academic statements, and literary aphorisms.
- Keep it short and practical.

Language rules:
- chinese must be Traditional Chinese.
- translation_zh must be the same as chinese.
- english must be natural English.
- german must be simple German suitable for A1 learners.
- russian must be simple Russian using Cyrillic script.
- target_sentence should be the English sentence.

Explanation rules:
- Do not explain English.
- explanation should include German word-by-word meanings in English and Russian word-by-word meanings in Traditional Chinese.
- Use this format exactly:

Deutsch:
German word: English meaning
German word: English meaning

Русский:
Russian word: Traditional Chinese meaning
Russian word: Traditional Chinese meaning

Notes:
- notes must be Traditional Chinese.
- notes should briefly explain useful grammar or usage.

Example:
{
  "chinese": "我想買一杯咖啡。",
  "target_sentence": "I want to buy a cup of coffee.",
  "translation_zh": "我想買一杯咖啡。",
  "explanation": "Deutsch:\\nIch: I\\nmöchte: would like\\neinen: a\\nKaffee: coffee\\nkaufen: buy\\n\\nРусский:\\nЯ: 我\\nхочу: 想要\\nкупить: 買\\nкофе: 咖啡",
  "notes": "這三句都很適合日常使用。德文 möchte 是比較禮貌的「想要」，俄文 хочу 後面接動詞原形。",
  "english": "I want to buy a cup of coffee.",
  "german": "Ich möchte einen Kaffee kaufen.",
  "russian": "Я хочу купить кофе."
}
`;
}

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
        route: "random-sentence",
        mode: "daily-life random sentence generation",
        hasOpenAIKey: Boolean(apiKey),
        keyLength: apiKey?.length ?? 0,
        keyStart: apiKey ? apiKey.slice(0, 12) : null,
        keyEnd: apiKey ? apiKey.slice(-8) : null,
    });
}

export async function POST(request: Request) {
    try {
        const apiKey = getApiKey();

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY in .env.local." },
                { status: 500 }
            );
        }

        const body = (await request.json()) as RandomSentenceRequest;

        const mode = body.mode === "all" ? "all" : "single";
        const language = normaliseLanguage(body.language || "English");

        const client = new OpenAI({
            apiKey,
        });

        const prompt = mode === "all" ? buildAllPrompt() : buildSinglePrompt(language);

        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content:
                        "You are a strict language-learning sentence generator. Return only valid JSON and follow the selected language exactly.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const outputText = response.output_text;

        if (!outputText) {
            return NextResponse.json(
                { error: "The AI response was empty." },
                { status: 500 }
            );
        }

        const rawResult = extractJson(outputText);
        const result = normaliseResult(rawResult);

        result.explanation = cleanExplanation(result.explanation);

        if (mode === "single") {
            if (language === "English") {
                result.explanation = "";
                result.english = result.target_sentence;
                result.german = "";
                result.russian = "";
            }

            if (language === "Deutsch") {
                result.german = result.target_sentence;
                result.english = "";
                result.russian = "";
            }

            if (language === "Русский") {
                result.russian = result.target_sentence;
                result.english = "";
                result.german = "";
            }
        }

        if (!result.chinese) {
            result.chinese = result.translation_zh;
        }

        if (!result.translation_zh) {
            result.translation_zh = result.chinese;
        }

        if (language === "Русский" && mode === "single") {
            if (!hasCyrillic(result.target_sentence) || hasLatin(result.target_sentence)) {
                return NextResponse.json(
                    {
                        error:
                            "The AI returned a non-Russian target sentence. Please press Generate random sentence again.",
                        raw: result,
                    },
                    { status: 500 }
                );
            }
        }

        if (mode === "all") {
            if (!hasCyrillic(result.russian) || hasLatin(result.russian)) {
                return NextResponse.json(
                    {
                        error:
                            "The AI returned a non-Russian sentence in the all-language result. Please press Generate random sentence again.",
                        raw: result,
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Random sentence API error:", error);

        let message = "Failed to generate random sentence.";

        if (error instanceof Error) {
            message = error.message;
        }

        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 }
        );
    }
}