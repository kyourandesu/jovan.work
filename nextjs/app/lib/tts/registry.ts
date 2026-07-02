// Single source of truth for the four engines + light metadata for the UI cards.

import { kokoroEngine } from "./kokoro";
import { piperEngine } from "./piper";
import { openaiEngine } from "./openai";
import { geminiEngine } from "./gemini";
import type { EngineId, TTSEngine } from "./types";

export { ENGINE_META, ENGINE_ORDER, type EngineMeta } from "./engines-meta";

export const ENGINES: Record<EngineId, TTSEngine> = {
  kokoro: kokoroEngine,
  piper: piperEngine,
  openai: openaiEngine,
  gemini: geminiEngine,
};

export function getEngine(id: EngineId): TTSEngine {
  return ENGINES[id];
}

/** True when we must run Whisper alignment to get word timings. */
export function needsAlignment(engine: TTSEngine): boolean {
  return !engine.supportsWordTimestamps;
}
