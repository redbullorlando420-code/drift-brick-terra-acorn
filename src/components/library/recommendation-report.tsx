import {useEffect,useState,useSyncExternalStore} from 'react';
import {Button} from '@/components/ui/button';
import {distributionExport,summarizeDistribution,type Distribution} from '@/lib/videos/recommendation-report';
import {clearRecommendationReports,emptyRecommendationReports,getRecommendationReports,publishRecommendationReport,subscribeRecommendationReports,type ReportEntry,type ReportShelf} from '@/lib/recommendation-report-store';
import {useLibrary} from '@/lib/videos/store';

const label=(source:string)=>source==='youtube'?'YouTube':source==='twitch'?'Twitch':source==='local'?'Local':'Other public sources';
const percent=(count:number,total:number)=>total?Math.round(count/total*100)+'%':'—';
const useReports=()=>useSyncExternalStore(subscribeRecommendationReports,getRecommendationReports,emptyRecommendationReports);

/** Publish only a successfully prepared, currently rendered output. No storage or polling. */
export function GuideOutputReport({distribution,shelf}:{distribution:Distribution;shelf:ReportShelf}){
 const entries=useReports();
 useEffect(()=>publishRecommendationReport(shelf,distribution),[shelf,distribution]);
 const entry=entries.find(row=>row.shelf===shelf&&row.distribution===distribution);
 return entry?<OutputReport entry={entry}/>:null;
}

export function RecommendationReports(){
 const entries=useReports(),setSource=useLibrary(s=>s.setSource);
 return <section data-recommendation-reports className="mt-5 rounded-xl border border-border bg-surface p-5 text-fg">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl">Recommendation fairness report</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Inspect actual public AI Guide outputs from this tab. These are generation snapshots, not impressions or proof of watching. Other recommendation shelves are outside this report.</p></div>{entries.length>0&&<Button variant="secondary" className="min-h-11" onClick={clearRecommendationReports}>Clear Guide reports</Button>}</div>
  {entries.length?entries.map(entry=><OutputReport key={entry.shelf} entry={entry}/>):<div className="mt-4"><p className="text-sm text-muted">No Guide output has been generated in this tab yet. Reports clear on reload and never add history, likes or exposure.</p><Button variant="secondary" className="mt-3 min-h-11" onClick={()=>setSource('assistant')}>Open AI Guide for a report</Button></div>}
 </section>;
}

function OutputReport({entry}:{entry:ReportEntry}){
 const [threshold,setThreshold]=useState(50),[error,setError]=useState('');
 const data=entry.distribution,summary=summarizeDistribution(data,entry.previous,threshold),n=summary.shown;
 const download=()=>{let url='';try{url=URL.createObjectURL(new Blob([JSON.stringify({...distributionExport(data,entry.previous,threshold),shelf:entry.shelf},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='realhub-guide-'+entry.shelf+'-report.json';a.click();setError('');}catch{setError('The report could not be exported. Try again.');}finally{if(url)setTimeout(()=>URL.revokeObjectURL(url),1000);}};
 return <details data-guide-report={entry.shelf} className="mt-4 rounded-lg border border-border bg-elevated p-4">
  <summary className="min-h-11 cursor-pointer text-sm font-medium">{entry.shelf==='mix'?'Current mix':'Latest question'} · recommendation fairness report</summary>
  <p className="mt-2 text-xs leading-5 text-muted">Generated {new Date(data.at).toLocaleString()} · {data.eligible.toLocaleString()} eligible candidate rows · {n} output slots. Availability uses the same public visibility, recorded-history policy and session/query filters as this output. Counts are snapshots; use a new mix or question to update.</p>
  <div data-report-metrics className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[
   ['Unique titles',summary.uniqueTitles+' / '+n],['Repeated in output',String(summary.repeatedWithin)],['No recorded history or recent exposure',summary.novel+' / '+n],['Repeated from previous '+entry.shelf,summary.repeatedFromPrevious===null?'No previous output':summary.repeatedFromPrevious+' / '+summary.uniqueTitles],
  ].map(([title,value])=><div key={title} className="min-w-0 rounded-lg bg-bg p-3"><p className="text-xs leading-5 text-muted">{title}</p><p className="mt-1 text-lg font-medium tabular-nums">{value}</p></div>)}</div>
  <p className="mt-3 text-xs leading-5 text-muted">{summary.recorded} slots have recorded history · {summary.recentlyExposed} have valid exposure in the last 30 days, including protected favorites. “No recorded history or recent exposure” is evidence-limited novelty, not proof you have never seen a title. Repeats compare canonical media IDs, not similar titles. Previous output means the prior generated shelf of this kind, even if its filters differed.</p>
  <div className="mt-4 grid gap-4 lg:grid-cols-2"><div><h3 className="text-sm font-medium">Provider share</h3><div className="mt-2 space-y-3">{data.sources.filter(row=>row.available||row.shown).map(row=><div key={row.source} data-report-provider={row.source}><div className="flex flex-wrap justify-between gap-2 text-xs"><span>{label(row.source)}</span><span className="text-muted">{row.shown} / {n} · {percent(row.shown,n)} · {row.available.toLocaleString()} available rows</span></div><meter className="mt-1 h-3 w-full accent-accent" min={0} max={Math.max(1,n)} value={row.shown} aria-label={label(row.source)+' output share'}/></div>)}</div></div>
  <div><h3 className="text-sm font-medium">Creator share · anonymous groups</h3><p className="mt-1 text-xs leading-5 text-muted">Grouped by provider-scoped creator ID, falling back to a normalized creator name. Names and title samples are omitted. Local folder names are not creator credits.</p><div className="mt-2 space-y-2">{data.creators.map(row=><p data-report-creator key={row.bucket} className="text-xs leading-5">Creator {row.bucket} · {label(row.source)} · {row.shown} / {n} ({percent(row.shown,n)}) · {row.available===null?'unknown availability':row.available+' available rows'}</p>)}<p className="text-xs text-muted">{data.unknownCreators} / {n} slots and {data.unknownCandidateCreators} eligible rows lack creator credits; unknown alternatives cannot prove creator diversity.</p></div></div></div>
  <label className="mt-4 flex min-h-11 flex-wrap items-center gap-3 text-sm">Creator diagnostic threshold<select aria-label="Creator diagnostic threshold" className="min-h-11 rounded-md border border-border bg-bg px-3 text-fg" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}>{[25,50,75,100].map(value=><option key={value} value={value}>{value}% of output</option>)}</select></label>
  <p className="text-xs leading-5 text-muted">This threshold changes the diagnostic only. It does not configure a creator cap, rewrite preferences or rerank cards. Source policy: {data.session.sources} · discovery style: {data.session.familiarity} · length: {data.session.length}. Positive weights: favorites {data.weights?.favorite??3}, likes {data.weights?.like??2}, topics {data.weights?.topic??1}.</p>
  <ul data-report-findings className="mt-4 space-y-3 text-sm leading-6">{summary.findings.map(row=><li key={row.kind}><span className="mr-2 rounded bg-bg px-2 py-1 text-xs font-medium">{row.status==='review'?'Review':row.status==='constrained'?'Limited by candidates':row.status==='unknown'?'Not fully measured':row.kind==='concentration'?'Below threshold':'Within policy'}</span>{row.text}</li>)}</ul>
  <p className="mt-3 text-xs leading-5 text-muted">Eligible alternatives are not a promise of equal relevance. This report measures output distribution, not demographic fairness. It retains at most two reports and twelve media keys per output in this tab. Public title names, creator names, prompts, paths, private titles and image data are never exported.</p>
  <Button variant="secondary" className="mt-4 min-h-11" onClick={download}>Export {entry.shelf} fairness report</Button>{error&&<p role="alert" className="mt-2 text-sm text-muted">{error}</p>}
 </details>;
}
