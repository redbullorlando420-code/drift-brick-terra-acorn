export type ProviderClock = { id: string; position: number; state: number; at: number };
/** Buffering is device-local for live streams; only an explicit room pause stops them. */
export function providerPlaybackWanted(playing: boolean, guest: boolean, hostClockRunning: boolean, live: boolean) {
  return playing && (live || !guest || hostClockRunning);
}
/** Read live evidence only from the current iframe's video, never from a stale title. */
export function youtubeLiveInfo(info: unknown, videoId: string): boolean | undefined {
  if (!info || typeof info !== 'object') return;
  const data = (info as { videoData?: { video_id?: unknown; isLive?: unknown } }).videoData;
  if (!data || typeof data !== 'object' || data.video_id !== undefined && data.video_id !== videoId) return;
  return typeof data.isLive === 'boolean' ? data.isLive : undefined;
}
/** Provider observations use a monotonic local clock, independent of wall-clock skew. */
export function providerPosition(sample: ProviderClock | undefined, id: string, now: number) {
  if (!sample || sample.id !== id || !Number.isFinite(sample.position) || sample.position < 0 || now < sample.at || now - sample.at > 3000) return;
  return sample.position + (sample.state === 1 ? (now - sample.at) / 1000 : 0);
}
export function providerNeedsCorrection(actual: number | undefined, target: number, now: number, lastCorrection: number) {
  return actual !== undefined && Number.isFinite(actual) && Math.abs(actual - target) > 1.25 && now - lastCorrection >= 3000;
}
export function roomClockSample(sentWall: number, sentMono: number, receivedMono: number, hostWall: number) {
  const rtt = receivedMono - sentMono;
  if (![sentWall, sentMono, receivedMono, hostWall].every(Number.isFinite) || rtt < 0 || rtt > 2000 || hostWall <= 0) return;
  return { rtt, offset: hostWall - (sentWall + rtt / 2) };
}
export function roomPacketElapsed(sentAt: number, receivedAt: number, offset = 0) {
  return Math.max(0, Math.min(2, (receivedAt + offset - sentAt) / 1000));
}
