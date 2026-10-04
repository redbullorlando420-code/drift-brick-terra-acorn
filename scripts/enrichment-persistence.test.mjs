import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`,import.meta.url).href,context);
  try{return next(specifier,context);}catch(error){if(specifier.startsWith('.')&&!/\.[a-z]+$/i.test(specifier))return next(specifier+'.ts',context);throw error;}
} });
const {saveEnrichmentRows,restoreEnrichmentRows,removeEnrichmentRows,savePrefs,loadPrefs,restoreDurablePrefs,waitForPrefsWrites,restoreTagEdits,restoreMetadataEdits}=await import('../src/lib/videos/persist.ts');
const {patchSparseRecord}=await import('../src/lib/sparse-record.ts');
test('actual sparse persistence batches restore in 256-row pages without reading full preferences or losing locks', async()=>{
  const saved=Object.fromEntries(['indexedDB','IDBKeyRange','window','localStorage'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const disk=new Map(),reads=[],writes=[];let closes=0,fail=false;
  const db={close(){closes++;},transaction(store,mode){
    assert.equal(store,'activity');const tx={};const pending=[];
    tx.objectStore=()=>({put(value,key){pending.push([key,structuredClone(value)]);},delete(key){pending.push([key,undefined]);},get(key){const req={};setImmediate(()=>{req.result=structuredClone(disk.get(key));req.onsuccess();});return req;},getAll(range,count){
      assert.equal(count,256);reads.push({range,count});const req={};
      setImmediate(()=>{req.result=[...disk].sort(([a],[b])=>a.localeCompare(b)).filter(([key])=>(range.lowerOpen?key>range.lower:key>=range.lower)&&key<range.upper).slice(0,count).map(([,value])=>structuredClone(value));req.onsuccess();});return req;
    }});
    if(mode==='readwrite')setImmediate(()=>{if(fail){tx.error=Error('quota');tx.onabort();}else{pending.forEach(([key,value])=>value===undefined?disk.delete(key):disk.set(key,value));writes.push(pending.length);tx.oncomplete();}});
    return tx;
  }};
  Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){const req={};setImmediate(()=>{req.result=db;req.onsuccess();});return req;}}});
  Object.defineProperty(globalThis,'IDBKeyRange',{configurable:true,value:{bound(lower,upper,lowerOpen,upperOpen){return{lower,upper,lowerOpen,upperOpen};}}});
  try{
    const rows=Array.from({length:700},(_,i)=>({id:`id:${String(i).padStart(4,'0')}`,tags:['science'],provenance:{tags:{science:'provider:youtube'},updatedAt:2}}));
    disk.set('preferences',{tags:{unrelated:['keep']}});await saveEnrichmentRows(rows);
    assert.ok(writes.every(count=>count<=64));assert.equal(writes.reduce((a,b)=>a+b,0),700);assert.equal(disk.size,701);
    const base={tags:{'id:0000':['manual'],'id:0001':['newer'],unrelated:['keep']},metadataProvenance:{'id:0000':{tags:{manual:'manual'},lockedFields:['tags'],updatedAt:1},'id:0001':{tags:{newer:'legacy'},updatedAt:4}}};
    const result=await restoreEnrichmentRows(base);assert.deepEqual(result.tags['id:0000'],['manual']);assert.deepEqual(result.tags['id:0001'],['newer']);assert.deepEqual(result.tags['id:0699'],['science']);
    assert.deepEqual(base.tags,{ 'id:0000':['manual'],'id:0001':['newer'],unrelated:['keep'] });assert.equal(Object.keys(result.tags).length,701);assert.equal(reads.length,3);
    fail=true;await assert.rejects(saveEnrichmentRows([{...rows[0],id:'failed'}]),/quota/);assert.equal(disk.has('metadata-enrichment:failed'),false);
    fail=false;await removeEnrichmentRows(['id:0699']);assert.equal(disk.has('metadata-enrichment:id:0699'),false);assert.ok(disk.has('preferences'));
    assert.equal(closes,4,'database handles close after save, restore, failed write, and deletion');
    const local=new Map();Object.defineProperty(globalThis,'window',{configurable:true,value:{dispatchEvent(){}}});
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>local.get(key)??null,setItem:(key,value)=>local.set(key,value)}});
    const sparseTags=patchSparseRecord(result.tags,[['id:0002',['manual-later']]]);
    const sparseMetadata=patchSparseRecord(result.metadataProvenance,[['id:0002',{tags:{'manual-later':'manual'},lockedFields:['tags'],updatedAt:4}]]);
    savePrefs({favorites:['saved'],likes:[],tags:sparseTags,metadataProvenance:sparseMetadata,view:'grid',sort:'added',sourceId:'home',viewCounts:{},categories:{},progress:{},resumeProgress:{},history:[]});
    await waitForPrefsWrites();assert.equal(disk.get('preferences').sparseMetadataRecords.tags.__reelcaseSparseRecord,1,'IndexedDB receives cloneable data, never a Proxy');
    assert.equal(disk.get('preferences').tags.__reelcaseSparseRecord,undefined,'legacy readers retain their ordinary tag dictionary');
    assert.deepEqual(disk.get('preferences').tags.unrelated,['keep']);
    assert.equal(disk.get('preferences').tags,disk.get('preferences').sparseMetadataRecords.tags.snapshot.base,'structured clone keeps one shared baseline');
    await restoreDurablePrefs();const prefs=loadPrefs();
    assert.deepEqual(prefs.tags['id:0002'],['manual-later']);assert.deepEqual(prefs.tags['id:0699'],['science']);assert.deepEqual(prefs.favorites,['saved']);
    assert.deepEqual(prefs.metadataProvenance['id:0002'].lockedFields,['tags']);
    const recovered=await restoreEnrichmentRows(prefs);assert.deepEqual(recovered.tags['id:0002'],['manual-later']);
    local.set('reelcase.tag-edits.v1',JSON.stringify({'id:0003':['journal']}));
    local.set('reelcase.tag-provenance-edits.v1',JSON.stringify({'id:0003':{tags:{journal:'manual'},lockedFields:['tags']}}));
    assert.deepEqual(restoreTagEdits(recovered.tags)['id:0003'],['journal']);assert.deepEqual(restoreMetadataEdits(recovered.metadataProvenance)['id:0003'].lockedFields,['tags']);
    const guarded=new Proxy({unchanged:['keep']},{ownKeys(){throw Error('base enumeration during recovery');}});
    const sparseRecovery=await restoreEnrichmentRows({tags:guarded,metadataProvenance:{}});assert.deepEqual(sparseRecovery.tags.unchanged,['keep']);
  }finally{for(const[key,descriptor]of Object.entries(saved))if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}
});
