// Split long input into synthesis-sized chunks without cutting mid-sentence.
// Paragraph-first, then sentence, then a hard character fallback for runaway text.

export interface ChunkBudget {
  /** Soft cap per chunk; we pack sentences until adding another would exceed it. */
  maxChars: number;
}

/** Per-engine budgets: cloud is capped tighter (cost), on-device can go long. */
export const CHUNK_BUDGETS: Record<string, ChunkBudget> = {
  kokoro: { maxChars: 500 },
  piper: { maxChars: 600 },
  openai: { maxChars: 1800 },
  gemini: { maxChars: 1800 },
};

const SENTENCE_RE = /[^.!?。！？\n]+[.!?。！？]*\s*/g;

function splitSentences(text: string): string[] {
  const matches = text.match(SENTENCE_RE);
  if (!matches) return text.trim() ? [text.trim()] : [];
  return matches.map((s) => s.trim()).filter(Boolean);
}

/** Hard-split a single over-long unit on word boundaries. */
function hardSplit(unit: string, maxChars: number): string[] {
  if (unit.length <= maxChars) return [unit];
  const words = unit.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > maxChars) {
      out.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function chunkText(text: string, budget: ChunkBudget): string[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const { maxChars } = budget;

  const paragraphs = clean.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = "";
  };

  for (const para of paragraphs) {
    if ((buffer + "\n\n" + para).trim().length <= maxChars) {
      buffer = buffer ? buffer + "\n\n" + para : para;
      continue;
    }
    flush();
    if (para.length <= maxChars) {
      buffer = para;
      continue;
    }
    // Paragraph too big: pack sentences, then hard-split any giant sentence.
    for (const sentence of splitSentences(para)) {
      for (const piece of hardSplit(sentence, maxChars)) {
        if (buffer && (buffer + " " + piece).length > maxChars) flush();
        buffer = buffer ? buffer + " " + piece : piece;
      }
    }
  }
  flush();
  return chunks;
}
