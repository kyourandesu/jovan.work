"use client";

import { clsx } from "clsx";
import type { ProgressEvent } from "@/app/lib/tts/types";

const PHASE_LABEL: Record<string, string> = {
  download: "Loading model",
  synth: "Synthesizing",
  align: "Aligning words",
  concat: "Stitching audio",
  encode: "Encoding",
};

export default function ProgressReadout({
  progress,
  className,
}: {
  progress: ProgressEvent | null;
  className?: string;
}) {
  const pct = progress && progress.value >= 0 ? Math.round(progress.value * 100) : null;
  const label = progress?.label ?? (progress ? PHASE_LABEL[progress.phase] : "");

  return (
    <div className={clsx("flex flex-col gap-2", className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span className="font-mono uppercase tracking-[0.14em]">{label}</span>
        {pct !== null && <span className="tabular-nums text-fg-faint">{pct}%</span>}
      </div>
      <div className="h-1 overflow-hidden rounded-pill bg-line">
        <div
          className={clsx(
            "h-full rounded-pill bg-accent transition-[width] duration-300 ease-premium",
            pct === null && "animate-pulse w-1/3"
          )}
          style={pct !== null ? { width: `${pct}%` } : undefined}
        />
      </div>
    </div>
  );
}
