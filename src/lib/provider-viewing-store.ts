import {loadProviderViewingSync,restoreProviderViewing,saveProviderViewing} from './videos/persist';
import {EMPTY_PROVIDER_VIEWING,newestProviderViewing,normalizeProviderViewing,parseProviderViewing,type ProviderViewing} from './videos/provider-viewing.ts';
type Snapshot={ledger:ProviderViewing;status:'saved'|'pending'|'failed';ready:boolean;legacyMfc:boolean};
const server:Snapshot={ledger:EMPTY_PROVIDER_VIEWING,status:'saved',ready:false,legacyMfc:false},listeners=new Set<()=>void>();let snapshot=server,started=false,pending:Promise<void>|undefined,attempt=0;
const emit=()=>{for(const listener of listeners)listener();};
export function getProviderViewing(){if(!started&&typeof window!=='undefined'){started=true;let legacyMfc=false;try{legacyMfc=localStorage.getItem('reelcase.mfc.view-mode.v1')==='embedded';}catch{/* Session defaults remain usable. */}snapshot={...snapshot,ledger:normalizeProviderViewing(loadProviderViewingSync()),legacyMfc};}return snapshot;}
export const getServerProviderViewing=()=>server;
export function subscribeProviderViewing(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function hydrateProviderViewing(){getProviderViewing();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreProviderViewing().then(saved=>{const next=newestProviderViewing(saved,snapshot.ledger);snapshot={...snapshot,ledger:JSON.stringify(next)===JSON.stringify(snapshot.ledger)?snapshot.ledger:next,ready:true};emit();}).catch(()=>{snapshot={...snapshot,ready:true};pending=undefined;emit();});}
function save(){const current=++attempt;snapshot={...snapshot,status:'pending'};emit();void saveProviderViewing(snapshot.ledger).then(ok=>{if(current!==attempt)return;snapshot={...snapshot,status:ok?'saved':'failed'};emit();},()=>{if(current!==attempt)return;snapshot={...snapshot,status:'failed'};emit();});}
export function changeProviderViewing(change:(ledger:ProviderViewing)=>ProviderViewing){const old=getProviderViewing().ledger,next=change(old);if(next===old)return;snapshot={...snapshot,ledger:next};save();}
export function retryProviderViewingSave(){save();}
export function importProviderViewing(raw:unknown){const old=getProviderViewing().ledger,parsed=parseProviderViewing(raw);snapshot={...snapshot,ledger:{...parsed,updatedAt:Math.max(Date.now(),old.updatedAt+1)},legacyMfc:false};save();}
