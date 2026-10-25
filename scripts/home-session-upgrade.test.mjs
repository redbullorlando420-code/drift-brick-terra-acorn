import {registerHooks} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {youtubeCoverageIndexAsync}=await import('../src/lib/remote/youtube-coverage.ts');
const {watchHiddenPage}=await import('../src/lib/hidden-page-release.ts');
const row=(i)=>({id:'yt:'+i,folderId:'yt:owner',name:'Upload',path:'',size:0,addedAt:1,extension:'yt',mime:'video/youtube',remote:{kind:'youtube',videoId:String(i),channelId:'owner'}});
async function withTurns(work){
 const saved=Object.getOwnPropertyDescriptor(globalThis,'scheduler'),queue=[];let turns=0;
 Object.defineProperty(globalThis,'scheduler',{configurable:true,value:{postTask:fn=>new Promise(resolve=>queue.push(()=>{turns++;resolve(fn());}))}});
 const drain=async()=>{for(let i=0;i<10000;i++){while(queue.length)queue.shift()();await new Promise(resolve=>setImmediate(resolve));if(!queue.length)return;}throw Error('Unbounded coverage work');};
 try{await work({drain,turns:()=>turns});}finally{if(saved)Object.defineProperty(globalThis,'scheduler',saved);else delete globalThis.scheduler;}
}
test('rapid catalog replacement cancels 80 obsolete scans before they read rows; newest scan completes',async()=>withTurns(async({drain,turns})=>{
 let obsoleteVisits=0;const jobs=[];
 for(let i=0;i<80;i++){
  const rows=Array.from({length:10000},(_,j)=>row(j)),controller=new AbortController();
  Object.defineProperty(rows,0,{get(){obsoleteVisits++;return row(0);}});
  const job=youtubeCoverageIndexAsync(rows,controller.signal);jobs.push(assert.rejects(job,{name:'AbortError'}));controller.abort();
 }
 const latest=Array.from({length:1200},(_,i)=>row(i)),done=youtubeCoverageIndexAsync(latest,new AbortController().signal);
 await drain();await Promise.all(jobs);assert.equal(obsoleteVisits,0);assert.equal((await done).bySource.get('yt:owner'),1200);assert(turns()<=84);
}));
test('one canceled reader cannot cancel another reader or durable archive scheduling',async()=>withTurns(async({drain})=>{
 for(const durable of [false,true]){
  const rows=Array.from({length:1200},(_,i)=>row(i)),a=new AbortController(),b=new AbortController();
  const first=youtubeCoverageIndexAsync(rows,a.signal),second=durable?youtubeCoverageIndexAsync(rows):youtubeCoverageIndexAsync(rows,b.signal);
  const rejected=assert.rejects(first,{name:'AbortError'});a.abort();await drain();await rejected;assert.equal((await second).distinctVideos,1200);
  assert.equal(await youtubeCoverageIndexAsync(rows),await second);
 }
}));
test('last-reader cancellation permits immediate retry and old finalization cannot delete the replacement',async()=>withTurns(async({drain})=>{
 const rows=Array.from({length:1200},(_,i)=>row(i)),a=new AbortController();
 const old=youtubeCoverageIndexAsync(rows,a.signal),rejected=assert.rejects(old,{name:'AbortError'});a.abort();
 const next=youtubeCoverageIndexAsync(rows);assert.equal(youtubeCoverageIndexAsync(rows),next);await drain();await rejected;assert.equal((await next).distinctVideos,1200);
 const aborted=new AbortController();aborted.abort();await assert.rejects(youtubeCoverageIndexAsync(rows,aborted.signal),{name:'AbortError'});
}));
test('hidden third-party pages use one cancelable deadline and release once without auto-resuming',()=>{
 const page=Object.assign(new EventTarget(),{hidden:false}),timers=new Map();let id=0,releases=0;
 const surface=Object.assign(new EventTarget(),{setTimeout(fn,ms){assert.equal(ms,60000);timers.set(++id,fn);return id;},clearTimeout(id){timers.delete(id);}});
 const runtime={page,surface},stop=watchHiddenPage(()=>releases++,60000,runtime);
 for(let i=0;i<100;i++){page.hidden=true;page.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,1);page.hidden=false;page.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,0);}
 page.hidden=true;page.dispatchEvent(new Event('visibilitychange'));[...timers.values()][0]();assert.equal(timers.size,0);assert.equal(releases,1);
 page.hidden=false;page.dispatchEvent(new Event('visibilitychange'));surface.dispatchEvent(new Event('pagehide'));assert.equal(releases,1);
 stop();page.hidden=true;page.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,0);
});
test('pagehide releases immediately; unmount cancels every listener and pending hidden timer',()=>{
 const page=Object.assign(new EventTarget(),{hidden:true}),timers=new Map();let id=0,releases=0;
 const surface=Object.assign(new EventTarget(),{setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout(id){timers.delete(id);}});
 const stop=watchHiddenPage(()=>releases++,60000,{page,surface});assert.equal(timers.size,1);stop();surface.dispatchEvent(new Event('pagehide'));assert.equal(releases,0);assert.equal(timers.size,0);
 const off=watchHiddenPage(()=>releases++,60000,{page,surface});surface.dispatchEvent(new Event('pagehide'));assert.equal(releases,1);assert.equal(timers.size,0);off();
});
