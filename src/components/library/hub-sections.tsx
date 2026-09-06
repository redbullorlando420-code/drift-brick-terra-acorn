import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Box,
  Clapperboard,
  Copy,
  Download,
  ExternalLink,
  Gamepad2,
  Images,
  ImagePlus,
  MessageCircle,
  Music2,
  MonitorPlay,
  PackageSearch,
  Pause,
  Play,
  Radio,
  Rocket,
  Search,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lightbulb,
  ShoppingBag,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { useSourceAssets } from "@/lib/source-assets";
import { useP2PRoom } from "@/lib/multiplayer";
import type { LibraryVideo } from "@/lib/videos/types";

type LocalItem = {
  name: string;
  path: string;
  size: number;
  addedAt: number;
  launchUrl?: string;
  iconData?: string;
};
type HubStore = { prints: LocalItem[]; games: LocalItem[] };
const HUB_KEY = "reelcase.hub.v1";
const PREFERENCE_GROUPS = {
  Alerts: [
    "Go-live alerts",
    "New Twitch VOD alerts",
    "New YouTube upload alerts",
    "Source change alerts",
    "Watch-room invitation alerts",
  ],
  Playback: [
    "Autoplay next video",
    "Resume playback",
    "Skip intros",
    "Skip credits",
    "Remember volume",
    "Default playback speed",
    "Prefer captions",
    "Caption styling",
    "Prefer dubbed audio",
    "Picture in picture",
    "Theater mode",
    "Dim room lights",
    "Hardware decode",
    "Data saver",
    "High quality on Wi-Fi",
    "Play trailers muted",
    "Ask before autoplay",
    "Loop short videos",
    "Show chapter markers",
    "Keep player controls visible",
  ],
  Library: [
    "Show hidden files",
    "Group by folder",
    "Remember folder view",
    "Compact list view",
    "Show file paths",
    "Show file size",
    "Show media details",
    "Index new folders",
    "Hide duplicate titles",
    "Prefer poster artwork",
    "Show unwatched badge",
    "Show progress bar",
    "Show date added",
    "Show runtime",
    "Open preview before play",
    "Keep last search",
    "Search tags",
    "Search notes",
    "Search exact titles",
    "Clear recent searches",
  ],
  Discovery: [
    "Local recommendations",
    "Use favorites for picks",
    "Use watch history for picks",
    "Use tags for picks",
    "Surface short films",
    "Surface live channels",
    "Show channel uploads",
    "Show random pick",
    "Refresh public channels",
    "Include open-source films",
    "Prefer familiar genres",
    "Try new genres",
    "Show trending shelf",
    "Show recently added",
    "Show because-you-watched",
    "Show top picks",
    "Show trailers",
    "Show creator details",
    "Show similar titles",
    "Hide already watched",
  ],
  WatchRoom: [
    "Watch-room notices",
    "Room clock correction",
    "Send periodic timeline ticks",
    "Require guest consent",
    "Show guest ping",
    "Show connection quality",
    "Keep chat history",
    "Allow queue edits",
    "Auto play next queue item",
    "Default compact stage",
    "Remember stage size",
    "Share playback speed",
    "Pause when host leaves",
    "Show ready check",
    "Copy room code on create",
    "Allow reaction messages",
    "Show queue duration",
    "Show room activity",
    "Mute room notifications",
    "Show Roku handoff",
  ],
  Privacy: [
    "Reduce motion",
    "Hide demo media",
    "Private search history",
    "Clear history on exit",
    "Lock adult library on exit",
    "Hide private titles from picks",
    "Keep notes local",
    "Keep tags local",
    "Ask before external links",
    "Ask before file sharing",
    "Do not preload remote media",
    "Mask local file paths",
    "Hide viewing activity",
    "Do not use watch history",
    "Do not use likes",
    "Do not use ratings",
    "Export metadata only",
    "Remember device permissions",
    "Show privacy reminders",
    "Reset local preferences",
  ],
} as const;
const PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) =>
  labels.map((label) => ({
    key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
    group,
    label,
    detail: `${group} preference saved locally.`,
  })),
);

function readHub(): HubStore {
  const samples: LocalItem[] = [
    {
      name: "Calibration cube.stl",
      path: "Reelcase samples/Calibration cube.stl",
      size: 182400,
      addedAt: 1,
    },
    { name: "Cable clip.3mf", path: "Reelcase samples/Cable clip.3mf", size: 94100, addedAt: 2 },
    {
      name: "OpenSCAD phone stand.stl",
      path: "Open-source examples/OpenSCAD phone stand.stl",
      size: 512400,
      addedAt: 4,
    },
    {
      name: "Gridfinity bin.3mf",
      path: "Open-source examples/Gridfinity bin.3mf",
      size: 784200,
      addedAt: 5,
    },
    {
      name: "Benchy calibration.stl",
      path: "Open-source examples/Benchy calibration.stl",
      size: 643100,
      addedAt: 6,
    },
    {
      name: "Parametric drawer label.stl",
      path: "Open-source examples/Parametric drawer label.stl",
      size: 229100,
      addedAt: 7,
    },
    {
      name: "Tool tray.gcode",
      path: "Reelcase samples/Tool tray.gcode",
      size: 1248000,
      addedAt: 3,
    },
  ];
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) return { prints: samples, games: [] };
    return JSON.parse(raw) as HubStore;
  } catch {
    return { prints: samples, games: [] };
  }
}
function writeHub(next: HubStore) {
  localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files: FileList, gamesOnly = false): LocalItem[] {
  return [...files]
    .filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name))
    .filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name))
    .map((file) => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      addedAt: Date.now(),
    }));
}
function bytes(value: number) {
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function SettingsSection() {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferenceGroup, setPreferenceGroup] =
    useState<keyof typeof PREFERENCE_GROUPS>("Playback");
  const [zoom, setZoom] = useState(100);
  const [railLimit, setRailLimit] = useState(24);
  const [liveDensity, setLiveDensity] = useState(4);
  const [sourceCacheFirst, setSourceCacheFirst] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [theme, setTheme] = useState<"night" | "day">("night");
  const [debugReport, setDebugReport] = useState("");
  useEffect(() => setHub(readHub()), []);
  useEffect(() => {
    try {
      setPreferences(
        JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}") as Record<string, boolean>,
      );
    } catch {
      setPreferences({});
    }
  }, []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("reelcase.ui-zoom") ?? "100");
    const value = [80, 90, 100, 110, 125].includes(saved) ? saved : 100;
    setZoom(value);
    document.documentElement.style.fontSize = `${value}%`;
  }, []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "24");
    setRailLimit([12, 24, 48].includes(saved) ? saved : 24);
  }, []);
  useEffect(
    () => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"),
    [],
  );
  useEffect(() => { try { setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true"); } catch { /* unavailable */ } }, []);
  useEffect(() => { try { const saved = localStorage.getItem("reelcase.theme") === "day" ? "day" : "night"; setTheme(saved); document.documentElement.dataset.theme = saved; } catch { /* unavailable */ } }, []);
  useEffect(() => setLiveDensity([3, 4, 6].includes(Number(localStorage.getItem("reelcase.live-columns") ?? "4")) ? Number(localStorage.getItem("reelcase.live-columns")) : 4), []);
  const setGlobalZoom = (value: number) => {
    setZoom(value);
    localStorage.setItem("reelcase.ui-zoom", String(value));
    document.documentElement.style.fontSize = `${value}%`;
  };
  const setColorTheme = (value: "night" | "day") => {
    setTheme(value);
    localStorage.setItem("reelcase.theme", value);
    document.documentElement.dataset.theme = value;
  };
  const togglePreference = (key: string) => {
    const enabled = !preferences[key];
    const next = { ...preferences, [key]: enabled };
    setPreferences(next);
    localStorage.setItem("reelcase.settings.v1", JSON.stringify(next));
    if (key === "privacy-reduce-motion")
      document.documentElement.toggleAttribute("data-reduce-motion", enabled);
    if (key === "privacy-hide-demo-media") useLibrary.getState().setHideDemo(enabled);
  };
  const exportLocal = () => {
    const state = useLibrary.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Reelcase library metadata only. Original local files and browser permission handles are never exported.",
      library: {
        folders: state.folders,
        videos: state.videos,
        favorites: Object.keys(state.favorites),
        likes: Object.keys(state.likes),
        tags: state.tags,
        categories: state.categories,
        progress: state.progress,
        history: state.history,
        follows: state.follows,
        notices: state.notices,
        sourceCompanions: {
          photoNames: useSourceAssets.getState().photos.map((asset) => asset.path),
          shortcutNames: useSourceAssets.getState().shortcuts.map((file) => file.name),
        },
      },
      hub,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `reelcase-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <HubShell
      eyebrow="Library control"
      icon={<Settings2 className="size-4" />}
      title="Settings & local export"
      copy="Your Reelcase library stays in this browser. Export a portable metadata backup whenever you need it."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Video entries" value={useLibrary((s) => s.videos.length)} />
        <Stat label="Followed channels" value={useLibrary((s) => s.follows.length)} />
        <Stat label="Saved hub items" value={hub.prints.length + hub.games.length} />
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-fg">Export local metadata</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Downloads your catalog, favorites, likes, tags, watch history, follows, notifications,
            print list, and game list. Your original media and any browser file permissions remain
            private on this device.
          </p>
        </div>
        <Button onClick={exportLocal}>
          <Download className="size-4" /> Export JSON
        </Button>
      </div>
      <section className="mt-6"><div className="mb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Device & performance</p><p className="mt-1 text-sm text-muted">The controls that change how Reelcase runs and fits your screen.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Settings2 className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Diagnostics</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away.</p>
          <ol className="mt-3 space-y-1 text-xs leading-5 text-muted"><li><span className="text-accent">1.</span> Start the Reelcase Companion from its desktop setup.</li><li><span className="text-accent">2.</span> Select Check companion to confirm the Desktop root.</li><li><span className="text-accent">3.</span> Open Games and choose Load approved desktop shortcuts.</li></ol>
          <Button size="sm" variant={debugEnabled ? "default" : "secondary"} className="mt-4" onClick={() => { const next = !debugEnabled; setDebugEnabled(next); localStorage.setItem("reelcase.debug-panel", String(next)); if (!next) setDebugReport(""); }}>
            {debugEnabled ? "Disable diagnostics" : "Enable diagnostics"}
          </Button>
          {debugEnabled && <div className="mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted"><p>{useLibrary.getState().videos.length} catalog entries · {useLibrary.getState().folders.length} sources · {navigator.onLine ? "browser online" : "browser offline"}</p><p>{useLibrary.getState().folders.filter((folder) => folder.health === "healthy").length} healthy · {useLibrary.getState().folders.filter((folder) => folder.health === "cached").length} cache-first · {useLibrary.getState().folders.filter((folder) => folder.health === "permission-needed" || folder.health === "unavailable").length} need attention</p><Button size="sm" variant="ghost" className="mt-2" onClick={() => void (async () => { try { const response = await fetch("http://127.0.0.1:43123/health"); const data = await response.json() as { version?: number; roots?: number; desktopEnabled?: boolean }; setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`); } catch { setDebugReport("Companion is not running or is unavailable to this browser."); } })()}>Check companion</Button>{debugReport && <p className="mt-2 text-accent">{debugReport}</p>}</div>}
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent">
            <Settings2 className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-2xl text-fg">App zoom</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Scale the entire library interface for this browser. Your choice is remembered
            everywhere in Reelcase.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[80, 90, 100, 110, 125].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={zoom === value ? "default" : "secondary"}
                onClick={() => setGlobalZoom(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Settings2 className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Day & night</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose the palette that is easiest on your eyes. It applies to every Reelcase page and stays on this device.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={theme === "night" ? "default" : "secondary"} onClick={() => setColorTheme("night")}>Night mode</Button><Button size="sm" variant={theme === "day" ? "default" : "secondary"} onClick={() => setColorTheme("day")}>Day mode</Button></div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Radio className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Live layout</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose a larger card layout or fit more live channels on screen. This changes the Live page without adding heavier media loads.</p>
          <div className="mt-4 flex flex-wrap gap-2">{[3, 4, 6].map((value) => <Button key={value} size="sm" variant={liveDensity === value ? "default" : "secondary"} onClick={() => { setLiveDensity(value); localStorage.setItem("reelcase.live-columns", String(value)); }}>{value === 3 ? "Large · 3 columns" : `${value} columns`}</Button>)}</div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent">
            <PackageSearch className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-2xl text-fg">Home performance</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Choose how many cards each Home rail mounts. Lower counts keep huge folders smooth; the
            complete catalog remains searchable.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[12, 24, 48].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={railLimit === value ? "default" : "secondary"}
                onClick={() => {
                  setRailLimit(value);
                  localStorage.setItem("reelcase.home-rail-limit", String(value));
                }}
              >
                {value} per row
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant={sourceCacheFirst ? "default" : "secondary"}
            className="mt-3"
            onClick={() => {
              const next = !sourceCacheFirst;
              setSourceCacheFirst(next);
              localStorage.setItem("reelcase.source-cache-first", String(next));
            }}
          >
            {sourceCacheFirst ? "Use cached sources first" : "Rescan sources on launch"}
          </Button>
          <p className="mt-3 text-xs text-subtle">
            Cached source catalogs load immediately. Use a source refresh when you want to check the
            disk again.
          </p>
        </div>
      </div></section>
      <section className="mt-6"><div className="mb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connections, privacy & guides</p><p className="mt-1 text-sm text-muted">Optional services and explanations stay separate from everyday library preferences.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={<Clapperboard className="size-5" />}
          title="Local edit workspace"
          copy="The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI recommendations, later"
          copy="Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI tools directory"
          copy="Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
        />
        <InfoCard
          icon={<Settings2 className="size-5" />}
          title="Privacy defaults"
          copy="Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
        />
        <InfoCard
          icon={<PackageSearch className="size-5" />}
          title="How Reelcase works"
          copy="Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
        />
        <AlexaLightControl />
        <GoogleYouTubeConnection />
      </div></section>
      <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-fg">100 local preferences</h2>
            <p className="mt-1 text-sm text-muted">
              Organized controls for playback, library management, discovery, rooms, and privacy. Each switch saves immediately in this browser; hover or read the line below it to see what it changes.
            </p>
          </div>
          <p className="text-xs text-muted">
            {Object.values(preferences).filter(Boolean).length} enabled
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(PREFERENCE_GROUPS) as Array<keyof typeof PREFERENCE_GROUPS>).map(
            (group) => (
              <Button
                key={group}
                size="sm"
                variant={preferenceGroup === group ? "default" : "secondary"}
                onClick={() => setPreferenceGroup(group)}
              >
                {group} · {PREFERENCE_GROUPS[group].length}
              </Button>
            ),
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => togglePreference(item.key)}
              className="flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border"
            >
              <span>
                <span className="block text-sm font-medium text-fg">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.detail}</span>
              </span>
              <span
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`}
              >
                <span
                  className={`size-5 rounded-full ${preferences[item.key] ? "bg-accent-fg" : "bg-muted"}`}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </HubShell>
  );
}

export function PrintsSection() {
  return (
    <LocalCatalog
      kind="prints"
      eyebrow="Maker shelf"
      icon={<Box className="size-4" />}
      title="3D prints"
      copy="Keep a lightweight catalog of print-ready files. Add STL, OBJ, 3MF, or G-code files to track what is ready for the printer."
      accept=".stl,.obj,.3mf,.gcode"
      footer={
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ServiceLink
            name="Printables"
            href="https://www.printables.com/"
            copy="Browse community-shared printable models."
          />
          <ServiceLink
            name="OpenSCAD"
            href="https://openscad.org/"
            copy="Build and customize open parametric models."
          />
        </div>
      }
    />
  );
}

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
          Account sign-in and playback remain on Spotify’s official site or app. Reelcase does not
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

function AlexaLightControl() {
  const [scene, setScene] = useState("Movie night");
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">
        <Lightbulb className="size-5" />
      </span>
      <h2 className="mt-3 font-display text-2xl text-fg">Alexa light scenes</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs
        an authorized Alexa Smart Home skill, which is not connected here.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Movie night", "Bright", "Warm", "Pause lights"].map((item) => (
          <Button
            key={item}
            size="sm"
            variant={scene === item ? "default" : "secondary"}
            onClick={() => setScene(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        className="mt-3"
        onClick={() => {
          localStorage.setItem("reelcase.alexa.scene", scene);
          setSaved(true);
        }}
      >
        Save preferred scene
      </Button>
      {saved && (
        <p className="mt-2 text-xs text-accent">
          Saved. Say “Alexa, {scene}.” after creating that scene in the Alexa app.
        </p>
      )}
    </div>
  );
}

function GoogleYouTubeConnection() {
  const [clientId, setClientId] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Not connected");
  const videos = useLibrary((s) => s.videos);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  useEffect(() => {
    setClientId(localStorage.getItem("reelcase.google.client-id") ?? "");
    setToken(sessionStorage.getItem("reelcase.google.youtube-token") ?? "");
  }, []);
  const connect = () => {
    const id = clientId.trim();
    if (!id.endsWith(".apps.googleusercontent.com")) {
      setStatus("Enter the Google OAuth Client ID ending in .apps.googleusercontent.com.");
      return;
    }
    localStorage.setItem("reelcase.google.client-id", id);
    setStatus("Opening Google authorization…");
    const start = () => {
      const google = (
        window as Window & {
          google?: {
            accounts?: {
              oauth2?: {
                initTokenClient: (config: {
                  client_id: string;
                  scope: string;
                  callback: (response: { access_token?: string; error?: string }) => void;
                }) => { requestAccessToken: (config?: { prompt?: string }) => void };
              };
            };
          };
        }
      ).google;
      const client = google?.accounts?.oauth2?.initTokenClient({
        client_id: id,
        scope: "https://www.googleapis.com/auth/youtube.readonly",
        callback: (response) => {
          if (response.access_token) {
            sessionStorage.setItem("reelcase.google.youtube-token", response.access_token);
            setToken(response.access_token);
            setStatus("Google connected for this browser session.");
          } else
            setStatus(`Google authorization failed${response.error ? `: ${response.error}` : "."}`);
        },
      });
      if (!client) {
        setStatus(
          "Google authorization library did not load. Check the authorized JavaScript origin.",
        );
        return;
      }
      client.requestAccessToken({ prompt: "consent" });
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-reelcase-google="true"]',
    );
    if (existing && (window as Window & { google?: unknown }).google) start();
    else {
      const script = existing ?? document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.dataset.reelcaseGoogle = "true";
      script.onload = start;
      script.onerror = () => setStatus("Google authorization library could not load.");
      if (!existing) document.head.appendChild(script);
    }
  };
  const importTags = async () => {
    if (!token) return;
    const items = videos
      .filter((video) => video.remote?.kind === "youtube" && video.remote.videoId)
      .slice(0, 50);
    if (!items.length) {
      setStatus("No YouTube videos are available to enrich yet.");
      return;
    }
    setStatus("Importing available YouTube metadata…");
    try {
      const ids = items.map((video) => video.remote!.videoId).join(",");
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(ids)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Google did not allow the metadata request.");
      const body = (await response.json()) as {
        items?: Array<{
          id: string;
          snippet?: { tags?: string[]; categoryId?: string; channelTitle?: string };
        }>;
      };
      const byId = new Map((body.items ?? []).map((item) => [item.id, item.snippet]));
      let changed = 0;
      for (const video of items) {
        const snippet = byId.get(video.remote!.videoId!);
        const imported = [
          ...new Set(
            [
              "youtube",
              snippet?.channelTitle ?? video.remote?.channelName ?? "",
              ...(snippet?.tags ?? []),
            ]
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ].slice(0, 30);
        if (imported.length) {
          setVideoTags(video.id, imported);
          changed += 1;
        }
      }
      setStatus(`Imported available tags for ${changed} YouTube title${changed === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not import YouTube metadata.");
    }
  };
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">
        <Clapperboard className="size-5" />
      </span>
      <h2 className="mt-3 font-display text-2xl text-fg">Google & YouTube access</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser
        session, then Reelcase can read permitted YouTube metadata and available creator tags.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-muted">
        <li>In Google Cloud, create a project and enable YouTube Data API v3.</li>
        <li>
          Create an OAuth Client ID for a Web application; do not create or paste a client secret.
        </li>
        <li>
          Add this exact Authorized JavaScript origin:{" "}
          {typeof window === "undefined" ? "your app origin" : window.location.origin}.
        </li>
        <li>
          Paste the Client ID here, select Connect Google, approve read-only YouTube access, then
          choose Import YouTube tags.
        </li>
      </ol>
      <Input
        className="mt-3"
        value={clientId}
        onChange={(event) => setClientId(event.target.value)}
        placeholder="Google OAuth Client ID"
        aria-label="Google OAuth Client ID"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={connect}>
          Connect Google
        </Button>
        <Button size="sm" variant="secondary" disabled={!token} onClick={() => void importTags()}>
          Import YouTube tags
        </Button>
        {token && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem("reelcase.google.youtube-token");
              setToken("");
              setStatus("Disconnected from this browser session.");
            }}
          >
            Disconnect
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-accent">{status}</p>
    </div>
  );
}
type LocalPhoto = {
  id: string;
  name: string;
  path: string;
  url: string;
  people: string[];
  tags: string[];
  album: string;
  favorite: boolean;
  rating: number;
  addedAt: number;
};
type PhotoSort = "newest" | "name" | "rating" | "favorite";
const PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;

export function PhotosSection() {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [selectedPerson, setSelectedPerson] = useState("All photos");
  const [photoSearch, setPhotoSearch] = useState("");
  const [discoveryFilter, setDiscoveryFilter] = useState<"all" | "screenshots" | "camera" | "downloads">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [photoSort, setPhotoSort] = useState<PhotoSort>(() => {
    try { return (localStorage.getItem("reelcase.photos.sort") as PhotoSort) || "newest"; } catch { return "newest"; }
  });
  const [showLocations, setShowLocations] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.show-locations") === "true"; } catch { return false; }
  });
  const [photoFolders, setPhotoFolders] = useState<string[]>([]);
  const [slideshow, setSlideshow] = useState(false);
  const [slideSeconds, setSlideSeconds] = useState(() => {
    try { const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5"); return [3, 5, 10, 20, 30].includes(value) ? value : 5; } catch { return 5; }
  });
  const [slideIndex, setSlideIndex] = useState(0);
  const [helperNote, setHelperNote] = useState("");
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);
  const [photoLimit, setPhotoLimit] = useState(80);
  // Select the store's stable array first. Filtering inside the selector creates a
  // fresh value every render, which makes Zustand continuously notify this view.
  const libraryFolders = useLibrary((s) => s.folders);
  const sourcePhotos = useSourceAssets((s) => s.photos);
  const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
  const sourceFolders = useMemo(
    () => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"),
    [libraryFolders],
  );
  const addPhotos = (files: FileList | File[] | null, folderName = "Unsorted", paths?: string[]) => {
    if (!files) return;
    const remembered = (() => { try { return JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}"); } catch { return {}; } })() as Record<string, Partial<LocalPhoto>>;
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name))
      .slice(0, 600)
      .map((file, index) => {
        const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
        const id = `${path}-${file.lastModified}`;
        return {
        id,
        name: file.name,
        path,
        url: URL.createObjectURL(file),
        people: remembered[id]?.people ?? [],
        tags: remembered[id]?.tags ?? [],
        album: remembered[id]?.album ?? folderName,
        favorite: remembered[id]?.favorite ?? false,
        rating: remembered[id]?.rating ?? 0,
        addedAt: file.lastModified,
      };
      });
    setPhotos((current) => {
      const known = new Set(current.map((photo) => photo.id));
      return [...current, ...next.filter((photo) => !known.has(photo.id))];
    });
  };
  useEffect(() => {
    if (sourcePhotos.length) addPhotos(sourcePhotos.map((asset) => asset.file), "Source import", sourcePhotos.map((asset) => asset.path));
  }, [sourcePhotos]);
  useEffect(() => { try { localStorage.setItem("reelcase.photo-meta.v1", JSON.stringify(Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating }) => [id, { path, people, tags, album, favorite, rating }])))); } catch { /* quota */ } }, [photos]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.sort", photoSort); } catch { /* storage unavailable */ } }, [photoSort]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.show-locations", String(showLocations)); } catch { /* storage unavailable */ } }, [showLocations]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds)); } catch { /* storage unavailable */ } }, [slideSeconds]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Directory handles are re-read only when the photo shelf is opened, so the
      // startup catalog remains fast even for very large video sources.
      for (const folder of sourceFolders) {
        if (cancelled) return;
        await refreshSourcePhotos(folder.id);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshSourcePhotos, sourceFolders]);
  const addPhotoFolder = (files: FileList | null) => {
    if (!files?.length) return;
    const first =
      [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ??
      "Photo folder";
    setPhotoFolders((folders) => (folders.includes(first) ? folders : [...folders, first]));
    addPhotos(files, first);
  };
  const people = [...new Set(photos.flatMap((photo) => photo.people))];
  const albums = [...new Set(photos.map((photo) => photo.album))];
  const visible = photos
    .filter(
      (photo) =>
        (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) &&
        (!favoritesOnly || photo.favorite) &&
        (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) &&
        `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`
          .toLowerCase()
          .includes(photoSearch.toLowerCase()),
    )
    .sort((a, b) => {
      if (photoSort === "name") return a.name.localeCompare(b.name);
      if (photoSort === "rating") return b.rating - a.rating || b.addedAt - a.addedAt;
      if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
      return b.addedAt - a.addedAt;
    });
  const renderedPhotos = visible.slice(0, photoLimit);
  useEffect(() => setPhotoLimit(80), [photoSearch, selectedPerson, favoritesOnly, photoSort, discoveryFilter]);
  useEffect(() => { if (!slideshow || !visible.length) return; const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % visible.length), slideSeconds * 1000); return () => window.clearInterval(timer); }, [slideshow, slideSeconds, visible.length]);
  const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
  const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
  const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : undefined;
  const moveFocus = (direction: -1 | 1) => {
    if (!visible.length) return;
    const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
    setFocusedPhotoId(visible[nextIndex].id);
  };
  const suggestPeopleFromNames = () => {
    let labeled = 0;
    setPhotos((items) => items.map((photo) => {
      if (photo.people.length) return photo;
      const words = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word));
      const candidate = words.find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
      if (!candidate) return photo;
      labeled += 1;
      return { ...photo, people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()] };
    }));
    setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
  };
  return (
    <HubShell
      eyebrow="Photo viewer"
      icon={<Images className="size-4" />}
      title="A private people shelf."
      copy="Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination."
    >
      <div className="mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg">Your local photo selection</p>
          <p className="mt-1 text-xs text-muted">
            Photo folders become albums here; people labels are local notes, ready to map to
            XMP/IPTC subject metadata later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => addPhotos(event.target.files)}
            />
            <span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
              Add photos
            </span>
          </label>
          <label>
            <input
              className="sr-only"
              type="file"
              multiple
              {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              onChange={(event) => addPhotoFolder(event.target.files)}
            />
            <span className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">
              Add photo folder
            </span>
          </label>
          <a
            href="https://photos.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border"
          >
            Open Google Photos
          </a>
          {photoSearch.trim() && <a href={`https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">Search Google Photos</a>}
          <a
            href="https://www.google.com/android/find/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border"
          >
            Find my phone
          </a>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedPerson === "All photos" ? "default" : "secondary"}
            onClick={() => setSelectedPerson("All photos")}
          >
            All photos
          </Button>
          {people.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={selectedPerson === name ? "default" : "secondary"}
              onClick={() => setSelectedPerson(name)}
            >
              {name}
            </Button>
          ))}
          {albums.map((album) => (
            <span key={album} className="rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted">
              {album}
            </span>
          ))}
        </div>
        {photoFolders.length > 0 && (
          <p className="text-xs text-muted">Sources · {photoFolders.join(" · ")}</p>
        )}
        {sourceFolders.length > 0 && <p className="text-xs text-muted">Video sources available for photo folders · {sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={photoSearch}
            onChange={(event) => setPhotoSearch(event.target.value)}
            placeholder="Search names, people, albums, or file locations"
            aria-label="Search photos"
          />
          <Button
            size="sm"
            variant={favoritesOnly ? "default" : "secondary"}
            onClick={() => setFavoritesOnly((value) => !value)}
          >
            Favorites
          </Button>
          {(["newest", "name", "rating", "favorite"] as const).map((sort) => (
            <Button key={sort} size="sm" variant={photoSort === sort ? "default" : "secondary"} onClick={() => setPhotoSort(sort)}>
              {sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : "Favorites first"}
            </Button>
          ))}
          <Button size="sm" variant={showLocations ? "default" : "secondary"} onClick={() => setShowLocations((value) => !value)}>
            {showLocations ? "Hide locations" : "Show locations"}
          </Button>
          <Button size="sm" variant={slideshow ? "default" : "secondary"} onClick={() => setSlideshow((value) => !value)}>{slideshow ? "Stop auto-change" : "Auto-change photos"}</Button>
          {slideshow && <select value={slideSeconds} onChange={(event) => setSlideSeconds(Number(event.target.value))} aria-label="Photo slideshow interval" className="h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border">{[3, 5, 10, 20, 30].map((seconds) => <option key={seconds} value={seconds}>Every {seconds}s</option>)}</select>}
          <Button size="sm" variant="secondary" disabled={!visible.length} onClick={() => { const pick = visible[Math.floor(Math.random() * visible.length)]; if (pick) { setSlideIndex(visible.findIndex((photo) => photo.id === pick.id)); setFocusedPhotoId(pick.id); } }}>Random photo</Button>
          <Button size="sm" variant="secondary" disabled={!photos.length} onClick={suggestPeopleFromNames}>Suggest people labels</Button>
        </div>
        <div className="flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Local discovery</span>{(["all", "screenshots", "camera", "downloads"] as const).map((filter) => <Button key={filter} size="sm" variant={discoveryFilter === filter ? "default" : "secondary"} onClick={() => setDiscoveryFilter(filter)}>{filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)}</Button>)}</div>
        <p className="text-xs leading-5 text-muted">Private local discovery uses file-name patterns for screenshots, camera files, downloads, and suggested people labels. Face recognition is not enabled, so no image leaves this device. Large folders are decoded lazily and displayed in small batches to keep scrolling responsive.</p>
        {helperNote && <p className="text-xs text-accent">{helperNote}</p>}
      </div>
      {!photos.length ? (
        <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border">
          <Images className="mx-auto size-7 text-accent" />
          <p className="mt-3 font-display text-2xl text-fg">Start with a few favorites</p>
          <p className="mt-2 text-sm text-muted">
            Add photos here to make private people sections without connecting an account.
          </p>
        </div>
      ) : (
        <><div className="mt-5 overflow-hidden rounded-lg bg-elevated shadow-border">{featuredPhoto && <div className="grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]"><img src={featuredPhoto.url} alt={featuredPhoto.name} decoding="async" className="aspect-video size-full object-cover"/><div className="flex flex-col justify-center p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Now showing</p><p className="mt-2 font-display text-3xl text-fg">{featuredPhoto.name}</p><p className="mt-2 text-sm text-muted">{featuredPhoto.album} · {featuredPhoto.rating || 0}/5 rating</p>{showLocations && <p title={featuredPhoto.path} className="mt-2 truncate text-xs text-muted">{featuredPhoto.path}</p>}</div></div>}</div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {renderedPhotos.map((photo) => (
            <div key={photo.id} className="overflow-hidden rounded-md bg-elevated shadow-border">
              <button type="button" className="group relative block w-full" onClick={() => setFocusedPhotoId(photo.id)} aria-label={`Open ${photo.name} full screen`}><img src={photo.url} alt={photo.name} loading="lazy" decoding="async" className="aspect-square w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 className="size-6 text-fg" /></span></button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm text-fg">{photo.name}</p>
                  <Button
                    size="sm"
                    variant={photo.favorite ? "default" : "secondary"}
                    onClick={() =>
                      setPhotos((items) =>
                        items.map((item) =>
                          item.id === photo.id ? { ...item, favorite: !item.favorite } : item,
                        ),
                      )
                    }
                  >
                    ♥
                  </Button>
                </div>
                {showLocations && <p title={photo.path} className="mt-1 truncate text-xs text-muted">{photo.path}</p>}
                <div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <Button key={value} size="sm" variant={value <= photo.rating ? "default" : "secondary"} onClick={() => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, rating: value } : item))}>{value}</Button>)}</div>
                <Input
                  className="mt-2 h-9"
                  placeholder="People: Alex, Sam"
                  value={photo.people.join(", ")}
                  onChange={(event) => {
                    const names = event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                    setPhotos((items) =>
                      items.map((item) =>
                        item.id === photo.id ? { ...item, people: names } : item,
                      ),
                    );
                  }}
                />
                <Input
                  className="mt-2 h-9"
                  placeholder="Tags: travel, pets, event"
                  value={photo.tags.join(", ")}
                  onChange={(event) => {
                    const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
                    setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, tags: [...new Set(tags)] } : item));
                  }}
                />
                <Input
                  className="mt-2 h-9"
                  placeholder="Album, e.g. Summer 2026"
                  value={photo.album}
                  onChange={(event) =>
                    setPhotos((items) =>
                      items.map((item) =>
                        item.id === photo.id
                          ? { ...item, album: event.target.value || "Unsorted" }
                          : item,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div><div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>Showing {Math.min(renderedPhotos.length, visible.length)} of {visible.length} matching photos</span>{renderedPhotos.length < visible.length && <Button size="sm" variant="secondary" onClick={() => setPhotoLimit((limit) => limit + 80)}>Show 80 more</Button>}</div>{focusedPhoto && <div role="dialog" aria-modal="true" aria-label={`Viewing ${focusedPhoto.name}`} className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 p-4" onClick={() => setFocusedPhotoId(null)}><div className="relative flex h-full w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-3 text-fg"><div className="min-w-0"><p className="truncate font-medium">{focusedPhoto.name}</p><p className="text-xs text-muted">{focusedPhoto.album} · {focusedIndex + 1} of {visible.length}</p>{showLocations && <p title={focusedPhoto.path} className="truncate text-xs text-muted">{focusedPhoto.path}</p>}</div><Button size="sm" variant="secondary" onClick={() => setFocusedPhotoId(null)}>Close</Button></div><div className="relative min-h-0 flex-1"><img src={focusedPhoto.url} alt={focusedPhoto.name} className="size-full object-contain"/><Button size="sm" variant="secondary" className="absolute top-1/2 left-2 -translate-y-1/2" onClick={() => moveFocus(-1)} aria-label="Previous photo"><ChevronLeft className="size-5"/></Button><Button size="sm" variant="secondary" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => moveFocus(1)} aria-label="Next photo"><ChevronRight className="size-5"/></Button></div></div></div>}</>
      )}
    </HubShell>
  );
}
type Mission = { id: string; title: string; detail: string; done: boolean };
const DEFAULT_MISSIONS: Mission[] = [
  { id: "index", title: "Durable media index", detail: "Catalog source health, cached metadata, thumbnails, and fast search without blocking the first screen.", done: false },
  { id: "companion", title: "Desktop companion", detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion.", done: false },
  { id: "watch", title: "Watch room reliability", detail: "Harden LAN signaling, timeline reconciliation, queue voting, and guest access checks.", done: false },
  { id: "services", title: "Connected services", detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.", done: false },
  { id: "thumb-health", title: "Thumbnail health queue", detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.", done: false },
  { id: "windows-explorer", title: "Windows explorer bridge", detail: "Expand companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.", done: false },
  { id: "service-status", title: "Service refresh status", detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.", done: false },
  { id: "vr-theater", title: "VR theater reliability", detail: "Replace the current WebXR capability check with a true headset cinema surface, controller controls, and clear Meta Quest recovery guidance.", done: false },
  { id: "companion-onboarding", title: "Companion onboarding", detail: "Add a one-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.", done: false },
  { id: "large-library-views", title: "Large-library views", detail: "Progressively render grids, virtualize long result sets, and keep recommendations responsive with hundreds of thousands of catalog entries.", done: false },
  { id: "favorites-memory", title: "Favorites memory", detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.", done: false },
  { id: "theme-accessibility", title: "Theme & accessibility", detail: "Finish day/night palettes, contrast checks, focus styling, and per-section density preferences.", done: false },
];

export function MissionPlanSection() {
  const [missions, setMissions] = useState<Mission[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null") as Mission[] | null; return Array.isArray(saved) ? [...saved, ...DEFAULT_MISSIONS.filter((mission) => !saved.some((item) => item.id === mission.id))] : DEFAULT_MISSIONS; } catch { return DEFAULT_MISSIONS; }
  });
  const [idea, setIdea] = useState("");
  useEffect(() => { try { localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions)); } catch { /* storage unavailable */ } }, [missions]);
  const completed = missions.filter((mission) => mission.done).length;
  return <HubShell eyebrow="Mission plan" icon={<Rocket className="size-4"/>} title="Build a private media home that scales." copy="Reelcase is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.">
    <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Product mission</p><h2 className="mt-2 font-display text-3xl text-fg">One calm control room for a very large library.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service.</p><div className="mt-5 flex items-end justify-between gap-4"><div><p className="font-display text-2xl text-fg">{completed} of {missions.length} milestones complete</p><p className="mt-1 text-sm text-muted">Every milestone includes implementation, browser verification, and a production build check.</p></div><div className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">{missions.length ? Math.round(completed / missions.length * 100) : 0}%</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full bg-accent transition-all" style={{ width: `${missions.length ? completed / missions.length * 100 : 0}%` }}/></div></section>
    <div className="mt-5 space-y-3">{missions.map((mission, index) => <article key={mission.id} className="flex gap-4 rounded-lg bg-elevated p-4 shadow-border"><Button size="sm" variant={mission.done ? "default" : "secondary"} aria-label={`Mark ${mission.title} ${mission.done ? "incomplete" : "complete"}`} onClick={() => setMissions((items) => items.map((item) => item.id === mission.id ? { ...item, done: !item.done } : item))}>{mission.done ? "Done" : `Step ${index + 1}`}</Button><div className="min-w-0 flex-1"><h2 className={mission.done ? "text-sm font-medium text-muted line-through" : "text-sm font-medium text-fg"}>{mission.title}</h2><p className="mt-1 text-sm text-muted">{mission.detail}</p></div></article>)}</div>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Desktop companion launch path</p><ol className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-2"><li><span className="font-medium text-fg">1. Start Companion</span><br/>Start the local Reelcase Companion from its approved desktop setup.</li><li><span className="font-medium text-fg">2. Confirm Desktop</span><br/>Use Settings → Diagnostics to confirm the Desktop root is available.</li><li><span className="font-medium text-fg">3. Load shortcuts</span><br/>Open Games and choose Load approved desktop shortcuts.</li><li><span className="font-medium text-fg">4. Verify, then launch</span><br/>Use a listed shortcut; the companion checks that it stays inside an approved root.</li></ol></section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><InfoCard icon={<Wifi className="size-5"/>} title="Next: home network" copy="Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."/><InfoCard icon={<Images className="size-5"/>} title="Then: media intelligence" copy="Background metadata, thumbnail health, faster source search, and reviewable local tags."/><InfoCard icon={<Bot className="size-5"/>} title="Later: optional assistants" copy="Private recommendation controls, explainable picks, and only opt-in service connections."/></section>
    <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const title = idea.trim(); if (!title) return; setMissions((items) => [...items, { id: crypto.randomUUID(), title, detail: "New idea — break this into implementation and verification steps.", done: false }]); setIdea(""); }}><Input value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Add a larger change idea" aria-label="New mission idea"/><Button type="submit">Add to plan</Button></form>
  </HubShell>;
}
export function GamesSection() {
  const [games, setGames] = useState<LocalItem[]>([]);
  const [filter, setFilter] = useState("");
  const [removeGame, setRemoveGame] = useState<string | null>(null);
  const [launchNotice, setLaunchNotice] = useState("");
  const [shortcutView, setShortcutView] = useState<"all" | "web" | "desktop">("all");
  const [companionLoading, setCompanionLoading] = useState(false);
  const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
  useEffect(() => {
    const saved = readHub().games;
    setGames(saved);
  }, []);
  const saveGames = (next: LocalItem[]) => {
    setGames(next);
    const hub = readHub();
    writeHub({ ...hub, games: next });
  };
  const add = async (files: FileList | File[] | null, allowWebShortcut = false) => {
    if (!files) return;
    const source = Array.from(files).filter((file) =>
      allowWebShortcut
        ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name)
        : /\.(exe|lnk|appref-ms)$/i.test(file.name),
    );
    const next = await Promise.all(
      source.map(async (file) => {
        let launchUrl: string | undefined;
        if (/\.url$/i.test(file.name)) {
          const match = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic):\S+)/im);
          launchUrl = match?.[1];
        }
        return {
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          addedAt: Date.now(),
          launchUrl,
        };
      }),
    );
    setGames((current) => {
      const merged = [
        ...current,
        ...next.filter((item) => !current.some((game) => game.path === item.path)),
      ];
      const hub = readHub();
      writeHub({ ...hub, games: merged });
      return merged;
    });
  };
  useEffect(() => { if (sourceShortcuts.length) void add(sourceShortcuts, true); }, [sourceShortcuts]);
  const launchDesktop = async (game: LocalItem) => {
    try {
      const response = await fetch("http://127.0.0.1:43123/launch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: game.path }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
    } catch {
      setLaunchNotice("Desktop launch needs the Reelcase Companion running and this shortcut inside one of its approved Windows folders.");
    }
  };
  const loadApprovedShortcuts = async () => {
    setCompanionLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:43123/shortcuts?limit=300");
      const result = await response.json() as { ok?: boolean; shortcuts?: Array<{ name: string; path: string }>; error?: string };
      if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
      const next = (result.shortcuts ?? []).map((item) => ({ ...item, size: 0, addedAt: Date.now() }));
      setGames((current) => {
        const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
        writeHub({ ...readHub(), games: merged });
        return merged;
      });
      setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts. They can launch through the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
    } catch {
      setLaunchNotice("Companion connection unavailable. Start the local Reelcase Companion, then try again.");
    } finally { setCompanionLoading(false); }
  };
  const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "web" ? Boolean(game.launchUrl) : !game.launchUrl)));
  return (
    <HubShell
      eyebrow="Desktop game shelf"
      icon={<Gamepad2 className="size-4" />}
      title="A clearer game drawer."
      copy="Choose a dedicated games folder, add custom cover icons, and explicitly import web game shortcuts. Every card has a launch control: web shortcuts open directly; desktop launchers are clearly marked because browsers cannot start an .exe by themselves."
    >
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            accept=".url"
            onChange={(event) => void add(event.target.files, true)}
          />
          <span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
            Add web game shortcut
          </span>
        </label>
        <Button variant="secondary" disabled={companionLoading} onClick={() => void loadApprovedShortcuts()}>
          {companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"}
        </Button>
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
            onChange={(event) => void add(event.target.files)}
          />
          <span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border">
            Choose game folder
          </span>
        </label>
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter your games"
          aria-label="Filter games"
        />
        {(["all", "web", "desktop"] as const).map((view) => <Button key={view} size="sm" variant={shortcutView === view ? "default" : "secondary"} onClick={() => setShortcutView(view)}>{view === "all" ? "All" : view === "web" ? "Web launchers" : "Desktop launchers"}</Button>)}
      </div>
      {visible.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visible.map((game) => (
            <div
              key={game.path}
              className="flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg/50 text-accent">
                {game.iconData ? (
                  <img src={game.iconData} alt="" className="size-full object-cover" />
                ) : (
                  <Gamepad2 className="size-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-fg">
                  {game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {game.launchUrl ? "Web shortcut ready to launch" : game.path}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (game.launchUrl) {
                        const link = document.createElement("a");
                        link.href = game.launchUrl;
                        link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        return;
                      }
                      void launchDesktop(game);
                    }}
                  >
                    <Rocket className="size-3" />
                    {game.launchUrl ? "Launch shortcut" : "Launch desktop game"}
                  </Button>
                  <label className="inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg">
                    <ImagePlus className="mr-1 size-3" /> Set icon
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () =>
                          saveGames(
                            games.map((item) =>
                              item.path === game.path
                                ? { ...item, iconData: String(reader.result) }
                                : item,
                            ),
                          );
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`}
                    className="inline-flex text-xs text-muted hover:text-fg"
                  >
                    Store page <ExternalLink className="ml-1 size-3" />
                  </a>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-danger"
                    onClick={() =>
                      removeGame === game.path
                        ? (saveGames(games.filter((item) => item.path !== game.path)),
                          setRemoveGame(null))
                        : setRemoveGame(game.path)
                    }
                  >
                    {removeGame === game.path ? "Confirm remove" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border">
          <Gamepad2 className="mx-auto size-7 text-accent" />
          <p className="mt-3 font-display text-2xl text-fg">Build your launch list</p>
          <p className="mt-2 text-sm text-muted">
            Add `.url` shortcuts to launch their approved web destination, or catalog desktop
            launchers and choose a custom cover icon.
          </p>
        </div>
      )}
      {launchNotice && <p className="mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border">{launchNotice}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ServiceLink
          name="Nexus Mods"
          href="https://www.nexusmods.com/"
          copy="Browse mod pages and collections."
        />
        <ServiceLink
          name="Vortex"
          href="https://www.nexusmods.com/about/vortex/"
          copy="Open the official mod manager page."
        />
      </div>
    </HubShell>
  );
}

type PrivateWebShortcut = { id: string; name: string; url: string };
const PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";

export function PrivateWebShortcuts() {
  const [links, setLinks] = useState<PrivateWebShortcut[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
      return Array.isArray(saved) ? saved.filter((item): item is PrivateWebShortcut => typeof item?.name === "string" && typeof item?.url === "string") : [];
    } catch { return []; }
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const save = (next: PrivateWebShortcut[]) => { setLinks(next); localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next)); };
  const add = () => {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
      save([...links, { id: crypto.randomUUID(), name: name.trim() || parsed.hostname, url: parsed.toString() }]);
      setName(""); setUrl("");
    } catch { setUrl(""); }
  };
  return <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private web shortcuts</p><h2 className="mt-2 font-display text-2xl text-fg">Your saved destinations</h2><p className="mt-1 text-xs leading-5 text-muted">Add only links you trust. These are saved only in this browser and open when you press Launch.</p><div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Shortcut name"/><Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" aria-label="Shortcut URL"/><Button disabled={!url.trim()} onClick={add}>Save shortcut</Button></div>{links.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{links.map((link) => <div key={link.id} className="flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{link.name}</p><p className="truncate text-xs text-muted">{link.url}</p></div><Button size="sm" onClick={() => window.location.assign(link.url)}><Rocket className="size-3"/>Launch</Button><Button size="sm" variant="secondary" onClick={() => save(links.filter((item) => item.id !== link.id))}>Remove</Button></div>)}</div>}</section>;
}

function LocalCatalog({
  kind,
  eyebrow,
  icon,
  title,
  copy,
  accept,
  directory,
  footer,
}: {
  kind: "prints" | "games";
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  accept?: string;
  directory?: boolean;
  footer?: ReactNode;
}) {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  useEffect(() => setHub(readHub()), []);
  const items = hub[kind];
  const change = (files: FileList | null) => {
    if (!files?.length) return;
    const next = { ...hub, [kind]: filesToItems(files, kind === "games") };
    setHub(next);
    writeHub(next);
  };
  return (
    <HubShell eyebrow={eyebrow} icon={icon} title={title} copy={copy}>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated">
        <PackageSearch className="size-7 text-accent" />
        <span className="mt-3 text-sm font-medium text-fg">
          {directory ? "Choose Desktop games folder" : "Add print files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {directory
            ? "Keeps only game launchers and shortcuts; folders and support files stay out."
            : "STL, OBJ, 3MF, and G-code are supported."}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
          onChange={(event) => change(event.target.files)}
        />
      </label>
      {items.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg shadow-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-fg">
              {items.length} saved {kind === "prints" ? "print files" : "games"}
            </p>
            <p className="text-xs text-subtle">Stored as names only</p>
          </div>
          {items.slice(0, 80).map((item) => (
            <div
              key={`${item.path}:${item.addedAt}`}
              className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.path}</p>
              </div>
              <p className="shrink-0 font-mono text-xs text-subtle">{bytes(item.size)}</p>
            </div>
          ))}
        </div>
      )}
      {footer}
    </HubShell>
  );
}

export function ShopSection() {
  const [query, setQuery] = useState("");
  type Package = { id: string; title: string; carrier: string; tracking: string; status: "Ordered" | "Shipped" | "Out for delivery" | "Delivered" };
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageTitle, setPackageTitle] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [tracking, setTracking] = useState("");
  useEffect(() => { try { setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]") as Package[]); } catch { setPackages([]); } }, []);
  useEffect(() => { try { localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages)); } catch { /* storage unavailable */ } }, [packages]);
  const encoded = encodeURIComponent(query.trim());
  const stores = useMemo(
    () => [
      { name: "Amazon", href: `https://www.amazon.com/s?k=${encoded}`, detail: "Search Amazon" },
      {
        name: "Walmart",
        href: `https://www.walmart.com/search?q=${encoded}`,
        detail: "Search Walmart",
      },
      {
        name: "eBay",
        href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
        detail: "Search eBay",
      },
      { name: "Etsy", href: `https://www.etsy.com/search?q=${encoded}`, detail: "Search handmade & niche shops" },
      { name: "Diipoo", href: `https://diipoo.com/?s=${encoded}`, detail: "Search Diipoo deals" },
    ],
    [encoded],
  );
  return (
    <HubShell
      eyebrow="Shopping shortcuts"
      icon={<ShoppingBag className="size-4" />}
      title="Find gear for your setup"
      copy="Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search film gear, printer parts, controllers…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stores.map((store) => (
          <a
            key={store.name}
            href={store.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
          >
            <p className="font-display text-2xl text-fg">{store.name}</p>
            <p className="mt-1 text-sm text-muted">
              {query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Open search <ExternalLink className="size-4" />
            </span>
          </a>
        ))}
      </div>
      <section className="mt-7 rounded-lg bg-elevated p-5 shadow-border">
        <div><p className="flex items-center gap-2 font-display text-2xl text-fg"><PackageSearch className="size-5 text-accent" />Package tracking</p><p className="mt-1 text-sm text-muted">A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected.</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]"><Input value={packageTitle} onChange={(event) => setPackageTitle(event.target.value)} placeholder="Package or order name" aria-label="Package name" /><Input value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Carrier" aria-label="Carrier" /><Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking number (optional)" aria-label="Tracking number" /><Button onClick={() => { if (!packageTitle.trim()) return; setPackages((items) => [{ id: crypto.randomUUID(), title: packageTitle.trim(), carrier: carrier.trim() || "Carrier", tracking: tracking.trim(), status: "Ordered" }, ...items]); setPackageTitle(""); setTracking(""); }}>Add package</Button></div>
        {packages.length ? <div className="mt-4 space-y-2">{packages.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3"><div className="min-w-36 flex-1"><p className="text-sm font-medium text-fg">{item.title}</p><p className="text-xs text-muted">{item.carrier}{item.tracking ? ` · ${item.tracking}` : ""}</p></div><select value={item.status} onChange={(event) => setPackages((items) => items.map((entry) => entry.id === item.id ? { ...entry, status: event.target.value as Package["status"] } : entry))} className="h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><option>Ordered</option><option>Shipped</option><option>Out for delivery</option><option>Delivered</option></select>{item.tracking && <a href={`https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`} target="_blank" rel="noreferrer" className="rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg">Track</a>}<Button size="sm" variant="secondary" onClick={() => setPackages((items) => items.filter((entry) => entry.id !== item.id))}>Remove</Button></div>)}</div> : <p className="mt-4 text-sm text-muted">No packages yet. Add an order to keep its delivery status beside your shopping shortcuts.</p>}
      </section>
    </HubShell>
  );
}

export function StreamingSection() {
  const services = [
    { name: "Netflix", href: "https://www.netflix.com/", copy: "Movies & series" },
    { name: "Hulu", href: "https://www.hulu.com/", copy: "TV & films" },
    { name: "Crunchyroll", href: "https://www.crunchyroll.com/", copy: "Anime streaming" },
    { name: "Kick", href: "https://kick.com/", copy: "Live streaming" },
    { name: "Vimeo", href: "https://vimeo.com/", copy: "Creator video" },
    { name: "Nebula", href: "https://nebula.tv/", copy: "Independent creators" },
    { name: "Plex", href: "https://www.plex.tv/", copy: "Personal media & streaming" },
    {
      name: "Internet Archive",
      href: "https://archive.org/details/feature_films",
      copy: "Open & public-domain films",
    },
    {
      name: "Old Time Movies",
      href: "https://archive.org/details/moviesandfilms",
      copy: "Classic and public-domain cinema",
    },
    {
      name: "Library of Congress",
      href: "https://www.loc.gov/film-and-videos/",
      copy: "Historic films and moving images",
    },
    {
      name: "Open Culture",
      href: "https://www.openculture.com/freemoviesonline",
      copy: "Free film collections and courses",
    },
  ];
  return (
    <HubShell
      eyebrow="Movie streaming"
      icon={<Clapperboard className="size-4" />}
      title="Streaming destinations"
      copy="Keep watch sources separate from shopping. These official services and public collections open in their own sites."
    >
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceLink key={service.name} {...service} />
        ))}
      </div>
    </HubShell>
  );
}

export function SocialSection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    try {
      setAccounts(JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]") as string[]);
    } catch {
      setAccounts([]);
    }
  }, []);
  const add = () => {
    const next = [...new Set([...accounts, handle.trim().replace(/^@/, "")].filter(Boolean))].slice(
      0,
      12,
    );
    setAccounts(next);
    localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
    setActive(next.at(-1) ?? "");
    setHandle("");
  };
  return (
    <HubShell
      eyebrow="Social browser"
      icon={<X className="size-4" />}
      title="X account shelf"
      copy="Save public handles locally and browse a selected public profile in this workspace. Reelcase does not read credentials, messages, or account data."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@account"
          aria-label="X account handle"
        />
        <Button disabled={!handle.trim()} onClick={add}>
          Add account
        </Button>
      </div>
      <Input className="mt-3" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your saved X accounts" aria-label="Search saved X accounts" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accounts.filter((account) => account.toLowerCase().includes(search.trim().toLowerCase())).length ? (
          accounts.filter((account) => account.toLowerCase().includes(search.trim().toLowerCase())).map((account) => (
            <button
              key={account}
              type="button"
              onClick={() => setActive(account)}
              className={`rounded-lg p-5 text-left shadow-border transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 ${active === account ? "bg-accent text-accent-fg" : "bg-elevated text-fg"}`}
            >
              <p className="font-display text-2xl">@{account}</p>
              <p className="mt-1 text-sm opacity-70">Browse public profile</p>
            </button>
          ))
        ) : (
          <p className="rounded-lg bg-elevated px-4 py-8 text-sm text-muted shadow-border sm:col-span-2">
            Add public handles to keep a local launch list.
          </p>
        )}
      </div>
      {active && (
        <div className="mt-5 overflow-hidden rounded-lg bg-elevated shadow-border">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-fg">Browsing @{active}</p>
            <span className="text-xs text-muted">Local account view</span>
          </div>
          <div className="flex min-h-48 items-center justify-center px-6 text-center">
            <div>
              <p className="font-display text-2xl text-fg">Saved account, kept in Reelcase</p>
              <p className="mt-2 max-w-md text-sm text-muted">
                Search and switch saved handles here without being sent elsewhere. X does not make
                public profile timelines available for reliable in-app embedding.
              </p>
            </div>
          </div>
        </div>
      )}
    </HubShell>
  );
}

export function WatchRoomSection() {
  const [roomCode, setRoomCode] = useState(
    () => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  );
  const [roomInput, setRoomInput] = useState("");
  const [name, setName] = useState(() => localStorage.getItem("reelcase.profile-name") || "Host");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);
  const [guestAccess, setGuestAccess] = useState(false);
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [rokuAddress, setRokuAddress] = useState("");
  const [rokuReady, setRokuReady] = useState(false);
  const [rokuDevices, setRokuDevices] = useState<{ address: string; location: string }[]>([]);
  const [rokuNotice, setRokuNotice] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState<"compact" | "theater" | "cinema">("compact");
  const [playback, setPlayback] = useState({ playing: false, position: 0 });
  const [chat, setChat] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [partyPrompt, setPartyPrompt] = useState("Pick the next vibe");
  const [partyVotes, setPartyVotes] = useState<Record<string, number>>({ Comedy: 0, Action: 0, Surprise: 0 });
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const [friends, setFriends] = useState<{ name: string; code: string }[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]"); return Array.isArray(saved) ? saved.slice(0, 16) : []; } catch { return []; }
  });
  const videos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const history = useLibrary((s) => s.history);
  useEffect(() => { localStorage.setItem("reelcase.profile-name", name.trim() || "Host"); }, [name]);
  const [sharedVideoId, setSharedVideoId] = useState(
    () => videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "",
  );
  const sharedVideo = videos.find((video) => video.id === sharedVideoId);
  const roomVideoRef = useRef<HTMLVideoElement>(null);
  const lastRoomTick = useRef(0);
  const room = activeRoom ?? "";
  const p2p = useP2PRoom(room, name.trim() || "Guest");
  // A room must not advertise catalog-only local records as playable. Browser
  // File handles need an explicit resolved source first, so show only videos
  // that already have a usable embedded or direct media URL here.
  const roomCandidates = useMemo(() => {
    const played = new Set(history.map((entry) => entry.id));
    return videos
      .filter((video) => Boolean(video.remote?.embedUrl || video.src))
      .sort((a, b) => Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || Number(played.has(b.id)) - Number(played.has(a.id)) || b.addedAt - a.addedAt);
  }, [favorites, history, videos]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
    if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
    setRoomInput(invitedRoom);
    if (params.get("theater") === "1") {
      setJoinedAsGuest(true);
      setStageSize("cinema");
      setActiveRoom(invitedRoom);
    }
  }, []);
  useEffect(() => {
    if (!p2p.peers.length) return;
    p2p.send({
      type: "room-state",
      playing: playback.playing,
      position: playback.position,
      videoId: sharedVideoId,
      queue,
    });
  }, [p2p.peers.length]);
  useEffect(
    () =>
      p2p.onMessage((from, raw) => {
        const data = raw as {
          type?: string;
          text?: string;
          name?: string;
          playing?: boolean;
          position?: number;
          sentAt?: number;
          videoId?: string;
          queue?: string[];
        };
        if (data.type === "chat" && data.text)
          setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
        if (data.type === "sync") {
          const position = Number(data.position) || 0;
          const elapsed = data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1000) : 0;
          setPlayback({ playing: Boolean(data.playing), position: position + elapsed });
        }
        if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
        if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
        if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({ ...votes, [data.name!]: Number(data.position) || 0 }));
        if (data.type === "room-state") {
          if (data.videoId) setSharedVideoId(data.videoId);
          if (Array.isArray(data.queue)) setQueue(data.queue);
          const position = Number(data.position) || 0;
          const elapsed = data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1000) : 0;
          setPlayback({ playing: Boolean(data.playing), position: position + elapsed });
        }
        if (data.type === "resync-request" && !joinedAsGuest) {
          const position = roomVideoRef.current?.currentTime ?? playback.position;
          p2p.send({ type: "room-state", playing: !roomVideoRef.current?.paused && playback.playing, position, videoId: sharedVideoId, queue, sentAt: Date.now() }, from);
        }
      }),
    [joinedAsGuest, p2p.onMessage, p2p.send, playback.playing, playback.position, queue, sharedVideoId],
  );
  const sync = (next: { playing: boolean; position: number }) => {
    setPlayback(next);
    p2p.send({ type: "sync", ...next, sentAt: Date.now() });
  };
  const resync = () => {
    if (joinedAsGuest) {
      p2p.send({ type: "resync-request" });
      setInviteNotice("Requested the host’s current room state.");
      return;
    }
    const position = roomVideoRef.current?.currentTime ?? playback.position;
    sync({ playing: roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing, position });
    p2p.send({ type: "room-state", playing: roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing, position, videoId: sharedVideoId, queue, sentAt: Date.now() });
    setInviteNotice("Sent the current video and timeline to every guest.");
  };
  const copyInvite = async () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&theater=1`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteNotice("Theater invitation link copied.");
    } catch {
      setInviteNotice(`Share this theater link: ${link}`);
    }
  };
  useEffect(() => {
    const media = roomVideoRef.current;
    if (!media || !sharedVideo || sharedVideo.remote) return;
    const driftLimit = playback.playing ? 0.65 : 0.1;
    if (Math.abs(media.currentTime - playback.position) > driftLimit)
      media.currentTime = playback.position;
    if (playback.playing && media.paused) void media.play().catch(() => {});
    if (!playback.playing && !media.paused) media.pause();
  }, [playback, sharedVideo]);
  const chooseVideo = (video: LibraryVideo) => {
    setSharedVideoId(video.id);
    setPlayback({ playing: false, position: 0 });
    p2p.send({ type: "video", videoId: video.id });
    p2p.send({ type: "sync", playing: false, position: 0 });
  };
  const updateQueue = (next: string[]) => {
    setQueue(next);
    p2p.send({ type: "queue", queue: next });
  };
  const queueVideo = (video: LibraryVideo) => {
    if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]);
  };
  const playNext = () => {
    const nextId = queue[0];
    if (!nextId) return;
    const next = videos.find((video) => video.id === nextId);
    updateQueue(queue.slice(1));
    if (next) chooseVideo(next);
  };
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setChat((rows) => [...rows, `You: ${text}`].slice(-50));
    p2p.send({ type: "chat", text, name: name.trim() || "Guest" });
    setMessage("");
  };
  if (!activeRoom)
    return (
      <HubShell
        eyebrow="LAN watch room"
        icon={<Users className="size-4" />}
        title="Watch together, on your terms."
        copy="Create a private room code or join one on the same network. Peers connect directly; names, chat, and playback commands stay in the room."
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Create a room
            </p>
            <p className="mt-3 font-mono text-3xl tracking-[0.16em] text-fg">{roomCode}</p>
            <p className="mt-2 text-sm text-muted">
              Share this code only with people you want in your watch room.
            </p>
            <Button variant="secondary" className="mt-3 w-full" onClick={() => void copyInvite()}>
              <Copy className="size-4" /> Copy theater invitation link
            </Button>
            {inviteNotice && <p className="mt-2 break-all text-xs text-accent">{inviteNotice}</p>}
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setJoinedAsGuest(false);
                setActiveRoom(roomCode);
              }}
            >
              <Wifi className="size-4" /> Start room
            </Button>
          </div>
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Join a theater
            </p>
            <p className="mt-2 text-sm text-muted">
              Guests enter a focused theater view first; controls and chat stay available beside the
              screen.
            </p>
            <Input
              className="mt-3"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value.toUpperCase())}
              placeholder="Enter room code"
              aria-label="Watch room code"
            />
            <Input
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your display name"
              aria-label="Your display name"
            />
            <Button
              variant="secondary"
              className="mt-3 w-full"
              disabled={!roomInput.trim()}
              onClick={() => {
                setJoinedAsGuest(true);
                setStageSize("cinema");
                setActiveRoom(roomInput.trim());
              }}
            >
              Join theater
            </Button>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local friends</p>
              <p className="mt-1 text-xs leading-5 text-muted">Save a trusted friend name and their current room code for one-tap joining on this network.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><Input value={friendName} onChange={(event) => setFriendName(event.target.value)} placeholder="Friend name" aria-label="Friend name"/><Input value={friendCode} onChange={(event) => setFriendCode(event.target.value.toUpperCase())} placeholder="Room code" aria-label="Friend room code"/></div>
              <Button size="sm" variant="secondary" className="mt-2" disabled={!friendName.trim() || !friendCode.trim()} onClick={() => { const next = [{ name: friendName.trim(), code: friendCode.trim() }, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16); setFriends(next); localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next)); setFriendName(""); setFriendCode(""); }}>Save friend</Button>
              {friends.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{friends.map((friend) => <Button key={`${friend.name}-${friend.code}`} size="sm" variant="secondary" onClick={() => { setRoomInput(friend.code); setName(friend.name); }}>{friend.name} · {friend.code}</Button>)}</div>}
            </div>
          </div>
        </div>
      </HubShell>
    );
  return (
    <HubShell
      eyebrow="Connected watch room"
      icon={<Users className="size-4" />}
      title={joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`}
      copy={
        joinedAsGuest
          ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles."
          : "Direct peer connection for your selected guests. Playback events are synchronized across connected devices."
      }
    >
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
        <div className="min-w-0 rounded-lg bg-elevated p-5 shadow-border">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Synchronized playback
            </p>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Radio className={`size-3 ${p2p.joined ? "text-accent" : "text-subtle"}`} />
              {p2p.joined ? "Signaling online" : "Connecting…"}
            </span>
          </div>
          <h2 className="mt-2 font-display text-3xl text-fg">
            {playback.playing ? "Playing together" : "Paused together"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Timeline {Math.floor(playback.position / 60)}:
            {String(Math.floor(playback.position % 60)).padStart(2, "0")} · controls are sent to
            every connected guest.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => sync({ ...playback, playing: !playback.playing })}>
              {playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playback.playing ? "Pause" : "Play"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: Math.max(0, playback.position - 15) })}
            >
              −15 sec
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: playback.position + 15 })}
            >
              +15 sec
            </Button>
            <Button variant="secondary" onClick={resync}>
              <Wifi className="size-4" /> {joinedAsGuest ? "Request resync" : "Resync guests"}
            </Button>
            <Button variant="ghost" size="sm" disabled={!queue.length} onClick={playNext}>
              Play next {queue.length ? `(${queue.length})` : ""}
            </Button>
          </div>
          {inviteNotice && <p className="mt-3 text-xs text-accent">{inviteNotice}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Stage size</span>
            {(["compact", "theater", "cinema"] as const).map((size) => (
              <Button
                key={size}
                size="sm"
                variant={stageSize === size ? "default" : "secondary"}
                onClick={() => setStageSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
          <div
            className={`mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-2xl" : stageSize === "theater" ? "lg:max-w-6xl" : ""}`}
          >
            {sharedVideo?.remote?.embedUrl ? (
              <iframe
                title={sharedVideo.name}
                src={`${sharedVideo.remote.embedUrl}${sharedVideo.remote.embedUrl.includes("?") ? "&" : "?"}autoplay=0&rel=0`}
                className="aspect-video w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : sharedVideo?.src ? (
              <video
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={sharedVideo.src}
                controls
                onEnded={playNext}
                onPlay={() =>
                  sync({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onPause={() =>
                  sync({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onSeeked={() =>
                  sync({
                    playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
                    position: roomVideoRef.current?.currentTime ?? 0,
                  })
                }
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (!media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-muted">
                Choose a starter movie or an online video to show it to the room.
              </div>
            )}
          </div>
          {sharedVideo?.remote?.embedUrl ? (
            <p className="mt-2 text-xs text-subtle">
              Embedded services show the selected title for everyone; exact timestamp sync is
              available for local and library video files.
            </p>
          ) : null}
          <p className="mt-3 text-xs text-muted">Recommended from your playable library — favorites and recently watched titles appear first. Local catalog entries without a resolved browser media source stay out to avoid broken room cards.</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {roomCandidates
              .slice(0, 18)
              .map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => chooseVideo(video)}
                  className={`w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`}
                >
                  {video.poster ? (
                    <img src={video.poster} alt="" className="aspect-video w-full object-cover" />
                  ) : null}
                  <span className="block truncate px-2 py-2 text-xs">{video.name}</span>
                </button>
              ))}
          </div>
          <div className="mt-3 rounded-md bg-bg/45 p-3 shadow-border">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-fg">Up next queue</p>
              <span className="text-xs text-muted">Hosts can order the room playlist</span>
            </div>
            {queue.length ? (
              <div className="mt-2 space-y-2">
                {queue.map((id, index) => {
                  const video = videos.find((item) => item.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-sm bg-elevated px-3 py-2"
                    >
                      <span className="min-w-0 truncate text-sm text-fg">
                        {index + 1}. {video?.name ?? "Unavailable title"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...queue];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            updateQueue(next);
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQueue(queue.filter((item) => item !== id))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted">
                Choose “Add next” below to build the shared queue.
              </p>
            )}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {roomCandidates
                    .filter((video) => video.id !== sharedVideoId)
                .slice(0, 12)
                .map((video) => (
                  <Button
                    key={video.id}
                    size="sm"
                    variant="secondary"
                    disabled={queue.includes(video.id)}
                    onClick={() => queueVideo(video)}
                  >
                    Add next · {video.name}
                  </Button>
                ))}
            </div>
          </div>
          <div className="mt-5 rounded-md bg-bg/45 p-4 shadow-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-accent" />
              <p className="text-sm font-medium text-fg">Share local video</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Choose a file only when every guest has permission to view it. Guests confirm access
              before you start sharing.
            </p>
            <label className="mt-3 block">
              <input
                className="sr-only"
                type="file"
                accept="video/*"
                onChange={(event) => setLocalVideo(event.target.files?.[0] ?? null)}
              />
              <span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border">
                {localVideo ? localVideo.name : "Choose local video"}
              </span>
            </label>
            <label className="mt-3 flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={guestAccess}
                onChange={(event) => setGuestAccess(event.target.checked)}
              />
              <span>
                I confirm guests have access to this video and may receive this direct share.
              </span>
            </label>
            <Button
              size="sm"
              className="mt-3"
              disabled={!localVideo || !guestAccess || !p2p.peers.length}
              onClick={() => p2p.send({ type: "share-ready", name: localVideo?.name })}
            >
              Send sharing request
            </Button>
          </div>
          <div className="mt-4 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="text-sm font-medium text-fg">Watch-party mini games</p>
            <p className="mt-1 text-xs text-muted">Start a lightweight shared vote while the room is paused. Votes are sent to connected guests.</p>
            <Input className="mt-3" value={partyPrompt} onChange={(event) => setPartyPrompt(event.target.value)} aria-label="Party vote question" />
            <div className="mt-3 flex flex-wrap gap-2">{Object.keys(partyVotes).map((choice) => <Button key={choice} size="sm" variant="secondary" onClick={() => { const next = (partyVotes[choice] ?? 0) + 1; setPartyVotes((votes) => ({ ...votes, [choice]: next })); p2p.send({ type: "party-vote", name: choice, position: next }); }}>{choice} · {partyVotes[choice] ?? 0}</Button>)}</div>
            <p className="mt-3 text-xs text-accent">Now voting: {partyPrompt}</p>
          </div>
          <div className="mt-3 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="flex items-center gap-2 text-sm font-medium text-fg">
              <MonitorPlay className="size-4 text-accent" />
              Roku handoff
            </p>
            <ol className="mt-2 space-y-1 text-xs text-muted">
              <li>
                <span className="mr-2 text-accent">1.</span>On Roku, open Settings → Network → About
                and copy its IP address.
              </li>
              <li>
                <span className="mr-2 text-accent">2.</span>Enter it below to save this TV as a
                trusted handoff target.
              </li>
              <li>
                <span className="mr-2 text-accent">3.</span>Launch the channel and copy the room
                invitation to your Roku browser or companion app.
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={rokuAddress}
                onChange={(event) => {
                  setRokuAddress(event.target.value);
                  setRokuReady(false);
                }}
                placeholder="Roku IP address, e.g. 192.168.1.24"
                aria-label="Roku IP address"
              />
              <Button
                variant="secondary"
                disabled={!rokuAddress.trim()}
                onClick={() => {
                  setRokuReady(true);
                  localStorage.setItem("reelcase.roku", rokuAddress.trim());
                }}
              >
                Save & pair TV
              </Button>
              <Button variant="secondary" onClick={() => void (async () => {
                try {
                  const response = await fetch("http://127.0.0.1:43123/roku/discover");
                  const data = await response.json() as { devices?: { address: string; location: string }[] };
                  const devices = data.devices ?? [];
                  setRokuDevices(devices);
                  setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
                } catch { setRokuNotice("Roku discovery needs the local Reelcase Companion running on this Windows computer."); }
              })()}>
                Discover TVs
              </Button>
            </div>
            {rokuNotice && <p className="mt-2 text-xs text-muted">{rokuNotice}</p>}
            {rokuDevices.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{rokuDevices.map((device) => <Button key={device.address} size="sm" variant="secondary" onClick={() => { setRokuAddress(device.address); setRokuReady(true); localStorage.setItem("reelcase.roku", device.address); }}>{device.address}</Button>)}</div>}
            {rokuReady && (
              <div className="mt-3 rounded-sm bg-elevated p-3">
                <span className="text-xs text-accent">Step 3 ready · {rokuAddress}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
                      window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
                      navigator.clipboard?.writeText(url).catch(() => {});
                    }}
                  >
                    Launch & copy room link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRokuReady(false);
                      localStorage.removeItem("reelcase.roku");
                    }}
                  >
                    Forget TV
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-elevated p-4 shadow-border">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <MessageCircle className="size-4 text-accent" /> Room chat
          </p>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-muted">
            {chat.map((row, index) => (
              <p key={`${row}-${index}`} className="rounded-sm bg-bg/45 px-3 py-2">
                {row}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Say something"
              aria-label="Room chat message"
            />
            <Button size="sm" onClick={send}>
              Send
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-4 shadow-border">
        <p className="text-sm font-medium text-fg">Guests & connection status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
            You · {p2p.joined ? "ready" : "joining"}
          </span>
          {p2p.peers.length ? (
            p2p.peers.map((peer) => (
              <span key={peer.id} className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
                {peer.name || "Guest"} · {peer.connectionState}
                {peer.rttMs ? ` · ${peer.rttMs}ms` : ""}
              </span>
            ))
          ) : (
            <span className="text-xs text-subtle">
              Waiting for guests to join with the room code.
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Display name"
            className="max-w-56"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveRoom(null);
              setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
            }}
          >
            Leave room
          </Button>
        </div>
      </div>
    </HubShell>
  );
}

function HubShell({
  eyebrow,
  icon,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8">
      <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {icon} {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{copy}</p>
      {children}
    </section>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-elevated px-4 py-4 shadow-border">
      <p className="font-mono text-2xl tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
function ServiceLink({ name, href, copy }: { name: string; href: string; copy: string }) {
  return (
    <a
      href={href}
      className="rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
    >
      <p className="font-display text-2xl text-fg">{name}</p>
      <p className="mt-1 text-sm text-muted">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        Open <ExternalLink className="size-4" />
      </span>
    </a>
  );
}
function InfoCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">{icon}</span>
      <h2 className="mt-3 font-display text-2xl text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </div>
  );
}
