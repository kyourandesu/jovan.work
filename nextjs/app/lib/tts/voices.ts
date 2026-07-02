// Curated voice catalogs for the fixed-roster engines. (Piper enumerates its
// 900+ voices at runtime from the package, so it isn't listed here.)

import type { Voice } from "./types";

// Kokoro-82M v1.0 English voices (American + British).
export const KOKORO_VOICES: Voice[] = [
  { id: "af_heart", label: "Heart", lang: "en-US", group: "American · Female" },
  { id: "af_bella", label: "Bella", lang: "en-US", group: "American · Female" },
  { id: "af_nicole", label: "Nicole", lang: "en-US", group: "American · Female" },
  { id: "af_aoede", label: "Aoede", lang: "en-US", group: "American · Female" },
  { id: "af_kore", label: "Kore", lang: "en-US", group: "American · Female" },
  { id: "af_sarah", label: "Sarah", lang: "en-US", group: "American · Female" },
  { id: "af_nova", label: "Nova", lang: "en-US", group: "American · Female" },
  { id: "af_sky", label: "Sky", lang: "en-US", group: "American · Female" },
  { id: "am_michael", label: "Michael", lang: "en-US", group: "American · Male" },
  { id: "am_fenrir", label: "Fenrir", lang: "en-US", group: "American · Male" },
  { id: "am_puck", label: "Puck", lang: "en-US", group: "American · Male" },
  { id: "am_echo", label: "Echo", lang: "en-US", group: "American · Male" },
  { id: "am_eric", label: "Eric", lang: "en-US", group: "American · Male" },
  { id: "am_liam", label: "Liam", lang: "en-US", group: "American · Male" },
  { id: "am_adam", label: "Adam", lang: "en-US", group: "American · Male" },
  { id: "bf_emma", label: "Emma", lang: "en-GB", group: "British · Female" },
  { id: "bf_isabella", label: "Isabella", lang: "en-GB", group: "British · Female" },
  { id: "bf_alice", label: "Alice", lang: "en-GB", group: "British · Female" },
  { id: "bf_lily", label: "Lily", lang: "en-GB", group: "British · Female" },
  { id: "bm_george", label: "George", lang: "en-GB", group: "British · Male" },
  { id: "bm_fable", label: "Fable", lang: "en-GB", group: "British · Male" },
  { id: "bm_lewis", label: "Lewis", lang: "en-GB", group: "British · Male" },
  { id: "bm_daniel", label: "Daniel", lang: "en-GB", group: "British · Male" },
];

// OpenAI gpt-4o-mini-tts voices.
export const OPENAI_VOICES: Voice[] = [
  { id: "coral", label: "Coral", group: "Warm" },
  { id: "alloy", label: "Alloy", group: "Neutral" },
  { id: "ash", label: "Ash", group: "Expressive" },
  { id: "ballad", label: "Ballad", group: "Expressive" },
  { id: "echo", label: "Echo", group: "Neutral" },
  { id: "fable", label: "Fable", group: "Narrative" },
  { id: "nova", label: "Nova", group: "Bright" },
  { id: "onyx", label: "Onyx", group: "Deep" },
  { id: "sage", label: "Sage", group: "Calm" },
  { id: "shimmer", label: "Shimmer", group: "Bright" },
  { id: "verse", label: "Verse", group: "Expressive" },
];

// Gemini prebuilt TTS voices (subset of the 30 available).
export const GEMINI_VOICES: Voice[] = [
  { id: "Kore", label: "Kore", group: "Firm" },
  { id: "Puck", label: "Puck", group: "Upbeat" },
  { id: "Zephyr", label: "Zephyr", group: "Bright" },
  { id: "Charon", label: "Charon", group: "Informative" },
  { id: "Fenrir", label: "Fenrir", group: "Excitable" },
  { id: "Leda", label: "Leda", group: "Youthful" },
  { id: "Aoede", label: "Aoede", group: "Breezy" },
  { id: "Orus", label: "Orus", group: "Firm" },
  { id: "Callirrhoe", label: "Callirrhoe", group: "Easy-going" },
  { id: "Enceladus", label: "Enceladus", group: "Breathy" },
  { id: "Iapetus", label: "Iapetus", group: "Clear" },
  { id: "Umbriel", label: "Umbriel", group: "Easy-going" },
];

/** Server-side allow-list guards (mirror the catalogs above). */
export const OPENAI_VOICE_IDS = OPENAI_VOICES.map((v) => v.id);
export const GEMINI_VOICE_IDS = GEMINI_VOICES.map((v) => v.id);
