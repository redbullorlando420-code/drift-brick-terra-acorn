import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { checkTwitchAlias } from "@/lib/remote/functions";
import { useLibrary } from "@/lib/videos/store";
import {
  twitchUserId,
  validTwitchAlias,
  type TwitchAlias,
} from "@/lib/videos/twitch-channel-identity";
import type { FollowedChannel } from "@/lib/videos/types";
export function TwitchAliasReview({ channel }: { channel: FollowedChannel }) {
  const [alias, setAlias] = useState<TwitchAlias>(),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const check = async () => {
    if (active.current) return;
    const c = new AbortController();
    active.current = c;
    setBusy(true);
    setAlias(undefined);
    setNote("Checking this saved Twitch user ID…");
    try {
      const result = await checkTwitchAlias({
        data: { userId: channel.channelId, from: channel.handle.toLowerCase() },
        signal: c.signal,
      });
      if (c.signal.aborted) return;
      if (result.alias && !validTwitchAlias(result.alias))
        throw Error("Twitch returned unsupported alias evidence.");
      setAlias(result.alias);
      setNote(
        result.alias
          ? "Review the proven login change before applying it."
          : "Twitch confirms that this user still has the saved login.",
      );
    } catch (e) {
      if (!c.signal.aborted)
        setNote(e instanceof Error ? e.message : "Twitch identity check failed.");
    } finally {
      if (!c.signal.aborted) {
        active.current = null;
        setBusy(false);
      }
    }
  };
  return (
    <section
      aria-label="Twitch login identity"
      className="mt-4 space-y-3 rounded-md border border-border bg-bg/45 p-3"
    >
      <h3 className="text-sm font-medium">Twitch login identity</h3>
      <p className="break-words text-xs leading-5 text-muted">
        {twitchUserId(channel.channelId)
          ? `Saved Twitch user ${channel.channelId}. `
          : "No verified user ID yet. Pull this creator once to establish an identity. "}
        A changed login is applied only after the same user ID proves continuity. Old source IDs,
        VODs, clips and their saved marks stay intact.
      </p>
      {!!channel.twitchAliases?.length && (
        <p className="break-words text-xs text-muted">
          Previous logins · {channel.twitchAliases.join(", ")}
        </p>
      )}
      <Button
        variant="secondary"
        className="min-h-11 max-w-full whitespace-normal"
        disabled={busy || !twitchUserId(channel.channelId)}
        onClick={() => void check()}
      >
        {busy ? "Checking identity…" : "Check current Twitch login"}
      </Button>
      {alias && (
        <div className="space-y-3 text-sm">
          <p className="break-words">
            {alias.from} → {alias.to} · same Twitch user {alias.userId}
          </p>
          <p className="text-xs leading-5 text-muted">
            This changes the login used by future pulls. It retains bookmarks under the original
            source. A different verified account using the old login stays separate. No media or
            ratings are deleted.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 max-w-full whitespace-normal"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void useLibrary
                  .getState()
                  .applyTwitchAlias(channel.id, alias)
                  .then(
                    () => {
                      setAlias(undefined);
                      setNote(
                        "Login updated and identity journal saved. Existing video identities and marks were retained.",
                      );
                    },
                    (e) => setNote(e instanceof Error ? e.message : "Alias was not saved."),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              Apply verified login change
            </Button>
            <Button
              variant="ghost"
              className="min-h-11"
              disabled={busy}
              onClick={() => {
                setAlias(undefined);
                setNote("Review cancelled. The saved login was kept.");
              }}
            >
              Keep saved login
            </Button>
          </div>
        </div>
      )}
      {note && (
        <p role="status" className="break-words text-xs leading-5 text-muted">
          {note}
        </p>
      )}
    </section>
  );
}
