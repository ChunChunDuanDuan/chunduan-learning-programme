import OpenAI from "openai";
import { NextResponse } from "next/server";

type TranslateSentenceAllRequest = {
    chinese?: string;
};

type TranslateSentenceAllResult = {
    english: string;
    german: string;
    russian: string;
    explanation: string;
    notes: string;
};

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim();
}

function extractJson(text: string): TranslateSentenceAllResult {
    const cleaned = text.trim();

    try {
        return JSON.parse(cleaned) as TranslateSentenceAllResult;
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error(`AI did not return JSON. Raw output: ${cleaned}`);
        }

        return JSON.parse(match[0]) as TranslateSentenceAllResult;
    }
}

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
        route: "translate-sentence-all",
        mode: "translate Chinese sentence into English, German, and Russian",
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

        const body = (await request.json()) as TranslateSentenceAllRequest;
        const chinese = body.chinese || "";

        if (!chinese.trim()) {
            return NextResponse.json(
                { error: "Please provide a Chinese sentence." },
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
                    content: `
You are a language-learning assistant for English, German, and Russian.

Return only valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text outside the JSON object.

The JSON must have exactly this shape:
{
  "english": "string",
  "german": "string",
  "russian": "string",
  "explanation": "string",
  "notes": "string"
}
`,
                },
                {
                    role: "user",
                    content: `
Chinese sentence:
${chinese}

Task:
Translate this Chinese sentence into:
1. English
2. Deutsch
3. Русский

Language-level rules:
- English should be natural. Use a C1-level sentence if appropriate, but keep simple prompts natural and not overcomplicated.
- Deutsch should be suitable for A1 learners.
- Русский should be suitable for beginners.

Explanation rules:
- Do not generate explanation for English.
- For Deutsch, explanation must contain only word-by-word meanings in English.
- For Русский, explanation must contain only word-by-word meanings in Traditional Chinese.
- Put Deutsch and Русский explanation in the same "explanation" field.
- Do not put grammar, sentence-level explanation, usage notes, nuance, or alternatives in explanation.
- Put grammar, sentence-level explanation, usage notes, nuance, alternative expressions, and important reminders in notes.

The explanation format should be:

Deutsch:
German word: English meaning
German word: English meaning

Русский:
Russian word: Traditional Chinese meaning
Russian word: Traditional Chinese meaning

Notes rules:
- notes must be in Traditional Chinese.
- notes should briefly explain useful grammar, usage, nuance, or important reminders.
- If there is nothing important to add, write a short useful note.

Example output:
{
  "english": "I'll think about it when the time comes.",
  "german": "Ich überlege es mir später.",
  "russian": "Я подумаю об этом позже.",
  "explanation": "Deutsch:\\nIch: I\\nüberlege: think about / consider\\nes: it\\nmir: for myself\\nspäter: later\\n\\nРусский:\\nЯ: 我\\nподумаю: 會想一想／考慮\\nоб: 關於\\nэтом: 這件事\\nпозже: 晚一點／之後",
  "notes": "英文句子很自然，適合表示「到時候再看看」。德文的 mir 表示這個思考是自己心裡考慮。俄文 подумаю 是未完成體/完成體語感中偏向「我會想一下」的說法，適合初學者先記成固定表達。"
}
`,
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

        const result = extractJson(outputText);

        if (
            typeof result.english !== "string" ||
            typeof result.german !== "string" ||
            typeof result.russian !== "string" ||
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

        return NextResponse.json({
            ...result,
            notes: "",
        });
    } catch (error: unknown) {
        console.error("Translate sentence all API error:", error);

        let message = "Failed to translate sentence into all languages.";

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