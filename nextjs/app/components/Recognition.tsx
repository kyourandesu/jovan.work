import { Eyebrow, Reveal } from "./primitives";
import { RECOGNITION } from "../lib/content";

export default function Recognition() {
  return (
    <section className="border-b border-line-2 py-[var(--spacing-section)]">
      <div className="container-x">
        <Reveal>
          <Eyebrow className="mb-10 text-center">{RECOGNITION.eyebrow}</Eyebrow>
          {/* Ruled wall of competitions / organisations */}
          <ul className="grid grid-cols-2 divide-x divide-y divide-line border border-line-2 md:grid-cols-4 md:divide-y-0">
            {RECOGNITION.orgs.map((org) => (
              <li
                key={org}
                className="flex items-center justify-center px-4 py-8 text-center text-base font-medium tracking-tight text-fg-faint transition-colors duration-300 hover:text-fg-muted md:text-lg"
              >
                {org}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
