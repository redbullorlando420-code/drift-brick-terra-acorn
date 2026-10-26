import {loadGuidePresetSync,restoreGuidePreset,saveGuidePreset} from './videos/persist';
import {changeGuidePreset,rollbackGuidePreset,newestGuidePreset,normalizeGuidePreset,isGuidePreset,EMPTY_GUIDE_PRESET,type GuideWeights} from './videos/guide-preset.ts';
let ledger=EMPTY_GUIDE_PRESET,started=false,pending:Promise<void>|undefined,status:'saved'|'pending'|'failed'='saved',attempt=0;
const notify=(name='reelcase:guide-preset-change')=>{if(typeof window!=='undefined')window.dispatchEvent(new Event(name));};
export function getGuidePreset(){if(!started&&typeof window!=='undefined'){started=true;ledger=normalizeGuidePreset(loadGuidePresetSync());}return ledger;}
export function hydrateGuidePreset(){getGuidePreset();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreGuidePreset().then(saved=>{const next=newestGuidePreset(saved,ledger);if(JSON.stringify(next)!==JSON.stringify(ledger)){ledger=next;notify();}}).catch(()=>{pending=undefined;});}
function save(){const current=++attempt;status='pending';void saveGuidePreset(ledger).then(ok=>{if(current!==attempt)return;status=ok?'saved':'failed';notify('reelcase:guide-preset-save');},()=>{if(current!==attempt)return;status='failed';notify('reelcase:guide-preset-save');});}
/** Called only by explicit acceptance of a reviewed current-library experiment. */
export function acceptGuidePreset(weights:GuideWeights){const next=changeGuidePreset(getGuidePreset(),weights);if(next===ledger)return;ledger=next;save();notify();}
export function undoGuidePreset(){const next=rollbackGuidePreset(getGuidePreset());if(next===ledger)return;ledger=next;save();notify();}
export const guidePresetSaveStatus=()=>status;
export function retryGuidePresetSave(){save();}
export function importGuidePreset(raw:unknown){if(!isGuidePreset(raw))return;const old=getGuidePreset(),parsed=normalizeGuidePreset(raw);ledger=normalizeGuidePreset({...parsed,updatedAt:Math.max(Date.now(),old.updatedAt+1)});save();notify();}
