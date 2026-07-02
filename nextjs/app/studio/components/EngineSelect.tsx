"use client";

import { clsx } from "clsx";
import { Cpu, Cloud } from "lucide-react";
import { ENGINE_META, ENGINE_ORDER, getEngine } from "@/app/lib/tts/registry";
import type { EngineId } from "@/app/lib/tts/types";

export default function EngineSelect({
  value,
  onChange,
  disabled,
}: {
  value: EngineId;
  onChange: (id: EngineId) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="TTS engine" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ENGINE_ORDER.map((id) => {
        const meta = ENGINE_META[id];
        const active = id === value;
        const OnDevice = meta.badge === "On-device";
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(id)}
            className={clsx(
              "group relative flex flex-col gap-2 rounded-card border p-4 text-left transition-all duration-200 ease-premium",
              "disabled:cursor-not-allowed disabled:opacity-50",
              active
                ? "border-accent bg-accent-weak"
                : "border-line bg-surface hover:border-line-hover hover:bg-surface-2"
            )}
          >
            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.12em] text-fg-faint">
              {OnDevice ? <Cpu className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {meta.badge}
            </span>
            <span className={clsx("text-[15px] font-medium", active ? "text-accent" : "text-fg")}>
              {getEngine(id).label}
            </span>
            <span className="text-xs leading-snug text-fg-muted line-clamp-2">{meta.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}
