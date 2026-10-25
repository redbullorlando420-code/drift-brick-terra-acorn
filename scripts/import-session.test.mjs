import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {cleanImportSession,emptyImportSession,mergeImportSessions,importSessionEntries} from '../src/lib/videos/import-session.ts';
globalThis.__importDisk=new Map();globalThis.__diskBlocked=false;
registerHooks({resolve(s,c,n){if(s==='./persist'&&c.parentURL?.includes('import-session-storage.ts'))return {url:'data:text/javascript,export const readWorkspaceDocument=async key=>globalThis.__importDisk.get(key);export const saveWorkspaceDocuments=async rows=>{if(globalThis.__diskBlocked)throw Error("Disk blocked");for(const row of rows)globalThis.__importDisk.set(row.key,row.value);};',shortCircuit:true};try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const values=new Map();let quota=false;globalThis.localStorage={getItem:key=>values.get(key)??null,setItem:(key,value)=>{if(quota)throw Error('QuotaExceeded');values.set(key,value);}};
test('normalized import history preserves raw drafts and isolates service lists',()=>{
 const local={...emptyImportSession('twitch'),draft:'NotYoda\nhttps://twitch.tv/LIRIK',saved:['NotYoda'],updatedAt:5};
 const disk={...local,draft:'older',saved:['notyoda','LIRIK'],updatedAt:1};
 const merged=mergeImportSessions(local,disk);assert.equal(merged.draft,local.draft);assert.deepEqual(merged.saved,['NotYoda','LIRIK']);assert.equal(cleanImportSession(local,'youtube'),undefined);assert.deepEqual(importSessionEntries('twitch',['User_Name','user_name','https://www.twitch.tv/User_Name']),['User_Name']);
});
test('IndexedDB backup restores exact edited lists when local storage writes fail',async()=>{
 quota=true;const first=await import('../src/lib/videos/import-session-storage.ts?quota-one');
 const saved={...emptyImportSession('twitch'),draft:'NotYoda\ncohh_carnage',query:'SingleUser',profile:'my_profile',saved:['NotYoda','cohh_carnage'],updatedAt:Date.now()};
 assert.deepEqual(await first.saveImportSession(saved),{disk:true,mirror:false});
 const reloaded=await import('../src/lib/videos/import-session-storage.ts?quota-two');assert.deepEqual(await reloaded.loadImportSession('twitch'),saved);assert.deepEqual((await reloaded.loadImportSession('youtube')).saved,[]);
});
test('new edits win over asynchronous older restores and total storage failure is reported',async()=>{
 const module=await import('../src/lib/videos/import-session-storage.ts?failure');
 const latest={...emptyImportSession('twitch'),draft:'latest edit',updatedAt:Date.now()+1};module.stageImportSession(latest);assert.equal((await module.loadImportSession('twitch')).draft,'latest edit');globalThis.__diskBlocked=true;
 await assert.rejects(module.saveImportSession(latest),/could not save/);assert.equal(module.readLocalImportSession('twitch').draft,'latest edit');globalThis.__diskBlocked=false;quota=false;
});
