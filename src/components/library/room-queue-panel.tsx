import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, ArrowDown, Play, Shuffle, X } from "lucide-react";
import { memo, useEffect, useState } from "react";
import type { LibraryVideo } from "@/lib/videos/types";
import type { RoomQueueAction } from "@/lib/multiplayer/room-queue";
import { ROOM_QUEUE_LIMIT } from "@/lib/multiplayer/room-queue";
import { roomMediaKey } from "@/lib/multiplayer/room-media";
export const RoomQueuePanel = memo(function RoomQueuePanel({
  onSearch,
  results,
  queue,
  currentId,
  currentMediaKey,
  guest,
  notice,
  pending = 0,
  autoAdvance,
  onAutoAdvance,
  onSelect,
  onAdd,
  onChange,
  onClear,
  onNext,
  onShuffle,
  onLink,
  catalogPending = false,
  searching = false,
}: {
  onSearch: (value: string) => void;
  results: LibraryVideo[];
  queue: Array<{ id: string; video?: LibraryVideo }>;
  currentId: string;
  currentMediaKey?: string;
  guest: boolean;
  notice: string;
  pending?: number;
  autoAdvance: boolean;
  onAutoAdvance: (value: boolean) => void;
  onSelect: (video: LibraryVideo) => void;
  onAdd: (video: LibraryVideo) => void;
  onChange: (action: RoomQueueAction) => void;
  onClear: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onLink: (value: string) => boolean;
  catalogPending?: boolean;
  searching?: boolean;
}) {
  const [link, setLink] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => onSearch(search), 160);
    return () => window.clearTimeout(timer);
  }, [onSearch, search]);
  const queuedKeys = new Set(queue.flatMap(row => row.video ? [roomMediaKey(row.video)] : []));
  return (
    <section
      className="rounded-lg border border-border bg-elevated p-4 shadow-border"
      aria-label="Room query and queue"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-widest text-accent uppercase">Find & queue</p>
          <h3 className="mt-1 font-display text-xl text-fg">Choose what plays next</h3>
        </div>
        <span className="rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">
          {queue.length} / {ROOM_QUEUE_LIMIT} queued
        </span>
      </div>
      <form
        className="mt-4 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          // Keep a guest's paste available if confirmation times out. The
          // canonical queue deduplicates resubmissions after a reconnect.
          if (onLink(link) && !guest) setLink("");
        }}
      >
        <textarea
          aria-label="Public video link"
          placeholder="Paste YouTube or Twitch links, one per line"
          rows={2}
          maxLength={32768}
          className="min-h-20 w-full resize-y rounded-sm border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={link}
          onChange={(event) => setLink(event.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          variant="secondary"
          className="min-h-11"
          disabled={!link.trim() || queue.length >= ROOM_QUEUE_LIMIT}
        >
          Add link to queue
        </Button>
        {guest && link && <Button type="button" size="sm" variant="ghost" className="ml-2 min-h-11" onClick={() => setLink("")}>Clear pasted links</Button>}
        <p className="text-xs leading-5 text-muted">
          Paste up to 48 links in one batch, even with an empty library. Local files play from the
          host.
          {guest && " Your pasted links stay here until you clear them."}
        </p>
      </form>
      <Input
        className="mt-3"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search playable titles or creators"
        aria-label="Search room videos"
      />
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {(catalogPending || searching) && <p role="status" aria-live="polite" className="text-xs text-muted">{catalogPending ? "Preparing playable videos in the background…" : "Searching the room catalog…"}</p>}
        {results.map((video) => (
          <div key={video.id} className="flex min-w-0 items-center gap-2 rounded-md bg-bg/50 p-2">
            <button
              type="button"
              className="min-h-11 min-w-0 flex-1 truncate text-left text-xs text-fg hover:text-accent"
              title={video.name}
              onClick={() => onSelect(video)}
            >
              {video.name}
            </button>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-11"
              disabled={
                queue.some((row) => row.id === video.id) ||
                video.id === currentId ||
                queuedKeys.has(roomMediaKey(video)) ||
                roomMediaKey(video) === currentMediaKey ||
                queue.length >= ROOM_QUEUE_LIMIT
              }
              onClick={() => onAdd(video)}
            >
              Queue
            </Button>
          </div>
        ))}
        {!results.length && !catalogPending && !searching && (
          <p className="text-xs text-muted">No playable videos match this search.</p>
        )}
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium text-fg">
            Up next · {guest ? "host confirms changes" : "shared order"}
          </p>
          <div className="flex flex-wrap gap-1">
            <Button size="sm" variant="secondary" className="min-h-11" disabled={!queue.length} onClick={onNext}>
              <Play className="size-3" />{guest ? "Request next" : "Play next"}
            </Button>
            <Button size="sm" variant="ghost" className="min-h-11" disabled={queue.length < 2} onClick={onShuffle} aria-label={guest ? "Request queue shuffle" : "Shuffle queue"}>
              <Shuffle className="size-3" />Shuffle
            </Button>
          {!guest && queue.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear queue
            </Button>
          )}
          </div>
        </div>
        {!guest && (
          <label className="mt-3 flex min-h-11 items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(event) => onAutoAdvance(event.target.checked)}
              aria-label="Automatically play next queued title"
            />
            Automatically play next when this video ends
          </label>
        )}
        <p role="status" aria-live="polite" className="mt-2 text-xs text-accent">
          {pending > 0 && <span className="mb-1 block">{pending} change{pending === 1 ? "" : "s"} awaiting host confirmation · retrying automatically</span>}
          {notice ||
            (guest
              ? "Queue changes go to the host; everyone sees the confirmed order."
              : "Queue order is shared with every guest.")}
        </p>
        <ol aria-label="Shared upcoming titles" className="mt-3 max-h-96 space-y-2 overflow-y-auto">
          {queue.map(({ id, video }, index) => (
            <li key={id} data-room-queue-id={id} className="rounded-md bg-bg/45 p-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xs text-accent">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-fg">
                  {video?.name ?? "Waiting for title details…"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {video?.remote?.kind === "youtube"
                  ? "YouTube · shared link"
                  : video?.remote?.kind === "twitch"
                    ? "Twitch · shared link"
                    : "Local · streamed from the host"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="min-h-11"
                  disabled={!video}
                  onClick={() => video && onSelect(video)}
                  aria-label={`${guest ? "Request playback of" : "Play"} ${video?.name ?? id}`}
                >
                  <Play className="size-3" />
                  {guest ? "Request play" : "Play"}
                </Button>
                <Button size="sm" variant="ghost" className="min-h-11" disabled={index===0} aria-label={`Queue ${video?.name??id} next`} onClick={()=>onChange({kind:"next",id})}>
                  Next
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  disabled={index === 0}
                  aria-label={`Move ${video?.name ?? id} up`}
                  onClick={() => onChange({ kind: "up", id })}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  disabled={index === queue.length - 1}
                  aria-label={`Move ${video?.name ?? id} down`}
                  onClick={() => onChange({ kind: "down", id })}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="min-h-11 min-w-11"
                  aria-label={`Remove ${video?.name ?? id} from queue`}
                  onClick={() => onChange({ kind: "remove", id })}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        {!queue.length && (
          <p className="mt-3 text-xs text-muted">
            Search above and add a title. YouTube and Twitch entries carry their own playback
            details.
          </p>
        )}
      </div>
    </section>
  );
});
