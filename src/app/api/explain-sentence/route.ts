import OpenAI from "openai";
import { NextResponse } from "next/server";

type ExplainSentenceRequest = {
    language?: string;
    source_zh?: string;
    target_sentence?: string;
    translation_zh?: string;
};

type SentenceAIResult = {
    target_sentence: string;
    translation_zh: string;
    explanation: string;
    notes: string;
};

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim();
}

function extractJson(text: string): SentenceAIResult {
    const cleaned = text.trim();

    try {
        return JSON.parse(cleaned) as SentenceAIResult;
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error(`AI did not return JSON. Raw output: ${cleaned}`);
        }

        return JSON.parse(match[0]) as SentenceAIResult;
    }
}

function hasCyrillic(text: string) {
    return /[\u0400-\u04FF]/.test(text);
}

function hasLatin(text: string) {
    return /[A-Za-z]/.test(text);
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

function normaliseLanguage(language: string) {
    const value = language.trim().toLowerCase();

    if (
        value === "deutsch" ||
        value === "german" ||
        value === "de"
    ) {
        return "Deutsch";
    }

    if (
        value === "русский" ||
        value === "russian" ||
        value === "ru"
    ) {
        return "Русский";
    }

    return "English";
}

function buildPrompt({
    language,
    sourceZh,
    existingTargetSentence,
    existingTranslationZh,
}: {
    language: string;
    sourceZh: string;
    existingTargetSentence: string;
    existingTranslationZh: string;
}) {
    const sharedJsonRule = `
Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text outside JSON.

JSON shape:
{
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string"
}
`;

    const dailyLifeRule = `
The sentence must be common in everyday life.
Prefer daily conversation, study, work, shopping, eating, going out, asking for help, making plans, feelings, simple opinions, and common social situations.
Avoid abstract slogans, philosophical sayings, moral maxims, political claims, academic statements, and literary aphorisms.
It should sound like something people actually say in daily conversation.
Keep it short and practical.
`;

    if (language === "Русский") {
        return `
${sharedJsonRule}

You are generating a Russian sentence for a beginner learner.

Selected language: Russian / Русский.

Chinese prompt:
${sourceZh}

Existing Russian sentence, if any:
${existingTargetSentence}

Existing Chinese translation, if any:
${existingTranslationZh}

Task:
Generate a natural Russian sentence in Cyrillic script from the Chinese prompt.

Absolute rules:
- target_sentence MUST be Russian.
- target_sentence MUST use Cyrillic script.
- target_sentence MUST NOT be English.
- Do not put any English sentence in target_sentence.
- translation_zh must be Traditional Chinese.
- explanation must explain the RUSSIAN target_sentence word by word in Traditional Chinese.
- explanation must NOT explain the Chinese prompt.
- explanation must NOT contain labels like "Русский:" or "Russian:".
- notes must be an empty string: ""
- Do not generate notes.
- The notes field is reserved for the user's own personal notes.

${dailyLifeRule}

Explanation format:
Russian word: Traditional Chinese meaning
Russian word: Traditional Chinese meaning

Example:
{
  "target_sentence": "Я хочу купить кофе.",
  "translation_zh": "我想買咖啡。",
  "explanation": "Я: 我\\nхочу: 想要\\nкупить: 買\\nкофе: 咖啡",
  "notes": ""
}
`;
    }

    if (language === "Deutsch") {
        return `
${sharedJsonRule}

You are generating a German sentence for an A1 learner.

Selected language: German / Deutsch.

Chinese prompt:
${sourceZh}

Existing German sentence, if any:
${existingTargetSentence}

Existing Chinese translation, if any:
${existingTranslationZh}

Task:
Generate a natural German sentence from the Chinese prompt.

Absolute rules:
- target_sentence MUST be German.
- target_sentence MUST NOT be English.
- translation_zh must be Traditional Chinese.
- explanation must explain the GERMAN target_sentence word by word in English.
- explanation must NOT explain the Chinese prompt.
- explanation must NOT contain labels like "Deutsch:" or "German:".
- notes must be Traditional Chinese.
- notes should explain grammar, usage, sentence structure, and naturalness.

${dailyLifeRule}

Explanation format:
German word: English meaning
German word: English meaning

Example:
{
  "target_sentence": "Ich möchte Kaffee kaufen.",
  "translation_zh": "我想買咖啡。",
  "explanation": "Ich: I\\nmöchte: would like\\nKaffee: coffee\\nkaufen: buy",
  "notes": "這是一句很常見的日常句子。möchte 比 will 更禮貌，適合初學者先記起來。"
}
`;
    }

    return `
${sharedJsonRule}

You are generating an English sentence for a language learner.

Selected language: English.

Chinese prompt:
${sourceZh}

Existing English sentence, if any:
${existingTargetSentence}

Existing Chinese translation, if any:
${existingTranslationZh}

Task:
Generate a natural English sentence from the Chinese prompt.

Absolute rules:
- target_sentence MUST be English.
- translation_zh must be Traditional Chinese.
- explanation must be an empty string: "".
- notes must be Traditional Chinese.
- notes should explain usage, nuance, sentence structure, and naturalness.

${dailyLifeRule}

Example:
{
  "target_sentence": "I want to buy some coffee.",
  "translation_zh": "我想買一些咖啡。",
  "explanation": "",
  "notes": "這是一句很自然的日常英文。some coffee 比 a coffee 更泛用，表示想買一些咖啡。"
}
`;
}

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
        route: "explain-sentence",
        mode: "daily-life sentence generation",
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

        const body = (await request.json()) as ExplainSentenceRequest;

        const language = normaliseLanguage(body.language || "English");
        const sourceZh = body.source_zh || "";
        const existingTargetSentence = body.target_sentence || "";
        const existingTranslationZh = body.translation_zh || "";

        if (!sourceZh.trim() && !existingTargetSentence.trim()) {
            return NextResponse.json(
                {
                    error:
                        "Please provide either a Chinese prompt or an existing target sentence.",
                },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            apiKey,
        });

        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content:
                        "You are a strict language-learning sentence generator. You must follow the selected language exactly.",
                },
                {
                    role: "user",
                    content: buildPrompt({
                        language,
                        sourceZh,
                        existingTargetSentence,
                        existingTranslationZh,
                    }),
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

        const result: SentenceAIResult = {
            target_sentence: rawResult.target_sentence.trim(),
            translation_zh: rawResult.translation_zh.trim(),
            explanation:
                language === "English" ? "" : cleanExplanation(rawResult.explanation),
            notes: "",
        };

        if (
            typeof result.target_sentence !== "string" ||
            typeof result.translation_zh !== "string" ||
            typeof result.explanation !== "string" ||
            typeof result.notes !== "string"
        ) {
            return NextResponse.json(
                {
                    error: "The AI response JSON had an invalid structure.",
                    raw: result,
                },
                { status: 500 }
            );
        }

        if (language === "Русский") {
            if (!hasCyrillic(result.target_sentence) || hasLatin(result.target_sentence)) {
                return NextResponse.json(
                    {
                        error:
                            "The AI returned a non-Russian target sentence. Please try again.",
                        raw: result,
                    },
                    { status: 500 }
                );
            }
        }

        if (language === "Deutsch") {
            if (hasCyrillic(result.target_sentence)) {
                return NextResponse.json(
                    {
                        error:
                            "The AI returned a non-German target sentence. Please try again.",
                        raw: result,
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error("Explain sentence API error:", error);

        let message = "Failed to generate sentence.";

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