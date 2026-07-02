import { Eyebrow, Reveal } from "@/app/components/primitives";

// Centered eyebrow + tight heading + one muted paragraph — the signature intro.
export default function SectionIntro({
  eyebrow,
  title,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div
      className={clsxAlign(centered)}
    >
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="text-h2 text-balance">{title}</h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <p className="max-w-[640px] text-fg-muted">{children}</p>
        </Reveal>
      )}
    </div>
  );
}

function clsxAlign(centered: boolean) {
  return centered
    ? "mx-auto flex max-w-2xl flex-col items-center gap-4 text-center"
    : "flex flex-col items-start gap-4 text-left";
}
