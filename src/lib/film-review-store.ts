import {loadFilmReviewsSync,restoreFilmReviews,saveFilmReviews} from './videos/persist';
import {EMPTY_FILMS,newestFilms,normalizeFilmLedger,parseFilmLedger,type FilmLedger} from './videos/film-review.ts';
type Snapshot={ledger:FilmLedger;status:'saved'|'pending'|'failed';ready:boolean};
const server:Snapshot={ledger:EMPTY_FILMS,status:'saved',ready:false},listeners=new Set<()=>void>();let snapshot=server,started=false,pending:Promise<void>|undefined,attempt=0;
const emit=()=>{for(const listener of listeners)listener();};
export function getFilmReviews(){if(!started&&typeof window!=='undefined'){started=true;snapshot={...snapshot,ledger:normalizeFilmLedger(loadFilmReviewsSync())};}return snapshot;}
export const getServerFilmReviews=()=>server;
export function subscribeFilmReviews(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function hydrateFilmReviews(){getFilmReviews();if(typeof window==='undefined')return Promise.resolve();return pending??=restoreFilmReviews().then(saved=>{const next=newestFilms(saved,snapshot.ledger);snapshot={...snapshot,ledger:JSON.stringify(next)===JSON.stringify(snapshot.ledger)?snapshot.ledger:next,ready:true};emit();}).catch(()=>{snapshot={...snapshot,ready:true};pending=undefined;emit();});}
function save(){const current=++attempt;snapshot={...snapshot,status:'pending'};emit();void saveFilmReviews(snapshot.ledger).then(ok=>{if(current!==attempt)return;snapshot={...snapshot,status:ok?'saved':'failed'};emit();},()=>{if(current!==attempt)return;snapshot={...snapshot,status:'failed'};emit();});}
export function changeFilmReviews(change:(ledger:FilmLedger)=>FilmLedger){const old=getFilmReviews().ledger,next=change(old);if(next===old)return;snapshot={...snapshot,ledger:next};save();}
export function retryFilmReviewSave(){save();}
export function importFilmReviews(raw:unknown){const old=getFilmReviews().ledger,parsed=parseFilmLedger(raw);snapshot={...snapshot,ledger:{...parsed,updatedAt:Math.max(Date.now(),old.updatedAt+1)}};save();}
