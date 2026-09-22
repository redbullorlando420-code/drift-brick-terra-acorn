import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasFreshTwitchLiveState, liveDeskRows, filterLiveRows } from '../src/lib/videos/live-desk.ts';
const video = (id, kind, extra = {}) => ({ id, name: id, remote: { kind, live: true, ...extra } });
test('new Twitch observations survive refresh between clock ticks while stale/unknown state is excluded', () => {
  assert.equal(hasFreshTwitchLiveState(video('t', 'twitch', { observedAt: 120_000 }), 121_000, 120_000), true);
  assert.equal(hasFreshTwitchLiveState(video('t', 'twitch', { observedAt: 123_000 }), 121_000, 120_000), true);
  assert.equal(hasFreshTwitchLiveState(video('t', 'twitch', { observedAt: 1 }), 121_000, 120_000), false);
  assert.equal(hasFreshTwitchLiveState(video('t', 'twitch'), 121_000, 120_000), false);
  assert.equal(hasFreshTwitchLiveState(video('t', 'twitch', { observedAt: 200_000 }), 121_000, 120_000), false);
});
test('live sources deduplicate, exclude offline cards, and search the full adult catalog before paging', () => {
  const twitch = video('t', 'twitch');
  const adults = Array.from({length: 100}, (_, i) => video(`room-${i}`, i % 2 ? 'myfreecams' : 'chaturbate'));
  const rows = liveDeskRows([twitch, video('offline', 'youtube', { live: false }), adults[0]], adults);
  assert.equal(rows.length, 101);
  const options = { source: 'myfreecams', filter: 'all', search: 'room-99', sort: 'name', favorites: {}, likes: {} };
  assert.deepEqual(filterLiveRows(rows, options).map(v => v.id), ['room-99']);
  assert.equal(filterLiveRows(rows, { ...options, source: 'twitch', search: '' })[0], twitch);
  assert.equal(filterLiveRows(rows, { ...options, filter: 'favorites' }).length, 0);
  assert.equal(filterLiveRows(rows, { ...options, filter: 'likes', likes: { 'room-99': true } }).length, 1);
});
