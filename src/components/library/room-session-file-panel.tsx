import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { RoomMediaDescriptor } from "@/lib/multiplayer/room-media";
import {
  ROOM_SESSION_FILE_BYTES,
  buildRoomSessionFile,
  readRoomSessionFile,
  writeRoomSessionFile,
  previewRoomSessionImport,
  type RoomSessionFile,
  type SessionFileRead,
} from "@/lib/multiplayer/room-session-file";
const EMPTY_PLAYED: RoomMediaDescriptor[] = [];
export const RoomSessionFilePanel = memo(function RoomSessionFilePanel({
  current,
  played = EMPTY_PLAYED,
  queue,
  guest,
  writable,
  onImport,
}: {
  current?: RoomMediaDescriptor | null;
  played?: RoomMediaDescriptor[];
  queue: (RoomMediaDescriptor | null)[];
  guest: boolean;
  writable: boolean;
  onImport: (file: RoomSessionFile) => boolean;
}) {
  const [open, setOpen] = useState(false),
    [loaded, setLoaded] = useState<SessionFileRead>(),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [visible, setVisible] = useState(12);
  const readRevision = useRef(0);
  useEffect(
    () => () => {
      readRevision.current++;
    },
    [],
  );
  const exported = useMemo(
    () => (open ? buildRoomSessionFile({ played, current, upcoming: queue }) : undefined),
    [open, played, current, queue],
  );
  const preview = useMemo(
    () => (loaded ? previewRoomSessionImport(loaded.file, current, queue) : undefined),
    [loaded, current, queue],
  );
  const exportFile = () => {
    if (!exported) return;
    try {
      const url = URL.createObjectURL(
          new Blob([writeRoomSessionFile(exported.file)], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "watch-together-session.json";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
      setNotice(
        "Public session downloaded. Only upcoming items can be imported; playback and room access are excluded.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the session download.");
    }
  };
  const readFile = async (file: File | undefined) => {
    const revision = ++readRevision.current;
    setLoaded(undefined);
    setVisible(12);
    setNotice("");
    setError("");
    if (!file) {
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      if (file.size > ROOM_SESSION_FILE_BYTES)
        throw Error("This session file is too large (maximum 256 KB).");
      const parsed = readRoomSessionFile(await file.text());
      if (revision === readRevision.current) setLoaded(parsed);
    } catch (e) {
      if (revision === readRevision.current)
        setError(
          e instanceof Error
            ? e.message
            : "Could not read this session file. The room was not changed.",
        );
    } finally {
      if (revision === readRevision.current) setBusy(false);
    }
  };
  return (
    <details
      className="mt-4 border-t border-border pt-2"
      aria-label="Session handoff file"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-fg">
        Session handoff file
      </summary>
      {open && (
        <div className="space-y-3">
          <p className="text-xs leading-5 text-muted">
            Share public YouTube/Twitch titles from this room: up to 12 recently played, the current
            title, and 48 upcoming titles. Local files, invitations, participants, private catalog
            IDs and playback settings are excluded.
          </p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="min-h-11"
            onClick={exportFile}
            disabled={
              !exported ||
              (!exported.file.played.length &&
                !exported.file.current &&
                !exported.file.upcoming.length)
            }
          >
            Download session file
          </Button>
          {exported && (
            <p className="text-xs leading-5 text-muted">
              Export: {exported.file.played.length} played · {exported.file.current ? 1 : 0} current
              · {exported.file.upcoming.length} upcoming
              {exported.omitted
                ? ` · ${exported.omitted} local or unsupported entries omitted`
                : ""}
              . Played lists recent room play requests observed during this visit, not completed
              watches or a complete history.
            </p>
          )}
          <label className="block text-sm text-fg">
            Preview a session file
            <input
              aria-label="Import session file"
              type="file"
              accept=".json,application/json"
              className="mt-2 block min-h-11 w-full min-w-0 max-w-full rounded-md border border-border bg-bg p-2 text-xs"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                void readFile(file);
              }}
            />
          </label>
          {busy && (
            <p role="status" className="text-xs text-muted">
              Reading session file…
            </p>
          )}
          {loaded && preview && (
            <section
              aria-label="Session import preview"
              className="space-y-3 rounded-md border border-border bg-bg/50 p-3"
            >
              <p className="text-sm font-medium text-fg">
                {loaded.file.played.length} played · {loaded.file.current ? 1 : 0} current ·{" "}
                {loaded.file.upcoming.length} upcoming in file
              </p>
              <p className="text-xs leading-5 text-muted">
                {preview.media.length} ready to append · {preview.duplicates} duplicates/already on
                stage or queued · {loaded.unsupported} unsupported provider entries ·{" "}
                {loaded.invalid} invalid entries · {preview.unavailable} unavailable identities ·{" "}
                {preview.full} held back by capacity · {preview.slots} queue slots free
              </p>
              {loaded.file.current && (
                <p className="break-words text-xs text-muted">
                  File’s current title (context only): {loaded.file.current.title}
                </p>
              )}
              <p className="text-xs leading-5 text-muted">
                Only eligible upcoming titles are added to the end. Played/current titles, player
                position, play/pause and automatic-next settings are not restored. Links are
                validated locally; provider availability and embed permissions are not checked.
              </p>
              <ol
                className="max-h-64 space-y-2 overflow-y-auto text-xs text-fg"
                aria-label="Upcoming import titles"
              >
                {preview.media.slice(0, visible).map((item) => (
                  <li key={item.id} className="break-words">
                    {item.name}
                    {item.duration
                      ? ` · ${Math.ceil(item.duration / 60)} min known runtime`
                      : item.live
                        ? " · live link"
                        : " · runtime unknown"}
                    <a
                      href={item.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block min-h-11 break-all py-2 text-accent underline"
                    >
                      {item.watchUrl}
                    </a>
                  </li>
                ))}
              </ol>
              {visible < preview.media.length && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => setVisible((n) => n + 12)}
                >
                  Show more import titles
                </Button>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="min-h-11"
                  disabled={guest || !writable || busy || !preview.media.length}
                  onClick={() => {
                    if (guest || !writable || busy) return;
                    if (onImport(loaded.file)) {
                      setNotice(
                        "Session upcoming titles applied. Use Undo queue change to restore the previous queue. The current playback is unchanged.",
                      );
                      setError("");
                    }
                  }}
                >
                  Append upcoming titles
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    readRevision.current++;
                    setLoaded(undefined);
                    setBusy(false);
                    setError("");
                    setNotice("Import preview cleared. The room was not changed.");
                  }}
                >
                  Cancel session import
                </Button>
              </div>
              {guest && (
                <p className="text-xs leading-5 text-muted">
                  Only the host can apply a session file. Guests can preview or download one;
                  existing chat and queue permissions stay in effect.
                </p>
              )}
            </section>
          )}
          {error && (
            <p role="alert" className="break-words text-xs leading-5 text-danger">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="break-words text-xs leading-5 text-accent">
              {notice}
            </p>
          )}
        </div>
      )}
    </details>
  );
});
