import {ADULT_PULL_PROVIDERS,type AdultPullProvider} from './adult-providers.ts';
import {adultAdapter} from './adult-provider-adapters.ts';
import {myFreeCamsRoomUrl} from './official-room.ts';
import type {RemoteRef} from './types.ts';
export type ProviderViewMode='embedded'|'website';
export type ProviderViewChoice={mode:ProviderViewMode;url:string;at:number};
export type ProviderViewing={version:1;updatedAt:number;choices:Partial<Record<AdultPullProvider,ProviderViewChoice>>};
export const EMPTY_PROVIDER_VIEWING:ProviderViewing={version:1,updatedAt:0,choices:{}};
const known=(id:unknown):id is AdultPullProvider=>typeof id==='string'&&(ADULT_PULL_PROVIDERS as readonly string[]).includes(id);
export const providerCanEmbed=(id:unknown)=>{const r=adultAdapter(id);return !!r&&(r.player==='embed'||r.player==='mixed'||r.pageView===true);};
/** Persist only canonical first-party destinations. Tracking/auth parameters,
 * credentials, arbitrary hosts and embed URLs never enter this ledger. */
export function safeProviderUrl(provider:unknown,value:unknown):string|undefined{
 if(!known(provider)||typeof value!=='string'||value.length>2048)return;
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.port)return;const host=u.hostname.toLowerCase(),p=u.pathname;
  if(provider==='myfreecams'){if(!['myfreecams.com','www.myfreecams.com','app.myfreecams.com'].includes(host))return;const name=host==='app.myfreecams.com'?p.slice(1):u.hash.slice(1);if(!name||name.toLowerCase()==='homepage')return 'https://app.myfreecams.com/';return /^[a-z0-9_]{1,50}$/i.test(name)?'https://app.myfreecams.com/'+name:undefined;}
  if(provider==='eporner'&&['www.eporner.com','eporner.com'].includes(host)&&(p==='/'||/^\/video-[a-z0-9]+(?:\/[^?#]*)?$/i.test(p)))return 'https://www.eporner.com'+p;
  if(provider==='redtube'&&['www.redtube.com','redtube.com'].includes(host)&&(p==='/'||/^\/\d+(?:\/[^?#]*)?$/.test(p)))return 'https://www.redtube.com'+p;
  if(provider==='chaturbate'&&['www.chaturbate.com','chaturbate.com'].includes(host)&&(p==='/'||/^\/[a-z0-9_]+\/?$/i.test(p)))return 'https://chaturbate.com'+p;
  if(provider==='redgifs'&&['www.redgifs.com','redgifs.com'].includes(host)&&(p==='/'||/^\/watch\/[a-z0-9_-]+\/?$/i.test(p)))return 'https://www.redgifs.com'+p;
  if(provider==='reddit'&&['www.reddit.com','reddit.com','old.reddit.com'].includes(host)&&(p==='/'||/^\/r\/[a-z0-9_]+\/(?:comments\/[a-z0-9]+(?:\/[^?#]*)?)?$/i.test(p)))return 'https://www.reddit.com'+p;
  const booru=['rule34.xxx','gelbooru.com','realbooru.com','xbooru.com','tbib.org','hypnohub.net'];
  if(provider==='booru'&&booru.includes(host)){if(p==='/')return u.origin+'/';if(p==='/index.php'&&u.searchParams.get('page')==='post'&&u.searchParams.get('s')==='view'&&/^\d+$/.test(u.searchParams.get('id')??''))return u.origin+'/index.php?page=post&s=view&id='+u.searchParams.get('id');}
  if(provider==='booru'&&host==='e621.net'&&(p==='/'||/^\/posts\/\d+\/?$/.test(p)))return u.origin+p;
 }catch{/* Invalid URLs stay unapplied. */}
}
export function officialAdultUrl(remote?:RemoteRef){
 if(!remote||!known(remote.kind))return;const safe=safeProviderUrl(remote.kind,remote.watchUrl);if(safe)return safe;
 const id=remote.videoId??'';if(remote.kind==='myfreecams')return myFreeCamsRoomUrl(remote);
 if(remote.kind==='eporner'&&/^[a-z0-9]+$/i.test(id))return 'https://www.eporner.com/video-'+id+'/';
 if(remote.kind==='redtube'&&/^\d+$/.test(id))return 'https://www.redtube.com/'+id;
 if(remote.kind==='chaturbate'&&/^[a-z0-9_]{1,50}$/i.test(id))return 'https://chaturbate.com/'+id+'/';
 if(remote.kind==='redgifs'&&/^[a-z0-9_-]+$/i.test(id))return 'https://www.redgifs.com/watch/'+id;
 return adultAdapter(remote.kind)?.home;
}
export function parseProviderViewing(raw:unknown):ProviderViewing{
 const r=raw as ProviderViewing;if(!r||r.version!==1||!Number.isSafeInteger(r.updatedAt)||r.updatedAt<0||!r.choices||typeof r.choices!=='object'||Array.isArray(r.choices)||Object.keys(r.choices).length>7)throw Error('Unsupported provider viewing preferences.');
 const choices:ProviderViewing['choices']={};for(const [id,v]of Object.entries(r.choices)){if(!known(id)||!v||!['embedded','website'].includes(v.mode)||v.mode==='embedded'&&!providerCanEmbed(id)||!Number.isSafeInteger(v.at)||v.at<0)throw Error('Invalid provider viewing choice.');const url=safeProviderUrl(id,v.url);if(!url)throw Error('Invalid official provider URL.');choices[id]={mode:v.mode,url,at:v.at};}
 return {version:1,updatedAt:r.updatedAt,choices};
}
export function normalizeProviderViewing(raw:unknown){try{return parseProviderViewing(raw);}catch{return EMPTY_PROVIDER_VIEWING;}}
export function newestProviderViewing(a:unknown,b:unknown){const left=normalizeProviderViewing(a),right=normalizeProviderViewing(b);return right.updatedAt>=left.updatedAt?right:left;}
export function chooseProviderView(ledger:ProviderViewing,id:AdultPullProvider,mode:ProviderViewMode,url:string,now=Date.now()){
 const safe=safeProviderUrl(id,url);if(!safe)throw Error('Use a valid official provider link.');if(ledger.choices[id]?.mode===mode&&ledger.choices[id]?.url===safe)return ledger;
 return parseProviderViewing({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),choices:{...ledger.choices,[id]:{mode,url:safe,at:now}}});
}
export function forgetProviderView(ledger:ProviderViewing,id:AdultPullProvider,now=Date.now()){if(!ledger.choices[id])return ledger;const choices={...ledger.choices};delete choices[id];return {...ledger,choices,updatedAt:Math.max(now,ledger.updatedAt+1)};}
export const providerLoginGuidance=(id:string)=>({summary:'Use the official site in its own tab and your usual browser profile. Browser cookie restrictions can make embedded sign-in repeat; full screen is still an embedded page.',boundary:'A login in another tab or browser does not guarantee that this embedded view is authenticated. Realhub cannot inspect, copy or repair provider cookies or credentials.',specific:id==='myfreecams'?'MyFreeCams has no integrated video player here. The optional whole-page view may refuse sign-in or share/profile panels. Keep those panels on their official top-level site.':'If the provider blocks the embedded player, continue on its official site. Provider access restrictions still apply.'});
