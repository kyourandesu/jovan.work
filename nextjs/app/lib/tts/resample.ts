// Sample-rate conversion via OfflineAudioContext (high quality, browser-native).
// Used to (a) unify chunk rates before concatenation and (b) feed Whisper 16 kHz.

export async function resample(
  input: Float32Array,
  fromRate: number,
  toRate: number
): Promise<Float32Array> {
  if (fromRate === toRate) return input;
  if (input.length === 0) return input;

  const frames = Math.max(1, Math.round((input.length * toRate) / fromRate));
  const OfflineCtx: typeof OfflineAudioContext =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
      .webkitOfflineAudioContext;

  const offline = new OfflineCtx(1, frames, toRate);
  // Source buffers must carry their *original* rate so playback resamples correctly.
  const srcBuffer = offline.createBuffer(1, input.length, fromRate);
  srcBuffer.getChannelData(0).set(input);

  const src = offline.createBufferSource();
  src.buffer = srcBuffer;
  src.connect(offline.destination);
  src.start(0);

  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}

/** Whisper expects 16 kHz mono float. */
export function toWhisperRate(audio: Float32Array, rate: number): Promise<Float32Array> {
  return resample(audio, rate, 16000);
}
