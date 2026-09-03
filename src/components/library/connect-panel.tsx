import { useState } from "react";
import { Radio, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useLibrary } from "@/lib/videos/store";
import type { RemoteKind } from "@/lib/videos/types";

export function ConnectPanel({
  defaultKind = "youtube",
}: {
  defaultKind?: RemoteKind;
}) {
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const remoteBusy = useLibrary((s) => s.remoteBusy);
  const [kind, setKind] = useState<RemoteKind>(defaultKind);
  const [query, setQuery] = useState("");

  const submit = async () => {
    const q = query.trim();
    if (!q) return;
    try {
      await followRemoteQuery(q, kind);
      setQuery("");
      toast.success(kind === "twitch" ? "Twitch channel added" : "YouTube channel added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that source");
    }
  };

  return (
    <section className="mb-8 rounded-xl bg-surface px-5 py-5 shadow-border sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-fg">Networks</h2>
          <p className="mt-1 max-w-lg text-sm text-muted">
            Follow a YouTube channel or Twitch stream. New uploads and going-live
            alerts land in Notifications.
          </p>
        </div>
        <div className="mt-3 flex gap-1 rounded-md bg-elevated p-0.5 shadow-border sm:mt-0">
          <button
            type="button"
            onClick={() => setKind("youtube")}
            className={
              kind === "youtube"
                ? "flex h-9 items-center gap-1.5 rounded-sm bg-surface px-3 text-sm text-fg"
                : "flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm text-muted hover:text-fg"
            }
          >
            <Youtube className="size-3.5" />
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setKind("twitch")}
            className={
              kind === "twitch"
                ? "flex h-9 items-center gap-1.5 rounded-sm bg-surface px-3 text-sm text-fg"
                : "flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm text-muted hover:text-fg"
            }
          >
            <Radio className="size-3.5" />
            Twitch
          </button>
        </div>
      </div>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            kind === "twitch"
              ? "twitch.tv/channel or login"
              : "youtube.com/@channel, video URL, or @handle"
          }
          aria-label={kind === "twitch" ? "Twitch channel" : "YouTube channel or URL"}
        />
        <Button type="submit" disabled={remoteBusy || !query.trim()} className="sm:w-36">
          {remoteBusy ? "Adding…" : "Follow"}
        </Button>
      </form>
    </section>
  );
}
