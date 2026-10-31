export type MissionStatus = "planned" | "in-progress" | "blocked" | "complete";
export type MissionBrief = { track: string; priority: 'P0'|'P1'|'P2'; dependsOn: string[]; files: string[]; steps: string[]; acceptance: string[]; external?: string };
export type Mission = { id: string; title: string; detail: string; done: boolean; status?: MissionStatus; brief?: MissionBrief };

export const MISSION_PLAN_REVISION_KEY = "reelcase.mission-plan.revision";
export const MISSION_PLAN_REVISION = 77;

export const NEXT_LEVEL_COMPLETED_IDS = ['next-022','next-038','next-024','next-023','next-031','next-032','next-039','next-033','next-027','next-047','next-044','next-028','next-051','next-052','next-053','next-054','next-055','next-056','next-057','next-058','next-059','next-060','next-061','next-062','next-063','next-064','next-065','next-066','next-067','next-068','next-070','next-088','next-089','next-090','next-081','next-083','next-084','next-085','next-095','next-013','next-016','next-021','next-029','next-018','next-030','next-041','next-046','next-043','next-069','next-042','next-048','next-045','next-049','next-050','next-096','next-071','next-072','next-075','next-079','next-037','next-040','next-015','next-019','next-012','next-017','next-025','next-026','next-003','next-005','next-073','next-091','next-076','next-077','next-078','next-080','next-092','next-097','next-082','next-093','next-098','next-001','next-002','next-036','next-086','next-006','next-087'] as const;

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
  const migrateDiagnosticsCompletion = previousRevision < 19;
  const migrateTwitchCheckpointCompletion = previousRevision < 20;
  const migrateTwitchSearchCompletion = previousRevision < 21;
  const migrateProviderBudgetCompletion = previousRevision < 22;
  const migrateYoutubeMetadataCompletion = previousRevision < 23;
  const migrateTwitchQueueCompletion = previousRevision < 24;
  const migrateCreatorOfflineDeviceCompletion = previousRevision < 25;
  return [
    ...saved.map((item) => {
      const current = defaultsById.get(item.id);
      if (!current) return item;
      const promoted = current.done && ((previousRevision < 27 && ['next-022','next-038'].includes(item.id)) || (previousRevision < 28 && item.id === 'next-024') || (previousRevision < 29 && item.id === 'next-023') || (previousRevision < 30 && item.id === 'next-031') || (previousRevision < 31 && item.id === 'next-032') || (previousRevision < 32 && item.id === 'next-039') || (previousRevision < 33 && item.id === 'next-033') || (previousRevision < 34 && item.id === 'next-027') || (previousRevision < 35 && item.id === 'next-047') || (previousRevision < 36 && item.id === 'next-044') || (previousRevision < 37 && item.id === 'next-028') || (previousRevision < 38 && item.id === 'next-051') || (previousRevision < 39 && item.id === 'next-052') || (previousRevision < 40 && item.id === 'next-053') || (previousRevision < 41 && item.id === 'next-054') || (previousRevision < 42 && item.id === 'next-055') || (previousRevision < 43 && item.id === 'next-056') || (previousRevision < 44 && item.id === 'next-057') || (previousRevision < 45 && item.id === 'next-058') || (previousRevision < 46 && item.id === 'next-059') || (previousRevision < 47 && item.id === 'next-060') || (previousRevision < 48 && ['next-061','next-062','next-063'].includes(item.id)) || (previousRevision < 49 && ['next-064','next-065','next-066'].includes(item.id)) || (previousRevision < 50 && ['next-067','next-068','next-070'].includes(item.id)) || (previousRevision < 51 && ['next-088','next-089','next-090'].includes(item.id)) || (previousRevision < 52 && ['next-081','next-083','next-084'].includes(item.id)) || (previousRevision < 53 && ['next-085','next-095'].includes(item.id)) || (previousRevision < 54 && ['next-013','next-016'].includes(item.id)) || (previousRevision < 55 && ['next-021','next-029'].includes(item.id)) || (previousRevision < 56 && ['next-018','next-030'].includes(item.id)) || (previousRevision < 57 && ['next-041','next-046'].includes(item.id)) || (previousRevision < 58 && ['next-043','next-069'].includes(item.id)) || (previousRevision < 59 && ['next-042','next-048'].includes(item.id)) || (previousRevision < 60 && ['next-045','next-049'].includes(item.id)) || (previousRevision < 61 && ['next-050','next-096'].includes(item.id)) || (previousRevision < 62 && ['next-071','next-072'].includes(item.id)) || (previousRevision < 63 && ['next-075','next-079'].includes(item.id)) || (previousRevision < 64 && ['next-037','next-040'].includes(item.id)) || (previousRevision < 65 && ['next-015','next-019'].includes(item.id)) || (previousRevision < 66 && ['next-012','next-017'].includes(item.id)) || (previousRevision < 67 && ['next-025','next-026'].includes(item.id)) || (previousRevision < 68 && ['next-003','next-005'].includes(item.id)) || (previousRevision < 69 && ['next-073','next-091'].includes(item.id)) || (previousRevision < 70 && ['next-076','next-077'].includes(item.id)) || (previousRevision < 71 && ['next-078','next-080'].includes(item.id)) || (previousRevision < 72 && ['next-092','next-097'].includes(item.id)) || (previousRevision < 73 && ['next-082','next-093'].includes(item.id)) || (previousRevision < 74 && item.id === 'next-098') || (previousRevision < 75 && ['next-001','next-002'].includes(item.id)) || (previousRevision < 76 && ['next-036','next-086'].includes(item.id)) || (previousRevision < 77 && ['next-006','next-087'].includes(item.id)) || migrateOriginalCompletions
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
        || (migrateAccessibleBrowsingCompletion && item.id === 'smooth-11')
        || (migrateDiagnosticsCompletion && ['speed-08', 'speed-10', 'smooth-12'].includes(item.id))
        || (migrateTwitchCheckpointCompletion && ['twitch-upgrade-01', 'twitch-upgrade-03', 'twitch-upgrade-09'].includes(item.id))
        || (migrateTwitchSearchCompletion && ['twitch-upgrade-16', 'twitch-upgrade-17', 'twitch-upgrade-20'].includes(item.id))
        || (migrateProviderBudgetCompletion && item.id === 'speed-02')
        || (migrateYoutubeMetadataCompletion && ['youtube-upgrade-07', 'youtube-upgrade-08', 'youtube-upgrade-20'].includes(item.id))
        || (migrateTwitchQueueCompletion && ['twitch-upgrade-02', 'twitch-upgrade-08', 'twitch-upgrade-10', 'twitch-upgrade-18'].includes(item.id))
        || (migrateCreatorOfflineDeviceCompletion && ['youtube-upgrade-06', 'youtube-upgrade-17', 'youtube-upgrade-18', 'twitch-upgrade-19'].includes(item.id)));
      const done = Boolean(item.done || promoted);
      const savedStatus = item.status === "planned" || item.status === "in-progress" || item.status === "blocked"
        ? item.status : undefined;
      const startedTimerAudit = previousRevision < 8 && item.id === "smooth-09" && savedStatus !== "blocked";
      const startedEnrichmentAudit = previousRevision < 11 && item.id === 'speed-06' && savedStatus !== 'blocked';
      return { ...current, ...item, title: current.title, detail: current.detail, ...(current.brief ? {brief:current.brief} : {}), done,
        status: done ? "complete" as const : startedTimerAudit || startedEnrichmentAudit ? "in-progress" as const : savedStatus ?? current.status ?? "planned" as const };
    }),
    ...defaults.filter((mission) => !savedIds.has(mission.id)),
  ];
}
