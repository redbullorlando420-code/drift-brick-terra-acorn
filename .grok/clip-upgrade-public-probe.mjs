import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runFollowRemote}=await import('../src/lib/remote/api.ts');
const report=[];
for(const query of ['notyoda','twitch']){
 const started=Date.now(),r=await runFollowRemote({query,kind:'twitch',twitchClipMode:'recent',clipLimit:25});
 report.push({creator:query,elapsedMs:Date.now()-started,received:r.videos.length,withGame:r.videos.filter(v=>v.genre).length,diagnostics:r.channel.twitchClipDiagnostics,error:r.channel.lastClipFailure?.message,clipOnly:r.videos.every(v=>v.extension==='clip')&&!Object.hasOwn(r.channel,'live')&&!Object.hasOwn(r.channel,'twitchArchiveCursor')});
}
writeFileSync('screenshots/clip-upgrade-public-probe.json',JSON.stringify({at:new Date().toISOString(),report,limitation:'Read-only public metadata for two creators; no private saved library changed.'},null,2));console.log(JSON.stringify(report,null,2));
