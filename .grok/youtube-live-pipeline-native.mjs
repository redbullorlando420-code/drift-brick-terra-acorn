import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const original=globalThis.fetch;let requests=0;globalThis.fetch=(...args)=>{requests++;return original(...args);};
const results=[];
try{
 for(const channelId of ['UCLA_DiR1FfKNvjuUpBHmylQ','UCSUu1lih2RifWkKtDOJdsBA','UCLA_DiR1FfKNvjuUpBHmylQ']){
  const started=Date.now(),before=requests;
  const result=await runRefreshRemotes({channels:[{id:'yt:'+channelId,channelId,kind:'youtube',handle:channelId,title:channelId}],youtubeLiveOnly:true,youtubeRequestGapMs:1500});
  results.push({channelId,elapsedMs:Date.now()-started,requests:requests-before,checked:result.refreshedIds.length,broadcasts:result.videos.map(v=>({id:v.remote.videoId,viewers:v.remote.viewers})),failure:result.channels[0]?.lastLiveFailure,providerRetryAt:result.providerRetryAt,providerCooldownScope:result.providerCooldownScope});
 }
}finally{globalThis.fetch=original;}
const report={at:new Date().toISOString(),ok:results.every(r=>r.checked===1),results,limitation:'Three point-in-time metadata checks of two public channels, without playback or a personal-follow audit. Upstream availability and timings can change.'};
writeFileSync('screenshots/youtube-live-pipeline-native.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.ok)process.exitCode=1;
