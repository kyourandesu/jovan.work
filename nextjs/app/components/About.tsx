"use client";

import { Trophy } from "lucide-react";
import { clsx } from "clsx";
import { Eyebrow, Reveal, RevealGroup, RevealItem } from "./primitives";
import { ABOUT, CAPABILITIES } from "../lib/content";

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 border-b border-line-2 py-[var(--spacing-section)]"
    >
      <div className="container-x">
        {/* Centered intro */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow className="mb-5">{ABOUT.eyebrow}</Eyebrow>
          <h2 className="text-h2 text-fg">{ABOUT.heading}</h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">
            {ABOUT.body}
          </p>
        </Reveal>

        {/* Achievements + capabilities */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Achievements */}
          <Reveal>
            <Eyebrow className="mb-6">Achievements</Eyebrow>
            <ul className="space-y-3">
              {ABOUT.achievements.map((a) => (
                <li
                  key={a.title}
                  className="flex items-start gap-4 rounded-card border border-line bg-surface p-5"
                >
                  <Trophy
                    className={clsx(
                      "mt-0.5 h-5 w-5 shrink-0",
                      a.highlight ? "text-accent" : "text-fg-faint"
                    )}
                  />
                  <div>
                    <p className="font-medium text-fg">{a.title}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-fg-faint">
                      {a.year}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Capabilities */}
          <div>
            <Eyebrow className="mb-6">Capabilities</Eyebrow>
            <div className="space-y-8">
              {CAPABILITIES.map((group) => (
                <Reveal key={group.title}>
                  <h3 className="text-lg font-medium text-fg">{group.title}</h3>
                  <RevealGroup
                    as="ul"
                    stagger={0.04}
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    {group.items.map((item) => (
                      <RevealItem
                        as="li"
                        key={item}
                        className="rounded-pill border border-line bg-surface px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors duration-200 hover:border-line-hover hover:text-fg"
                      >
                        {item}
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
