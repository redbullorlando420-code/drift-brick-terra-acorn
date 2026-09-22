import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeRemoteRefresh } from '../src/lib/videos/remote-merge.ts';
const video = (id, folderId = 'tw:creator', live = false) => ({ id, folderId, name: id, remote: { kind: 'twitch', live } });
test('a failed or unrequested channel keeps its cached catalog', () => {
  const old = [video('saved'), video('other', 'tw:other')];
  assert.deepEqual(mergeRemoteRefresh(old, [], [], new Set()), old);
});
test('Twitch VOD history survives a shorter successful refresh', () => {
  const old = [video('liked'), video('favorite'), video('expired')];
  const result = mergeRemoteRefresh(old, [video('new')], ['tw:creator'], new Set(['liked', 'favorite']));
  assert.deepEqual(result.map(v => v.id), ['liked', 'favorite', 'expired', 'new']);
});
test('a saved channel stops appearing live when a successful check finds it offline', () => {
  const result = mergeRemoteRefresh([video('live', 'tw:creator', true)], [], ['tw:creator'], new Set(['live']));
  assert.equal(result[0].remote.live, false);
});
test('fresh metadata wins without duplicating a saved card', () => {
  const fresh = { ...video('favorite'), name: 'Updated title' };
  assert.deepEqual(mergeRemoteRefresh([video('favorite')], [fresh, fresh], ['tw:creator'], new Set(['favorite'])), [fresh]);
});

test('an unchanged refresh returns the original array and card identity', () => {
  const old = [{ ...video('stable'), poster: 'poster.jpg', description: 'cached description', remote: { kind: 'twitch', live: false, channelName: 'Creator', observedAt: 1 } }];
  const repeated = [{ ...old[0], remote: { ...old[0].remote } }];
  const result = mergeRemoteRefresh(old, repeated, ['tw:creator'], new Set());
  assert.equal(result, old);
  assert.equal(result[0], old[0]);
});

test('a changed provider row replaces only that card and keeps existing order', () => {
  const old = [video('first'), video('changed'), video('last')];
  const incoming = [
    { ...old[0], remote: { ...old[0].remote } },
    { ...old[1], name: 'Changed title', remote: { ...old[1].remote } },
    { ...old[2], remote: { ...old[2].remote } },
  ];
  const result = mergeRemoteRefresh(old, incoming, ['tw:creator'], new Set());
  assert.deepEqual(result.map((row) => row.id), ['first', 'changed', 'last']);
  assert.equal(result[0], old[0]);
  assert.equal(result[1], incoming[1]);
  assert.equal(result[2], old[2]);
});

test('a shallow response retains on-demand comments and a repaired creator name', () => {
  const old = [{ ...video('detailed'), remote: { kind: 'twitch', live: false, channelName: 'Verified Creator', comments: [{ id: 'comment-1', body: 'Kept locally' }] } }];
  const incoming = [{ ...video('detailed'), remote: { kind: 'twitch', live: false } }];
  const result = mergeRemoteRefresh(old, incoming, ['tw:creator'], new Set());
  assert.equal(result[0], old[0]);
  assert.equal(result[0].remote.channelName, 'Verified Creator');
  assert.equal(result[0].remote.comments, old[0].remote.comments);
});
