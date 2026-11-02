import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  libraryRestoreState,
  activateLibraryRestore,
  discardLibraryRestore,
  repairLibraryRestoreMirrors,
  restoreDurablePrefs,
} from "@/lib/videos/persist";
import {
  RESTORE_EVENT,
  RESTORE_HEAD,
  installRestoreEpoch,
  restoreEpoch,
  restoreIsPreparing,
  restorePreparationError,
  cancelRestorePreparation,
  type RestoreControl,
} from "@/lib/restore-epoch";

async function hydratePersonalReaders() {
  await restoreDurablePrefs();
  const modules = await Promise.all([
    import("@/lib/media-feedback"),
    import("@/lib/topic-alias-store"),
    import("@/lib/topic-bridge-store"),
    import("@/lib/guide-preset-store"),
    import("@/lib/film-review-store"),
    import("@/lib/anime-review-store"),
    import("@/lib/provider-viewing-store"),
    import("@/lib/recommendation-exposure-store"),
  ]);
  await Promise.all([
    modules[0].hydrateDurableFeedback(),
    modules[1].hydrateTopicAliases(),
    modules[2].hydrateTopicBridges(),
    modules[3].hydrateGuidePreset(),
    modules[4].hydrateFilmReviews(),
    modules[5].hydrateAnimeReviews(),
    modules[6].hydrateProviderViewing(),
    modules[7].hydrateRecommendationExposure(),
  ]);
}
/** A committed generation's mirrors finish before any page can resume personal writes. */
export function RestoreBoundary({ children }: { children: ReactNode }) {
  const [control, setControl] = useState<RestoreControl>(),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const latch = useRef(false);
  useEffect(() => {
    let alive = true;
    const refresh = () =>
      void libraryRestoreState().then(
        (next) => {
          if (alive) {
            setControl(next);
            if (restorePreparationError()) setError(restorePreparationError());
          }
        },
        (e) => {
          if (alive) setError(e instanceof Error ? e.message : "Restore state could not be read.");
        },
      );
    void (async () => {
      try {
        let next = await libraryRestoreState();
        if (!alive) return;
        setControl(next);
        if (next.mirror) {
          await repairLibraryRestoreMirrors();
          location.reload();
          return;
        }
        if (!alive) return;
        setControl(next);
        if (next.phase === "idle") {
          installRestoreEpoch(next.epoch);
          // Existing workspaces keep their lazy startup. Restored generations
          // hydrate readers before they can recreate cleared emergency mirrors.
          if (next.epoch > 0) await hydratePersonalReaders();
          if (alive) {
            setReady(true);
          }
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Recovery could not complete.");
      }
    })();
    const storage = (e: StorageEvent) => {
      if (e.key === RESTORE_HEAD) refresh();
    };
    window.addEventListener(RESTORE_EVENT, refresh);
    window.addEventListener("storage", storage);
    return () => {
      alive = false;
      window.removeEventListener(RESTORE_EVENT, refresh);
      window.removeEventListener("storage", storage);
    };
  }, []);
  const stale = !!control && ready && !control.mirror && control.epoch !== restoreEpoch(),
    blocked =
      (!!error && !ready) || (!!control && (control.phase !== "idle" || !!control.mirror || stale));
  const action = async (work: () => Promise<unknown>) => {
    if (latch.current) return;
    latch.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
      location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore recovery failed.");
      const next = await libraryRestoreState().catch(() => undefined);
      if (next) setControl(next);
    } finally {
      latch.current = false;
      setBusy(false);
    }
  };
  return (
    <>
      {ready && (
        <div inert={blocked || undefined} aria-hidden={blocked || undefined}>
          {children}
        </div>
      )}
      {(!ready || blocked) && (
        <section
          data-workspace-loading="true"
          role={blocked ? "dialog" : undefined}
          aria-modal={blocked ? "true" : undefined}
          aria-label="Library restore recovery"
          className={
            ready
              ? "fixed inset-0 z-50 overflow-y-auto bg-bg/95 p-5 backdrop-blur-sm"
              : "min-h-screen bg-bg p-5"
          }
        >
          <div className="mx-auto mt-12 max-w-xl space-y-4 rounded-xl border border-border bg-surface p-6 text-fg shadow-border">
            <h1 className="font-display text-3xl">
              {stale
                ? "Library restored in another tab"
                : control?.mirror
                  ? "Finishing library recovery"
                  : control?.phase === "ready"
                    ? "Verified restore ready"
                    : control?.phase === "capturing"
                      ? "Preparing a safe restore"
                      : "Loading your saved workspace"}
            </h1>
            {control?.name && <p className="break-words text-sm text-muted">{control.name}</p>}
            <p className="text-sm leading-6 text-muted">
              {stale
                ? "Reload to use the complete restored generation. This tab’s older state cannot overwrite it."
                : control?.mirror
                  ? "The personal data transaction committed. Emergency mirrors must finish before the workspace can safely resume. Retrying is idempotent; rollback remains available."
                  : control?.phase === "ready"
                    ? "Both generations were read back and verified. Activation switches the complete personal-data snapshot together and retains one recovery slot. Native media and folder permissions are not changed. Activating another restore replaces the earlier recovery slot."
                    : control?.phase === "capturing"
                      ? "The current library has not been replaced. Preparation stores and verifies a separate personal-data snapshot. If preparation was interrupted, discard it safely and inspect the backup again."
                      : "Checking saved preferences and any interrupted restore before opening your pages."}
            </p>
            {error && (
              <p role="alert" className="break-words text-sm text-danger">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {restoreIsPreparing() && (
                <Button
                  variant="secondary"
                  className="min-h-11 max-w-full whitespace-normal"
                  onClick={cancelRestorePreparation}
                >
                  Stop preparation
                </Button>
              )}
              {stale && (
                <Button
                  className="min-h-11 max-w-full whitespace-normal"
                  onClick={() => location.reload()}
                >
                  Reload restored workspace
                </Button>
              )}
              {!stale && control?.phase === "ready" && (
                <Button
                  className="min-h-11 max-w-full whitespace-normal"
                  disabled={busy}
                  onClick={() => void action(() => activateLibraryRestore())}
                >
                  {busy ? "Activating…" : "Activate verified restore and reload"}
                </Button>
              )}
              {!stale && control?.phase !== "idle" && control && !control.mirror && (
                <Button
                  variant="secondary"
                  className="min-h-11 max-w-full whitespace-normal"
                  disabled={busy || restoreIsPreparing()}
                  onClick={() => void action(discardLibraryRestore)}
                >
                  Discard staged restore
                </Button>
              )}
              {!stale && control?.mirror && (
                <Button
                  className="min-h-11 max-w-full whitespace-normal"
                  disabled={busy}
                  onClick={() => void action(repairLibraryRestoreMirrors)}
                >
                  Retry mirror recovery
                </Button>
              )}
              {!stale && control?.mirror && control.previous && (
                <Button
                  variant="secondary"
                  className="min-h-11 max-w-full whitespace-normal"
                  disabled={busy}
                  onClick={() => void action(() => activateLibraryRestore(true))}
                >
                  Roll back restore and reload
                </Button>
              )}
              {!ready && error && !control && (
                <Button
                  variant="secondary"
                  className="min-h-11 max-w-full whitespace-normal"
                  onClick={() => location.reload()}
                >
                  Retry workspace recovery
                </Button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export function LibraryRestoreRecovery() {
  const [control, setControl] = useState<RestoreControl>(),
    [review, setReview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    void libraryRestoreState().then(
      (v) => {
        if (alive) setControl(v);
      },
      (e) => {
        if (alive) setError(e instanceof Error ? e.message : "Recovery state unavailable.");
      },
    );
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section
      aria-label="Library restore recovery slot"
      className="mt-4 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl">Restore recovery slot</h2>
      <p className="text-sm leading-6 text-muted">
        {control?.previous
          ? "One complete personal-data snapshot from before the last restore is available. Rollback replaces follows, ratings, tags, category locks, history, resume and review settings together."
          : "A verified restore retains one complete previous personal-data generation here. Native media, folder grants and tool documents are outside the restore scope."}
      </p>
      {control?.previous && !review && (
        <Button
          className="min-h-11 max-w-full whitespace-normal"
          variant="secondary"
          onClick={() => setReview(true)}
        >
          Review restore rollback
        </Button>
      )}
      {review && (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted">
            Rollback discards personal-library changes made since the restore at{" "}
            {control?.at ? new Date(control.at).toLocaleString() : "the saved checkpoint"}. It
            consumes this recovery slot. Export the current library first if you need to keep those
            newer edits. Current private-source boundaries and an enabled privacy PIN remain
            protected.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={busy}
              className="min-h-11 max-w-full whitespace-normal"
              onClick={() => {
                setBusy(true);
                setError("");
                void activateLibraryRestore(true).then(
                  () => location.reload(),
                  (e) => {
                    setError(e instanceof Error ? e.message : "Rollback failed.");
                    setBusy(false);
                  },
                );
              }}
            >
              Confirm rollback and reload
            </Button>
            <Button
              disabled={busy}
              variant="ghost"
              className="min-h-11 max-w-full whitespace-normal"
              onClick={() => setReview(false)}
            >
              Keep current generation
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
