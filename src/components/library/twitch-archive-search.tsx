import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/lib/videos/store';
import { searchTwitchArchive, twitchArchiveDate, type TwitchArchiveFilter, type TwitchArchiveKey, type TwitchArchivePage } from '@/lib/videos/twitch-archive-search';
import { yieldNavigationTask } from '@/lib/navigation-work';
import type { FollowedChannel, LibraryVideo } from '@/lib/videos/types';
import { VirtualVideoGrid } from './virtual-video-grid';

const PAGE = 24;
type Filters = { query: string; creator: string; kind: TwitchArchiveFilter['kind']; order: TwitchArchiveFilter['order']; from: string; until: string };
const defaults: Filters = { query: '', creator: 'all', kind: 'all', order: 'newest', from: '', until: '' };
export default function TwitchArchiveSearch({ videos, follows, onClose }: { videos: LibraryVideo[]; follows: FollowedChannel[]; onClose: () => void }) {
  const [filters, setFilters] = useState(defaults);
  const [after, setAfter] = useState<TwitchArchiveKey>();
  const [previous, setPrevious] = useState<Array<TwitchArchiveKey | undefined>>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [result, setResult] = useState<TwitchArchivePage>();
  const [pending, setPending] = useState(true);
  const [error, setError] = useState('');
  const completed = useRef<{ videos: LibraryVideo[]; creators: FollowedChannel[]; filters: Filters; after?: TwitchArchiveKey } | undefined>(undefined);
  const viewerOpen = useLibrary(state => Boolean(state.activeId || state.previewId));
  const creators = useMemo(() => follows.filter(row => row.kind === 'twitch').sort((a, b) => a.title.localeCompare(b.title)), [follows]);
  const update = (patch: Partial<Filters>) => { setFilters(value => ({ ...value, ...patch })); setAfter(undefined); setPrevious([]); setPageNumber(1); setPending(true); setResult(undefined); };
  useEffect(() => {
    const controller = new AbortController();
    if (viewerOpen) return () => controller.abort();
    const last = completed.current;
    if (last?.videos === videos && last.creators === creators && last.filters === filters && last.after === after) return () => controller.abort();
    completed.current = undefined;
    setPending(true); setResult(undefined); setError('');
    const timer = setTimeout(() => {
      const from = twitchArchiveDate(filters.from), until = twitchArchiveDate(filters.until, true);
      if (filters.from && !Number.isFinite(from) || filters.until && !Number.isFinite(until) || from !== undefined && until !== undefined && from >= until) { setPending(false); setError('Choose a valid date range; the end date must be on or after the start date.'); return; }
      const creator = creators.find(row => row.id === filters.creator);
      if (filters.creator !== 'all' && !creator) { setPending(false); setError('This creator is no longer followed. Choose another creator or reset the filters.'); return; }
      void searchTwitchArchive(videos, { query: filters.query, creator, kind: filters.kind, order: filters.order, from, until, after },
        { signal: controller.signal, pageSize: PAGE, turn: () => yieldNavigationTask(controller.signal) }).then(value => {
          if (!controller.signal.aborted) { completed.current = { videos, creators, filters, after }; setResult(value); setPending(false); }
        }).catch(failure => { if (!controller.signal.aborted) { setPending(false); setError(failure instanceof Error ? failure.message : 'Archive search failed.'); } });
    }, filters.query ? 180 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [videos, creators, filters, after, viewerOpen]);
  const selectClass = 'min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg';
  return <section aria-label="Search saved Twitch archive" className="mb-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl text-fg">Search saved archive</h2><p className="mt-1 text-sm text-muted">Twitch VODs and clips already in your library. Live streams stay in the live rail.</p></div><Button variant="secondary" onClick={onClose}>Close archive search</Button></div>
    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="min-w-0 text-xs text-muted">Title contains<Input className="mt-1 min-h-11" aria-label="Twitch archive title" maxLength={256} placeholder="Words from a title" value={filters.query} onChange={event => update({ query: event.target.value })} /></label>
      <label className="min-w-0 text-xs text-muted">Creator<select className={`mt-1 ${selectClass}`} aria-label="Twitch archive creator" value={filters.creator} onChange={event => update({ creator: event.target.value })}><option value="all">All creators</option>{creators.map(row => <option key={row.id} value={row.id}>{row.title}</option>)}</select></label>
      <label className="min-w-0 text-xs text-muted">Video type<select className={`mt-1 ${selectClass}`} aria-label="Twitch archive type" value={filters.kind} onChange={event => update({ kind: event.target.value as Filters['kind'] })}><option value="all">VODs and clips</option><option value="vod">VODs only</option><option value="clip">Clips only</option></select></label>
      <label className="min-w-0 text-xs text-muted">Published from<Input type="date" className="mt-1 min-h-11 w-full min-w-0" aria-label="Twitch archive start date" value={filters.from} onChange={event => update({ from: event.target.value })} /></label>
      <label className="min-w-0 text-xs text-muted">Published through<Input type="date" className="mt-1 min-h-11 w-full min-w-0" aria-label="Twitch archive end date" value={filters.until} onChange={event => update({ until: event.target.value })} /></label>
      <label className="min-w-0 text-xs text-muted">Date order<select className={`mt-1 ${selectClass}`} aria-label="Twitch archive order" value={filters.order} onChange={event => update({ order: event.target.value as Filters['order'] })}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" onClick={() => update(defaults)}>Reset archive filters</Button><p role="status" className="text-sm text-muted">{error || (pending ? viewerOpen ? 'Search pauses during preview or playback.' : 'Searching saved archive…' : `${result?.matched.toLocaleString() ?? 0} matches · page ${pageNumber} · ${result?.videos.length ?? 0} shown`)}</p></div>
    {!pending && !error && result && <>
      {result.videos.length ? <div className="mt-4"><VirtualVideoGrid key={`${pageNumber}:${filters.query}:${filters.creator}:${filters.kind}:${filters.order}:${filters.from}:${filters.until}`} videos={result.videos} variant="grid" pageSize={PAGE} /></div> : <p className="mt-4 text-sm text-muted">No saved videos match these filters. Clear a filter or pull this creator’s archive to add more.</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" disabled={!previous.length} onClick={() => { setAfter(previous.at(-1)); setPrevious(value => value.slice(0, -1)); setPageNumber(value => value - 1); setPending(true); }}>Previous archive page</Button>
        <Button variant="secondary" disabled={!result.hasNext} onClick={() => { setPrevious(value => [...value.slice(-63), after]); setAfter(result.next); setPageNumber(value => value + 1); setPending(true); }}>Next archive page</Button>
        {pageNumber > 1 && <Button variant="ghost" onClick={() => { setAfter(undefined); setPrevious([]); setPageNumber(1); setPending(true); }}>First archive page</Button>}
      </div>
      <p className="mt-3 text-xs text-subtle">Ordered by saved publication date. Missing dates appear last and are excluded when a date range is set.</p>
    </>}
  </section>;
}
