import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextRemoteRefresh, scheduledYoutubeSources } from '../src/lib/remote/background-refresh.ts';

const turns = () => [
  { lane: 'youtube-archive', lastAttemptAt: 0, intervalMs: 300_000, eligible: true },
  { lane: 'twitch', lastAttemptAt: 0, intervalMs: 60_000, eligible: true },
  { lane: 'youtube-feed', lastAttemptAt: 0, intervalMs: 300_000, eligible: true },
  { lane: 'youtube-live', lastAttemptAt: 0, intervalMs: 60_000, eligible: true },
];
test('one background owner gives archive, Twitch, feeds and live checks their initial turns', () => {
  const pending = turns(), visited = [];
  let now = 1_000_000;
  for (let i = 0; i < 4; i++) {
    const lane = nextRemoteRefresh(pending, now);
    visited.push(lane); pending.find(turn => turn.lane === lane).lastAttemptAt = now; now += 5000;
  }
  assert.deepEqual(visited, ['youtube-archive', 'twitch', 'youtube-feed', 'youtube-live']);
  assert.equal(nextRemoteRefresh(pending, now), null);
});
test('cooling YouTube does not stop Twitch and archive gets the recovery probe ahead of stale live checks', () => {
  const pending = turns();
  pending.forEach(turn => { turn.eligible = turn.lane === 'twitch'; });
  assert.equal(nextRemoteRefresh(pending, 1_000_000), 'twitch');
  pending[1].lastAttemptAt = 1_000_000;
  pending[0].eligible = true; pending[0].recovery = true; pending[0].lastAttemptAt = 600_000;
  pending[3].eligible = true; pending[3].lastAttemptAt = 100_000;
  assert.equal(nextRemoteRefresh(pending, 1_005_000), 'youtube-archive');
});
test('skips retain their due turn and slower archive jobs cannot starve every other lane', () => {
  const pending = turns();
  assert.equal(nextRemoteRefresh(pending, 1_000_000), nextRemoteRefresh(pending, 1_015_000));
  pending[0].lastAttemptAt = 1_000_000;
  assert.equal(nextRemoteRefresh(pending, 1_500_000), 'twitch');
  pending[1].lastAttemptAt = 1_500_000;
  assert.equal(nextRemoteRefresh(pending, 1_500_000), 'youtube-feed');
});
test('scheduled creator batches respect source caps and slow pacing while allowing gradual growth', () => {
  assert.equal(scheduledYoutubeSources(32, 1500), 4);
  assert.equal(scheduledYoutubeSources(2, 1500), 2);
  assert.equal(scheduledYoutubeSources(32, 60_000), 1);
});

test('visible idle pages retain archives and recent feeds while live/Twitch checks rest', () => {
  const pending = turns();
  assert.equal(nextRemoteRefresh(pending, 1_000_000, false), 'youtube-archive');
  pending[0].lastAttemptAt = 1_000_000;
  assert.equal(nextRemoteRefresh(pending, 1_100_000, false), 'youtube-feed');
  pending[2].lastAttemptAt = 1_100_000;
  assert.equal(nextRemoteRefresh(pending, 1_300_000, false), 'youtube-archive');
  pending[0].eligible = false;
  pending[2].eligible = false;
  assert.equal(nextRemoteRefresh(pending, 1_900_000, false), null, 'an idle page still honors a provider cooldown');
});
