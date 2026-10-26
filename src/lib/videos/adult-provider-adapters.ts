/**
 * Extension point for Adult discovery providers. An adapter must use a
 * documented public API, Atom/RSS feed, or an explicitly permitted embed.
 * It deliberately has no generic page scraper: unsupported sites remain
 * link-out destinations until a stable, lawful integration is added here.
 */

import {ADULT_PULL_PROVIDERS,type AdultPullProvider} from './adult-providers.ts';
export type AdultProviderAdapter = {
  id: string;
  label: string;
  transport: "public-api" | "atom-rss" | "public-embed";
  status: "active" | "planned";
  capabilities: readonly ("catalog" | "search" | "archive" | "poster" | "playback")[];
  media:readonly ('video'|'photo'|'live')[];
  query:'remote-search'|'directory-filter'|'feed-filter'|'tag-search';
  paging:'archive'|'directory'|'rotation';
  player:'embed'|'mixed'|'image'|'external';
  tags:boolean; customOrder:boolean; pageView?:boolean;
  home:string; note:string;
};

export const ADULT_PROVIDER_ADAPTERS: readonly AdultProviderAdapter[] = [
  { id: "eporner", label: "Eporner", transport: "public-api", status: "active", capabilities: ["catalog", "search", "archive", "poster", "playback"],media:['video'],query:'remote-search',paging:'archive',player:'embed',tags:true,customOrder:true,home:'https://www.eporner.com/',note:'Existing search API and provider embed. Provider restrictions can still prevent playback.' },
  { id: "redtube", label: "RedTube", transport: "public-api", status: "active", capabilities: ["catalog", "search", "archive", "poster", "playback"],media:['video'],query:'remote-search',paging:'archive',player:'embed',tags:true,customOrder:true,home:'https://www.redtube.com/',note:'Existing webmaster search and embed. Creator search is specific to this source.' },
  { id: "chaturbate", label: "Chaturbate", transport: "public-api", status: "active", capabilities: ["catalog", "poster", "playback"],media:['live'],query:'directory-filter',paging:'directory',player:'embed',tags:true,customOrder:false,home:'https://chaturbate.com/',note:'Filters the fetched public room directory; this is not a full-site search. Live has separate directory paging.' },
  { id: "myfreecams", label: "MyFreeCams", transport: "public-api", status: "active", capabilities: ["catalog", "poster"],media:['live'],query:'directory-filter',paging:'directory',player:'external',tags:false,customOrder:false,pageView:true,home:'https://app.myfreecams.com/',note:'Public roster and official room links. No in-app video-player integration; the optional whole website is a page view and can reject login or subpanels.' },
  { id: "reddit", label: "Reddit", transport: "atom-rss", status: "active", capabilities: ["catalog", "search", "archive", "poster"],media:['photo','video'],query:'feed-filter',paging:'rotation',player:'mixed',tags:true,customOrder:false,home:'https://www.reddit.com/',note:'Filters the fetched public Atom community window. Media may be a direct file or a supported attached embed; deleted or restricted posts stay unavailable.' },
  { id: "booru", label: "Booru + Rule34 + Gelbooru + e621", transport: "public-api", status: "active", capabilities: ["catalog", "search", "poster"],media:['photo'],query:'tag-search',paging:'archive',player:'image',tags:true,customOrder:false,home:'https://rule34.xxx/',note:'Existing host-specific image adapters and tag queries. No iframe or live player. Existing fallbacks are unchanged; no new host is enabled.' },
  { id: "redgifs", label: "Redgifs", transport: "public-api", status: "active", capabilities: ["catalog", "search", "poster", "playback"],media:['video'],query:'remote-search',paging:'archive',player:'embed',tags:true,customOrder:false,home:'https://www.redgifs.com/',note:'Existing search uses provider trending order and temporary server-side authentication; optional configured fallback stays server-side.' },
];
const byId=new Map(ADULT_PROVIDER_ADAPTERS.map(row=>[row.id,row]));
export function adultAdapter(id:unknown){return typeof id==='string'?byId.get(id):undefined;}
export function canPullAdult(id:unknown):id is AdultPullProvider{const row=adultAdapter(id);return !!row&&row.status==='active'&&row.capabilities.includes('catalog')&&(ADULT_PULL_PROVIDERS as readonly string[]).includes(row.id);}
export function adultSelection(providers:readonly AdultPullProvider[]|'all'){return (providers==='all'?ADULT_PULL_PROVIDERS:providers).map(adultAdapter).filter((row):row is AdultProviderAdapter=>!!row&&canPullAdult(row.id));}
export function adultSelectionCapabilities(providers:readonly AdultPullProvider[]|'all'){const rows=adultSelection(providers);return {rows,archive:rows.some(r=>r.paging!=='directory'),order:rows.some(r=>r.customOrder),directoryOnly:rows.length>0&&rows.every(r=>r.paging==='directory'),query:rows.length===1?rows[0]!.query:'mixed'};}
/** A registry change cannot alter the independent built-in privacy classifier. */
export function adultEmbedUrl(kind:unknown,value:unknown){
 const row=adultAdapter(kind);if(!row||!['embed','mixed'].includes(row.player)||typeof value!=='string')return undefined;
 try{const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port)return undefined;
  const host=url.hostname.toLowerCase(),p=url.pathname;
  const valid=kind==='eporner'?(host==='www.eporner.com'||host==='eporner.com')&&/^\/embed\/[a-z0-9]+\/?$/i.test(p)
   :kind==='redtube'?host==='embed.redtube.com'&&( /^\/[0-9]+\/?$/.test(p)||p==='/'&&/^\d+$/.test(url.searchParams.get('id')??''))
   :kind==='chaturbate'?host==='chaturbate.com'&&/^\/embed\/[a-z0-9_]+\/?$/i.test(p)
   :kind==='redgifs'?(host==='www.redgifs.com'||host==='redgifs.com')&&/^\/ifr\/[a-z0-9_-]+\/?$/i.test(p)
   :kind==='reddit'?(host==='www.redditmedia.com'||host==='redditmedia.com')&&(/^\/mediaembed\/[a-z0-9]+\/?$/i.test(p)||/^\/r\/[a-z0-9_]+\/comments\/[a-z0-9]+\/?$/i.test(p))||(host==='www.redgifs.com'||host==='redgifs.com')&&/^\/ifr\/[a-z0-9_-]+\/?$/i.test(p):false;
  return valid?url.href:undefined;
 }catch{return undefined;}
}
