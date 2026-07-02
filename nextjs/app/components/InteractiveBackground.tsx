"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";

type Variant = "grid" | "spotlight";

/**
 * Pointer-reactive section background. Place behind a `relative` section with
 * `absolute inset-0 -z-10` (the component adds `pointer-events-none`).
 *
 * Shared mechanics:
 *  - pointermove stores a target; each frame the rendered position LERPs toward
 *    it (pos += (target - pos) * 0.08) so the effect trails the cursor.
 *  - One rAF loop, canvas sized to devicePixelRatio (grid); spotlight
 *    writes --mx/--my CSS vars consumed by a radial-gradient.
 *  - Runs only while in view (IntersectionObserver), pauses on window blur,
 *    and is disabled on touch / prefers-reduced-motion (static single frame).
 */
export default function InteractiveBackground({
  variant,
  className,
}: {
  variant: Variant;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const maybeRoot = rootRef.current;
    if (!maybeRoot) return;
    // Non-null typed alias so the compiler keeps narrowing inside closures.
    const root: HTMLDivElement = maybeRoot;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia(
      "(hover: none), (pointer: coarse)"
    ).matches;
    const disabled = reduce || coarse;

    const WHITE = "26, 27, 31"; // dot ink — matches --color-fg (light theme)

    let w = 0;
    let h = 0;
    let rect = root.getBoundingClientRect();
    let raf = 0;
    let running = false;
    let inView = true;
    let focused = true;
    let hasPointer = false;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };

    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext("2d") : null;

    let dots: { bx: number; by: number }[] = [];
    const GRID_GAP = 14;

    const restTarget = () =>
      variant === "spotlight"
        ? { x: w / 2, y: h / 2 }
        : { x: -10000, y: -10000 };

    function build() {
      if (variant === "grid") {
        dots = [];
        for (let y = GRID_GAP / 2; y < h; y += GRID_GAP)
          for (let x = GRID_GAP / 2; x < w; x += GRID_GAP)
            dots.push({ bx: x, by: y });
      }
    }

    function measure() {
      rect = root.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      if (canvas && ctx) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      build();
      const rt = restTarget();
      if (!hasPointer) {
        target.x = rt.x;
        target.y = rt.y;
      }
      if (pos.x === 0 && pos.y === 0) {
        pos.x = rt.x;
        pos.y = rt.y;
      }
    }

    function drawGrid() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const R = 96; // tighter influence radius (dense small grid)
      const DOT = 0.7; // small dots
      const GROW = 0.8; // max radius added at the pointer's center
      const near: { x: number; y: number; p: number }[] = [];

      // Resting dots batched into a single path / fill.
      ctx.fillStyle = `rgba(${WHITE}, 0.1)`;
      ctx.beginPath();
      for (const dot of dots) {
        if (hasPointer) {
          const dx = dot.bx - pos.x;
          const dy = dot.by - pos.y;
          const d = Math.hypot(dx, dy);
          if (d < R) {
            // Dots hold position; only their size/brightness responds.
            near.push({ x: dot.bx, y: dot.by, p: 1 - d / R });
            continue;
          }
        }
        ctx.moveTo(dot.bx + DOT, dot.by);
        ctx.arc(dot.bx, dot.by, DOT, 0, Math.PI * 2);
      }
      ctx.fill();

      // Magnetic dots: scaled up + brightened, most intensely nearest the pointer.
      for (const nd of near) {
        ctx.fillStyle = `rgba(${WHITE}, ${0.12 + nd.p * 0.45})`;
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, DOT + nd.p * GROW, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawSpotlight() {
      root.style.setProperty("--mx", `${pos.x}px`);
      root.style.setProperty("--my", `${pos.y}px`);
    }

    function render() {
      if (variant === "grid") drawGrid();
      else drawSpotlight();
    }

    function frame() {
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;
      render();
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }
    function sync() {
      if (inView && focused) start();
      else stop();
    }

    function onPointerMove(e: PointerEvent) {
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      hasPointer = true;
    }
    function onPointerOut() {
      hasPointer = false;
      const rt = restTarget();
      target.x = rt.x;
      target.y = rt.y;
    }
    function onScroll() {
      rect = root.getBoundingClientRect();
    }
    function onBlur() {
      focused = false;
      sync();
    }
    function onFocus() {
      focused = true;
      sync();
    }

    measure();
    render();

    if (disabled) {
      // Static single frame, no listeners or loop.
      const ro0 = new ResizeObserver(() => {
        measure();
        render();
      });
      ro0.observe(root);
      return () => ro0.disconnect();
    }

    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(root);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [variant]);

  if (variant === "spotlight") {
    return (
      <div
        ref={rootRef}
        aria-hidden="true"
        className={clsx("pointer-events-none overflow-hidden", className)}
        style={{
          background:
            "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), var(--color-accent-weak), transparent 60%)",
        }}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={clsx("pointer-events-none overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
