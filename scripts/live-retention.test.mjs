import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {retainYoutubeLiveFollow,YOUTUBE_LIVE_HOLD_MS}=await import('../src/lib/videos/live-retention.ts');
const {mergeRemoteRefresh}=await import('../src/lib/videos/remote-merge.ts');
const {hasFreshRemoteLiveState,filterLiveRows}=await import('../src/lib/videos/live-desk.ts');
const {myFreeCamsRoomUrl}=await import('../src/lib/videos/official-room.ts');
const previous={id:'yt:creator',kind:'youtube',handle:'creator',title:'Creator',live:true,liveCheckedAt:1_000_000};
test('a missing YouTube broadcast remains eligible for minute-by-minute rechecks for ten minutes and positive evidence clears the hold',()=>{
 const first=retainYoutubeLiveFollow(previous,{...previous,live:false,liveCheckedAt:1_001_000},true);
 assert.equal(first.live,true);assert.equal(first.liveOfflineSince,1_001_000);
 const again=retainYoutubeLiveFollow(first,{...first,live:false,liveCheckedAt:1_001_000+YOUTUBE_LIVE_HOLD_MS-1},true);assert.equal(again.live,true);assert.equal(again.liveOfflineSince,first.liveOfflineSince);
 assert.equal(retainYoutubeLiveFollow(again,{...again,live:false,liveCheckedAt:1_001_000+YOUTUBE_LIVE_HOLD_MS},true).live,false);
 const recovered=retainYoutubeLiveFollow(first,{...first,live:true,liveCheckedAt:1_002_000},true);assert.equal(recovered.liveOfflineSince,undefined);
 const failure={...first,liveCheckedAt:1_003_000,lastLiveFailure:{kind:'network-offline'}};assert.equal(retainYoutubeLiveFollow(first,failure,false),failure);
});
test('a pending stream stays in the live grid, survives serialization and ends only after repeated negative evidence spans ten minutes',()=>{
 const video={id:'yt:v:abcdefghijk',folderId:previous.id,name:'Live',path:'',mime:'video/youtube',extension:'live',size:0,addedAt:0,remote:{kind:'youtube',videoId:'abcdefghijk',live:true,observedAt:1_000_000}};
 const pending=[],options={liveCheckedIds:[previous.id],liveCheckedAt:{[previous.id]:1_001_000},youtubeOfflineGraceMs:YOUTUBE_LIVE_HOLD_MS,pendingYoutubeRows:pending};
 const first=mergeRemoteRefresh([video],[],[previous.id],new Set(),options);assert.equal(first[0].remote.live,true);assert.equal(pending.length,1);assert.equal(first[0].remote.liveOfflineSince,1_001_000);
 const saved=JSON.parse(JSON.stringify(first));assert.equal(hasFreshRemoteLiveState(saved[0],1_599_999,120000,600000),true);
 const end=mergeRemoteRefresh(saved,[],[previous.id],new Set(),{...options,liveCheckedAt:{[previous.id]:1_601_000}});assert.equal(end[0].remote.live,false);
 const positive={...video,remote:{...video.remote,observedAt:1_002_000,liveOfflineSince:undefined}};assert.equal(mergeRemoteRefresh(first,[positive],[previous.id],new Set(),options)[0].remote.liveOfflineSince,undefined);
});
test('viewer sorting ranks current concurrent counts, including zero, before unavailable or old counts',()=>{
 const now=Date.now(),row=(id,viewers,observedAt=now)=>({id,name:id,remote:{kind:'youtube',live:true,viewers,observedAt}});
 const sorted=filterLiveRows([row('hidden'),row('old',999999,now-600000),row('zero',0),row('busy',3456),{...row('z-pending',1000000),remote:{...row('z-pending',1000000).remote,liveOfflineSince:now}}],{source:'youtube',filter:'all',search:'',sort:'viewers',favorites:{},likes:{}});
 assert.deepEqual(sorted.map(v=>v.id),['busy','zero','hidden','old','z-pending']);
});
test('MyFreeCams handoff constructs a specific official room and rejects arbitrary or malformed URLs',()=>{
 assert.equal(myFreeCamsRoomUrl({kind:'myfreecams',videoId:'creator_1'}),'https://app.myfreecams.com/creator_1');
 assert.equal(myFreeCamsRoomUrl({kind:'myfreecams',watchUrl:'https://www.myfreecams.com/#creator_2'}),'https://app.myfreecams.com/creator_2');
 for(const watchUrl of ['javascript:alert(1)','https://evil.invalid/creator','https://www.myfreecams.com/#Homepage'])assert.equal(myFreeCamsRoomUrl({kind:'myfreecams',watchUrl}),undefined);
});
