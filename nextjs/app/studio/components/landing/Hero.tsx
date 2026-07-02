import { Eyebrow, PrimaryButton, GhostButton } from "@/app/components/primitives";
import { Reveal } from "@/app/components/primitives";

const CHIPS = ["Kokoro", "Piper", "OpenAI", "Gemini"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x flex flex-col items-start gap-7 pb-[var(--spacing-section)] pt-36 sm:pt-44">
        <Reveal>
          <Eyebrow>ON-DEVICE + CLOUD TEXT-TO-SPEECH</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="text-display max-w-4xl text-balance">
            Turn any text into a voice — right in your browser.
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">
            Lightweight neural models run entirely on your device — private and free. Add expressive
            cloud voices when you want them. Preview before you commit, generate long-form audio, and
            watch every word light up as it&rsquo;s spoken.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton href="/studio/app">Open the studio →</PrimaryButton>
            <GhostButton href="#how">See how it works</GhostButton>
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-eyebrow text-fg-faint">Powered by</span>
            {CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-pill border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted"
              >
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
      <div className="dot-band" aria-hidden="true" />
    </section>
  );
}
