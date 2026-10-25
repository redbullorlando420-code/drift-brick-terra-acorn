import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const follows=['notyoda','lirik','gamesdonequick'].map(handle=>({id:'tw:'+handle,kind:'twitch',handle,title:handle}));
follows.push({id:'yt:nasa-diagnostic',kind:'youtube',handle:'@NASA',title:'NASA'});
const result=await runRefreshRemotes({channels:follows,twitchLiveOnly:true,youtubeLiveOnly:true});
const report={at:new Date().toISOString(),checked:result.refreshedIds.length,total:follows.length,broadcasts:result.videos.map(x=>({provider:x.remote.kind,creator:x.remote.channelName,title:x.name,live:x.remote.live})),channels:result.channels.map(x=>({provider:x.kind,handle:x.handle,live:x.live,failure:x.lastLiveFailure?.message,recovery:x.lastLiveFailure?.recovery})),limitation:'One current read of public sample channels, not a full personal-follow audit or a promise of provider uptime.'};
writeFileSync('screenshots/discovery-live-native.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
