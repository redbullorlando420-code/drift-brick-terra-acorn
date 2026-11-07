import { useEffect, useState, useSyncExternalStore } from "react";
import { profileSessionStorage as sessionStorage } from "@/lib/local-profile-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  archiveClock,
  archiveWindowLabel,
  archiveWindowState,
  DEFAULT_ARCHIVE_WINDOW,
  validArchiveWindow,
  type ArchiveWorkWindow,
} from "@/lib/archive-work-window";
import {
  updatePullSettings,
  getPullSettings,
  subscribePullSettings,
  DEFAULT_PULL_SETTINGS,
  type PullSettings,
} from "@/lib/pull-settings";
import { registerPeriodicTask } from "@/lib/periodic-work";

export function ArchiveWorkStatus({ window }: { window: Readonly<ArchiveWorkWindow> }) {
  const [, refresh] = useState(0);
  useEffect(() => {
    let next = archiveWindowState(window).nextChangeAt;
    if (!Number.isFinite(next)) return;
    const task = registerPeriodicTask({
      name: "Archive schedule status",
      mode: "visible",
      background: false,
      everyMs: 1,
      enabled: () => Number.isFinite(next),
      notBefore: () => next,
      work: () => {
        next = archiveWindowState(window).nextChangeAt;
        refresh((n) => n + 1);
      },
    });
    return () => task.cancel();
  }, [window]);
  return (
    <p role="status" className="text-xs leading-5 text-muted">
      {archiveWindowLabel(window)}
    </p>
  );
}
export function ArchiveWindowNotice({ onSettings }: { onSettings: () => void }) {
  const settings = useSyncExternalStore(
    subscribePullSettings,
    getPullSettings,
    () => DEFAULT_PULL_SETTINGS,
  );
  if (!settings.archiveWorkWindow.enabled) return null;
  return (
    <section
      aria-label="Archive hours notice"
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
    >
      <ArchiveWorkStatus window={settings.archiveWorkWindow} />
      <Button
        variant="secondary"
        className="min-h-11"
        onClick={() => {
          try {
            sessionStorage.setItem("reelcase.settings-section", "archive-work-window");
          } catch {}
          onSettings();
        }}
      >
        Change archive hours
      </Button>
    </section>
  );
}
const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export function ArchiveWorkWindowPanel({ settings }: { settings: Readonly<PullSettings> }) {
  const saved = settings.archiveWorkWindow;
  const [draft, setDraft] = useState(() =>
    validArchiveWindow(saved)
      ? saved
      : { ...DEFAULT_ARCHIVE_WINDOW, enabled: true, timeZone: deviceZone() },
  );
  const [note, setNote] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    setDraft(
      validArchiveWindow(saved)
        ? saved
        : { ...DEFAULT_ARCHIVE_WINDOW, enabled: true, timeZone: deviceZone() },
    );
  }, [saved]);
  const time = (text: string) =>
    /^\d{2}:\d{2}$/.test(text) ? Number(text.slice(0, 2)) * 60 + Number(text.slice(3, 5)) : -1;
  return (
    <section
      aria-label="Automatic archive work window"
      data-archive-work-window
      className="mt-5 rounded-lg border border-border bg-surface p-4"
    >
      <h3 className="font-medium text-fg">Automatic archive hours</h3>
      <p className="mt-2 text-xs leading-5 text-muted">
        Choose a daily window for automatic YouTube, Twitch and Adult catalog pulls. Manual pulls
        and lightweight live checks keep their existing controls. Accepted pages finish saving; the
        next undispatched request waits. Keep the app open to run work.
      </p>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          setNote("");
          const value =
            !draft.enabled && !validArchiveWindow(draft) ? DEFAULT_ARCHIVE_WINDOW : draft;
          if (!validArchiveWindow(value)) {
            setError(
              "Choose different valid start/end times and a recognized IANA time zone, such as America/New_York.",
            );
            return;
          }
          const disk = updatePullSettings({ archiveWorkWindow: value });
          setNote(
            disk
              ? "Archive hours saved in this profile."
              : "Archive hours apply to this session, but browser storage could not save them. Keep this page open and retry saving.",
          );
        }}
      >
        <label className="flex min-h-11 items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })}
          />
          Use a daily archive window
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-muted">
            Start time
            <Input
              aria-label="Archive start time"
              type="time"
              className="mt-2 min-h-11"
              required
              value={archiveClock(draft.startMinute)}
              onChange={(event) => setDraft({ ...draft, startMinute: time(event.target.value) })}
            />
          </label>
          <label className="text-xs text-muted">
            End time
            <Input
              aria-label="Archive end time"
              type="time"
              className="mt-2 min-h-11"
              required
              value={archiveClock(draft.endMinute)}
              onChange={(event) => setDraft({ ...draft, endMinute: time(event.target.value) })}
            />
          </label>
        </div>
        <label className="block text-xs text-muted">
          Time zone
          <Input
            aria-label="Archive time zone"
            className="mt-2 min-h-11"
            maxLength={80}
            required
            value={draft.timeZone}
            onChange={(event) => setDraft({ ...draft, timeZone: event.target.value })}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="min-h-11">
            Save archive hours
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            onClick={() => setDraft({ ...draft, timeZone: deviceZone() })}
          >
            Use device time zone
          </Button>
        </div>
        {error && (
          <p role="alert" className="text-sm text-accent">
            {error}
          </p>
        )}
        {note && (
          <p role="status" className="text-xs text-muted">
            {note}
          </p>
        )}
      </form>
      <div className="mt-3">
        <ArchiveWorkStatus window={saved} />
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        End earlier than start spans midnight. Hours follow the chosen zone, including
        daylight-saving changes: repeated hours apply twice and skipped minutes do not occur. Missed
        days resume one current turn, without catch-up bursts. Disabling the window restores
        unrestricted hours.
      </p>
    </section>
  );
}
