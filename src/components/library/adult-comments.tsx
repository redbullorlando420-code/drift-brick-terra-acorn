import { useEffect, useRef, useState } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import { adultTextFetishTags } from "@/lib/videos/adult-sites";
import { mineRedditCommentTags, redditTitleTokens } from "@/lib/videos/adult-reddit-tags";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import { fetchAdultComments, type AdultComment } from "@/lib/remote/functions";

const COMMENT_KINDS = new Set(["reddit", "youtube", "twitch"]);

export function supportsRemoteComments(kind?: string) {
  return Boolean(kind && COMMENT_KINDS.has(kind));
}

export function AdultComments({ video }: { video: LibraryVideo }) {
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setVideoComments = useLibrary((s) => s.setVideoComments);
  const [comments, setComments] = useState<AdultComment[]>(video.remote?.comments ?? []);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [opened, setOpened] = useState(video.remote?.kind !== "youtube");
  const [visibleRows, setVisibleRows] = useState(20);
  const lastLoadedReload = useRef(-1);
  const linkedRedgifs = Boolean(video.remote?.sourceKinds?.includes("redgifs"));
  const kind = video.remote?.kind;
  const providerVideoId = video.remote?.videoId || (kind === "youtube" ? video.remote?.watchUrl?.match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1] : undefined);

  useEffect(() => {
    let cancelled = false;
    if (!opened) return;
    if (!supportsRemoteComments(kind) || !providerVideoId) {
      setComments(video.remote?.comments ?? []);
      setNote(supportsRemoteComments(kind) ? "" : "No documented public comment feed for this source.");
      return;
    }
    // Twitch clips have no VOD chat replay — skip the network call.
    if (kind === "twitch" && (video.extension === "clip" || video.id.startsWith("tw:c:"))) {
      setComments(video.remote?.comments ?? []);
      setNote("Twitch clips do not expose VOD chat replay.");
      return;
    }
    if (video.remote?.comments?.length && (!reload || lastLoadedReload.current === reload)) {
      setComments(video.remote.comments);
      setNote("");
      setLoading(false);
      // setVideoComments replaces the remote card with a fresh comments array.
      // Refreshing again here re-ran this effect forever, leaving YouTube on
      // “Loading comments…” even after a healthy Innertube response arrived.
      // Cached public comments are already on-demand data, so retain them
      // until the viewer opens the title again instead of immediately polling.
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const result = await fetchAdultComments({
          data: {
            kind: kind ?? "",
            videoId: providerVideoId,
            watchUrl: video.remote?.watchUrl ?? "",
          },
        });
        if (cancelled) return;
        lastLoadedReload.current = reload;
        setComments(result.comments);
        setNote(
          linkedRedgifs && result.comments.length
            ? `${result.note} Linked Redgifs media stays attached to this original Reddit thread.`
            : result.note,
        );
        if (result.comments.length) {
          setVideoComments(video.id, result.comments);
          if (kind === "reddit") {
            const blob = result.comments.map((c) => c.body).join(" ");
            const mined = [
              ...mineRedditCommentTags(blob, 24),
              ...adultTextFetishTags(blob, 16),
              ...redditTitleTokens(video.name, 8),
            ];
            if (mined.length) {
              const existing = useLibrary.getState().tags[video.id] ?? [];
              const merged = [...new Set([...existing, ...mined])].slice(0, 120);
              setVideoTags(video.id, merged);
            }
          }
        }
      } catch (err) {
        if (!cancelled) setNote(err instanceof Error ? err.message : "Comments unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opened, linkedRedgifs, kind, video.id, video.extension, video.name, providerVideoId, video.remote?.watchUrl, video.remote?.comments, reload, setVideoTags, setVideoComments]);

  if (!supportsRemoteComments(kind)) return null;

  const authorPrefix = kind === "reddit" ? "u/" : kind === "youtube" ? "" : "";
  const chatRows = kind === "youtube" ? comments.filter((row) => row.kind === "chat") : [];
  const commentRows = kind === "youtube" ? comments.filter((row) => row.kind !== "chat") : comments;
  const heading = linkedRedgifs
    ? "Reddit comments for linked Redgifs media"
    : kind === "twitch"
      ? "VOD chat"
      : kind === "youtube" && chatRows.length
        ? "Chat + comments"
        : "Comments";

  const renderList = (rows: AdultComment[], emptyLabel?: string) => (
    rows.length > 0 ? (
      <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
        {rows.slice(0, visibleRows).map((comment) => (
          <li key={comment.id} className="rounded-sm bg-elevated/60 px-2 py-1.5 text-xs text-fg">
            {comment.author && <span className="font-medium text-accent">{authorPrefix}{comment.author}{typeof comment.score === "number" ? ` · ${comment.score}` : ""} · </span>}
            {comment.body}
          </li>
        ))}
      </ul>
    ) : (emptyLabel ? <p className="mt-2 text-xs text-muted">{emptyLabel}</p> : null)
  );

  return (
    <section className="mt-3 rounded-lg border border-border bg-bg/40 p-3">
      <button type="button" aria-expanded={opened} onClick={() => setOpened(value => !value)} className="flex min-h-9 items-center gap-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">
        <MessageCircle className="size-3.5" /> {heading}
        <span className="text-muted">{opened ? "Hide" : "Show"}</span>
      </button>
      {opened && <>
      {kind === "youtube" && <button type="button" className="mt-2 text-xs text-accent underline" disabled={loading} onClick={() => setReload((value) => value + 1)}>Refresh public comments{comments.length ? ` · ${comments.filter((row) => row.kind !== "chat").length} threads` : ""}</button>}
      {loading && <p className="mt-2 text-xs text-muted">Loading comments…</p>}
      {!loading && note && <p className="mt-2 text-xs text-muted">{note}</p>}
      {!loading && kind === "youtube" && (chatRows.length > 0 || commentRows.length > 0) && (
        <div className="mt-2 space-y-3">
          {chatRows.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Live chat / replay</p>
              {renderList(chatRows)}
            </div>
          )}
          {commentRows.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-subtle">Comments</p>
              {renderList(commentRows)}
            </div>
          )}
        </div>
      )}
      {!loading && kind !== "youtube" && renderList(commentRows)}
      {!loading && Math.max(chatRows.length, commentRows.length) > visibleRows && <button type="button" className="mt-2 min-h-9 text-xs text-accent underline" onClick={() => setVisibleRows(value => value + 20)}>Show more</button>}
      {!loading && kind === "reddit" && !commentRows.length && video.remote?.watchUrl && (
        <a
          href={video.remote.watchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent hover:underline"
        >
          Open discussion on Reddit <ExternalLink className="size-3.5" />
        </a>
      )}
      </>}
    </section>
  );
}
