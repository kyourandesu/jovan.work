import { Highlighter, ScrollText, Download, Ear, ShieldCheck, Gauge } from "lucide-react";
import { RevealGroup, RevealItem } from "@/app/components/primitives";
import SectionIntro from "./SectionIntro";

const FEATURES = [
  {
    icon: Highlighter,
    title: "Word-by-word highlighting",
    body: "Follow along as each word lights up in sync with playback. Kokoro gives true per-word timing; other engines are aligned automatically.",
  },
  {
    icon: ScrollText,
    title: "Long-form, done for you",
    body: "Paste an article or a whole chapter. Text is split intelligently, voiced part-by-part, and stitched into one seamless track.",
  },
  {
    icon: Ear,
    title: "Test before you commit",
    body: "Preview any voice with a quick sample before generating the final render — no wasted time, no guesswork.",
  },
  {
    icon: Download,
    title: "Download WAV or MP3",
    body: "Export a lossless WAV or a compact MP3 in a click. Everything is encoded locally in your browser.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "On-device voices never send your text anywhere. Models download once, then run fully offline.",
  },
  {
    icon: Gauge,
    title: "Fast & GPU-accelerated",
    body: "WebGPU is used when available and falls back to WASM everywhere else, so it runs on any modern browser.",
  },
];

export default function Features() {
  return (
    <section className="container-x py-[var(--spacing-section)]">
      <SectionIntro eyebrow="02 — FEATURES" title="Everything you need to make a voice.">
        A focused set of tools that do the fiddly parts for you — chunking, alignment, encoding — so
        you can just write and listen.
      </SectionIntro>

      <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <RevealItem
            key={f.title}
            as="article"
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-button bg-accent-weak text-accent">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="text-[17px] font-medium tracking-tight text-fg">{f.title}</h3>
            <p className="text-sm leading-relaxed text-fg-muted">{f.body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
