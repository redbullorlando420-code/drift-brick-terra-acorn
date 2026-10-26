import { scheduleBackgroundWork } from './interaction-budget';
import { loadRecommendationExposureSync,restoreRecommendationExposure,saveRecommendationExposure } from './videos/persist';
import { EMPTY_EXPOSURE,EXPOSURE_COOLDOWN_MS,EXPOSURE_PENDING_LIMIT,normalizeExposure,newestExposure,applyExposureEvents,clearExposure,exposureKey,isExposureLedger,type ExposureLedger } from './videos/recommendation-exposure.ts';
import type { LibraryVideo } from './videos/types';
let ledger:ExposureLedger|undefined,revision=0,hydrating:Promise<void>|undefined;
let timer:ReturnType<typeof setTimeout>|undefined,cancelWork:(()=>void)|undefined,dirty=false,attempt=0;
let status:'saved'|'pending'|'failed'='saved';
const pending=new Map<string,number>();
function notify(){if(typeof window!=='undefined')window.dispatchEvent(new Event('reelcase:exposure-change'));}
function read(){return ledger??=typeof window==='undefined'?EMPTY_EXPOSURE:normalizeExposure(loadRecommendationExposureSync());}
export function hydrateRecommendationExposure(){
 if(typeof window==='undefined')return Promise.resolve();
 return hydrating??=restoreRecommendationExposure().then(saved=>{const current=read();ledger=newestExposure(saved,current);if(JSON.stringify(ledger)!==JSON.stringify(current)){revision++;notify();refreshExposureRecommendations();}}).catch(()=>{hydrating=undefined;});
}
export function getRecommendationExposure(){
 read();if(pending.size){ledger=applyExposureEvents(ledger!,[...pending].map(([key,at])=>({key,at})));pending.clear();}
 return ledger!;
}
export const getExposureRevision=()=>revision;
export function exposureDiagnostics(){return {entries:getRecommendationExposure().entries.length,pending:pending.size,status};}
function queue(){
 dirty=true;attempt++;status='pending';
 if(timer!==undefined||cancelWork)return;
 timer=setTimeout(()=>{timer=undefined;cancelWork=scheduleBackgroundWork(()=>{cancelWork=undefined;flushRecommendationExposure();},{timeoutMs:10000});},5000);
}
export function recordRecommendationExposure(key:string,now=Date.now()){
 if(!key||key.length>500||pending.has(key)||pending.size>=EXPOSURE_PENDING_LIMIT)return;
 const previous=read().entries.find(row=>row.key===key);if(previous&&now-previous.at<EXPOSURE_COOLDOWN_MS)return;
 pending.set(key,now);revision++;queue();
}
export function flushRecommendationExposure(){
 if(timer!==undefined)clearTimeout(timer);timer=undefined;cancelWork?.();cancelWork=undefined;
 if(!dirty)return;dirty=false;const value=getRecommendationExposure(),current=++attempt;
 void saveRecommendationExposure(value).then(ok=>{if(current!==attempt)return;status=ok?'saved':'failed';notify();},()=>{if(current!==attempt)return;status='failed';notify();});
}
export function retryRecommendationExposure(){dirty=true;flushRecommendationExposure();}
export function markRecommendationOpened(video:LibraryVideo){
 const current=getRecommendationExposure(),key=exposureKey(video);
 if(!current.entries.some(row=>row.key===key))return;
 ledger=clearExposure(current,key);revision++;queue();
}
export function resetRecommendationExposure(){ledger=clearExposure(getRecommendationExposure());pending.clear();revision++;queue();flushRecommendationExposure();refreshExposureRecommendations();notify();}
export function importRecommendationExposure(raw:unknown){if(!isExposureLedger(raw))return;ledger={...normalizeExposure(raw),updatedAt:Math.max(Date.now(),getRecommendationExposure().updatedAt+1)};pending.clear();revision++;queue();flushRecommendationExposure();refreshExposureRecommendations();notify();}
export function refreshExposureRecommendations(){if(typeof window!=='undefined')window.dispatchEvent(new Event('reelcase:rating-change'));}
if(typeof window!=='undefined'){
 const hide=()=>{if(document.visibilityState==='hidden')flushRecommendationExposure();};
 window.addEventListener('pagehide',flushRecommendationExposure);document.addEventListener('visibilitychange',hide);
 import.meta.hot?.dispose(()=>{flushRecommendationExposure();window.removeEventListener('pagehide',flushRecommendationExposure);document.removeEventListener('visibilitychange',hide);});
}
