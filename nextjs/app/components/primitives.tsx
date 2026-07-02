"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { revealUp, staggerParent, VIEWPORT } from "../lib/motion";

// Motion components render unconditionally — MotionConfig reducedMotion="user"
// (in SmoothScroll) disables transform animations for reduced-motion users
// while keeping opacity, so server and client markup always match.

/* ── Scroll reveal wrapper ───────────────────────────────────────── */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={revealUp}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}

/* ── Staggered group: reveals children one after another ─────────── */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "section";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={staggerParent(stagger)}
    >
      {children}
    </MotionTag>
  );
}

// Child of a RevealGroup — inherits the parent's stagger timing.
export function RevealItem({
  children,
  className,
  as = "div",
  variants,
  onMouseMove,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
  variants?: Variants;
  onMouseMove?: React.MouseEventHandler<HTMLElement>;
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={variants ?? revealUp}
      onMouseMove={onMouseMove}
    >
      {children}
    </MotionTag>
  );
}

/* ── Eyebrow label ───────────────────────────────────────────────── */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={clsx("text-eyebrow", className)}>{children}</p>;
}

// Screen-reader-only cue appended to links that open a new tab.
function NewTabHint({ show }: { show?: boolean }) {
  if (!show) return null;
  return <span className="sr-only"> (opens in a new tab)</span>;
}

/* ── Buttons ─────────────────────────────────────────────────────── */
export function PrimaryButton({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={clsx(
        "group inline-flex h-11 items-center justify-center gap-2 rounded-button bg-accent px-5 text-[15px] font-medium text-white",
        "transition-[transform,filter] duration-150 ease-premium hover:-translate-y-px hover:brightness-110 active:translate-y-0 active:scale-[0.99]",
        className
      )}
    >
      {children}
      <NewTabHint show={external} />
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={clsx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-button border border-line bg-surface/50 px-5 text-[15px] font-medium text-fg",
        "transition-colors duration-150 ease-premium hover:border-line-hover hover:bg-surface-2",
        className
      )}
    >
      {children}
      <NewTabHint show={external} />
    </Link>
  );
}

/* ── Arrow text link ─────────────────────────────────────────────── */
export function ArrowLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={clsx(
        "group inline-flex items-center gap-1.5 text-[15px] font-medium text-accent transition-[filter] duration-200 hover:brightness-110",
        className
      )}
    >
      {children}
      <NewTabHint show={external} />
      <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-premium group-hover:translate-x-1" />
    </Link>
  );
}
