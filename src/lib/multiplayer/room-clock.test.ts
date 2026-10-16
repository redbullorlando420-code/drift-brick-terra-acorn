import assert from "node:assert/strict";
import test from "node:test";
import { clampRoomPosition, estimatedProviderPosition, normalizeGuestOffset, guestPlaybackPosition, hostPlaybackPosition } from "./room-clock.ts";

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

test("guest timing is bounded, quarter-second precise and handles invalid saved settings", () => {
  assert.equal(normalizeGuestOffset(0.3),0.25);
  assert.equal(normalizeGuestOffset(-0.8),-0.75);
  assert.equal(normalizeGuestOffset(100),30);
  assert.equal(normalizeGuestOffset(-100),-30);
  assert.equal(normalizeGuestOffset(NaN),0);
  assert.equal(normalizeGuestOffset(Infinity),0);
});

test("device playback advances or delays without changing the canonical room clock", () => {
  const host=120;
  assert.equal(guestPlaybackPosition(host,2.5,300),122.5);
  assert.equal(guestPlaybackPosition(host,-2.5,300),117.5);
  assert.equal(hostPlaybackPosition(122.5,2.5,300),host);
  assert.equal(hostPlaybackPosition(117.5,-2.5,300),host);
  assert.equal(guestPlaybackPosition(1,-2.5,30),0);
  assert.equal(guestPlaybackPosition(29,2.5,30),30);
  assert.equal(hostPlaybackPosition(1,2.5,30),0);
  assert.equal(host,120);
});
