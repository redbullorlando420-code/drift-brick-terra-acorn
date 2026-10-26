
import {useEffect,useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import {useLibrary} from '@/lib/videos/store';
import {youtubeTextTags,youtubeTagEvidence,youtubeTagTitleHash,YOUTUBE_TEXT_TAG_VERSION} from '@/lib/videos/youtube-text-tags';
import {confidenceBand,sourcesInMask,type YoutubeTagSource} from '@/lib/videos/youtube-tag-confidence';
import {youtubeTagConfidenceReport} from '@/lib/videos/youtube-tag-review';
import type {LibraryVideo} from '@/lib/videos/types';
const labels:Record<YoutubeTagSource,string>={'video-tag':'Creator video tag',hashtag:'Hashtag',chapter:'Chapter phrase',title:'Title',description:'Description prose'};
export function YoutubeTagSuggestions({video}:{video:LibraryVideo}){
 const tags=useLibrary(state=>state.tags[video.id]),provenance=useLibrary(state=>state.metadataProvenance[video.id]);
 const [open,setOpen]=useState(false),[page,setPage]=useState(0),[selected,select]=useState<string[]>([]),[expanded,expand]=useState(''),[note,setNote]=useState(''),[error,setError]=useState('');
 const evidence=useMemo(()=>youtubeTextTags(video),[video]);
 const base=useMemo(()=>({tags,provenance,summary:video.remote?.youtubeTagSummary,checkedAt:video.remote?.youtubeTagsCheckedAt}),[tags,provenance,video.remote?.youtubeTagSummary,video.remote?.youtubeTagsCheckedAt]);
 useEffect(()=>{select([]);expand('');setPage(0);},[base,video.id]);
 useEffect(()=>{setNote('');setError('');},[video.id]);
 const locked=Boolean(provenance?.lockedFields?.includes('tags')),fresh=Boolean(base.checkedAt&&base.summary?.version===YOUTUBE_TEXT_TAG_VERSION&&base.summary.scores&&base.summary.signals&&base.summary.titleHash===youtubeTagTitleHash(video.name));
 const rows=useMemo(()=>evidence.tags.map((tag,index)=>({tag,score:evidence.scores[index]??0,signals:evidence.signals[index]??0})).sort((a,b)=>b.score-a.score||a.tag.localeCompare(b.tag)),[evidence]);
 const offset=Math.min(page*8,Math.max(0,Math.ceil(rows.length/8)-1)*8),reviews=(tags??[]).slice(0,32).flatMap(tag=>provenance?.youtubeReviews?.[tag]?[[tag,provenance.youtubeReviews[tag]] as const]:[]).sort((a,b)=>b[1].at-a[1].at);
 return <details data-tag-confidence className="rounded-lg border border-border px-3" onToggle={event=>setOpen(event.currentTarget.open)}><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Recommended tags · {rows.length}</summary>{open&&<div className="space-y-3 pb-3">
  <p className="text-xs leading-5 text-muted">Evidence scores describe field agreement, not probabilities. High: 80–100; medium: 50–79; low: 0–49. Only high-confidence tags join automatic enrichment. Medium and low suggestions need your review; repeated words and hashtags alone cannot raise confidence.</p>
  {!fresh&&<p className="text-xs leading-5 text-muted">Pull this video’s tags and description to prepare current, reviewable evidence. Older saved labels stay visible.</p>}
  {locked&&<p role="status" className="text-xs leading-5 text-muted">Your tag field is locked. Suggestions remain visible; use Edit tags to make your own changes.</p>}
  {!rows.length&&<p className="text-sm text-muted">No supported tag suggestions from the available metadata.</p>}
  <ul aria-label="Recommended YouTube tags" className="grid gap-2 sm:grid-cols-2">{rows.slice(offset,offset+8).map(row=>{
   const source=provenance?.tags[row.tag],protectedTag=source==='manual'||source==='youtube-review'||tags?.includes(row.tag)&&!source,isSaved=tags?.includes(row.tag);
   return <li key={row.tag} data-confidence={confidenceBand(row.score)} className="min-w-0 rounded-md bg-bg p-3 text-xs">
    <label className="flex min-h-11 items-center gap-3"><input type="checkbox" aria-label={'Select suggested tag '+row.tag} disabled={locked||!fresh||protectedTag} checked={selected.includes(row.tag)} onChange={event=>select(current=>event.target.checked?[...current,row.tag]:current.filter(tag=>tag!==row.tag))}/><span className="min-w-0 break-words font-medium">#{row.tag}</span></label>
    <p className="leading-5 text-accent">{confidenceBand(row.score)} confidence · {row.score}/100</p><p className="mt-1 leading-5 text-muted">{sourcesInMask(row.signals).map(source=>labels[source]).join(' + ')||'No current confidence evidence'}</p>
    <p className="mt-1 text-muted">{source==='youtube-review'?'Accepted by you':source==='manual'?'Your manual tag':isSaved?'Saved provider tag':row.score>=80?'Eligible for automatic enrichment':'Review only'}</p>
    <Button variant="ghost" className="mt-2 min-h-11" aria-expanded={expanded===row.tag} onClick={()=>expand(current=>current===row.tag?'':row.tag)}>Evidence for {row.tag}</Button>
    {expanded===row.tag&&<ul className="mt-1 space-y-2 text-muted">{youtubeTagEvidence(video,row.tag).map(item=><li key={item.source}><span className="font-medium text-fg">{labels[item.source]}</span><p className="mt-1 break-words leading-5">{item.excerpt}</p></li>)}</ul>}
   </li>;
  })}</ul>
  {rows.length>8&&<div className="flex flex-wrap items-center gap-2"><Button variant="secondary" className="min-h-11" disabled={!offset} onClick={()=>{setPage(offset/8-1);expand('');}}>Previous tag suggestions</Button><span className="text-xs text-muted">{offset+1}–{Math.min(offset+8,rows.length)} of {rows.length}</span><Button variant="secondary" className="min-h-11" disabled={offset+8>=rows.length} onClick={()=>{setPage(offset/8+1);expand('');}}>Next tag suggestions</Button></div>}
  <div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" onClick={()=>{try{const url=URL.createObjectURL(new Blob([JSON.stringify(youtubeTagConfidenceReport(video,provenance),null,2)],{type:'application/json'})),anchor=document.createElement('a');anchor.href=url;anchor.download='youtube-tag-evidence-'+(video.remote?.videoId??'video')+'.json';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError('Evidence export could not be prepared. Try again.');}}}>Export tag evidence</Button><Button className="min-h-11" disabled={!selected.length||locked||!fresh} onClick={()=>{try{const count=useLibrary.getState().acceptYoutubeTagSuggestions(video.id,selected,base);select([]);setError('');setNote(count+' reviewed tag'+(count===1?'':'s')+' accepted with confidence provenance. Existing manual choices are preserved.');}catch(cause){select([]);setError(cause instanceof Error?cause.message:'Tags could not be accepted.');}}}>Accept selected tags{selected.length?' · '+selected.length:''}</Button>{selected.length>0&&<Button variant="secondary" className="min-h-11" onClick={()=>select([])}>Clear tag selection</Button>}</div>
  {note&&<p role="status" className="text-xs leading-5 text-muted">{note}</p>}{error&&<p role="alert" className="text-xs leading-5 text-danger">{error}</p>}
  {reviews.length>0&&<details data-accepted-tag-evidence><summary className="min-h-11 cursor-pointer content-center text-xs font-medium">Accepted tag evidence · {reviews.length}</summary><ul className="space-y-2 text-xs text-muted">{reviews.slice(0,8).map(([tag,review])=><li key={tag} className="break-words leading-5">#{tag} · {review.score}/100 at acceptance · {sourcesInMask(review.signals).map(source=>labels[source]).join(' + ')} · {new Date(review.at).toLocaleDateString()}</li>)}</ul>{reviews.length>8&&<p className="mt-2 text-xs text-muted">Showing the eight latest accepted tags. Accepted evidence stays with your saved tag provenance.</p>}</details>}
 </div>}</details>;
}
