"use client";

import Lenis from "lenis";
import Snap from "lenis/snap";
import { useEffect } from "react";
import "lenis/dist/lenis.css";

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
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
      });
      const snap = new Snap(lenis, {
        type: "proximity",
        distanceThreshold: "20%",
        debounce: 220,
        duration: 0.65,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });

      // Snap near section headings; leave the middle of long sections free.
      snap.addElements(
        Array.from(document.querySelectorAll<HTMLElement>("#main-content > section")),
        { align: "start" },
      );

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
        snap.stop();
        lenis.scrollTo(target, {
          duration: 0.9,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          onComplete: () => {
            target.focus({ preventScroll: true });
            snap.start();
          },
        });
      }

      // New wheel input can interrupt navigation immediately.
      const resumeSnap = () => snap.start();
      lenis.on("virtual-scroll", resumeSnap);
      document.addEventListener("click", onAnchorClick);
      dispose = () => {
        document.removeEventListener("click", onAnchorClick);
        lenis.off("virtual-scroll", resumeSnap);
        // Stop first so a pending debounce cannot scroll after unmount.
        snap.stop();
        snap.destroy();
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
