// Rate limiting for the owner-funded cloud routes. Uses Upstash Redis when
// configured (durable across serverless instances); otherwise an in-memory
// fixed-window fallback for local dev. Both a short burst window and a daily cap.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Duration = `${number} ${"ms" | "s" | "m" | "h" | "d"}`;

const RATE_MAX = Number(process.env.TTS_RATE_MAX ?? 20);
const RATE_WINDOW = (process.env.TTS_RATE_WINDOW ?? "60 s") as Duration;
const DAILY_MAX = Number(process.env.TTS_DAILY_MAX ?? 200);

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

function parseDurationMs(d: Duration): number {
  const [n, unit] = d.split(" ");
  const mult: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(n) * (mult[unit] ?? 1000);
}

/* ── In-memory fallback (single instance / dev) ───────────────────── */

interface Window {
  count: number;
  resetAt: number;
}
const memStore = new Map<string, Window>();

function memLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const w = memStore.get(key);
  if (!w || now >= w.resetAt) {
    memStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, reset: now + windowMs };
  }
  if (w.count >= max) return { success: false, remaining: 0, reset: w.resetAt };
  w.count += 1;
  return { success: true, remaining: max - w.count, reset: w.resetAt };
}

/* ── Upstash limiters (created once) ──────────────────────────────── */

let burst: Ratelimit | null = null;
let daily: Ratelimit | null = null;

if (hasUpstash) {
  const redis = Redis.fromEnv();
  burst = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_MAX, RATE_WINDOW),
    prefix: "tts:burst",
    analytics: false,
  });
  daily = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(DAILY_MAX, "1 d"),
    prefix: "tts:daily",
    analytics: false,
  });
}

export interface LimitResult {
  ok: boolean;
  retryAfterSec?: number;
}

/** Enforce both the burst window and the daily cap for a scope+ip pair. */
export async function limitRequest(scope: string, ip: string): Promise<LimitResult> {
  const key = `${scope}:${ip}`;

  if (hasUpstash && burst && daily) {
    const b = await burst.limit(key);
    if (!b.success) return { ok: false, retryAfterSec: Math.ceil((b.reset - Date.now()) / 1000) };
    const d = await daily.limit(key);
    if (!d.success) return { ok: false, retryAfterSec: Math.ceil((d.reset - Date.now()) / 1000) };
    return { ok: true };
  }

  const b = memLimit(`burst:${key}`, RATE_MAX, parseDurationMs(RATE_WINDOW));
  if (!b.success) return { ok: false, retryAfterSec: Math.ceil((b.reset - Date.now()) / 1000) };
  const d = memLimit(`daily:${key}`, DAILY_MAX, 86_400_000);
  if (!d.success) return { ok: false, retryAfterSec: Math.ceil((d.reset - Date.now()) / 1000) };
  return { ok: true };
}
