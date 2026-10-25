import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const {setYoutubeRequestGap}=await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(0);
const channelId='UCabcdefghijklmnopqrstuv',channel={id:'yt:'+channelId,kind:'youtube',channelId,handle:'Creator',title:'Creator',live:true,liveCheckedAt:12345};
test('real live action retains successful timestamps, bounds failed requests, backs off, recovers and reports a live-only cooldown',async()=>{
 const originalFetch=globalThis.fetch,originalNow=Date.now;let now=1_000_000,calls=0,mode='503';Date.now=()=>now;
 globalThis.fetch=async(url,init)=>{
  calls++;assert(String(url).includes('/youtubei/'),'network/server failures must not fan out through HTML');
  if(mode==='503')return new Response('service unavailable',{status:503});
  if(mode==='network')throw new TypeError('fetch failed');
  if(mode==='limited')return new Response('rate limit',{status:429});
  const data=JSON.parse(init.body),streams=Boolean(data.params);
  return Response.json({metadata:{channelMetadataRenderer:{externalId:channelId}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:!streams,title:'Home',content:{}}},{tabRenderer:{selected:streams,title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+channelId+'/streams'}},browseEndpoint:{browseId:channelId,params:'streams'}},content:{richGridRenderer:{contents:[{videoRenderer:{videoId:'stream00001',title:{simpleText:'Live now'},viewCountText:{simpleText:'1,234 watching now'}}}]}}}}]}}});
 };
 try{
  const first=await runRefreshRemotes({channels:[channel],youtubeLiveOnly:true});assert.equal(calls,1);assert.equal(first.channels[0].liveCheckedAt,channel.liveCheckedAt);assert.equal(first.channels[0].live,true);assert.equal(first.channels[0].lastLiveFailure.attempts,1);assert.equal(first.retryAt[channel.id],now+30000);assert.equal(first.providerRetryAt,undefined);
  await runRefreshRemotes({channels:first.channels,youtubeLiveOnly:true});assert.equal(calls,1,'creator cooldown prevents a repeat request');
  now+=31000;mode='network';const second=await runRefreshRemotes({channels:first.channels,youtubeLiveOnly:true});assert.equal(calls,2);assert.equal(second.channels[0].lastLiveFailure.attempts,2);assert.equal(second.retryAt[channel.id],now+60000);assert.equal(second.channels[0].liveCheckedAt,channel.liveCheckedAt);
  now+=61000;mode='healthy';const healthy=await runRefreshRemotes({channels:second.channels,youtubeLiveOnly:true});assert.equal(healthy.channels[0].lastLiveFailure,undefined);assert.equal(healthy.channels[0].liveCheckedAt,now);assert.equal(healthy.videos[0].remote.viewers,1234);
  const healthyAt=now;now+=61000;mode='limited';const limited=await runRefreshRemotes({channels:healthy.channels,youtubeLiveOnly:true});assert.equal(limited.providerCooldownScope,'live');assert(limited.providerRetryAt>now);assert.equal(limited.channels[0].liveCheckedAt,healthyAt);assert.equal(limited.channels[0].lastProviderFailure,undefined);
 }finally{globalThis.fetch=originalFetch;Date.now=originalNow;}
});
