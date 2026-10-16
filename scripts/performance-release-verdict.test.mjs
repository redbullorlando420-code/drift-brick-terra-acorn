import { test } from 'node:test';
import assert from 'node:assert/strict';
import { performanceReleaseVerdict } from './performance-release-verdict.mjs';
const good = { startupMs: 900, navigationMs: 200, scrollSettleMs: 34, inputMs: 30, mountedCards: 40, overflowPixels: 0, errors: [], catalogEntries: 80_000, scorecardVerified: true, exportVerified: true, artworkIdleVerified: true, providerBudgetsVerified: true, youtubeFormatsVerified: true };
test('release gate needs every measurement and rejects over-budget or broken scenarios', () => {
  assert.equal(performanceReleaseVerdict(good).ok, true);
  for (const key of ['startupMs', 'navigationMs', 'scrollSettleMs', 'inputMs', 'mountedCards', 'overflowPixels']) {
    assert.equal(performanceReleaseVerdict({ ...good, [key]: undefined }).ok, false);
    assert.equal(performanceReleaseVerdict({ ...good, [key]: Infinity }).ok, false);
  }
  for (const patch of [{ inputMs: 201 }, { mountedCards: 257 }, { errors: ['Hydration failed'] }, { catalogEntries: 0 }, { exportVerified: false }, { artworkIdleVerified: false }, { providerBudgetsVerified: false }, { youtubeFormatsVerified: false }]) assert.equal(performanceReleaseVerdict({ ...good, ...patch }).ok, false);
});
