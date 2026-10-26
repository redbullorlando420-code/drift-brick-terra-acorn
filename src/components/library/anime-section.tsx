import { animeEvidence } from '@/lib/videos/content-classification';
import { useEffect, useMemo, useState } from "react";
import { Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import type { AnimeFilter } from '@/lib/videos/anime-catalog';
import { type LibraryVideo } from "@/lib/videos/types";
import { VirtualVideoGrid } from './virtual-video-grid';
import { useAnimeCatalog } from './use-anime-catalog';
import { useSettledTags } from './use-settled-tags';
import { HubShell, Stat } from './hub-shared';
import {AnimeReviewDesk} from './anime-review';

function useAnimeQuery(value: string) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    if (!value.trim()) { setSettled(value); return; }
    const timer = window.setTimeout(() => setSettled(value), 160);
    return () => window.clearTimeout(timer);
  }, [value]);
  return settled;
}

export function AnimeSection() {
  const videos = useLibrary((s) => s.videos);
  const folders = useLibrary((s) => s.folders);
  const tags = useLibrary((s) => s.tags);
  const metadataProvenance=useLibrary(s=>s.metadataProvenance);
  const unavailable = useLibrary((s) => s.unavailable);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
  const hideDemo = useLibrary((s) => s.hideDemo);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setSource = useLibrary((s) => s.setSource);
  const [filter, setFilter] = useState<AnimeFilter>("all");
  const [series, setSeries] = useState('');
  const [episodeOrder, setEpisodeOrder] = useState(false);
  const [seriesLimit, setSeriesLimit] = useState(12);
  const [query, setQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const settledTags = useSettledTags(tags, true);
  const settledQuery = useAnimeQuery(query), settledTagQuery = useAnimeQuery(tagQuery);
  const input = useMemo(() => ({ videos, folders, tags: settledTags, unavailable, hiddenVideos, hideDemo,metadataProvenance }),
    [videos, folders, settledTags, unavailable, hiddenVideos, hideDemo,metadataProvenance]);
  const catalog = useAnimeCatalog(input, filter, settledQuery, settledTagQuery, series, episodeOrder);
  const animeCount = catalog.index?.anime.length, continueCount = catalog.continuing?.length;
  const filmCount = catalog.index?.filmCount, localCount = catalog.index?.localCount;
  const filtered = catalog.rows;
  const pending = catalog.pending || query !== settledQuery;
  const finderPending = catalog.finderPending || tagQuery !== settledTagQuery;
  const tagMatches = tagQuery === settledTagQuery ? catalog.matches : [];
  const markAnime = (video: LibraryVideo) => {
    const current = tags[video.id] ?? [];
    setVideoTags(video.id, [...new Set([...current,"anime"])]);
  };

  const filters: Array<{ id: AnimeFilter; label: string; count: number | undefined }> = [
    { id: "all", label: "All titles", count: animeCount },
    { id: "continue", label: "Continue", count: continueCount },
    { id: "series", label: "Series", count: animeCount === undefined ? undefined : animeCount - filmCount! - (catalog.index?.specialCount ?? 0) },
    { id: "films", label: "Films", count: filmCount },
    { id: "specials", label: "OVAs & specials", count: catalog.index?.specialCount },
  ];

  return (
    <HubShell
      eyebrow="Anime library"
      icon={<Clapperboard className="size-4" />}
      title="Keep anime on its own shelf."
      copy="A fast, local-first view for anime already in your Realhub catalog. Saved #anime tags and clear anime title/episode evidence keep it separate without copying or proxying third-party playback."
    >
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Anime library summary">
        <Stat label="Anime titles" value={animeCount ?? '…'} />
        <Stat label="Continue watching" value={continueCount ?? '…'} />
        <Stat label="Local titles" value={localCount ?? '…'} />
        <Stat label="Films & specials" value={filmCount === undefined ? '…' : filmCount + (catalog.index?.specialCount ?? 0)} />
      </section>

      <AnimeReviewDesk index={catalog.index}/>

      <section className="mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Browse your shelf</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Search stays inside Anime. Episode, series and film evidence keeps this shelf focused. Gameplay, reviews, trailers, music edits and unrelated description mentions stay in the general library.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setSource("home")}>Add library media</Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your anime titles and tags" aria-label="Search anime library" className="lg:max-w-md" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Anime shelf filters">
            {filters.map((item) => <Button key={item.id} size="sm" variant={filter === item.id ? "default" : "secondary"} aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setSeries(''); }}>{item.label} <span className="ml-1 font-mono tabular-nums opacity-70">{item.count ?? '…'}</span></Button>)}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-xs text-muted">Order<select aria-label="Anime title order" value={episodeOrder ? 'episode' : 'recent'} onChange={event => setEpisodeOrder(event.target.value === 'episode')} className="ml-2 min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"><option value="recent">Recent additions</option><option value="episode">Series & episode order</option></select></label>{series && <Button className="min-h-11" variant="secondary" onClick={() => setSeries('')}>Clear series selection</Button>}</div>
      </section>
      {!!catalog.index?.series.length && <section className="mt-5 rounded-lg border border-border bg-surface p-4" aria-label="Anime series browser"><h2 className="font-display text-xl text-fg">Pick a series, then watch in order.</h2><p className="mt-1 text-xs leading-5 text-muted">Reviewed identities determine approved groups. Other shortcuts use unverified season/episode parsing; review ambiguous remakes above. Films, OVAs and unnumbered titles remain searchable.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{catalog.index.series.slice(0,seriesLimit).map(group => <Button key={group.key} variant={series === group.key ? 'default' : 'secondary'} className="min-h-11 min-w-0 justify-between" aria-pressed={series === group.key} onClick={() => { setSeries(group.key); setFilter('series'); setEpisodeOrder(true); setQuery(''); }}><span className="truncate">{group.title}</span><span className="ml-2 shrink-0 text-xs">{group.count} {group.key.startsWith('anime:')?'reviewed sources':'parsed sources'}</span></Button>)}</div>{seriesLimit < catalog.index.series.length && <Button variant="ghost" className="mt-2 min-h-11" onClick={() => setSeriesLimit(value => value + 12)}>Show 12 more series</Button>}{catalog.index.seriesOverflow && <p className="mt-2 text-xs text-muted">Showing the first 512 series groups. Search still reaches every saved episode.</p>}</section>}

      <div data-anime-ready={!pending && !catalog.failed} aria-busy={pending && !catalog.failed}>
      {catalog.failed ? <section role="alert" className="mt-6 rounded-lg bg-elevated p-5"><p>Anime titles could not be prepared.</p><Button className="mt-3" variant="secondary" onClick={catalog.retry}>Retry Anime</Button></section>
      : pending ? <p role="status" className="mt-6 text-sm text-muted">Updating anime titles…</p>
      : filtered.length ? (
        <section className="mt-6" aria-label="Anime catalog">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">{filters.find((item) => item.id === filter)?.label}</p><p className="mt-1 text-sm text-muted">{filtered.length.toLocaleString()} matching title{filtered.length === 1 ? "" : "s"}</p></div>
            {query && <Button size="sm" variant="ghost" onClick={() => setQuery("")}>Clear search</Button>}
          </div>
          <VirtualVideoGrid key={`${filter}:${series}:${episodeOrder}:${settledQuery}`} videos={filtered} variant="grid" pageSize={36} />
        </section>
      ) : (
        <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
          <p className="font-medium text-fg">No matching anime titles yet.</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Add a local or authorized library source, then use the title finder below to give the right cards a saved #anime tag. Existing media, ratings, history, and resume points remain untouched.</p>
        </section>
      )}
      </div>

      <section className="mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Tag a title into Anime</p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Use this for filenames that do not say “anime” or “manga.” The tag is saved locally, searchable across the app, and included in your existing recovery export.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input value={tagQuery} onChange={(event) => setTagQuery(event.target.value)} placeholder="Find a title already in your library" aria-label="Find a library title to tag as anime" className="sm:max-w-xl" />
          {tagQuery && <Button size="sm" variant="ghost" onClick={() => setTagQuery("")}>Clear</Button>}
        </div>
        {tagQuery && finderPending && !catalog.failed && <p role="status" className="mt-3 text-sm text-muted">Finding library titles…</p>}
        {tagQuery && !finderPending && !tagMatches.length && <p className="mt-3 text-sm text-muted">No catalog titles match that search.</p>}
        {tagMatches.length > 0 && <div className="mt-4 space-y-2">{tagMatches.map((video) => {
           const alreadyAnime = Boolean(animeEvidence(video, tags[video.id],metadataProvenance[video.id]));
           const canMarkAnime=Boolean(animeEvidence(video,["anime"]));
          return <div key={video.id} className="flex flex-wrap items-center gap-3 rounded-md bg-bg/45 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{video.name}</p><p className="mt-0.5 truncate text-xs text-muted">{video.genre || video.extension.toUpperCase()} · {video.remote?.channelName ?? (video.remote ? video.remote.kind : "Local library")}</p></div><Button size="sm" variant={alreadyAnime ? "secondary" : "default"} disabled={alreadyAnime||!canMarkAnime} onClick={() => markAnime(video)}>{alreadyAnime ? "In Anime" : !canMarkAnime ? "Related content · use Topics" : "Add #anime"}</Button></div>;
        })}</div>}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-elevated/70 p-4 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Source boundary</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Realhub does not fetch, download, proxy, or embed video from unverified third-party streaming sites. The Anime desk only organizes media already added to your catalog, and sends external viewing choices through the separate Streaming desk.</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => setSource("streaming")}>Open streaming destinations</Button>
      </section>
    </HubShell>
  );
}
