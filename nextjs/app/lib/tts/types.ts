// Core contracts shared by every TTS engine and the studio UI.
// Audio is always carried as mono Float32 PCM in [-1, 1] plus its sample rate.

export type EngineId = "kokoro" | "piper" | "openai" | "gemini";

export type EngineType = "on-device" | "cloud";

export interface Voice {
  /** Provider voice id (e.g. "af_heart", "en_US-hfc_female-medium", "coral", "Kore"). */
  id: string;
  /** Human label shown in the picker. */
  label: string;
  /** BCP-47-ish language tag when known (e.g. "en-US"). */
  lang?: string;
  /** Optional grouping hint (e.g. "American · Female"). */
  group?: string;
}

/** A single word and the span of playback time (seconds) it is spoken over. */
export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SynthResult {
  /** Mono PCM, float samples in [-1, 1]. */
  audio: Float32Array;
  sampleRate: number;
  /** Present when word-level highlighting is available for this render. */
  wordTimings?: WordTiming[];
}

export interface SynthOptions {
  voice: string;
  /** Speaking-style prompt — only honoured by engines with `supportsInstructions`. */
  instructions?: string;
  /** 0.5–2.0; on-device engines apply natively, cloud engines ignore. */
  speed?: number;
  signal?: AbortSignal;
}

export type ProgressPhase =
  | "download" // fetching model weights / voice
  | "synth" // running synthesis
  | "align" // whisper forced-alignment
  | "concat" // stitching chunks
  | "encode"; // wav/mp3 export

export interface ProgressEvent {
  phase: ProgressPhase;
  /** 0..1, or -1 for indeterminate. */
  value: number;
  label?: string;
}

export type OnProgress = (p: ProgressEvent) => void;

export interface TTSEngine {
  id: EngineId;
  label: string;
  type: EngineType;
  /** Short marketing blurb used on cards. */
  blurb: string;
  /** True only when the engine emits real per-word timings itself (Kokoro). */
  supportsWordTimestamps: boolean;
  /** True when a style/instructions prompt is honoured (OpenAI, Gemini). */
  supportsInstructions: boolean;
  /** True when synthesis needs network + server keys (OpenAI, Gemini). */
  requiresNetwork: boolean;
  listVoices(): Promise<Voice[]>;
  synthesize(
    text: string,
    opts: SynthOptions,
    onProgress?: OnProgress
  ): Promise<SynthResult>;
  /** Free heavy resources (workers, models) when the engine is deselected. */
  dispose?(): void;
}

/** A finished render ready for playback + export. */
export interface RenderOutput {
  audio: Float32Array;
  sampleRate: number;
  wordTimings: WordTiming[];
  /** How the timings were obtained — surfaced in the UI. "pending" = audio is
   *  ready but alignment is still running. */
  timingSource: "native" | "aligned" | "estimated" | "none" | "pending";
  engineId: EngineId;
  voice: string;
  text: string;
  durationSec: number;
}
