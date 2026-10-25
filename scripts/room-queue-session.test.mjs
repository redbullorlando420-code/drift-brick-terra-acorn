import test from 'node:test';
import assert from 'node:assert/strict';
import { roomQueueDraft, roomQueueLinks, roomRecentMedia, readRoomQueueDraft, acceptsRoomSelection, nextPlayableRoomTitle } from '../src/lib/multiplayer/room-queue-session.ts';
import { roomYoutubeError, roomSeekKey } from '../src/lib/multiplayer/room-player-recovery.ts';
import { parseRoomLinks, describeRoomMedia } from '../src/lib/multiplayer/room-media.ts';
const video = (id, provider = 'youtube') => ({ id, name: `Title ${id}`, kind: provider, videoId: provider === 'youtube' ? 'BaW_jenozKc' : '1234', watchUrl: provider === 'youtube' ? 'https://www.youtube.com/watch?v=BaW_jenozKc' : 'https://www.twitch.tv/videos/1234', duration: 120 });

test('room history is recent-first, canonical, bounded, and excludes local or unsupported data', () => {
  const many = Array.from({length:30},(_,i)=>({...video(String(i)),videoId:`recent${i}`,watchUrl:`https://youtu.be/recent${i}?tracking=secret`}));
  const recent=roomRecentMedia([many[0],many[0],{id:'local:secret',kind:'local',name:'Private file'},null,...many]);
  assert.equal(recent.length,12);assert.equal(recent[0].videoId,'recent0');assert.equal(recent[11].videoId,'recent11');
  assert.doesNotMatch(JSON.stringify(recent),/secret|Private file|local:/);
  assert.deepEqual(roomRecentMedia([]),[]);
});
test('provider errors explain embedding restrictions without treating failures as queue completion', () => {
  assert.match(roomYoutubeError(100),/unavailable or private/);assert.match(roomYoutubeError(101),/does not allow embedded/);
  assert.equal(roomYoutubeError(101),roomYoutubeError(150));assert.match(roomYoutubeError(153),/identify/);
  assert.match(roomYoutubeError(5),/on this device/);assert.match(roomYoutubeError(2),/rejected/);
  for(const value of ['100',null,undefined,NaN,1.5,{},[]])assert.equal(roomYoutubeError(value),undefined);
});
test('keyboard seeks are explicit quarter-second intentions with duration bounds and normal navigation keys left alone', () => {
  assert.equal(roomSeekKey('ArrowRight',0,6),0.25);assert.equal(roomSeekKey('ArrowLeft',0,6),0);
  assert.equal(roomSeekKey('ArrowUp',5.9,6),6);assert.equal(roomSeekKey('ArrowDown',2,6),1.75);
  assert.equal(roomSeekKey('Home',4,6),0);assert.equal(roomSeekKey('End',4,6),6);
  assert.equal(roomSeekKey('PageUp',10,100),20);assert.equal(roomSeekKey('PageDown',10,100),0);
  assert.equal(roomSeekKey('Tab',2,6),undefined);assert.equal(roomSeekKey('ArrowRight',NaN,6),undefined);
  assert.equal(roomSeekKey('ArrowRight',1,0),undefined);
});

test('queue link exports round trip provider types and strip local metadata, duplicate identities and URL tracking', () => {
  const links = ['https://youtu.be/BaW_jenozKc?si=secret', 'https://twitch.tv/videos/1234?t=5m', 'https://clips.twitch.tv/ExampleClip', 'https://twitch.tv/notyoda'];
  const parsed = parseRoomLinks(links.join('\n'));
  const media = parsed.videos.map(value => describeRoomMedia(value));
  const output = roomQueueLinks([...media, media[0], {id:'private',kind:'local',name:'Private recording.mp4',streamId:'secret'}]);
  assert.equal(output.split('\n').length, 4);
  assert.doesNotMatch(output, /secret|Private|\?si=|t=5m/);
  assert.deepEqual(parseRoomLinks(output).videos.map(value=>value.remote.watchUrl), parsed.videos.map(value=>value.remote.watchUrl));
  assert.equal(roomQueueLinks([]), '');
});
test('queue recovery keeps bounded canonical public media and excludes local/private or unknown fields', () => {
  const draft = roomQueueDraft([{ ...video('one'), password: 'secret', path: 'C:/private/file.mp4' }, video('duplicate'), video('two', 'twitch'), { id: 'local:secret', name: 'Private file.mp4', kind: 'local', local: { name: 'Private file.mp4', fingerprint: 'secret', size: 1, modified: 1 } }], 100);
  assert.equal(draft.media.length, 2); assert.deepEqual(readRoomQueueDraft(JSON.stringify(draft)), draft);
  for (const value of ['secret', 'Private file', 'password', 'C:/']) assert.ok(!JSON.stringify(draft).includes(value));
  const many = Array.from({ length: 100 }, (_, i) => ({ ...video(String(i)), videoId: `qa${i}`, watchUrl: `https://www.youtube.com/watch?v=qa${i}` }));
  assert.equal(roomQueueDraft(many, 100).media.length, 48);
});
test('damaged, oversized, local-only and unsupported drafts never become an empty replacement', () => {
  for (const value of [null, '{broken', '{}', 'x'.repeat(128001), JSON.stringify({ version: 2, savedAt: 1, media: [video('one')] }), JSON.stringify({ version: 1, savedAt: 0, media: [video('one')] }), JSON.stringify({ version: 1, savedAt: 1, media: [{ id: 'local', name: 'Private', kind: 'local' }] })]) assert.equal(readRoomQueueDraft(value), undefined);
});
test('selection revisions reject stale titles, malformed values and conflicting equal revisions while accepting legacy initial state', () => {
  assert.equal(acceptsRoomSelection(0, undefined, '', 'a'), true);
  assert.equal(acceptsRoomSelection(1, 2, 'a', 'b'), true);
  assert.equal(acceptsRoomSelection(2, 2, 'b', 'b'), true);
  for (const value of [undefined, -1, 1, 1.5, NaN, Infinity, '3']) assert.equal(acceptsRoomSelection(2, value, 'b', 'a'), false);
  assert.equal(acceptsRoomSelection(2, 2, 'b', 'a'), false);
});
test('advancement skips unavailable heads in one bounded pass and never loops on an exhausted queue', () => {
  assert.deepEqual(nextPlayableRoomTitle(['gone', 'missing', 'ready', 'later'], id => id === 'ready'), { id: 'ready', skipped: 2 });
  assert.deepEqual(nextPlayableRoomTitle(['gone'], () => false), { id: undefined, skipped: 1 });
  assert.deepEqual(nextPlayableRoomTitle([], () => true), { id: undefined, skipped: 0 });
  let calls = 0; nextPlayableRoomTitle(Array.from({ length: 1000 }, (_, i) => String(i)), () => { calls++; return false; }); assert.equal(calls, 48);
});
