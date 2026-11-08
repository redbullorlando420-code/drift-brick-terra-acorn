import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { measureProfileBudget, type ProfileBudget } from "@/lib/profile-storage-budget";
import { StorageRecoveryPanel } from "./storage-recovery-panel";
import type { LocalProfile } from "@/lib/local-profiles";

const number = (value: number | undefined) =>
  value === undefined ? "Unavailable" : value.toLocaleString();
const bytes = (value: number | undefined) =>
  value === undefined
    ? "Unavailable"
    : value < 1024
      ? number(value) + " B"
      : value < 1024 ** 2
        ? (value / 1024).toFixed(1) + " KiB"
        : value < 1024 ** 3
          ? (value / 1024 ** 2).toFixed(1) + " MiB"
          : (value / 1024 ** 3).toFixed(1) + " GiB";
function payload(value: ProfileBudget["artwork"]) {
  if (!value) return "Unavailable";
  return (
    number(value.records) +
    " records · " +
    (value.complete ? "" : "at least ") +
    bytes(value.bytes) +
    (value.complete ? "" : " measured")
  );
}
export function ProfileStoragePanel({
  profiles,
  active,
}: {
  profiles: readonly LocalProfile[];
  active: string;
}) {
  const [selected, setSelected] = useState(active),
    [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ProfileBudget>(),
    [error, setError] = useState(""),
    [cleanup, setCleanup] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => () => pending.current?.abort(), []);
  const measure = async () => {
    pending.current?.abort();
    const request = new AbortController();
    pending.current = request;
    setBusy(true);
    setError("");
    try {
      const result = await measureProfileBudget(selected, request.signal);
      if (!request.signal.aborted) setReport(result);
    } catch {
      if (!request.signal.aborted)
        setError("This profile could not be measured. Its data and your selection were kept.");
    } finally {
      if (!request.signal.aborted) setBusy(false);
    }
  };
  return (
    <section aria-label="Profile storage budget" className="space-y-4">
      <p className="text-sm leading-6 text-muted">
        Compare saved storage without opening another profile or showing its titles, notes or draft
        contents.
      </p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 basis-48 text-xs text-muted">
          Profile to measure
          <select
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg"
            value={selected}
            onChange={(e) => {
              pending.current?.abort();
              setSelected(e.target.value);
              setReport(undefined);
              setBusy(false);
              setError("");
              setCleanup(false);
            }}
          >
            {profiles.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
                {row.id === active ? " (current)" : ""}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={busy || !profiles.some((row) => row.id === selected)}
          onClick={() => void measure()}
        >
          {busy ? "Measuring…" : "Measure selected profile"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {report && (
        <>
          <dl className="grid gap-3 sm:grid-cols-2" aria-label="Storage measurements">
            <div className="rounded-lg border border-border bg-bg p-3">
              <dt className="text-sm font-medium">Protected browser data</dt>
              <dd className="mt-1 text-sm text-muted">
                {number(report.preferences)} setting keys · {number(report.metadataRecords)} local
                catalog and activity records. Disk bytes unavailable.
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              <dt className="text-sm font-medium">Saved print files</dt>
              <dd className="mt-1 text-sm text-muted">{payload(report.prints)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              <dt className="text-sm font-medium">Disposable browser artwork</dt>
              <dd className="mt-1 text-sm text-muted">{payload(report.artwork)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-bg p-3">
              <dt className="text-sm font-medium">Shared storage</dt>
              <dd className="mt-1 text-sm text-muted">
                Whole site estimate: {bytes(report.origin?.usage)} used ·{" "}
                {bytes(report.origin?.quota)} quota. Companion caches and native files are outside
                this measurement.
              </dd>
            </div>
          </dl>
          <p className="text-xs leading-5 text-muted">
            Payload sizes exclude database overhead. Large caches use a bounded sample, so the
            reported bytes can be a lower bound. Shared usage cannot be assigned to one profile.
          </p>
          {report.issues.map((issue) => (
            <p role="status" className="text-xs text-accent" key={issue}>
              {issue}
            </p>
          ))}
          {selected === active ? (
            <Button
              className="min-h-11"
              variant="secondary"
              aria-expanded={cleanup}
              onClick={() => setCleanup((v) => !v)}
            >
              Review current profile cleanup
            </Button>
          ) : (
            <p className="text-xs text-muted">
              Switch to this profile before reviewing its artwork cleanup.
            </p>
          )}
          {selected === active && cleanup && <StorageRecoveryPanel />}
        </>
      )}
    </section>
  );
}
