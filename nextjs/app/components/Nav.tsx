"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLenis } from "lenis/react";
import { clsx } from "clsx";
import { NAV_LINKS, SITE, HERO } from "../lib/content";
import { EASE_PREMIUM } from "../lib/motion";

export default function Nav() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile menu is open: lock body scroll, allow Escape to close
  // (returning focus to the toggle), and move focus into the menu.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    firstLinkRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    if (lenis) {
      lenis.scrollTo(href, { offset: -80, immediate: !!reduce });
    } else {
      document
        .querySelector(href)
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={clsx(
          "transition-colors duration-300 ease-premium",
          scrolled
            ? "border-b border-line bg-[rgba(244,242,236,0.72)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav
          className="container-x flex h-[60px] items-center justify-between md:h-[68px]"
          aria-label="Primary"
        >
          <a
            href="#top"
            onClick={go("#top")}
            className="text-base font-semibold tracking-tight text-fg"
          >
            {SITE.wordmark}
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            <ul className="flex items-center gap-6 text-sm font-medium text-fg-muted">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={go(link.href)}
                    className="transition-colors duration-200 hover:text-fg"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={HERO.primaryCta.href}
              onClick={go(HERO.primaryCta.href)}
              className="inline-flex h-10 items-center rounded-button bg-accent px-5 text-[15px] font-medium text-white transition-[transform,filter] duration-150 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.99]"
            >
              {HERO.primaryCta.label}
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="-mr-2 p-2 text-fg md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_PREMIUM }}
            className="fixed inset-0 top-[60px] z-40 flex flex-col gap-1 overflow-y-auto border-t border-line bg-ink/95 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-xl md:hidden"
          >
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                ref={i === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={go(link.href)}
                className="border-b border-line py-5 text-2xl font-medium text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            ))}
            <a
              href={HERO.primaryCta.href}
              onClick={go(HERO.primaryCta.href)}
              className="mt-6 rounded-button bg-accent px-6 py-4 text-center text-base font-medium text-white"
            >
              {HERO.primaryCta.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
