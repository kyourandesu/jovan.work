"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { Eyebrow, Reveal, RevealGroup, RevealItem } from "./primitives";
import { STATS, VALUE, type Stat } from "../lib/content";

function formatValue(v: number, decimals = 0) {
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function CountUp({ stat, play }: { stat: Stat; play: boolean }) {
  const reduce = useReducedMotion();
  // Always start at 0 so SSR and first client render agree; the effect below
  // jumps straight to the final value for reduced-motion users.
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(stat.value);
      return;
    }
    if (!play) return;

    let raf = 0;
    let start: number | null = null;
    const duration = 1400;
    const easeOutExpo = (t: number) =>
      t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      setDisplay(stat.value * easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(stat.value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduce, stat.value]);

  return (
    <span className="text-stat tabular-nums text-fg">
      {stat.prefix}
      {formatValue(display, stat.decimals)}
      {stat.suffix}
    </span>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section className="border-b border-line-2 py-[var(--spacing-section)]">
      <div className="container-x">
        {/* Value / offering intro (centered) */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className="mb-5">{VALUE.eyebrow}</Eyebrow>
          <h2 className="text-h2 text-fg">{VALUE.heading}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            {VALUE.supporting}
          </p>
        </Reveal>

        {/* Stat grid */}
        <div ref={ref}>
          <RevealGroup className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <RevealItem
                key={stat.label}
                className="flex flex-col gap-3 bg-ink p-7 transition-colors duration-300 hover:bg-surface"
              >
                <CountUp stat={stat} play={inView} />
                <span className="text-sm font-medium text-fg">{stat.label}</span>
                <span className="text-sm leading-relaxed text-fg-muted">
                  {stat.desc}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
