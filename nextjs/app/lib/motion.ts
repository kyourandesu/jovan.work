import type { Variants } from "framer-motion";

// Ease-out-expo feel — the signature "expensive" easing.
export const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

// Standard scroll reveal: fade in + rise. Used once on viewport entry.
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

// Container that staggers its children (grids, lists, stats).
export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// Masked hero line: slides up from below its overflow-hidden wrapper.
export const heroLine: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: 0.85, ease: EASE_PREMIUM },
  },
};

// Viewport config shared across scroll reveals.
export const VIEWPORT = { once: true, margin: "-10%" } as const;
