// Proxy to OpenAI's speech API (gpt-4o-mini-tts). The API key never leaves the
// server. Guarded by input caps + voice allow-list + rate limiting.

import { NextResponse } from "next/server";
import { guard } from "@/app/server/tts-guard";
import { OPENAI_VOICE_IDS } from "@/app/lib/tts/voices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    text?: string;
    voice?: string;
    instructions?: string;
    turnstileToken?: string;
  };

  const g = await guard({
    req,
    scope: "openai",
    text: body.text,
    voice: body.voice,
    allowedVoices: OPENAI_VOICE_IDS,
    turnstileToken: body.turnstileToken,
    keyConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
  if ("error" in g) return g.error;

  const model = process.env.OPENAI_TTS_MODEL ?? "gpt-4o-mini-tts";
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: g.ok.text,
      voice: g.ok.voice,
      response_format: "wav",
      instructions: body.instructions?.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[tts/openai] upstream error", res.status, detail.slice(0, 300));
    return NextResponse.json({ error: `OpenAI request failed (${res.status}).` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
  });
}
