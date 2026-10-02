import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFollowImport, repairYoutubeImport, importedFollowStub, resolvedFollowQueries, reviewYoutubeImport, youtubeFollowHealth, bindYoutubeCorrection } from './follow-import.ts';
test('creator names stay whole across CSV, quotes and newlines', () => {
  assert.deepEqual(parseFollowImport('Linus Tech Tips,"Regal Entertainment, Inc.",Go od\n歌舞伎町 ライブ', 'youtube').map(row => row.query), ['Linus Tech Tips','Regal Entertainment, Inc.','Go od','歌舞伎町 ライブ']);
});
test('verified unique display names avoid duplicate stubs, while ambiguous names remain unresolved', () => {
  const row = (id:string,title:string) => ({id:`yt:${id}`,kind:'youtube' as const,handle:`@${id}`,channelId:id,title});
  const keys = resolvedFollowQueries([row('UCOne','Display Name'),row('UCTwo','Shared'),row('UCThree','Shared')], 'youtube');
  assert(keys.has('display name'));assert(!keys.has('shared'));
  assert.notEqual(importedFollowStub('歌舞伎町','youtube').id,importedFollowStub('温泉モデル','youtube').id);
});
test('Takeout CSV imports identities rather than each title and header column', () => {
  const id = 'UCAbCdEf1234567890123456';
  assert.deepEqual(parseFollowImport(`Channel Id,Channel Url,Channel Title\r\n${id},https://www.youtube.com/channel/${id},"Name, with commas"`, 'youtube').map(row => row.query), [`https://www.youtube.com/channel/${id}`]);
});
test('names with punctuation and spacing cannot collapse distinct pending creators', () => {
  const names = parseFollowImport('Go od,Good,A.B.,AB,温泉モデルしずかちゃん,歌舞伎町 ライブ', 'youtube');
  assert.equal(names.length, 6);
  assert.equal(new Set(names.map(row => importedFollowStub(row.query, row.kind).id)).size, 6);
});
test('legacy word IDs are held even after resolving unrelated real channels, while exact intended creators and their videos survive', () => {
  const rows = [{ id:'yt:go',kind:'youtube' as const,handle:'https://youtube.com/channel/UCother',channelId:'UCother',title:'Unrelated Go' }, {id:'yt:good',kind:'youtube' as const,handle:'@good',title:'Go od',channelId:'UCright'}, {id:'yt:tips',kind:'youtube' as const,handle:'Tips',title:'Tips'}];
  const repaired = reviewYoutubeImport(rows, 'Go od,Linus Tech Tips');
  assert(repaired[0].importNeedsReview); assert.equal(repaired[1], rows[1]); assert(repaired[2].importNeedsReview);
  assert.equal(repaired.length, rows.length); assert.deepEqual(youtubeFollowHealth(repaired), {saved:3,verified:1,pending:0,review:2,following:1});
});
test('explicit handle/URL whitespace lists and Twitch lists remain supported', () => {
  assert.deepEqual(parseFollowImport('@One @Two https://youtube.com/@Three','youtube').map(row => row.query), ['@One','@Two','https://youtube.com/@Three']);
  assert.deepEqual(parseFollowImport('one two\\_three,One','twitch').map(row => row.query), ['one','two_three']);
});
test('legacy recovery replaces word fragments with intended names, retaining extra saved entries', () => {
  const result = repairYoutubeImport(['Go','od','Linus','Tech','Tips','@Extra'], 'Go od,Linus Tech Tips');
  assert.deepEqual(result.queries, ['Go od','Linus Tech Tips','@Extra']);
  assert(result.fragments.has('go'));
  const again = repairYoutubeImport(result.queries, 'Go od,Linus Tech Tips');
  assert.deepEqual(again.queries, result.queries);
  assert.deepEqual(again.fragments, result.fragments);
});
test('stubs retain exact query case, spaces, URLs and channel IDs', () => {
  assert.equal(importedFollowStub('Linus Tech Tips','youtube').handle, 'Linus Tech Tips');
  assert.equal(importedFollowStub('https://youtube.com/channel/UCAbCdEf1234567890123456','youtube').handle, 'https://youtube.com/channel/UCAbCdEf1234567890123456');
});
test('an explicit correction preserves source membership and media IDs while clearing a legacy review hold', () => {
  const source = {id:'yt:go',kind:'youtube' as const,handle:'Go',title:'Go',importNeedsReview:true};
  const incoming = {channel:{id:'yt:UCActual',channelId:'UCActual',kind:'youtube' as const,handle:'@actual',title:'Actual creator'},videos:[{id:'youtube:abcdefghijk',folderId:'yt:UCActual',remote:{videoId:'abcdefghijk'}}]};
  const fixed = bindYoutubeCorrection(incoming as any,source,'@actual');
  assert.equal(fixed.channel.id,source.id);assert.equal(fixed.channel.channelId,'UCActual');assert.equal(fixed.channel.importNeedsReview,undefined);
  assert.equal(fixed.videos[0].id,incoming.videos[0].id);assert.equal(fixed.videos[0].folderId,source.id);
  assert.equal(reviewYoutubeImport([fixed.channel],'Go od')[0], fixed.channel, 'an explicit correction must not be quarantined on reload');
});
