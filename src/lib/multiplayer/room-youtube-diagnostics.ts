import { roomYoutubeError } from "./room-player-recovery.ts";
export const YOUTUBE_DIAGNOSTIC_TITLES = 12,
  YOUTUBE_DIAGNOSTIC_EVENTS = 6;
export const YOUTUBE_EMBED_PHASES = [
  "loading",
  "ready",
  "playing",
  "blocked",
  "error",
  "timeout",
] as const;
export type YoutubeEmbedPhase = (typeof YOUTUBE_EMBED_PHASES)[number];
export type YoutubeEmbedEvent = { phase: YoutubeEmbedPhase; at: number; code?: number };
export type YoutubeEmbedEvidence = {
  videoId: string;
  loads: number;
  phase: YoutubeEmbedPhase;
  changedAt: number;
  events: YoutubeEmbedEvent[];
};
const validId = (id: unknown): id is string => typeof id === "string" && /^[\w-]{1,128}$/.test(id);
const validTime = (time: unknown): time is number =>
  typeof time === "number" && Number.isFinite(time) && time > 0 && time <= 8.64e15;
const validCode = (code: unknown): code is number =>
  typeof code === "number" && Number.isInteger(code) && Math.abs(code) <= 10000;
export function youtubeEmbedIssue(phase: YoutubeEmbedPhase, code?: number) {
  if (phase === "blocked")
    return {
      kind: "autoplay",
      title: "This device needs a Play tap",
      detail:
        "Your browser blocked autoplay. It needs a tap. Choose Start on this device, or press Play inside the video. The room keeps playing.",
      action: "Use Play inside the video or Start on this device. This affects only your player.",
    };
  if (phase === "timeout")
    return {
      kind: "setup",
      title: "Player connection not confirmed",
      detail:
        "This player did not confirm readiness. A slow connection, blocked player script or embed setup may be involved; no YouTube error code was received.",
      action:
        "Check this device’s connection or content blocker, then retry this player. This does not prove the video was removed or restricted.",
    };
  if (phase !== "error" || !validCode(code)) return;
  const kind =
    code === 2
      ? "link"
      : code === 5
        ? "browser"
        : code === 100
          ? "unavailable"
          : code === 101 || code === 150
            ? "embedding"
            : code === 153
              ? "setup"
              : "unknown";
  const titles = {
    link: "YouTube rejected this link",
    browser: "This browser could not play the video",
    unavailable: "Video unavailable or private",
    embedding: "Embedding disabled by the creator",
    setup: "YouTube could not identify this player",
    unknown: "YouTube player error",
  };
  const actions = {
    link: "Check the public video link or choose a different queued title.",
    browser: "Retry this device’s player. If it still fails, open the video on YouTube.",
    unavailable:
      "Open the official watch page to check access, or let the host choose another title.",
    embedding:
      "Use the official watch page. Reloading cannot change the creator’s embed permission.",
    setup:
      "This can involve the referrer or player identity. Retry here or open YouTube; changing queue permissions will not fix it.",
    unknown: "Retry only this device, or check the official watch page for more information.",
  };
  return { kind, title: titles[kind], detail: roomYoutubeError(code)!, action: actions[kind] };
}
/** Session-only, transition-only evidence. Repeated clock/status events keep the
 * same array and timestamps; loads count explicit player generations only. */
export function recordYoutubeEmbedEvidence(
  rows: readonly YoutubeEmbedEvidence[],
  videoId: string,
  phase: YoutubeEmbedPhase,
  code: unknown,
  at: number,
): YoutubeEmbedEvidence[] {
  if (
    !validId(videoId) ||
    !YOUTUBE_EMBED_PHASES.includes(phase) ||
    !validTime(at) ||
    (phase === "error" && !validCode(code))
  )
    return rows as YoutubeEmbedEvidence[];
  const previous = rows.find((row) => row.videoId === videoId),
    event: YoutubeEmbedEvent = {
      phase,
      at,
      ...(phase === "error" ? { code: code as number } : {}),
    };
  const last = previous?.events.at(-1);
  if (
    previous &&
    phase !== "loading" &&
    ((last?.phase === phase && last.code === event.code) ||
      (["error", "blocked"].includes(previous.phase) && ["ready", "timeout"].includes(phase)))
  )
    return rows as YoutubeEmbedEvidence[];
  if (previous && at < previous.changedAt) return rows as YoutubeEmbedEvidence[];
  const next: YoutubeEmbedEvidence = {
    videoId,
    loads: Math.min(9999, (previous?.loads ?? 0) + (phase === "loading" ? 1 : 0)),
    phase,
    changedAt: at,
    events: [...(previous?.events ?? []), event].slice(-YOUTUBE_DIAGNOSTIC_EVENTS),
  };
  return [...rows.filter((row) => row.videoId !== videoId), next].slice(-YOUTUBE_DIAGNOSTIC_TITLES);
}
/** Rebuild the entire export whitelist; never serialize a room, player message,
 * catalog object, URL with tracking, local path, invitation or provider payload. */
export function exportYoutubeEmbedEvidence(rows: readonly YoutubeEmbedEvidence[], at: number) {
  if (!validTime(at)) throw Error("The diagnostic export clock is invalid.");
  const titles = rows.slice(-YOUTUBE_DIAGNOSTIC_TITLES).flatMap((row) => {
    if (
      !validId(row.videoId) ||
      !YOUTUBE_EMBED_PHASES.includes(row.phase) ||
      !validTime(row.changedAt) ||
      !Array.isArray(row.events)
    )
      return [];
    const events = row.events
      .slice(-YOUTUBE_DIAGNOSTIC_EVENTS)
      .flatMap((event) =>
        !YOUTUBE_EMBED_PHASES.includes(event.phase) ||
        !validTime(event.at) ||
        (event.phase === "error" && !validCode(event.code))
          ? []
          : [
              {
                phase: event.phase,
                at: event.at,
                ...(event.phase === "error" ? { code: event.code } : {}),
              },
            ],
      );
    return [
      {
        videoId: row.videoId,
        watchUrl: "https://www.youtube.com/watch?v=" + row.videoId,
        phase: row.phase,
        changedAt: row.changedAt,
        loads: Number.isFinite(row.loads) ? Math.min(9999, Math.max(0, Math.trunc(row.loads))) : 0,
        events,
      },
    ];
  });
  return JSON.stringify(
    {
      format: "realhub-youtube-player-diagnostics",
      version: 1,
      exportedAt: new Date(at).toISOString(),
      scope:
        "This browser’s current room visit; provider availability and external playback are not verified.",
      titles,
    },
    null,
    2,
  );
}
