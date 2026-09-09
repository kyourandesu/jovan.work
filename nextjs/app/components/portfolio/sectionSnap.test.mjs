import assert from "node:assert/strict";
import { test } from "node:test";
import { getSectionSnapTarget } from "./sectionSnap.ts";

const layout = {
  sectionStarts: [0, 800, 1600, 3200, 5600],
  viewportHeight: 800,
  scrollLimit: 5600,
};
const snap = (position, direction, overrides = {}) =>
  getSectionSnapTarget({ ...layout, position, direction, ...overrides });

test("a downward gesture advances to the next section instead of returning to the nearest heading", () => {
  assert.equal(snap(120, 1), 800);
  assert.equal(snap(790, 1), 800);
  assert.equal(snap(920, 1), 1600);
});

test("an upward gesture returns toward the previous section", () => {
  assert.equal(snap(680, -1), 0);
  assert.equal(snap(1480, -1), 800);
});

test("long sections remain freely scrollable while the viewport is inside their content", () => {
  for (const direction of [-1, 1]) {
    assert.equal(snap(1900, direction), null);
    assert.equal(snap(3900, direction), null);
  }
});

test("leaving a long section moves forward; returning reveals its bottom content", () => {
  assert.equal(snap(2500, 1), 3200);
  assert.equal(snap(3080, -1), 2400);
  assert.equal(snap(4950, 1), 5600);
  assert.equal(snap(5480, -1), 4800);
});

test("landing on a boundary does not trigger an extra section jump", () => {
  for (const position of [0, 800, 1600, 2400, 3200, 4800, 5600]) {
    assert.equal(snap(position, 1), null);
    assert.equal(snap(position, -1), null);
  }
});

test("a large gesture uses its actual endpoint without adding wheel distance again", () => {
  assert.equal(snap(1450, 1), 1600);
  assert.equal(snap(2200, 1), null);
});

test("expanded projects and viewport changes use current geometry", () => {
  assert.equal(snap(5100, 1, { sectionStarts: [0, 800, 1600, 3200, 6400], scrollLimit: 6400 }), null);
  assert.equal(snap(2350, 1, { viewportHeight: 900 }), 3200);
});

test("rounding, document limits, and zero input never create extra movement", () => {
  assert.equal(snap(799.6, 1), null);
  assert.equal(snap(800.4, -1), null);
  assert.equal(snap(5700, 1), null);
  assert.equal(snap(700, 0), null);
});

test("the first wheel input selects a transition before the page moves", () => {
  assert.equal(snap(0, 1, { delta: 120 }), 800);
  assert.equal(snap(800, -1, { delta: -120 }), 0);
});

test("a large initial wheel input still selects only the adjacent boundary", () => {
  assert.equal(snap(0, 1, { delta: 2400 }), 800);
  assert.equal(snap(1600, -1, { delta: -2400 }), 800);
});

test("wheel input inside a tall section stays native until it crosses an edge", () => {
  assert.equal(snap(1900, 1, { delta: 120 }), null);
  assert.equal(snap(1900, -1, { delta: -120 }), null);
  assert.equal(snap(2380, 1, { delta: 120 }), 3200);
  assert.equal(snap(1620, -1, { delta: -120 }), 800);
});
