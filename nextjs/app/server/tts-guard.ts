// Shared request validation for the cloud TTS routes: input caps, voice
// allow-listing, optional Cloudflare Turnstile, and rate limiting. Returns a
// ready-to-send error Response, or null when the request may proceed.

import { NextResponse } from "next/server";
import { limitRequest } from "./ratelimit";

export const MAX_CHARS = Number(process.env.TTS_MAX_CHARS ?? 2000);

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

function err(status: number, message: string, extra?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers: extra });
}

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return true; // not configured -> skip
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export interface GuardInput {
  req: Request;
  scope: string;
  text: unknown;
  voice: unknown;
  allowedVoices: string[];
  turnstileToken?: string;
  /** Set when the corresponding provider key is missing from the env. */
  keyConfigured: boolean;
}

export interface GuardOk {
  text: string;
  voice: string;
}

export async function guard(
  input: GuardInput
): Promise<{ error: NextResponse } | { ok: GuardOk }> {
  const { req, scope, allowedVoices, keyConfigured } = input;

  if (!keyConfigured) {
    return { error: err(503, "This cloud voice isn't configured on the server.") };
  }

  const text = typeof input.text === "string" ? input.text.trim() : "";
  if (!text) return { error: err(400, "No text provided.") };
  if (text.length > MAX_CHARS) {
    return { error: err(413, `Text exceeds the ${MAX_CHARS}-character limit for cloud voices.`) };
  }

  const voice = typeof input.voice === "string" ? input.voice : "";
  if (!allowedVoices.includes(voice)) {
    return { error: err(400, "Unknown voice.") };
  }

  const ip = getClientIp(req);

  const human = await verifyTurnstile(input.turnstileToken, ip);
  if (!human) return { error: err(403, "Verification failed.") };

  const limit = await limitRequest(scope, ip);
  if (!limit.ok) {
    return {
      error: err(429, "Rate limit reached. Please wait and try again.", {
        "Retry-After": String(limit.retryAfterSec ?? 30),
      }),
    };
  }

  return { ok: { text, voice } };
}
