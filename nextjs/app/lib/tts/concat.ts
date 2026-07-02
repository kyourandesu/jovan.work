// Stitch per-chunk renders into one continuous track, keeping word timings global.

import { resample } from "./resample";
import type { WordTiming } from "./types";

export interface AudioChunk {
  audio: Float32Array;
  sampleRate: number;
  wordTimings?: WordTiming[];
}

export interface ConcatResult {
  audio: Float32Array;
  sampleRate: number;
  wordTimings: WordTiming[];
  durationSec: number;
}

/**
 * Concatenate chunks at a single unified sample rate. Each chunk's word timings
 * are shifted by the cumulative duration of everything before it so the merged
 * timeline stays correct for karaoke playback.
 */
export async function concatChunks(
  chunks: AudioChunk[],
  targetRate: number
): Promise<ConcatResult> {
  const resampled: Float32Array[] = [];
  for (const c of chunks) {
    resampled.push(c.sampleRate === targetRate ? c.audio : await resample(c.audio, c.sampleRate, targetRate));
  }

  const totalLen = resampled.reduce((n, a) => n + a.length, 0);
  const merged = new Float32Array(totalLen);
  const wordTimings: WordTiming[] = [];

  let sampleOffset = 0;
  for (let i = 0; i < resampled.length; i++) {
    const a = resampled[i];
    merged.set(a, sampleOffset);
    const startSec = sampleOffset / targetRate;
    const wt = chunks[i].wordTimings;
    if (wt) {
      for (const w of wt) {
        wordTimings.push({ word: w.word, start: w.start + startSec, end: w.end + startSec });
      }
    }
    sampleOffset += a.length;
  }

  return {
    audio: merged,
    sampleRate: targetRate,
    wordTimings,
    durationSec: totalLen / targetRate,
  };
}
