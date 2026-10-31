import { useState } from "react";
import { ExternalLink, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HubShell } from "./hub-shared";
import {
  readSpotifyShortcuts,
  spotifyShortcut,
  SPOTIFY_SHORTCUTS_KEY,
  type SpotifyShortcuts,
} from "@/lib/workspace-shortcuts";

export function SpotifySection() {
  const [shortcuts, setShortcuts] = useState<SpotifyShortcuts>(() => {
    try {
      const parse = (key: string) => {
        try {
          return JSON.parse(localStorage.getItem(key) ?? "null");
        } catch {
          return null;
        }
      };
      return readSpotifyShortcuts(
        parse(SPOTIFY_SHORTCUTS_KEY),
        parse("reelcase.spotify.imports.v1"),
        localStorage.getItem("reelcase.spotify.playlist"),
      );
    } catch {
      return { version: 2, selected: "", imports: [] };
    }
  });
  const { selected: saved, imports } = shortcuts;
  const [playlistUrl, setPlaylistUrl] = useState(saved);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const importSpotifyLink = () => {
    const value = spotifyShortcut(playlistUrl);
    setNotice("");
    if (!value) {
      setError("Enter a valid Spotify playlist, album, or artist link from open.spotify.com.");
      return;
    }
    const next: SpotifyShortcuts = {
      version: 2,
      selected: value,
      imports: [value, ...imports.filter((item) => item !== value)].slice(0, 50),
    };
    // One record keeps selection and shortcuts together if quota is exhausted.
    try {
      localStorage.setItem(SPOTIFY_SHORTCUTS_KEY, JSON.stringify(next));
      setShortcuts(next);
      setPlaylistUrl(value);
      setError("");
      setNotice("Spotify shortcut saved on this device.");
    } catch {
      setError(
        "Could not save Spotify shortcuts. Your previous shortcuts are safe. Free browser storage and try Import link again.",
      );
    }
  };
  return (
    <HubShell
      eyebrow="Music companion"
      icon={<Music2 className="size-4" />}
      title="Spotify, beside your library."
      copy="Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session."
    >
      <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-sm font-medium text-fg">Open Spotify</p>
        <p className="mt-1 text-sm text-muted">
          Account sign-in and playback remain on Spotify’s official site or app. Realhub does not
          collect your Spotify password or tokens.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://open.spotify.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Open Spotify <ExternalLink className="ml-2 size-4" />
          </a>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-sm font-medium text-fg">Save a playlist shortcut</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={playlistUrl}
            onChange={(event) => {
              setPlaylistUrl(event.target.value);
              setError("");
              setNotice("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) importSpotifyLink();
            }}
            placeholder="https://open.spotify.com/playlist/..."
            aria-label="Spotify playlist link"
          />
          <Button disabled={!playlistUrl.trim()} onClick={importSpotifyLink}>
            Import link
          </Button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-3 text-sm text-accent">
            {notice}
          </p>
        )}
        {saved && (
          <a
            className="mt-3 inline-flex text-sm text-accent hover:text-fg"
            href={saved}
            target="_blank"
            rel="noreferrer"
          >
            Open saved playlist <ExternalLink className="ml-1 size-4" />
          </a>
        )}
      </div>
      {imports.length > 0 && (
        <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border">
          <p className="text-sm font-medium text-fg">Imported Spotify shortcuts</p>
          <p className="mt-1 text-xs text-muted">
            Playlist, album, and artist links are stored locally for quick return. Spotify account
            data remains in Spotify.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {imports.slice(0, 12).map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border"
              >
                {url.replace("https://open.spotify.com/", "Spotify · ")}
              </a>
            ))}
          </div>
        </div>
      )}
    </HubShell>
  );
}
