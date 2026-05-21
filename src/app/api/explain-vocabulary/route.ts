import OpenAI from "openai";
import { NextResponse } from "next/server";

type VocabularyDirection = "zh-to-target" | "target-to-zh";

type ExplainVocabularyRequest = {
  language?: string;
  direction?: VocabularyDirection;
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
    mode: "bidirectional vocabulary translation",
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
    const direction = body.direction || "zh-to-target";
    const promptZh = body.prompt_zh || "";
    const existingWord = body.word || "";

    if (direction === "zh-to-target" && !promptZh.trim()) {
      return NextResponse.json(
        { error: "Please provide a Chinese prompt." },
        { status: 400 }
      );
    }

    if (direction === "target-to-zh" && !existingWord.trim()) {
      return NextResponse.json(
        { error: "Please provide a target-language word or phrase." },
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
You generate vocabulary explanations for a personal language-learning app.

Return only valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text outside the JSON object.

The JSON must have exactly this shape:
{
  "word": "string",
  "meaning_zh": "string",
  "part_of_speech": "string",
  "example_sentence": "string",
  "example_translation_zh": "string",
  "usage_notes": "string",
  "notes": "string"
}
`,
        },
        {
          role: "user",
          content: `
Direction: ${direction}
Selected language: ${language}
Chinese prompt, if any: ${promptZh}
Target-language word or phrase, if any: ${existingWord}

Important bracket rule:
- If the Chinese prompt contains text inside square brackets, such as 規定性[黑格爾哲學], the bracketed text is the conceptual domain or contextual determination.
- Use the bracketed context to choose the most appropriate translation.
- Do not translate the bracketed text itself as part of the output word.
- Example: 規定性[黑格爾哲學] in English should prefer "determinateness" rather than a generic translation.

If Direction is zh-to-target:
- Translate the Chinese prompt into the selected target language.
- Generate one or more possible target-language translations.
- Put all possible translations in the "word" field, separated by semicolons.
- The first translation should be the most contextually appropriate one.
- meaning_zh must explain the Chinese meaning in Traditional Chinese.
- example_sentence must use the first or most appropriate target-language translation.

If Direction is target-to-zh:
- The user has entered a word or phrase in the selected language.
- Keep the original word or phrase in the "word" field.
- meaning_zh must explain its meaning in Traditional Chinese.
- If the word has multiple meanings, explain the most common meanings and note context differences.
- example_sentence must be in the selected language and must naturally use the word or phrase.
- example_translation_zh must be a Traditional Chinese translation of the example.

General rules:
- part_of_speech should be concise.
- example_translation_zh must be Traditional Chinese.
- usage_notes must be Traditional Chinese.
- usage_notes must not merely repeat the basic meaning of the word.
- usage_notes must explain how the word is naturally used.
- usage_notes should include common collocations, fixed phrases, verb patterns, prepositional patterns, or case patterns when relevant.
- usage_notes should be genuinely useful for language learning, not just a generic description.
- notes must be Traditional Chinese and must explain nuance, register, conceptual usage, or differences among possible meanings/translations.
- If language is English, explain nuance, register, philosophical or technical usage when relevant.
- If language is Deutsch, keep explanation suitable for A1 learners unless the word is philosophical or technical.
- If language is Русский, keep explanation suitable for beginners unless the word is philosophical or technical.
- If the word or prompt is philosophical, preserve conceptual precision.

Language-specific usage_notes rules:
- For English words, include natural collocations, register differences, and common academic or daily-life uses when relevant.
- For German words, include common verb combinations, separable patterns, prepositional combinations, article/case information, or fixed expressions when relevant.
- For Russian words, include common verb pairings, case patterns, everyday phrases, aspectual contrast, or common government patterns when relevant.

Examples of good usage_notes:
- For German "darüber", mention useful patterns such as "darüber nachdenken", "darüber sprechen", "darüber diskutieren", "sich darüber freuen".
- For German "warten", mention "auf etwas warten" and explain that "auf" usually takes Akkusativ here.
- For Russian "нравиться", mention the pattern "мне нравится..." and explain that the experiencer uses dative.
- For English "conduct", mention "conduct research", "conduct an experiment", and the difference between verb and noun if relevant.

Keep usage_notes concise, but include concrete phrase patterns whenever possible.
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