"use client";

// Drives word highlighting from audio playback. Reads currentTime on rAF and
// toggles the active word's class via DIRECT DOM mutation (no per-frame React
// state) so it stays at 60fps. Auto-scrolls the active word into view.

import { useEffect, useRef } from "react";
import type { WordTiming } from "@/app/lib/tts/types";

const ACTIVE = "word--active";
const DONE = "word--spoken";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Binary-search the timing list for the word active at time `t` (seconds). */
function findIndex(timings: WordTiming[], t: number): number {
  let lo = 0;
  let hi = timings.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (t >= timings[mid].start) {
      if (t < timings[mid].end || mid === timings.length - 1) {
        ans = mid;
        break;
      }
      ans = mid; // past this word's start; keep as best-so-far
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

export function useKaraoke(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  containerRef: React.RefObject<HTMLElement | null>,
  timings: WordTiming[],
  enabled: boolean
) {
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef<number>(-1);

  useEffect(() => {
    const audio = audioRef.current;
    const container = containerRef.current;
    if (!audio || !container || !enabled || timings.length === 0) return;

    const spans = () => container.querySelectorAll<HTMLElement>("span[data-w]");
    const reduce = prefersReducedMotion();

    const setActive = (idx: number) => {
      if (idx === activeRef.current) return;
      const nodes = spans();
      const prev = activeRef.current;
      if (prev >= 0 && nodes[prev]) {
        nodes[prev].classList.remove(ACTIVE);
        nodes[prev].classList.add(DONE);
      }
      if (idx >= 0 && nodes[idx]) {
        const node = nodes[idx];
        node.classList.add(ACTIVE);
        node.classList.remove(DONE);
        node.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      }
      // Reset "spoken" state for words after the active one (e.g. on seek back).
      if (idx < prev) {
        for (let i = idx + 1; i < nodes.length; i++) nodes[i]?.classList.remove(DONE);
      }
      activeRef.current = idx;
    };

    const tick = () => {
      setActive(findIndex(timings, audio.currentTime));
      rafRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setActive(findIndex(timings, audio.currentTime));
    };
    const clear = () => {
      stop();
      const nodes = spans();
      nodes.forEach((n) => n.classList.remove(ACTIVE, DONE));
      activeRef.current = -1;
    };

    audio.addEventListener("play", start);
    audio.addEventListener("pause", stop);
    audio.addEventListener("seeked", stop);
    audio.addEventListener("ended", clear);
    if (!audio.paused) start();

    return () => {
      audio.removeEventListener("play", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("seeked", stop);
      audio.removeEventListener("ended", clear);
      // Clear highlight state so a timings swap (pending -> aligned) restarts
      // from a clean slate; the fresh effect re-syncs against the new list.
      clear();
    };
  }, [audioRef, containerRef, timings, enabled]);
}
