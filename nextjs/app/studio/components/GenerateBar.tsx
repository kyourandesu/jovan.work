"use client";

import { clsx } from "clsx";
import { Sparkles, Loader2, X } from "lucide-react";
import type { ProgressEvent } from "@/app/lib/tts/types";
import ProgressReadout from "./ProgressReadout";

export default function GenerateBar({
  onGenerate,
  onCancel,
  busy,
  disabled,
  progress,
}: {
  onGenerate: () => void;
  onCancel: () => void;
  busy: boolean;
  disabled: boolean;
  progress: ProgressEvent | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || busy}
          className={clsx(
            "group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-button bg-accent px-5 text-[15px] font-medium text-white",
            "transition-[transform,filter] duration-150 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Generating…" : "Generate audio"}
        </button>
        {busy && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-button border border-line bg-surface px-4 text-sm font-medium text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        )}
      </div>
      {busy && progress && <ProgressReadout progress={progress} />}
    </div>
  );
}
