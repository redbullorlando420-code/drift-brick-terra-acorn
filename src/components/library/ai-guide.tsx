import {getGuidePreset,hydrateGuidePreset} from '@/lib/guide-preset-store';
import {GuideOutputReport} from './recommendation-report';
import {TopicBridgeAudit} from './topic-bridge-audit';
import {getTopicBridges} from '@/lib/topic-bridge-store';
import {RecommendationSessionControl,useRecommendationSession} from './recommendation-session-control';
import {GuideSuggestion} from './guide-suggestion';
import {getFeedbackSaveState,retryFeedbackSave} from '@/lib/media-feedback';
import { RecommendationExposureControl } from './recommendation-exposure-control';
import { getRecommendationExposure } from '@/lib/recommendation-exposure-store';
import { getRating, creatorIsFavorited, recommendationTopicIsLiked, getRecommendationRejections } from '@/lib/media-feedback';
import { memo, startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { catalogTurn } from '@/lib/catalog-turn';
import { measureInteraction } from '@/lib/interaction-budget';
import { createSettledInput } from '@/lib/settled-input';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { answerGuideQuery, prepareGuide, type GuideInput, type GuideSnapshot, type GuideReply } from '@/lib/videos/guide-picks';
import { hasFreshViewerCount } from '@/lib/videos/types';
import { useBrowseLibrary } from './use-browse-library';

const LIVE_PAGE_SIZE = 24;
const SUGGESTIONS = ['Who is live on Twitch?', 'Something funny', 'A tech video', 'What fits my favorites?', 'Show a surprise based on my tags'];

export function AiGuide() {
  const session=useRecommendationSession();
  const videos = useBrowseLibrary(s => s.videos), tags = useBrowseLibrary(s => s.tags);
  const favorites = useBrowseLibrary(s => s.favorites), likes = useBrowseLibrary(s => s.likes);
  const history = useBrowseLibrary(s => s.history);
  const folders=useBrowseLibrary(s=>s.folders),hidden=useBrowseLibrary(s=>s.hiddenVideos),unavailable=useBrowseLibrary(s=>s.unavailable),hideDemo=useBrowseLibrary(s=>s.hideDemo);
  const viewer = useLibrary(s => Boolean(s.activeId || s.previewId)), phase = useSessionPhase();
  const [presetReady,setPresetReady]=useState(false);
  useEffect(()=>{void hydrateGuidePreset().then(()=>setPresetReady(true));},[]);
  const [feedbackRevision, setFeedbackRevision] = useState(0),[feedbackUiRevision,setFeedbackUiRevision]=useState(0),[feedbackPending,setFeedbackPending]=useState(false);
  useEffect(() => { const refresh = () => {setFeedbackPending(true);setFeedbackUiRevision(value=>value+1);},saved=()=>setFeedbackUiRevision(value=>value+1);window.addEventListener('reelcase:guide-preset-change',refresh);window.addEventListener('reelcase:rating-change',refresh);window.addEventListener('reelcase:bridge-change',refresh);window.addEventListener('reelcase:bridge-save',saved);window.addEventListener('reelcase:feedback-save',saved);return()=>{window.removeEventListener('reelcase:guide-preset-change',refresh);window.removeEventListener('reelcase:rating-change',refresh);window.removeEventListener('reelcase:bridge-change',refresh);window.removeEventListener('reelcase:bridge-save',saved);window.removeEventListener('reelcase:feedback-save',saved);};},[]);
  const input = useMemo(() => ({ weights:getGuidePreset().current,bridgeSuppressions:getTopicBridges(),session,videos, tags, favorites, likes, history,folders,hidden,unavailable,hideDemo, recommendationExposure: getRecommendationExposure(), ratingOf: getRating, recommendationRejections: getRecommendationRejections(), creatorIsFavorited, tagIsLiked: recommendationTopicIsLiked }), [videos, tags, favorites, likes, history,folders,hidden,unavailable,hideDemo,feedbackRevision,session,presetReady]);
  const bridgeInput=useMemo(()=>({videos,tags,folders,hidden,unavailable}),[videos,tags,folders,hidden,unavailable]);
  const [settled, setSettled] = useState<GuideInput>(input), [seed, setSeed] = useState(() => Date.now());
  const [packet, setPacket] = useState<{ input: GuideInput; seed: number; data: GuideSnapshot }>();
  const [failed, setFailed] = useState(false);
  const settler = useMemo(() => createSettledInput<GuideInput>(setSettled, { quietMs: 600, maxWaitMs: 4000 }), []);
  useEffect(() => { if (input !== settled) settler.push(input); else settler.cancel(); }, [input, settled, settler]);
  useEffect(() => () => settler.cancel(), [settler]);
  useEffect(() => {
    if (!presetReady || settled !== input || phase !== 'active' || viewer || packet?.input === settled && packet.seed === seed) return;
    const controller = new AbortController();
    setFailed(false);
    void prepareGuide(settled, seed, Date.now(), catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ input: settled, seed, data }));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [input,settled, seed, phase, viewer,presetReady]);
  const data = packet?.input === input ? packet.data : undefined;
  const pending = !failed && (packet?.input !== input || packet.seed !== seed);
  const mix = () => { setFeedbackPending(false); setFeedbackRevision(value => value + 1); measureInteraction('navigation'); settler.cancel(); setSettled(input); setSeed(value => value + 1); };
  return <section data-guide-catalog data-guide-pending={pending} className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8">
    <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase"><Sparkles className="size-4" />Library guide</p>
    <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Useful answers from local signals.</h1>
    <p className="mt-3 max-w-xl text-sm text-muted">Search eligible public titles, saved content tags and creator fields. Personal picks use visible favorites and likes; history skips recorded titles and does not prove a completed watch. All explanations use local rules, without model wording.</p>
    <p data-guide-active-weights className="mt-3 text-xs text-muted">Prepared Guide weights: favorites {input.weights.favorite} · likes {input.weights.like} · shared topics {input.weights.topic}. Experiment and roll back in Stats.</p><TopicBridgeAudit input={bridgeInput}/><RecommendationSessionControl /><RecommendationExposureControl />
    <GuideQuestion input={input} seed={seed} snapshot={data} feedbackRevision={feedbackUiRevision}/>{feedbackPending&&<p role="status" data-guide-feedback-pending className="mt-4 text-xs leading-5 text-muted">Saved feedback changed. Ask again or use New recommendations to apply it; the current cards stay in place.</p>}{getFeedbackSaveState()==='pending'&&<p role="status" className="mt-2 text-xs text-muted">Saving Guide feedback…</p>}{getFeedbackSaveState()==='failed'&&<div role="alert" className="mt-3 rounded-lg border border-border p-3 text-sm text-fg"><p>Browser storage could not save your feedback. Choices work for this session.</p><Button variant="secondary" className="mt-2 min-h-11" onClick={retryFeedbackSave}>Retry saving Guide feedback</Button></div>}
    <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-display text-2xl text-fg">Your current signals</p>
          {data && <p data-guide-signals className="mt-1 text-xs text-muted">{data.publicCount} eligible public titles · {data.historyCount} recorded history titles · {data.favoriteCount} favorites · {data.likeCount} likes · {data.tagCount} content tags</p>}
        </div>
        <Button size="sm" variant="secondary" className="h-11 sm:h-9" onClick={mix}><RefreshCw className="size-3.5" />New recommendations</Button>
      </div>
      {pending && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted"><LoaderCircle className="size-3.5 animate-spin" />{data ? 'Updating your recommendations…' : 'Preparing your library signals…'}</p>}
      {failed && <p role="alert" className="mt-3 text-sm text-muted">Library signals could not be prepared. Try New recommendations again.</p>}
      {data && <><GuideOutputReport distribution={data.distribution} shelf="mix"/><GuidePicks data={data} feedbackRevision={feedbackUiRevision} /></>}
    </div>
    {data && <GuideLive live={data.live} />}
  </section>;
}

const GuidePicks=memo(function GuidePicks({data,feedbackRevision}:{data:GuideSnapshot;feedbackRevision:number}){
 const openPreview=useLibrary(state=>state.openPreview);
 return <><p data-guide-mode={data.mode} className="mt-3 text-xs leading-5 text-muted">{data.mode==='empty'?'No eligible public titles yet. Add a public source from your Library navigation.':data.mode==='discovery'?'Discovery mix: no saved content preference matched these picks. Choose an available topic below or save a title you like.':'This mix separates saved preferences from discovery picks. Expand Why this pick? to inspect actual fields.'}</p>{data.affinityLimited&&<p className="mt-2 text-xs text-muted">Interest evidence was sampled from a large tag vocabulary. A title or topic question still searches the complete public catalog.</p>}{!data.picks.length&&data.publicCount>0&&<p className="mt-3 text-sm text-muted">No unrecorded recordings match this session. Try any length or all sources, reset the Guide session, or ask a topic question to include titles already in history.</p>}<p data-guide-matching-recordings className="mt-3 text-xs text-muted">{data.candidateCount} unrecorded recordings match this Guide session.</p><div data-guide-picks data-guide-feedback-revision={feedbackRevision} className="mt-4 grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.picks.map(video=><GuideSuggestion key={video.id} video={video} explanation={data.explanations?.[video.id]} onOpen={openPreview}/>)}</div></>;
});
const GuideLive = memo(function GuideLive({ live }: { live: GuideSnapshot['live'] }) {
  const openPreview = useLibrary(s => s.openPreview);
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(live.length / LIVE_PAGE_SIZE) - 1), current = Math.min(page, lastPage);
  useEffect(() => setPage(0), [live]);
  const move = (page: number) => { measureInteraction('navigation'); setPage(page); };
  return <div className="mt-5 rounded-lg border border-border bg-elevated/60 p-4">
    <div className="flex items-center justify-between gap-3"><div><p className="font-medium text-fg">Twitch live check</p>
      <p className="mt-1 text-xs text-muted">{live.length ? `${live.length} followed channel${live.length === 1 ? '' : 's'} with fresh live observations in this snapshot.` : 'No fresh Twitch live observations in this snapshot. Check the Live page for updates.'}</p>
    </div><span className="shrink-0 rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">{live.length} live</span></div>
    {live.length > 0 && <div data-guide-live className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {live.slice(current * LIVE_PAGE_SIZE, (current + 1) * LIVE_PAGE_SIZE).map(video => <Button key={video.id} size="sm" variant="secondary" className="h-11 min-w-0 justify-start sm:h-9" onClick={() => openPreview(video.id)}>
        <span className="truncate">{video.remote?.channelName ?? video.name}{hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()}` : ''}</span>
      </Button>)}</div>}
    {lastPage > 0 && <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button size="sm" variant="secondary" className="h-11 sm:h-9" disabled={current === 0} onClick={() => move(current - 1)}>Previous live channels</Button>
      <span className="text-xs text-muted" aria-live="polite">Page {current + 1} of {lastPage + 1}</span>
      <Button size="sm" variant="secondary" className="h-11 sm:h-9" disabled={current === lastPage} onClick={() => move(current + 1)}>Next live channels</Button>
    </div>}
  </div>;
});

function GuideQuestion({input,seed,snapshot,feedbackRevision}:{input:GuideInput;seed:number;snapshot?:GuideSnapshot;feedbackRevision:number}){
 const openPreview=useLibrary(state=>state.openPreview),setSource=useLibrary(state=>state.setSource),setQuery=useLibrary(state=>state.setQuery);
 const [prompt,setPrompt]=useState('What should I watch tonight?'),[packet,setPacket]=useState<{input:GuideInput;seed:number;data:GuideReply}>(),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=useRef<AbortController|undefined>(undefined),reply=packet?.input===input&&packet.seed===seed?packet.data:undefined;
 useEffect(()=>{request.current?.abort();setPacket(undefined);setBusy(false);return()=>request.current?.abort();},[input,seed]);
 const ask=async(value=prompt)=>{if(!value.trim())return;request.current?.abort();const controller=new AbortController();request.current=controller;measureInteraction('search');setBusy(true);setPacket(undefined);setError('');
  try{const current={...input,weights:getGuidePreset().current,bridgeSuppressions:getTopicBridges(),recommendationRejections:getRecommendationRejections(),recommendationExposure:getRecommendationExposure()},result=await answerGuideQuery(current,value,seed,Date.now(),catalogTurn(controller.signal));if(!controller.signal.aborted)setPacket({input,seed,data:result});}catch{if(!controller.signal.aborted)setError('The library search could not finish. Try again.');}finally{if(!controller.signal.aborted)setBusy(false);}
 };
 const choose=(value:string)=>{setPrompt(value);void ask(value);};
 return <>
  <div className="mt-6 flex flex-col gap-2 sm:flex-row"><Input value={prompt} maxLength={500} onChange={event=>{request.current?.abort();setBusy(false);setPacket(undefined);measureInteraction('search');setPrompt(event.target.value);}} onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing)void ask();}} aria-label="Library guide question"/><Button className="min-h-11" disabled={busy||!prompt.trim()} onClick={()=>void ask()}><Bot className="size-4"/>{busy?'Finding matches…':'Ask guide'}</Button></div>
  {busy&&<p role="status" className="mt-4 text-sm text-muted">Searching eligible public titles and saved fields…</p>}{error&&<p role="alert" className="mt-4 text-sm text-muted">{error}</p>}
  {reply&&<div data-guide-answer className="mt-5 rounded-lg bg-elevated p-4 text-sm leading-6 text-fg shadow-border"><p role="status">{reply.text}</p><GuideOutputReport distribution={reply.distribution} shelf="query"/><div data-guide-feedback-revision={feedbackRevision} className="mt-4 grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">{reply.picks.map(video=><GuideSuggestion key={video.id} video={video} explanation={reply.explanations[video.id]} query onOpen={openPreview}/>)}</div></div>}
  {snapshot&&(snapshot.mode!=='personalized'||!snapshot.picks.length||reply&&!reply.picks.length)&&<div data-guide-topic-chooser className="mt-5 rounded-lg border border-border p-4"><p className="font-medium text-fg">{snapshot.publicCount?'Choose an available topic':'Start with a public source'}</p><p className="mt-1 text-xs leading-5 text-muted">{snapshot.publicCount?'These topics come from eligible public titles and saved labels. Choosing one searches this session; it does not change your likes or tags.':'The Guide needs eligible public media before it can suggest titles. Private-only and hidden entries do not supply public preference evidence.'}</p><div className="mt-3 flex flex-wrap gap-2">{snapshot.topics.map(row=><Button key={row.topic} variant="secondary" className="min-h-11" aria-label={'Explore Guide topic '+row.topic} onClick={()=>choose(row.topic)}>#{row.topic} · {row.count}</Button>)}{!snapshot.publicCount&&<><Button variant="secondary" className="min-h-11" onClick={()=>{setQuery('');setSource('youtube');}}>Browse YouTube</Button><Button variant="secondary" className="min-h-11" onClick={()=>{setQuery('');setSource('twitch');}}>Browse Twitch</Button></>}</div></div>}
  <div className="mt-5 flex flex-wrap gap-2">{SUGGESTIONS.map(suggestion=><Button key={suggestion} size="sm" variant="secondary" className="min-h-11" onClick={()=>choose(suggestion)}>{suggestion}</Button>)}</div>
 </>;
}
