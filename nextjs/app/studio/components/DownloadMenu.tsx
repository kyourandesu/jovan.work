"use client";

import { clsx } from "clsx";
import { Download, Loader2 } from "lucide-react";

export default function DownloadMenu({
  onWav,
  onMp3,
  exporting,
  disabled,
}: {
  onWav: () => void;
  onMp3: () => void;
  exporting: "wav" | "mp3" | null;
  disabled?: boolean;
}) {
  const btn =
    "inline-flex items-center gap-1.5 rounded-button border border-line bg-surface px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-line-hover hover:bg-surface-2 disabled:opacity-50";
  return (
    <div className="flex items-center gap-1.5">
      <span className="hidden items-center gap-1 text-xs text-fg-faint sm:flex">
        <Download className="h-3.5 w-3.5" /> Download
      </span>
      <button type="button" className={clsx(btn)} onClick={onWav} disabled={disabled || exporting !== null}>
        {exporting === "wav" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} WAV
      </button>
      <button type="button" className={clsx(btn)} onClick={onMp3} disabled={disabled || exporting !== null}>
        {exporting === "mp3" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} MP3
      </button>
    </div>
  );
}
