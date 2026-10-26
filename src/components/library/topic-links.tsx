import { TopicAliasReview } from './topic-alias-review';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { topicEvidence, canonicalTopic } from '@/lib/videos/topics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VirtualVideoGrid } from './virtual-video-grid';
import { useBrowseLibrary } from './use-browse-library';
import { useTopicCatalog } from './use-topic-catalog';
import { topicConnectionsCsv,type TopicFilters } from '@/lib/videos/topic-catalog';
import type { LibraryVideo } from '@/lib/videos/types';
import { openTopic } from '@/lib/videos/topic-navigation';
import { tagIsLiked, toggleTagLike } from '@/lib/media-feedback';

export function TopicLinks({ explorer = false }: { explorer?: boolean }) {
  const videos = useBrowseLibrary(s => s.videos), tags = useBrowseLibrary(s => s.tags);
  const folders = useBrowseLibrary(s => s.folders), unavailable = useBrowseLibrary(s => s.unavailable);
  const hiddenVideos = useBrowseLibrary(s => s.hiddenVideos), hideDemo = useBrowseLibrary(s => s.hideDemo);
  const query = useLibrary(s => s.query);
  const [provider, setProvider] = useState('all'), [genrePage, setGenrePage] = useState(0);
  const [genresOpen, setGenresOpen] = useState(false);
  const [text,setText]=useState(''),[settledText,setSettledText]=useState(''),[topicSearch,setTopicSearch]=useState('');
  const [order,setOrder]=useState<TopicFilters['sort']>('catalog'),[evidence,setEvidence]=useState<TopicFilters['evidence']>('all');
  useEffect(()=>{const timer=setTimeout(()=>setSettledText(text),180);return()=>clearTimeout(timer);},[text]);
  const [favoriteRevision, setFavoriteRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setFavoriteRevision(value => value + 1);
    window.addEventListener('reelcase:rating-change', refresh);
    return () => window.removeEventListener('reelcase:rating-change', refresh);
  }, []);
  const selected = explorer ? canonicalTopic(query) : undefined;
  const selectedGenre = explorer && query.startsWith('genre:') ? query.slice(6) : undefined;
  const filters=useMemo(()=>({text:[!selected&&!selectedGenre?query:'',settledText].filter(Boolean).join(' '),sort:order,evidence}),[query,selected,selectedGenre,settledText,order,evidence]);
  const input = useMemo(() => ({ videos, tags, folders, unavailable, hiddenVideos, hideDemo }),
    [videos, tags, folders, unavailable, hiddenVideos, hideDemo]);
  const { summary: index, selection, pending, failed, ready, matchesReady } = useTopicCatalog(input, favoriteRevision, selected, selectedGenre, provider, explorer,filters);
  const { videos: matching, related } = selection, genres = index.genres;
  const genreOffset = Math.min(genrePage * 48, Math.max(0, Math.ceil(genres.length / 48) - 1) * 48);
   const choose = (topic: string) => { setText('');setSettledText(''); openTopic(topic); };
  const caption = useCallback((video: LibraryVideo) => selected ? <p className="mt-2 text-xs text-muted">
    {topicEvidence(video, tags[video.id]).find(link => link.topic === selected)?.reason}</p> : null, [selected, tags]);
  const exportLinks = () => {
    const url = URL.createObjectURL(new Blob([topicConnectionsCsv(index)], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = `reelcase-topic-links-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const selectedScore = selected ? index.counts.find(([topic]) => topic === selected)?.[1] : undefined;
  return <section data-topic-catalog data-topic-pending={pending} aria-busy={pending} className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
    <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connected topics</p>
    <h2 className="mt-2 font-display text-2xl text-fg">{selected || selectedGenre ? `Explore ${selected ?? selectedGenre}` : 'Follow an idea across your library.'}</h2>
    {pending && <p role="status" className="mt-2 text-sm text-muted">Updating topic connections…</p>}
    {failed && <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">Topic connections could not finish.<Button size="sm" variant="secondary" onClick={() => setFavoriteRevision(value => value + 1)}>Retry topic connections</Button></div>}
    <p className="mt-2 text-sm text-muted">{index.linked.toLocaleString()} of {index.total.toLocaleString()} public titles linked · {index.saved.toLocaleString()} with saved topics · {(index.linked - index.saved).toLocaleString()} connected by title or category evidence. Saved tags are unchanged.</p>
    {selected && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 px-3 py-2"><span className="text-sm text-fg">#{selected}</span><Button size="sm" variant={tagIsLiked(selected) ? 'default' : 'secondary'} onClick={() => toggleTagLike(selected)}>{tagIsLiked(selected) ? '★ Favorite topic' : '☆ Favorite topic'}</Button><span className="text-xs text-muted">Favorite topics stay at the start of Topics and Stats.</span>{selectedScore && <span className="text-xs text-muted">taste score {Math.round(selectedScore.ratingTotal / selectedScore.count * 1000).toLocaleString()} points from {selectedScore.count.toLocaleString()} linked titles</span>}</div>}
    <TopicAliasReview input={input} />
    <Input className="mt-4 max-w-xl" value={topicSearch} maxLength={120} onChange={event=>setTopicSearch(event.target.value)} aria-label="Find a topic" placeholder="Find a topic, such as science or gaming"/><div className="mt-4 flex flex-wrap gap-2">{index.counts.filter(([topic])=>topic.includes(topicSearch.trim().toLowerCase().replace(/^#/,''))).map(([topic, data]) => <Button key={topic} size="sm" variant={selected === topic ? 'default' : 'secondary'} onClick={() => choose(topic)} title={[...data.providers].join(' + ')}>{tagIsLiked(topic) ? '★ ' : ''}#{topic} · {data.count.toLocaleString()} · score {Math.round(data.ratingTotal / data.count * 1000).toLocaleString()}{data.providers.size > 1 ? ' · ↔' : ''}</Button>)}</div>
    {!pending && !failed && !index.counts.length && <p className="mt-4 text-sm text-muted">No supported topics yet. Add descriptive titles or saved topic tags to connect your media.</p>}
    <Button className="mt-4" size="sm" variant="secondary" disabled={!ready} onClick={exportLinks}>Export topic connections</Button>
    {explorer ? <>
      <div className="mt-5 flex flex-wrap gap-3"><Input className="min-w-0 flex-1 basis-64" maxLength={200} value={text} onChange={event=>setText(event.target.value)} placeholder="Search these titles, saved tags or creators" aria-label="Search Topic Explorer titles"/><select aria-label="Sort Topic Explorer" value={order} onChange={event=>setOrder(event.target.value as TopicFilters['sort'])} className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"><option value="catalog">Library order</option><option value="newest">Newest added</option><option value="title">Title A–Z</option><option value="taste">Your taste</option></select><select aria-label="Topic evidence filter" value={evidence} onChange={event=>setEvidence(event.target.value as TopicFilters['evidence'])} className="min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"><option value="all">All topic evidence</option><option value="saved">Saved tags only</option><option value="inferred">Inferred topics only</option></select></div><p className="mt-2 text-xs text-muted">Filters combine with the selected topic and source. The result cards show why each title is connected.</p>
      {genres.length > 0 && <details className="mt-4 text-sm text-muted" onToggle={event => setGenresOpen(event.currentTarget.open)}><summary className="cursor-pointer">Media genres and Twitch categories · {genres.length}</summary>{genresOpen && <><div className="mt-3 flex flex-wrap gap-2">{genres.slice(genreOffset, genreOffset + 48).map(genre => <Button key={genre} size="sm" variant={selectedGenre === genre ? 'default' : 'secondary'} onClick={() => choose(`genre:${genre}`)}>{genre}</Button>)}</div>{genres.length > 48 && <div className="mt-3 flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" disabled={genreOffset === 0} onClick={() => setGenrePage(Math.max(0, genreOffset / 48 - 1))}>Previous categories</Button><span className="text-xs text-muted">{genreOffset + 1}–{Math.min(genreOffset + 48, genres.length)} of {genres.length}</span><Button size="sm" variant="secondary" disabled={genreOffset + 48 >= genres.length} onClick={() => setGenrePage(genreOffset / 48 + 1)}>Next 48 categories</Button></div>}</>}</details>}
      <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => { setProvider('all');setText('');setSettledText('');setEvidence('all'); useLibrary.getState().setQuery(''); }}>All topics</Button>{['all', 'local', 'youtube', 'twitch'].map(kind => <Button key={kind} size="sm" variant={provider === kind ? 'default' : 'secondary'} onClick={() => setProvider(kind)}>{kind === 'all' ? 'All sources' : kind}</Button>)}</div>
      {related.length > 0 && <div className="mt-4"><p className="text-xs text-muted">Related through titles in this view</p><div className="mt-2 flex flex-wrap gap-2">{related.map(([topic, data]) => <Button key={topic} size="sm" variant="secondary" onClick={() => choose(topic)}>#{topic} · {data.shared} shared · score {Math.round(data.ratingTotal / data.shared * 1000).toLocaleString()}</Button>)}</div></div>}
      {matchesReady && !failed && <><p data-topic-matches={matching.length} className="mt-4 text-sm text-muted">{matching.length.toLocaleString()} matching {matching.length === 1 ? 'title' : 'titles'}</p>
        <div className="mt-4"><VirtualVideoGrid key={`${selected ?? ''}:${selectedGenre ?? ''}:${provider}:${settledText}:${order}:${evidence}`} videos={matching} variant="grid" pageSize={48} caption={caption} /></div></>}
    </> : <div className="mt-5"><h3 className="font-medium text-fg">Where topic coverage needs work</h3><p className="mt-1 text-xs text-muted">Public sources ranked by titles without a supported topic. Counts refresh with your catalog.</p><div className="mt-3 space-y-2">{index.gaps.map(s => <div key={s.id} className="flex flex-wrap justify-between gap-2 text-sm"><button className="text-fg hover:text-accent" onClick={() => { useLibrary.getState().setQuery(''); useLibrary.getState().setSource(s.id); }}>{folders.find(f => f.id === s.id)?.name ?? 'Unavailable source'}</button><span className="text-muted">{s.total - s.linked} unlinked · {Math.round(s.linked / s.total * 100)}% connected</span></div>)}</div></div>}
  </section>;
}
