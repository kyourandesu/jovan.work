// Bring-your-own-key store for the cloud TTS engines. When a key is present the
// browser talks to the provider directly — the key is kept only in this browser
// (local- or sessionStorage) and never reaches this site's server. All access is
// SSR-safe and wrapped in try/catch; keys are never logged.

export type ByokProvider = "openai" | "gemini";

const STORAGE_KEY: Record<ByokProvider, string> = {
  openai: "studio:byok:openai",
  gemini: "studio:byok:gemini",
};

const PROVIDER_LABEL: Record<ByokProvider, string> = {
  openai: "OpenAI",
  gemini: "Gemini",
};

export function providerLabel(provider: ByokProvider): string {
  return PROVIDER_LABEL[provider];
}

// --- storage ---------------------------------------------------------------

function stores(): Array<Storage> | null {
  if (typeof window === "undefined") return null;
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return null;
  }
}

export function getByokKey(provider: ByokProvider): string | null {
  const all = stores();
  if (!all) return null;
  const key = STORAGE_KEY[provider];
  for (const store of all) {
    try {
      const value = store.getItem(key);
      if (value) return value;
    } catch {
      // ignore — storage unavailable
    }
  }
  return null;
}

export function setByokKey(provider: ByokProvider, key: string, remember: boolean): void {
  const all = stores();
  if (!all) return;
  const trimmed = key.trim();
  if (!trimmed) {
    clearByokKey(provider);
    return;
  }
  const storageKey = STORAGE_KEY[provider];
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  try {
    target.setItem(storageKey, trimmed);
  } catch {
    // ignore — storage unavailable
  }
  try {
    other.removeItem(storageKey);
  } catch {
    // ignore
  }
  notify();
}

export function clearByokKey(provider: ByokProvider): void {
  const all = stores();
  if (!all) return;
  const storageKey = STORAGE_KEY[provider];
  for (const store of all) {
    try {
      store.removeItem(storageKey);
    } catch {
      // ignore
    }
  }
  notify();
}

// --- subscription ----------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeByok(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

// --- validation ------------------------------------------------------------

/** Soft, non-blocking format check used only to nudge the user in the dialog. */
export function looksLikeKey(provider: ByokProvider, key: string): boolean {
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (provider === "openai") return trimmed.startsWith("sk-");
  return trimmed.startsWith("AIza");
}

// --- direct-call error mapping ---------------------------------------------

/**
 * Map a failed direct-to-provider response to a user-safe message. Never
 * includes the key or the raw response body.
 */
export function byokErrorMessage(provider: ByokProvider, status: number): string {
  const label = PROVIDER_LABEL[provider];
  if (status === 401 || status === 403) {
    return `Your ${label} API key was rejected — check it in the key settings.`;
  }
  if (status === 429) {
    return `Your ${label} account hit a rate limit — try again shortly.`;
  }
  return `${label} request failed (${status}).`;
}
