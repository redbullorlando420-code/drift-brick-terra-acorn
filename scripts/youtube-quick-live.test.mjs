import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createYoutubeLiveReader}=await import('../src/lib/remote/youtube-live-browse.ts');
const {createYoutubeTransport,YoutubeRequestError}=await import('../src/lib/remote/youtube-transport.ts');
const {selectYoutubeQuickLiveChannels}=await import('../src/lib/videos/youtube-quick-live.ts');
const id=n=>'UC'+String(n).padStart(22,'0');
const page=(channel,streams=false,ids=[])=>({metadata:{channelMetadataRenderer:{externalId:channel}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:!streams,title:'Home',content:{}}},{tabRenderer:{selected:streams,title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+channel+'/streams'}},browseEndpoint:{browseId:channel,params:'valid-streams'}},content:{richGridRenderer:{contents:ids.map(videoId=>({videoRenderer:{videoId,title:{simpleText:'Broadcast'},thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'LIVE'}}]}}))}}}}]}}});
const defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const drain=async()=>{for(let i=0;i<100;i++)await Promise.resolve();};

test('Streams endpoints eliminate repeated Home requests, validate each channel, and never cache live answers',async()=>{
 const calls=[];let live=true;
 const read=createYoutubeLiveReader(async target=>{calls.push(target);return page(target.browseId,Boolean(target.params),target.params&&live?['stream00001','stream00002']:[]);});
 assert.equal((await read(id(1))).length,2);assert.equal(calls.length,2);
 live=false;assert.deepEqual(await read(id(1)),[]);assert.equal(calls.length,3);assert(calls.at(-1).params);
 await read(id(2));assert.equal(calls.length,4,'validated navigation params work for a new channel with one fresh request');
});

test('unrecognized or expired endpoints recover through Home; missing identity cannot confirm offline',async()=>{
 let now=1,calls=0,changed=false;
 const read=createYoutubeLiveReader(async target=>{calls++;return target.params&&changed&&calls===3?page(id(99),true):page(target.browseId,Boolean(target.params));},()=>now);
 await read(id(1));changed=true;await read(id(1));assert.equal(calls,5,'wrong-creator quick page falls back and still validates the fresh Streams page');
 now+=7*60*60_000;await read(id(1));assert.equal(calls,7,'expired navigation endpoints are rediscovered');
});

test('endpoint fallback cannot bypass a rate hold and duplicate checks share only in-flight work',async()=>{
 let calls=0,hold=false;const gate=defer();
 const read=createYoutubeLiveReader(async target=>{calls++;await gate.promise;if(hold)throw new YoutubeRequestError('rate hold',429,Date.now()+10000,'live');return page(target.browseId,Boolean(target.params));});
 const first=read(id(1)),same=read(id(1));assert.equal(first,same);gate.resolve();await first;assert.equal(calls,2);
 hold=true;await assert.rejects(read(id(1)),/rate hold/);assert.equal(calls,3,'no Home fallback during a provider hold');
});

test('eight live bodies overlap beside a stalled archive while archive bodies remain serial',async()=>{
 const archive=defer(),lives=defer();let liveActive=0,livePeak=0,other=0,otherPeak=0;
 const transport=createYoutubeTransport({gapMs:()=>0,fetch:async(url,init)=>{
  const live=JSON.parse(init?.body??'{}').live===true;
  if(live){livePeak=Math.max(livePeak,++liveActive);await lives.promise;liveActive--;}
  else{otherPeak=Math.max(otherPeak,++other);await archive.promise;other--;}
  return new Response('ok');
 }});
 const old=transport.request('https://www.youtube.com/youtubei/v1/browse');
 const nextOld=transport.request('https://www.youtube.com/youtubei/v1/browse');
 const checks=Array.from({length:10},()=>transport.request('https://www.youtube.com/youtubei/v1/browse',{scope:'live',body:'{"live":true}'}));
 await drain();assert.equal(liveActive,8);assert.equal(other,1);lives.resolve();await Promise.all(checks);assert.equal(livePeak,8);assert.equal(otherPeak,1);assert.equal(other,1,'archive is still waiting when all live checks have finished');archive.resolve();await Promise.all([old,nextOld]);
});

test('an older parallel success cannot release a new live cooldown or start queued checks',async()=>{
 const first=defer(),second=defer();let calls=0;
 const transport=createYoutubeTransport({gapMs:()=>0,fetch:async()=>{const n=++calls;if(n===1){await first.promise;return new Response('limited',{status:429});}await second.promise;return new Response('ok');}});
 const pending=Array.from({length:12},()=>transport.request('https://www.youtube.com/youtubei/v1/browse',{scope:'live'}));
 const settled=Promise.allSettled(pending);await drain();assert.equal(calls,8);first.resolve();await drain();second.resolve();await settled;assert(transport.retryAt('live')>Date.now());assert.equal(calls,8,'queued checks obey the newly observed cooldown');
});

test('2,000-channel discovery rotates completely without repeating fresh offline checks or starving known live',()=>{
 const now=1_000_000,rows=Array.from({length:2000},(_,i)=>({id:'yt:'+id(i),channelId:id(i),kind:'youtube',handle:'channel'+i,title:'Channel '+i,live:i<40}));
 const seen=new Set();
 for(let turn=0;turn<30;turn++){
  const picked=selectYoutubeQuickLiveChannels(rows,96,true,now);if(!picked.length)break;
  assert(picked.length<=96);for(const channel of picked){assert(!seen.has(channel.id));seen.add(channel.id);channel.liveCheckedAt=now;}
 }
 assert.equal(seen.size,2000);assert.equal(selectYoutubeQuickLiveChannels(rows,96,true,now).length,0);
 const due=selectYoutubeQuickLiveChannels(rows,96,true,now+60_000);assert.equal(due.length,40);assert(due.every(row=>row.live));
 rows[100].lastLiveFailure={retryAt:now+900_000};assert(!selectYoutubeQuickLiveChannels(rows,rows.length,false,now).includes(rows[100]));
});

test('1,588 creators with 52 overdue broadcasts reserve three quarters of each batch for discovery',()=>{
 const now=1_000_000,rows=Array.from({length:1588},(_,i)=>({id:'yt:'+id(i),channelId:id(i),kind:'youtube',title:'Creator '+i,handle:'creator'+i,live:i<52,liveCheckedAt:1}));
 const batch=selectYoutubeQuickLiveChannels(rows,24,true,now);
 assert.equal(batch.length,24);assert.equal(batch.filter(row=>row.live).length,6);assert.equal(batch.filter(row=>!row.live).length,18);
});
