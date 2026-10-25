import test from 'node:test';
import assert from 'node:assert/strict';
import { roomPlaylist, readRoomPlaylists, writeRoomPlaylists, roomPlaylistName } from '../src/lib/multiplayer/room-playlists.ts';
const video = (id='qa000000001') => ({id:'private-catalog-id',name:'Saved public title',kind:'youtube',videoId:id,watchUrl:`https://youtu.be/${id}?si=tracking`,poster:'https://i.ytimg.com/vi/example/default.jpg',path:'C:/private',peer:'secret'});
test('saved watch lists persist canonical public titles without catalog IDs, local files, tracking or unknown fields',()=>{
  const item=roomPlaylist('list-one','  Friday\nnight  ',[video(),video(),{id:'local',name:'Private recording',kind:'local',streamId:'secret'}],100);
  assert.equal(item.name,'Fridaynight');assert.equal(item.media.length,1);assert.equal(item.media[0].name,'Saved public title');assert.equal(item.media[0].id,'room:youtube:qa000000001');
  assert.doesNotMatch(JSON.stringify(item),/private-catalog|Private recording|secret|tracking|poster|path/);
  assert.deepEqual(readRoomPlaylists(writeRoomPlaylists([item])),[item]);
  assert.doesNotMatch(writeRoomPlaylists([{...item,path:'secret',media:[{...video(),local:{name:'secret'}}]}]),/secret|tracking|private-catalog/);
});
test('named lists bound queue length, list count, IDs, names and encoded storage size',()=>{
  assert.equal(roomPlaylist('id','x'.repeat(100),Array.from({length:80},(_,i)=>video(`video${i}`)),100).media.length,48);
  assert.equal(roomPlaylistName('x'.repeat(100)).length,64);
  const items=Array.from({length:12},(_,i)=>roomPlaylist(`list-${i}`,`List ${i}`,[video()],100));
  assert.equal(readRoomPlaylists(writeRoomPlaylists(items)).length,12);
  assert.throws(()=>writeRoomPlaylists([...items,roomPlaylist('extra','Extra',[video()],100)]));
  for(const id of ['bad:path','x'.repeat(97),''])assert.equal(roomPlaylist(id,'Name',[video()],100),undefined);
  assert.equal(readRoomPlaylists('x'.repeat(1600001)),undefined);
});
test('corrupt and unsupported saved data cannot silently replace existing lists',()=>{
  const item=roomPlaylist('one','One',[video()],100);
  for(const raw of ['{broken','{}',JSON.stringify({version:2,items:[item]}),JSON.stringify({version:1,items:{}})])assert.equal(readRoomPlaylists(raw),undefined);
  for(const updatedAt of [undefined,null,-1,0,1.5,'100'])assert.equal(readRoomPlaylists(JSON.stringify({version:1,items:[{...item,updatedAt}]})),undefined);
  assert.deepEqual(readRoomPlaylists(null),[]);assert.deepEqual(readRoomPlaylists(writeRoomPlaylists([])),[]);
});
test('duplicate list identities or case-insensitive names are rejected while empty and local-only lists stay unsaved',()=>{
  const item=roomPlaylist('one','One',[video()],100);
  assert.throws(()=>writeRoomPlaylists([item,{...item,id:'two',name:'ONE'}]));
  assert.throws(()=>writeRoomPlaylists([item,{...item,name:'Another'}]));
  assert.equal(roomPlaylist('one',' ',[video()],100),undefined);assert.equal(roomPlaylist('one','One',[],100),undefined);
  assert.equal(roomPlaylist('one','One',[{id:'local',kind:'local',name:'Private'}],100),undefined);
});
