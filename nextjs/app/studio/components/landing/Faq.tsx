import { Plus } from "lucide-react";
import { Reveal } from "@/app/components/primitives";
import SectionIntro from "./SectionIntro";

const FAQS = [
  {
    q: "Does my text get sent to a server?",
    a: "Not for the on-device engines (Kokoro and Piper) — they run entirely in your browser, so nothing leaves your device. The cloud engines (OpenAI and Gemini) send your text to their APIs to synthesize the audio.",
  },
  {
    q: "Do I need an API key?",
    a: "No. On-device voices need nothing at all. The cloud voices are provided for you with fair-use rate limits, so you can try them without any setup.",
  },
  {
    q: "How does the word highlighting work?",
    a: "Kokoro reports the exact timing of every word, so highlighting is frame-accurate. For the other engines, a small speech-recognition model aligns the audio to your text right in the browser to produce timings.",
  },
  {
    q: "How long can the text be?",
    a: "On-device engines can handle very long text — it's split into parts, voiced, and stitched together. Cloud voices are capped per request to keep them free and fair for everyone.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern browser. WebGPU is used for speed when available (recent Chrome/Edge on desktop); otherwise it falls back to WebAssembly, which works everywhere.",
  },
  {
    q: "The first generation is slow — why?",
    a: "The model weights download once on first use (tens to a few hundred MB depending on the engine), then they're cached. Every generation after that is much faster.",
  },
];

export default function Faq() {
  return (
    <section className="container-x py-[var(--spacing-section)]">
      <SectionIntro eyebrow="FAQ" title="Good questions, answered." />
      <div className="mx-auto mt-12 max-w-3xl divide-y divide-line border-y border-line">
        {FAQS.map((item) => (
          <Reveal key={item.q}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left">
                <span className="text-[17px] font-medium text-fg">{item.q}</span>
                <Plus className="h-4 w-4 shrink-0 text-fg-faint transition-transform duration-300 ease-premium group-open:rotate-45" />
              </summary>
              <p className="pb-5 text-fg-muted">{item.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
