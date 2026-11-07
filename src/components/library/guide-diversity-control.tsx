import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { guideDiversitySession } from "@/lib/guide-diversity-session";
import { DEFAULT_GUIDE_DIVERSITY, type DiversityResult } from "@/lib/videos/guide-diversity";
export const useGuideDiversity = () =>
  useSyncExternalStore(
    guideDiversitySession.subscribe,
    guideDiversitySession.getSnapshot,
    () => DEFAULT_GUIDE_DIVERSITY,
  );
export function GuideDiversityControl() {
  const active = useGuideDiversity(),
    [draft, setDraft] = useState(active),
    [note, setNote] = useState("");
  useEffect(() => setDraft(active), [active]);
  return (
    <details
      data-guide-diversity-control
      className="mt-4 rounded-lg border border-border bg-elevated/40 p-4"
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        Optional shelf diversity
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Temporary floors for public Guide picks and questions. Defaults preserve standard ranking.
        These choices stay in this tab while navigating; reload or Reset clears them. Desk
        preferences and other provider shelves are unchanged.
      </p>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          guideDiversitySession.apply(draft);
          setNote("Diversity choices applied. The next prepared output reports the actual result.");
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-fg">
            Maximum identified creator share
            <select
              aria-label="Maximum Guide creator share"
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg"
              value={draft.creatorPercent}
              onChange={(e) =>
                setDraft({ ...draft, creatorPercent: Number(e.target.value) as 100 | 75 | 50 })
              }
            >
              {[100, 75, 50].map((n) => (
                <option key={n} value={n}>
                  {n === 100 ? "No creator cap" : n + "% of output"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-fg">
            Minimum public sources
            <select
              aria-label="Minimum Guide sources"
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg"
              value={draft.minSources}
              onChange={(e) =>
                setDraft({ ...draft, minSources: Number(e.target.value) as 1 | 2 | 3 })
              }
            >
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "No additional source floor" : n + " available sources"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-fg">
            Publication age floor
            <select
              aria-label="Guide older publication floor"
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-fg"
              value={draft.olderSlots}
              onChange={(e) => setDraft({ ...draft, olderSlots: Number(e.target.value) as 0 | 2 })}
            >
              <option value={0}>No publication age floor</option>
              <option value={2}>Two recordings at least 365 days old</option>
            </select>
          </label>
        </div>
        <p className="text-xs leading-5 text-muted">
          Eligibility, your query and source/length filters apply first. Active diversity mixes
          exclude explicit “less of this” rank reductions, retain balanced-source slot quotas, and
          may trade score for variety. Missing creator credits and publication dates stay unknown.
          At most 64 creator groups supply alternatives; failure to meet a floor does not prove it
          is impossible in the full library.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="min-h-11">
            Apply diversity floors
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            onClick={() => {
              guideDiversitySession.reset();
              setDraft(DEFAULT_GUIDE_DIVERSITY);
              setNote("Diversity floors reset. Standard ranking is active.");
            }}
          >
            Reset diversity floors
          </Button>
        </div>
        {JSON.stringify(draft) !== JSON.stringify(active) && (
          <p role="status" className="text-xs text-accent">
            Unapplied diversity changes. Current cards keep their applied choices.
          </p>
        )}
        <p data-diversity-active className="text-xs text-muted">
          Applied: creator {active.creatorPercent}% · {active.minSources} source(s) ·{" "}
          {active.olderSlots} older recording(s).
        </p>
        <p role="status" className="text-xs text-muted">
          {note}
        </p>
      </form>
    </details>
  );
}
export function GuideDiversitySummary({ report }: { report?: DiversityResult }) {
  return report ? (
    <section
      data-guide-diversity-result
      className="mt-4 space-y-2 rounded-lg border border-border bg-surface p-3"
      aria-label="Applied diversity result"
    >
      <p className="text-sm font-medium text-fg">
        {report.met ? "Diversity floors met" : "Diversity floors limited or unverified"} ·{" "}
        {report.shown} shown
      </p>
      <p className="text-xs leading-5 text-muted">
        Creator limit {report.creatorCap} per identified creator ({report.config.creatorPercent}%) ·{" "}
        {report.sources}/{report.config.minSources} sources · {report.older}/
        {report.config.olderSlots} older recordings. {report.unknownCreators} output slots lack
        creator credits.
      </p>
      <p className="text-xs leading-5 text-muted">
        Publication evidence: available older {report.availableAge.older}, recent{" "}
        {report.availableAge.recent}, unknown {report.availableAge.unknown}; selected older{" "}
        {report.selectedAge.older}, recent {report.selectedAge.recent}, unknown{" "}
        {report.selectedAge.unknown}. Older means at least 365 days before this snapshot.{" "}
        {report.pooled} retained alternative rows; no full-library feasibility claim.
      </p>
      {report.notices.map((text) => (
        <p key={text} className="text-xs leading-5 text-muted">
          {text}
        </p>
      ))}
    </section>
  ) : null;
}
