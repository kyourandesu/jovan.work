"use client";

import Lenis, { type VirtualScrollData } from "lenis";
import { useEffect } from "react";
import { getSectionSnapTarget } from "./sectionSnap";
import "lenis/dist/lenis.css";

const SNAP_DELAY_MS = 10;
const GESTURE_GAP_MS = 30;
const SNAP_DURATION_SECONDS = 0.7;
// Gently build speed, cruise through the middle, then ease into the landing.
function easeToCruise(t: number) {
  const accelerate = 0.55;
  const decelerate = 0.15;
  const speed = 1 / (1 - (accelerate + decelerate) / 2);

  if (t < accelerate) {
    return speed * (t / 2 - accelerate * Math.sin(Math.PI * t / accelerate) / (2 * Math.PI));
  }
  if (t > 1 - decelerate) {
    const remaining = 1 - t;
    return 1 - speed * (remaining / 2 - decelerate * Math.sin(Math.PI * remaining / decelerate) / (2 * Math.PI));
  }
  return speed * (t - accelerate / 2);
}

export default function PortfolioScroll() {
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let dispose: (() => void) | undefined;

    function setup() {
      dispose?.();
      dispose = undefined;
      if (!media.matches) return;

      const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        virtualScroll: onWheel,
      });
      let snapTimer: ReturnType<typeof setTimeout> | undefined;
      let transition: { direction: number; lastInputAt: number; phase: "waiting" | "moving" | "settled" } | null = null;
      const cancelSnap = () => {
        clearTimeout(snapTimer);
        snapTimer = undefined;
        if (transition?.phase === "moving") {
          lenis.scrollTo(lenis.animatedScroll, { immediate: true });
        }
        transition = null;
      };

      function getTarget(deltaY: number) {
        return getSectionSnapTarget({
          position: lenis.targetScroll,
          delta: deltaY,
          direction: Math.sign(deltaY),
          sectionStarts: Array.from(
            document.querySelectorAll<HTMLElement>("#main-content > section"),
            section => section.getBoundingClientRect().top + window.scrollY,
          ),
          viewportHeight: window.innerHeight,
          scrollLimit: lenis.limit,
        });
      }

      function onWheel({ deltaX, deltaY, event }: VirtualScrollData) {
        if (event.type !== "wheel" || event.ctrlKey || event.defaultPrevented || Math.abs(deltaY) <= Math.abs(deltaX)) {
          cancelSnap();
          return !event.defaultPrevented;
        }
        if (event.composedPath().some(node => node instanceof HTMLElement &&
          (node.hasAttribute("data-lenis-prevent") || node.hasAttribute("data-lenis-prevent-wheel")))) {
          cancelSnap();
          return true;
        }

        const direction = Math.sign(deltaY);
        const now = performance.now();
        if (transition) {
          if (direction === transition.direction &&
            (transition.phase !== "settled" || now - transition.lastInputAt < GESTURE_GAP_MS)) {
            // Consume the rest of this gesture so momentum cannot skip a section.
            transition.lastInputAt = now;
            event.preventDefault();
            return false;
          }
          cancelSnap();
        }

        const target = getTarget(deltaY);
        if (target === null) return true;

        // Hold the current view before Lenis or the browser moves it. Start the
        // delay on the first wheel event, not after the user stops scrolling.
        event.preventDefault();
        lenis.scrollTo(lenis.animatedScroll, { immediate: true });
        const currentTransition = { direction, lastInputAt: now, phase: "waiting" as "waiting" | "moving" | "settled" };
        transition = currentTransition;
        snapTimer = setTimeout(() => {
          snapTimer = undefined;
          currentTransition.phase = "moving";
          lenis.scrollTo(target, {
            duration: SNAP_DURATION_SECONDS,
            easing: easeToCruise,
            onComplete: () => { currentTransition.phase = "settled"; },
          });
        }, SNAP_DELAY_MS);
        return false;
      }

      function onAnchorClick(event: MouseEvent) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
        if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
        const url = new URL(anchor.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;

        event.preventDefault();
        // Keep section URLs and keyboard focus without a native jump mid-animation.
        if (location.hash !== url.hash) history.pushState(history.state, "", url.hash);
        cancelSnap();
        lenis.scrollTo(target, {
          duration: SNAP_DURATION_SECONDS,
          easing: easeToCruise,
          onComplete: () => {
            target.focus({ preventScroll: true });
          },
        });
      }

      // Mouse, keyboard, links, and touch must cancel a queued wheel snap.
      document.addEventListener("click", onAnchorClick);
      window.addEventListener("keydown", cancelSnap);
      window.addEventListener("pointerdown", cancelSnap);
      window.addEventListener("resize", cancelSnap);
      dispose = () => {
        document.removeEventListener("click", onAnchorClick);
        window.removeEventListener("keydown", cancelSnap);
        window.removeEventListener("pointerdown", cancelSnap);
        window.removeEventListener("resize", cancelSnap);
        cancelSnap();
        lenis.destroy();
      };
    }

    setup();
    media.addEventListener("change", setup);
    return () => {
      media.removeEventListener("change", setup);
      dispose?.();
    };
  }, []);

  return null;
}
