import OpenAI from "openai";
import { NextResponse } from "next/server";

type SpeechRequest = {
    text?: string;
    language?: string;
};

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim();
}

export async function GET() {
    const apiKey = getApiKey();

    return NextResponse.json({
        ok: true,
        source: ".env.local",
        route: "speech",
        mode: "generate speech audio from text",
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

        const body = (await request.json()) as SpeechRequest;

        const text = body.text || "";
        const language = body.language || "English";

        if (!text.trim()) {
            return NextResponse.json(
                { error: "Please provide text for speech." },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            apiKey,
        });

        const response = await client.audio.speech.create({
            model: "gpt-4o-mini-tts",
            voice: "alloy",
            input: text,
            instructions: `Read this ${language} sentence clearly and naturally for a language learner.`,
            response_format: "mp3",
        });

        const audioBuffer = Buffer.from(await response.arrayBuffer());

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Disposition": 'inline; filename="speech.mp3"',
            },
        });
    } catch (error: unknown) {
        console.error("Speech API error:", error);

        let message = "Failed to generate speech.";

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