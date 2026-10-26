import {loadAnimeReviewsSync,restoreAnimeReviews,saveAnimeReviews} from './videos/persist';
import {EMPTY_ANIME_REVIEWS,newestAnimeReviews,normalizeAnimeReviews,parseAnimeReviews,type AnimeReviewLedger} from './videos/anime-review.ts';
type Snapshot={ledger:AnimeReviewLedger;status:'saved'|'pending'|'failed';ready:boolean};
const server:Snapshot={ledger:EMPTY_ANIME_REVIEWS,status:'saved',ready:false},listeners=new Set<()=>void>();
let snapshot=server,started=false,pending:Promise<void>|undefined,attempt=0;
const emit=()=>{for(const listener of listeners)listener();};
export function getAnimeReviews(){if(!started&&typeof window!=='undefined'){started=true;snapshot={...snapshot,ledger:normalizeAnimeReviews(loadAnimeReviewsSync())};}return snapshot;}
export const getServerAnimeReviews=()=>server;
export function subscribeAnimeReviews(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function hydrateAnimeReviews(){getAnimeReviews();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreAnimeReviews().then(saved=>{const next=newestAnimeReviews(saved,snapshot.ledger);snapshot={...snapshot,ledger:JSON.stringify(next)===JSON.stringify(snapshot.ledger)?snapshot.ledger:next,ready:true};emit();}).catch(()=>{snapshot={...snapshot,ready:true};pending=undefined;emit();});}
function save(){const current=++attempt;snapshot={...snapshot,status:'pending'};emit();void saveAnimeReviews(snapshot.ledger).then(ok=>{if(current!==attempt)return;snapshot={...snapshot,status:ok?'saved':'failed'};emit();},()=>{if(current!==attempt)return;snapshot={...snapshot,status:'failed'};emit();});}
export function changeAnimeReviews(change:(ledger:AnimeReviewLedger)=>AnimeReviewLedger){const old=getAnimeReviews().ledger,next=change(old);if(next===old)return;snapshot={...snapshot,ledger:next};save();}
export function retryAnimeReviewSave(){save();}
export function importAnimeReviews(raw:unknown){const old=getAnimeReviews().ledger,parsed=parseAnimeReviews(raw);snapshot={...snapshot,ledger:{...parsed,updatedAt:Math.max(Date.now(),old.updatedAt+1)}};save();}
