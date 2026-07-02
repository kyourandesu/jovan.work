import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Cross-origin isolation enables multi-threaded WASM / SharedArrayBuffer for
    // on-device inference. Scoped to /studio* so the portfolio is unaffected.
    // `credentialless` keeps cross-origin model (Hugging Face CDN) fetches and
    // images working without requiring CORP headers on every resource.
    return [
      {
        source: "/studio/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
