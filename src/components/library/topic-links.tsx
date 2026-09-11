import { useEffect, useMemo, useState } from 'react';
import { useLibrary } from '@/lib/videos/store';
import { topicsForVideo, topicEvidence, canonicalTopic } from '@/lib/videos/topics';
import { Button } from '@/components/ui/button';
import { VideoCard } from './video-card';
import { openTopic } from '@/lib/videos/topic-navigation';
import { getRating, tagIsLiked, toggleTagLike } from '@/lib/media-feedback';

export function TopicLinks({ explorer = false }: { explorer?: boolean }) {
  const videos = useLibrary((s) => s.videos);
  const tags = useLibrary((s) => s.tags);
  const folders = useLibrary((s) => s.folders);
  const unavailable = useLibrary((s) => s.unavailable);
  const hideDemo = useLibrary((s) => s.hideDemo);
  const query = useLibrary((s) => s.query);
  const [provider, setProvider] = useState('all');
  const [limit, setLimit] = useState(48);
  const [favoriteRevision, setFavoriteRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setFavoriteRevision((value) => value + 1);
    window.addEventListener('reelcase:rating-change', refresh);
    return () => window.removeEventListener('reelcase:rating-change', refresh);
  }, []);
  const selected = explorer ? canonicalTopic(query) : undefined;
  const selectedGenre = explorer && query.startsWith('genre:') ? query.slice(6) : undefined;
  const index = useMemo(() => {
    const hidden = new Set(folders.filter((f) => f.adult).map((f) => f.id));
    const known = new Set(folders.map((f) => f.id));
    const rows = videos.filter((v) => !hidden.has(v.folderId) && !unavailable[v.id] && !(hideDemo && v.isSample) && (known.has(v.folderId) || v.remote || v.isSample)).map((video) => ({ video, topics: topicsForVideo(video, tags[video.id]), provider: video.remote?.kind ?? 'local' }));
    const counts = new Map<string, { count: number; providers: Set<string>; ratingTotal: number }>();
    const sources = new Map<string, { total: number; linked: number }>();
    let saved = 0, linked = 0;
    for (const row of rows) {
      const source = sources.get(row.video.folderId) ?? { total: 0, linked: 0 };
      source.total++; source.linked += Number(row.topics.length > 0);
      sources.set(row.video.folderId, source);
      if (row.topics.length) linked++;
      if (topicEvidence(row.video, tags[row.video.id]).some((link) => link.saved)) saved++;
      for (const topic of row.topics) {
        const entry = counts.get(topic) ?? { count: 0, providers: new Set<string>(), ratingTotal: 0 };
        entry.count++; entry.ratingTotal += getRating(row.video.id); entry.providers.add(row.provider); counts.set(topic, entry);
      }
    }
    return { rows, saved, linked, counts: [...counts].sort((a, b) => Number(tagIsLiked(b[0])) - Number(tagIsLiked(a[0])) || (b[1].ratingTotal / b[1].count) - (a[1].ratingTotal / a[1].count) || b[1].count - a[1].count || a[0].localeCompare(b[0])), gaps: [...sources].map(([id, s]) => ({ id, ...s })).sort((a, b) => (b.total - b.linked) - (a.total - a.linked)).slice(0, 8) };
  }, [videos, tags, folders, unavailable, hideDemo, favoriteRevision]);
  const genres = useMemo(() => [...new Set(index.rows.map((r) => r.video.genre).filter((g): g is string => Boolean(g)))].sort(), [index]);
  const matching = useMemo(() => index.rows.filter((row) => (!selected || row.topics.includes(selected)) && (!selectedGenre || row.video.genre === selectedGenre) && (provider === 'all' || provider === row.provider)), [index, selected, selectedGenre, provider]);
  const related = useMemo(() => {
    const counts = new Map<string, { shared: number; ratingTotal: number }>();
    if (selected) for (const row of matching) for (const topic of row.topics) if (topic !== selected) {
      const entry = counts.get(topic) ?? { shared: 0, ratingTotal: 0 };
      entry.shared++; entry.ratingTotal += getRating(row.video.id); counts.set(topic, entry);
    }
    return [...counts].sort((a, b) => (b[1].ratingTotal / b[1].shared) - (a[1].ratingTotal / a[1].shared) || b[1].shared - a[1].shared || a[0].localeCompare(b[0])).slice(0, 12);
  }, [matching, selected]);
  const choose = (topic: string) => { setLimit(48); setProvider('all'); openTopic(topic); };
  const exportLinks = () => {
    const rows = [['topic', 'public_titles', 'rating_score_0_to_5000', 'ratings_total', 'providers', 'saved_tag_titles', 'inferred_only_titles'], ...index.counts.map(([topic, data]) => {
      const saved = index.rows.filter((r) => topicEvidence(r.video, tags[r.video.id]).some((link) => link.topic === topic && link.saved)).length;
      return [topic, data.count, String(Math.round(data.ratingTotal / data.count * 1000)), data.ratingTotal.toFixed(1), [...data.providers].join(' + '), saved, data.count - saved];
    })];
    const body = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `reelcase-topic-links-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const selectedScore = selected ? index.counts.find(([topic]) => topic === selected)?.[1] : undefined;
  return <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
    <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connected topics</p>
    <h2 className="mt-2 font-display text-2xl text-fg">{selected || selectedGenre ? `Explore ${selected ?? selectedGenre}` : 'Follow an idea across your library.'}</h2>
    <p className="mt-2 text-sm text-muted">{index.linked.toLocaleString()} of {index.rows.length.toLocaleString()} public titles linked · {index.saved.toLocaleString()} with saved topics · {(index.linked - index.saved).toLocaleString()} connected by title or category evidence. Saved tags are unchanged.</p>
    {selected && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 px-3 py-2"><span className="text-sm text-fg">#{selected}</span><Button size="sm" variant={tagIsLiked(selected) ? 'default' : 'secondary'} onClick={() => { toggleTagLike(selected); setFavoriteRevision((value) => value + 1); }}>{tagIsLiked(selected) ? '★ Favorite topic' : '☆ Favorite topic'}</Button><span className="text-xs text-muted">Favorite topics stay at the start of Topics and Stats.</span>{selectedScore && <span className="text-xs text-muted">score {Math.round(selectedScore.ratingTotal / selectedScore.count * 1000).toLocaleString()}/5,000 from {selectedScore.count.toLocaleString()} linked titles</span>}</div>}
    <div className="mt-4 flex flex-wrap gap-2">{index.counts.map(([topic, data]) => <Button key={topic} size="sm" variant={selected === topic ? 'default' : 'secondary'} onClick={() => choose(topic)} title={[...data.providers].join(' + ')}>{tagIsLiked(topic) ? '★ ' : ''}#{topic} · {data.count.toLocaleString()} · score {Math.round(data.ratingTotal / data.count * 1000).toLocaleString()}{data.providers.size > 1 ? ' · ↔' : ''}</Button>)}</div>
    {!index.counts.length && <p className="mt-4 text-sm text-muted">No supported topics yet. Add descriptive titles or saved topic tags to connect your media.</p>}
    <Button className="mt-4" size="sm" variant="secondary" onClick={exportLinks}>Export topic connections</Button>
    {explorer ? <>
      {genres.length > 0 && <details className="mt-4 text-sm text-muted"><summary className="cursor-pointer">Media genres and Twitch categories · {genres.length}</summary><div className="mt-3 flex flex-wrap gap-2">{genres.map((genre) => <Button key={genre} size="sm" variant={selectedGenre === genre ? 'default' : 'secondary'} onClick={() => choose(`genre:${genre}`)}>{genre}</Button>)}</div></details>}
      <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => { useLibrary.getState().setQuery(''); setLimit(48); }}>All topics</Button>{['all', 'local', 'youtube', 'twitch'].map((kind) => <Button key={kind} size="sm" variant={provider === kind ? 'default' : 'secondary'} onClick={() => { setProvider(kind); setLimit(48); }}>{kind === 'all' ? 'All sources' : kind}</Button>)}</div>
      {related.length > 0 && <div className="mt-4"><p className="text-xs text-muted">Related through titles in this view</p><div className="mt-2 flex flex-wrap gap-2">{related.map(([topic, data]) => <Button key={topic} size="sm" variant="secondary" onClick={() => choose(topic)}>#{topic} · {data.shared} shared · score {Math.round(data.ratingTotal / data.shared * 1000).toLocaleString()}</Button>)}</div></div>}
      <p className="mt-4 text-sm text-muted">{matching.length.toLocaleString()} matching {matching.length === 1 ? 'title' : 'titles'}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{matching.slice(0, limit).map(({ video }, i) => <div key={video.id}><VideoCard video={video} variant="grid" index={i}/>{selected && <p className="mt-2 text-xs text-muted">{topicEvidence(video, tags[video.id]).find((link) => link.topic === selected)?.reason}</p>}</div>)}</div>
      {matching.length > limit && <Button className="mt-4" variant="secondary" onClick={() => setLimit((n) => n + 48)}>Show 48 more</Button>}
    </> : <div className="mt-5"><h3 className="font-medium text-fg">Where topic coverage needs work</h3><p className="mt-1 text-xs text-muted">Public sources ranked by titles without a supported topic. Counts refresh with your catalog.</p><div className="mt-3 space-y-2">{index.gaps.map((s) => <div key={s.id} className="flex flex-wrap justify-between gap-2 text-sm"><button className="text-fg hover:text-accent" onClick={() => { useLibrary.getState().setQuery(''); useLibrary.getState().setSource(s.id); }}>{folders.find((f) => f.id === s.id)?.name ?? 'Unavailable source'}</button><span className="text-muted">{s.total - s.linked} unlinked · {Math.round(s.linked / s.total * 100)}% connected</span></div>)}</div></div>}
  </section>;
}
