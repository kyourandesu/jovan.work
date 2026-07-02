// Runs @mintplex-labs/piper-tts-web off the main thread. It returns a WAV Blob
// (22.05 kHz) and caches voice models in OPFS after first download. Loaded from
// CDN because the package's Emscripten glue can't be bundled for the browser.

import { CDN, importFromUrl } from "../cdn";

interface PiperModule {
  predict: (
    cfg: { text: string; voiceId: string },
    onProgress?: (p: { url?: string; total?: number; loaded?: number }) => void
  ) => Promise<Blob>;
  voices: () => Promise<
    Array<{
      key: string;
      name: string;
      language?: { code?: string; name_english?: string };
      quality?: string;
    }>
  >;
}

let mod: PiperModule | null = null;

async function getMod(): Promise<PiperModule> {
  if (mod) return mod;
  const imported = await importFromUrl<PiperModule | { default: PiperModule }>(CDN.piper);
  mod = "predict" in imported ? imported : imported.default;
  return mod;
}

const post = (m: unknown, transfer?: Transferable[]) =>
  (self as unknown as Worker).postMessage(m, transfer ?? []);

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data ?? {};
  try {
    const piper = await getMod();
    if (type === "voices") {
      const raw = await piper.voices();
      const voices = raw.map((v) => ({
        id: v.key,
        label: v.name,
        lang: v.language?.code,
        group: [v.language?.name_english, v.quality].filter(Boolean).join(" · "),
      }));
      post({ type: "voices", voices });
    } else if (type === "synth") {
      const { text, voiceId } = e.data;
      const blob = await piper.predict({ text, voiceId }, (p) => {
        if (p.total)
          post({
            type: "progress",
            phase: "download",
            value: (p.loaded ?? 0) / p.total,
            label: "Downloading Piper voice…",
          });
      });
      const buffer = await blob.arrayBuffer();
      post({ type: "result", buffer }, [buffer]);
    }
  } catch (err) {
    post({ type: "error", error: String(err) });
  }
};
