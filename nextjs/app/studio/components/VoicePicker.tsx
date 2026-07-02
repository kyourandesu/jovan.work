"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Play, Loader2, Check, Square } from "lucide-react";
import type { Voice } from "@/app/lib/tts/types";

const MAX_RENDER = 100;

// Normalize codes like "en_US" → "en-US" and resolve to a display name.
function langName(code: string): string {
  const tag = code.replace(/_/g, "-");
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(tag) ?? tag;
  } catch {
    return tag;
  }
}

export default function VoicePicker({
  voices,
  value,
  onChange,
  onPreview,
  previewLoadingId,
  previewPlayingId,
  loading,
  disabled,
}: {
  voices: Voice[];
  value: string;
  onChange: (id: string) => void;
  onPreview: (id: string) => void;
  previewLoadingId: string | null;
  previewPlayingId: string | null;
  loading?: boolean;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("all");
  const [group, setGroup] = useState("all");

  // Reset facets when the voice list identity changes (engine switch). Comparing
  // against the previous list in render is React's blessed alternative to a
  // reset effect and avoids a cascading re-render.
  const [prevVoices, setPrevVoices] = useState(voices);
  if (prevVoices !== voices) {
    setPrevVoices(voices);
    setQuery("");
    setLang("all");
    setGroup("all");
  }

  const languages = useMemo(() => {
    const set = new Set<string>();
    for (const v of voices) if (v.lang) set.add(v.lang);
    return [...set].sort();
  }, [voices]);

  const groups = useMemo(() => {
    const set = new Set<string>();
    for (const v of voices) if (v.group) set.add(v.group);
    return [...set].sort();
  }, [voices]);

  const showLang = languages.length >= 2;
  const showGroups = groups.length >= 2 && groups.length <= 12;
  const showSearch = voices.length > 12;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return voices.filter((v) => {
      if (lang !== "all" && v.lang !== lang) return false;
      if (group !== "all" && v.group !== group) return false;
      if (!q) return true;
      return (
        v.label.toLowerCase().includes(q) ||
        v.group?.toLowerCase().includes(q) ||
        v.lang?.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q)
      );
    });
  }, [voices, query, lang, group]);

  const shown = filtered.slice(0, MAX_RENDER);
  const hasFilters = query.trim() !== "" || lang !== "all" || group !== "all";

  // When grouping, render chips under headings; otherwise flat.
  const grouped = useMemo(() => {
    if (!showGroups) return null;
    const map = new Map<string, Voice[]>();
    for (const v of shown) {
      const key = v.group ?? "Other";
      const bucket = map.get(key);
      if (bucket) bucket.push(v);
      else map.set(key, [v]);
    }
    return [...map.entries()];
  }, [shown, showGroups]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-eyebrow text-fg-faint">Voice</span>
        <div className="flex items-center gap-2">
          {showLang && (
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Filter voices by language"
              className="rounded-pill border border-line bg-surface px-3 py-1 text-xs text-fg focus:outline-none focus-visible:border-accent"
            >
              <option value="all">All languages</option>
              {languages.map((code) => (
                <option key={code} value={code}>
                  {langName(code)}
                </option>
              ))}
            </select>
          )}
          {showSearch && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search voices…"
              aria-label="Search voices"
              className="w-40 rounded-pill border border-line bg-surface px-3 py-1 text-xs text-fg placeholder:text-fg-faint focus:outline-none focus-visible:border-accent"
            />
          )}
        </div>
      </div>

      {showGroups && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter voices by group">
          {["all", ...groups].map((g) => {
            const active = group === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                aria-pressed={active}
                className={clsx(
                  "rounded-pill border px-2.5 py-1 text-[11px] transition-colors",
                  active
                    ? "border-accent bg-accent-weak text-accent"
                    : "border-line text-fg-muted hover:border-line-hover hover:text-fg"
                )}
              >
                {g === "all" ? "All" : g}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-fg-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading voices…
        </div>
      ) : (
        <>
          <div
            role="listbox"
            aria-label="Voice"
            className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1"
          >
            {grouped
              ? grouped.map(([heading, items]) => (
                  <div key={heading} className="flex flex-col gap-2">
                    <span className="text-eyebrow text-fg-faint">{heading}</span>
                    <div className="flex flex-wrap gap-2">
                      {items.map((v) => (
                        <VoiceChip
                          key={v.id}
                          voice={v}
                          active={v.id === value}
                          loadingPreview={previewLoadingId === v.id}
                          playingPreview={previewPlayingId === v.id}
                          disabled={disabled}
                          onChange={onChange}
                          onPreview={onPreview}
                        />
                      ))}
                    </div>
                  </div>
                ))
              : (
                <div className="flex flex-wrap gap-2">
                  {shown.map((v) => (
                    <VoiceChip
                      key={v.id}
                      voice={v}
                      active={v.id === value}
                      loadingPreview={previewLoadingId === v.id}
                      playingPreview={previewPlayingId === v.id}
                      disabled={disabled}
                      onChange={onChange}
                      onPreview={onPreview}
                    />
                  ))}
                </div>
              )}
          </div>
          {filtered.length > MAX_RENDER && (
            <p className="text-xs text-fg-faint">
              Showing {MAX_RENDER} of {filtered.length.toLocaleString()} — refine your search to see more.
            </p>
          )}
          {filtered.length === 0 && (
            <p className="text-xs text-fg-faint">
              {hasFilters ? "No voices match your filters." : "No voices available."}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function VoiceChip({
  voice: v,
  active,
  loadingPreview,
  playingPreview,
  disabled,
  onChange,
  onPreview,
}: {
  voice: Voice;
  active: boolean;
  loadingPreview: boolean;
  playingPreview: boolean;
  disabled?: boolean;
  onChange: (id: string) => void;
  onPreview: (id: string) => void;
}) {
  return (
    <div
      role="option"
      aria-selected={active}
      className={clsx(
        "group flex items-center gap-1 rounded-pill border pl-3 pr-1 py-1 transition-colors duration-150",
        active ? "border-accent bg-accent-weak" : "border-line bg-surface hover:border-line-hover"
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(v.id)}
        className="flex items-center gap-1.5 text-sm"
        title={v.group ?? v.lang}
      >
        {active && <Check className="h-3.5 w-3.5 text-accent" />}
        <span className={clsx("font-medium", active ? "text-accent" : "text-fg")}>{v.label}</span>
        {v.group && <span className="hidden text-[11px] text-fg-faint sm:inline">· {v.group}</span>}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onPreview(v.id)}
        aria-label={playingPreview || loadingPreview ? `Stop preview` : `Preview ${v.label}`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-fg-faint transition-colors hover:bg-surface-2 hover:text-accent disabled:opacity-60"
      >
        {loadingPreview ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : playingPreview ? (
          <Square className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
