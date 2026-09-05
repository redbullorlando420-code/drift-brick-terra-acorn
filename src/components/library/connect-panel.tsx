import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleAlert,
  ListPlus,
  LoaderCircle,
  Radio,
  Sparkles,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/lib/videos/store";
import type { RemoteKind } from "@/lib/videos/types";

type ImportCandidate = { query: string; kind: "youtube" | "twitch" };
/** Split pasted lists on newlines, commas, or whitespace (URLs never contain spaces). */
function linesToCandidates(value: string, kind: RemoteKind): ImportCandidate[] {
  return [
    ...new Set(
      value
        .split(/[\s,]+/)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
  ].map((query) => ({ query, kind }));
}

export function ConnectPanel({ defaultKind = "youtube" }: { defaultKind?: RemoteKind }) {
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const importBatch = useLibrary((s) => s.importBatch);
  const remoteBusy = useLibrary((s) => s.remoteBusy);
  const importProgress = useLibrary((s) => s.importProgress);
  const follows = useLibrary((s) => s.follows);
  const [kind, setKind] = useState<RemoteKind>(defaultKind);
  const [query, setQuery] = useState("");
  const [discovery, setDiscovery] = useState("");
  const [bulk, setBulk] = useState("");
  const [twitchName, setTwitchName] = useState("");
  const [found, setFound] = useState<ImportCandidate[]>([]);
  const [finding, setFinding] = useState(false);
  const candidates = useMemo(() => linesToCandidates(bulk, kind), [bulk, kind]);
  const networkFollows = follows.filter((follow) => follow.kind === kind);
  const submit = async () => {
    const items = linesToCandidates(query, kind);
    if (!items.length) return;
    if (items.length > 1) {
      await importItems(items);
      setQuery("");
      return;
    }
    try {
      await followRemoteQuery(items[0].query, kind);
      setQuery("");
      toast.success(kind === "twitch" ? "Twitch channel added" : "YouTube channel added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that source");
    }
  };
  const importItems = async (items: ImportCandidate[]) => {
    if (!items.length) return;
    try {
      const result = await importBatch(items);
      setBulk("");
      setFound([]);
      if (result.failed && result.failedQueries?.length) {
        toast.message(
          `${result.ok} added · ${result.failed} unavailable`,
          { description: result.failedQueries.slice(0, 8).join(", ") + (result.failedQueries.length > 8 ? "…" : "") },
        );
      } else {
        toast.success(
          result.failed
            ? `${result.ok} added · ${result.failed} unavailable`
            : `${result.ok} channel${result.ok === 1 ? "" : "s"} added`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not import those channels");
    }
  };
  const findTwitchFollows = async () => {
    const login = twitchName.trim();
    if (!login) return;
    setFinding(true);
    try {
      const { fetchTwitchFollowing } = await import("@/lib/remote/api");
      const result = await fetchTwitchFollowing({ data: { login } });
      const rows = result.channels.map((channel) => ({
        query: channel.login,
        kind: "twitch" as const,
      }));
      setFound(rows);
      if (!rows.length)
        toast.message(
          result.privateList
            ? "Twitch did not expose a public following list for that profile."
            : "No follows were found for that profile.",
        );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not look up that Twitch profile");
    } finally {
      setFinding(false);
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-xl bg-surface shadow-border">
      <div className="border-b border-border bg-elevated/45 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
              <Sparkles className="size-3.5" /> Network desk
            </p>
            <h2 className="mt-2 font-display text-3xl leading-none text-fg sm:text-4xl">
              Make Home your live guide.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Bring in creators once. Reelcase groups fresh uploads, recent streams, and live
              channels in one watchable feed.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Metric label="Following" value={follows.length} />
            <Metric label="This network" value={networkFollows.length} />
          </div>
        </div>
        <div
          className="mt-5 inline-flex rounded-md bg-bg/50 p-1 shadow-border"
          role="tablist"
          aria-label="Network"
        >
          <NetworkTab
            active={kind === "youtube"}
            onClick={() => {
              setKind("youtube");
              setFound([]);
            }}
            icon={<Youtube className="size-4" />}
            label="YouTube"
          />
          <NetworkTab
            active={kind === "twitch"}
            onClick={() => {
              setKind("twitch");
              setFound([]);
            }}
            icon={<Radio className="size-4" />}
            label="Twitch"
          />
        </div>
      </div>
      <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <StepBadge number="01" label="Add creators" />
          <p className="mt-2 text-sm text-muted">
            {kind === "youtube"
              ? "Paste a channel URL, @handle, channel ID, or a video link. Several at once is fine."
              : "Paste one or more Twitch usernames or channel URLs (comma, space, or newline separated)."}
          </p>
          <form
            className="mt-3 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                kind === "youtube"
                  ? "youtube.com/@creator or @creator"
                  : "ironmouse, zackrawrr  or  twitch.tv/creator"
              }
              aria-label={kind === "youtube" ? "YouTube channel or video" : "Twitch channels"}
            />
            <Button type="submit" disabled={remoteBusy || !query.trim()} className="sm:w-32">
              {remoteBusy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ChevronRight className="size-4" />
              )}{" "}
              Follow
            </Button>
          </form>
        </div>
        <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <StepBadge
            number="02"
            label="Import several at once"
          />
          <>
              <p className="mt-2 text-sm text-muted">
                {kind === "twitch"
                  ? "Paste a list of Twitch logins or channel URLs. You can also look up someone else's public follows below."
                  : "Paste one channel URL or @handle per line. This is the fastest way to move a saved subscription list into Reelcase."}
              </p>
              <textarea
                value={bulk}
                onChange={(event) => setBulk(event.target.value)}
                className="mt-3 min-h-28 w-full resize-y rounded-md bg-elevated px-3 py-2.5 text-sm text-fg shadow-border outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus-visible:ring-2 focus-visible:ring-ring/50"
                placeholder={
                  kind === "twitch"
                    ? "ironmouse\nzackrawrr\ntwitch.tv/shroud, pokimane"
                    : "@CreatorOne\nyoutube.com/@CreatorTwo\nhttps://youtube.com/channel/UC..."
                }
                aria-label={kind === "twitch" ? "Twitch channels to import" : "YouTube channels to import"}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xs text-subtle">
                  {candidates.length
                    ? `${candidates.length} channels ready`
                    : "Separate with spaces, commas, or new lines."}
                </p>
                <Button
                  size="sm"
                  disabled={remoteBusy || !candidates.length}
                  onClick={() => void importItems(candidates)}
                >
                  {remoteBusy ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ListPlus className="size-4" />
                  )}{" "}
                  Import list
                </Button>
              </div>
              {kind === "twitch" && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-sm text-muted">
                    Or enter a Twitch profile to look for its publicly visible follows, then choose
                    what to add.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={twitchName}
                      onChange={(event) => setTwitchName(event.target.value)}
                      placeholder="Twitch username"
                      aria-label="Twitch username to inspect"
                    />
                    <Button
                      variant="secondary"
                      disabled={finding || !twitchName.trim()}
                      onClick={() => void findTwitchFollows()}
                      className="sm:w-40"
                    >
                      {finding ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <ListPlus className="size-4" />
                      )}{" "}
                      Find follows
                    </Button>
                  </div>
                  {found.length > 0 && (
                    <ImportReview
                      items={found}
                      onImport={() => void importItems(found)}
                      busy={remoteBusy}
                    />
                  )}
                </div>
              )}
            </>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-border bg-elevated/30 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 text-muted">
          <Check className="size-4 text-accent" /> Latest uploads and live streams appear
          automatically on Home.
        </p>
        {importProgress && (
          <p className="font-mono text-xs text-accent">
            {importProgress.label} {importProgress.done}/{importProgress.total}
          </p>
        )}
        {kind === "twitch" && !importProgress && (
          <p className="flex items-center gap-1.5 text-xs text-subtle">
            <CircleAlert className="size-3.5" /> Private following lists cannot be read by Twitch.
          </p>
        )}
      </div>
      {kind === "youtube" && (
        <div className="border-t border-border px-5 py-5 sm:px-6">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Live discovery</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={discovery} onChange={(event) => setDiscovery(event.target.value)} placeholder="Search live channels, games, or events" aria-label="Discover live YouTube channels" />
            <a className="inline-flex min-h-10 items-center justify-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg" target="_blank" rel="noreferrer" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(discovery || "live")}&sp=EgJAAQ%3D%3D`}>Browse live</a>
          </div>
          <p className="mt-2 text-xs text-subtle">Open a live channel, then paste it above to add it to your guide. Your followed channels remain browsable, refreshable, and ready for a random pick from Home.</p>
        </div>
      )}
    </section>
  );
}
function NetworkTab({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex h-10 items-center gap-2 rounded-sm px-4 text-sm transition-[background-color,color,box-shadow] duration-150",
        active ? "bg-surface text-fg shadow-border" : "text-muted hover:text-fg",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-20 rounded-md bg-bg/50 px-3 py-2 shadow-border">
      <p className="font-mono text-lg leading-none tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-subtle">{label}</p>
    </div>
  );
}
function StepBadge({ number, label }: { number: string; label: string }) {
  return (
    <p className="font-mono text-xs font-medium tracking-[0.12em] text-accent uppercase">
      <span className="mr-2 text-subtle">{number}</span>
      {label}
    </p>
  );
}
function ImportReview({
  items,
  onImport,
  busy,
}: {
  items: ImportCandidate[];
  onImport: () => void;
  busy: boolean;
}) {
  return (
    <div className="mt-3 rounded-md bg-elevated p-3 shadow-border">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg">
          {items.length} public follow{items.length === 1 ? "" : "s"} found
        </p>
        <Button size="sm" disabled={busy} onClick={onImport}>
          <ListPlus className="size-4" /> Import all
        </Button>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted">
        {items
          .slice(0, 12)
          .map((item) => item.query)
          .join(" · ")}
        {items.length > 12 ? " · …" : ""}
      </p>
    </div>
  );
}
