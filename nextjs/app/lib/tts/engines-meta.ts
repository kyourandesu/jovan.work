// Pure engine metadata (no engine implementations) — safe to import from server
// components. The actual engines live in registry.ts (client-only).

import type { EngineId } from "./types";

export interface EngineMeta {
  id: EngineId;
  name: string;
  short: string;
  tagline: string;
  badge: "On-device" | "Cloud";
  specs: string[];
  tags: string[];
}

export const ENGINE_ORDER: EngineId[] = ["kokoro", "piper", "openai", "gemini"];

export const ENGINE_META: Record<EngineId, EngineMeta> = {
  kokoro: {
    id: "kokoro",
    name: "Kokoro-82M",
    short: "Kokoro",
    tagline: "Runs fully in your browser. Real per-word timing for precise highlighting.",
    badge: "On-device",
    specs: ["82M params", "~86 MB (q8)", "24 kHz", "Apache-2.0"],
    tags: ["English", "Word-sync", "Private", "WebGPU"],
  },
  piper: {
    id: "piper",
    name: "Piper",
    short: "Piper",
    tagline: "Lightweight VITS voices — huge catalog, fast on CPU, cached after first use.",
    badge: "On-device",
    specs: ["900+ voices", "30+ languages", "22 kHz", "MIT"],
    tags: ["Multilingual", "Fast", "Private", "OPFS cache"],
  },
  openai: {
    id: "openai",
    name: "OpenAI · gpt-4o-mini-tts",
    short: "OpenAI",
    tagline: "Expressive, steerable narration you can direct with a plain-language style prompt.",
    badge: "Cloud",
    specs: ["11 voices", "Style prompt", "Studio quality"],
    tags: ["Expressive", "Instructions", "Cloud"],
  },
  gemini: {
    id: "gemini",
    name: "Gemini Flash TTS",
    short: "Gemini",
    tagline: "Google's natural, controllable speech with 30 prebuilt voices.",
    badge: "Cloud",
    specs: ["30 voices", "Style prompt", "24 kHz"],
    tags: ["Natural", "Instructions", "Cloud"],
  },
};
