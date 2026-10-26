import { loadTopicAliasesSync,restoreTopicAliases,saveTopicAliases } from './videos/persist';
import { changeTopicAlias,getTopicAliases,installTopicAliases,isTopicAliasLedger,newestTopicAliases,normalizeTopicAliases,type TopicAliasDecision } from './videos/topic-aliases.ts';
let started=false,pending:Promise<void>|undefined,status:'saved'|'pending'|'failed'='saved',attempt=0;
function notify(){if(typeof window!=='undefined'){window.dispatchEvent(new Event('reelcase:topic-alias-change'));window.dispatchEvent(new Event('reelcase:rating-change'));}}
export function ensureTopicAliases(){if(started||typeof window==='undefined')return;started=true;installTopicAliases(loadTopicAliasesSync());}
export function hydrateTopicAliases(){ensureTopicAliases();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreTopicAliases().then(saved=>{const changed=installTopicAliases(newestTopicAliases(saved,getTopicAliases()));if(changed.length)notify();}).catch(()=>{pending=undefined;});}
function save(){const current=++attempt;status='pending';void saveTopicAliases(getTopicAliases()).then(ok=>{if(current!==attempt)return;status=ok?'saved':'failed';if(typeof window!=='undefined')window.dispatchEvent(new Event('reelcase:topic-alias-save'));},()=>{if(current!==attempt)return;status='failed';if(typeof window!=='undefined')window.dispatchEvent(new Event('reelcase:topic-alias-save'));});}
export function reviewTopicAlias(entry:TopicAliasDecision,remove=false){ensureTopicAliases();const next=changeTopicAlias(getTopicAliases(),entry,remove);if(next===getTopicAliases())return;installTopicAliases(next);save();notify();}
export function retryTopicAliasSave(){save();}
export const topicAliasSaveStatus=()=>status;
export function importTopicAliases(raw:unknown){if(!isTopicAliasLedger(raw))return;ensureTopicAliases();const current=getTopicAliases(),parsed=normalizeTopicAliases(raw);installTopicAliases({...parsed,updatedAt:Math.max(Date.now(),current.updatedAt+1)});save();notify();}
ensureTopicAliases();
