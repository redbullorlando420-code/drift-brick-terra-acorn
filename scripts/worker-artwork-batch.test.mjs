import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(s,c,next){try{return next(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return next(s+'.ts',c);throw e;}}});
const {createBitmapPool}=await import('../src/lib/videos/bitmap-pool.ts');
const {createThumbnailQueue}=await import('../src/lib/videos/thumbnail-queue.ts');
const {searchWorkerIndex:index}=await import('../src/lib/videos/search-worker-index.ts');
const turn=()=>new Promise(resolve=>setImmediate(resolve));
test('100 cancelled viewports cannot exceed the native decode limit or publish obsolete bitmaps',async()=>{
 let limit=4,starts=0,closed=0;const native=[];
 const pool=createBitmapPool({limit:()=>limit,decode:source=>{starts++;return new Promise(resolve=>native.push(()=>resolve({width:source,height:1,close:()=>closed++})));}});
 for(let i=0;i<100;i++){const c=new AbortController(),work=pool.request(i,c.signal);await turn();c.abort();await assert.rejects(work,/cancel/);assert(pool.snapshot().active<=4);assert.equal(pool.snapshot().queued,0);}
 assert.equal(starts,4);assert.equal(pool.snapshot().active,4);assert.equal(pool.snapshot().cancelled,100);limit=1;
 const survivor=pool.request(123);await turn();assert.equal(starts,4);for(const finish of native.splice(0))finish();await turn();await turn();assert.equal(closed,4);assert.equal(pool.snapshot().closedLate,4);assert.equal(starts,5);
 native.shift()();const bitmap=await survivor;assert.equal(bitmap.width,123);bitmap.close();await turn();assert.equal(pool.snapshot().active,0);assert.equal(pool.snapshot().peak,4);pool.dispose();
});
test('queued decoding has strict backpressure, cancellation releases source references and disposal is idempotent',async()=>{
 let finish,watched=0;const pool=createBitmapPool({limit:()=>1,queueLimit:2,subscribe:()=>{watched++;return()=>watched--;},decode:()=>new Promise(resolve=>finish=resolve)});
 const one=new AbortController(),two=new AbortController(),three=new AbortController();const a=pool.request({},one.signal),b=pool.request({},two.signal),c=pool.request({},three.signal);await turn();await assert.rejects(pool.request({}),/full/);two.abort();await assert.rejects(b,/cancel/);assert.equal(pool.snapshot().queued,1);pool.dispose();pool.dispose();await assert.rejects(a,/cancel/);await assert.rejects(c,/cancel/);assert.equal(watched,0);let closed=0;finish({width:1,height:1,close:()=>closed++});await turn();assert.equal(closed,1);assert.equal(pool.snapshot().active,0);
});
test('decode failures free capacity and lowered limits stop dispatch until native work settles',async()=>{
 let limit=2,wake;const pending=[];const pool=createBitmapPool({limit:()=>limit,subscribe:fn=>{wake=fn;return()=>{};},decode:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))});
 const a=pool.request(1),b=pool.request(2),c=pool.request(3);await turn();limit=1;wake();pending[0].reject(Error('native failed'));await assert.rejects(a,/decoded/);await turn();assert.equal(pending.length,2);pending[1].resolve({width:1,height:1,close(){}});(await b).close();await turn();assert.equal(pending.length,3);pending[2].resolve({width:1,height:1,close(){}});(await c).close();await turn();assert.equal(pool.snapshot().active,0);pool.dispose();
});
test('thumbnail queue withdraws excess low-priority jobs when the worker budget shrinks',async()=>{
 let workers=4;const jobs=[];const queue=createThumbnailQueue({workers:()=>workers,delay:()=>0});
 for(let i=0;i<4;i++)queue.enqueue(String(i),signal=>new Promise(resolve=>jobs.push({signal,resolve})),i===3?'high':'low');await turn();workers=1;queue.wake();assert.equal(jobs.filter(j=>j.signal.aborted).length,3);assert.equal(jobs[3].signal.aborted,false);queue.clear();for(const job of jobs)job.resolve();await turn();assert.equal(queue.snapshot().active,0);assert.equal(queue.snapshot().jobs,0);queue.dispose();
});
function video(id){return{id,name:id,path:id,folderId:'public',extension:'mp4',mime:'video/mp4',size:0,addedAt:1};}
async function workers(run){
 const previous=globalThis.Worker,scheduler=globalThis.scheduler,all=[];
 class Worker{rows=[];hold=false;terminated=false;constructor(){all.push(this);}terminate(){this.terminated=true;}postMessage(p){this.last=p;if(p.type==='batch'){if(p.reset)this.rows=[];this.rows.push(...p.batch);queueMicrotask(()=>this.onmessage?.({data:{type:p.done?'ready':'next',generation:p.generation}}));}if(p.type==='search'&&!this.hold){const positions=this.rows.map((row,i)=>[row,i]).filter(([row])=>row.video.name.includes(p.query)).map(([,i])=>i);queueMicrotask(()=>this.onmessage?.({data:{type:'result',generation:p.generation,requestId:p.requestId,ids:positions.map(i=>this.rows[i].video.id),positions:Uint32Array.from(positions)}}));}}}
 globalThis.Worker=Worker;globalThis.scheduler={postTask:async work=>work()};try{await run(all,Worker);}finally{index.release();globalThis.Worker=previous;globalThis.scheduler=scheduler;}
}
test('a crash settles pending search, releases the catalog and retries only after explicit intent',async()=>workers(async all=>{
 const rows=[video('old'),video('latest')],tags={},categories={};index.sync(rows,tags,categories);await index.search('old');all[0].hold=true;const pending=index.searchMatches('old');const stale=all[0].onmessage,packet=all[0].last;let prevented=false;all[0].onerror({preventDefault(){prevented=true;}});assert.equal(await pending,null);assert(prevented);assert(all[0].terminated);assert.equal(index.diagnostics().workers,0);assert.equal(index.diagnostics().pending,0);assert.equal(index.diagnostics().packed,0);
 index.sync(rows,tags,categories);assert.equal(all.length,1);index.retry(rows,tags,categories);const retry=await index.searchMatches('latest');assert.deepEqual(retry.ids,['latest']);stale({data:{type:'result',generation:packet.generation,requestId:packet.requestId,ids:['old'],positions:Uint32Array.of(0)}});assert.equal(index.getStatus(),'ready');assert.equal(all.length,2);
}));
test('silent search timeout and unreadable results leave a retry state with no retained worker',async t=>workers(async all=>{
 t.mock.timers.enable({apis:['setTimeout']});const rows=[video('one')];index.sync(rows,{},{});await index.search('one');all[0].hold=true;const held=index.search('one');t.mock.timers.tick(15001);assert.equal(await held,null);assert.equal(index.getStatus(),'failed');assert.match(index.diagnostics().lastFailure,/timed out/);index.retry(rows,{},{});await index.search('one');all[1].hold=true;const bad=index.search('one');all[1].onmessage({data:{...all[1].last,type:'result',ids:['one'],positions:[]}});assert.equal(await bad,null);assert.equal(index.diagnostics().workers,0);assert.equal(index.getStatus(),'failed');
}));
test('superseding a held generation drains its request and ignores the late result',async()=>workers(async all=>{
 const rows=[video('first')];index.sync(rows,{},{});await index.search('first');all[0].hold=true;const held=index.search('first'),old=all[0].last;index.sync([video('last')],{},{});assert.equal(await held,null);all[0].hold=false;const last=index.search('last');all[0].onmessage({data:{type:'result',generation:old.generation,requestId:old.requestId,ids:['first'],positions:Uint32Array.of(0)}});assert.deepEqual(await last,['last']);assert.equal(index.diagnostics().pending,0);
}));
test('constructor and postMessage failure are recovered without an unhandled exception',async()=>workers(async(all,Worker)=>{
 globalThis.Worker=class{constructor(){throw Error('controlled constructor');}};const rows=[video('one')];index.sync(rows,{},{});assert.equal(index.getStatus(),'failed');globalThis.Worker=Worker;index.retry(rows,{},{});await index.search('one');all[0].postMessage=()=>{throw Error('controlled message');};assert.equal(await index.search('one'),null);assert.equal(index.getStatus(),'failed');assert.equal(index.diagnostics().workers,0);
}));
