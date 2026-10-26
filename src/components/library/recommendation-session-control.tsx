import {useEffect,useState,useSyncExternalStore} from 'react';
import {SlidersHorizontal,RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {recommendationSessionStore} from '@/lib/recommendation-session';
import {DEFAULT_RECOMMENDATION_SESSION,sameRecommendationSession,type RecommendationSession} from '@/lib/videos/recommendation-session';
export const useRecommendationSession=()=>useSyncExternalStore(recommendationSessionStore.subscribe,recommendationSessionStore.getSnapshot,()=>DEFAULT_RECOMMENDATION_SESSION);
const selectClass='mt-2 min-h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg';
export function RecommendationSessionControl(){
  const active=useRecommendationSession(),[draft,setDraft]=useState(active),[message,setMessage]=useState('');
  useEffect(()=>setDraft(active),[active]);
  const dirty=!sameRecommendationSession(draft,active),custom=!sameRecommendationSession(active,DEFAULT_RECOMMENDATION_SESSION);
  return <details data-recommendation-session className="mt-4 rounded-lg border border-border bg-elevated/40 p-4">
    <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg"><span className="inline-flex items-center gap-2"><SlidersHorizontal className="size-4"/>Tune this Guide session{custom&&<span className="rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">Custom mix</span>}</span></summary>
    <p className="mt-2 text-sm leading-6 text-muted">Temporary controls for Guide picks and questions. Kept while you navigate this app; reloading or Reset restores the defaults. Your saved tastes and other recommendation shelves stay unchanged.</p>
    <form className="mt-4" onSubmit={event=>{event.preventDefault();const changed=recommendationSessionStore.apply(draft);setMessage(changed?'Session mix applied. Saved tastes are unchanged.':'This session mix is already applied.');}}>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-xs font-medium text-fg">Discovery style<select aria-label="Guide discovery style" className={selectClass} value={draft.familiarity} onChange={event=>setDraft({...draft,familiarity:event.target.value as RecommendationSession['familiarity']})}><option value="balanced">Standard ranking</option><option value="familiar">More familiar</option><option value="explore">Explore beyond my tastes</option></select></label>
        <label className="text-xs font-medium text-fg">Recording length<select aria-label="Guide recording length" className={selectClass} value={draft.length} onChange={event=>setDraft({...draft,length:event.target.value as RecommendationSession['length']})}><option value="any">Any length, including unknown</option><option value="short">Up to 10 minutes</option><option value="medium">Over 10 minutes to 1 hour</option><option value="long">Over 1 hour</option></select></label>
        <label className="text-xs font-medium text-fg">Source mix<select aria-label="Guide source mix" className={selectClass} value={draft.sources} onChange={event=>setDraft({...draft,sources:event.target.value as RecommendationSession['sources']})}><option value="all">All public sources</option><option value="balanced">Balance available sources</option><option value="youtube">YouTube only</option><option value="twitch">Twitch only</option><option value="local">Local library only</option></select></label>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">Familiar boosts favorites, likes and shared saved content tags. Explore makes room for titles without those matches. Source balance alternates available sources and fills empty slots. Length filters exclude unknown durations and apply to recordings; live observations follow the source choice. Source names in questions must also fit your mix.</p>
      <div className="mt-4 flex flex-wrap gap-2"><Button type="submit" className="min-h-11">Apply session mix</Button><Button type="button" variant="secondary" className="min-h-11" onClick={()=>{setDraft(DEFAULT_RECOMMENDATION_SESSION);recommendationSessionStore.reset();setMessage('Guide session reset to standard ranking, any length and all public sources. Saved tastes are unchanged.');}}><RotateCcw className="size-4"/>Reset Guide session</Button></div>
      {dirty&&<p data-session-draft role="status" className="mt-3 text-xs text-accent">Changes are waiting. Apply when ready; the current cards stay in place.</p>}
      <p data-session-active className="mt-3 text-xs text-muted">Applied mix: {active.familiarity} · {active.length} length · {active.sources} sources.</p><p role="status" className="mt-2 text-xs text-muted">{message}</p>
    </form>
  </details>;
}
