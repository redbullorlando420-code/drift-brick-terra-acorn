import { readWorkspaceDocument, saveWorkspaceDocuments } from './videos/persist';
import { EMPTY_MODEL_NOTES, readModelNotes } from './studio-model-notes';
import { EMPTY_STUDIO_JOBS, readStudioJobs, type StudioJob } from './studio-jobs';
function document<T extends {updatedAt:number}>(owner:string,kind:string,parse:(raw:unknown)=>T,empty:T){
  if(!owner)throw Error('A current app user is required.');const key='studio:v1:'+encodeURIComponent(owner)+':'+kind;let timestamp=0;
  return {
    async load(){const candidates:T[]=[];let warning='',present=false;try{const text=localStorage.getItem(key);if(text){present=true;candidates.push(parse(JSON.parse(text)));}}catch{warning='A local studio record could not be read.';}
      try{const raw=await readWorkspaceDocument(key);if(raw){present=true;candidates.push(parse(raw));}}catch{warning='The disk studio record could not be read.';}
      if(!candidates.length&&present)throw Error('Saved studio data is unreadable. Export your current work before replacing it.');const value=candidates.sort((a,b)=>b.updatedAt-a.updatedAt)[0]??empty;timestamp=value.updatedAt;return {value,warning};},
    async save(raw:T){const value=parse({...raw,updatedAt:Math.max(Date.now(),timestamp+1,raw.updatedAt)});let local=false,disk=false;try{localStorage.setItem(key,JSON.stringify(value));local=true;}catch{}try{await saveWorkspaceDocuments([{key,value}]);disk=true;}catch{}if(!local&&!disk)throw Error('Studio storage failed. Nothing new was submitted; retry the save or export your work.');timestamp=value.updatedAt;return {value,warning:local&&disk?'':local?'Saved in the local mirror only; disk storage is unavailable.':'Saved on disk only; the local mirror is unavailable.'};},
  };
}
export const modelNotesDocument=(owner:string)=>document(owner,'model-notes',readModelNotes,EMPTY_MODEL_NOTES);
export function studioJobsDocument(owner:string){const doc=document(owner,'jobs',readStudioJobs,EMPTY_STUDIO_JOBS);return {load:async()=>(await doc.load()).value.jobs,save:async(jobs:StudioJob[])=>{const result=await doc.save({version:1,updatedAt:Date.now(),jobs});return result.warning;}};}
