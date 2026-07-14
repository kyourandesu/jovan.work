"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

function RevealCharacter({
  character,
  index,
  total,
  progress,
  reducedMotion,
}: {
  character: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reducedMotion: boolean | null;
}) {
  const start = (index / total) * 0.5;
  const end = Math.min(start + 0.1, 1);
  const opacity = useTransform(progress, [start, end], [0.03, 1]);

  return (
    <motion.span aria-hidden="true" style={{ opacity: reducedMotion ? 1 : opacity }}>
      {character}
    </motion.span>
  );
}

export default function QuoteReveal({ children }: { children: React.ReactNode }) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const reducedMotion = useReducedMotion();
  const text = typeof children === "string" ? children : "";
  const characters = Array.from(text);
  const { scrollYProgress } = useScroll({
    target: quoteRef,
    offset: ["start 88%", "end 42%"],
  });

  return (
    <motion.blockquote
      ref={quoteRef}
      className="mt-3 whitespace-pre-wrap font-serif text-xl italic leading-relaxed text-fg md:text-2xl"
      aria-label={text}
    >
      {characters.map((character, index) => (
        <RevealCharacter
          key={`${index}-${character}`}
          character={character}
          index={index}
          total={characters.length}
          progress={scrollYProgress}
          reducedMotion={reducedMotion}
        />
      ))}
    </motion.blockquote>
  );
}
