import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDistributionCollector,summarizeDistribution,distributionExport,REPORT_CREATOR_LIMIT} from '../src/lib/videos/recommendation-report.ts';
import {prepareGuide,answerGuideQuery} from '../src/lib/videos/guide-picks.ts';
import {getRecommendationReports,publishRecommendationReport,subscribeRecommendationReports,clearRecommendationReports} from '../src/lib/recommendation-report-store.ts';
const now=1800000000000,turn=async()=>{},video=(id,source='youtube',creator='creator',extra={})=>({id,name:'Science '+id,folderId:'public',path:'private-disk-path/'+id,extension:'mp4',mime:'video/mp4',size:0,duration:1200,addedAt:now,...(source==='local'?{}:{remote:{kind:source,videoId:id,channelId:creator,channelName:'Creator display '+creator}}),...extra});
const input=(videos,extra={})=>({videos,tags:{},favorites:{},likes:{},history:[],folders:[{id:'public'},{id:'private',adult:true}],...extra});
function collect(rows,picks=rows.slice(0,12),session){const c=createDistributionCollector(session);for(const row of rows)c.add(row);return c.finish(picks,now,()=>false);}
test('a single-source library is constrained without inventing provider diversity failure',()=>{
 const rows=Array.from({length:20},(_,i)=>video('a'+i)),data=collect(rows),report=summarizeDistribution(data);
 assert.equal(data.eligible,20);assert.deepEqual(data.sources.find(row=>row.source==='youtube'),{source:'youtube',available:20,shown:12});assert.equal(report.findings[0].status,'constrained');assert(!report.findings.some(row=>row.status==='review'));
});
test('dominance finds avoidable concentration and a diagnostic threshold never edits ranking or signals',()=>{
 const rows=[...Array.from({length:20},(_,i)=>video('a'+i)),...Array.from({length:20},(_,i)=>video('b'+i,'twitch','other'))],data=collect(rows),before=JSON.stringify(data);
 assert.equal(summarizeDistribution(data).findings.find(row=>row.kind==='concentration').status,'review');assert.equal(summarizeDistribution(data,undefined,100).findings.find(row=>row.kind==='concentration').status,'ok');assert.equal(JSON.stringify(data),before);assert.equal(summarizeDistribution(data,undefined,NaN).threshold,50);
});
test('balanced policy compares actual slots with eligible capacity and explains pool exhaustion',()=>{
 const rows=[...Array.from({length:20},(_,i)=>video('a'+i)),video('b','twitch','other')],session={sources:'balanced'},limited=collect(rows,[...rows.slice(0,11),rows.at(-1)],session);
 assert.equal(summarizeDistribution(limited).findings[0].status,'constrained');
 const extra=[...rows,...Array.from({length:12},(_,i)=>video('c'+i,'twitch','other'))],broken=collect(extra,extra.slice(0,12),session);assert.equal(summarizeDistribution(broken).findings[0].status,'review');
 const balanced=collect(extra,[...extra.slice(0,6),...extra.slice(-6)],session);assert.equal(summarizeDistribution(balanced).findings[0].status,'ok');
});
test('creator IDs are provider scoped; normalized fallback names work and local folders are not credits',()=>{
 const rows=[video('a','youtube','same'),video('b','twitch','same'),video('c','youtube','',{remote:{kind:'youtube',videoId:'c',channelName:' SAME Name '}}),video('d','youtube','',{remote:{kind:'youtube',videoId:'d',channelName:'same name'}}),video('e','local'),video('f','youtube','',{remote:{kind:'youtube',videoId:'f'}})],data=collect(rows);
 assert.equal(data.creators.length,3);assert.equal(data.creators[0].shown,2);assert.equal(data.unknownCreators,2);assert(!JSON.stringify(data.creators).includes('same'));assert.equal(data.unknownCandidateCreators,2);const unknown=collect([...Array.from({length:12},(_,i)=>video('known'+i)),...Array.from({length:12},(_,i)=>video('uncredited'+i,'local'))]);assert.equal(summarizeDistribution(unknown).findings.find(row=>row.kind==='concentration').status,'unknown');
});
test('novelty uses valid exposure even for protected favorites, and repetitions use canonical media identity',()=>{
 const c=createDistributionCollector(),a=video('a'),b=video('b'),old=video('old'),future=video('future');for(const row of [a,b,old,future])c.add(row);
 const data=c.finish([a,{...a,id:'duplicate-cache-row'},b,old,future],now,id=>id==='b',{version:1,updatedAt:now,entries:[{key:'youtube:a',count:1,at:now-1},{key:'youtube:old',count:1,at:now-31*86400000},{key:'youtube:future',count:1,at:now+1}]}),report=summarizeDistribution(data,['youtube:a','youtube:other']);
 assert.equal(report.repeatedWithin,1);assert.equal(report.repeatedFromPrevious,1);assert.equal(report.recentlyExposed,2);assert.equal(report.recorded,1);assert.equal(report.novel,2);assert.equal(report.previousShown,2);
});
test('exports allow aggregate fields only and never media keys, creator labels, prompts, tags or file paths',()=>{
 const data=collect([video('SECRET-ID','youtube','SECRET-CREATOR')]),report=distributionExport({...data,sources:data.sources.map(row=>({...row,title:'SECRET-NESTED'})),creators:data.creators.map(row=>({...row,label:'SECRET-CREATOR-NESTED'})),title:'SECRET-TITLE',prompt:'SECRET-PROMPT',tags:['SECRET-TAG']});const text=JSON.stringify(report);
 assert(!/SECRET|private-disk-path|selections|key|prompt/.test(text));assert.equal(report.creators[0].bucket,1);assert.equal(report.shown,1);
});
test('reports count exactly personal eligibility and filter private, hidden, missing, live, history and duration rows',async()=>{
 const good=video('good'),rows=[good,video('adult','redtube'),video('private','local','',{folderId:'private'}),video('orphan','local','',{folderId:'unknown'}),video('hidden'),video('missing'),video('sample','youtube','',{isSample:true}),video('watched'),video('short','youtube','',{duration:30}),video('live','youtube','',{remote:{kind:'youtube',videoId:'live',live:true}})],base=input(rows,{hidden:{hidden:true},unavailable:{missing:true},history:[{id:'watched'}],session:{length:'medium'}}),before=JSON.stringify(base),result=await prepareGuide(base,123,now,turn);
 assert.deepEqual(result.picks.map(row=>row.id),['good']);assert.equal(result.distribution.eligible,1);assert.equal(result.distribution.selections[0].recorded,false);assert.equal(JSON.stringify(base),before);assert(!JSON.stringify(distributionExport(result.distribution)).includes('private'));
});
test('question availability uses the actual query/provider and includes recorded matches, not the full library',async()=>{
 const rows=[video('a'),video('b','twitch'),video('c','youtube','',{name:'Comedy recording'})],data=await answerGuideQuery(input(rows,{history:[{id:'a'}]}),'youtube science',1,now,turn);
 assert.equal(data.distribution.eligible,1);assert.deepEqual(data.picks.map(row=>row.id),['a']);assert.equal(summarizeDistribution(data.distribution).recorded,1);assert.equal(data.distribution.sources.find(row=>row.source==='twitch').available,0);
});
test('100k candidates keep 4096 creator counters, 12 output rows and unknown overflow capacity',async()=>{
 const c=createDistributionCollector(),last=[];for(let i=0;i<100000;i++){const v=video(String(i),'youtube','creator'+i);c.add(v);if(i>=99988)last.push(v);}assert.equal(c.trackedCreators,REPORT_CREATOR_LIMIT);
 const result=c.finish(last,now,()=>false);assert.equal(result.eligible,100000);assert.equal(result.creatorLimited,true);assert.equal(result.creators.length,12);assert(result.creators.every(row=>row.available===null));assert.equal(result.selections.length,12);assert(summarizeDistribution(result).findings.some(row=>row.kind==='coverage'&&row.status==='unknown'));
 const data=await prepareGuide(input(Array.from({length:100000},(_,i)=>video('z'+i))),1,now,turn);assert.equal(data.distribution.eligible,100000);assert.equal(data.distribution.selections.length,12);
});
test('cancelled preparation never reads a discarded catalog and empty output is unmeasured',async()=>{
 await assert.rejects(prepareGuide(input(new Proxy([],{get(){throw Error('catalog read');}})),1,now,async()=>{throw Error('cancelled');}),/cancelled/);assert.equal(summarizeDistribution(collect([],[])).findings[0].status,'unknown');
});
test('volatile reports retain two shelves, previous canonical keys, no-op publication and explicit clear',()=>{
 clearRecommendationReports();let count=0;const unsubscribe=subscribeRecommendationReports(()=>count++),a=collect([video('a')]),b=collect([video('b')]);publishRecommendationReport('mix',a);publishRecommendationReport('mix',a);assert.equal(count,1);publishRecommendationReport('query',a);publishRecommendationReport('mix',b);assert.equal(getRecommendationReports().length,2);assert.deepEqual(getRecommendationReports()[0].previous,['youtube:a']);assert(Object.isFrozen(getRecommendationReports()));clearRecommendationReports();clearRecommendationReports();assert.equal(count,4);assert.deepEqual(getRecommendationReports(),[]);unsubscribe();
});
