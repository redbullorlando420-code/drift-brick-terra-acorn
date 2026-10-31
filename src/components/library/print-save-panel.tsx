import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companionFetch } from "@/lib/companion";
import {
  defaultPrintCopyName,
  validPrintCopyName,
  PRINT_FORMAT_NOTE,
  rememberSavedPrintCopy,
  printPendingKey,
  type PrintSaveReceipt,
} from "@/lib/print-save";
type Props = {
  modelKey: string;
  name: string;
  signature: string;
  exportModel: () => Promise<Blob>;
  onSaved: (signature: string, receipt: PrintSaveReceipt) => void;
};
export function PrintSavePanel({ modelKey, name, signature, exportModel, onSaved }: Props) {
  const [filename, setFilename] = useState(() => defaultPrintCopyName(name)),
    [folders, setFolders] = useState<string[]>([]),
    [folder, setFolder] = useState(""),
    [receipt, setReceipt] = useState<PrintSaveReceipt | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [review, setReview] = useState(false),
    [ack, setAck] = useState(false),
    [pendingId, setPendingId] = useState<string | null>(() => {
      try {
        return localStorage.getItem(printPendingKey(modelKey));
      } catch {
        return null;
      }
    });
  const prepared = useRef<{ blob: Blob; signature: string } | null>(null),
    alive = useRef(true),
    request = useRef<AbortController | null>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      request.current?.abort();
      prepared.current = null;
    };
  }, []);
  const call = async (path: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    request.current = controller;
    const response = await companionFetch(path, {
      ...options,
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(90000)]),
    });
    const data = await response.json();
    if (!response.ok || !data.ok)
      throw Error(data.error || "Companion could not finish this print save.");
    return data;
  };
  const keepPending = (id: string | null) => {
    setPendingId(id);
    try {
      if (id) localStorage.setItem(printPendingKey(modelKey), id);
      else {
        localStorage.removeItem(printPendingKey(modelKey));
        localStorage.removeItem(printPendingKey(modelKey) + ":signature");
      }
    } catch {}
  };
  const saved = (r: PrintSaveReceipt, snapshotSignature: string) => {
    if (r.status !== "done") return;
    const persisted = rememberSavedPrintCopy(modelKey, {
      signature: snapshotSignature,
      receipt: r,
    });
    keepPending(null);
    prepared.current = null;
    onSaved(snapshotSignature, r);
    setNotice(persisted ? r.detail : r.detail + " The browser could not retain this save receipt.");
  };
  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (error) {
      if (alive.current)
        setNotice(
          (error instanceof Error ? error.message : "Print save failed.") +
            " Your editor draft is retained.",
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  };
  const open = () =>
    void run(async () => {
      const data = await call("/prints/save-folders");
      if (!alive.current) return;
      const next = Array.isArray(data.folders)
        ? data.folders
            .filter((p: unknown): p is string => typeof p === "string" && p.length <= 4096)
            .slice(0, 64)
        : [];
      setFolders(next);
      setFolder(next[0] || "");
      setReview(true);
      setNotice(
        next.length
          ? "Choose a new filename and review format limits."
          : "No approved destination exists. Configure a local Companion folder first.",
      );
    });
  const prepare = () =>
    void run(async () => {
      if (!validPrintCopyName(filename) || !folder || !ack)
        throw Error("Choose a new GLB filename, destination and acknowledge the format limits.");
      const captured = signature,
        blob = await exportModel();
      const sha256 = [
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer())),
      ]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      const data = await call("/prints/transactions/review", {
        method: "POST",
        body: JSON.stringify({ name: filename, dir: folder, bytes: blob.size, sha256 }),
      });
      if (!alive.current) return;
      prepared.current = { blob, signature: captured };
      setReceipt(data.receipt);
      keepPending(data.receipt.id);
      try {
        localStorage.setItem(printPendingKey(modelKey) + ":signature", captured);
      } catch {}
      setNotice("Review the exact new path below. No model file has been written.");
    });
  const commit = () =>
    void run(async () => {
      const payload = prepared.current;
      if (!payload || !receipt || signature !== payload.signature)
        throw Error(
          "The model changed after review. Cancel this review and prepare the latest edits.",
        );
      try {
        const data = await call("/prints/transactions/" + receipt.id + "/commit", {
          method: "POST",
          headers: { "content-type": "model/gltf-binary" },
          body: payload.blob,
        });
        if (!alive.current) return;
        setReceipt(data.receipt);
        saved(data.receipt, payload.signature);
      } catch (error) {
        if (alive.current)
          setReceipt((previous) =>
            previous
              ? {
                  ...previous,
                  status: "interrupted",
                  detail: "Save is unconfirmed. Check pending save before retrying.",
                }
              : previous,
          );
        throw error;
      } finally {
        prepared.current = null;
      }
    });
  const check = () =>
    void run(async () => {
      if (!pendingId) return;
      const data = await call("/prints/transactions/" + pendingId);
      if (!alive.current) return;
      setReceipt(data.receipt);
      setReview(true);
      setNotice(data.receipt.detail);
      let captured = "";
      try {
        captured = localStorage.getItem(printPendingKey(modelKey) + ":signature") || "";
      } catch {}
      if (data.receipt.status === "done" && captured) saved(data.receipt, captured);
    });
  const cancel = () =>
    void run(async () => {
      if (pendingId)
        await call("/prints/transactions/" + pendingId + "/cancel", { method: "POST", body: "{}" });
      if (!alive.current) return;
      keepPending(null);
      prepared.current = null;
      setReceipt(null);
      setNotice("Save review cancelled. Your draft and original file are retained.");
    });
  return (
    <section
      aria-label="Save edited print copy"
      className="border-t border-border pt-3 text-xs leading-5 text-muted"
    >
      <h3 className="font-medium text-fg">Save a new model copy</h3>
      <p className="mt-1">
        Edits below are a local draft until a file save is confirmed. The source file stays
        unchanged.
      </p>
      <Button
        className="mt-3 min-h-11"
        size="sm"
        variant="secondary"
        disabled={busy || Boolean(pendingId)}
        onClick={open}
      >
        Choose save destination
      </Button>
      {pendingId && (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            className="min-h-11"
            variant="secondary"
            disabled={busy}
            onClick={check}
          >
            Check pending save
          </Button>
          <Button size="sm" className="min-h-11" variant="ghost" disabled={busy} onClick={cancel}>
            Cancel save review
          </Button>
        </div>
      )}
      {review && (
        <div className="mt-3 space-y-3">
          <label className="block">
            New GLB filename
            <Input
              className="mt-1 min-h-11"
              aria-label="New GLB filename"
              value={filename}
              disabled={busy || Boolean(pendingId)}
              onChange={(e) => setFilename(e.target.value)}
            />
          </label>
          <label className="block">
            Approved destination
            <select
              aria-label="Approved print destination"
              className="mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-2 text-fg"
              value={folder}
              disabled={busy || Boolean(pendingId)}
              onChange={(e) => setFolder(e.target.value)}
            >
              {folders.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <p>{PRINT_FORMAT_NOTE} Embedded textures may be resized to 2048 pixels.</p>
          <label className="flex min-h-11 items-start gap-2">
            <input
              type="checkbox"
              aria-label="I reviewed GLB format limits"
              className="mt-1"
              checked={ack}
              disabled={busy || Boolean(pendingId)}
              onChange={(e) => setAck(e.target.checked)}
            />
            I reviewed the format limits and will save a new copy.
          </label>
          {!pendingId && (
            <Button
              className="min-h-11"
              size="sm"
              disabled={busy || !ack || !folder || !validPrintCopyName(filename)}
              onClick={prepare}
            >
              {busy ? "Preparing…" : "Review new copy"}
            </Button>
          )}
          {receipt && (
            <div className="rounded-md border border-border bg-bg p-3">
              <p className="font-medium text-fg">
                {receipt.status === "done"
                  ? "Confirmed saved copy"
                  : "Save receipt: " + receipt.status}
              </p>
              <p className="mt-1 break-all">{receipt.path}</p>
              <p>{receipt.bytes<1024**2?(receipt.bytes/1024).toFixed(1)+' KiB':(receipt.bytes/1024**2).toFixed(2)+' MiB'} · original retained</p>
              {receipt.status === "review" && prepared.current && (
                <Button
                  size="sm"
                  className="mt-3 min-h-11"
                  disabled={busy || signature !== prepared.current.signature}
                  onClick={commit}
                >
                  {busy ? "Saving…" : "Save reviewed copy"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="mt-3 break-words text-accent">
          {notice}
        </p>
      )}
    </section>
  );
}
