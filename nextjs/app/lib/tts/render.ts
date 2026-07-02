// The generation pipeline: chunk -> synth each chunk -> concat -> (align) ->
// RenderOutput. Used for both quick previews and full long-form renders.

import { alignWords, remapTimingsToText } from "./align";
import { CHUNK_BUDGETS, chunkText } from "./chunk";
import { concatChunks, type AudioChunk } from "./concat";
import { getEngine } from "./registry";
import type { EngineId, OnProgress, RenderOutput, SynthOptions } from "./types";

export interface RenderParams {
  engineId: EngineId;
  text: string;
  voice: string;
  instructions?: string;
  speed?: number;
  /** Attempt word-highlighting (default true). Previews pass false. */
  align?: boolean;
  /** Language hint for Whisper (undefined = auto-detect). */
  language?: string;
  signal?: AbortSignal;
  /** Fired once audio is stitched, before alignment. Lets the UI start playback
   *  immediately (timingSource "pending") while word timings are computed. */
  onAudioReady?: (output: RenderOutput) => void;
}

// Cloud engines are plain fetches, so a few can be in flight at once.
const CLOUD_CONCURRENCY = 3;

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Generation cancelled", "AbortError");
}

export async function render(
  params: RenderParams,
  onProgress?: OnProgress
): Promise<RenderOutput> {
  const engine = getEngine(params.engineId);
  const budget = CHUNK_BUDGETS[params.engineId] ?? { maxChars: 800 };
  const chunks = chunkText(params.text, budget);
  if (chunks.length === 0) throw new Error("Nothing to synthesize.");

  const opts: SynthOptions = {
    voice: params.voice,
    instructions: params.instructions,
    speed: params.speed,
    signal: params.signal,
  };

  const audioChunks: AudioChunk[] = new Array(chunks.length);
  let allNative = true;
  let done = 0;

  const reportSynth = () => {
    onProgress?.({
      phase: "synth",
      value: done / chunks.length,
      label: `Voicing part ${Math.min(done + 1, chunks.length)} of ${chunks.length}`,
    });
  };

  const synthOne = async (i: number) => {
    const result = await engine.synthesize(chunks[i], opts, (p) => {
      // Only download events carry meaningful sub-progress; pass those through.
      if (p.phase === "download") onProgress?.(p);
    });
    if (!result.wordTimings || result.wordTimings.length === 0) allNative = false;
    audioChunks[i] = {
      audio: result.audio,
      sampleRate: result.sampleRate,
      wordTimings: result.wordTimings,
    };
    done++;
    reportSynth();
  };

  reportSynth();
  if (engine.type === "cloud" && chunks.length > 1) {
    // Bounded concurrency pool; preserves output order via indexed writes. A
    // local controller stops peers scheduling once one chunk fails or aborts.
    const stop = new AbortController();
    const onOuterAbort = () => stop.abort();
    params.signal?.addEventListener("abort", onOuterAbort);
    let next = 0;
    const worker = async () => {
      for (;;) {
        throwIfAborted(params.signal);
        // A peer failed: stop scheduling; the failing promise carries the reason.
        if (stop.signal.aborted) return;
        const i = next++;
        if (i >= chunks.length) return;
        await synthOne(i);
      }
    };
    const pool = Array.from({ length: Math.min(CLOUD_CONCURRENCY, chunks.length) }, worker);
    try {
      // Promise.all rejects on the first failure; stop.abort() then makes peers
      // exit at their next loop check instead of scheduling more chunks.
      await Promise.all(pool.map((p) => p.catch((err) => { stop.abort(); throw err; })));
    } finally {
      params.signal?.removeEventListener("abort", onOuterAbort);
    }
  } else {
    for (let i = 0; i < chunks.length; i++) {
      throwIfAborted(params.signal);
      await synthOne(i);
    }
  }

  throwIfAborted(params.signal);
  onProgress?.({ phase: "concat", value: -1, label: "Stitching audio…" });
  const targetRate = audioChunks[0]?.sampleRate ?? 24000;
  const merged = await concatChunks(audioChunks, targetRate);

  let wordTimings = merged.wordTimings;
  let timingSource: RenderOutput["timingSource"] =
    allNative && wordTimings.length > 0 ? "native" : "none";

  // Native timings use the engine's own word segmentation; re-index them onto the
  // transcript's tokenization so highlighting lines up with the rendered spans.
  if (timingSource === "native") {
    wordTimings = remapTimingsToText(params.text, wordTimings, merged.durationSec);
  }

  const base = {
    audio: merged.audio,
    sampleRate: merged.sampleRate,
    engineId: params.engineId,
    voice: params.voice,
    text: params.text,
    durationSec: merged.durationSec,
  };

  const wantHighlight = params.align !== false;
  const needsAlign = wantHighlight && timingSource !== "native";

  // Audio is ready. If timings are already final, hand back the finished output;
  // otherwise hand back a "pending" output so the UI can start playback now, then
  // resolve with the aligned result below.
  params.onAudioReady?.({
    ...base,
    wordTimings: needsAlign ? [] : wordTimings,
    timingSource: needsAlign ? "pending" : timingSource,
  });

  if (needsAlign) {
    try {
      const res = await alignWords(
        merged.audio,
        merged.sampleRate,
        params.text,
        merged.durationSec,
        params.language,
        onProgress
      );
      if (res && res.wordTimings.length > 0) {
        wordTimings = res.wordTimings;
        timingSource = "aligned";
      } else {
        wordTimings = [];
        timingSource = "none";
      }
    } catch (err) {
      console.warn("[render] alignment failed:", err);
      wordTimings = [];
      timingSource = "none";
    }
  }

  return { ...base, wordTimings, timingSource };
}
