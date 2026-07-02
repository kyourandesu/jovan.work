import { RevealGroup, RevealItem } from "@/app/components/primitives";
import SectionIntro from "./SectionIntro";

const STEPS = [
  { n: "01", title: "Choose an engine", body: "On-device Kokoro or Piper, or cloud OpenAI / Gemini." },
  { n: "02", title: "Pick & preview a voice", body: "Audition voices with a one-line sample until one clicks." },
  { n: "03", title: "Paste your text", body: "A sentence or a whole article — long input is handled for you." },
  { n: "04", title: "Generate", body: "Watch progress as the model loads, synthesizes, and aligns." },
  { n: "05", title: "Follow & download", body: "Words highlight as it plays; export WAV or MP3 when happy." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="container-x py-[var(--spacing-section)]">
      <SectionIntro eyebrow="03 — HOW IT WORKS" title="From blank page to voiced audio in five steps.">
        No setup, no accounts, no API keys to paste. Open the studio and go.
      </SectionIntro>

      <RevealGroup className="mt-14 overflow-hidden rounded-card border border-line">
        {STEPS.map((s, i) => (
          <RevealItem
            key={s.n}
            className={`flex flex-col gap-1 bg-surface p-6 sm:flex-row sm:items-baseline sm:gap-8 sm:p-7 ${
              i > 0 ? "border-t border-line" : ""
            }`}
          >
            <span className="font-mono text-sm text-accent">{s.n}</span>
            <h3 className="w-full max-w-xs text-lg font-medium tracking-tight text-fg">{s.title}</h3>
            <p className="text-sm leading-relaxed text-fg-muted">{s.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
