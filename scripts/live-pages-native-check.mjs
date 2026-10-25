import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {runFetchLiveRooms,runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const rooms=[];
for(const provider of ['chaturbate','myfreecams']){
 try{const first=await runFetchLiveRooms({provider,limit:24}),next=first.nextOffset===null?null:await runFetchLiveRooms({provider,limit:24,offset:first.nextOffset});const beyond=await runFetchLiveRooms({provider,limit:24,offset:192});rooms.push({provider,beyondOldLimitOffset:beyond.offset,beyondOldLimitRows:beyond.videos.length,total:first.total,firstRows:first.videos.length,nextRows:next?.videos.length,nextOffset:first.nextOffset,overlap:next?.videos.filter(v=>first.videos.some(old=>old.id===v.id)).length??0,stale:first.stale,checkedAt:first.checkedAt,error:first.error});}catch(error){rooms.push({provider,error:error.message});}
}
const channels=['notyoda','lirik','gamesdonequick'].map(handle=>({id:'tw:'+handle,kind:'twitch',handle,title:handle}));channels.push({id:'yt:UCLA_DiR1FfKNvjuUpBHmylQ',kind:'youtube',channelId:'UCLA_DiR1FfKNvjuUpBHmylQ',handle:'@NASA',title:'NASA'});
const social=await runRefreshRemotes({channels,youtubeLiveOnly:true,twitchLiveOnly:true});
const report={at:new Date().toISOString(),rooms,social:{successful:social.refreshedIds.length,total:channels.length,twitchBroadcasts:social.videos.filter(v=>v.remote.kind==='twitch').length,youtubeBroadcasts:social.videos.filter(v=>v.remote.kind==='youtube').length,failures:social.channels.filter(c=>c.lastLiveFailure).map(c=>({kind:c.kind,message:c.lastLiveFailure.message}))},limitation:'Point-in-time public metadata reads only. No room content, images or media were displayed. Directory ranks and availability can change between pages; this is not a personal-follow audit.'};
writeFileSync('screenshots/live-pages-native.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(rooms.some(r=>r.error||r.stale)||social.refreshedIds.length!==channels.length)process.exitCode=1;
