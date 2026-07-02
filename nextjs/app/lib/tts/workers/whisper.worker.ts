// Whisper word-timestamp worker (transformers.js). Given 16 kHz mono float audio,
// returns recognized words with [start, end] seconds. Lazy-loads the model once.

import { pipeline, env } from "@huggingface/transformers";

// Never look for local model files; always fetch from the HF CDN (cached by the browser).
env.allowLocalModels = false;

const MODEL_ID = "onnx-community/whisper-base_timestamped";

type ASR = (audio: Float32Array, opts: Record<string, unknown>) => Promise<unknown>;

let asrPromise: Promise<ASR> | null = null;

type Device = "webgpu" | "wasm";

async function getASR(device: Device, post: (m: unknown) => void): Promise<ASR> {
  if (!asrPromise) {
    asrPromise = pipeline("automatic-speech-recognition", MODEL_ID, {
      device,
      dtype: device === "webgpu" ? "fp32" : "q8",
      progress_callback: (p: { status?: string; progress?: number; file?: string }) => {
        if (p.status === "progress" && typeof p.progress === "number") {
          post({ type: "progress", value: p.progress / 100, label: `Loading aligner · ${p.file ?? ""}` });
        }
      },
    }) as unknown as Promise<ASR>;
  }
  return asrPromise;
}

interface AlignRequest {
  type: "align";
  audio: Float32Array; // 16 kHz mono
  language?: string;
}

self.onmessage = async (e: MessageEvent<AlignRequest>) => {
  const post = (m: unknown) => (self as unknown as Worker).postMessage(m);
  if (e.data?.type !== "align") return;

  const hasWebGPU = typeof (navigator as unknown as { gpu?: unknown }).gpu !== "undefined";
  const device: Device = hasWebGPU ? "webgpu" : "wasm";

  try {
    const asr = await getASR(device, post);
    post({ type: "progress", value: -1, label: "Aligning words…" });
    const asrOpts: Record<string, unknown> = {
      return_timestamps: "word",
      chunk_length_s: 30,
      stride_length_s: 5,
      task: "transcribe",
    };
    // Only pin a language when the caller provides one; otherwise auto-detect.
    if (e.data.language) asrOpts.language = e.data.language;
    const out = (await asr(e.data.audio, asrOpts)) as {
      chunks?: Array<{ text: string; timestamp: [number, number | null] }>;
    };

    const words = (out.chunks ?? []).map((c) => ({
      word: c.text.trim(),
      start: c.timestamp[0] ?? 0,
      end: c.timestamp[1] ?? c.timestamp[0] ?? 0,
    }));
    post({ type: "result", words });
  } catch (err) {
    post({ type: "error", error: String(err) });
  }
};
