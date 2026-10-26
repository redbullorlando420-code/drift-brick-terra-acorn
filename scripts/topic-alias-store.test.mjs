import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
const now=Date.now(),entry={alias:'sience',topic:'science',at:now,method:'spelling-review',titleCount:2,sources:['youtube']};let finish;const fixture={local:{version:1,updatedAt:now,entries:[entry]},durable:new Promise(resolve=>finish=resolve),writes:[],ok:true};globalThis.__topicAliasStoreFixture=fixture;globalThis.window=new EventTarget();
registerHooks({resolve(s,c,n){if(c.parentURL?.endsWith('/topic-alias-store.ts')&&s==='./videos/persist')return {shortCircuit:true,url:'data:text/javascript,'+encodeURIComponent('const f=globalThis.__topicAliasStoreFixture;export const loadTopicAliasesSync=()=>f.local;export const restoreTopicAliases=()=>f.durable;export const saveTopicAliases=value=>{f.writes.push(structuredClone(value));return Promise.resolve(f.ok);};')};try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const store=await import('../src/lib/topic-alias-store.ts'),aliases=await import('../src/lib/videos/topic-aliases.ts');const turn=()=>new Promise(resolve=>setTimeout(resolve,0));
test('local review loads without writes and a durable old mirror cannot resurrect a later Undo',async()=>{
 assert.equal(aliases.reviewedTopic('sience'),'science');assert.equal(fixture.writes.length,0);const pending=store.hydrateTopicAliases();store.reviewTopicAlias(entry,true);await turn();assert.equal(aliases.reviewedTopic('sience'),undefined);finish(fixture.local);await pending;assert.equal(aliases.reviewedTopic('sience'),undefined);assert.equal(fixture.writes.at(-1).entries.length,0);
});
test('approved evidence, JSON reload and backup import retain provenance, while legacy/future payloads cannot wipe decisions',async()=>{
 store.reviewTopicAlias(entry);await turn();const backup=structuredClone(aliases.getTopicAliases());store.reviewTopicAlias(entry,true);await turn();store.importTopicAliases(JSON.parse(JSON.stringify(backup)));await turn();assert.deepEqual(aliases.getTopicAliases().entries,backup.entries);const writes=fixture.writes.length;for(const bad of [undefined,{version:2,updatedAt:0,entries:[]},{version:1,updatedAt:NaN,entries:[]}])store.importTopicAliases(bad);assert.equal(fixture.writes.length,writes);assert.deepEqual(aliases.getTopicAliases().entries,backup.entries);
});
test('both-mirror save failure stays usable in the session and retry saves its exact current decisions',async()=>{
 fixture.ok=false;store.reviewTopicAlias({...entry,alias:'tecnology',topic:'technology'});await turn();assert.equal(store.topicAliasSaveStatus(),'failed');assert.equal(aliases.reviewedTopic('tecnology'),'technology');const current=structuredClone(aliases.getTopicAliases());fixture.ok=true;store.retryTopicAliasSave();await turn();assert.equal(store.topicAliasSaveStatus(),'saved');assert.deepEqual(fixture.writes.at(-1),current);
});
