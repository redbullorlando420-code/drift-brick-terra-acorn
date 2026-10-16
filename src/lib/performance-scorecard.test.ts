import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPerformanceScorecard, type ScorecardInput } from './performance-scorecard.ts';
const healthy = (): ScorecardInput => ({ now: 100_000, homeReadyMs: 800, interactions: { search: { count: 1, lastMs: 20, at: 99_900 } },
  frames: { sampledFrames: 240, recentLongFrames: 1, recentWorstFrameMs: 40, sampledAt: 99_900, mountedCards: 0, lastActiveCards: 40 },
  artwork: { bytes: 100, byteLimit: 1000, entries: 10, entryLimit: 72 }, viewer: { estimatedBytes: 100, maxBytes: 1000 }, diskErrors: 0, lowMemory: true });
test('missing and stale measurements cannot produce a healthy scorecard', () => {
  assert.equal(buildPerformanceScorecard(healthy()).health, 'healthy');
  assert.equal(buildPerformanceScorecard({ ...healthy(), homeReadyMs: undefined }).health, 'unmeasured');
  const stale = healthy(); stale.frames.sampledAt = 1; stale.interactions.search.at = 1;
  const result = buildPerformanceScorecard(stale);
  assert.equal(result.checks.find(row => row.id === 'frames')?.health, 'unmeasured');
  assert.equal(result.checks.find(row => row.id === 'input')?.health, 'unmeasured');
});
test('remediation prioritizes bounded cache pressure and respects current low-memory mode', () => {
  const input = healthy(); input.artwork.bytes = 1100; input.interactions.search.lastMs = 220;
  assert.match(buildPerformanceScorecard(input).next, /Keep Low-memory/);
  input.lowMemory = false; assert.match(buildPerformanceScorecard(input).next, /Try Low-memory/);
  input.artwork.bytes = 100; assert.match(buildPerformanceScorecard(input).next, /Pause pulling/);
  assert.match(buildPerformanceScorecard({ ...input, pullsPaused: true }).next, /Pulling is paused/);
  input.interactions.search.lastMs = 20; input.frames.recentLongFrames = 60;
  assert.match(buildPerformanceScorecard(input).next, /Text-first/);
});
