// Off-main-thread MP3 encoding so long exports don't freeze the UI.

import { encodeMp3 } from "../mp3";

export interface Mp3Request {
  audio: Float32Array;
  sampleRate: number;
  bitrateKbps?: number;
}

self.onmessage = (e: MessageEvent<Mp3Request>) => {
  const { audio, sampleRate, bitrateKbps } = e.data;
  try {
    const bytes = encodeMp3(audio, sampleRate, bitrateKbps ?? 128);
    // Transfer the buffer to avoid a copy.
    (self as unknown as Worker).postMessage({ ok: true, bytes }, [bytes.buffer]);
  } catch (err) {
    (self as unknown as Worker).postMessage({ ok: false, error: String(err) });
  }
};
