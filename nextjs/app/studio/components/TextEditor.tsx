"use client";

import { clsx } from "clsx";

export default function TextEditor({
  value,
  onChange,
  cloudLimit,
  onInsertSample,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  /** When set (cloud engine active), warn once the text passes this length. */
  cloudLimit?: number;
  onInsertSample: () => void;
  disabled?: boolean;
}) {
  const chars = value.length;
  const over = cloudLimit !== undefined && chars > cloudLimit;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="tts-text" className="text-eyebrow text-fg-faint">
          Your text
        </label>
        <button
          type="button"
          onClick={onInsertSample}
          className="text-xs font-medium text-accent transition-[filter] hover:brightness-110"
        >
          Insert sample
        </button>
      </div>
      <textarea
        id="tts-text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        placeholder="Paste or type anything — a paragraph, an article, a script…"
        className={clsx(
          "w-full resize-y rounded-card border bg-surface p-4 text-[15px] leading-relaxed text-fg",
          "placeholder:text-fg-faint focus:outline-none focus-visible:border-accent",
          "transition-colors duration-150 disabled:opacity-60",
          over ? "border-accent" : "border-line"
        )}
      />
      <div className="flex items-center justify-between text-xs">
        <span className={clsx(over ? "text-accent" : "text-fg-faint")}>
          {chars.toLocaleString()} characters
          {cloudLimit !== undefined && ` · cloud limit ${cloudLimit.toLocaleString()}`}
        </span>
        {over && (
          <span className="text-accent">Too long for cloud — trim it or use an on-device engine.</span>
        )}
      </div>
    </div>
  );
}
