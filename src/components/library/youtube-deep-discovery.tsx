import { memo, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { youtubeCreatorKey } from '@/lib/remote/youtube-mix';
import { topicsForVideo } from '@/lib/videos/topics';
import type { LibraryVideo } from '@/lib/videos/types';
import { PosterGrid, TitleRail } from './browse';
import { useBrowseLibrary } from './use-browse-library';

/** Only ranked page references reach this section. Shelf construction never
 * walks a creator's full archive while the person scrolls into discovery. */
export const YoutubeDeepDiscovery = memo(function YoutubeDeepDiscovery({ archive, ranked, recommendations, fallback, total, pending, error, expanded, onExpand, onMore }: {
  archive: LibraryVideo[]; ranked: LibraryVideo[]; recommendations: LibraryVideo[]; fallback: LibraryVideo[]; total: number; pending: boolean; error: string;
  expanded: boolean; onExpand: () => void; onMore: () => void;
}) {
  const [order, setOrder] = useState<'ranked' | 'newest'>('ranked');
  const tags = useBrowseLibrary(state => state.tags);
  const shelves = useMemo(() => {
    const creators = new Map<string, { key: string; creator: string; videos: LibraryVideo[] }>();
    const topics = new Map<string, LibraryVideo[]>();
    if (!expanded) return { creators: [], topics: [] };
    for (const video of ranked.slice(0, 384)) {
      const key = youtubeCreatorKey(video);
      if (!creators.has(key) && creators.size < 4) creators.set(key, { key, creator: video.remote?.channelName ?? 'Creator', videos: [] });
      const creator = creators.get(key);
      if (creator && creator.videos.length < 12) creator.videos.push(video);
      for (const tag of topicsForVideo(video, tags[video.id])) {
        if (!topics.has(tag) && topics.size < 6) topics.set(tag, []);
        const rows = topics.get(tag);
        if (rows && rows.length < 24) rows.push(video);
      }
    }
    return { creators: [...creators.values()], topics: [...topics].filter(([, rows]) => rows.length > 1).map(([tag, videos]) => ({ tag, videos })) };
  }, [expanded, ranked, tags]);
  const warming = pending && !ranked.length && !recommendations.length;
  const choices = ranked.length ? ranked : warming ? fallback : recommendations;
  return <section aria-label="YouTube deep discovery" className="mb-8 min-w-0" data-discovery-ranked={ranked.length} aria-busy={pending}>
    <div className="mb-5 rounded-xl border border-border bg-surface p-5 shadow-border">
      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Deep discovery</p>
      <h2 className="mt-2 font-display text-2xl text-fg">More for you, across creators.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Ratings, likes, favorites, watched creators, watch time, and topic interests rank these videos. Creators take turns, so a large channel archive cannot crowd out the others. Disliked videos stay out of ranked discovery.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Discovery order">
        <Button variant={order === 'ranked' ? 'default' : 'secondary'} aria-pressed={order === 'ranked'} onClick={() => setOrder('ranked')}>Ranked discovery</Button>
        <Button variant={order === 'newest' ? 'default' : 'secondary'} aria-pressed={order === 'newest'} onClick={() => setOrder('newest')}>Newest first · full archive</Button>
        {!expanded && <Button variant="secondary" onClick={onExpand}>Load creator and topic shelves</Button>}
      </div>
      {pending && <p className="mt-3 text-xs text-muted" role="status">{warming ? 'Personal scores are loading. Showing a balanced creator mix while you browse.' : 'Ranking the next discovery batch… You can keep scrolling.'}</p>}
      {error && <p className="mt-3 text-xs text-muted" role="status">{error}</p>}
    </div>
    {expanded && order === 'ranked' && <details className="mb-5 rounded-lg border border-border p-4">
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">Ranked creator and topic shelves</summary>
      <div className="mt-4">
        {shelves.topics.map(({ tag, videos }) => <TitleRail key={tag} title={`YouTube · ${tag}`} reason="Personal ranking with creators interleaved." videos={videos} variant="rail" />)}
        {shelves.creators.map(({ key, creator, videos }) => <TitleRail key={key} title={`From ${creator}`} reason="Top personal matches from this creator in the current discovery batches." videos={videos} variant="rail" />)}
      </div>
    </details>}
    <div data-discovery-catalog={order}>
      <PosterGrid key={order} videos={order === 'newest' ? archive : choices} />
    </div>
    {order === 'ranked' && <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted">{choices.length.toLocaleString()} {warming ? 'mixed' : 'ranked'} titles ready{total ? ` · ${total.toLocaleString()} eligible videos` : ''}. Newest-first includes the full saved archive.</p>
      {(!expanded || ranked.length < total) && <Button variant="secondary" disabled={pending} onClick={expanded ? onMore : onExpand}>Rank 96 more videos</Button>}
    </div>}
  </section>;
});

