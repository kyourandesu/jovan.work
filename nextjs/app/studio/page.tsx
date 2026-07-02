import Link from "next/link";
import Hero from "./components/landing/Hero";
import Engines from "./components/landing/Engines";
import Features from "./components/landing/Features";
import HowItWorks from "./components/landing/HowItWorks";
import Faq from "./components/landing/Faq";
import FinalCTA from "./components/landing/FinalCTA";

export default function StudioLanding() {
  return (
    <>
      <Hero />
      <Engines />
      <Features />
      <HowItWorks />
      <Faq />
      <FinalCTA />

      <footer className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-10 text-sm text-fg-muted sm:flex-row">
          <p>
            Voice Studio — on-device &amp; cloud text-to-speech. Built with Kokoro, Piper, OpenAI &amp; Gemini.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/studio/app" className="text-accent transition-[filter] hover:brightness-110">
              Open studio
            </Link>
            <Link href="/" className="transition-colors hover:text-fg">
              jovan.work
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
