import {TopicBridgeButton} from './topic-bridge-button';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {RecommendationButton} from './recommendation-button';
import {getRecommendationRejections,setRecommendationRejection,creatorIsFavorited,recommendationTopicIsLiked} from '@/lib/media-feedback';
import {rejectionKey} from '@/lib/videos/recommendation-rejections';
import {useLibrary} from '@/lib/videos/store';
import type {GuideExplanation,GuideReason} from '@/lib/videos/guide-evidence';
import type {LibraryVideo} from '@/lib/videos/types';
function ReasonFeedback({reason,video}:{reason:GuideReason;video:LibraryVideo}){
 const [message,setMessage]=useState(''),[error,setError]=useState(''),entry=getRecommendationRejections().entries.find(row=>rejectionKey(row)===rejectionKey(reason.feedback));
 const topic=reason.feedback.scope==='topic',creator=reason.feedback.scope==='creator',label=topic?'topic '+reason.feedback.label:creator?'this creator':'this title';
 return <div className="mt-2"><Button type="button" variant="secondary" className="min-h-11 max-w-full whitespace-normal" aria-label={(entry?'Undo ':'Reduce ')+label} aria-pressed={Boolean(entry)} onClick={()=>{
  try{setRecommendationRejection(entry??{...reason.feedback,at:Date.now()},Boolean(entry));setError('');
   const protectedTitle=useLibrary.getState().favorites[video.id]||creatorIsFavorited(video.remote?.channelName??''),protectedTopic=topic&&recommendationTopicIsLiked(reason.feedback.target);
   setMessage(entry?'Choice undone. Ask again or refresh recommendations to apply.':protectedTitle?'Choice recorded. A saved favorite protects this title; the reduction applies when that favorite is removed.':protectedTopic?'Choice recorded. Your topic heart protects its matching rank reduction.':'Choice recorded. Ask again or refresh recommendations to apply.');
  }catch(cause){setError(cause instanceof Error?cause.message:'This choice could not be recorded.');}
 }}>{entry?'Undo: ':''}{topic?'Less of #'+reason.feedback.label:creator?'Less from this creator':'Less of this title'}</Button>{message&&<p role="status" className="mt-2 text-xs leading-5 text-muted">{message}</p>}{error&&<p role="alert" className="mt-2 text-xs leading-5 text-danger">{error}</p>}</div>;
}
export function GuideSuggestion({video,explanation,query=false,onOpen}:{video:LibraryVideo;explanation?:GuideExplanation;query?:boolean;onOpen:(id:string)=>void}){
 const seen=new Set<string>(),basis=explanation?.basis??'discovery',label=basis==='preference'?'Saved preference':basis==='query'?'Field match':basis==='live'?'Live snapshot':'Discovery';
 const content=<><span className="block text-xs font-medium text-accent">{label}</span><span className="mt-2 block break-words text-sm font-medium text-fg">{video.name}</span><span className="mt-1 block truncate text-xs text-muted">{video.remote?.channelName??'Local title'}{video.genre?' · '+video.genre:''}</span><span className="mt-2 block text-xs leading-5 text-muted">{explanation?.reasons[0]?.text??'No prepared preference evidence. Refresh to inspect this title.'}</span></>;
 return <article data-guide-suggestion={video.id} data-guide-basis={basis} className="min-w-0 rounded-lg border border-border bg-bg/45 p-3">
  {query?<button type="button" data-guide-match={video.id} className="min-h-11 w-full text-left" onClick={()=>onOpen(video.id)}>{content}</button>:<RecommendationButton video={video} type="button" onClick={()=>onOpen(video.id)} className="min-h-11 w-full text-left">{content}</RecommendationButton>}
  {explanation?.notices.map(notice=><p key={notice} data-guide-notice className="mt-3 text-xs leading-5 text-accent">{notice}</p>)}
  <details data-guide-evidence className="mt-3 border-t border-border pt-2"><summary className="min-h-11 cursor-pointer content-center text-xs font-medium text-fg">Why this pick?</summary><p className="text-xs leading-5 text-muted">Matched saved fields and feedback from this prepared snapshot. These reasons use local rules; no model wrote them.</p>
   <ul className="mt-3 space-y-4">{explanation?.reasons.slice(0,4).map(reason=>{
    const key=rejectionKey(reason.feedback),showFeedback=!seen.has(key);seen.add(key);
    return <li key={reason.id} data-guide-reason={reason.kind} className="min-w-0 text-xs"><p className="leading-5 text-fg">{reason.text}</p>{reason.quote&&<p className="mt-1 break-words leading-5 text-muted">{reason.field}: “{reason.quote}”</p>}
     {reason.origin&&<div className="mt-2 rounded-md bg-surface p-2"><p className="break-words leading-5 text-muted">Evidence title: “{reason.origin.title}” · saved tag “{reason.origin.tag}” · {reason.origin.signal==='favorite'?'favorite':'liked'}</p><Button variant="ghost" className="mt-1 min-h-11" aria-label={'Open evidence title '+reason.origin.title} onClick={()=>onOpen(reason.origin!.id)}>Open evidence title</Button></div>}
     {reason.bridge&&<div className="mt-2 border-t border-border pt-2"><p className="text-xs text-accent">Topic bridge: #{reason.bridge.topic} · {reason.bridge.a} ↔ {reason.bridge.b}</p><TopicBridgeButton bridge={reason.bridge}/></div>}{showFeedback&&<ReasonFeedback reason={reason} video={video}/>}
    </li>;
   })}</ul>
  </details>
 </article>;
}
