import { useCallback, useEffect, useRef, useState } from 'react';
import { loadImportSession, readLocalImportSession, saveImportSession, stageImportSession } from '@/lib/videos/import-session-storage';
import { importSessionEntries, type ImportSession } from '@/lib/videos/import-session';
import type { FollowKind } from '@/lib/videos/types';
export function useImportSession(kind:FollowKind){
 const [value,setValue]=useState(()=>readLocalImportSession(kind)),current=useRef(value),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),mounted=useRef(true);
 const [notice,setNotice]=useState('');
 const flush=useCallback(async()=>{
   if(timer.current!==undefined){clearTimeout(timer.current);timer.current=undefined;}
   const saved=current.current;
   try{const result=await saveImportSession(saved);if(mounted.current&&current.current===saved)setNotice(result.disk?'Saved on this device.':'Saved in browser storage. The disk backup is unavailable.');}
   catch(error){if(mounted.current)setNotice(error instanceof Error?error.message:'The list could not be saved.');}
 },[]);
 useEffect(()=>{
   mounted.current=true;let cancelled=false;
   const initial=readLocalImportSession(kind);current.current=initial;setValue(initial);setNotice('');
   void loadImportSession(kind).then(saved=>{if(cancelled)return;if(current.current===initial){current.current=saved;setValue(saved);}else{const merged={...current.current,saved:importSessionEntries(kind,[...current.current.saved,...saved.saved])};current.current=merged;setValue(merged);stageImportSession(merged);}if(current.current.draft||current.current.saved.length)void flush();});
   const hide=()=>{void flush();};window.addEventListener('pagehide',hide);
   return()=>{cancelled=true;mounted.current=false;window.removeEventListener('pagehide',hide);if(timer.current!==undefined)void flush();};
 },[kind,flush]);
 const update=useCallback((patch:Partial<Pick<ImportSession,'draft'|'query'|'profile'|'saved'>>)=>{
   const base=current.current.kind===kind?current.current:readLocalImportSession(kind);
   const next={...base,...patch,updatedAt:Math.max(Date.now(),base.updatedAt+1)};
   current.current=next;setValue(next);stageImportSession(next);setNotice('Saving…');
   if(timer.current!==undefined)clearTimeout(timer.current);timer.current=setTimeout(()=>void flush(),300);return next;
 },[kind,flush]);
 return {session:value.kind===kind?value:readLocalImportSession(kind),update,flush,notice};
}
