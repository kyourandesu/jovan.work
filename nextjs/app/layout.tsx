import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import InteractiveBackground from "./components/InteractiveBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400"], // only 400 (normal + italic) is rendered
});

export const metadata: Metadata = {
  title: "Jovan Tan — Developer · Applied AI & Analytics",
  description:
    "Jovan Tan is a developer turning complex AI and data into products people actually use — from reinforcement-learning agents to an EdTech platform serving 1,000+ users.",
  metadataBase: new URL("https://jovan.work"),
  openGraph: {
    title: "Jovan Tan — Developer · Applied AI & Analytics",
    description:
      "A developer turning complex AI and data into products people actually use.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${newsreader.variable}`}
    >
      <body className="bg-ink text-fg antialiased">
        {/* Page-level interactive dot-grid — shows through the gaps between sections */}
        <InteractiveBackground variant="grid" className="fixed inset-0 -z-10" />
        <SmoothScroll>{children}</SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
