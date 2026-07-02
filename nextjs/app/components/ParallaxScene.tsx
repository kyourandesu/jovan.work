"use client";

import { useEffect, useRef, useState } from "react";
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
 * DESKTOP — the frame is a short landscape box (aspect 4552/2560), so the person
 * RISES (leads, negative) while the background sinks (lags, positive). The figure
 * lifts up in front of the name, tucking it behind; its cropped bottom edge stays
 * under the bottom fade because the frame is short and the rise is small.
 *
 * MOBILE — the frame is a tall portrait box, so object-cover magnifies the photo
 * and that same rise would lift the person's hard cropped bottom edge up above the
 * fade (looks broken). So on mobile the person is ANCHORED (no drift) — its bottom
 * stays pinned at the very bottom under the fade — and the background/name travel
 * is trimmed to suit the taller frame. On-screen speed still reads person > land >
 * sky on both.
 *
 * `y` is in `vh` so movement is viewport-relative. Positive `to` = the layer
 * translates down (lags); any edge a lagging layer bares sits under a scrim.
 * Each layer carries a desktop `to` and a `toMobile` picked below the `md`
 * breakpoint (see useIsMobile).
 */

type Layer = {
  src: string;
  alt: string;
  z: string;
  /** translateY at scroll-progress 0 → 1, in vh. Positive = lags (drifts down). */
  from: string;
  /** Desktop drift target (short landscape frame). */
  to: string;
  /** Mobile drift target (tall portrait frame); person is anchored at 0. */
  toMobile: string;
};

// Back-to-front. On-screen speed reads person > land > sky. A lagging layer's
// bared top edge rides off-screen with the hero; the person's cropped bottom sits
// under the fade — on desktop while rising, on mobile pinned (anchored).
const LAYERS: Layer[] = [
  { src: "/sky.webp", alt: "", z: "z-10", from: "0vh", to: "24vh", toMobile: "14vh" },
  { src: "/land.webp", alt: "", z: "z-20", from: "0vh", to: "11vh", toMobile: "7vh" },
  {
    src: "/person.webp",
    alt: "Jovan Tan standing in an open landscape",
    z: "z-40",
    from: "0vh",
    to: "-11vh",
    toMobile: "0vh",
  },
];

// The name lags far behind page speed, so it scrolls up slowly and lingers. On
// desktop the rising person slips behind it; on mobile the person is anchored, so
// the name just drifts up on its own, with the lag trimmed for the shorter scroll.
const NAME_TO = "58vh";
const NAME_TO_MOBILE = "44vh";

// Below Tailwind's `md` breakpoint the Hero switches to the tall portrait frame,
// so we swap in each layer's mobile drift there. Starts false so SSR + first
// client render agree, then corrects on mount (scroll is at the top, y = 0 for
// every layer, so the correction never causes a visible jump).
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function ParallaxImage({
  layer,
  to,
  progress,
  reduced,
}: {
  layer: Layer;
  to: string;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(
    progress,
    [0, 1],
    reduced ? ["0vh", "0vh"] : [layer.from, to]
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
  to,
  progress,
  reduced,
}: {
  name: string;
  to: string;
  progress: MotionValue<number>;
  reduced: boolean;
}) {
  const y = useTransform(
    progress,
    [0, 1],
    reduced ? ["0vh", "0vh"] : ["0vh", to]
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
  const isMobile = useIsMobile();

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
          to={isMobile ? layer.toMobile : layer.to}
          progress={scrollYProgress}
          reduced={reduced}
        />
      ))}
      <NameLayer
        name={name}
        to={isMobile ? NAME_TO_MOBILE : NAME_TO}
        progress={scrollYProgress}
        reduced={reduced}
      />
    </div>
  );
}
