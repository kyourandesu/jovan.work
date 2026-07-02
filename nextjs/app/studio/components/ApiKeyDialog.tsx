"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { Eye, EyeOff, KeyRound, TriangleAlert, X } from "lucide-react";
import {
  clearByokKey,
  getByokKey,
  looksLikeKey,
  providerLabel,
  setByokKey,
  type ByokProvider,
} from "@/app/lib/tts/byok";

const PROVIDER_TARGET: Record<ByokProvider, string> = {
  openai: "OpenAI",
  gemini: "Google",
};

const KEY_URL: Record<ByokProvider, string> = {
  openai: "platform.openai.com/api-keys",
  gemini: "aistudio.google.com/apikey",
};

export default function ApiKeyDialog({
  provider,
  open,
  onClose,
}: {
  provider: ByokProvider;
  open: boolean;
  onClose: () => void;
}) {
  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Remount the body each time the dialog opens so its state seeds cleanly from
  // the store via useState initializers (no setState-in-effect).
  return <DialogBody provider={provider} onClose={onClose} />;
}

function DialogBody({
  provider,
  onClose,
}: {
  provider: ByokProvider;
  onClose: () => void;
}) {
  const label = providerLabel(provider);
  const target = PROVIDER_TARGET[provider];
  const titleId = useId();
  const descId = useId();
  const inputId = useId();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState(() => getByokKey(provider) ?? "");
  const [remember, setRemember] = useState(true);
  const [reveal, setReveal] = useState(false);
  const hadKey = value.length > 0;

  // Focus (and select) the input once, on open.
  useEffect(() => {
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const save = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setByokKey(provider, trimmed, remember);
    onClose();
  }, [value, provider, remember, onClose]);

  const remove = useCallback(() => {
    clearByokKey(provider);
    onClose();
  }, [provider, onClose]);

  const trimmed = value.trim();
  const showFormatWarning = trimmed.length > 0 && !looksLikeKey(provider, trimmed);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="flex items-center gap-2 text-base font-medium text-fg">
            <KeyRound className="h-4 w-4 text-accent" />
            Use your own {label} key
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-button p-1 text-fg-faint transition-colors hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p id={descId} className="mt-3 text-sm leading-relaxed text-fg-muted">
          Stored only in this browser and sent directly to {target} when you generate — it never
          touches this site&rsquo;s server.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor={inputId} className="text-eyebrow text-fg-faint">
            {label} API key
          </label>
          <div className="relative">
            <input
              id={inputId}
              ref={inputRef}
              type={reveal ? "text" : "password"}
              value={value}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                }
              }}
              placeholder={provider === "openai" ? "sk-…" : "AIza…"}
              className="w-full rounded-button border border-line bg-surface px-4 py-2.5 pr-11 font-mono text-sm text-fg placeholder:text-fg-faint focus:outline-none focus-visible:border-accent"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide key" : "Show key"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-fg-faint transition-colors hover:text-fg"
            >
              {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {showFormatWarning && (
            <p className="flex items-start gap-1.5 text-xs text-fg-muted">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              That doesn&rsquo;t look like a typical {label} key
              {provider === "openai" ? " (usually starts with sk-)" : " (usually starts with AIza)"}.
              You can still save it.
            </p>
          )}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-fg-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-accent"
          />
          Remember on this device
        </label>

        <p className="mt-3 text-xs text-fg-faint">
          Create a key at{" "}
          <a
            href={`https://${KEY_URL[provider]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-[filter] hover:brightness-110"
          >
            {KEY_URL[provider]}
          </a>
          .
        </p>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={trimmed.length === 0}
            className={clsx(
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-button bg-accent px-5 text-sm font-medium text-white",
              "transition-[filter] duration-150 hover:brightness-110",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Save key
          </button>
          {hadKey && (
            <button
              type="button"
              onClick={remove}
              className="inline-flex h-10 items-center justify-center rounded-button border border-line bg-surface px-4 text-sm font-medium text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
