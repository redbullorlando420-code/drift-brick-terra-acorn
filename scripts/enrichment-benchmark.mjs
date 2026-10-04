import { performance } from 'node:perf_hooks';
import { metadataEnrichmentStep } from '../src/lib/videos/metadata-enrichment.ts';
const reports=[];
for(const entries of [100_000,1_000_000]){
  let reads=0;const target=Array(entries).fill(null);
  const videos=new Proxy(target,{get(array,key){if(typeof key==='string'&&/^\d+$/.test(key)){reads++;return{id:`video:${key}`,remote:{kind:'youtube'}};}return Reflect.get(array,key);}});
  const sharedTags=['cached'],sharedProvenance={tags:{cached:'legacy'},updatedAt:1};
  const tags={},metadataProvenance={};
  for(let i=48;i<entries;i++){tags[`video:${i}`]=sharedTags;metadataProvenance[`video:${i}`]=sharedProvenance;}
  let state={videos,folders:[],tags,metadataProvenance};
  const oldStart=performance.now();
  const candidates=videos.flatMap(video=>state.tags[video.id]?.length?[]:[{video,inferred:['science']}]);
  const oldTags={...tags},oldProvenance={...metadataProvenance};
  for(const {video,inferred}of candidates.slice(0,48)){oldTags[video.id]=inferred;oldProvenance[video.id]={tags:{science:'provider:youtube'},updatedAt:2};}
  const originalClickStackMs=performance.now()-oldStart,originalReads=reads;
  reads=0;let savedRows=0,yields=0,maxSliceMs=0,lastTurn=performance.now();
  const stagedStart=performance.now();
  const step=metadataEnrichmentStep({get:()=>state,publish:next=>{state={...state,...next};},save:async(rows,turn)=>{for(let i=0;i<rows.length;i+=64){await turn();savedRows+=Math.min(64,rows.length-i);}},maxChanges:48,
    patch:(video,current)=>current.tags[video.id]?.length?undefined:{beforeTags:current.tags[video.id],beforeProvenance:current.metadataProvenance[video.id],tags:['science'],provenance:{tags:{science:'provider:youtube'},updatedAt:2}}});
  const stagedClickStackMs=performance.now()-stagedStart,readsBeforeFirstTask=reads;
  const start=performance.now();lastTurn=start;
  const turn=async()=>{maxSliceMs=Math.max(maxSliceMs,performance.now()-lastTurn);yields++;await new Promise(resolve=>setImmediate(resolve));lastTurn=performance.now();};
  const result=await step(new AbortController().signal,turn);maxSliceMs=Math.max(maxSliceMs,performance.now()-lastTurn);
  reports.push({entries,originalClickStackMs:+originalClickStackMs.toFixed(2),stagedClickStackMs:+stagedClickStackMs.toFixed(2),originalCatalogReads:originalReads,readsBeforeFirstTask,stagedCatalogReads:reads,stagedTotalMs:+(performance.now()-start).toFixed(2),yields,maxObservedTaskMs:+maxSliceMs.toFixed(2),savedRows,done:result.done});
}
console.log(JSON.stringify({reports,note:'Synthetic Node workload with shared tag values and instrumented catalog rows; not browser latency or a heap soak. The staged batch uses shared sparse records and does not enumerate the base ledgers. Full exports and broad preference snapshots remain separate full-record operations.'},null,2));
