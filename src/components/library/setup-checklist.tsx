import { useEffect, useState } from "react";
import { ChevronDown, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import type { SourceId } from "@/lib/videos/types";
import {
  SETUP_KEY,
  emptySetup,
  parseSetup,
  setupReadiness,
  type SetupChoices,
  type SetupStep,
} from "@/lib/setup-readiness";
import { browserConsent } from "@/lib/capability-consent";
export function SetupChecklist({
  settings = false,
  onAddFolder,
}: {
  settings?: boolean;
  onAddFolder?: () => void;
}) {
  const videos = useLibrary((s) => s.videos.length),
    sources = useLibrary((s) => s.folders.length + s.follows.length),
    hydrated = useLibrary((s) => s.hydrated),
    go = useLibrary((s) => s.setSource);
  const [choices, setChoices] = useState(emptySetup),
    [loaded, setLoaded] = useState(false),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [companion, setCompanion] = useState<null | { compatible: boolean; roots: number }>(null);
  useEffect(() => {
    browserConsent.load();
    try {
      setChoices(parseSetup(localStorage.getItem(SETUP_KEY)));
    } catch {
      setError("Setup choices could not be read; library data is unchanged.");
    }
    setLoaded(true);
    const sync = (event: StorageEvent) => {
      if (event.key === SETUP_KEY || event.key === null)
        try {
          setChoices(parseSetup(localStorage.getItem(SETUP_KEY)));
        } catch {
          /* Current visit remains usable. */
        }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const save = (next: SetupChoices) => {
    try {
      localStorage.setItem(SETUP_KEY, JSON.stringify(next));
      setChoices(next);
      setError("");
    } catch {
      setError(
        "Setup choices could not be saved. Nothing was removed; retry when storage is available.",
      );
    }
  };
  const returning = videos > 0 || sources > 0,
    expanded = open || (!settings && loaded && hydrated && !returning && !choices.dismissed);
  const rows = setupReadiness({
    hydrated,
    videos,
    sources,
    permissionReviewed:
      choices.reviewed.includes("permissions") || browserConsent.snapshot().revision > 0,
    companion,
  });
  const review = (id: SetupStep) =>
    save({
      ...choices,
      reviewed: choices.reviewed.includes(id)
        ? choices.reviewed.filter((x) => x !== id)
        : [...choices.reviewed, id],
    });
  return (
    <section
      aria-label="Your setup checklist"
      className="my-6 rounded-xl border border-border bg-surface p-4 sm:p-5"
      data-setup-ready={hydrated && loaded}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-fg">Your setup</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            {returning
              ? "Your saved library is ready to explore. Setup stays optional."
              : "Start with local files or saved sources. Companion and AI are optional."}
          </p>
        </div>
        <Button
          variant="secondary"
          className="min-h-11"
          aria-expanded={expanded}
          onClick={() => {
            if (expanded) {
              setOpen(false);
              save({ ...choices, dismissed: true });
            } else {
              setOpen(true);
              save({ ...choices, dismissed: false });
            }
          }}
        >
          {expanded ? "Dismiss checklist" : "Resume setup"}
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {expanded && (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-5 text-muted">
            These checks use saved metadata. Playback and external accounts are not verified by a
            saved source or permission. Reviewing or dismissing a step starts no work.
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {rows.map((row) => (
              <div key={row.id} className="rounded-lg border border-border bg-bg p-4">
                <div className="flex items-start gap-2">
                  {row.ready && (
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-fg">
                      {
                        {
                          library: "Library",
                          sources: "Saved sources",
                          permissions: "Optional permissions",
                          companion: "Local Companion",
                        }[row.id]
                      }
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{row.status}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    className="min-h-11"
                    variant="secondary"
                    onClick={() => {
                      if (row.id === "library" && !videos && onAddFolder) {
                        onAddFolder();
                        return;
                      }
                      go(row.target as SourceId);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                  >
                    {row.id === "library" && !videos && !onAddFolder ? "Open library" : row.action}
                    <ArrowRight className="size-4" />
                  </Button>
                  {row.id === "companion" && (
                    <Button
                      variant="secondary"
                      className="min-h-11"
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        void import("@/lib/companion")
                          .then(async ({ companionHealth }) => {
                            const health = await companionHealth(true);
                            setCompanion({
                              compatible: !!health?.negotiation?.compatible,
                              roots: health?.rootAccess?.active ?? health?.roots ?? 0,
                            });
                          })
                          .catch(() => setCompanion({ compatible: false, roots: 0 }))
                          .finally(() => setBusy(false));
                      }}
                    >
                      {busy ? "Checking…" : "Check local Companion"}
                    </Button>
                  )}
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={choices.reviewed.includes(row.id)}
                      onChange={() => review(row.id)}
                      className="size-4 accent-accent"
                    />
                    I reviewed this option
                  </label>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs leading-5 text-muted">
            Use Realhub with browser-local files and bookmarks while Companion is offline. Folder
            picking, provider imports and model downloads start only from their own explicit
            controls.
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-3 text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
