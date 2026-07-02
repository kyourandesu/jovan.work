import ParallaxScene from "./ParallaxScene";
import { SITE } from "../lib/content";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative isolate w-full overflow-hidden"
    >
      {/* Desktop: the scene box carries the photo's exact 4552:2560 aspect ratio,
          so the full frame shows edge-to-edge — no crop, no zoom, very top to
          very bottom (≈ full-screen on 16:9 displays).
          Mobile: a portrait strip can't hold a landscape frame, so we give it a
          tall box and let object-cover keep the full height (top+bottom) while
          the sides crop. Layers: person > name > land > sky. */}
      <ParallaxScene
        name={SITE.name}
        className="relative isolate h-[82svh] w-full md:h-auto md:aspect-[4552/2560]"
      />

      {/* Soft fade at the very bottom — a solid paper base hides the person's
          pinned (cropped) bottom edge, then fades up so most of the frame still
          shows and the hero blends into the page below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[18%] bg-gradient-to-t from-ink from-45% via-ink/60 to-transparent"
      />
    </section>
  );
}
