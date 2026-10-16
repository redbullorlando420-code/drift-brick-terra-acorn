import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier,context); } catch(error) { if(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`,context); throw error; } } });
const { searchWorkerIndex } = await import('../src/lib/videos/search-worker-index.ts');
test('nearby searches reuse a ready worker; inactivity actually frees it', async t => {
  const workers=[];
  class Worker {
    rows=[]; batches=0; terminated=false;
    constructor() { workers.push(this); }
    terminate() { this.terminated=true; }
    postMessage(packet) {
      if(packet.type==='continue') return;
      if(packet.type==='batch') { this.batches++; if(packet.reset)this.rows=[]; this.rows.push(...packet.batch); queueMicrotask(()=>this.onmessage?.({data:{type:packet.done?'ready':'next',generation:packet.generation}})); }
      if(packet.type==='search') queueMicrotask(()=>this.onmessage?.({data:{type:'result',generation:packet.generation,requestId:packet.requestId,ids:this.rows.map(row=>row.video.id),positions:Uint32Array.from(this.rows.map((_,i)=>i))}}));
    }
  }
  const originalWorker=globalThis.Worker, originalScheduler=globalThis.scheduler;
  globalThis.Worker=Worker; globalThis.scheduler={postTask:async work=>work()};
  t.mock.timers.enable({apis:['setTimeout']});
  const videos=[{id:'one',name:'One',path:'one',folderId:'public',extension:'mp4',mime:'video/mp4',size:0,addedAt:1}]; const tags={},categories={};
  try {
    searchWorkerIndex.sync(videos,tags,categories);
    const result=await searchWorkerIndex.searchMatches('one');
    assert.equal(result.videos,videos); assert.deepEqual([...result.positions],[0]);
    searchWorkerIndex.retire(); assert.equal(searchWorkerIndex.getStatus(),'ready'); assert.equal(workers[0].terminated,false);
    searchWorkerIndex.sync(videos,tags,categories); await searchWorkerIndex.search('one');
    assert.equal(workers.length,1); assert.equal(workers[0].batches,1);
    searchWorkerIndex.retire(); t.mock.timers.tick(30_000); searchWorkerIndex.retire(); t.mock.timers.tick(30_000);
    assert.equal(workers[0].terminated,true); assert.equal(searchWorkerIndex.getStatus(),'idle');
  } finally { searchWorkerIndex.release(); globalThis.Worker=originalWorker; globalThis.scheduler=originalScheduler; }
});

async function fixture(t, run, scheduler = { postTask: async work => work() }) {
  const workers=[];
  class Worker {
    rows=[]; packets=[]; terminated=false;
    constructor() { workers.push(this); }
    terminate() { this.terminated=true; }
    postMessage(packet) {
      this.packets.push(packet);
      if(packet.type==='continue') return;
      if(packet.type==='batch') {
        if(packet.reset)this.rows=[];
        this.rows.push(...packet.batch);
        queueMicrotask(()=>this.onmessage?.({data:{type:packet.done?'ready':'next',generation:packet.generation}}));
      }
      if(packet.type==='search') queueMicrotask(()=>this.onmessage?.({data:{type:'result',generation:packet.generation,requestId:packet.requestId,ids:this.rows.map(row=>row.video.id),positions:Uint32Array.from(this.rows.map((_,i)=>i))}}));
    }
  }
  const originalWorker=globalThis.Worker, originalScheduler=globalThis.scheduler;
  globalThis.Worker=Worker; globalThis.scheduler=scheduler;
  try { await run(workers); } finally { searchWorkerIndex.release(); globalThis.Worker=originalWorker; globalThis.scheduler=originalScheduler; }
}
const video = id => ({id,name:id,path:id,folderId:'public',extension:'mp4',mime:'video/mp4',size:0,addedAt:1});

test('compact search packets reduce round trips while preserving complete metadata and positions', async t => {
  await fixture(t, async workers => {
    const videos=Array.from({length:10_000},(_,i)=>video(`v${i}`));
    const tags={v123:['my-tag']},categories={v123:'Custom'};
    searchWorkerIndex.sync(videos,tags,categories);
    const result=await searchWorkerIndex.searchMatches('v');
    const packets=workers[0].packets.filter(p=>p.type==='batch');
    assert.ok(packets.some(p=>p.batch.length>128));
    assert.ok(packets.every(p=>p.batch.length<=512));
    assert.deepEqual(result.ids,videos.map(v=>v.id));
    assert.equal(result.positions[9999],9999);
    assert.deepEqual(workers[0].rows[123].tags,['my-tag']);
    assert.equal(workers[0].rows[123].category,'Custom');
    const dense=[{...video('dense1'),description:'x'.repeat(70_000)},{...video('dense2'),description:'y'.repeat(70_000)}];
    searchWorkerIndex.sync(dense,tags,categories);
    await searchWorkerIndex.searchMatches('dense');
    assert.equal(workers[0].rows[0].video.description.length,70_000);
    assert.ok(workers[0].packets.filter(p=>p.type==='batch'&&p.generation===workers[0].packets.at(-1).generation).every(p=>p.batch.length===1));
  });
});

test('search index reuse checks copied catalogs cooperatively and indexes only the appended suffix', async t => {
  const turns=[];
  const scheduler={postTask: work=>new Promise(resolve=>turns.push(()=>resolve(work())))};
  const drain=async()=>{ while(turns.length) { turns.shift()(); await new Promise(resolve=>setImmediate(resolve)); } };
  await fixture(t, async workers => {
    const videos=Array.from({length:100_000},(_,i)=>video(`v${i}`)), tags={},categories={};
    searchWorkerIndex.sync(videos,tags,categories);
    const first=searchWorkerIndex.searchMatches('v'); await drain(); await first;
    const count=workers[0].packets.filter(p=>p.type==='batch').length;
    let reads=0;
    const copied=new Proxy([...videos],{get(target,key,receiver){if(/^\d+$/.test(String(key)))reads++;return Reflect.get(target,key,receiver);}});
    searchWorkerIndex.sync(copied,tags,categories);
    assert.equal(reads,0,'sync never enters the catalog on the effect stack');
    const copyResult=searchWorkerIndex.searchMatches('v');
    turns.shift()(); await new Promise(resolve=>setImmediate(resolve));
    assert.ok(reads>0&&reads<=2048,'comparison has a bounded first slice');
    await drain(); assert.equal((await copyResult).videos,copied);
    assert.equal(workers[0].packets.filter(p=>p.type==='batch').length,count);
    const appended=[...copied,video('new')];
    searchWorkerIndex.sync(appended,tags,categories);
    const next=searchWorkerIndex.searchMatches('v'); await drain();
    assert.equal((await next).ids.at(-1),'new');
    const batches=workers[0].packets.filter(p=>p.type==='batch');
    assert.equal(batches.length,count+1); assert.equal(batches.at(-1).reset,false);
    assert.equal(batches.at(-1).batch.length,1);
  },scheduler);
});

test('superseded search comparisons cannot publish stale positions and reordered snapshots rebuild', async t => {
  const turns=[];
  const scheduler={postTask: work=>new Promise(resolve=>turns.push(()=>resolve(work())))};
  const drain=async()=>{ while(turns.length) { turns.shift()(); await new Promise(resolve=>setImmediate(resolve)); } };
  await fixture(t, async workers => {
    const videos=Array.from({length:3000},(_,i)=>video(`v${i}`)),tags={},categories={};
    searchWorkerIndex.sync(videos,tags,categories);
    const initial=searchWorkerIndex.searchMatches('v');await drain();await initial;
    searchWorkerIndex.sync([...videos],tags,categories);
    const reordered=[...videos].reverse();
    searchWorkerIndex.sync(reordered,tags,categories);
    const result=searchWorkerIndex.searchMatches('v');await drain();
    assert.deepEqual((await result).ids,reordered.map(v=>v.id));
    const copies=[...reordered];let reads=0;
    const held=new Proxy(copies,{get(target,key,receiver){if(/^\d+$/.test(String(key)))reads++;return Reflect.get(target,key,receiver);}});
    searchWorkerIndex.sync(held,tags,categories);
    const canceled=searchWorkerIndex.searchMatches('v');searchWorkerIndex.release();await drain();
    assert.equal(reads,0);assert.equal(await canceled,null);assert.equal(workers[0].terminated,true);
  },scheduler);
});
