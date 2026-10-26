import { useEffect,useState } from 'react';
import { RotateCcw,RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exposureDiagnostics,hydrateRecommendationExposure,resetRecommendationExposure,refreshExposureRecommendations,retryRecommendationExposure } from '@/lib/recommendation-exposure-store';
export function RecommendationExposureControl(){
 const [,refresh]=useState(0),[message,setMessage]=useState('');
 useEffect(()=>{const update=()=>refresh(value=>value+1);window.addEventListener('reelcase:exposure-change',update);void hydrateRecommendationExposure().then(update);return ()=>window.removeEventListener('reelcase:exposure-change',update);},[]);
 const state=exposureDiagnostics();
 return <details data-exposure-control className="mt-4 rounded-lg border border-border bg-elevated/40 p-4"><summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">Fresh recommendations · recent exposure</summary>
  <p className="mt-2 text-sm leading-6 text-muted">Unopened recommendations make room for new picks after they have been at least half visible for two continuous seconds in the focused app. A title counts at most once per 30 minutes across shelves.</p>
  <p className="mt-2 text-xs leading-5 text-muted">The temporary score reduction halves every seven days and expires after 30 days. Opening a title clears its recent exposure. Saves, likes, creator favorites and four/five-star ratings bypass it. Your current shelf stays still until the next mix or refresh.</p>
  <p data-exposure-count className="mt-3 text-sm text-fg">{state.entries.toLocaleString()} of 2,048 recent titles remembered</p>
  <div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="secondary" className="min-h-11" onClick={()=>{refreshExposureRecommendations();setMessage('Recommendations refreshed using recent visible cards.');refresh(value=>value+1);}}><RefreshCw className="size-4"/>Apply recent exposure</Button><Button type="button" variant="secondary" className="min-h-11" onClick={()=>{resetRecommendationExposure();setMessage('Recent exposure reset. Your ratings, favorites and rejection choices are unchanged.');}}><RotateCcw className="size-4"/>Reset recent exposure</Button></div>
  <p role="status" className="mt-2 text-xs text-muted">{message}</p>
  {state.status==='failed'&&<div role="alert" className="mt-3 text-sm text-fg"><p>Recent exposure could not be saved. It still works for this session.</p><Button type="button" variant="secondary" className="mt-2 min-h-11" onClick={retryRecommendationExposure}>Retry saving exposure</Button></div>}
  <p className="mt-3 text-xs leading-5 text-muted">Only labeled public recommendation shelves are counted. Offscreen cards, background tabs, ordinary search/history/live lists, and private/adult areas are excluded. Stored locally in this browser and included in your library pack; never sent to providers or Watch Together guests.</p>
 </details>;
}
