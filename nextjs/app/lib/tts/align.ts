// Forced-alignment facade: turns raw audio + known text into per-word timings by
// (1) running Whisper word-timestamps in a worker, then
// (2) aligning Whisper's recognized words onto the user's exact input words.
// The displayed text is ALWAYS the user's input — Whisper only donates timings.

import { toWhisperRate } from "./resample";
import { normalizeWord, wordList, type Word } from "./text";
import type { OnProgress, WordTiming } from "./types";

interface RecognizedWord {
  word: string;
  start: number;
  end: number;
}

// Above this alignment-matrix size, skip DP and distribute time by word length.
const MAX_DP_CELLS = 4_000_000;

function proportionalByChar(input: Word[], totalDur: number): WordTiming[] {
  const totalChars = input.reduce((n, w) => n + Math.max(1, w.text.length), 0);
  const out: WordTiming[] = [];
  let acc = 0;
  for (const w of input) {
    const dur = (totalDur * Math.max(1, w.text.length)) / totalChars;
    out.push({ word: w.text, start: acc, end: acc + dur });
    acc += dur;
  }
  return out;
}

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./workers/whisper.worker.ts", import.meta.url), {
      type: "module",
    });
  }
  return worker;
}

export function disposeAligner() {
  worker?.terminate();
  worker = null;
}

function runWhisper(
  audio16k: Float32Array,
  language: string | undefined,
  onProgress?: OnProgress
): Promise<RecognizedWord[]> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    const onMessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "progress") {
        onProgress?.({ phase: "align", value: msg.value, label: msg.label });
      } else if (msg.type === "result") {
        cleanup();
        resolve(msg.words as RecognizedWord[]);
      } else if (msg.type === "error") {
        cleanup();
        reject(new Error(msg.error));
      }
    };
    const cleanup = () => w.removeEventListener("message", onMessage);
    w.addEventListener("message", onMessage);
    w.postMessage({ type: "align", audio: audio16k, language });
  });
}

/**
 * Needleman–Wunsch alignment of the recognized word sequence onto the input word
 * sequence (both normalized). Returns, for each input word index, the matched
 * recognized index or -1.
 */
function alignSequences(input: Word[], recognized: RecognizedWord[]): number[] {
  const n = input.length;
  const m = recognized.length;
  const GAP = -1;
  const MATCH = 2;
  const MISMATCH = -1;

  const recNorm = recognized.map((r) => normalizeWord(r.word));
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i * GAP;
  for (let j = 0; j <= m; j++) dp[0][j] = j * GAP;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const a = input[i - 1].norm;
      const b = recNorm[j - 1];
      const score = a && a === b ? MATCH : MISMATCH;
      dp[i][j] = Math.max(
        dp[i - 1][j - 1] + score,
        dp[i - 1][j] + GAP,
        dp[i][j - 1] + GAP
      );
    }
  }

  const map = new Array<number>(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const a = input[i - 1].norm;
    const b = recNorm[j - 1];
    const score = a && a === b ? MATCH : MISMATCH;
    if (dp[i][j] === dp[i - 1][j - 1] + score) {
      if (score === MATCH) map[i - 1] = j - 1;
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + GAP) {
      i--;
    } else {
      j--;
    }
  }
  return map;
}

/** Fill in timings for every input word, interpolating unmatched runs by char weight. */
function buildTimings(
  input: Word[],
  recognized: RecognizedWord[],
  map: number[],
  totalDur: number
): WordTiming[] {
  const timings: (WordTiming | null)[] = input.map((w, idx) => {
    const r = map[idx];
    if (r >= 0) return { word: w.text, start: recognized[r].start, end: recognized[r].end };
    return null;
  });

  // Interpolate gaps between known anchors (weighted by word length).
  let k = 0;
  while (k < timings.length) {
    if (timings[k]) {
      k++;
      continue;
    }
    const gapStart = k;
    while (k < timings.length && !timings[k]) k++;
    const gapEnd = k - 1;
    const prev = gapStart > 0 ? timings[gapStart - 1] : null;
    const next = gapEnd < timings.length - 1 ? timings[gapEnd + 1] : null;
    const from = prev ? prev.end : 0;
    const to = next ? next.start : totalDur;
    const span = Math.max(0, to - from);
    const weights = [];
    let wsum = 0;
    for (let g = gapStart; g <= gapEnd; g++) {
      const wlen = Math.max(1, input[g].text.length);
      weights.push(wlen);
      wsum += wlen;
    }
    let acc = from;
    for (let g = gapStart, wi = 0; g <= gapEnd; g++, wi++) {
      const dur = wsum > 0 ? (span * weights[wi]) / wsum : 0;
      timings[g] = { word: input[g].text, start: acc, end: acc + dur };
      acc += dur;
    }
  }

  return timings.map((t, idx) => t ?? { word: input[idx].text, start: 0, end: 0 });
}

/** Fraction of input words that got a direct Whisper match — a rough confidence. */
function matchRatio(map: number[]): number {
  if (map.length === 0) return 0;
  return map.filter((r) => r >= 0).length / map.length;
}

export interface AlignResult {
  wordTimings: WordTiming[];
  confidence: number;
}

/**
 * Align `text` against `audio`. Returns null when confidence is too low
 * (caller then falls back to a plain, non-karaoke player).
 */
export async function alignWords(
  audio: Float32Array,
  sampleRate: number,
  text: string,
  totalDur: number,
  language: string | undefined,
  onProgress?: OnProgress
): Promise<AlignResult | null> {
  const input = wordList(text);
  if (input.length === 0) return { wordTimings: [], confidence: 1 };

  const audio16k = await toWhisperRate(audio, sampleRate);
  const recognized = await runWhisper(audio16k, language, onProgress);
  if (recognized.length === 0) return null;

  if (input.length * recognized.length > MAX_DP_CELLS) {
    return { wordTimings: proportionalByChar(input, totalDur), confidence: 0.5 };
  }

  const map = alignSequences(input, recognized);
  const confidence = matchRatio(map);
  if (confidence < 0.35) return null; // too unreliable to highlight

  const wordTimings = buildTimings(input, recognized, map, totalDur);
  return { wordTimings, confidence };
}

/**
 * Re-index an existing timing list (e.g. Kokoro's native words, which use their
 * own segmentation) onto the tokenizer's word list so it lines up 1:1 with the
 * rendered transcript spans. No model needed.
 */
export function remapTimingsToText(
  text: string,
  recognized: RecognizedWord[],
  totalDur: number
): WordTiming[] {
  const input = wordList(text);
  if (input.length === 0) return [];
  if (recognized.length === 0 || input.length * recognized.length > MAX_DP_CELLS) {
    return proportionalByChar(input, totalDur);
  }
  const map = alignSequences(input, recognized);
  return buildTimings(input, recognized, map, totalDur);
}
