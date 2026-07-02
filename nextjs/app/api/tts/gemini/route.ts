// Proxy to Google's Gemini Flash TTS. Returns base64 signed-16-bit PCM which we
// wrap in a WAV container before responding. Key stays server-side.

import { NextResponse } from "next/server";
import { guard } from "@/app/server/tts-guard";
import { GEMINI_VOICE_IDS } from "@/app/lib/tts/voices";
import { pcm16ToWavBuffer } from "@/app/lib/tts/wav";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GeminiPart {
  inlineData?: { data: string; mimeType?: string };
}

function rateFromMime(mime: string | undefined): number {
  const m = mime?.match(/rate=(\d+)/);
  return m ? Number(m[1]) : 24000;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    voice?: string;
    instructions?: string;
    turnstileToken?: string;
  };

  const g = await guard({
    req,
    scope: "gemini",
    text: body.text,
    voice: body.voice,
    allowedVoices: GEMINI_VOICE_IDS,
    turnstileToken: body.turnstileToken,
    keyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
  if ("error" in g) return g.error;

  const model = process.env.GEMINI_TTS_MODEL ?? "gemini-2.5-flash-preview-tts";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const prompt = body.instructions?.trim()
    ? `${body.instructions.trim()}\n\n${g.ok.text}`
    : g.ok.text;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: g.ok.voice } },
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[tts/gemini] upstream error", res.status, detail.slice(0, 300));
    return NextResponse.json({ error: `Gemini request failed (${res.status}).` }, { status: 502 });
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  };
  const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part?.inlineData?.data) {
    return NextResponse.json({ error: "Gemini returned no audio." }, { status: 502 });
  }

  const pcm = Buffer.from(part.inlineData.data, "base64");
  const pcmArrayBuffer = pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
  const wav = pcm16ToWavBuffer(pcmArrayBuffer, rateFromMime(part.inlineData.mimeType));

  return new Response(wav, {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
  });
}
