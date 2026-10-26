import type { LibraryVideo } from './types';
import { titleRejectionTarget } from './recommendation-rejections.ts';
export const EXPOSURE_LIMIT = 2048, EXPOSURE_PENDING_LIMIT = 256;
export const EXPOSURE_DWELL_MS = 2000, EXPOSURE_COOLDOWN_MS = 30 * 60_000;
export const EXPOSURE_TTL_MS = 30 * 86_400_000, EXPOSURE_HALF_LIFE_MS = 7 * 86_400_000;
export type ExposureEntry = { key: string; count: number; at: number };
export type ExposureLedger = { version: 1; updatedAt: number; entries: ExposureEntry[] };
export const EMPTY_EXPOSURE: ExposureLedger = { version: 1, updatedAt: 0, entries: [] };
export const exposureKey = titleRejectionTarget;
export function isExposureLedger(raw: unknown): raw is ExposureLedger {
 const value=raw as Partial<ExposureLedger>|undefined;
 return Boolean(value&&value.version===1&&Number.isSafeInteger(value.updatedAt)&&value.updatedAt!>=0&&Array.isArray(value.entries));
}
export function normalizeExposure(raw: unknown, now=Date.now()): ExposureLedger {
 if(!isExposureLedger(raw))return EMPTY_EXPOSURE;
 const entries=new Map<string,ExposureEntry>();
 for(const row of raw.entries.slice(0,EXPOSURE_LIMIT*2)) {
  if(!row||typeof row.key!=='string'||!row.key||row.key.length>500||!Number.isInteger(row.count)||row.count<1||!Number.isSafeInteger(row.at)||row.at<0||row.at>now||now-row.at>=EXPOSURE_TTL_MS)continue;
  const previous=entries.get(row.key);
  if(!previous||row.at>=previous.at)entries.set(row.key,{key:row.key,count:Math.min(8,row.count),at:row.at});
 }
 return {version:1,updatedAt:raw.updatedAt,entries:[...entries.values()].sort((a,b)=>b.at-a.at||a.key.localeCompare(b.key)).slice(0,EXPOSURE_LIMIT)};
}
export function newestExposure(a:unknown,b:unknown,now=Date.now()) {
 const left=normalizeExposure(a,now),right=normalizeExposure(b,now);return right.updatedAt>=left.updatedAt?right:left;
}
export function applyExposureEvents(ledger:ExposureLedger,events:readonly {key:string;at:number}[],now=Date.now()):ExposureLedger {
 const rows=new Map(normalizeExposure(ledger,now).entries.map(row=>[row.key,row]));let changed=false;
 for(const event of events.slice(0,EXPOSURE_PENDING_LIMIT)) {
  if(!event.key||event.key.length>500||!Number.isSafeInteger(event.at)||event.at<0||event.at>now||now-event.at>=EXPOSURE_TTL_MS)continue;
  const old=rows.get(event.key);
  if(old&&event.at-old.at<EXPOSURE_COOLDOWN_MS)continue;
  rows.set(event.key,{key:event.key,count:Math.min(8,(old?.count??0)+1),at:event.at});changed=true;
 }
 return changed?normalizeExposure({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),entries:[...rows.values()]},now):ledger;
}
export function clearExposure(ledger:ExposureLedger,key?:string,now=Date.now()):ExposureLedger {
 return {version:1,updatedAt:Math.max(now,ledger.updatedAt+1),entries:key?ledger.entries.filter(row=>row.key!==key):[]};
}
/** A temporary novelty penalty, never an unavailable/hidden flag or negative taste training. */
export function createExposurePenalty(ledger?:ExposureLedger,now=Date.now()) {
 const entries=new Map(normalizeExposure(ledger,now).entries.map(row=>[row.key,row]));
 return (video:LibraryVideo,protection:{favorite?:boolean;liked?:boolean;creatorFavorite?:boolean;rating?:number}={})=>{
  if(protection.favorite||protection.liked||protection.creatorFavorite||(protection.rating??0)>=4)return 0;
  const row=entries.get(exposureKey(video));if(!row)return 0;
  return Math.min(18,row.count*3)*Math.pow(0.5,Math.max(0,now-row.at)/EXPOSURE_HALF_LIFE_MS);
 };
}
