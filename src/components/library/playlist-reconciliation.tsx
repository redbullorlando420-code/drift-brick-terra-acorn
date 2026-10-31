import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FollowedChannel } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
export function PlaylistReconciliation({ channel }: { channel: FollowedChannel }) {
  const pull = useLibrary((s) => s.followRemoteQuery),
    busy = useLibrary((s) => s.remoteBusy || s.refreshing);
  const [error, setError] = useState("");
  const walk = channel.playlistWalk;
  return (
    <section
      aria-label="Playlist membership"
      className="space-y-2 rounded-md border border-border bg-bg/40 p-3"
    >
      <p className="text-sm font-medium text-fg">
        {walk?.membership === "confirmed"
          ? "Playlist membership confirmed"
          : "Playlist membership provisional"}
      </p>
      <p className="text-xs leading-5 text-muted">
        {walk
          ? `${walk.count.toLocaleString()} entries observed in this walk. ${walk.membership === "confirmed" ? "The full playlist was checked." : walk.completed ? "Membership changed during the walk. Restart to verify a consistent list." : walk.fromStart ? "Continue pulling to finish this walk." : "Restart from the beginning to verify membership."}`
          : "A complete check from the beginning verifies membership and order."}{" "}
        Videos removed from this playlist stay in your library with their favorites, tags and watch
        history. Partial pulls keep unseen memberships.
      </p>
      {walk && (
        <p className="text-xs text-muted">Last observation {new Date(walk.at).toLocaleString()}</p>
      )}
      <Button
        className="min-h-11"
        variant="secondary"
        disabled={busy}
        onClick={() =>
          void (async () => {
            setError("");
            try {
              await pull(channel.handle, "youtube", { restartPlaylist: true });
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Playlist check failed. Saved videos were kept.",
              );
            }
          })()
        }
      >
        Reconcile playlist from start
      </Button>
      {error && (
        <p role="alert" className="text-xs text-muted">
          {error}
        </p>
      )}
    </section>
  );
}
