import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { FollowedChannel } from "@/lib/videos/types";
import {
  clipCoverageAction,
  clipCoverageSummary,
  clipWindowLabel,
  clipWindowStop,
} from "@/lib/videos/twitch-clip-coverage";

type Props = {
  channels: FollowedChannel[];
  busy: boolean;
  onPull: (mode: "recent" | "archive", id: string, fresh?: boolean) => void;
};
export function TwitchClipCoveragePanel(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-4 border-t border-border pt-3" aria-label="Twitch clip coverage">
      <Button
        variant="ghost"
        className="min-h-11 w-full justify-start whitespace-normal text-left"
        aria-expanded={open}
        aria-controls="twitch-clip-evidence"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide clip coverage" : "Inspect clip coverage"}
      </Button>
      {open && (
        <div id="twitch-clip-evidence">
          <CoverageSnapshot {...props} />
        </div>
      )}
    </section>
  );
}
function CoverageSnapshot({ channels, busy, onPull }: Props) {
  const available = useMemo(
    () =>
      channels
        .filter((c) => c.twitchClipDiagnostics)
        .sort(
          (a, b) =>
            (b.twitchClipDiagnostics?.servedAt ?? b.twitchClipDiagnostics!.at) -
              (a.twitchClipDiagnostics?.servedAt ?? a.twitchClipDiagnostics!.at) ||
            a.id.localeCompare(b.id),
        ),
    [channels],
  );
  const [selected, setSelected] = useState(""),
    [now, setNow] = useState(() => Date.now());
  const channel = available.find((c) => c.id === selected) ?? available[0];
  const recent = channel ? clipCoverageAction(channel, "recent", now) : undefined,
    older = channel ? clipCoverageAction(channel, "archive", now) : undefined;
  const nextDeadline = Math.min(
    ...[recent?.retryAt, older?.retryAt].filter((at): at is number => !!at && at > now),
  );
  useEffect(() => {
    if (!Number.isFinite(nextDeadline)) return;
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(2_147_483_647, Math.max(1, nextDeadline - Date.now() + 10)),
    );
    return () => clearTimeout(timer);
  }, [nextDeadline]);
  if (!channel)
    return (
      <p className="py-3 text-sm leading-6 text-muted">
        No saved clip coverage yet. Run a recent or older clip update above to record the public
        shelves it checks. Opening this panel makes no provider requests.
      </p>
    );
  const d = channel.twitchClipDiagnostics!,
    summary = clipCoverageSummary(d);
  const date = (at: number | undefined) => (at ? new Date(at).toLocaleString() : "Never recorded");
  return (
    <div className="space-y-4 pt-3" data-clip-coverage-id={channel.id}>
      <label className="block text-xs text-muted">
        Saved creator snapshot
        <select
          aria-label="Clip coverage creator"
          value={channel.id}
          onChange={(e) => {
            setSelected(e.target.value);
            setNow(Date.now());
          }}
          className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg"
        >
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
      <div className="rounded-lg border border-border bg-bg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-medium text-fg">
            {channel.title} · {d.mode === "recent" ? "Recent discovery" : "Older discovery"}
          </h3>
          <span className="rounded border border-border px-2 py-1 text-xs text-muted">
            {d.cacheHit === true
              ? "Warm cache · no new Twitch read"
              : d.cacheHit === false
                ? "Provider observation"
                : "Saved observation · delivery unknown"}
          </span>
        </div>
        <p className="mt-3 text-sm font-medium text-accent">{summary.label}</p>
        <p className="mt-1 text-sm leading-6 text-muted">{summary.detail}</p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            [
              "Unique returned",
              d.accepted +
                (d.requested !== undefined ? " / " + d.requested : " / target unrecorded"),
            ],
            ["Listings read", d.received],
            ["Repeated listings", d.duplicates],
            ["Page attempts", d.pages + (d.maxPages !== undefined ? " / " + d.maxPages : "")],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 font-medium text-fg">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-muted">
          Provider observation: <time dateTime={new Date(d.at).toISOString()}>{date(d.at)}</time>
          {d.servedAt ? <> · Response delivered: {date(d.servedAt)}</> : null}. Unique returned
          clips include matches already saved; they are not a count of new library additions.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2" aria-label="Clip check freshness">
        {(
          [
            [
              "Recent clips",
              channel.twitchClipRecentAttemptedAt,
              channel.twitchClipRecentCheckedAt,
            ],
            ["Older clips", channel.twitchClipArchiveAttemptedAt, channel.twitchClipCheckedAt],
          ] as const
        ).map(([label, attempted, checked]) => (
          <div key={label} className="rounded-lg border border-border p-3">
            <h4 className="text-sm font-medium text-fg">{label}</h4>
            <p className="mt-2 text-xs leading-6 text-muted">
              Last attempted: {date(attempted)}
              <br />
              Last successful check: {date(checked)}
            </p>
          </div>
        ))}
        <p className="text-xs leading-5 text-muted sm:col-span-2">
          Attempt time records your action, including cache deliveries and failures. A cached
          response cannot advance a successful check. Partial shelves can return clips while the
          full check remains unsuccessful.
        </p>
      </div>
      <ul aria-label="Clip shelf evidence" className="grid gap-3 sm:grid-cols-2">
        {d.windows.map((w) => (
          <li key={w.period} className="min-w-0 rounded-lg border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-fg">{clipWindowLabel(w.period)}</h4>
              <span className="text-xs text-accent">
                {w.stop === "budget" && d.stopReason
                  ? "Page budget reached"
                  : clipWindowStop(w.stop)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted">
              {w.accepted} unique
              {w.requested !== undefined ? " / " + w.requested + " allocated" : ""} · {w.received}{" "}
              listings · {w.duplicates} repeats · {w.pages} page attempts
            </p>
            {w.error && <p className="mt-2 break-words text-xs leading-5 text-muted">{w.error}</p>}
          </li>
        ))}
      </ul>
      <p className="text-xs leading-5 text-muted">
        Current, weekly and monthly shelves overlap. Their unique counts share one request target.
        Public highlight rankings are not a complete clip archive. Only the latest bounded snapshot
        is kept for each creator.
      </p>
      <div className="flex flex-wrap gap-3">
        <div className="min-w-0 flex-1 basis-full sm:basis-0">
          <Button
            variant="secondary"
            className="min-h-11 w-full whitespace-normal"
            disabled={busy || !recent?.allowed}
            onClick={() => onPull("recent", channel.id)}
          >
            Refresh this creator’s recent clips
          </Button>
          {recent?.reason && (
            <p className="mt-2 text-xs leading-5 text-muted">Recent: {recent.reason}</p>
          )}
        </div>
        <div className="min-w-0 flex-1 basis-full sm:basis-0">
          <Button
            variant="secondary"
            className="min-h-11 w-full whitespace-normal"
            disabled={busy || !older?.allowed}
            onClick={() => onPull("archive", channel.id)}
          >
            Continue this creator’s older clips
          </Button>
          {older?.reason && (
            <p className="mt-2 text-xs leading-5 text-muted">Older: {older.reason}</p>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-border p-3">
        <Button
          variant="secondary"
          className="min-h-11 w-full whitespace-normal sm:w-auto"
          disabled={busy || !recent?.allowed}
          onClick={() => onPull("recent", channel.id, true)}
        >
          Check fresh recent clips
        </Button>
        <p className="mt-2 text-xs leading-5 text-muted">
          Skip only this creator’s recent clip cache for the selected clip count. Other creators and
          older/VOD/live caches stay warm. Retry waits still apply; this does not increase the page
          budget.
        </p>
      </div>
      <p className="text-xs leading-5 text-muted">
        These actions check only {channel.title}, using the clip count above and the existing page
        limit. Retry waits remain in force. Inspecting or switching snapshots performs no network or
        storage work.
      </p>
    </div>
  );
}
