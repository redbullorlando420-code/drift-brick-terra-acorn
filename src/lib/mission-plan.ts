export type MissionStatus = "planned" | "in-progress" | "blocked" | "complete";
export type Mission = { id: string; title: string; detail: string; done: boolean; status?: MissionStatus };

export const MISSION_PLAN_REVISION_KEY = "reelcase.mission-plan.revision";
export const MISSION_PLAN_REVISION = 18;

/** Apply newly verified defaults once, without resetting later manual status changes. */
export function mergeMissionPlan(saved: Mission[] | null, defaults: Mission[], previousRevision: number): Mission[] {
  if (!saved) return defaults;
  const defaultsById = new Map(defaults.map((mission) => [mission.id, mission]));
  const savedIds = new Set(saved.map((mission) => mission.id));
  const migrateOriginalCompletions = previousRevision < 2;
  const migrateHydrationCompletion = previousRevision < 3;
  const migrateYoutubeTraceCompletion = previousRevision < 4;
  const migrateYoutubeArtworkCompletion = previousRevision < 5;
  const migrateViewerDetailsCompletion = previousRevision < 6;
  const migrateSearchBudgetCompletion = previousRevision < 7;
  const migrateTimerCompletion = previousRevision < 9;
  const migrateNavigationCompletion = previousRevision < 10;
  const migrateEnrichmentCompletion = previousRevision < 12;
  const migrateVirtualizationCompletion = previousRevision < 13;
  const migrateStartupCompletion = previousRevision < 14;
  const migrateSlowDeviceCompletion = previousRevision < 15;
  const migrateRenderAuditCompletion = previousRevision < 16;
  const migrateMobileBudgetCompletion = previousRevision < 17;
  const migrateAccessibleBrowsingCompletion = previousRevision < 18;
  return [
    ...saved.map((item) => {
      const current = defaultsById.get(item.id);
      if (!current) return item;
      const promoted = current.done && (migrateOriginalCompletions
        || (migrateHydrationCompletion && item.id === "recent-saved-library-hydration")
        || (migrateYoutubeTraceCompletion && item.id === "youtube-upgrade-03")
        || (migrateYoutubeArtworkCompletion && item.id === "youtube-upgrade-05")
        || (migrateViewerDetailsCompletion && (item.id === "viewer-detail-isolation" || item.id === "viewer-detail-memory-budget"))
        || (migrateSearchBudgetCompletion && item.id === "recent-search-result-budget")
        || (migrateTimerCompletion && item.id === 'smooth-09')
        || (migrateNavigationCompletion && item.id === 'smooth-01')
        || (migrateEnrichmentCompletion && item.id === 'speed-06')
        || (migrateVirtualizationCompletion && item.id === 'smooth-02')
        || (migrateStartupCompletion && (item.id === 'speed-01' || item.id === 'recent-cold-home-readiness'))
        || (migrateSlowDeviceCompletion && item.id === 'smooth-10')
        || (migrateRenderAuditCompletion && item.id === 'speed-03')
        || (migrateMobileBudgetCompletion && item.id === 'speed-09')
        || (migrateAccessibleBrowsingCompletion && item.id === 'smooth-11'));
      const done = Boolean(item.done || promoted);
      const savedStatus = item.status === "planned" || item.status === "in-progress" || item.status === "blocked"
        ? item.status : undefined;
      const startedTimerAudit = previousRevision < 8 && item.id === "smooth-09" && savedStatus !== "blocked";
      const startedEnrichmentAudit = previousRevision < 11 && item.id === 'speed-06' && savedStatus !== 'blocked';
      return { ...current, ...item, title: current.title, detail: current.detail, done,
        status: done ? "complete" as const : startedTimerAudit || startedEnrichmentAudit ? "in-progress" as const : savedStatus ?? current.status ?? "planned" as const };
    }),
    ...defaults.filter((mission) => !savedIds.has(mission.id)),
  ];
}
