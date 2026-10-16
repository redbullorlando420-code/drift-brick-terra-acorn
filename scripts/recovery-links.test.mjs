import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(specifier,context,next){
  if(specifier.startsWith('@/'))return next(new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href,context);
  try{return next(specifier,context);}catch(error){if(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier))return next(`${specifier}.ts`,context);throw error;}
}});
const {prepareRecoveryLinks,createRecoveryLinkWriter}=await import('../src/lib/videos/recovery-links.ts');
const {patchSparseRecord,removeSparseRecordKeys}=await import('../src/lib/sparse-record.ts');
const persist=await import('../src/lib/videos/persist.ts');
const history=id=>({id,url:`https://video.invalid/${id}`,title:id,at:1});
const link=id=>({id,url:`https://video.invalid/${id}`,savedAt:1,source:'bookmark'});

test('cooperative recovery preserves legacy URL precedence, metadata and sparse insertion order',async()=>{
  const rows=[{...history('one'),id:' one ',url:'https://video.invalid/ONE',poster:'poster'},history('one'),{id:'missing',url:'not-a-url',at:1}];
  let resume=patchSparseRecord({'https://video.invalid/old':{t:1,d:20,at:2}},[
    ['https://video.invalid/two',{t:2,d:20,at:3}],['https://video.invalid/ONE',{t:3,d:20,at:4}],
    ['https://video.invalid/THREE',{t:4,d:20,at:5}],['https://video.invalid/three',{t:5,d:20,at:6}],['id:irrelevant',{t:1,d:20,at:1}],
  ]);
  resume=removeSparseRecordKeys(resume,['https://video.invalid/old']);
  resume=patchSparseRecord(resume,[['https://video.invalid/old',{t:6,d:20,at:7}]]);
  const result=await prepareRecoveryLinks({history:rows,resumeProgress:resume},async()=>{});
  assert.deepEqual(result,persist.linksFromHistoryAndResume(rows,resume));
  assert.equal(result[0].title,'one');assert.equal(result[0].poster,'poster');
  assert.equal(result.find(row=>row.url.endsWith('THREE')).savedAt,5);
});

test('dense recovery preparation yields before reads and does not export/sort all sparse keys',async()=>{
  let turns=0,reads=0;
  const rows=Array.from({length:100_000},(_,i)=>history(String(i)));
  const input=new Proxy(rows,{get(target,key,receiver){if(/^\d+$/.test(String(key))){assert.ok(turns>0);reads++;}return Reflect.get(target,key,receiver);}});
  const resume=patchSparseRecord({},Array.from({length:100_000},(_,i)=>[`id:${i}`,{t:1,d:20,at:1}]));
  const sort=Array.prototype.sort;
  Array.prototype.sort=function(compare){assert.ok(this.length<1024,'Full sparse keys exported');return sort.call(this,compare);};
  try{
    const work=prepareRecoveryLinks({history:input,resumeProgress:resume},async()=>{turns++;});assert.equal(reads,0);
    const result=await work;assert.equal(result.length,100_000);assert.equal(result.at(-1).id,'99999');assert.ok(turns>300);
  }finally{Array.prototype.sort=sort;}
});

test('replacement cancels obsolete preparation and bursts retain only one latest input',async()=>{
  let unblock;const block=new Promise(resolve=>{unblock=resolve;});const saved=[];
  const writer=createRecoveryLinkWriter(async rows=>{saved.push(rows);},()=>block);
  const obsolete=new Proxy(Array.from({length:100_000},(_,i)=>history(String(i))),{get(target,key,receiver){if(/^\d+$/.test(String(key)))throw Error('Obsolete history scanned');return Reflect.get(target,key,receiver);}});
  const work=writer.write({history:obsolete,resumeProgress:{}});await Promise.resolve();
  for(let i=0;i<1000;i++)void writer.write({links:[link(`new-${i}`)]});
  assert.equal(writer.diagnostics().pending,1);unblock();await work;
  assert.deepEqual(saved.map(rows=>rows[0].id),['new-999']);
  assert.deepEqual(writer.diagnostics(),{pending:0,preparing:false,writing:false});
});

test('an in-flight disk write stays ordered ahead of the newest direct/imported checkpoint',async()=>{
  let unblock,started;const block=new Promise(resolve=>{unblock=resolve;}),begin=new Promise(resolve=>{started=resolve;});const saved=[];
  const writer=createRecoveryLinkWriter(async rows=>{if(!saved.length){started();await block;}saved.push(rows.map(row=>row.id));},async()=>{});
  const work=writer.write({links:[link('old')]});await begin;
  for(let i=0;i<1000;i++)void writer.write({links:[link(`last-${i}`)]});
  assert.equal(writer.diagnostics().writing,true);assert.equal(writer.diagnostics().pending,1);unblock();await work;
  assert.deepEqual(saved,[['old'],['last-999']]);
});

test('failed older writes still attempt newer checkpoints and subsequent writes can recover',async()=>{
  const saved=[];let fail=true,writer;
  writer=createRecoveryLinkWriter(async rows=>{if(fail){fail=false;void writer.write({links:[link('new')]}).catch(()=>{});throw Error('disk failed');}saved.push(rows[0].id);},async()=>{});
  await assert.rejects(writer.write({links:[link('old')]}),/disk failed/);
  assert.deepEqual(saved,['new']);await writer.write({links:[link('recovered')]});assert.deepEqual(saved,['new','recovered']);
});

test('real recovery checkpoint keeps the full disk list, a bounded mirror, and legacy reload compatibility',async()=>{
  const descriptors=Object.fromEntries(['window','localStorage','indexedDB'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const local=new Map(),disk=new Map();let fail=false;
  const db={close(){},transaction(name){assert.equal(name,'activity');const tx={};tx.objectStore=()=>({put(value,key){if(fail)throw Error('disk failed');disk.set(key,structuredClone(value));},get(key){const req={};setImmediate(()=>{req.result=structuredClone(disk.get(key));req.onsuccess();});return req;}});setImmediate(()=>tx.oncomplete?.());return tx;}};
  Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>local.get(key)??null,setItem:(key,value)=>local.set(key,value),removeItem:key=>local.delete(key)}});
  Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){const req={};setImmediate(()=>{req.result=db;req.onsuccess();});return req;}}});
  const scheduler=globalThis.scheduler;globalThis.scheduler={postTask:async work=>work()};
  try{
    const rows=Array.from({length:10_000},(_,i)=>history(String(i)));
    await persist.saveRecoveryLinks(rows,{});
    assert.equal((await persist.restoreDurableLinks()).length,10_000);
    const payload=[...disk.values()].find(value=>value?.links);assert.equal(payload.links.length,10_000);
    const mirror=[...local.values()].map(value=>JSON.parse(value)).find(value=>value?.links);assert.equal(mirror.links.length,200);
    fail=true;await persist.saveDurableLinks([link('offline')]);
    assert.equal((await persist.restoreDurableLinks()).some(row=>row.id==='offline'),true,'small mirror recovers a failed disk checkpoint');
    fail=false;await persist.saveDurableLinks([link('imported')]);assert.deepEqual((await persist.restoreDurableLinks()).map(row=>row.id),['imported']);
  }finally{globalThis.scheduler=scheduler;for(const[key,descriptor]of Object.entries(descriptors))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
});
