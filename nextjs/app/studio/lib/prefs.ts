// Tiny SSR-safe localStorage helpers for studio preferences. Guards `window`
// and swallows access errors (private mode / disabled storage).

import { ENGINE_ORDER } from "@/app/lib/tts/registry";
import type { EngineId, Voice } from "@/app/lib/tts/types";

const ENGINE_KEY = "studio:engine";
const voiceKey = (engineId: EngineId) => `studio:voice:${engineId}`;

const PIPER_VOICES_KEY = "studio:piper-voices:v1";
const PIPER_VOICES_TTL = 24 * 60 * 60 * 1000; // 24h

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore — storage unavailable (private mode, quota, blocked).
  }
}

export function loadEngine(): EngineId | null {
  const saved = read(ENGINE_KEY);
  return saved && (ENGINE_ORDER as string[]).includes(saved) ? (saved as EngineId) : null;
}

export function saveEngine(engineId: EngineId): void {
  write(ENGINE_KEY, engineId);
}

export function loadVoice(engineId: EngineId): string | null {
  return read(voiceKey(engineId));
}

export function saveVoice(engineId: EngineId, voiceId: string): void {
  write(voiceKey(engineId), voiceId);
}

/** Return the cached Piper voice catalog if present and younger than the TTL. */
export function loadPiperVoices(): Voice[] | null {
  const raw = read(PIPER_VOICES_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { savedAt: number; voices: Voice[] };
    if (
      !parsed ||
      typeof parsed.savedAt !== "number" ||
      !Array.isArray(parsed.voices) ||
      Date.now() - parsed.savedAt > PIPER_VOICES_TTL
    ) {
      return null;
    }
    return parsed.voices;
  } catch {
    return null;
  }
}

export function savePiperVoices(voices: Voice[]): void {
  write(PIPER_VOICES_KEY, JSON.stringify({ savedAt: Date.now(), voices }));
}
