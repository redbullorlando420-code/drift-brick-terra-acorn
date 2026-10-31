import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { modelTransferRecovery, type ModelTransferRecovery } from "@/lib/model-transfer-recovery";
export type { ModelTransferRecovery } from "@/lib/model-transfer-recovery";
type Review = { canResume: boolean; restartRequired: boolean; issue?: string };
type Fresh = {
  source: { repo: string; revision: string; file: string; bytes: number };
  fingerprint: string;
  note: string;
};
const bytes = (n: number) =>
  n >= 1024 ** 3
    ? (n / 1024 ** 3).toFixed(2) + " GiB"
    : n >= 1024 ** 2
      ? (n / 1024 ** 2).toFixed(1) + " MiB"
      : n.toLocaleString() + " bytes";
export function ModelTransferRecoveryPanel({
  value: rawValue,
  active,
  run,
  request,
}: {
  value?: ModelTransferRecovery;
  active: boolean;
  run: (action: () => Promise<unknown>) => Promise<unknown>;
  request: <T>(path: string, body: object) => Promise<T>;
}) {
  const value = modelTransferRecovery(rawValue);
  const [reviews, setReviews] = useState<Record<string, Review>>({}),
    [fresh, setFresh] = useState<Record<string, Fresh>>({}),
    [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const signature =
    value?.entries
      ?.map(
        (row) =>
          row.id +
          ":" +
          (["done", "cancelled", "downloading"].includes(row.state) ? row.state : "reviewable") +
          ":" +
          row.received,
      )
      .join("|") ?? "";
  useEffect(() => {
    setReviews({});
    setFresh({});
    setConfirmed({});
  }, [signature]);
  if (!value)
    return (
      <p className="mt-4 text-xs leading-5 text-muted">
        Saved model-transfer recovery needs Companion v19. Existing compatible model controls remain
        available.
      </p>
    );
  return (
    <section
      aria-label="Saved model transfers"
      className="mt-5 space-y-3 rounded-lg border border-border p-4"
    >
      <h3 className="text-base font-medium text-fg">Saved model transfers</h3>
      <p className="text-xs leading-5 text-muted">
        Up to {value.maxEntries} receipts. Nothing resumes automatically. Large partial-file
        verification can take several minutes. Review verifies the owned partial and pinned
        publisher revision, size, checksum and ETag when supplied. A new permission grant is
        required after revocation. Installed weights are never replaced. Cancel removes only a
        verified owned partial; changed or unverified files are retained.
      </p>
      {value.error && (
        <p role="alert" className="text-sm text-danger">
          {value.error}
        </p>
      )}
      {value.entries.length === 0 && (
        <p className="text-sm text-muted">No saved model transfers.</p>
      )}
      {value.entries.map((row) => (
        <article
          data-model-transfer={row.id}
          key={row.id}
          className="space-y-3 rounded-md bg-bg p-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="min-w-0 break-all text-sm font-medium text-fg">{row.name}</h4>
            <span className="text-xs text-accent">{row.state}</span>
          </div>
          <p className="break-words text-xs text-muted">
            {row.repo} · revision {row.revision.slice(0, 12)} · {row.role}
          </p>
          <p className="text-xs text-muted">
            {bytes(row.received)} last checkpoint / {bytes(row.bytes)} · {row.note}
          </p>
          {!["done", "cancelled", "downloading", "verifying"].includes(row.state) && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="h-auto min-h-11 max-w-full whitespace-normal break-all text-left"
                disabled={active || !!value.error}
                onClick={() =>
                  void run(async () => {
                    const result = await request<{ review: Review }>(
                      "/studio/models/transfers/" + row.id + "/review",
                      {},
                    );
                    setReviews((current) => ({ ...current, [row.id]: result.review }));
                    setFresh((current) => {
                      const next = { ...current };
                      delete next[row.id];
                      return next;
                    });
                  })
                }
              >
                Review transfer {row.name}
              </Button>
              <Button
                variant="ghost"
                className="h-auto min-h-11 max-w-full whitespace-normal break-all text-left"
                disabled={active || !!value.error}
                onClick={() =>
                  void run(async () => {
                    await request("/studio/models/transfers/" + row.id + "/cancel", {});
                  })
                }
              >
                Cancel saved transfer {row.name}
              </Button>
            </div>
          )}
          {reviews[row.id] && (
            <div
              className="space-y-3 border-t border-border pt-3"
              aria-label={"Transfer review " + row.name}
            >
              <p role="status" className="text-xs leading-5 text-muted">
                {reviews[row.id].canResume
                  ? "Partial and publisher identity verified. Resume appends after the saved checkpoint; full verification still runs before installation."
                  : reviews[row.id].issue || "This saved transfer cannot resume."}
              </p>
              {reviews[row.id].canResume ? (
                <Button
                  className="h-auto min-h-11 max-w-full whitespace-normal break-all text-left"
                  disabled={active}
                  onClick={() =>
                    void run(async () => {
                      await request("/studio/models/transfers/" + row.id + "/resume", {});
                    })
                  }
                >
                  Resume verified transfer {row.name}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="h-auto min-h-11 max-w-full whitespace-normal break-all text-left"
                  disabled={active}
                  onClick={() =>
                    void run(async () => {
                      const result = await request<Fresh>(
                        "/studio/models/transfers/" + row.id + "/fresh-review",
                        {},
                      );
                      setFresh((current) => ({ ...current, [row.id]: result }));
                      setConfirmed((current) => ({ ...current, [row.id]: false }));
                    })
                  }
                >
                  Review separate fresh transfer {row.name}
                </Button>
              )}
            </div>
          )}
          {fresh[row.id] && (
            <div className="space-y-3 border-t border-border pt-3">
              <p className="break-words text-xs leading-5 text-muted">
                {fresh[row.id].source.repo} · revision {fresh[row.id].source.revision.slice(0, 12)}{" "}
                · {bytes(fresh[row.id].source.bytes)}. {fresh[row.id].note}
              </p>
              <label className="flex min-h-11 items-center gap-2 text-xs leading-5 text-muted">
                <input
                  type="checkbox"
                  checked={!!confirmed[row.id]}
                  onChange={(event) =>
                    setConfirmed((current) => ({ ...current, [row.id]: event.target.checked }))
                  }
                  className="size-4 shrink-0 accent-accent"
                />
                Start a separate download and retain the earlier partial
              </label>
              <Button
                className="h-auto min-h-11 max-w-full whitespace-normal break-all text-left"
                disabled={active || !confirmed[row.id]}
                onClick={() =>
                  void run(async () => {
                    await request("/studio/models/transfers/" + row.id + "/fresh", {
                      confirmation: "START FRESH",
                      fingerprint: fresh[row.id].fingerprint,
                    });
                  })
                }
              >
                Start separate fresh transfer {row.name}
              </Button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
