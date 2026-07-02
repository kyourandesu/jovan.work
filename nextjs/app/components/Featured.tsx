import { Eyebrow, Reveal, ArrowLink } from "./primitives";
import { CASE_STUDY, QUOTE } from "../lib/content";

export default function Featured() {
  return (
    <section className="border-b border-line-2 py-[var(--spacing-section)]">
      <div className="container-x">
        <Reveal>
          <div className="grid border border-line-2 md:grid-cols-2">
            {/* Case study */}
            <article className="relative overflow-hidden border-b border-line p-8 md:border-b-0 md:border-r md:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-weak blur-[80px]"
              />
              <div className="relative">
                <Eyebrow className="mb-6">{CASE_STUDY.eyebrow}</Eyebrow>
                <p className="font-mono text-sm uppercase tracking-[0.14em] text-accent">
                  {CASE_STUDY.client}
                </p>
                <h2 className="mt-4 text-2xl font-medium leading-snug tracking-tight text-fg md:text-[1.75rem]">
                  {CASE_STUDY.headline}
                </h2>
                <p className="mt-5 leading-relaxed text-fg-muted">
                  {CASE_STUDY.body}
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {CASE_STUDY.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-pill border border-line px-3 py-1 font-mono text-xs text-fg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-7">
                  <ArrowLink href={CASE_STUDY.link.href} external>
                    {CASE_STUDY.link.label}
                  </ArrowLink>
                </div>
              </div>
            </article>

            {/* Pull-quote */}
            <div className="flex flex-col justify-center p-8 md:p-12">
              <span
                aria-hidden="true"
                className="font-serif text-5xl leading-none text-accent"
              >
                &ldquo;
              </span>
              <blockquote className="mt-3 font-serif text-xl italic leading-relaxed text-fg md:text-2xl">
                {QUOTE.text}
              </blockquote>
              <footer className="mt-7">
                <p className="font-medium text-fg">{QUOTE.author}</p>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-fg-faint">
                  {QUOTE.role}
                </p>
              </footer>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
