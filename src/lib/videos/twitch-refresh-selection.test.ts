import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectTwitchRefreshBatch } from './twitch-refresh-selection.ts';

test('scheduled Twitch batches rotate fairly across a large follow list', () => {
  const channels = Array.from({ length: 588 }, (_, index) => ({
    id: `tw:${index}`,
    kind: 'twitch' as const,
    handle: `creator${index}`,
    title: `Creator ${index}`,
    channelId: `provider-${index}`,
    lastCheckedAt: 1,
  }));
  const first = selectTwitchRefreshBatch(channels, 12, 0);
  const second = selectTwitchRefreshBatch(channels, 12, first.nextCursor);
  assert.equal(first.channels.length, 12);
  assert.equal(second.channels.length, 12);
  assert.equal(new Set([...first.channels, ...second.channels].map(channel => channel.id)).size, 24);
  assert.equal(second.channels[0].id, 'tw:12');
});

test('newly imported Twitch stubs get seeded before already-checked creators', () => {
  const channels = [
    { id: 'tw:known', kind: 'twitch' as const, handle: 'known', title: 'Known', channelId: 'provider-known', lastCheckedAt: 1 },
    { id: 'tw:new', kind: 'twitch' as const, handle: 'new', title: 'New' },
  ];
  const batch = selectTwitchRefreshBatch(channels, 1, 0);
  assert.deepEqual(batch.channels.map(channel => channel.id), ['tw:new']);
});
