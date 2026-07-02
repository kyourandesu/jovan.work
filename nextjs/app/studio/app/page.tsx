import type { Metadata } from "next";
import { Eyebrow } from "@/app/components/primitives";
import StudioToolLoader from "../components/StudioToolLoader";

export const metadata: Metadata = {
  title: "Studio",
  description: "Generate speech in your browser — pick a voice, preview it, then render with word-by-word highlighting and download as WAV or MP3.",
};

export default function StudioAppPage() {
  return (
    <section className="container-x pb-[var(--spacing-section)] pt-28 sm:pt-32">
      <header className="mb-8 flex flex-col gap-3">
        <Eyebrow>THE STUDIO</Eyebrow>
        <h1 className="text-h2 max-w-2xl">Type it. Hear it. Watch every word.</h1>
        <p className="max-w-2xl text-fg-muted">
          Choose an engine and voice, preview until it feels right, then generate. On-device models
          never leave your browser. Long text is handled automatically; download the result as WAV or MP3.
        </p>
      </header>
      <StudioToolLoader />
    </section>
  );
}
