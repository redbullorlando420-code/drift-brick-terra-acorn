import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, FolderPlus, Heart, ListChecks, Radio, Search, Star, Trash2, Twitch, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { creatorIsLiked, exportFeedback, getCreatorRating, setCreatorRating, toggleCreatorLike } from "@/lib/media-feedback";
import { useLibrary } from "@/lib/videos/store";
import type { FollowKind, FollowedChannel, LibraryVideo } from "@/lib/videos/types";
import { FOLLOW_COLLECTIONS_CHANGED, loadCreatorCollections, saveCreatorCollections, type CreatorCollection } from "@/lib/videos/follow-collections";
import { planFollowRemoval } from "@/lib/videos/follow-removal";
import { youtubeCreatorProfiles } from "@/lib/remote/functions";

const PAGE_SIZE = 48;
const CREATOR_PAGE_SIZE = 100;
const EMPTY_CREATOR_VIDEOS: LibraryVideo[] = [];
type SortMode = "recent" | "name" | "favorite" | "rating";
const nameCollator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

function creatorLabel(channel: FollowedChannel) {
  return channel.title.trim() || channel.handle.trim() || "Untitled creator";
}

function initials(label: string) {
  return label.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
}

function CreatorAvatar({ channel, label }: { channel: FollowedChannel; label: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [channel.thumb]);
  return channel.thumb && !failed
    ? <img src={channel.thumb} alt="" className="size-full object-cover" loading="lazy" decoding="async" fetchPriority="low" onError={() => { setFailed(true); window.dispatchEvent(new CustomEvent("reelcase:creator-avatar-error", { detail: channel.id })); }} />
    : <span aria-hidden="true">{initials(label)}</span>;
}

function ProviderGlyph({ kind, className }: { kind: FollowKind; className?: string }) {
  const Icon = kind === "youtube" ? Youtube : Twitch;
  return <Icon aria-hidden="true" className={cn("size-3", className)} />;
}

function channelStatus(channel: FollowedChannel) {
  if (channel.lastProviderFailure) return channel.lastProviderFailure.kind.replaceAll("-", " ");
  if (channel.live) return "live now";
  if (channel.lastCheckedAt) return `checked ${new Date(channel.lastCheckedAt).toLocaleDateString([], { month: "short", day: "numeric" })}`;
  return "not checked yet";
}

/** The large controls do not mount or scan the video library until requested. */
export function FollowManager({ kind }: { kind?: FollowKind }) {
  const follows = useLibrary((state) => state.follows);
  const [expanded, setExpanded] = useState(false);
  const [initialSelectedId, setInitialSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("recent");
  if (expanded) return <FollowManagerExpanded kind={kind} initialSelectedId={initialSelectedId} sort={sort} setSort={setSort} onCollapse={() => setExpanded(false)} />;
  const scoped = follows.filter((channel) => !kind || channel.kind === kind);
  const heading = kind === "youtube" ? "YouTube creator control" : kind === "twitch" ? "Twitch creator control" : "Creator control";
  return <section className="mb-7 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6" aria-label={heading}>
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Following system</p><h2 className="mt-2 font-display text-2xl text-fg">{heading}</h2><p className="mt-1 text-sm text-muted">{scoped.length.toLocaleString()} followed creator{scoped.length === 1 ? "" : "s"} · open controls to search, sort, pull videos, and manage your list.</p></div><Button type="button" variant="secondary" onClick={() => setExpanded(true)} aria-expanded={false} aria-label={`Expand ${heading}`}>Manage creators</Button></div>
    {scoped.length > 0 && <div className="mt-4 flex flex-wrap gap-2" aria-label="Quick creator access">{scoped.slice(0, 8).map((channel) => { const label = creatorLabel(channel); return <button key={channel.id} type="button" className="flex size-16 items-center justify-center overflow-hidden rounded-full border border-border bg-elevated text-xs font-semibold text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Manage ${label}`} title={label} onClick={() => { setInitialSelectedId(channel.id); setExpanded(true); }}><CreatorAvatar channel={channel} label={label} /></button>; })}{scoped.length > 8 && <span className="flex min-h-11 items-center px-2 text-xs text-muted">+{(scoped.length - 8).toLocaleString()} more</span>}</div>}
  </section>;
}

function FollowManagerExpanded({ kind, initialSelectedId, sort, setSort, onCollapse }: { kind?: FollowKind; initialSelectedId: string | null; sort: SortMode; setSort: (sort: SortMode) => void; onCollapse: () => void }) {
  const follows = useLibrary((state) => state.follows);
  const unfollow = useLibrary((state) => state.unfollow);
  const unfollowMany = useLibrary((state) => state.unfollowMany);
  const updateFollowProfiles = useLibrary((state) => state.updateFollowProfiles);
  const refreshFollows = useLibrary((state) => state.refreshFollows);
  const refreshing = useLibrary((state) => state.refreshing);
  const setSource = useLibrary((state) => state.setSource);
  const openPreview = useLibrary((state) => state.openPreview);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [provider, setProvider] = useState<"all" | FollowKind>(kind ?? "all");
  const [visible, setVisible] = useState(CREATOR_PAGE_SIZE);
  const attemptedCreatorProfiles = useRef(new Set<string>());
  const [brokenCreatorIds, setBrokenCreatorIds] = useState<Set<string>>(() => new Set());
  useEffect(() => { const note = (event: Event) => { const id = (event as CustomEvent<string>).detail; if (id) setBrokenCreatorIds((current) => new Set(current).add(id)); }; window.addEventListener("reelcase:creator-avatar-error", note); return () => window.removeEventListener("reelcase:creator-avatar-error", note); }, []);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [feedbackRevision, setFeedbackRevision] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [reviewingRemoval, setReviewingRemoval] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(PAGE_SIZE);
  const [pullingSelection, setPullingSelection] = useState(false);
  const [creatorVideoQuery, setCreatorVideoQuery] = useState("");
  const [creatorVideoSort, setCreatorVideoSort] = useState<"newest" | "oldest" | "title" | "popular">("newest");
  const [creatorVideoFilter, setCreatorVideoFilter] = useState<"all" | "unwatched" | "favorites">("all");
  const [creatorVideoVisible, setCreatorVideoVisible] = useState(24);
  const videos = useLibrary((state) => selectedId || reviewingRemoval ? state.videos : EMPTY_CREATOR_VIDEOS);
  const hiddenVideos = useLibrary((state) => state.hiddenVideos);
  const favorites = useLibrary((state) => state.favorites);
  const likes = useLibrary((state) => state.likes);
  const progress = useLibrary((state) => state.progress);
  const resumeProgress = useLibrary((state) => state.resumeProgress);
  const history = useLibrary((state) => state.history);

  useEffect(() => {
    setProvider(kind ?? "all");
    setVisible(CREATOR_PAGE_SIZE);
  }, [kind]);
  useEffect(() => {
    setVisible(CREATOR_PAGE_SIZE);
  }, [deferredQuery, provider, sort]);
  useEffect(() => {
    const sync = () => setFeedbackRevision((revision) => revision + 1);
    window.addEventListener("reelcase:rating-change", sync);
    return () => window.removeEventListener("reelcase:rating-change", sync);
  }, []);
  useEffect(() => {
    const sync = () => setCollections(loadCreatorCollections());
    sync();
    window.addEventListener(FOLLOW_COLLECTIONS_CHANGED, sync);
    const syncStorage = (event: StorageEvent) => { if (event.key === "reelcase.follow-collections.v1") sync(); };
    window.addEventListener("storage", syncStorage);
    return () => { window.removeEventListener(FOLLOW_COLLECTIONS_CHANGED, sync); window.removeEventListener("storage", syncStorage); };
  }, []);
  useEffect(() => {
    const followIds = new Set(follows.map((follow) => follow.id));
    setSelectedIds((ids) => ids.filter((id) => followIds.has(id)));
  }, [follows]);
  useEffect(() => { setReviewVisible(PAGE_SIZE); }, [selectedIds]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase();
    const rows = follows
      .filter((channel) => (!kind || channel.kind === kind) && (provider === "all" || channel.kind === provider))
      .filter((channel) => !needle || `${creatorLabel(channel)} ${channel.handle}`.toLocaleLowerCase().includes(needle))
      .map((channel) => {
        const label = creatorLabel(channel);
        return { channel, label, favorite: creatorIsLiked(label), rating: getCreatorRating(label), checkedAt: channel.kind === "youtube" ? channel.catalogCheckedAt ?? channel.lastCheckedAt ?? 0 : channel.lastCheckedAt ?? 0 };
      });
    rows.sort((left, right) => {
      const byName = nameCollator.compare(left.label, right.label) || left.channel.id.localeCompare(right.channel.id);
      if (sort === "name") return byName;
      if (sort === "favorite") return Number(right.favorite) - Number(left.favorite) || right.rating - left.rating || byName;
      if (sort === "rating") return right.rating - left.rating || Number(right.favorite) - Number(left.favorite) || byName;
      return right.checkedAt - left.checkedAt || byName;
    });
    return rows.map((row) => row.channel);
  }, [deferredQuery, feedbackRevision, follows, kind, provider, sort]);

  const selected = useMemo(() => selectedId ? filtered.find((channel) => channel.id === selectedId) ?? null : null, [filtered, selectedId]);
  const shown = filtered.slice(0, visible);
  const missingCreatorIds = shown.filter((channel) => channel.kind === "youtube" && (!channel.thumb || brokenCreatorIds.has(channel.id)) && /^yt:UC[A-Za-z0-9_-]{20,}$/.test(channel.id)).map((channel) => channel.id).join(",");
  useEffect(() => {
    const pending = missingCreatorIds.split(",").filter((id) => id && !attemptedCreatorProfiles.current.has(id));
    if (!pending.length) return;
    let cancelled = false;
    void (async () => {
      for (let index = 0; index < pending.length && !cancelled; index += 16) {
        const ids = pending.slice(index, index + 16);
        ids.forEach((id) => attemptedCreatorProfiles.current.add(id));
        try { const profiles = await youtubeCreatorProfiles({ data: ids }); if (!cancelled) updateFollowProfiles(profiles); }
        catch { /* Existing initials remain when the provider blocks a batch. */ }
        if (index + 16 < pending.length) await new Promise<void>((resolve) => window.setTimeout(resolve, 250));
      }
    })();
    return () => { cancelled = true; };
  }, [missingCreatorIds, updateFollowProfiles]);
  const selectedName = selected ? creatorLabel(selected) : "";
  const selectedVideos = useMemo(() => selected ? videos.filter((video) => !hiddenVideos[video.id] && (video.folderId === selected.id || video.remote?.sourceIds?.includes(selected.id) || (!selected.id.startsWith("ytpl:") && selected.channelId && video.remote?.channelId === selected.channelId))) : [], [hiddenVideos, selected, videos]);
  const watchedVideoIds = useMemo(() => new Set(history.map(entry => entry.id)), [history]);
  const selectedVideoStats = useMemo(() => {
    const ids = new Set(selectedVideos.map((video) => video.id));
    const newest = selectedVideos.reduce((latest, video) => Math.max(latest, video.addedAt || 0), 0);
    return { favorites: selectedVideos.reduce((count, video) => count + Number(Boolean(favorites[video.id])), 0), watched: selectedVideos.reduce((count, video) => count + Number(watchedVideoIds.has(video.id)), 0), newest };
  }, [favorites, selectedVideos, watchedVideoIds]);
  const filteredCreatorVideos = useMemo(() => {
    const needle = creatorVideoQuery.trim().toLocaleLowerCase();
    return selectedVideos.filter((video) => {
      if (needle && !video.name.toLocaleLowerCase().includes(needle)) return false;
      if (creatorVideoFilter === "unwatched" && watchedVideoIds.has(video.id)) return false;
      if (creatorVideoFilter === "favorites" && !favorites[video.id]) return false;
      return true;
    }).sort((a, b) => creatorVideoSort === "title" ? a.name.localeCompare(b.name) : creatorVideoSort === "oldest" ? a.addedAt - b.addedAt : creatorVideoSort === "popular" ? (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt);
  }, [creatorVideoFilter, creatorVideoQuery, creatorVideoSort, favorites, selectedVideos, watchedVideoIds]);
  const selectedPage = selected?.kind === "youtube" ? selected.channelId ? `https://www.youtube.com/channel/${encodeURIComponent(selected.channelId)}` : selected.handle.startsWith("http") ? selected.handle : `https://www.youtube.com/@${encodeURIComponent(selected.handle.replace(/^@/, ""))}` : selected ? `https://www.twitch.tv/${encodeURIComponent(selected.handle.replace(/^@/, ""))}` : "";
  const selectedRating = selected ? getCreatorRating(selectedName) : 0;
  const selectedFavorite = selected ? creatorIsLiked(selectedName) : false;
  const removalPlan = useMemo(() => reviewingRemoval
    ? planFollowRemoval({ follows, videos, favorites, likes, progress, resumeProgress, history }, selectedIds, exportFeedback())
    : null, [reviewingRemoval, follows, videos, favorites, likes, progress, resumeProgress, history, selectedIds]);
  const scopedCollections = useMemo(() => {
    const scope = new Set(follows.filter((channel) => !kind || channel.kind === kind).map((channel) => channel.id));
    return collections.map((collection) => ({ ...collection, followIds: collection.followIds.filter((id) => scope.has(id)) })).filter((collection) => collection.followIds.length);
  }, [collections, follows, kind]);

  const changeFavorite = () => {
    if (!selected) return;
    toggleCreatorLike(selectedName);
    setFeedbackRevision((revision) => revision + 1);
  };
  const rate = (rating: number) => {
    if (!selected) return;
    setCreatorRating(selectedName, selectedRating === rating ? 0 : rating);
    setFeedbackRevision((revision) => revision + 1);
  };
  const remove = () => {
    if (!selected || !window.confirm(`Remove ${selectedName} from your followed creators? Saved videos and favorites stay in your library.`)) return;
    unfollow(selected.id);
    setSelectedId(null);
  };
  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
    setReviewingRemoval(false);
  };
  const updateCollections = (update: (current: CreatorCollection[]) => CreatorCollection[]) => {
    const next = update(collections);
    setCollections(next);
    saveCreatorCollections(next);
  };
  const saveCollection = () => {
    const name = collectionName.trim();
    if (!name || !selectedIds.length) return;
    const next: CreatorCollection = { id: `collection:${Date.now()}`, name: name.slice(0, 48), followIds: selectedIds, createdAt: Date.now() };
    updateCollections((saved) => [...saved.filter((collection) => collection.name.toLocaleLowerCase() !== next.name.toLocaleLowerCase()), next]);
    setCollectionName("");
  };
  const loadCollection = (collection: CreatorCollection) => {
    const available = new Set(follows.filter((channel) => !kind || channel.kind === kind).map((channel) => channel.id));
    setSelectedIds(collection.followIds.filter((id) => available.has(id)));
    setSelectionMode(true);
    setReviewingRemoval(false);
  };
  const removeCollection = (id: string) => updateCollections((saved) => saved.filter((collection) => collection.id !== id));
  const removeSelected = () => {
    if (!removalPlan?.channels.length) return;
    unfollowMany(removalPlan.channels.map((row) => row.follow.id));
    setSelectedIds([]);
    setReviewingRemoval(false);
    setSelectedId(null);
  };
  const pullCreators = async (ids: string[]) => {
    const requested = new Set(ids);
    const youtubeIds = follows.filter((channel) => requested.has(channel.id) && channel.kind === "youtube").map((channel) => channel.id);
    if (!youtubeIds.length || pullingSelection || refreshing) return;
    setPullingSelection(true);
    try {
      await refreshFollows("youtube", { catalog: true, channelIds: youtubeIds });
    } finally { setPullingSelection(false); }
  };

  const heading = kind === "youtube" ? "YouTube creator control" : kind === "twitch" ? "Twitch creator control" : "Creator control";
  const description = kind
    ? `Search, sort, and act on ${kind === "youtube" ? "YouTube" : "Twitch"} follows without mounting the whole list at once.`
    : "Search, sort, and act on every followed creator without mounting the whole list at once.";

  return (
    <section className="mb-7 overflow-hidden rounded-xl border border-border bg-surface shadow-border">
      <div className="border-b border-border bg-elevated/45 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Following system</p>
            <h2 className="mt-2 font-display text-2xl text-fg">{heading}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
          </div>
          <div className="flex items-center gap-3"><p className="text-sm text-muted"><span className="font-mono text-fg">{filtered.length.toLocaleString()}</span> of {follows.filter((channel) => !kind || channel.kind === kind).length.toLocaleString()} creator{follows.length === 1 ? "" : "s"}</p><Button type="button" size="sm" variant="ghost" onClick={onCollapse} aria-label={`Collapse ${heading}`}>Collapse controls</Button></div>
        </div>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 pl-10" placeholder="Find a creator or handle" aria-label="Find a followed creator" />
          </label>
          {!kind && <div className="flex flex-wrap gap-2" aria-label="Filter by service">
            {(["all", "youtube", "twitch"] as const).map((value) => <Button key={value} type="button" size="sm" variant={provider === value ? "default" : "secondary"} onClick={() => setProvider(value)}>{value === "all" ? "All services" : <><ProviderGlyph kind={value} />{value === "youtube" ? "YouTube" : "Twitch"}</>}</Button>)}
          </div>}
          <div className="flex flex-wrap gap-2" aria-label="Sort followed creators">
            {(["recent", "name", "favorite", "rating"] as const).map((value) => <Button key={value} type="button" size="sm" variant={sort === value ? "default" : "secondary"} onClick={() => setSort(value)}>{value === "recent" ? "Recently checked" : value === "name" ? "A–Z" : value === "favorite" ? "Favorites" : "Rating"}</Button>)}
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant={selectionMode ? "default" : "secondary"} onClick={() => { setSelectionMode((value) => !value); setReviewingRemoval(false); }}><ListChecks aria-hidden="true" className="size-4" />{selectionMode ? `Selecting ${selectedIds.length}` : "Select creators"}</Button>
            {selectionMode && <Button type="button" size="sm" variant="secondary" disabled={!filtered.length} onClick={() => { const ids = new Set(selectedIds); filtered.forEach((channel) => ids.add(channel.id)); setSelectedIds([...ids]); setReviewingRemoval(false); }}>Select all {filtered.length.toLocaleString()} matching</Button>}
            {selectionMode && <Button type="button" size="sm" variant="ghost" onClick={() => { setSelectedIds([]); setReviewingRemoval(false); }}>Clear selection</Button>}
            {selectionMode && kind !== "twitch" && <Button type="button" size="sm" disabled={!selectedIds.some((id) => follows.some((channel) => channel.id === id && channel.kind === "youtube")) || pullingSelection || refreshing} onClick={() => void pullCreators(selectedIds)}>{pullingSelection ? "Pulling selected creators…" : `Pull videos · ${selectedIds.filter((id) => follows.some((channel) => channel.id === id && channel.kind === "youtube")).length}`}</Button>}
            {scopedCollections.map((collection) => <span key={collection.id} className="inline-flex items-center rounded-sm bg-bg/45"><Button type="button" size="sm" variant="ghost" onClick={() => loadCollection(collection)}>{collection.name} · {collection.followIds.length}</Button><Button type="button" size="icon-sm" variant="ghost" onClick={() => removeCollection(collection.id)} aria-label={`Remove ${collection.name} collection`}><X aria-hidden="true" className="size-3.5" /></Button></span>)}
          </div>
          {selectionMode && <div className="mt-3 grid gap-3 rounded-lg bg-bg/45 p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
            <Input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} className="h-11" placeholder="Save selected creators as a collection" aria-label="Collection name" />
            <Button type="button" variant="secondary" disabled={!collectionName.trim() || !selectedIds.length} onClick={saveCollection}><FolderPlus aria-hidden="true" className="size-4" />Save collection</Button>
            <Button type="button" variant={reviewingRemoval ? "danger" : "secondary"} disabled={!selectedIds.length} onClick={() => setReviewingRemoval((value) => !value)}><Trash2 aria-hidden="true" className="size-4" />Review removal{selectedIds.length ? ` · ${selectedIds.length}` : ""}</Button>
          </div>}
          {reviewingRemoval && removalPlan && <div className="mt-3 rounded-lg border border-danger/50 bg-danger/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-fg">Review {removalPlan.channels.length} selected creator{removalPlan.channels.length === 1 ? "" : "s"}</p><p className="mt-1 text-sm text-muted">Removing follows also removes their source folders and {removalPlan.removedRows.toLocaleString()} unprotected catalog rows. {removalPlan.keptRows.toLocaleString()} saved or watched rows stay with favorites, likes, ratings, notes, and playback history.</p></div><Button type="button" size="icon-sm" variant="ghost" onClick={() => setReviewingRemoval(false)} aria-label="Close removal review"><X aria-hidden="true" className="size-4" /></Button></div><div className="mt-3 max-h-64 space-y-1 overflow-y-auto rounded-md bg-bg/50 p-2" aria-label="Affected creator preview">{removalPlan.channels.slice(0, reviewVisible).map(({ follow, keptRows, removedRows }) => <div key={follow.id} className="flex items-center justify-between gap-3 rounded-sm px-2 py-1 text-xs"><span className="min-w-0 truncate text-fg">{creatorLabel(follow)} <span className="text-muted">· {follow.kind === "youtube" ? "YouTube" : "Twitch"}</span></span><span className="shrink-0 text-muted">{removedRows} remove · {keptRows} keep</span></div>)}</div>{reviewVisible < removalPlan.channels.length && <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => setReviewVisible((count) => Math.min(removalPlan.channels.length, count + PAGE_SIZE))}>Show next {Math.min(PAGE_SIZE, removalPlan.channels.length - reviewVisible)} affected creators</Button>}<Button type="button" className="mt-4" variant="danger" disabled={!removalPlan.channels.length} onClick={removeSelected}><Trash2 aria-hidden="true" className="size-4" />Remove {removalPlan.channels.length} reviewed follows</Button></div>}
        </div>
      </div>

      {!filtered.length ? <div className="p-6 text-sm text-muted">{query ? "No followed creators match that search." : "No creators are followed here yet. Use the import tools below to add channels."}</div> : <div className={cn("grid min-w-0 grid-cols-1 gap-0", selected && "lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] 2xl:grid-cols-[minmax(0,1fr)_24rem]")}>
        <div className="min-w-0 p-5 sm:p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(4rem,4rem))] gap-3">
            {shown.map((channel) => {
              const label = creatorLabel(channel);
              const favorite = creatorIsLiked(label);
              const rating = getCreatorRating(label);
              const active = selectionMode ? selectedIds.includes(channel.id) : selected?.id === channel.id;
              return <button key={channel.id} type="button" onClick={() => selectionMode ? toggleSelected(channel.id) : setSelectedId(active ? null : channel.id)} aria-label={`${selectionMode ? "Select" : "Manage"} ${label}`} aria-pressed={active} title={label} className={cn("group relative flex size-16 items-center justify-center overflow-visible rounded-full border bg-elevated text-sm font-semibold text-fg shadow-border transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-accent ring-2 ring-accent/40" : "border-border")}>
                <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-bg/60"><CreatorAvatar channel={channel} label={label} /></span>
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-surface bg-bg text-accent"><ProviderGlyph kind={channel.kind} /></span>
                {favorite && <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg"><Heart aria-hidden="true" className="size-3 fill-current" /></span>}
                {!favorite && rating > 0 && <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-elevated text-accent"><span className="text-[10px] leading-none">{rating}</span></span>}
              </button>;
            })}
          </div>
          {!selected && !selectionMode && <p className="mt-4 text-xs text-muted">Choose a creator icon to see videos and actions. More icons load only when you ask.</p>}
          {visible < filtered.length && <Button type="button" variant="secondary" className="mt-5" onClick={() => setVisible((count) => Math.min(filtered.length, count + CREATOR_PAGE_SIZE))}>Show {Math.min(CREATOR_PAGE_SIZE, filtered.length - visible)} more creators</Button>}
        </div>
        {selected && <aside className="min-w-0 w-full border-t border-border bg-elevated/35 p-5 lg:border-t-0 lg:border-l sm:p-6" aria-label={`Manage ${selectedName}`}>
          <div className="flex items-center gap-3">
            <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-bg text-sm font-semibold text-fg"><CreatorAvatar channel={selected} label={selectedName} /><span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border border-surface bg-elevated text-accent"><ProviderGlyph kind={selected.kind} /></span></span>
            <div className="min-w-0"><p className="truncate font-medium text-fg">{selectedName}</p><p className="truncate text-xs text-muted">{selected.handle} · {channelStatus(selected)}</p></div>
          </div>
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-3">
            <p className="break-words text-xs leading-5 text-muted">{selected.description || "No channel description supplied yet. Refresh this creator to look for a public profile description."}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-md bg-bg/55 p-2"><strong className="block text-lg text-fg">{selectedVideos.length}</strong>videos</div><div className="rounded-md bg-bg/55 p-2"><strong className="block text-lg text-fg">{selectedVideoStats.favorites}</strong>favorites</div><div className="rounded-md bg-bg/55 p-2"><strong className="block text-lg text-fg">{selectedVideoStats.watched}</strong>watched</div></div>
            <p className="text-xs text-muted">Latest saved upload · {selectedVideoStats.newest ? new Date(selectedVideoStats.newest).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "No saved uploads yet"}</p>
            <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => void pullCreators([selected.id])} disabled={refreshing || pullingSelection || selected.kind !== "youtube"}>{refreshing || pullingSelection ? "Pulling videos…" : "Pull creator videos"}</Button><Button size="sm" variant="secondary" onClick={() => setSource(selected.id)}>Open creator catalog</Button><a href={selectedPage} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md bg-bg/55 px-3 text-xs text-fg">Channel page <ExternalLink className="size-3" /></a></div>
            <div className="min-w-0"><div className="mb-2 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium tracking-wide text-subtle uppercase">Creator videos · {filteredCreatorVideos.length.toLocaleString()}</p><select aria-label="Sort creator videos" value={creatorVideoSort} onChange={(event) => setCreatorVideoSort(event.target.value as typeof creatorVideoSort)} className="h-8 rounded-md border border-border bg-bg px-2 text-xs text-fg"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="popular">Most views</option><option value="title">Title A–Z</option></select></div><div className="mb-2 flex flex-wrap gap-1" aria-label="Filter creator videos">{(["all", "unwatched", "favorites"] as const).map(value => <Button key={value} size="sm" variant={creatorVideoFilter === value ? "default" : "ghost"} aria-pressed={creatorVideoFilter === value} onClick={() => { setCreatorVideoFilter(value); setCreatorVideoVisible(24); }}>{value === "all" ? "All" : value === "unwatched" ? "Unwatched" : "Favorites"}</Button>)}</div><Input value={creatorVideoQuery} onChange={(event) => { setCreatorVideoQuery(event.target.value); setCreatorVideoVisible(24); }} className="mb-2 h-9" placeholder="Search this creator’s videos" aria-label="Search creator videos" /><div className="max-h-72 min-w-0 space-y-1 overflow-y-auto">{filteredCreatorVideos.slice(0, creatorVideoVisible).map((video) => <button key={video.id} type="button" className="block min-w-0 w-full rounded-md bg-bg/55 px-2 py-2 text-left text-xs text-fg hover:text-accent" title={video.name} onClick={() => openPreview(video.id)}><span className="block truncate">{video.name}</span><span className="mt-1 block text-[11px] text-muted">{video.addedAt > 0 && video.addedAt < Date.now() ? new Date(video.addedAt).toLocaleDateString() : "Date unavailable"} · {video.duration ? `${Math.round(video.duration / 60)} min` : "runtime unknown"} · {(video.remote?.views ?? 0).toLocaleString()} views</span></button>)}{!filteredCreatorVideos.length && <p className="px-2 py-3 text-xs text-muted">{selectedVideos.length ? "No videos match this search." : "No saved videos yet. Pull this creator’s public archive to start the list."}</p>}</div>{creatorVideoVisible < filteredCreatorVideos.length && <Button type="button" size="sm" variant="ghost" className="mt-2 w-full" onClick={() => setCreatorVideoVisible((count) => count + 24)}>Show {Math.min(24, filteredCreatorVideos.length - creatorVideoVisible)} more</Button>}</div>
            <Button type="button" variant={selectedFavorite ? "default" : "secondary"} onClick={changeFavorite}><Heart aria-hidden="true" className={cn("size-4", selectedFavorite && "fill-current")} />{selectedFavorite ? "Creator favorite" : "Favorite creator"}</Button>
            <div><p className="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">Creator rating</p><div className="flex gap-1" aria-label={`Rate ${selectedName}`}>
              {[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" onClick={() => rate(rating)} className="flex size-11 items-center justify-center rounded-md text-accent hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${rating} star${rating === 1 ? "" : "s"}`} aria-pressed={selectedRating === rating}><Star aria-hidden="true" className={cn("size-5", rating <= selectedRating && "fill-current")} /></button>)}
            </div><p className="mt-1 text-xs text-muted">{selectedRating ? `${selectedRating} of 5 stars` : "Not rated"}</p></div>
            <Button type="button" variant="danger" onClick={remove}><Trash2 aria-hidden="true" className="size-4" />Remove following</Button>
          </div>
          <div className="mt-5 border-t border-border pt-4 text-xs text-muted"><p className="flex items-center gap-2"><Radio aria-hidden="true" className="size-3.5 text-accent" />{selected.live ? "Live status is active." : "Follow remains locally stored."}</p>{selected.cache && <p className="mt-2">{selected.cache.scope === "catalog" ? "Focused catalog" : selected.cache.scope === "feed" ? "Routine feed" : "No retained"} cache · {Math.round(selected.cache.hits / Math.max(1, selected.cache.hits + selected.cache.misses) * 100)}% hit rate</p>}</div>
        </aside>}
      </div>}
    </section>
  );
}
