type SectionSnapOptions = {
  position: number;
  direction: number;
  delta?: number;
  sectionStarts: number[];
  sectionHeights: number[];
  viewportHeight: number;
  scrollLimit: number;
};

// Only adjacent sections that both fit on screen can snap. Boundaries touching
// taller content stay freely scrollable, including the entry and exit.
export function getSectionSnapTarget({
  position,
  direction,
  delta,
  sectionStarts,
  sectionHeights,
  viewportHeight,
  scrollLimit,
}: SectionSnapOptions): number | null {
  if (!direction || viewportHeight <= 0) return null;

  const indices = Array.from({ length: Math.max(0, sectionStarts.length - 1) }, (_, index) => index);
  if (direction < 0) indices.reverse();

  for (const index of indices) {
    const bothFit = sectionHeights[index] <= viewportHeight + 2 &&
      sectionHeights[index + 1] <= viewportHeight + 2;
    const nextStart = Math.min(sectionStarts[index + 1], scrollLimit);
    const previousEnd = Math.min(
      Math.max(sectionStarts[index], sectionStarts[index + 1] - viewportHeight),
      scrollLimit,
    );

    // Before consuming wheel input, detect the first boundary it would cross.
    // This lets the view hold still before moving, even for a large wheel delta.
    if (delta !== undefined) {
      if (direction > 0 && position < nextStart - 1 && position + delta > previousEnd + 1) return bothFit ? nextStart : null;
      if (direction < 0 && position > previousEnd + 1 && position + delta < nextStart - 1) return bothFit ? previousEnd : null;
      continue;
    }

    // Leave exact boundaries alone, including rounding to physical pixels.
    if (position > previousEnd + 1 && position < nextStart - 1) {
      return bothFit ? (direction > 0 ? nextStart : previousEnd) : null;
    }
  }

  return null;
}
