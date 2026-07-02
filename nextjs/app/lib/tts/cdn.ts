// Load an ESM module from a URL at runtime, hidden from the bundler. Several of
// the on-device TTS libraries ship Emscripten/Node glue (e.g. `require("fs")`)
// that Turbopack can't resolve for the browser, so we pull their prebuilt
// browser bundles from a CDN instead. The models/wasm they fetch are cached by
// the browser exactly the same way.

// Using `new Function` keeps the specifier fully opaque to Turbopack/TS so it is
// never statically analyzed or bundled.
// eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
const dynamicImport = new Function("url", "return import(url)") as <T = unknown>(
  url: string
) => Promise<T>;

export function importFromUrl<T = unknown>(url: string): Promise<T> {
  return dynamicImport<T>(url);
}

export const CDN = {
  piper: "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/dist/piper-tts-web.js",
  kokoro: "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js",
  headtts: "https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.3.0/modules/headtts.mjs",
  // The inference worker module. HeadTTS imports this inside a same-origin blob
  // worker (cross-origin module import is allowed via CORS), which avoids the
  // browser's ban on constructing a Worker directly from a cross-origin URL.
  headttsWorker:
    "https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.3.0/modules/worker-tts.mjs",
  // Pronunciation dictionary. HeadTTS defaults this to a relative "../dictionaries"
  // path, which a blob worker's fetch can't resolve — pin it to an absolute CDN URL.
  headttsDictionaries:
    "https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.3.0/dictionaries",
} as const;
