import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { prepareCatalogRestore } from '../src/lib/videos/catalog-restore.ts';

const results = [];
for (const entries of [100_000, 1_000_000]) {
  const rows = Array.from({length:entries}, (_,i)=>({id:String(i),folderId:'disk:test',name:'Fixture',path:String(i),extension:'mp4',mime:'video/mp4',size:0,addedAt:1}));
  const base = { videos:[], follows:[], favorites:{}, likes:{}, progress:{}, resumeProgress:{'id:511':{t:20,d:80,at:1}} };
  let turns=0, worstTurnMs=0, previous=0, longestGapMs=0;
  const turn = async () => {
    if (previous) worstTurnMs=Math.max(worstTurnMs,performance.now()-previous);
    const start=performance.now();
    await new Promise(resolve=>setImmediate(resolve));
    longestGapMs=Math.max(longestGapMs,performance.now()-start); previous=performance.now(); turns++;
  };
  const started=performance.now();
  const pending=prepareCatalogRestore(base,rows,{turn,newestResume:(...marks)=>marks.filter(Boolean).sort((a,b)=>b.at-a.at)[0]});
  const initiatingStackMs=performance.now()-started;
  const result=await pending;
  if(result.videos.length!==entries || result.counts.get('disk:test')!==entries || result.progress['511']?.t!==20) throw new Error('Incomplete restoration');
  results.push({entries,initiatingStackMs:+initiatingStackMs.toFixed(3),totalMs:+(performance.now()-started).toFixed(3),turns,
    worstMeasuredWorkTurnMs:+worstTurnMs.toFixed(3),longestSchedulerGapMs:+longestGapMs.toFixed(3)});
}
const report={results,note:'Synthetic Node preparation with actual reference arrays and cooperative setImmediate turns. Not IndexedDB startup, browser paint/input latency, memory soak or a physical-device result. Work targets four ms; individual object access and garbage collection can exceed it.'};
writeFileSync(new URL('../screenshots/startup-benchmark.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
