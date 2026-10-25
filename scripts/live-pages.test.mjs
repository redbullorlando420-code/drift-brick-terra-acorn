import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {liveResultPage}=await import('../src/lib/videos/live-desk.ts');
const {selectTwitchQuickLiveChannels}=await import('../src/lib/videos/twitch-quick-live.ts');
const {runFetchLiveRooms}=await import('../src/lib/remote/api.ts');
const {liveRoomRequest}=await import('../src/lib/remote/live-rooms.ts');

test('live pages reach every result and keep mounted rows bounded, including filter shrink',()=>{
 const rows=Array.from({length:5000},(_,i)=>i),seen=[];
 for(let page=0;page<Math.ceil(rows.length/24);page++){const result=liveResultPage(rows,page);assert(result.rows.length<=24);seen.push(...result.rows);}
 assert.deepEqual(seen,rows);assert.deepEqual(liveResultPage([1,2],99).rows,[1,2]);assert.equal(liveResultPage([],1).page,0);
});
test('Twitch lightweight discovery rotates 2,000 follows fairly, skipping fresh observations and independent live cooldowns',()=>{
 const now=1_000_000,rows=Array.from({length:2000},(_,i)=>({id:'tw:creator'+i,kind:'twitch',handle:'creator'+i,title:'Creator '+i,live:i<80})),seen=new Set();
 for(let i=0;i<20;i++){const next=selectTwitchQuickLiveChannels(rows,240,true,now);if(!next.length)break;for(const channel of next){assert(!seen.has(channel.id));seen.add(channel.id);channel.liveCheckedAt=now;}}
 assert.equal(seen.size,2000);assert.equal(selectTwitchQuickLiveChannels(rows,240,true,now).length,0);assert.equal(selectTwitchQuickLiveChannels(rows,240,true,now+60000).length,80);
 rows[100].twitchArchiveRetry={retryAt:now+300000};assert(selectTwitchQuickLiveChannels(rows,2000,false,now).includes(rows[100]));rows[100].twitchLiveRetry={retryAt:now+300000};assert(!selectTwitchQuickLiveChannels(rows,2000,false,now).includes(rows[100]));
});
test('room page inputs cannot request arbitrary sources or unbounded pages',()=>{
 assert.throws(()=>liveRoomRequest({provider:'other'}));assert.throws(()=>liveRoomRequest({provider:'chaturbate',offset:NaN}));assert.deepEqual(liveRoomRequest({provider:'myfreecams',offset:-50,limit:9999}),{provider:'myfreecams',offset:0,limit:48});
});
test('Chaturbate v2 pages use real offsets and counts, coalesce duplicate requests and reject malformed empty success',async()=>{
 const original=globalThis.fetch,seen=[];
 globalThis.fetch=async url=>{const parsed=new URL(url);seen.push(parsed);assert.equal(parsed.pathname,'/api/public/affiliates/onlinerooms/');const offset=Number(parsed.searchParams.get('offset')),limit=Number(parsed.searchParams.get('limit'));return Response.json({count:100,results:Array.from({length:limit},(_,i)=>({username:'public_room_'+(offset+i),display_name:'Room '+(offset+i),current_show:'public',age:25,num_users:100-i}))});};
 try{const first=runFetchLiveRooms({provider:'chaturbate',limit:24}),same=runFetchLiveRooms({provider:'chaturbate',limit:24});assert.equal(first,same);const a=await first,b=await runFetchLiveRooms({provider:'chaturbate',limit:24,offset:a.nextOffset});assert.equal(seen.length,2);assert.equal(a.total,100);assert.equal(a.nextOffset,24);assert.equal(b.nextOffset,48);assert.equal(a.videos.length,24);assert(!b.videos.some(v=>a.videos.some(old=>old.id===v.id)));assert(a.checkedAt>0);assert(a.videos.every(v=>v.remote.observedAt===a.checkedAt));
 globalThis.fetch=async()=>Response.json({unexpected:true});await assert.rejects(runFetchLiveRooms({provider:'chaturbate',offset:99,limit:1}),/unreadable/);
 }finally{globalThis.fetch=original;}
});
test('MFC public roster supports Next pages without profile requests and never accepts an error page as offline',async()=>{
 const original=globalThis.fetch, originalNow=Date.now;let now=Date.now(),calls=0;Date.now=()=>now;
 globalThis.fetch=async url=>{calls++;assert(String(url).includes('/php/online_models.php'));return new Response('Updated: 1<br>'+Array.from({length:80},(_,i)=>'PublicRoom_'+i+','+(i<75?0:12)).join('<br>'),{headers:{'content-type':'text/plain'}});};
 try{const a=await runFetchLiveRooms({provider:'myfreecams',limit:24}),b=await runFetchLiveRooms({provider:'myfreecams',offset:a.nextOffset,limit:24});assert.equal(calls,1);assert.equal(a.total,75);assert.equal(a.nextOffset,24);assert.equal(b.videos.length,24);assert(!b.videos.some(v=>a.videos.some(old=>old.id===v.id)));assert.equal(a.stale,false);assert(a.videos.every(v=>v.remote.watchUrl.startsWith('https://www.myfreecams.com/#')));
 now+=190001;globalThis.fetch=async()=>new Response('<html>maintenance</html>',{headers:{'content-type':'text/html'}});const failed=await runFetchLiveRooms({provider:'myfreecams',limit:24});assert(failed.stale);assert.equal(failed.checkedAt,a.checkedAt);assert.equal(failed.videos.length,24);assert.match(failed.error,/unreadable/);
 now+=360001;globalThis.fetch=async()=>new Response('Updated: 2<br>PrivateRoom,12',{headers:{'content-type':'text/plain'}});const empty=await runFetchLiveRooms({provider:'myfreecams',limit:24});assert.equal(empty.stale,false);assert.equal(empty.total,0);assert.deepEqual(empty.videos,[]);
 }finally{globalThis.fetch=original;Date.now=originalNow;}
});
