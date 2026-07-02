import type { Metadata } from "next";
import StudioNav from "./components/landing/StudioNav";

export const metadata: Metadata = {
  title: {
    default: "Voice Studio — On-device & cloud text-to-speech",
    template: "%s · Voice Studio",
  },
  description:
    "Turn text into natural speech right in your browser. Kokoro and Piper run on your device; OpenAI and Gemini add cloud voices. Word-by-word highlighting, long-form audio, and WAV/MP3 download.",
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#studio-main" className="skip-link">
        Skip to content
      </a>
      <StudioNav />
      <main id="studio-main">{children}</main>
    </>
  );
}
