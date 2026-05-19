import OpenAI from "openai";
import { NextResponse } from "next/server";

type ExplainVocabularyRequest = {
  language?: string;
  prompt_zh?: string;
  word?: string;
};

type VocabularyAIResult = {
  word: string;
  meaning_zh: string;
  part_of_speech: string;
  example_sentence: string;
  example_translation_zh: string;
  usage_notes: string;
  notes: string;
};

function getApiKey() {
  return process.env.OPENAI_API_KEY?.trim();
}

function extractJson(text: string): VocabularyAIResult {
  const cleaned = text.trim();

  try {
    return JSON.parse(cleaned) as VocabularyAIResult;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error(`AI did not return JSON. Raw output: ${cleaned}`);
    }

    return JSON.parse(match[0]) as VocabularyAIResult;
  }
}

export async function GET() {
  const apiKey = getApiKey();

  return NextResponse.json({
    ok: true,
    source: ".env.local",
    route: "explain-vocabulary",
    mode: "Chinese prompt to target-language vocabulary",
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

    const body = (await request.json()) as ExplainVocabularyRequest;

    const language = body.language || "English";
    const promptZh = body.prompt_zh || "";
    const existingWord = body.word || "";

    if (!promptZh.trim() && !existingWord.trim()) {
      return NextResponse.json(
        { error: "Please provide a Chinese prompt." },
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
            "You generate vocabulary translations for a personal language-learning app. Return only valid JSON. Do not use markdown or code fences.",
        },
        {
          role: "user",
          content: `
Return ONLY this JSON shape:
{
  "word": "string",
  "meaning_zh": "string",
  "part_of_speech": "string",
  "example_sentence": "string",
  "example_translation_zh": "string",
  "usage_notes": "string",
  "notes": "string"
}

Target language: ${language}
Chinese prompt: ${promptZh}
Existing target word or phrase, if any: ${existingWord}

Important bracket rule:
- If the Chinese prompt contains text inside square brackets, such as 規定性[黑格爾哲學], the bracketed text is the conceptual domain or contextual determination.
- Use the bracketed context to choose the most appropriate translation.
- Do not translate the bracketed text itself as part of the output word.
- Example: 規定性[黑格爾哲學] in English should prefer "determinateness" rather than a generic translation.

Task:
- Generate one or more possible target-language translations.
- Put all possible translations in the "word" field, separated by semicolons.
- The first translation should be the most contextually appropriate one.
- meaning_zh must explain the Chinese meaning in Traditional Chinese.
- part_of_speech should be concise.
- example_sentence must use the first or most appropriate translation.
- example_translation_zh must be Traditional Chinese.
- usage_notes must be Traditional Chinese.
- notes must be Traditional Chinese and must explain subtle differences among the candidate translations.

Rules:
- If language is English, explain nuance, register, philosophical or technical usage when relevant.
- If language is Deutsch, keep explanation suitable for A1 learners unless the prompt is philosophical or technical.
- If language is Русский, keep explanation suitable for beginners unless the prompt is philosophical or technical.
- If the prompt is philosophical, preserve conceptual precision.
- If multiple translations are possible, notes must compare them clearly.
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
      typeof result.word !== "string" ||
      typeof result.meaning_zh !== "string" ||
      typeof result.part_of_speech !== "string" ||
      typeof result.example_sentence !== "string" ||
      typeof result.example_translation_zh !== "string" ||
      typeof result.usage_notes !== "string" ||
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
    console.error("Explain vocabulary API error:", error);

    let message = "Failed to generate vocabulary.";

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