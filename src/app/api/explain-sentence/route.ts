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

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
        route: "explain-sentence",
        mode: "generate target sentence from Chinese prompt",
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

        const language = body.language || "English";
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
                        "You generate and explain language-learning sentences. Return only valid JSON. Do not use markdown or code fences.",
                },
                {
                    role: "user",
                    content: `
Return ONLY this JSON shape:
{
  "target_sentence": "string",
  "translation_zh": "string",
  "explanation": "string",
  "notes": "string"
}

Target language: ${language}
Chinese meaning / prompt: ${sourceZh}
Existing target sentence, if any: ${existingTargetSentence}
Existing Chinese translation, if any: ${existingTranslationZh}

Task:
- If there is a Chinese prompt, generate a natural sentence in the target language.
- If there is already an existing target sentence, you may improve it naturally while preserving the meaning.
- Then provide Traditional Chinese translation, explanation, and learning notes.

Rules:
- target_sentence must be in the selected target language.
- translation_zh must be Traditional Chinese.
- If language is Deutsch, explanation must be in English.
- If language is English or Русский, explanation must be in Traditional Chinese.
- notes must be in Traditional Chinese.
- Explain grammar, sentence structure, vocabulary, and natural usage.
- For English, provide a natural C1-level sentence unless the Chinese prompt is simple.
- For Deutsch, keep the sentence suitable for A1 learners.
- For Русский, keep the sentence suitable for beginners.
- Keep the result useful for language learning.
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