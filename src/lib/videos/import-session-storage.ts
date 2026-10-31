import { readWorkspaceDocument, saveWorkspaceDocuments } from './persist';
import { CoalescedWriter } from '../coalesced-writer';
import { cleanImportSession, emptyImportSession, importSessionKey, mergeImportSessions, type ImportSession } from './import-session';
import type { FollowKind } from './types';
const memory=new Map<FollowKind,ImportSession>();
const writer=new CoalescedWriter<string,ImportSession>(rows=>saveWorkspaceDocuments(rows.map(([key,value])=>({key,value}))));
export function readLocalImportSession(kind:FollowKind){
 const cached=memory.get(kind);if(cached)return cached;
 const value=emptyImportSession(kind);
 if(typeof localStorage==='undefined')return value;
 try{value.review=JSON.parse(localStorage.getItem(`reelcase.import-review.${kind}`)??'null');value.draft=(localStorage.getItem(`reelcase.import-draft.${kind}`)??'').slice(0,500000);value.query=(localStorage.getItem(`reelcase.import-query.${kind}`)??'').slice(0,20000);value.profile=(localStorage.getItem(`reelcase.import-profile.${kind}`)??'').slice(0,200);const saved=JSON.parse(localStorage.getItem(`reelcase.import-history.${kind}`)??'[]');value.saved=Array.isArray(saved)?saved:[];value.updatedAt=Number(localStorage.getItem(`reelcase.import-updated.${kind}`))||0;}catch{/* IndexedDB recovery can still restore a blocked mirror. */}
 return cleanImportSession(value,kind)??emptyImportSession(kind);
}
export function stageImportSession(value:ImportSession){memory.set(value.kind,value);}
export async function saveImportSession(value:ImportSession){
 stageImportSession(value);let mirror=true;
 for(const [field,text] of [['draft',value.draft],['query',value.query],['profile',value.profile],['history',JSON.stringify(value.saved)],['review',JSON.stringify(value.review??null)]] as const){try{const key=`reelcase.import-${field}.${value.kind}`;if(localStorage.getItem(key)!==text)localStorage.setItem(key,text);}catch{mirror=false;}}
 if(mirror)try{localStorage.setItem(`reelcase.import-updated.${value.kind}`,String(value.updatedAt));}catch{mirror=false;}
 try{await writer.write(importSessionKey(value.kind),value);return {disk:true,mirror};}catch{if(!mirror)throw Error('This browser could not save the list. Keep this page open or copy your list before leaving.');return {disk:false,mirror};}
}
export async function loadImportSession(kind:FollowKind){
 const local=readLocalImportSession(kind);let disk:ImportSession|undefined;
 try{disk=cleanImportSession(await readWorkspaceDocument(importSessionKey(kind)),kind);}catch{/* Local mirror and session stay usable. */}
 const current=memory.get(kind)??local;
 const result=mergeImportSessions(current,disk);stageImportSession(result);return result;
}
