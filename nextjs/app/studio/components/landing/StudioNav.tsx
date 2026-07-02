"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { AudioLines, ArrowUpRight } from "lucide-react";

export default function StudioNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-premium",
        scrolled ? "border-b border-line bg-ink/80 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/studio" className="group flex items-center gap-2 text-[15px] font-medium text-fg">
          <AudioLines className="h-4.5 w-4.5 text-accent" />
          Voice Studio
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/studio#how"
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-0.5 text-sm text-fg-muted transition-colors hover:text-fg sm:inline-flex"
          >
            jovan.work
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/studio/app"
            className="inline-flex h-9 items-center justify-center rounded-button bg-accent px-4 text-sm font-medium text-white transition-[transform,filter] duration-150 ease-premium hover:-translate-y-px hover:brightness-110"
          >
            Open studio
          </Link>
        </div>
      </nav>
    </header>
  );
}
