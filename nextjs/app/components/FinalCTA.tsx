"use client";

import { Mail, Github, Linkedin, MapPin } from "lucide-react";
import { Reveal, PrimaryButton, GhostButton } from "./primitives";
import InteractiveBackground from "./InteractiveBackground";
import { FINAL_CTA, SITE } from "../lib/content";

export default function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-24 overflow-hidden border-b border-line-2 py-[var(--spacing-section)]"
    >
      {/* Cursor-following spotlight */}
      <InteractiveBackground variant="spotlight" className="absolute inset-0 -z-10" />
      {/* Faint ambient glow (resting base) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[120px]"
      />

      <div className="container-x text-center">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="text-h2 text-fg">{FINAL_CTA.heading}</h2>
          <p className="mx-auto mt-7 max-w-lg text-lg leading-relaxed text-fg-muted">
            {FINAL_CTA.supporting}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PrimaryButton href={`mailto:${SITE.email}`}>
              <Mail className="h-4 w-4" />
              Say hello
            </PrimaryButton>
            <GhostButton href={SITE.linkedin} external>
              Connect on LinkedIn
            </GhostButton>
          </div>

          {/* Trust / context row */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-mono text-xs uppercase tracking-[0.14em] text-fg-faint">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {SITE.location}
            </span>
            <span className="hidden h-3 w-px bg-line sm:inline-block" />
            <span>Available for work</span>
            <span className="hidden h-3 w-px bg-line sm:inline-block" />
            <span className="inline-flex items-center gap-4">
              <a
                href={SITE.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-fg-faint transition-colors hover:text-fg"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-fg-faint transition-colors hover:text-fg"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
