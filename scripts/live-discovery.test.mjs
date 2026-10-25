import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {selectLiveRefreshChannels}=await import('../src/lib/videos/live-refresh-selection.ts');
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const tw=i=>({id:'tw:'+i,kind:'twitch',handle:'discovery_'+i,title:'Creator '+i,liveCheckedAt:i});
test('a manual live selection covers all eligible follows beyond 80 and ignores archive cooldown',()=>{
 const rows=Array.from({length:160},(_,i)=>({...tw(i),twitchArchiveRetry:{retryAt:Date.now()+90000,attempts:1}}));
 rows[12].twitchLiveRetry={retryAt:Date.now()+90000,attempts:1};
 const found=selectLiveRefreshChannels(rows,'twitch');assert.equal(found.length,159);assert.ok(found.some(x=>x.id==='tw:159'));assert.ok(!found.some(x=>x.id==='tw:12'));
});
test('automatic live selection balances known broadcasts with discovery in durable timestamp order',()=>{
 const rows=Array.from({length:60},(_,i)=>({...tw(i),live:i<30}));
 const found=selectLiveRefreshChannels(rows,'twitch',12);assert.equal(found.filter(x=>x.live).length,6);assert.equal(found.filter(x=>!x.live).length,6);assert.equal(found[0].id,'tw:0');assert.equal(found[6].id,'tw:30');
 for(const x of found)x.liveCheckedAt=1000;const next=selectLiveRefreshChannels(rows,'twitch',12);assert.ok(next.every(x=>!found.includes(x)));
});
test('YouTube live eligibility excludes playlists, ambiguous imports and live cooldowns only',()=>{
 const id='UCabcdefghijklmnopqrstuv',base={id:'yt:'+id,kind:'youtube',channelId:id,handle:'creator',title:'Creator'};
 const rows=[base,{...base,id:'ytpl:list'},{...base,id:'pending',channelId:undefined},{...base,id:'review',importNeedsReview:true},{...base,id:'cooling',lastLiveFailure:{retryAt:Date.now()+5000}},{...base,id:'archive-block',lastProviderFailure:{retryAt:Date.now()+5000}}];
 assert.deepEqual(new Set(selectLiveRefreshChannels(rows,'youtube').map(x=>x.id)),new Set([base.id,'archive-block']));
});
test('live browse combines home and Streams evidence without losing simultaneous broadcasts or archive health',async()=>{
 const original=globalThis.fetch,channelId='UCabcdefghijklmnopqrstuv',queries=[];
 const live=id=>({videoRenderer:{videoId:id,title:{simpleText:id},thumbnailOverlays:[{thumbnailOverlayTimeStatusRenderer:{style:'LIVE'}}]}});
 const failure={kind:'network-offline',message:'Archive failed',at:1};
 globalThis.fetch=async(url,init)=>{assert.ok(String(url).includes('/youtubei/'));const data=JSON.parse(init.body);queries.push(data);return Response.json({metadata:{channelMetadataRenderer:{externalId:channelId}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:data.params?'Live':'Home',content:{richGridRenderer:{contents:[live(data.params?'stream00002':'stream00001')]}}}},{tabRenderer:{title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+channelId+'/streams'}},browseEndpoint:{browseId:channelId,params:'streams-only'}}}}]}}});};
 try{const result=await runRefreshRemotes({channels:[{id:'yt:'+channelId,kind:'youtube',channelId,handle:'Creator',title:'Creator',lastProviderFailure:failure}],youtubeLiveOnly:true});assert.equal(queries.length,2);assert.equal(result.videos.length,2);assert.deepEqual(result.liveCheckedIds,['yt:'+channelId]);assert.equal(result.channels[0].lastProviderFailure.message,failure.message);assert.equal(result.channels[0].lastLiveFailure,undefined);assert.ok(result.videos.every(x=>x.remote.live&&x.remote.observedAt>0));}finally{globalThis.fetch=original;}
});


test('six 100-target Twitch requests check all 600 follows without the former server-side 80-target truncation',async()=>{
 const original=globalThis.fetch,logins=new Set();let requests=0;
 globalThis.fetch=async(url,init)=>{assert(String(url).includes('gql.twitch.tv'));const body=JSON.parse(init.body);assert(!body.query.includes('videos(') && !body.query.includes('clips('));requests++;const data={};for(const [name,login] of Object.entries(body.variables)){assert(!logins.has(login));logins.add(login);data['c'+name.slice(1)]={id:login,displayName:login,stream:null};}return Response.json({data});};
 try{for(let offset=0;offset<600;offset+=100){const channels=Array.from({length:100},(_,i)=>tw(offset+i));const result=await runRefreshRemotes({channels,twitchLiveOnly:true});assert.equal(result.refreshedIds.length,100);assert.equal(result.channels.length,100);assert.equal(result.liveCheckedIds.length,100);}assert.equal(logins.size,600);assert.equal(requests,54);}finally{globalThis.fetch=original;}
});
