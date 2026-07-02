// Google Gemini Flash TTS (cloud). By default routes through our owner-funded
// proxy (/api/tts/gemini). When the user has pasted their own key (BYOK) the
// browser calls generativelanguage.googleapis.com directly and the key never
// touches our server. Returns base64 PCM which we wrap in a WAV container.
// Word timings come from Whisper alignment.

import { synthesizeViaRoute } from "./cloud";
import { getByokKey, byokErrorMessage } from "./byok";
import { base64ToArrayBuffer, decodeToMono, pcm16ToWavBuffer } from "./wav";
import { GEMINI_VOICES } from "./voices";
import type { TTSEngine, Voice } from "./types";

const GEMINI_MODEL = "gemini-2.5-flash-preview-tts";

interface GeminiPart {
  inlineData?: { data: string; mimeType?: string };
}

function rateFromMime(mime: string | undefined): number {
  const m = mime?.match(/rate=(\d+)/);
  return m ? Number(m[1]) : 24000;
}

export const geminiEngine: TTSEngine = {
  id: "gemini",
  label: "Gemini",
  type: "cloud",
  blurb: "Google's Gemini Flash TTS — natural, controllable narration with 30 prebuilt voices.",
  supportsWordTimestamps: false,
  supportsInstructions: true,
  requiresNetwork: true,

  async listVoices(): Promise<Voice[]> {
    return GEMINI_VOICES;
  },

  async synthesize(text, opts, onProgress) {
    const key = getByokKey("gemini");
    if (key) {
      onProgress?.({ phase: "synth", value: -1, label: "Contacting Gemini…" });
      const instructions = opts.instructions?.trim();
      const prompt = instructions ? `${instructions}\n\n${text}` : text;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": key,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice } },
              },
            },
          }),
          signal: opts.signal,
        }
      );
      if (!res.ok) throw new Error(byokErrorMessage("gemini", res.status));

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
      };
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (!part?.inlineData?.data) throw new Error("Gemini returned no audio.");

      const pcm = base64ToArrayBuffer(part.inlineData.data);
      const wav = pcm16ToWavBuffer(pcm, rateFromMime(part.inlineData.mimeType));
      return decodeToMono(wav);
    }

    return synthesizeViaRoute(
      "/api/tts/gemini",
      { text, voice: opts.voice, instructions: opts.instructions },
      onProgress,
      opts.signal
    );
  },
};
