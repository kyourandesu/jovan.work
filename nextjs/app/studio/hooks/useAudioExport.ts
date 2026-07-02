"use client";

// Builds downloadable WAV (main thread, cheap) and MP3 (worker, heavier) blobs
// from a finished render.

import { useCallback, useEffect, useRef } from "react";
import { encodeWav } from "@/app/lib/tts/wav";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function useAudioExport() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const downloadWav = useCallback(
    (audio: Float32Array, sampleRate: number, name = "speech") => {
      triggerDownload(encodeWav(audio, sampleRate), `${name}.wav`);
    },
    []
  );

  const downloadMp3 = useCallback(
    (audio: Float32Array, sampleRate: number, name = "speech", bitrateKbps = 128) =>
      new Promise<void>((resolve, reject) => {
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL("../../lib/tts/workers/mp3.worker.ts", import.meta.url),
            { type: "module" }
          );
        }
        const worker = workerRef.current;
        const onMessage = (e: MessageEvent) => {
          worker.removeEventListener("message", onMessage);
          if (e.data?.ok) {
            triggerDownload(new Blob([e.data.bytes], { type: "audio/mpeg" }), `${name}.mp3`);
            resolve();
          } else {
            reject(new Error(e.data?.error ?? "MP3 encoding failed"));
          }
        };
        worker.addEventListener("message", onMessage);
        // Copy the buffer since the caller keeps using `audio` for playback.
        const copy = audio.slice();
        worker.postMessage({ audio: copy, sampleRate, bitrateKbps }, [copy.buffer]);
      }),
    []
  );

  return { downloadWav, downloadMp3 };
}
