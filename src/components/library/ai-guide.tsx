import { memo, startTransition, useEffect, useMemo, useState } from 'react';
import { Bot, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { catalogTurn } from '@/lib/catalog-turn';
import { measureInteraction } from '@/lib/interaction-budget';
import { createSettledInput } from '@/lib/settled-input';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { guideAnswer, prepareGuide, type GuideInput, type GuideSnapshot } from '@/lib/videos/guide-picks';
import { hasFreshViewerCount } from '@/lib/videos/types';
import { useBrowseLibrary } from './use-browse-library';

const LIVE_PAGE_SIZE = 24;
const SUGGESTIONS = ['Who is live on Twitch?', 'Something funny', 'A tech video', 'What fits my favorites?', 'Show a surprise based on my tags'];

export function AiGuide() {
  const videos = useBrowseLibrary(s => s.videos), tags = useBrowseLibrary(s => s.tags);
  const favorites = useBrowseLibrary(s => s.favorites), likes = useBrowseLibrary(s => s.likes);
  const history = useBrowseLibrary(s => s.history);
  const viewer = useLibrary(s => Boolean(s.activeId || s.previewId)), phase = useSessionPhase();
  const input = useMemo(() => ({ videos, tags, favorites, likes, history }), [videos, tags, favorites, likes, history]);
  const [settled, setSettled] = useState<GuideInput>(input), [seed, setSeed] = useState(() => Date.now());
  const [packet, setPacket] = useState<{ input: GuideInput; seed: number; data: GuideSnapshot }>();
  const [failed, setFailed] = useState(false);
  const settler = useMemo(() => createSettledInput<GuideInput>(setSettled, { quietMs: 600, maxWaitMs: 4000 }), []);
  useEffect(() => { if (input !== settled) settler.push(input); else settler.cancel(); }, [input, settled, settler]);
  useEffect(() => () => settler.cancel(), [settler]);
  useEffect(() => {
    if (phase !== 'active' || viewer || packet?.input === settled && packet.seed === seed) return;
    const controller = new AbortController();
    setFailed(false);
    void prepareGuide(settled, seed, Date.now(), catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setPacket({ input: settled, seed, data }));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [settled, seed, phase, viewer]);
  const data = packet?.input.videos === input.videos ? packet.data : undefined;
  const pending = !failed && (packet?.input !== input || packet.seed !== seed);
  const mix = () => { measureInteraction('navigation'); settler.cancel(); setSettled(input); setSeed(value => value + 1); };
  return <section data-guide-catalog data-guide-pending={pending} className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8">
    <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase"><Sparkles className="size-4" />Library guide</p>
    <h1 className="mt-3 font-display text-4xl text-fg sm:text-5xl">Useful answers from local signals.</h1>
    <p className="mt-3 max-w-xl text-sm text-muted">This guide only uses saved favorites, likes, tags, viewing history, and the most recent Twitch refresh. It does not send your catalog or files to a cloud model.</p>
    <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-display text-2xl text-fg">Your current signals</p>
          {data && <p data-guide-signals className="mt-1 text-xs text-muted">{data.historyCount} history signals · {data.favoriteCount} favorites · {data.tagCount} tags</p>}
        </div>
        <Button size="sm" variant="secondary" className="h-11 sm:h-9" onClick={mix}><RefreshCw className="size-3.5" />New recommendations</Button>
      </div>
      {pending && <p role="status" className="mt-3 flex items-center gap-2 text-xs text-muted"><LoaderCircle className="size-3.5 animate-spin" />{data ? 'Updating your recommendations…' : 'Preparing your library signals…'}</p>}
      {failed && <p role="alert" className="mt-3 text-sm text-muted">Library signals could not be prepared. Try New recommendations again.</p>}
      {data && <GuidePicks data={data} tags={tags} />}
    </div>
    {data && <GuideLive live={data.live} />}
    <GuideQuestion data={data} tags={tags} />
  </section>;
}

const GuidePicks = memo(function GuidePicks({ data, tags }: { data: GuideSnapshot; tags: GuideInput['tags'] }) {
  const openPreview = useLibrary(s => s.openPreview);
  return <div data-guide-picks className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{data.picks.map(video =>
    <button key={video.id} type="button" onClick={() => openPreview(video.id)} className="min-w-0 rounded-md bg-bg/45 px-3 py-3 text-left shadow-border hover:bg-bg">
      <p className="truncate text-sm font-medium text-fg">{video.name}</p>
      <p className="mt-1 truncate text-xs text-muted">{video.remote?.channelName ?? video.genre ?? 'Library pick'} · {(tags[video.id] ?? []).slice(0, 3).join(', ') || 'Fresh discovery'}</p>
    </button>)}</div>;
});

const GuideLive = memo(function GuideLive({ live }: { live: GuideSnapshot['live'] }) {
  const openPreview = useLibrary(s => s.openPreview);
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(live.length / LIVE_PAGE_SIZE) - 1), current = Math.min(page, lastPage);
  useEffect(() => setPage(0), [live]);
  const move = (page: number) => { measureInteraction('navigation'); setPage(page); };
  return <div className="mt-5 rounded-lg border border-border bg-elevated/60 p-4">
    <div className="flex items-center justify-between gap-3"><div><p className="font-medium text-fg">Twitch live check</p>
      <p className="mt-1 text-xs text-muted">{live.length ? `${live.length} followed channel${live.length === 1 ? '' : 's'} live in the latest refresh.` : 'No followed channels are live in the latest refresh.'}</p>
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

function GuideQuestion({ data, tags }: { data?: GuideSnapshot; tags: GuideInput['tags'] }) {
  const [prompt, setPrompt] = useState('What should I watch tonight?'), [answer, setAnswer] = useState('');
  const ask = () => { if (!data || !prompt.trim()) return; measureInteraction('search'); setAnswer(guideAnswer(prompt, data, tags)); };
  return <>
    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
      <Input value={prompt} onChange={event => { measureInteraction('search'); setPrompt(event.target.value); }} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) ask(); }} aria-label="Library guide question" />
      <Button disabled={!data || !prompt.trim()} onClick={ask}><Bot className="size-4" />Ask guide</Button>
    </div>
    {answer && <div data-guide-answer className="mt-5 rounded-lg bg-elevated p-5 text-sm leading-6 text-fg shadow-border whitespace-pre-wrap">{answer}</div>}
    <div className="mt-5 flex flex-wrap gap-2">{SUGGESTIONS.map(suggestion => <Button key={suggestion} size="sm" variant="secondary" className="h-11 sm:h-9" onClick={() => { measureInteraction('search'); setPrompt(suggestion); }}>{suggestion}</Button>)}</div>
  </>;
}
