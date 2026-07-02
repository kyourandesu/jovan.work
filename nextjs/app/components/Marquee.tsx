import { STACK } from "../lib/content";
import { Eyebrow } from "./primitives";

export default function Marquee() {
  return (
    <section className="border-b border-line-2 py-[var(--spacing-section)]">
      <div className="container-x">
        <Eyebrow className="mb-10 text-center">Built with</Eyebrow>

        {/* Ruled wall — bordered cells with hairline dividers */}
        <ul className="grid grid-cols-2 divide-x divide-y divide-line border border-line-2 sm:grid-cols-3 lg:grid-cols-7">
          {STACK.map((tech) => (
            <li
              key={tech}
              className="flex items-center justify-center px-3 py-6 text-center text-sm font-medium tracking-tight text-fg-faint transition-colors duration-300 hover:text-fg-muted md:text-base"
            >
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
