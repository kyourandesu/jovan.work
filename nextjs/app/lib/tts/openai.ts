// OpenAI gpt-4o-mini-tts (cloud). By default routes through our owner-funded
// proxy (/api/tts/openai). When the user has pasted their own key (BYOK) the
// browser calls api.openai.com directly and the key never touches our server.
// Audio returns as WAV; word timings come from Whisper alignment.

import { synthesizeViaRoute } from "./cloud";
import { getByokKey, byokErrorMessage } from "./byok";
import { decodeToMono } from "./wav";
import { OPENAI_VOICES } from "./voices";
import type { TTSEngine, Voice } from "./types";

export const openaiEngine: TTSEngine = {
  id: "openai",
  label: "OpenAI",
  type: "cloud",
  blurb: "gpt-4o-mini-tts — expressive, steerable voices you can direct with a style prompt.",
  supportsWordTimestamps: false,
  supportsInstructions: true,
  requiresNetwork: true,

  async listVoices(): Promise<Voice[]> {
    return OPENAI_VOICES;
  },

  async synthesize(text, opts, onProgress) {
    const key = getByokKey("openai");
    if (key) {
      onProgress?.({ phase: "synth", value: -1, label: "Contacting OpenAI…" });
      const instructions = opts.instructions?.trim();
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          input: text,
          voice: opts.voice,
          response_format: "wav",
          ...(instructions ? { instructions } : {}),
        }),
        signal: opts.signal,
      });
      if (!res.ok) throw new Error(byokErrorMessage("openai", res.status));
      const buffer = await res.arrayBuffer();
      return decodeToMono(buffer);
    }

    return synthesizeViaRoute(
      "/api/tts/openai",
      { text, voice: opts.voice, instructions: opts.instructions },
      onProgress,
      opts.signal
    );
  },
};
