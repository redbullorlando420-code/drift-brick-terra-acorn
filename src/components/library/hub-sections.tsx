import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Box,
  Clapperboard,
  Download,
  ExternalLink,
  Gamepad2,
  MessageCircle,
  PackageSearch,
  Search,
  Settings2,
  ShoppingBag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";

type LocalItem = { name: string; path: string; size: number; addedAt: number };
type HubStore = { prints: LocalItem[]; games: LocalItem[] };
const HUB_KEY = "reelcase.hub.v1";

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
  useEffect(() => setHub(readHub()), []);
  useEffect(() => { try { setPreferences(JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}") as Record<string, boolean>); } catch { setPreferences({}); } }, []);
  const togglePreference = (key: string) => { const next = { ...preferences, [key]: !preferences[key] }; setPreferences(next); localStorage.setItem("reelcase.settings.v1", JSON.stringify(next)); };
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
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Local preferences</h2><p className="mt-1 text-sm text-muted">These controls are stored only in this browser.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{[{ key: "autoplay", label: "Autoplay next video", detail: "Continue through a playlist." }, { key: "theater", label: "Theater mode", detail: "Prefer a wider player layout." }, { key: "captions", label: "Prefer captions", detail: "Use captions when a remote player offers them." }, { key: "reduceMotion", label: "Reduce motion", detail: "Limit non-essential visual motion." }, { key: "insights", label: "Local recommendations", detail: "Use likes, tags, ratings, and history locally." }, { key: "watchNotifications", label: "Watch-room notices", detail: "Show local room reminders." }].map((item) => <button key={item.key} type="button" onClick={() => togglePreference(item.key)} className="flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border"><span><span className="block text-sm font-medium text-fg">{item.label}</span><span className="mt-0.5 block text-xs text-muted">{item.detail}</span></span><span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`}><span className={`size-5 rounded-full ${preferences[item.key] ? "bg-accent-fg" : "bg-muted"}`} /></span></button>)}</div></div>
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
    />
  );
}
export function GamesSection() {
  return (
    <LocalCatalog
      kind="games"
      eyebrow="Desktop game shelf"
      icon={<Gamepad2 className="size-4" />}
      title="Games on this computer"
      copy="Choose your Desktop games folder to build a private launch-list style catalog. Reelcase reads names only; browsers cannot launch local games."
      directory
      footer={
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
      }
    />
  );
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
  const encoded = encodeURIComponent(query.trim());
  const stores = useMemo(
    () => [
      { name: "Amazon", href: `https://www.amazon.com/s?k=${encoded}`, detail: "Search Amazon" },
      {
        name: "Walmart",
        href: `https://www.walmart.com/search?q=${encoded}`,
        detail: "Search Walmart",
      },
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
    </HubShell>
  );
}

export function StreamingSection() {
  const services = [
    { name: "Netflix", href: "https://www.netflix.com/", copy: "Movies & series" },
    { name: "Hulu", href: "https://www.hulu.com/", copy: "TV & films" },
    { name: "Crunchyroll", href: "https://www.crunchyroll.com/", copy: "Anime streaming" },
    {
      name: "Internet Archive",
      href: "https://archive.org/details/feature_films",
      copy: "Open & public-domain films",
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
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accounts.length ? (
          accounts.map((account) => (
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
            <a
              href={`https://x.com/${encodeURIComponent(active)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:text-fg"
            >
              Open in X <ExternalLink className="ml-1 inline size-3.5" />
            </a>
          </div>
          <iframe
            title={`X profile ${active}`}
            src={`https://x.com/${encodeURIComponent(active)}`}
            className="h-120 w-full bg-bg"
          />
          <p className="px-4 py-3 text-xs text-subtle">
            If X blocks an embedded profile, use “Open in X”; that restriction is controlled by X.
          </p>
        </div>
      )}
    </HubShell>
  );
}

export function WatchRoomSection() {
  const [ready, setReady] = useState({ ticket: false, popcorn: false, drinks: false });
  const [started, setStarted] = useState(false);
  const [chat, setChat] = useState<string[]>([
    "Room host: Choose the snacks, then start the feature.",
  ]);
  const [message, setMessage] = useState("");
  const complete = Object.values(ready).every(Boolean);
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setChat((rows) => [...rows, `You: ${text}`]);
    setMessage("");
  };
  return (
    <HubShell
      eyebrow="Local watch room"
      icon={<Users className="size-4" />}
      title="Movie night control room"
      copy="Run a friendly pre-show ritual before the feature. This local prototype keeps room state and chat in this browser; multi-device streaming requires an opt-in WebRTC relay and each guest’s legal access to the same video."
    >
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
            Pre-show mini game
          </p>
          <h2 className="mt-2 font-display text-3xl text-fg">Pack the theater kit</h2>
          <p className="mt-2 text-sm text-muted">
            Collect a ticket, popcorn, and drinks to unlock the start button.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {(
              [
                { key: "ticket", label: "Ticket", icon: <Ticket className="size-5" /> },
                { key: "popcorn", label: "Popcorn", icon: <PackageSearch className="size-5" /> },
                { key: "drinks", label: "Drinks", icon: <ShoppingBag className="size-5" /> },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setReady((state) => ({ ...state, [item.key]: !state[item.key] }))}
                className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-md shadow-border transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${ready[item.key] ? "bg-accent text-accent-fg" : "bg-bg/40 text-muted hover:text-fg"}`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <Button className="mt-5 w-full" disabled={!complete} onClick={() => setStarted(true)}>
            {started ? "Feature ready" : complete ? "Start movie room" : "Collect all three items"}
          </Button>
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
      <p className="mt-4 text-xs text-subtle">
        Local prototype: no video, files, chat messages, or IP address are shared outside this
        browser.
      </p>
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
    <section className="mx-auto max-w-4xl rounded-xl bg-surface p-5 shadow-border sm:p-8">
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
      target="_blank"
      rel="noreferrer"
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
