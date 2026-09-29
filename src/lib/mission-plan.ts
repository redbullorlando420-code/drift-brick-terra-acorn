export type MissionStatus = "planned" | "in-progress" | "blocked" | "complete";
export type Mission = { id: string; title: string; detail: string; done: boolean; status?: MissionStatus };

export const MISSION_PLAN_REVISION_KEY = "reelcase.mission-plan.revision";
export const MISSION_PLAN_REVISION = 5;

/** Apply newly verified defaults once, without resetting later manual status changes. */
export function mergeMissionPlan(saved: Mission[] | null, defaults: Mission[], previousRevision: number): Mission[] {
  if (!saved) return defaults;
  const defaultsById = new Map(defaults.map((mission) => [mission.id, mission]));
  const savedIds = new Set(saved.map((mission) => mission.id));
  const migrateOriginalCompletions = previousRevision < 2;
  const migrateHydrationCompletion = previousRevision < 3;
  const migrateYoutubeTraceCompletion = previousRevision < 4;
  const migrateYoutubeArtworkCompletion = previousRevision < 5;
  return [
    ...saved.map((item) => {
      const current = defaultsById.get(item.id);
      if (!current) return item;
      const promoted = current.done && (migrateOriginalCompletions
        || (migrateHydrationCompletion && item.id === "recent-saved-library-hydration")
        || (migrateYoutubeTraceCompletion && item.id === "youtube-upgrade-03")
        || (migrateYoutubeArtworkCompletion && item.id === "youtube-upgrade-05"));
      const done = Boolean(item.done || promoted);
      const savedStatus = item.status === "planned" || item.status === "in-progress" || item.status === "blocked"
        ? item.status : undefined;
      return { ...current, ...item, title: current.title, detail: current.detail, done,
        status: done ? "complete" as const : savedStatus ?? current.status ?? "planned" as const };
    }),
    ...defaults.filter((mission) => !savedIds.has(mission.id)),
  ];
}
