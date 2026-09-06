import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeRemoteRefresh } from '../src/lib/videos/remote-merge.ts';
const video = (id, folderId = 'tw:creator', live = false) => ({ id, folderId, name: id, remote: { kind: 'twitch', live } });
test('a failed or unrequested channel keeps its cached catalog', () => {
  const old = [video('saved'), video('other', 'tw:other')];
  assert.deepEqual(mergeRemoteRefresh(old, [], [], new Set()), old);
});
test('saved Twitch entries survive a shorter successful refresh', () => {
  const old = [video('liked'), video('favorite'), video('expired')];
  const result = mergeRemoteRefresh(old, [video('new')], ['tw:creator'], new Set(['liked', 'favorite']));
  assert.deepEqual(result.map(v => v.id), ['liked', 'favorite', 'new']);
});
test('a saved channel stops appearing live when a successful check finds it offline', () => {
  const result = mergeRemoteRefresh([video('live', 'tw:creator', true)], [], ['tw:creator'], new Set(['live']));
  assert.equal(result[0].remote.live, false);
});
test('fresh metadata wins without duplicating a saved card', () => {
  const fresh = { ...video('favorite'), name: 'Updated title' };
  assert.deepEqual(mergeRemoteRefresh([video('favorite')], [fresh, fresh], ['tw:creator'], new Set(['favorite'])), [fresh]);
});
