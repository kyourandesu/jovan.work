// Shared helper for cloud engines: POST text to our proxy route, get back WAV bytes.
// Keys live only on the server; the browser never sees them.

import { decodeToMono } from "./wav";
import type { OnProgress, SynthResult } from "./types";

export class CloudTTSError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "CloudTTSError";
  }
}

export async function synthesizeViaRoute(
  endpoint: string,
  body: Record<string, unknown>,
  onProgress?: OnProgress,
  signal?: AbortSignal
): Promise<SynthResult> {
  onProgress?.({ phase: "synth", value: -1, label: "Contacting model…" });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) message = j.error;
    } catch {
      /* non-JSON body */
    }
    if (res.status === 429) message = "Rate limit reached. Please wait a moment and try again.";
    if (res.status === 413) message = "Text is too long for the cloud voice. Shorten it or use an on-device engine.";
    if (res.status === 503) message = "This cloud voice isn't configured on the server.";
    throw new CloudTTSError(res.status, message);
  }

  const buffer = await res.arrayBuffer();
  const { audio, sampleRate } = await decodeToMono(buffer);
  return { audio, sampleRate };
}
