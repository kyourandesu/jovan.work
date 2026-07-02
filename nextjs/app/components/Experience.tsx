"use client";

import { Eyebrow, Reveal, RevealGroup, RevealItem, ArrowLink } from "./primitives";
import { EXPERIENCES } from "../lib/content";

export default function Experience() {
  return (
    <section
      id="experience"
      className="scroll-mt-24 py-[var(--spacing-section)]"
    >
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <Eyebrow className="mb-6">Experience</Eyebrow>
          <h2 className="text-h2 text-fg">Where I&apos;ve been building.</h2>
        </Reveal>

        <RevealGroup className="mt-14 flex flex-col">
          {EXPERIENCES.map((exp) => (
            <RevealItem
              key={exp.role + exp.company}
              as="article"
              className="group grid gap-5 border-t border-line py-8 md:grid-cols-[0.8fr_1.4fr_auto] md:items-start md:gap-10"
            >
              {/* Role + company */}
              <div>
                <h3 className="text-lg font-medium text-fg">{exp.role}</h3>
                <p className="mt-1 text-sm text-fg-muted">{exp.company}</p>
              </div>

              {/* Description + skills */}
              <div>
                <p className="leading-relaxed text-fg-muted">{exp.desc}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {exp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-pill border border-line px-2.5 py-1 font-mono text-xs text-fg-faint"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {exp.link && (
                  <div className="mt-5">
                    <ArrowLink href={exp.link.href} external>
                      {exp.link.label}
                    </ArrowLink>
                  </div>
                )}
              </div>

              {/* Period */}
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-fg-faint md:text-right">
                {exp.period}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
