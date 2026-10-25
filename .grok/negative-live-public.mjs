import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const result=await runRefreshRemotes({youtubeLiveOnly:true,channels:[{id:'yt:UCSJ4gkVC6NrvII8umztf0Ow',channelId:'UCSJ4gkVC6NrvII8umztf0Ow',kind:'youtube',handle:'LofiGirl',title:'Public live creator'}]});
const report={at:new Date().toISOString(),received:result.videos.length,successful:result.refreshedIds.length,completeChecks:result.liveCheckedIds.length,observations:result.channels.map(c=>({live:c.live,evidence:c.youtubeLiveEvidence,knownBroadcasts:c.youtubeLiveVideoIds?.length,failure:c.lastLiveFailure?.message})),limitation:'One read-only public creator snapshot, no saved follows or account data and no provider soak.'};writeFileSync('screenshots/negative-evidence-public.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
