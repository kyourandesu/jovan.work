"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import { SITE, NAV_LINKS } from "../lib/content";

export default function Footer() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(href, { offset: -80, immediate: !!reduce });
    else
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="border-t border-line bg-ink-2 py-14">
      <div className="container-x flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <a
            href="#top"
            onClick={go("#top")}
            className="text-base font-semibold tracking-tight text-fg"
          >
            {SITE.wordmark}
          </a>
          <p className="mt-2 text-[13px] text-fg-faint">
            © {year} {SITE.name}. All rights reserved.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-7 gap-y-2 text-sm text-fg-muted"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={go(link.href)}
              className="transition-colors hover:text-fg"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-button border border-line text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex h-9 w-9 items-center justify-center rounded-button border border-line text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
          >
            <Linkedin className="h-[18px] w-[18px]" />
          </a>
          <a
            href={`mailto:${SITE.email}`}
            aria-label="Email"
            className="flex h-9 w-9 items-center justify-center rounded-button border border-line text-fg-muted transition-colors hover:border-line-hover hover:text-fg"
          >
            <Mail className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
