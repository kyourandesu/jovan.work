import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Stats from "./components/Stats";
import Featured from "./components/Featured";
import About from "./components/About";
import Experience from "./components/Experience";
import Projects from "./components/Projects";
import Recognition from "./components/Recognition";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Nav />
      {/* Sections are opaque panels; the page grid shows through the small gaps */}
      <main
        id="main-content"
        className="flex flex-col gap-8 [&>section]:border-b-0 [&>section]:bg-ink"
      >
        <Hero />
        <Marquee />
        <Stats />
        <Featured />
        <About />
        <Experience />
        <Projects />
        <Recognition />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
