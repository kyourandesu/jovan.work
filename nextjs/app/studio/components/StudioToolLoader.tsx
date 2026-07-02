"use client";

// Loads the heavy TTS tool client-side only (onnxruntime/wasm must never SSR).

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const StudioTool = dynamic(() => import("./StudioTool"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-72 items-center justify-center gap-2 rounded-xl border border-line bg-surface/50 text-sm text-fg-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading the studio…
    </div>
  ),
});

export default function StudioToolLoader() {
  return <StudioTool />;
}
