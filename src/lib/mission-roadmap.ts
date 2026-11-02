import { NEXT_LEVEL_MISSIONS, NEXT_LEVEL_TRACKS } from "./mission-next-level.ts";
import { NEXT_WAVE_MISSIONS, NEXT_WAVE_TRACKS } from "./mission-next-wave.ts";

/** Append-only roadmap batches. Keep the original batch available for historical exports. */
export const ALL_NEXT_LEVEL_MISSIONS = [...NEXT_LEVEL_MISSIONS, ...NEXT_WAVE_MISSIONS];
export const ALL_NEXT_LEVEL_TRACKS = [...NEXT_LEVEL_TRACKS, ...NEXT_WAVE_TRACKS];
const firstIds = new Set(NEXT_LEVEL_MISSIONS.map((mission) => mission.id));
const newIds = new Set(NEXT_WAVE_MISSIONS.map((mission) => mission.id));
export function missionMatchesBatch(id: string, batch: string): boolean {
  return batch === "first" ? firstIds.has(id) : batch === "new" ? newIds.has(id) : true;
}
