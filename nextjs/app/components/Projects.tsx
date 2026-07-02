"use client";

import { Github, ArrowUpRight } from "lucide-react";
import { Eyebrow, Reveal, RevealGroup, RevealItem } from "./primitives";
import { PROJECTS, type Project } from "../lib/content";

function ProjectCard({ project }: { project: Project }) {
  const primaryHref = project.link ?? project.code;

  // Track the cursor locally so the 1px spotlight border lights up nearest it.
  const onMove: React.MouseEventHandler<HTMLElement> = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--cx", `${e.clientX - r.left}px`);
    el.style.setProperty("--cy", `${e.clientY - r.top}px`);
  };

  return (
    <RevealItem
      as="article"
      onMouseMove={onMove}
      className="group relative flex h-full flex-col rounded-card border border-line bg-surface p-7 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-line-hover hover:bg-surface-2"
    >
      {/* Spotlight border that follows the cursor on hover */}
      <span aria-hidden="true" className="card-spotlight" />
      <div className="mb-6 flex items-start justify-between gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-fg-faint">
          {project.category}
        </span>
        {/* relative z-10 keeps these above the title's whole-card ::after overlay */}
        <div className="relative z-10 flex gap-1.5">
          {project.code && (
            <a
              href={project.code}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — source code`}
              className="rounded-full border border-line p-1.5 text-fg-muted transition-colors duration-200 hover:border-line-hover hover:text-fg"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} — live site`}
              className="rounded-full border border-line p-1.5 text-fg-muted transition-colors duration-200 hover:border-line-hover hover:text-fg"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <h3 className="text-xl font-medium tracking-tight text-fg">
        {/* Whole-card link via overlay, so the card is one large target. */}
        {primaryHref ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:content-['']"
          >
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h3>

      <p className="mt-3 flex-1 leading-relaxed text-fg-muted">
        {project.desc}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-pill border border-line px-2.5 py-1 font-mono text-[0.7rem] text-fg-faint"
          >
            {tag}
          </span>
        ))}
      </div>
    </RevealItem>
  );
}

export default function Projects() {
  return (
    <section
      id="work"
      className="scroll-mt-24 border-b border-line-2 py-[var(--spacing-section)]"
    >
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <Eyebrow className="mb-6">Selected works</Eyebrow>
          <h2 className="text-h2 text-fg">
            A mix of professional work, hackathon wins, and side projects.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-fg-muted">
            Where I explore new tech and turn ideas into things that run.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.06}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROJECTS.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
