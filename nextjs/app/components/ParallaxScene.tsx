"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { clsx } from "clsx";
import { EASE_PREMIUM } from "../lib/motion";

/**
 * Layered parallax hero.
 *
 * person.png / land.png / sky.png are a registered decomposition of one photo
 * (identical 4552×2560 frames), so stacking them reconstructs the original
 * scene. On scroll the background layers drift while the person stays pinned:
 *
 *   person (front)  →  name  →  land  →  sky (back)
 *
 * The person is ANCHORED (no drift) so its cropped bottom edge stays fixed at
 * the very bottom of the frame, under the fade, and never slides up into view.
 * The sky and land lag behind (drift down as you scroll), which reads as depth
 * with the person as the fast/near layer. On-screen speed still reads
 * person > land > sky.
 *
 * The name sits just behind the person, above the head at rest; it lags too, so
 * the pinned person rises past it and tucks it away on scroll.
 *
 * `y` is in `vh` so movement is viewport-relative. Positive `to` = the layer
 * translates down (lags); any edge a lagging layer bares sits under a scrim.
 */

type Layer = {
  src: string;
  alt: string;
  z: string;
  /** translateY at scroll-progress 0 → 1, in vh. Positive = lags (drifts down). */
  from: string;
  to: string;
};

// Back-to-front. The person RISES (leads, negative) while the background sinks
// (lags, positive), so the relative parallax is large and the figure lifts up
// in front of the name — tucking it behind. On-screen speed reads
// person > land > sky. A lagging layer's bared top edge rides off-screen with
// the hero; the person's rising (cropped) bottom sits under the fade.
const LAYERS: Layer[] = [
  { src: "/sky.png", alt: "", z: "z-10", from: "0vh", to: "24vh" },
  { src: "/land.png", alt: "", z: "z-20", from: "0vh", to: "11vh" },
  {
    src: "/person.png",
    alt: "Jovan Tan standing in an open landscape",
    z: "z-40",
    from: "0vh",
    to: "-11vh",
  },
];

// The name lags far behind page speed, so it scrolls up very slowly and lingers;
// combined with the rising person it slips behind the head and torso on scroll.
const NAME_TO = "58vh";

function ParallaxImage({
  layer,
  progress,
  reduced,
}: {
  layer: Layer;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(
    progress,
    [0, 1],
    reduced ? ["0vh", "0vh"] : [layer.from, layer.to]
  );

  return (
    <motion.div style={{ y }} className={clsx("absolute inset-0", layer.z)}>
      <Image
        src={layer.src}
        alt={layer.alt}
        fill
        priority
        sizes="100vw"
        // No zoom: the scene box carries the photo's exact aspect ratio, so
        // object-cover fills it without cropping — the full frame shows, very
        // top to very bottom.
        className="object-cover object-center will-change-transform"
      />
    </motion.div>
  );
}

function NameLayer({
  name,
  progress,
  reduced,
}: {
  name: string;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(
    progress,
    [0, 1],
    reduced ? ["0vh", "0vh"] : ["0vh", NAME_TO]
  );

  return (
    <motion.div style={{ y }} className="absolute inset-0 z-30">
      {/* Sits above the head at rest; the rising person tucks it away on scroll.
          Opacity-only intro so it doesn't fight the layout transform. */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: EASE_PREMIUM, delay: 0.2 }}
        className="absolute inset-x-0 top-[18%] px-6 text-center font-black uppercase leading-[0.9] tracking-[-0.04em] text-fg [text-shadow:0_2px_50px_rgba(244,242,236,0.55)]"
        style={{ fontSize: "clamp(56px, 11.5vw, 168px)" }}
      >
        {name}
      </motion.h1>
    </motion.div>
  );
}

export default function ParallaxScene({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Progress 0 when the scene's top hits the viewport top, 1 once it has
  // scrolled a full viewport past it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={ref} className={clsx("overflow-hidden", className)}>
      {LAYERS.map((layer) => (
        <ParallaxImage
          key={layer.src}
          layer={layer}
          progress={scrollYProgress}
          reduced={reduced}
        />
      ))}
      <NameLayer name={name} progress={scrollYProgress} reduced={reduced} />
    </div>
  );
}
