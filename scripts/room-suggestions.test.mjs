import assert from 'node:assert/strict';
import test from 'node:test';
import { addRoomSuggestions, readRoomSuggestions, acceptsRoomReviewRevision } from '../src/lib/multiplayer/room-suggestions.ts';
const media = id => ({id:`device:${id}`,name:`Video ${id}`,kind:'youtube',watchUrl:`https://youtu.be/${id}?tracking=secret`,path:'private',poster:'https://i.ytimg.com/vi/test/default.jpg'});
test('review revisions reject stale, malformed and legacy snapshots after modern state is accepted',()=>{
  assert.equal(acceptsRoomReviewRevision(0,undefined),true);assert.equal(acceptsRoomReviewRevision(2,3),true);assert.equal(acceptsRoomReviewRevision(2,2),true);
  for(const value of [undefined,0,1,-1,2.5,'3',NaN,Infinity,{}])assert.equal(acceptsRoomReviewRevision(2,value),false);
});
test('review deduplicates canonical identities across devices, retries and live queue entries',()=>{
  const one=addRoomSuggestions([],[media('a'),media('b')],'peer','Ada',['youtube:b']);
  assert.equal(one.added,1);assert.equal(one.duplicates,1);
  const again=addRoomSuggestions(one.items,[{...media('a'),id:'another-device'}],'other','Ben',[]);
  assert.equal(again.added,0);assert.equal(again.duplicates,1);assert.equal(again.items[0].name,'Ada');
  assert.doesNotMatch(JSON.stringify(again.items),/secret|private|poster/);
});
test('review limits each guest to eight and the room to twenty-four without affecting the input queue',()=>{
  let items=[];for(let peer=0;peer<3;peer++){
    const result=addRoomSuggestions(items,Array.from({length:12},(_,i)=>media(`p${peer}-${i}`)),`peer${peer}`,'Guest',[]);
    assert.equal(result.added,8);assert.equal(result.limited,4);items=result.items;
  }
  assert.equal(items.length,24);const result=addRoomSuggestions(items,[media('extra')],'new','New',[]);
  assert.equal(result.limited,1);assert.equal(items.length,24);
});
test('review snapshots reject malformed/local media, strip private fields and bound names and arrays',()=>{
  const input=[{peer:'p',name:'\u0000'+ 'n'.repeat(100),media:media('one')},{peer:'p',media:{id:'local',kind:'local',name:'Private file.mp4'}},{peer:'x'.repeat(161),media:media('two')}];
  const result=readRoomSuggestions(input);assert.equal(result.length,1);assert.equal(result[0].name.length,64);
  assert.equal(result[0].id,'youtube:one');assert.equal(readRoomSuggestions(null).length,0);
  assert.equal(addRoomSuggestions([],input.map(value=>value.media),'p','Guest',[]).invalid,1);
  assert.equal(readRoomSuggestions(Array.from({length:100},(_,i)=>({peer:'p',media:media(String(i))}))).length,24);
});
