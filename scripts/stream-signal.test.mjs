import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_SIGNAL_PROFILE as profile, generateSignalPack, validateSignalProfile, readSignalPack, composeOnX, exportSignalPack, signalOwnerPrefix, SIGNAL_PLATFORMS } from '../src/lib/stream-signal.ts';
import { createLabState, startLabWindow, closeLabWindow, receiveLabBallot, stepLabController, stopLab, parseLabSequence, LAB_QUEUE_LIMIT } from '../src/lib/stream-signal-lab.ts';
const makePack = () => generateSignalPack(profile, 'pack:1792368000000:sample', 1792368000000);
test('pack generation keeps both stream links, all four editable drafts, short X text and manual-only sharing', () => {
  const pack = makePack();
  for (const key of SIGNAL_PLATFORMS) { assert.ok(pack.drafts[key].includes(profile.twitch)); assert.ok(pack.drafts[key].includes(profile.youtube)); }
  assert.ok([...pack.drafts.x].length <= 280); assert.deepEqual(pack.shared, {});
  assert.ok([...generateSignalPack({ ...profile, creator: 'あ'.repeat(60), title: '😀'.repeat(70) }, 'id').drafts.x].length <= 280);
  const edited = { ...pack, drafts: { ...pack.drafts, x: 'Edited & live? #now\nBoth channels ↓' } };
  assert.equal(new URL(composeOnX(edited.drafts.x)).searchParams.get('text'), edited.drafts.x);
  const exported = exportSignalPack(edited);
  for (const text of ['Edited & live?', 'https://x.com/', 'https://www.facebook.com/', 'https://www.instagram.com/', 'https://www.tiktok.com/', profile.twitch, profile.youtube]) assert.ok(exported.includes(text));
  assert.equal(pack.drafts.x, makePack().drafts.x); assert.deepEqual(readSignalPack(edited), edited);
});
test('channel validation rejects spoofed domains, credentials, non-HTTPS and video links; owner namespaces cannot overlap', () => {
  assert.deepEqual(validateSignalProfile(profile), {});
  for (const twitch of ['javascript:alert(1)', 'http://www.twitch.tv/notyoda', 'https://twitch.tv.evil.test/notyoda', 'https://user:pass@twitch.tv/notyoda', 'https://twitch.tv/notyoda?redirect=evil', 'https://twitch.tv/videos/1']) assert.ok(validateSignalProfile({ ...profile, twitch }).twitch, twitch);
  for (const youtube of ['https://youtu.be/video', 'https://youtube.com/watch?v=1', 'https://youtube.com.evil.test/@someone', 'https://youtube.com/']) assert.ok(validateSignalProfile({ ...profile, youtube }).youtube, youtube);
  assert.ok(validateSignalProfile({ ...profile, creator: '' }).creator);
  assert.notEqual(signalOwnerPrefix('alice'), signalOwnerPrefix('alice:pack:123'));
  assert.throws(() => signalOwnerPrefix('')); assert.throws(() => readSignalPack({}));
});
test('ballots use latest valid normalized viewer vote, deduplicate IDs, preserve invalid replacements, and reject late messages', () => {
  let s = startLabWindow(createLabState(), 15, 1000);
  s = receiveLabBallot(s, ' Viewer_1 ', 'a', 'attack', 1001);
  s = receiveLabBallot(s, 'viewer_1', 'b', 'defend then attack then heal', 1002);
  s = receiveLabBallot(s, 'VIEWER_1', 'c', 'invalid', 1003);
  s = receiveLabBallot(s, 'viewer_2', 'b', 'heal', 1004);
  assert.deepEqual(Object.keys(s.ballots), ['viewer_1']);
  assert.deepEqual(s.ballots.viewer_1, ['defend', 'attack', 'heal']);
  assert.match(s.log.at(-1), /Duplicate/);
  s = receiveLabBallot(s, 'viewer_2', 'late', 'attack', 16000);
  assert.equal(s.status, 'idle'); assert.deepEqual(s.queue.map(row => row.move), ['defend', 'attack', 'heal']);
  assert.match(s.log.at(-1), /Late/);
  assert.equal(parseLabSequence('attack then not valid'), null);
  assert.equal(parseLabSequence('heal then heal then heal then heal then heal'), null);
});
test('whole-sequence ties are deterministic regardless of arrival order; overflow rejects all moves', () => {
  const vote = order => {
    let s = startLabWindow(createLabState(), 10, 0);
    for (const [i, text] of order.entries()) s = receiveLabBallot(s, 'v' + i, String(i), text, 1);
    return closeLabWindow(s);
  };
  assert.deepEqual(vote(['defend then attack', 'attack then heal']).queue, vote(['attack then heal', 'defend then attack']).queue);
  const s = startLabWindow({ ...createLabState(), queue: Array.from({ length: LAB_QUEUE_LIMIT - 1 }, () => ({ move: 'heal', sequence: 99 })) }, 10, 0);
  const full = closeLabWindow(receiveLabBallot(s, 'v', 'id', 'defend then attack', 1));
  assert.equal(full.queue.length, LAB_QUEUE_LIMIT - 1); assert.match(full.log.at(-1), /entire sequence rejected/);
});
test('controller checks resources for every move, interrupts a blocked sequence, and emergency stop clears everything', () => {
  let s = closeLabWindow(receiveLabBallot(startLabWindow(createLabState(), 10, 0), 'v', 'id', 'defend then attack then heal', 1));
  for (let i = 0; i < 3; i++) s = stepLabController(s);
  assert.equal(s.health, 96); assert.equal(s.energy, 5); assert.equal(s.enemy, 75); assert.equal(s.queue.length, 0);
  s = { ...s, queue: [{ move: 'attack', sequence: 4 }, { move: 'heal', sequence: 4 }, { move: 'defend', sequence: 5 }] };
  s = stepLabController(s); assert.deepEqual(s.queue, [{ move: 'defend', sequence: 5 }]); assert.equal(s.energy, 5);
  const stopped = stopLab(startLabWindow(s, 10, 50));
  assert.equal(stopped.status, 'stopped'); assert.deepEqual(stopped.queue, []); assert.deepEqual(stopped.ballots, {}); assert.equal(stopped.deadline, null);
  assert.equal(stepLabController(stopped), stopped); assert.equal(startLabWindow(stopped, 10, 100).status, 'stopped');
});
test('simulator retains bounded logs, replay IDs and viewer entries under sustained messages', () => {
  let s = startLabWindow(createLabState(), 120, 0);
  for (let i = 0; i < 1000; i++) s = receiveLabBallot(s, `v${i}`, `m${i}`, 'attack', 1);
  assert.equal(Object.keys(s.ballots).length, 200); assert.equal(s.seen.length, 512); assert.equal(s.log.length, 100);
});
