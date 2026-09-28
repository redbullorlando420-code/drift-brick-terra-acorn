/** The provider epoch already includes the starting position; do not add it again. */
export function estimatedProviderPosition(
  lastPosition: number,
  playbackPosition: number,
  startedAt: number | null,
  now: number,
): number {
  const elapsedPosition = startedAt === null ? 0 : Math.max(0, (now - startedAt) / 1000);
  return Math.max(0, lastPosition, playbackPosition, elapsedPosition);
}

/** Keep a seek inside a known VOD; unknown and live streams retain a safety cap. */
export function clampRoomPosition(seconds: number, duration?: number): number {
  const ceiling = typeof duration === "number" && Number.isFinite(duration) && duration > 0
    ? Math.min(duration, 12 * 60 * 60)
    : 12 * 60 * 60;
  return Math.max(0, Math.min(ceiling, Number.isFinite(seconds) ? seconds : 0));
}
