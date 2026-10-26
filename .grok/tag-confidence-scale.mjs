
import {registerHooks} from 'node:module';import {writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {youtubeTextTags,compactYoutubeTagEvidence}=await import('../src/lib/videos/youtube-text-tags.ts');
const {catalogCard}=await import('../src/lib/videos/catalog-card.ts');
const words=Array.from({length:240},(_,i)=>'subject'+i).join(' '),description=(words+' '+words).repeat(3),keywords=Array.from({length:40},(_,i)=>'creator phrase '+i);
const make=i=>({id:'yt:'+i,name:'Python workshop',folderId:'yt:creator',path:'',extension:'yt',mime:'video/youtube',size:0,addedAt:0,description,remote:{kind:'youtube',youtubeKeywords:keywords}});
const start=performance.now();let summary;
for(let i=0;i<8;i++){const result=youtubeTextTags(make(i));assert(result.tags.length<=28);assert(result.scores.every(Number.isFinite));summary=compactYoutubeTagEvidence(result);}
const fullMs=performance.now()-start,card=catalogCard({...make(0),remote:{...make(0).remote,youtubeTagSummary:summary}});
const ready=performance.now();for(let i=0;i<20000;i++){const result=youtubeTextTags({...card,id:'yt:compact'+i});assert(result.tags.length<=28);}
const compactMs=performance.now()-ready,result={ok:true,fullSelectedRows:8,fullMs:Math.round(fullMs),fullAverageMs:Math.round(fullMs/8),compactRows:20000,compactMs:Math.round(compactMs),summaryBytes:Buffer.byteLength(JSON.stringify(summary)),confidenceArrayBytes:Buffer.byteLength(JSON.stringify({scores:summary.scores,signals:summary.signals})),retainedCandidateLimit:28,scratchCandidateLimit:96,cacheLimit:512,limitation:'Synthetic CPU-only run on this machine; no provider or disk performance claim.'};
await writeFile(new URL('../screenshots/tag-confidence-scale.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
