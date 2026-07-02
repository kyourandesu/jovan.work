"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { Play, Pause, RotateCcw, Loader2 } from "lucide-react";
import { encodeWav } from "@/app/lib/tts/wav";
import { tokenize } from "@/app/lib/tts/text";
import type { RenderOutput } from "@/app/lib/tts/types";
import { useKaraoke } from "../hooks/useKaraoke";

const SPEEDS = [0.75, 1, 1.25, 1.5];

const TIMING_BADGE: Record<RenderOutput["timingSource"], { label: string; tone: string; spinner?: boolean }> = {
  native: { label: "Word-perfect timing", tone: "text-accent" },
  aligned: { label: "Aligned timing", tone: "text-fg-muted" },
  estimated: { label: "Estimated timing", tone: "text-fg-muted" },
  none: { label: "Highlighting unavailable", tone: "text-fg-faint" },
  pending: { label: "Aligning words…", tone: "text-fg-faint", spinner: true },
};

function fmt(t: number): string {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Player({
  output,
  actions,
}: {
  output: RenderOutput;
  actions?: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLParagraphElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(output.durationSec || 0);
  const [rate, setRate] = useState(1);

  // Keyed on the audio buffer, not the whole output: when timings patch in
  // (same Float32Array reference), the src stays stable and playback survives.
  const url = useMemo(() => {
    const blob = encodeWav(output.audio, output.sampleRate);
    return URL.createObjectURL(blob);
  }, [output.audio, output.sampleRate]);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const tokens = useMemo(() => tokenize(output.text), [output.text]);
  const hasTimings = output.wordTimings.length > 0 && output.timingSource !== "none";
  useKaraoke(audioRef, transcriptRef, output.wordTimings, hasTimings);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = rate;
  }, [rate, url]);

  const badge = TIMING_BADGE[output.timingSource];

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  const restart = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    void a.play();
  };

  const seek = (v: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = v;
    setCurrent(v);
  };

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className={clsx("inline-flex items-center gap-1.5 text-eyebrow", badge.tone)}>
          {badge.spinner && <Loader2 className="h-3 w-3 animate-spin" />}
          {badge.label}
        </span>
        {actions}
      </div>

      {/* Transcript with karaoke highlighting */}
      <p
        ref={transcriptRef}
        className="max-h-72 overflow-y-auto whitespace-pre-wrap text-[17px] leading-[1.9] text-fg-muted"
      >
        {tokens.map((t, i) =>
          t.type === "word" ? (
            <span key={i} data-w className="word">
              {t.text}
            </span>
          ) : (
            <span key={i}>{t.text}</span>
          )
        )}
      </p>

      {/* Transport */}
      <div className="flex flex-col gap-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="tts-seek"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-[transform,filter] duration-150 ease-premium hover:-translate-y-px hover:brightness-110"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-px" />}
          </button>
          <button
            type="button"
            onClick={restart}
            aria-label="Restart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="font-mono text-xs tabular-nums text-fg-faint">
            {fmt(current)} / {fmt(duration)}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRate(s)}
                className={clsx(
                  "rounded-pill px-2 py-1 text-[11px] font-medium transition-colors",
                  rate === s ? "bg-accent-weak text-accent" : "text-fg-faint hover:text-fg"
                )}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d) && d > 0) setDuration(d);
        }}
        className="sr-only"
      />
    </div>
  );
}
