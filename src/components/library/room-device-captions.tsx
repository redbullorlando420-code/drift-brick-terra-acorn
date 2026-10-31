import { memo, useEffect, useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ROOM_CAPTIONS_KEY,
  loadRoomCaptionPreference,
  captionLanguage,
  applyRoomCaptions,
  roomCaptionTracks,
  type RoomCaptionTrack,
} from "@/lib/multiplayer/room-device-captions";

/** Deliberately has no room transport or shared playback callbacks. */
export const RoomDeviceCaptions = memo(function RoomDeviceCaptions({
  provider,
  mediaRef,
  scope,
  onReload,
}: {
  provider: "youtube" | "twitch" | "clip" | "local" | "stream";
  mediaRef?: RefObject<HTMLVideoElement | null>;
  scope: string;
  onReload?: () => void;
}) {
  const [saved, setSaved] = useState(loadRoomCaptionPreference);
  const [enabled, setEnabled] = useState(saved.enabled);
  const [language, setLanguage] = useState(saved.language);
  const [tracks, setTracks] = useState<RoomCaptionTrack[]>([]);
  const [notice, setNotice] = useState("");
  const preference = useRef(saved);
  preference.current = saved;
  useEffect(() => {
    const media = mediaRef?.current;
    if (!media) {
      setTracks([]);
      return;
    }
    let fingerprint = "";
    const inventory = () => {
      const rows = roomCaptionTracks(media.textTracks),
        next = JSON.stringify(rows);
      if (fingerprint !== next) {
        fingerprint = next;
        setTracks(rows);
      }
    };
    const apply = () => {
      applyRoomCaptions(media.textTracks, preference.current);
      inventory();
    };
    apply();
    media.addEventListener("loadedmetadata", apply);
    media.textTracks.addEventListener("addtrack", apply);
    media.textTracks.addEventListener("removetrack", inventory);
    media.textTracks.addEventListener("change", inventory);
    return () => {
      media.removeEventListener("loadedmetadata", apply);
      media.textTracks.removeEventListener("addtrack", apply);
      media.textTracks.removeEventListener("removetrack", inventory);
      media.textTracks.removeEventListener("change", inventory);
    };
  }, [scope, mediaRef]);
  const save = () => {
    const normalized = captionLanguage(language);
    if (normalized === undefined) {
      setNotice("Use a language code such as en, es or pt-BR, or leave it blank for automatic.");
      return;
    }
    const next = { enabled, language: normalized };
    preference.current = next;
    setSaved(next);
    setLanguage(normalized);
    if (mediaRef?.current) {
      applyRoomCaptions(mediaRef.current.textTracks, next);
      setTracks(roomCaptionTracks(mediaRef.current.textTracks));
    }
    try {
      const value = JSON.stringify(next);
      if (localStorage.getItem(ROOM_CAPTIONS_KEY) !== value)
        localStorage.setItem(ROOM_CAPTIONS_KEY, value);
      setNotice(
        provider === "youtube"
          ? "Saved on this device. Use CC now, or reload with saved captions when ready."
          : "Saved on this device. Other viewers keep their own caption settings.",
      );
    } catch {
      setNotice("Applied for this session. Browser storage could not save the preference.");
    }
  };
  const native = provider === "local" || provider === "stream";
  return (
    <details
      aria-label="Captions on this device"
      className="mt-3 rounded-md border border-border bg-bg/45 p-3"
    >
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
        Captions · this device
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted">
        Caption and language choices stay on this browser. They never change the host’s playback or
        other viewers.
      </p>
      {provider === "youtube" ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          Use CC and Settings → Subtitles inside YouTube for immediate changes and available
          languages. YouTube does not expose its track inventory here. Saved preferences request
          captions on the next player load; availability and your YouTube settings decide the
          result.
        </p>
      ) : provider === "twitch" || provider === "clip" ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          Use the Twitch player’s CC menu when the broadcaster supplies captions. This embed does
          not expose caption selection or language controls to Realhub. Saved preferences apply to
          local videos and YouTube; Twitch keeps its own settings.
        </p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-muted">
          {tracks.length
            ? tracks.length + " subtitle/caption tracks available on this device."
            : provider === "stream"
              ? "The host’s streamed video does not carry separate subtitle tracks. Use a matching local copy with subtitles if available; captions burned into the picture remain visible."
              : "No subtitle or caption tracks are available in this video. Realhub does not generate or download missing subtitles."}
        </p>
      )}
      {native && tracks.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted" aria-label="Available caption tracks">
          {tracks.map((track) => (
            <li key={track.index}>
              {track.label}
              {track.language ? " · " + track.language : ""}
              {track.active ? " · showing" : ""}
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-3 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <label className="flex min-h-11 items-center gap-2 text-xs text-fg">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Prefer captions when available
        </label>
        <label className="block text-xs text-muted">
          Preferred caption language
          <Input
            className="mt-1 min-h-11"
            aria-label="Preferred caption language"
            maxLength={35}
            placeholder="Automatic, or en / es / pt-BR"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" variant="secondary" className="min-h-11">
            Save caption preference
          </Button>
          {provider === "youtube" && onReload && (
            <Button type="button" size="sm" variant="ghost" className="min-h-11" onClick={onReload}>
              Reload with saved captions
            </Button>
          )}
        </div>
      </form>
      {native && tracks.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          A matching language is preferred; otherwise an available track is used. Turn the
          preference off and save to hide native captions.
        </p>
      )}
      {provider === "youtube" && (
        <p className="mt-2 text-xs text-muted">
          Turning the preference off restores YouTube’s default on reload; use its CC button to hide
          captions immediately. Reloading affects this device only.
        </p>
      )}
      {notice && (
        <p role="status" className="mt-2 text-xs leading-5 text-accent">
          {notice}
        </p>
      )}
    </details>
  );
});
