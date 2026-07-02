"use client";

// React binding for the BYOK key store. Uses useSyncExternalStore so components
// re-render when a key is saved/removed (via subscribeByok). The server snapshot
// is always null so SSR never sees a key.

import { useSyncExternalStore } from "react";
import { getByokKey, subscribeByok, type ByokProvider } from "@/app/lib/tts/byok";

/** Returns the current key for a provider, or null. Reactive to set/clear. */
export function useByokKey(provider: ByokProvider): string | null {
  return useSyncExternalStore(
    subscribeByok,
    () => getByokKey(provider),
    () => null
  );
}
