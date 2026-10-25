import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createYoutubeTransport}=await import('../src/lib/remote/youtube-transport.ts');
const drain=async()=>{for(let i=0;i<300;i++)await Promise.resolve();};
function clock(){let now=0;const timers=[];return{now:()=>now,sleep:ms=>new Promise(resolve=>timers.push({at:now+ms,resolve})),advance:async ms=>{now+=ms;for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=now)timers.splice(i,1)[0].resolve();await drain();}};}
test('a sleeping 1500ms archive cannot block eight live starts paced at 80ms',async()=>{
 const time=clock(),starts=[];
 const transport=createYoutubeTransport({...time,gapMs:()=>1500,liveGapMs:()=>80,fetch:async url=>{starts.push({url,at:time.now()});return new Response('ok');}});
 await transport.request('https://www.youtube.com/youtubei/v1/browse');
 const archive=transport.request('https://www.youtube.com/youtubei/v1/browse');await drain();
 const lives=Array.from({length:8},(_,i)=>transport.request('https://www.youtube.com/channel/'+i+'/streams',{scope:'live'}));await drain();
 for(let i=0;i<8;i++)await time.advance(80);
 await Promise.all(lives);
 assert.deepEqual(starts.filter(s=>s.url.endsWith('/streams')).map(s=>s.at),[80,160,240,320,400,480,560,640]);
 assert.equal(starts.filter(s=>!s.url.endsWith('/streams')).length,1,'archive still waits without owning the shared start queue');
 await time.advance(860);await archive;assert.equal(starts.at(-1).at,1500,'the saved archive pace is preserved');
});
test('new global cooldown still stops both lanes while an archive pacing wait is outstanding',async()=>{
 const time=clock();let calls=0;
 const transport=createYoutubeTransport({...time,gapMs:()=>1500,liveGapMs:()=>80,fetch:async()=>{calls++;return new Response('ok');}});
 await transport.request('https://www.youtube.com/youtubei/v1/browse');
 const archive=transport.request('https://www.youtube.com/youtubei/v1/browse').catch(error=>error);await drain();
 assert.throws(()=>transport.accept(new Response('limited',{status:429}),0,'all'),/rate limit/);
 await assert.rejects(transport.request('https://www.youtube.com/channel/x/streams',{scope:'live'}),/rate limit/);
 await time.advance(1500);assert.match((await archive).message,/rate limit/);assert.equal(calls,1);
});
test('real refresh action ignores the saved 1500ms archive delay for live metadata',async()=>{
 const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
 const original=globalThis.fetch,starts=[];
 const channels=Array.from({length:8},(_,i)=>{const channelId='UC'+String(i).padStart(22,'0');return{id:'yt:'+channelId,channelId,kind:'youtube',handle:'creator'+i,title:'Creator '+i};});
 globalThis.fetch=async(url,init)=>{starts.push(Date.now());const data=JSON.parse(init.body),streams=Boolean(data.params);return Response.json({metadata:{channelMetadataRenderer:{externalId:data.browseId}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:!streams,title:'Home',content:{}}},{tabRenderer:{selected:streams,title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+data.browseId+'/streams'}},browseEndpoint:{browseId:data.browseId,params:'streams'}},content:{richGridRenderer:{contents:[]}}}}]}}});};
 try{const started=Date.now();const result=await runRefreshRemotes({channels,youtubeLiveOnly:true,youtubeRequestGapMs:1500});assert.equal(result.refreshedIds.length,8);assert.equal(starts.length,16);assert(Date.now()-started<6000,'live checks must not inherit fifteen archive waits of 1500ms');assert(starts.at(-1)-starts[0]>=1000,'bounded live pacing remains enabled');}finally{globalThis.fetch=original;}
});
