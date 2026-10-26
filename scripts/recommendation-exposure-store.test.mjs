import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const fixture={local:null,durable:null,writes:[],ok:true};globalThis.__exposureStoreFixture=fixture;
const events=[];globalThis.window=Object.assign(new EventTarget(),{setTimeout,clearTimeout});globalThis.document=Object.assign(new EventTarget(),{visibilityState:'visible'});window.addEventListener('reelcase:rating-change',()=>events.push('ranking'));
registerHooks({resolve(s,c,n){
 if(c.parentURL?.endsWith('/recommendation-exposure-store.ts')&&s==='./videos/persist')return {shortCircuit:true,url:'data:text/javascript,'+encodeURIComponent('const f=globalThis.__exposureStoreFixture;export const loadRecommendationExposureSync=()=>f.local;export const restoreRecommendationExposure=()=>Promise.resolve(f.durable);export const saveRecommendationExposure=value=>{f.writes.push(structuredClone(value));return Promise.resolve(f.ok);};')};
 try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}
}});
const store=await import('../src/lib/recommendation-exposure-store.ts');
const turn=()=>new Promise(resolve=>setTimeout(resolve,0));
test('visible observations coalesce without synchronous writes or automatic ranking refresh, and snapshots are bounded',async()=>{
 const before=fixture.writes.length;const now=Date.now();
 for(let i=0;i<1000;i++){store.recordRecommendationExposure('youtube:'+i,now);store.recordRecommendationExposure('youtube:'+i,now);}
 assert.equal(fixture.writes.length,before);assert.equal(events.length,0);assert.equal(store.getRecommendationExposure().entries.length,256);
 store.flushRecommendationExposure();await turn();assert.equal(fixture.writes.length,before+1);assert.equal(store.exposureDiagnostics().status,'saved');assert.equal(fixture.writes.at(-1).entries.length,256);
 const revision=store.getExposureRevision();for(let i=0;i<100;i++)store.recordRecommendationExposure('youtube:'+i,now+1);assert.equal(store.getExposureRevision(),revision);store.flushRecommendationExposure();await turn();assert.equal(fixture.writes.length,before+1);
});
test('opening removes only its canonical media identity; background flush saves it and reset cannot resurrect an older mirror',async()=>{
 store.markRecommendationOpened({id:'alias',remote:{kind:'youtube',videoId:'1'}});assert.equal(store.getRecommendationExposure().entries.length,255);window.dispatchEvent(new Event('pagehide'));await turn();assert(!fixture.writes.at(-1).entries.some(row=>row.key==='youtube:1'));
 fixture.durable=structuredClone(fixture.writes.at(-1));store.resetRecommendationExposure();await turn();await store.hydrateRecommendationExposure();assert.deepEqual(store.getRecommendationExposure().entries,[]);assert.equal(events.length,1);
});
test('failed storage remains session-only until explicit retry saves the current bounded ledger',async()=>{
 fixture.ok=false;store.recordRecommendationExposure('local:retry');store.flushRecommendationExposure();await turn();assert.equal(store.exposureDiagnostics().status,'failed');const current=structuredClone(store.getRecommendationExposure());fixture.ok=true;store.retryRecommendationExposure();await turn();assert.equal(store.exposureDiagnostics().status,'saved');assert.deepEqual(fixture.writes.at(-1),current);
});
test('backup restore accepts a valid ledger including empty, ignores malformed/future payloads and never writes on ordinary reads',async()=>{
 const backup=structuredClone(store.getRecommendationExposure());store.resetRecommendationExposure();await turn();store.importRecommendationExposure(backup);await turn();assert.deepEqual(store.getRecommendationExposure().entries,backup.entries);
 const writes=fixture.writes.length;for(const value of [{version:2,updatedAt:0,entries:[]},{version:1,updatedAt:NaN,entries:[]},null])store.importRecommendationExposure(value);assert.equal(fixture.writes.length,writes);for(let i=0;i<100;i++)store.getRecommendationExposure();assert.equal(fixture.writes.length,writes);
 store.importRecommendationExposure({version:1,updatedAt:0,entries:[]});await turn();assert.deepEqual(store.getRecommendationExposure().entries,[]);
});
