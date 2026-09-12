import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { adultTextFetishTags } from "@/lib/videos/adult-sites";
import { mineRedditCommentTags, redditTitleTokens } from "@/lib/videos/adult-reddit-tags";
import { useLibrary } from "@/lib/videos/store";
import type { LibraryVideo } from "@/lib/videos/types";
import type { AdultComment } from "@/lib/remote/api";

export function AdultComments({ video }: { video: LibraryVideo }) {
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const [comments, setComments] = useState<AdultComment[]>(video.remote?.comments ?? []);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (video.remote?.kind !== "reddit" || !video.remote.videoId) {
      setComments(video.remote?.comments ?? []);
      setNote(video.remote?.kind === "reddit" ? "" : "No public comment feed for this source.");
      return;
    }
    setLoading(true);
    void (async () => {
      try {
        const { fetchAdultComments } = await import("@/lib/remote/api");
        const result = await fetchAdultComments({
          data: {
            kind: video.remote?.kind ?? "",
            videoId: video.remote?.videoId ?? "",
            watchUrl: video.remote?.watchUrl ?? "",
          },
        });
        if (cancelled) return;
        setComments(result.comments);
        setNote(result.note);
        if (result.comments.length) {
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
      } catch (err) {
        if (!cancelled) setNote(err instanceof Error ? err.message : "Comments unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [video.id, video.remote?.kind, video.remote?.videoId, video.remote?.watchUrl, video.remote?.comments, setVideoTags]);

  return (
    <section className="mt-3 rounded-lg border border-border bg-bg/40 p-3">
      <p className="flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">
        <MessageCircle className="size-3.5" /> Comments
      </p>
      {loading && <p className="mt-2 text-xs text-muted">Loading comments…</p>}
      {!loading && note && <p className="mt-2 text-xs text-muted">{note}</p>}
      {!loading && comments.length > 0 && (
        <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-sm bg-elevated/60 px-2 py-1.5 text-xs text-fg">
              {comment.author && <span className="font-medium text-accent">u/{comment.author} · </span>}
              {comment.body}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
