import { Cpu, Cloud } from "lucide-react";
import { RevealGroup, RevealItem } from "@/app/components/primitives";
import { ENGINE_META, ENGINE_ORDER } from "@/app/lib/tts/engines-meta";
import SectionIntro from "./SectionIntro";

export default function Engines() {
  return (
    <section id="engines" className="container-x py-[var(--spacing-section)]">
      <SectionIntro eyebrow="01 — ENGINES" title="Four engines, one studio.">
        Two lightweight models run on your device with nothing to install; two cloud models add
        studio-grade expressiveness. Switch freely and compare.
      </SectionIntro>

      <RevealGroup className="mt-14 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2">
        {ENGINE_ORDER.map((id) => {
          const meta = ENGINE_META[id];
          const OnDevice = meta.badge === "On-device";
          return (
            <RevealItem
              key={id}
              as="article"
              className="group relative flex flex-col gap-4 bg-surface p-6 sm:p-8"
            >
              <div className="card-spotlight" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-eyebrow text-fg-faint">
                  {OnDevice ? <Cpu className="h-3.5 w-3.5" /> : <Cloud className="h-3.5 w-3.5" />}
                  {meta.badge}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-medium tracking-tight text-fg">{meta.name}</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{meta.tagline}</p>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {meta.specs.map((s) => (
                  <span
                    key={s}
                    className="rounded-pill border border-line px-2.5 py-1 font-mono text-[11px] text-fg-muted"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
