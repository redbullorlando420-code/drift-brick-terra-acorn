import test from 'node:test';
import assert from 'node:assert/strict';
import {readHostCatalogQuery,readHostCatalogPage,hostCatalogPayload} from '../src/lib/multiplayer/room-host-catalog.ts';
import {roomSearchPage} from '../src/lib/multiplayer/room-search.ts';
const video=i=>({id:`yt:${i}`,name:`Host title ${i}`,folderId:'yt:host',path:'private path',size:0,mime:'video/youtube',extension:'yt',addedAt:0,remote:{kind:'youtube',videoId:`v${String(i).padStart(10,'0')}`,channelName:'Host'}});
test('host catalog requests and result pages reject malformed, oversized or duplicate identities',()=>{
 assert.deepEqual(readHostCatalogQuery({requestId:'one',query:' host ',offset:24}),{requestId:'one',query:'host',offset:24});
 for(const request of [{requestId:'',query:'',offset:0},{requestId:'x',query:'x'.repeat(161),offset:0},{requestId:'x',query:'',offset:-1},{requestId:'x',query:'',offset:Infinity}])assert.equal(readHostCatalogQuery(request),undefined);
 assert.equal(readHostCatalogPage({media:Array(25).fill({}),hasMore:true}),undefined);
 const payload=hostCatalogPayload([video(1)],0,false);assert.equal(readHostCatalogPage(payload).videos[0].name,'Host title 1');
 assert.equal(JSON.stringify(payload).includes('private path'),false);
 assert.equal(readHostCatalogPage({...payload,media:[payload.media[0],payload.media[0]]}),undefined);
});
test('host searches exclude local titles by default and page only eligible matches',async()=>{
 const rows=Array.from({length:65},(_,i)=>i%2?video(i):{...video(i),remote:undefined,extension:'mp4'});
 const first=await roomSearchPage(rows,'Host',0,async()=>{},row=>Boolean(row.remote));
 const next=await roomSearchPage(rows,'Host',24,async()=>{},row=>Boolean(row.remote));
 assert.equal(first.videos.length,24);assert.equal(first.hasMore,true);assert.equal(next.videos.length,8);assert.ok(first.videos.every(row=>row.remote));
 assert.equal((await roomSearchPage(rows,'',0,async()=>{},()=>true)).videos.length,24);
});
test('large Unicode metadata stays below the reliable-message budget without losing the next offset',()=>{
 const rows=Array.from({length:24},(_,i)=>({...video(i),name:'漢'.repeat(300),description:'語'.repeat(280),remote:{...video(i).remote,channelName:'字'.repeat(200)}}));
 const payload=hostCatalogPayload(rows,48,false);
 assert.ok(payload.media.length>0&&payload.media.length<24);assert.ok(Buffer.byteLength(JSON.stringify(payload))<25000);assert.equal(payload.nextOffset,48+payload.media.length);assert.equal(payload.hasMore,true);
});
