import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createCompletionQueue}=await import('../src/lib/completion-queue.ts');
const {mergeYoutubeLiveResults}=await import('../src/lib/videos/youtube-live-results.ts');
const {createPullScheduler}=await import('../src/lib/pull-scheduler.ts');
const defer=()=>{let resolve,reject;const promise=new Promise((r,j)=>{resolve=r;reject=j;});return {promise,resolve,reject};};
const drain=async()=>{for(let i=0;i<100;i++)await Promise.resolve();};
test('healthy completions overtake a stalled first batch with at most three retained responses',async()=>{
 const gates=Array.from({length:10},defer);let next=0,started=0,active=0,peak=0;
 const queue=createCompletionQueue({concurrency:3,take:()=>next<10?next++:undefined,request:async item=>{started++;peak=Math.max(peak,++active);try{return await gates[item].promise;}finally{active--;}}});
 try{const first=queue.next();await drain();assert.equal(started,3);gates[2].resolve(2);assert.equal((await first).item,2);assert.equal(started,3,'consumption alone does not grow unbounded look-ahead');
 const second=queue.next();await drain();assert.equal(started,4);gates[1].resolve(1);assert.equal((await second).item,1);gates[3].resolve(3);await drain();assert.equal(started,4,'completed responses occupy bounded capacity until consumed');
 assert.equal((await queue.next()).item,3);gates[0].resolve(0);await drain();assert.equal((await queue.next()).item,0);assert(peak<=3);assert(started<=6);
 }finally{queue.close();for(const gate of gates)gate.resolve(0);}
});
test('completed responses retain completion order across a slow consumer and can coalesce without extra requests',async()=>{
 const gates=Array.from({length:3},defer);let next=0;
 const queue=createCompletionQueue({concurrency:3,take:()=>next<3?next++:undefined,request:item=>gates[item].promise});
 try{const first=queue.next();await drain();gates[2].resolve(2);assert.equal((await first).item,2);gates[1].resolve(1);await drain();gates[0].resolve(0);await drain();assert.equal((await queue.next()).item,1);assert.equal(queue.takeReady(row=>row.ok).item,0);assert.equal(await queue.next(),undefined);}finally{queue.close();}
});
test('a failed batch does not block healthy completions and closed work is aborted without unhandled rejection',async()=>{
 const gates=Array.from({length:3},defer);let next=0;const signals=[];
 const queue=createCompletionQueue({concurrency:3,take:()=>next<3?next++:undefined,request:(item,signal)=>{signals.push(signal);return gates[item].promise;}});
 const first=queue.next();await drain();gates[1].reject(new Error('one failed'));const failure=await first;assert.equal(failure.ok,false);gates[2].resolve(2);assert.equal((await queue.next()).value,2);queue.close();assert(signals.every(s=>s.aborted));gates[0].reject(new Error('late abort'));await drain();assert.equal(await queue.next(),undefined);
});
test('a newly reported cooldown stops refill while already accepted healthy responses drain',async()=>{
 const gates=Array.from({length:8},defer);let next=0,stopped=false;
 const queue=createCompletionQueue({concurrency:3,take:()=>!stopped&&next<8?next++:undefined,request:async item=>{const value=await gates[item].promise;if(value==='cooldown')stopped=true;return value;}});
 try{const first=queue.next();await drain();gates[1].resolve('cooldown');assert.equal((await first).value,'cooldown');gates[2].resolve('healthy');assert.equal((await queue.next()).value,'healthy');gates[0].resolve('healthy');assert.equal((await queue.next()).value,'healthy');assert.equal(await queue.next(),undefined);assert.equal(next,3);}finally{queue.close();}
});
test('coalescing preserves exact successes, failures, viewer rows and the longest global cooldown',()=>{
 const left={channels:[{id:'a'}],videos:[{id:'a',remote:{viewers:0}}],refreshedIds:['a'],liveCheckedIds:['a'],retryAt:{},providerRetryAt:100,providerCooldownScope:'all'};
 const right={channels:[{id:'b',lastLiveFailure:{message:'timeout'}}],videos:[],refreshedIds:[],liveCheckedIds:[],retryAt:{b:200},providerRetryAt:200,providerCooldownScope:'live'};
 const merged=mergeYoutubeLiveResults(left,right);assert.deepEqual(merged.refreshedIds,['a']);assert.deepEqual(merged.liveCheckedIds,['a']);assert.equal(merged.channels[1].lastLiveFailure.message,'timeout');assert.equal(merged.videos[0].remote.viewers,0);assert.equal(merged.providerRetryAt,200);assert.equal(merged.providerCooldownScope,'all');assert.deepEqual(left.channels,[{id:'a'}]);
});
test('external cancellation immediately frees a queued request and never cancels unrelated work',async()=>{
 const scheduler=createPullScheduler(()=>({concurrency:1,gapMs:0}),()=>true,1),gate=defer(),controller=new AbortController();
 const active=scheduler.run(()=>gate.promise);const queued=scheduler.run(async()=>99,{signal:controller.signal});const rejected=assert.rejects(queued,/cancelled/);controller.abort();await rejected;assert.equal(scheduler.snapshot().waiting,0);assert.equal(scheduler.snapshot().active,1);gate.resolve(1);assert.equal(await active,1);assert.equal(await scheduler.run(async()=>2),2);
});
test('external cancellation releases a completed response held behind hidden/viewer gates without spinning',async()=>{
 let available=true;const scheduler=createPullScheduler(()=>({concurrency:1,gapMs:0}),()=>available),controller=new AbortController();
 const job=scheduler.run(async()=>{available=false;return 'received';},{signal:controller.signal});const rejected=assert.rejects(job);await drain();assert.equal(scheduler.snapshot().held,true);controller.abort();await rejected;await drain();assert.equal(scheduler.snapshot().held,false);assert.equal(scheduler.snapshot().active,0);
});


test('real refresh actions share eight upstream slots while healthy batches finish ahead of a stalled creator',async()=>{
 const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');const original=globalThis.fetch,gate=defer();let active=0,peak=0,next=0;
 const channels=Array.from({length:24},(_,i)=>{const channelId='UC'+String(i+9000).padStart(22,'0');return{id:'yt:'+channelId,channelId,kind:'youtube',handle:'native'+i,title:'Native '+i};});
 globalThis.fetch=async(url,init)=>{const data=JSON.parse(init.body);peak=Math.max(peak,++active);try{if(data.browseId===channels[0].channelId)await gate.promise;else await new Promise(resolve=>setTimeout(resolve,700));return Response.json({metadata:{channelMetadataRenderer:{externalId:data.browseId}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+data.browseId+'/streams'}},browseEndpoint:{browseId:data.browseId,params:'streams'}},content:{richGridRenderer:{contents:[]}}}}]}}});}finally{active--;}};
 const calls=[];const queue=createCompletionQueue({concurrency:3,take:()=>next<24?channels.slice(next,next+=8):undefined,request:async batch=>{const call=runRefreshRemotes({channels:batch,youtubeLiveOnly:true,youtubeRequestGapMs:1500});calls.push(call);return call;}});
 let watchdog;try{const timeout=new Promise((_,reject)=>watchdog=setTimeout(()=>reject(Error('healthy batches waited for the stalled creator')),6000));const first=await Promise.race([queue.next(),timeout]);assert.equal(first.ok,true);assert.equal(first.value.refreshedIds.length,8);assert(!first.item.some(c=>c.id===channels[0].id));const second=await Promise.race([queue.next(),timeout]);assert.equal(second.value.refreshedIds.length,8);assert.equal(peak,8,'concurrent client batches fill but never exceed the global upstream cap');gate.resolve();assert.equal((await queue.next()).value.refreshedIds.length,8);assert.equal(await queue.next(),undefined);}finally{clearTimeout(watchdog);gate.resolve();queue.close();await Promise.allSettled(calls);globalThis.fetch=original;}
});
