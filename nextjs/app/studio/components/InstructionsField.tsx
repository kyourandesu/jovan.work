"use client";

const PRESETS = ["Warm and friendly", "Calm, slow narration", "Upbeat and energetic", "Serious newsreader"];

export default function InstructionsField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="tts-instructions" className="text-eyebrow text-fg-faint">
        Voice direction <span className="normal-case tracking-normal text-fg-faint">(cloud voices)</span>
      </label>
      <input
        id="tts-instructions"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Speak cheerfully, like a podcast host"
        className="w-full rounded-button border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus-visible:border-accent"
      />
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p)}
            className="rounded-pill border border-line px-2.5 py-1 text-[11px] text-fg-muted transition-colors hover:border-line-hover hover:text-fg disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
