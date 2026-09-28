import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FolderPlus, Heart, ListChecks, Radio, Search, Star, Trash2, Twitch, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { creatorIsLiked, getCreatorRating, setCreatorRating, toggleCreatorLike } from "@/lib/media-feedback";
import { useLibrary } from "@/lib/videos/store";
import type { FollowKind, FollowedChannel } from "@/lib/videos/types";

const PAGE_SIZE = 48;
const COLLECTION_KEY = "reelcase.follow-collections.v1";
type SortMode = "recent" | "name" | "favorite" | "rating";
type CreatorCollection = { id: string; name: string; followIds: string[]; createdAt: number };

function creatorLabel(channel: FollowedChannel) {
  return channel.title.trim() || channel.handle.trim() || "Untitled creator";
}

function initials(label: string) {
  return label.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "?";
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

function loadCollections(): CreatorCollection[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(COLLECTION_KEY) ?? "[]");
    if (!Array.isArray(saved)) return [];
    return saved.flatMap((entry): CreatorCollection[] => typeof entry?.id === "string" && typeof entry?.name === "string" && Array.isArray(entry?.followIds)
      ? [{ id: entry.id, name: entry.name.slice(0, 48), followIds: entry.followIds.filter((id: unknown): id is string => typeof id === "string"), createdAt: Number(entry.createdAt) || Date.now() }]
      : []);
  } catch { return []; }
}

/** A bounded, local-first control surface for large YouTube and Twitch follow lists. */
export function FollowManager({ kind }: { kind?: FollowKind }) {
  const follows = useLibrary((state) => state.follows);
  const unfollow = useLibrary((state) => state.unfollow);
  const unfollowMany = useLibrary((state) => state.unfollowMany);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [provider, setProvider] = useState<"all" | FollowKind>(kind ?? "all");
  const [sort, setSort] = useState<SortMode>("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedbackRevision, setFeedbackRevision] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [collectionsReady, setCollectionsReady] = useState(false);
  const [reviewingRemoval, setReviewingRemoval] = useState(false);

  useEffect(() => {
    setProvider(kind ?? "all");
    setVisible(PAGE_SIZE);
  }, [kind]);
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [deferredQuery, provider, sort]);
  useEffect(() => {
    const sync = () => setFeedbackRevision((revision) => revision + 1);
    window.addEventListener("reelcase:rating-change", sync);
    return () => window.removeEventListener("reelcase:rating-change", sync);
  }, []);
  useEffect(() => {
    setCollections(loadCollections());
    setCollectionsReady(true);
  }, []);
  useEffect(() => {
    if (!collectionsReady) return;
    try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(collections)); } catch { /* Collections remain available for this session. */ }
  }, [collections, collectionsReady]);
  useEffect(() => {
    const followIds = new Set(follows.map((follow) => follow.id));
    setSelectedIds((ids) => ids.filter((id) => followIds.has(id)));
    setCollections((saved) => saved.map((collection) => ({ ...collection, followIds: collection.followIds.filter((id) => followIds.has(id)) })).filter((collection) => collection.followIds.length));
  }, [follows]);

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase();
    return follows
      .filter((channel) => (!kind || channel.kind === kind) && (provider === "all" || channel.kind === provider))
      .filter((channel) => !needle || `${creatorLabel(channel)} ${channel.handle}`.toLocaleLowerCase().includes(needle))
      .sort((left, right) => {
        const leftName = creatorLabel(left);
        const rightName = creatorLabel(right);
        if (sort === "name") return leftName.localeCompare(rightName);
        if (sort === "favorite") {
          const favoriteDifference = Number(creatorIsLiked(rightName)) - Number(creatorIsLiked(leftName));
          return favoriteDifference || leftName.localeCompare(rightName);
        }
        if (sort === "rating") {
          const ratingDifference = getCreatorRating(rightName) - getCreatorRating(leftName);
          return ratingDifference || leftName.localeCompare(rightName);
        }
        return (right.lastCheckedAt ?? 0) - (left.lastCheckedAt ?? 0) || leftName.localeCompare(rightName);
      });
  }, [deferredQuery, feedbackRevision, follows, kind, provider, sort]);

  const selected = useMemo(() => filtered.find((channel) => channel.id === selectedId) ?? filtered[0] ?? null, [filtered, selectedId]);
  const shown = filtered.slice(0, visible);
  const selectedName = selected ? creatorLabel(selected) : "";
  const selectedRating = selected ? getCreatorRating(selectedName) : 0;
  const selectedFavorite = selected ? creatorIsLiked(selectedName) : false;
  const selectedForRemoval = useMemo(() => follows.filter((channel) => selectedIds.includes(channel.id)), [follows, selectedIds]);
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
  const toggleSelected = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id]);
  const saveCollection = () => {
    const name = collectionName.trim();
    if (!name || !selectedIds.length) return;
    const next: CreatorCollection = { id: `collection:${Date.now()}`, name: name.slice(0, 48), followIds: selectedIds, createdAt: Date.now() };
    setCollections((saved) => [...saved.filter((collection) => collection.name.toLocaleLowerCase() !== next.name.toLocaleLowerCase()), next]);
    setCollectionName("");
  };
  const loadCollection = (collection: CreatorCollection) => {
    const available = new Set(follows.map((channel) => channel.id));
    setSelectedIds(collection.followIds.filter((id) => available.has(id)));
    setSelectionMode(true);
    setReviewingRemoval(false);
  };
  const removeCollection = (id: string) => setCollections((saved) => saved.filter((collection) => collection.id !== id));
  const removeSelected = () => {
    if (!selectedForRemoval.length || !window.confirm(`Remove ${selectedForRemoval.length} followed creator${selectedForRemoval.length === 1 ? "" : "s"}? Saved videos and favorites stay in your library.`)) return;
    unfollowMany(selectedForRemoval.map((channel) => channel.id));
    setSelectedIds([]);
    setReviewingRemoval(false);
    setSelectedId(null);
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
          <p className="text-sm text-muted"><span className="font-mono text-fg">{filtered.length.toLocaleString()}</span> of {follows.filter((channel) => !kind || channel.kind === kind).length.toLocaleString()} creator{follows.length === 1 ? "" : "s"}</p>
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
            {selectionMode && <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedIds([])}>Clear selection</Button>}
            {scopedCollections.map((collection) => <span key={collection.id} className="inline-flex items-center rounded-sm bg-bg/45"><Button type="button" size="sm" variant="ghost" onClick={() => loadCollection(collection)}>{collection.name} · {collection.followIds.length}</Button><Button type="button" size="icon-sm" variant="ghost" onClick={() => removeCollection(collection.id)} aria-label={`Remove ${collection.name} collection`}><X aria-hidden="true" className="size-3.5" /></Button></span>)}
          </div>
          {selectionMode && <div className="mt-3 grid gap-3 rounded-lg bg-bg/45 p-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
            <Input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} className="h-11" placeholder="Save selected creators as a collection" aria-label="Collection name" />
            <Button type="button" variant="secondary" disabled={!collectionName.trim() || !selectedIds.length} onClick={saveCollection}><FolderPlus aria-hidden="true" className="size-4" />Save collection</Button>
            <Button type="button" variant={reviewingRemoval ? "danger" : "secondary"} disabled={!selectedIds.length} onClick={() => setReviewingRemoval((value) => !value)}><Trash2 aria-hidden="true" className="size-4" />Review removal{selectedIds.length ? ` · ${selectedIds.length}` : ""}</Button>
          </div>}
          {reviewingRemoval && <div className="mt-3 rounded-lg border border-danger/50 bg-danger/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-fg">Review {selectedForRemoval.length} selected creator{selectedForRemoval.length === 1 ? "" : "s"}</p><p className="mt-1 text-sm text-muted">Saved videos and video favorites stay in the library. Only the follow, source folder, and unprotected provider rows are removed.</p></div><Button type="button" size="icon-sm" variant="ghost" onClick={() => setReviewingRemoval(false)} aria-label="Close removal review"><X aria-hidden="true" className="size-4" /></Button></div><p className="mt-3 text-xs text-muted">{selectedForRemoval.slice(0, 12).map(creatorLabel).join(" · ")}{selectedForRemoval.length > 12 ? ` · and ${selectedForRemoval.length - 12} more` : ""}</p><Button type="button" className="mt-4" variant="danger" disabled={!selectedForRemoval.length} onClick={removeSelected}><Trash2 aria-hidden="true" className="size-4" />Remove selected follows</Button></div>}
        </div>
      </div>

      {!filtered.length ? <div className="p-6 text-sm text-muted">{query ? "No followed creators match that search." : "No creators are followed here yet. Use the import tools below to add channels."}</div> : <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(3rem,1fr))]">
            {shown.map((channel) => {
              const label = creatorLabel(channel);
              const favorite = creatorIsLiked(label);
              const rating = getCreatorRating(label);
              const active = selectionMode ? selectedIds.includes(channel.id) : selected?.id === channel.id;
              return <button key={channel.id} type="button" onClick={() => selectionMode ? toggleSelected(channel.id) : setSelectedId(channel.id)} aria-label={`${selectionMode ? "Select" : "Manage"} ${label}`} aria-pressed={active} title={label} className={cn("group relative flex size-11 items-center justify-center overflow-visible rounded-full border bg-elevated text-sm font-semibold text-fg shadow-border transition-[transform,background-color,border-color] duration-150 hover:-translate-y-0.5 hover:bg-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "border-accent ring-2 ring-accent/40" : "border-border")}>
                <span className="flex size-full items-center justify-center overflow-hidden rounded-full bg-bg/60">{channel.thumb ? <img src={channel.thumb} alt="" className="size-full object-cover" loading="lazy" /> : initials(label)}</span>
                <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-surface bg-bg text-accent"><ProviderGlyph kind={channel.kind} /></span>
                {favorite && <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-accent text-accent-fg"><Heart aria-hidden="true" className="size-3 fill-current" /></span>}
                {!favorite && rating > 0 && <span className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-elevated text-accent"><span className="text-[10px] leading-none">{rating}</span></span>}
              </button>;
            })}
          </div>
          {visible < filtered.length && <Button type="button" variant="secondary" className="mt-5" onClick={() => setVisible((count) => Math.min(filtered.length, count + PAGE_SIZE))}>Show 48 more creators</Button>}
        </div>
        {selected && <aside className="border-t border-border bg-elevated/35 p-5 lg:border-t-0 lg:border-l sm:p-6" aria-label={`Manage ${selectedName}`}>
          <div className="flex items-center gap-3">
            <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-bg text-sm font-semibold text-fg">{selected.thumb ? <img src={selected.thumb} alt="" className="size-full object-cover" /> : initials(selectedName)}<span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border border-surface bg-elevated text-accent"><ProviderGlyph kind={selected.kind} /></span></span>
            <div className="min-w-0"><p className="truncate font-medium text-fg">{selectedName}</p><p className="truncate text-xs text-muted">{selected.handle} · {channelStatus(selected)}</p></div>
          </div>
          <div className="mt-5 grid gap-3">
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
