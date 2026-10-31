export const ROOM_CAPTIONS_KEY = "reelcase.watch-room.captions.v1";
export type RoomCaptionPreference = { enabled: boolean; language: string };
export const DEFAULT_ROOM_CAPTIONS: RoomCaptionPreference = { enabled: false, language: "" };
export function captionLanguage(value: unknown): string | undefined {
  if (typeof value !== "string") return;
  const language = value.trim();
  if (!language) return "";
  if (language.length > 35 || !/^[a-z]{2,3}(?:-[a-z0-9]{2,8}){0,4}$/i.test(language)) return;
  return language.toLowerCase();
}
export function readRoomCaptionPreference(raw: unknown): RoomCaptionPreference {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ROOM_CAPTIONS };
  const value = raw as Partial<RoomCaptionPreference>;
  return { enabled: value.enabled === true, language: captionLanguage(value.language) ?? "" };
}
export function loadRoomCaptionPreference(): RoomCaptionPreference {
  try {
    return readRoomCaptionPreference(JSON.parse(localStorage.getItem(ROOM_CAPTIONS_KEY) ?? "null"));
  } catch {
    return { ...DEFAULT_ROOM_CAPTIONS };
  }
}
export type RoomCaptionTrack = { index: number; label: string; language: string; active: boolean };
/** Native media only: provider frames and RTC video do not expose a remote track list. */
export function roomCaptionTracks(tracks: TextTrackList): RoomCaptionTrack[] {
  return Array.from(tracks)
    .flatMap((track, index) =>
      ["captions", "subtitles"].includes(track.kind)
        ? [
            {
              index,
              label: (track.label || track.language || "Track " + (index + 1)).slice(0, 100),
              language: track.language.slice(0, 35),
              active: track.mode === "showing",
            },
          ]
        : [],
    )
    .slice(0, 32);
}
export function applyRoomCaptions(tracks: TextTrackList, preference: RoomCaptionPreference) {
  const available = roomCaptionTracks(tracks);
  const language = preference.language;
  const match =
    available.find((track) => track.language.toLowerCase() === language) ??
    available.find(
      (track) => language && track.language.toLowerCase().split("-")[0] === language.split("-")[0],
    ) ??
    available.find((track) => track.active) ??
    available[0];
  for (const track of available)
    tracks[track.index].mode =
      preference.enabled && match?.index === track.index ? "showing" : "disabled";
}
/** Only documented load preferences. False leaves YouTube's own caption preference alone. */
export function youtubeCaptionParameters(url: URL, preference: RoomCaptionPreference) {
  url.searchParams.delete("cc_load_policy");
  url.searchParams.delete("cc_lang_pref");
  if (preference.enabled) {
    url.searchParams.set("cc_load_policy", "1");
    if (preference.language) url.searchParams.set("cc_lang_pref", preference.language);
  }
  return url;
}
