import { useState } from "react";
import { ExternalLink, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HubShell } from './hub-shared';

export function SpotifySection() {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("reelcase.spotify.playlist") ?? "";
    } catch {
      return "";
    }
  });
  const [playlistUrl, setPlaylistUrl] = useState(saved);
  const [imports, setImports] = useState<string[]>(() => { try { const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]"); return Array.isArray(savedImports) ? savedImports.filter((item): item is string => typeof item === "string") : []; } catch { return []; } });
  const importSpotifyLink = () => {
    const value = playlistUrl.trim();
    if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
    const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
    setImports(next);
    setSaved(value);
    localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
    localStorage.setItem("reelcase.spotify.playlist", value);
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
            onChange={(event) => setPlaylistUrl(event.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            aria-label="Spotify playlist link"
          />
          <Button
            disabled={!playlistUrl.includes("spotify.com")}
            onClick={importSpotifyLink}
          >
            Import link
          </Button>
        </div>
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
      {imports.length > 0 && <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><p className="text-sm font-medium text-fg">Imported Spotify shortcuts</p><p className="mt-1 text-xs text-muted">Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify.</p><div className="mt-3 flex flex-wrap gap-2">{imports.slice(0, 12).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border">{url.replace("https://open.spotify.com/", "Spotify · ")}</a>)}</div></div>}
    </HubShell>
  );
}
