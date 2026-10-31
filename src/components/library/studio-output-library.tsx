import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { studioOutputs } from "@/lib/videos/persist";
import { STUDIO_OUTPUT_LIMITS, type StudioOutput } from "@/lib/studio-outputs";
import type { StudioSession, StudioImage } from "@/lib/studio-session";
import type { StudioSettings } from "@/lib/studio-settings";

const size = (bytes: number) =>
  bytes < 1024 ? bytes + " B" : (bytes / 1024 ** 2).toFixed(1) + " MiB";
export function StudioOutputLibrary({
  owner,
  session,
  image,
  busy,
  onReuse,
}: {
  owner: string;
  session: StudioSession;
  image: StudioImage | null;
  busy: boolean;
  onReuse: (settings: StudioSettings) => void;
}) {
  const repository = useMemo(() => studioOutputs(owner), [owner]);
  const [rows, setRows] = useState<StudioOutput[]>([]),
    [ready, setReady] = useState(false),
    [working, setWorking] = useState(false),
    [error, setError] = useState(""),
    [note, setNote] = useState("");
  const [opened, setOpened] = useState<{ row: StudioOutput; blob: Blob } | null>(null),
    [url, setUrl] = useState(""),
    [remove, setRemove] = useState("");
  const key = "reelcase.studio-retention.v1:" + encodeURIComponent(owner);
  const [clearOnLeave, setClearOnLeave] = useState(() => {
    try {
      const row = JSON.parse(localStorage.getItem(key) ?? "null");
      return row?.version === 1 && row.clearOnLeave === true;
    } catch {
      return false;
    }
  });
  const alive = useRef(true),
    read = useRef(0);
  useEffect(() => {
    session.setRetainAcrossNavigation(!clearOnLeave);
  }, [session, clearOnLeave]);
  useEffect(() => session.connectView(), [session]);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      read.current++;
    };
  }, []);
  const refresh = async () => {
    setError("");
    try {
      const next = await repository.list();
      if (alive.current) {
        setRows(next);
        setReady(true);
      }
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : "Saved images could not be read.");
    }
  };
  useEffect(() => {
    void refresh();
  }, [repository]);
  useEffect(() => {
    if (!opened) {
      setUrl("");
      return;
    }
    const next = URL.createObjectURL(opened.blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [opened]);
  const save = async () => {
    if (!image || working || !ready) return;
    setWorking(true);
    setError("");
    try {
      const next = await repository.save(image);
      if (alive.current) {
        setRows(next);
        setNote("PNG and image settings saved in this browser for your app account.");
      }
    } catch (e) {
      if (alive.current)
        setError(
          e instanceof Error ? e.message : "Image could not be saved. Download it before leaving.",
        );
    } finally {
      if (alive.current) setWorking(false);
    }
  };
  const open = async (row: StudioOutput) => {
    const token = ++read.current;
    setError("");
    setOpened(null);
    try {
      const blob = await repository.load(row.id);
      if (!alive.current || read.current !== token) return;
      if (blob) setOpened({ row, blob });
      else
        setError(
          "Image bytes are unavailable for “" +
            row.name +
            "”. Its saved receipt and settings are retained; downloaded files are not inspected.",
        );
    } catch (e) {
      if (alive.current && read.current === token)
        setError(e instanceof Error ? e.message : "Could not open this saved image.");
    }
  };
  const forget = async () => {
    if (!remove || working) return;
    setWorking(true);
    setError("");
    try {
      const next = await repository.remove(remove);
      if (alive.current) {
        setRows(next);
        if (opened?.row.id === remove) setOpened(null);
        setRemove("");
        setNote(
          "Selected saved PNG and its receipt removed. Separate recipes and downloaded files are unchanged.",
        );
      }
    } catch (e) {
      if (alive.current)
        setError(e instanceof Error ? e.message : "Could not remove the selected image.");
    } finally {
      if (alive.current) setWorking(false);
    }
  };
  const cleanup = session.getSnapshot().cleanup;
  return (
    <Card className="mt-6" data-studio-outputs>
      <CardHeader>
        <CardTitle>Image storage</CardTitle>
        <CardDescription>
          One temporary result, up to 10 MiB. Saved PNGs stay until you explicitly remove them:{" "}
          {rows.length} / {STUDIO_OUTPUT_LIMITS.saved} ·{" "}
          {size(rows.reduce((sum, row) => sum + row.bytes, 0))} / 128 MiB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted">
          Generating again replaces the temporary result. A failed request preserves the previous
          completed preview. Opening a saved image holds one additional image of at most 10 MiB.
          Browser storage can be cleared by the browser; download important work too. Saved images
          and recipes are excluded from preview cleanup.
        </p>
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={clearOnLeave}
            onChange={(event) => {
              const value = event.target.checked;
              setClearOnLeave(value);
              try {
                localStorage.setItem(key, JSON.stringify({ version: 1, clearOnLeave: value }));
                setNote("Preview retention updated.");
              } catch {
                setError("Retention changed for this visit; it could not be saved for reload.");
              }
            }}
          />
          Clear the temporary preview when I leave the studio
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={
              !image || busy || working || !ready || rows.some((row) => row.id === image?.id)
            }
            onClick={() => void save()}
          >
            {working
              ? "Saving…"
              : rows.some((row) => row.id === image?.id)
                ? "Image saved"
                : "Save image in app"}
          </Button>
          <Button variant="secondary" disabled={!image || busy} onClick={session.previewCleanup}>
            Preview temporary cleanup
          </Button>
          <Button variant="ghost" disabled={working} onClick={() => void refresh()}>
            Refresh saved images
          </Button>
        </div>
        {cleanup && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm leading-6">
              Cleanup will release one temporary image ({size(cleanup.bytes)}). Saved PNGs, recipes,
              image job receipts and downloaded files are protected. This preview expires after five
              minutes; a newer result is never cleared by this plan.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => session.confirmCleanup(cleanup.token)}
              >
                Clear previewed image
              </Button>
              <Button variant="ghost" onClick={session.cancelCleanup}>
                Cancel image cleanup
              </Button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="break-words text-sm text-danger">
            {error}
          </p>
        )}
        {note && (
          <p role="status" className="text-sm text-muted">
            {note}
          </p>
        )}
        <details>
          <summary className="min-h-11 cursor-pointer py-3 text-sm">
            Saved images ({rows.length})
          </summary>
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="space-y-2 rounded-lg border border-border p-3">
                <p className="break-words text-sm font-medium">{row.name}</p>
                <p className="text-xs text-muted">
                  {new Date(row.savedAt).toLocaleString()} · {size(row.bytes)} · {row.settings.size}{" "}
                  × {row.settings.size} · seed {row.seed ?? "not supplied"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="min-h-11"
                    variant="secondary"
                    onClick={() => void open(row)}
                  >
                    Open saved image
                  </Button>
                  <Button
                    size="sm"
                    className="min-h-11"
                    variant="ghost"
                    disabled={busy}
                    onClick={() =>
                      onReuse({ ...row.settings, seed: row.seed ?? row.settings.seed })
                    }
                  >
                    Reuse saved settings
                  </Button>
                  <Button
                    size="sm"
                    className="min-h-11"
                    variant="ghost"
                    disabled={working}
                    onClick={() => setRemove(row.id)}
                  >
                    Remove saved image
                  </Button>
                </div>
                {remove === row.id && (
                  <div className="space-y-2">
                    <p className="text-sm text-danger">
                      Remove this saved PNG and its receipt from this browser? Download it first if
                      you need another copy. Separate recipes are kept.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="min-h-11"
                        variant="secondary"
                        disabled={working}
                        onClick={() => void forget()}
                      >
                        Confirm saved image removal
                      </Button>
                      <Button
                        size="sm"
                        className="min-h-11"
                        variant="ghost"
                        onClick={() => setRemove("")}
                      >
                        Keep saved image
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {ready && !rows.length && (
            <p className="py-3 text-sm text-muted">
              Save a completed image to keep its PNG and settings across reloads.
            </p>
          )}
        </details>
        {opened && (
          <div className="space-y-3">
            <img
              src={url || undefined}
              width={opened.row.settings.size}
              height={opened.row.settings.size}
              alt={opened.row.settings.prompt.slice(0, 150)}
              className="max-h-96 max-w-full rounded-lg object-contain"
            />
            <div className="flex flex-wrap items-center gap-3">
              <a
                className="inline-flex min-h-11 items-center text-sm text-accent"
                download="realhub-saved-image.png"
                href={url}
              >
                Download saved PNG
              </a>
              <Button
                variant="ghost"
                onClick={() => {
                  read.current++;
                  setOpened(null);
                }}
              >
                Close saved image
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
