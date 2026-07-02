// Shared tokenizer so the transcript renderer and the aligner agree on "words".

export interface Token {
  type: "word" | "space";
  text: string;
  /** Index into the word-only sequence; -1 for whitespace tokens. */
  wordIndex: number;
}

export interface Word {
  text: string; // original substring, for display
  norm: string; // normalized, for matching
}

const NORM_STRIP = /[^\p{L}\p{N}]/gu;

export function normalizeWord(w: string): string {
  return w.toLowerCase().replace(NORM_STRIP, "");
}

/** Split into alternating word / whitespace tokens, preserving the original text. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\s+)|(\S+)/g;
  let wordIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m[1] !== undefined) {
      tokens.push({ type: "space", text: m[1], wordIndex: -1 });
    } else {
      tokens.push({ type: "word", text: m[2], wordIndex: wordIndex++ });
    }
  }
  return tokens;
}

/** The word-only sequence (index-aligned to WordTiming[]). */
export function wordList(text: string): Word[] {
  return tokenize(text)
    .filter((t) => t.type === "word")
    .map((t) => ({ text: t.text, norm: normalizeWord(t.text) }));
}
