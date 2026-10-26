import {loadTopicBridgesSync,restoreTopicBridges,saveTopicBridges} from './videos/persist';
import {changeBridge,newestBridges,normalizeBridgeLedger,isBridgeLedger,EMPTY_BRIDGES,type BridgeLedger,type BridgePause} from './videos/topic-bridges.ts';
let ledger=EMPTY_BRIDGES,started=false,pending:Promise<void>|undefined,status:'saved'|'pending'|'failed'='saved',attempt=0;
const notify=(name='reelcase:bridge-change')=>{if(typeof window!=='undefined')window.dispatchEvent(new Event(name));};
export function getTopicBridges(){if(!started&&typeof window!=='undefined'){started=true;ledger=normalizeBridgeLedger(loadTopicBridgesSync());}return ledger;}
export function hydrateTopicBridges(){getTopicBridges();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreTopicBridges().then(saved=>{const next=newestBridges(saved,ledger);if(JSON.stringify(next)!==JSON.stringify(ledger)){ledger=next;notify();}}).catch(()=>{pending=undefined;});}
function save(){const current=++attempt;status='pending';void saveTopicBridges(ledger).then(ok=>{if(current!==attempt)return;status=ok?'saved':'failed';notify('reelcase:bridge-save');},()=>{if(current!==attempt)return;status='failed';notify('reelcase:bridge-save');});}
export function pauseTopicBridge(row:BridgePause,remove=false){const next=changeBridge(getTopicBridges(),row,remove);if(next===ledger)return;ledger=next;save();notify();}
export const topicBridgeSaveStatus=()=>status;
export function retryTopicBridgeSave(){save();}
export function importTopicBridges(raw:unknown){if(!isBridgeLedger(raw))return;const current=getTopicBridges(),parsed=normalizeBridgeLedger(raw);ledger={...parsed,updatedAt:Math.max(Date.now(),current.updatedAt+1)};save();notify();}
