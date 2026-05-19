import OpenAI from "openai";
import { NextResponse } from "next/server";

type GenerateArticleRequest = {
    language?: string;
    topic?: string;
    level?: string;
};

type GeneratedArticle = {
    title: string;
    content: string;
    translation_zh: string;
    notes: string;
};

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim();
}

function extractJson(text: string): GeneratedArticle {
    const cleaned = text.trim();

    try {
        return JSON.parse(cleaned) as GeneratedArticle;
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);

        if (!match) {
            throw new Error(`AI did not return JSON. Raw output: ${cleaned}`);
        }

        return JSON.parse(match[0]) as GeneratedArticle;
    }
}

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
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

        const body = (await request.json()) as GenerateArticleRequest;

        const language = body.language || "English";
        const topic = body.topic || "daily life";
        const level = body.level || "C1";

        const client = new OpenAI({
            apiKey,
        });

        const response = await client.responses.create({
            model: "gpt-4o-mini",
            input: [
                {
                    role: "system",
                    content:
                        "You generate short reading articles for a personal language-learning app. Return only valid JSON. Do not use markdown or code fences.",
                },
                {
                    role: "user",
                    content: `
Return ONLY this JSON shape:
{
  "title": "string",
  "content": "string",
  "translation_zh": "string",
  "notes": "string"
}

Language: ${language}
Topic: ${topic}
Level: ${level}

Rules:
- If language is English, write at approximately C1 level unless the selected level says otherwise.
- If language is Deutsch, write at approximately A1 level unless the selected level says otherwise.
- If language is Русский, write at beginner level unless the selected level says otherwise.
- The article should be short, readable, and useful for language learning.
- English content should be around 120 to 220 words.
- Deutsch or Русский beginner content should be shorter.
- translation_zh must be in Traditional Chinese.
- notes must be in Traditional Chinese and include useful vocabulary, grammar, or reading notes.
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

        const article = extractJson(outputText);

        if (
            typeof article.title !== "string" ||
            typeof article.content !== "string" ||
            typeof article.translation_zh !== "string" ||
            typeof article.notes !== "string"
        ) {
            return NextResponse.json(
                {
                    error: "The AI response JSON had an invalid structure.",
                    raw: article,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(article);
    } catch (error: unknown) {
        console.error("Generate article API error:", error);

        let message = "Failed to generate article.";

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