import assert from "node:assert/strict";
import test from "node:test";
import { clampRoomPosition, estimatedProviderPosition } from "./room-clock.ts";

test("repeated provider pause events hold the captured position", () => {
  const now = 1_790_563_453_121;
  const position = 219 * 60 + 54;
  const startedAt = now - position * 1000;
  assert.equal(estimatedProviderPosition(position, position, startedAt, now), position);
  assert.equal(estimatedProviderPosition(position, position, null, now + 1000), position);
});

test("seeks accept zero and stop at the exact video duration", () => {
  assert.equal(clampRoomPosition(40 - 15, 40), 25);
  assert.equal(clampRoomPosition(5 - 15, 40), 0);
  assert.equal(clampRoomPosition(39 + 15, 40), 40);
  assert.equal(clampRoomPosition(15, 6), 6);
});

test("provider clock advances from its anchor once and respects a known player position", () => {
  const now = 1_790_563_453_121;
  const startedAt = now - 120_000;
  assert.equal(estimatedProviderPosition(120, 120, startedAt, now + 5000), 125);
  assert.equal(estimatedProviderPosition(127, 120, startedAt, now + 5000), 127);
});
