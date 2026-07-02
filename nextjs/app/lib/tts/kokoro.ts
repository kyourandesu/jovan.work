// Kokoro-82M on-device engine.
// Primary path: HeadTTS (Kokoro with NATIVE per-word timings: words/wtimes/wdurations).
// Fallback: kokoro-js for audio only (timings then come from Whisper alignment).
// Libraries are dynamically imported so nothing touches `self`/`window` on the server.

import { CDN, importFromUrl } from "./cdn";
import { decodeToMono } from "./wav";
import { KOKORO_VOICES } from "./voices";
import type {
  OnProgress,
  SynthOptions,
  SynthResult,
  TTSEngine,
  Voice,
  WordTiming,
} from "./types";

type Device = "webgpu" | "wasm";

function pickDevice(): Device {
  return typeof (navigator as unknown as { gpu?: unknown }).gpu !== "undefined"
    ? "webgpu"
    : "wasm";
}

/* ── HeadTTS (native timings) ─────────────────────────────────────── */

interface HeadProgress {
  loaded?: number;
  total?: number;
  lengthComputable?: boolean;
}
interface HeadTTSLike {
  connect(
    settings?: unknown,
    onprogress?: (ev: HeadProgress) => void,
    onerror?: (e: unknown) => void
  ): Promise<void>;
  setup(cfg: Record<string, unknown>): void;
  synthesize(
    req: { input: string },
    onmessage?: (msg: { type?: string; data?: HeadProgress }) => void
  ): Promise<unknown>;
}

let headtts: HeadTTSLike | null = null;
let headttsReady: Promise<HeadTTSLike | null> | null = null;

function reportDownload(onProgress: OnProgress | undefined, p: HeadProgress, label: string) {
  const value = p.total && p.total > 0 ? Math.min(1, (p.loaded ?? 0) / p.total) : -1;
  onProgress?.({ phase: "download", value, label });
}

async function initHeadTTS(onProgress?: OnProgress): Promise<HeadTTSLike | null> {
  if (headtts) return headtts;
  if (!headttsReady) {
    headttsReady = (async () => {
      try {
        const mod = await importFromUrl<{
          HeadTTS: new (o: Record<string, unknown>) => HeadTTSLike;
        }>(CDN.headtts);
        const instance = new mod.HeadTTS({
          endpoints: [pickDevice(), "wasm"],
          languages: ["en-us"],
          voices: [], // load the chosen voice on demand, don't preload all 23
          // Force the same-origin blob-worker path so a cross-origin CDN load works.
          workerModule: CDN.headttsWorker,
          // Absolute dictionary URL — the default "../dictionaries" is relative and
          // fails to resolve inside the blob worker (breaks synthesis silently).
          dictionaryURL: CDN.headttsDictionaries,
        });
        // connect() downloads the Kokoro model — surface its progress.
        await instance.connect(null, (p) => reportDownload(onProgress, p, "Downloading Kokoro model…"));
        headtts = instance;
        return instance;
      } catch (err) {
        console.warn("[kokoro] HeadTTS unavailable, will use kokoro-js fallback:", err);
        return null;
      }
    })();
  }
  return headttsReady;
}

// Pull audio + native word timings out of HeadTTS's (loosely-typed) message set.
// `data.audio` arrives as a decoded Web Audio AudioBuffer (HeadTTS is built for
// avatar playback); older/PCM paths may hand back a raw ArrayBuffer instead.
interface HeadAudioMsg {
  audio: AudioBuffer | ArrayBuffer;
  words?: string[];
  wtimes?: number[]; // ms
  wdurations?: number[]; // ms
}

function extractHeadMessages(result: unknown): HeadAudioMsg[] {
  const list = Array.isArray(result) ? result : [result];
  const out: HeadAudioMsg[] = [];
  for (const raw of list) {
    const m = raw as Record<string, unknown>;
    if (!m) continue;
    const data = (m.data ?? m) as Record<string, unknown>;
    const candidate = data.audio ?? data.buffer ?? m.audio ?? m.buffer ?? (raw instanceof ArrayBuffer ? raw : undefined);
    const isAudioBuffer = typeof AudioBuffer !== "undefined" && candidate instanceof AudioBuffer;
    if (!isAudioBuffer && !(candidate instanceof ArrayBuffer)) continue;
    out.push({
      audio: candidate as AudioBuffer | ArrayBuffer,
      words: data.words as string[] | undefined,
      wtimes: data.wtimes as number[] | undefined,
      wdurations: data.wdurations as number[] | undefined,
    });
  }
  return out;
}

async function synthWithHeadTTS(
  instance: HeadTTSLike,
  text: string,
  opts: SynthOptions,
  onProgress?: OnProgress
): Promise<SynthResult> {
  instance.setup({
    voice: opts.voice,
    language: "en-us",
    speed: opts.speed ?? 1,
    audioEncoding: "wav",
  });
  onProgress?.({ phase: "synth", value: -1, label: "Synthesizing…" });
  // Keep synthesize in promise mode (no onmessage) so it resolves with the full
  // audio-message array; the big model download progress comes from connect().
  const result = await instance.synthesize({ input: text });
  const msgs = extractHeadMessages(result);
  if (msgs.length === 0) throw new Error("HeadTTS returned no audio");

  const buffers: Float32Array[] = [];
  const wordTimings: WordTiming[] = [];
  let sampleRate = 24000;
  let offsetSec = 0;

  for (const msg of msgs) {
    let mono: Float32Array;
    if (typeof AudioBuffer !== "undefined" && msg.audio instanceof AudioBuffer) {
      sampleRate = msg.audio.sampleRate;
      mono = msg.audio.getChannelData(0); // Kokoro output is mono
    } else {
      const decoded = await decodeToMono(msg.audio as ArrayBuffer);
      sampleRate = decoded.sampleRate;
      mono = decoded.audio;
    }
    buffers.push(mono);
    if (msg.words && msg.wtimes) {
      for (let i = 0; i < msg.words.length; i++) {
        const start = (msg.wtimes[i] ?? 0) / 1000 + offsetSec;
        const dur = (msg.wdurations?.[i] ?? 0) / 1000;
        wordTimings.push({ word: msg.words[i], start, end: start + dur });
      }
    }
    offsetSec += mono.length / sampleRate;
  }

  const total = buffers.reduce((n, b) => n + b.length, 0);
  const audio = new Float32Array(total);
  let o = 0;
  for (const b of buffers) {
    audio.set(b, o);
    o += b.length;
  }
  return { audio, sampleRate, wordTimings: wordTimings.length ? wordTimings : undefined };
}

/* ── kokoro-js fallback (audio only) ──────────────────────────────── */

interface KokoroJsLike {
  generate(text: string, opts: { voice: string; speed?: number }): Promise<{
    audio: Float32Array;
    sampling_rate: number;
  }>;
}

let kokoroJs: KokoroJsLike | null = null;
let kokoroJsReady: Promise<KokoroJsLike> | null = null;

async function initKokoroJs(onProgress?: OnProgress): Promise<KokoroJsLike> {
  if (kokoroJs) return kokoroJs;
  if (!kokoroJsReady) {
    kokoroJsReady = (async () => {
      const mod = await importFromUrl<{
        KokoroTTS: {
          from_pretrained: (id: string, o: Record<string, unknown>) => Promise<KokoroJsLike>;
        };
      }>(CDN.kokoro);
      const device = pickDevice();
      onProgress?.({ phase: "download", value: -1, label: "Loading Kokoro model…" });
      const tts = await mod.KokoroTTS.from_pretrained(
        "onnx-community/Kokoro-82M-v1.0-ONNX",
        {
          dtype: device === "webgpu" ? "fp32" : "q8",
          device,
          progress_callback: (p: { status?: string; progress?: number }) => {
            if (p.status === "progress" && typeof p.progress === "number") {
              onProgress?.({ phase: "download", value: p.progress / 100, label: "Loading Kokoro model…" });
            }
          },
        }
      );
      kokoroJs = tts;
      return tts;
    })();
  }
  return kokoroJsReady;
}

async function synthWithKokoroJs(
  text: string,
  opts: SynthOptions,
  onProgress?: OnProgress
): Promise<SynthResult> {
  const tts = await initKokoroJs(onProgress);
  onProgress?.({ phase: "synth", value: -1 });
  const out = await tts.generate(text, { voice: opts.voice, speed: opts.speed ?? 1 });
  return { audio: out.audio, sampleRate: out.sampling_rate };
}

/* ── Engine ───────────────────────────────────────────────────────── */

export const kokoroEngine: TTSEngine = {
  id: "kokoro",
  label: "Kokoro",
  type: "on-device",
  blurb: "82M-param neural voice that runs entirely in your browser, with true per-word timing.",
  supportsWordTimestamps: true,
  supportsInstructions: false,
  requiresNetwork: false,

  async listVoices(): Promise<Voice[]> {
    return KOKORO_VOICES;
  },

  async synthesize(text, opts, onProgress): Promise<SynthResult> {
    onProgress?.({ phase: "download", value: -1, label: "Preparing Kokoro…" });
    const instance = await initHeadTTS(onProgress);
    if (instance) {
      try {
        return await synthWithHeadTTS(instance, text, opts, onProgress);
      } catch (err) {
        console.warn("[kokoro] HeadTTS synth failed, falling back to kokoro-js:", err);
      }
    }
    return synthWithKokoroJs(text, opts, onProgress);
  },
};
