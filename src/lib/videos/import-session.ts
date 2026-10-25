import { canonicalFollowHandle } from './follow-identity.ts';
import type { FollowKind } from './types.ts';
export type ImportSession={version:1;kind:FollowKind;draft:string;query:string;profile:string;saved:string[];updatedAt:number};
export const importSessionKey=(kind:FollowKind)=>`imports:v1:${kind}`;
export function emptyImportSession(kind:FollowKind):ImportSession{return {version:1,kind,draft:'',query:'',profile:'',saved:[],updatedAt:0};}
export function importSessionEntries(kind:FollowKind,values:readonly unknown[]){
 const seen=new Set<string>(),result:string[]=[];
 for(const value of values){if(typeof value!=='string'||!value.trim()||value.length>1000)continue;const key=canonicalFollowHandle(kind,value);if(!key||seen.has(key))continue;seen.add(key);result.push(value.trim());if(result.length===10000)break;}return result;
}
export function cleanImportSession(value:unknown,kind:FollowKind):ImportSession|undefined{
 if(!value||typeof value!=='object')return;const row=value as Partial<ImportSession>;
 if(row.version!==1||row.kind!==kind||typeof row.draft!=='string'||typeof row.query!=='string'||typeof row.profile!=='string'||!Array.isArray(row.saved)||typeof row.updatedAt!=='number'||!Number.isFinite(row.updatedAt)||row.updatedAt<0)return;
 return {version:1,kind,draft:row.draft.slice(0,500000),query:row.query.slice(0,20000),profile:row.profile.slice(0,200),saved:importSessionEntries(kind,row.saved),updatedAt:row.updatedAt};
}
export function mergeImportSessions(local:ImportSession,disk:ImportSession|undefined){
 if(!disk)return local;
 const newest=disk.updatedAt>local.updatedAt?disk:local,other=newest===disk?local:disk;
 return {...newest,saved:importSessionEntries(local.kind,[...newest.saved,...other.saved])};
}
