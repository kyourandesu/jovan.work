import { Reveal, PrimaryButton, GhostButton } from "@/app/components/primitives";

export default function FinalCTA() {
  return (
    <section className="container-x py-[var(--spacing-section)]">
      <Reveal>
        <figure className="mx-auto mb-16 max-w-3xl text-center">
          <blockquote className="font-serif text-2xl italic leading-relaxed text-fg sm:text-[28px]">
            &ldquo;The best interface for speech is the one that gets out of the way — type, listen,
            and watch the words come alive.&rdquo;
          </blockquote>
        </figure>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="relative overflow-hidden rounded-xl border border-line bg-surface-2 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="text-h2 max-w-2xl text-balance">Ready to give your words a voice?</h2>
            <p className="max-w-xl text-fg-muted">
              Open the studio, pick a voice, and hear your first sentence in seconds — all in your browser.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton href="/studio/app">Open the studio →</PrimaryButton>
              <GhostButton href="#engines">Compare engines</GhostButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
