// Piper on-device engine — 900+ voices across 30+ languages. No native timings
// (highlighting comes from Whisper alignment). Talks to piper.worker.ts.

import { decodeToMono } from "./wav";
import { loadPiperVoices, savePiperVoices } from "@/app/studio/lib/prefs";
import type { OnProgress, SynthOptions, SynthResult, TTSEngine, Voice } from "./types";

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./workers/piper.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

let voicesCache: Voice[] | null = null;

// A dependable default that ships with a small, good-quality US English model.
const DEFAULT_PIPER_VOICE = "en_US-hfc_female-medium";

function once<T>(
  request: unknown,
  match: (m: MessageEvent) => T | undefined,
  onProgress?: OnProgress
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const w = getWorker();
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "progress") {
        onProgress?.({ phase: e.data.phase ?? "download", value: e.data.value ?? -1, label: e.data.label });
        return;
      }
      if (e.data?.type === "error") {
        w.removeEventListener("message", handler);
        reject(new Error(e.data.error));
        return;
      }
      const result = match(e);
      if (result !== undefined) {
        w.removeEventListener("message", handler);
        resolve(result);
      }
    };
    w.addEventListener("message", handler);
    w.postMessage(request);
  });
}

export const piperEngine: TTSEngine = {
  id: "piper",
  label: "Piper",
  type: "on-device",
  blurb: "Fast VITS voices — 900+ speakers across 30+ languages, cached locally after first use.",
  supportsWordTimestamps: false,
  supportsInstructions: false,
  requiresNetwork: false,

  async listVoices(): Promise<Voice[]> {
    if (voicesCache) return voicesCache;
    // A fresh localStorage catalog skips the worker + CDN enumeration entirely.
    const cached = loadPiperVoices();
    if (cached && cached.length > 0) {
      voicesCache = cached;
      return cached;
    }
    try {
      const voices = await once<Voice[]>({ type: "voices" }, (e) =>
        e.data?.type === "voices" ? (e.data.voices as Voice[]) : undefined
      );
      // Surface a sensible default first, then the rest.
      voices.sort((a, b) => (a.id === DEFAULT_PIPER_VOICE ? -1 : b.id === DEFAULT_PIPER_VOICE ? 1 : 0));
      voicesCache = voices;
      savePiperVoices(voices);
      return voices;
    } catch {
      voicesCache = [{ id: DEFAULT_PIPER_VOICE, label: "US English · Female", lang: "en_US" }];
      return voicesCache;
    }
  },

  async synthesize(text, opts: SynthOptions, onProgress): Promise<SynthResult> {
    onProgress?.({ phase: "synth", value: -1, label: "Synthesizing (Piper)…" });
    const buffer = await once<ArrayBuffer>(
      { type: "synth", text, voiceId: opts.voice || DEFAULT_PIPER_VOICE },
      (e) => (e.data?.type === "result" ? (e.data.buffer as ArrayBuffer) : undefined),
      onProgress
    );
    const { audio, sampleRate } = await decodeToMono(buffer);
    return { audio, sampleRate };
  },

  dispose() {
    worker?.terminate();
    worker = null;
  },
};
