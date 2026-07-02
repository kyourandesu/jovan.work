// Float PCM -> MP3 via lamejs. Pure (no DOM), so it runs on the main thread or a worker.

import { Mp3Encoder } from "@breezystack/lamejs";
import { floatToInt16 } from "./wav";

const BLOCK = 1152; // one MP3 frame

export function encodeMp3(
  samples: Float32Array,
  sampleRate: number,
  bitrateKbps = 128
): Uint8Array<ArrayBuffer> {
  const pcm = floatToInt16(samples);
  const encoder = new Mp3Encoder(1, sampleRate, bitrateKbps);
  const parts: Uint8Array[] = [];

  for (let i = 0; i < pcm.length; i += BLOCK) {
    const frame = pcm.subarray(i, i + BLOCK);
    const buf = encoder.encodeBuffer(frame);
    if (buf.length > 0) parts.push(new Uint8Array(buf));
  }
  const tail = encoder.flush();
  if (tail.length > 0) parts.push(new Uint8Array(tail));

  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

export function encodeMp3Blob(samples: Float32Array, sampleRate: number, bitrateKbps = 128): Blob {
  return new Blob([encodeMp3(samples, sampleRate, bitrateKbps)], { type: "audio/mpeg" });
}
