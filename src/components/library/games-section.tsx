import {useCompanionSupport} from './use-companion-support';
import { companionFetch, companionLaunchGame, companionLaunchHistory, type GameLaunchReceipt } from '@/lib/companion';
import { useEffect, useRef, useState } from "react";
import { Download, ExternalLink, Gamepad2, ImagePlus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCompanionIcons, iconsFromFolderFiles, loadGameIconCache, saveGameIcon } from "@/lib/game-icons";
import { Input } from "@/components/ui/input";
import { companionSteamEpicGames } from "@/lib/companion";
import { useSourceAssets } from "@/lib/source-assets";
import { readHub, writeHub, downloadCsv, HubShell, ServiceLink } from './hub-shared';
import type { LocalItem } from './hub-shared';

function gameKind(item: LocalItem) {
  if (item.launchUrl) return "web-ready" as const;
  if (/\.url$/i.test(item.name)) return "web-needs-target" as const;
  if (/\.lnk$/i.test(item.name)) return "desktop-shortcut" as const;
  if (/\.appref-ms$/i.test(item.name)) return "desktop-app" as const;
  return "desktop-executable" as const;
}

function isWebGame(item: LocalItem) { return gameKind(item).startsWith("web-"); }

function isGameHelper(item: LocalItem) {
  const value = `${item.name} ${item.path}`.toLowerCase();
  return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}

function gameBadge(item: LocalItem) {
  if (item.launchUrl?.startsWith("steam:")) return "STEAM";
  if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
  if (gameKind(item) === "web-needs-target") return "LINK?";
  if (gameKind(item) === "web-ready") return "WEB";
  if (/\.appref-ms$/i.test(item.name)) return "APP";
  if (/\.lnk$/i.test(item.name)) return "LINK";
  return "GAME";
}

export function GamesSection() {
  const support=useCompanionSupport();
  const [games, setGames] = useState<LocalItem[]>([]);
  const [filter, setFilter] = useState("");
  const [removeGame, setRemoveGame] = useState<string | null>(null);
  const [launchNotice, setLaunchNotice] = useState("");
  const [launches,setLaunches]=useState<GameLaunchReceipt[]>([]),[historyLoading,setHistoryLoading]=useState(false),[launching,setLaunching]=useState<string[]>([]);
  const pendingLaunches=useRef(new Set<string>());
  const [shortcutView, setShortcutView] = useState<"all" | "ready" | "desktop" | "unknown">("all");
  const [fileType, setFileType] = useState("all");
  const [sort, setSort] = useState<"name" | "newest" | "type">("name");
  const [companionLoading, setCompanionLoading] = useState(false);
  const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
  const [iconPulling, setIconPulling] = useState(false);
  useEffect(() => {
    const saved = readHub().games;
    const icons = loadGameIconCache();
    setGames(saved.map((game) => ({ ...game, iconData: game.iconData || icons[game.path] })));
  }, []);
  const saveGames = (next: LocalItem[]) => {
    // Keep hub metadata lean — icon data URLs live in reelcase.game-icons.v1.
    const slim = next.map(({ iconData, ...rest }) => {
      if (iconData) saveGameIcon(rest.path, iconData);
      return rest;
    });
    setGames(next);
    const hub = readHub();
    writeHub({ ...hub, games: slim });
  };
  const mergeIcons = (current: LocalItem[], iconMap: Map<string, string>) =>
    current.map((game) => {
      const icon = iconMap.get(game.path);
      return icon ? { ...game, iconData: icon } : game;
    });
  const pullMissingIcons = async (list: LocalItem[]) => {
    const missing = list.filter((game) => !game.iconData).map((game) => game.path);
    if (!missing.length||!support.can('shortcut-icons')) return list;
    setIconPulling(true);
    try {
      const iconMap = await fetchCompanionIcons(missing);
      if (!iconMap.size) return list;
      const next = mergeIcons(list, iconMap);
      saveGames(next);
      return next;
    } finally {
      setIconPulling(false);
    }
  };
  const add = async (files: FileList | File[] | null, allowWebShortcut = false) => {
    if (!files) return;
    const allFiles = Array.from(files);
    const source = allFiles.filter((file) =>
      allowWebShortcut
        ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name)
        : /\.(exe|lnk|url|appref-ms)$/i.test(file.name),
    );
    const folderIcons = await iconsFromFolderFiles(allFiles);
    const next = await Promise.all(
      source.map(async (file) => {
        let launchUrl: string | undefined;
        if (/\.url$/i.test(file.name)) {
          const match = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im);
          launchUrl = match?.[1];
        }
        const path = file.webkitRelativePath || file.name;
        const iconData = folderIcons.get(path.replace(/\\/g, "/")) || folderIcons.get(path);
        if (iconData) saveGameIcon(path, iconData);
        return {
          name: file.name,
          path,
          size: file.size,
          addedAt: Date.now(),
          launchUrl,
          iconData,
        };
      }),
    );
    let merged: LocalItem[] = [];
    setGames((current) => {
      merged = [
        ...current,
        ...next.filter((item) => !current.some((game) => game.path === item.path)),
      ];
      const hub = readHub();
      writeHub({ ...hub, games: merged.map(({ iconData: _icon, ...rest }) => rest) });
      return merged;
    });
    // Companion can still fill Windows shell icons for paths under approved roots.
    void pullMissingIcons(merged.length ? merged : next);
  };
  useEffect(() => { if (sourceShortcuts.length) void add(sourceShortcuts, true); }, [sourceShortcuts]);
  const launchDesktop = async (game: LocalItem) => {
    if(pendingLaunches.current.has(game.path))return;
    pendingLaunches.current.add(game.path);setLaunching([...pendingLaunches.current]);
    try {
      const result=await companionLaunchGame(game.path);
      if(result.receipt){const receipt=result.receipt;setLaunches(rows=>[receipt,...rows.filter(row=>row.id!==receipt.id)].slice(0,50));setLaunchNotice((receipt.reused?'Reused recent launch request. ':'')+receipt.detail);}
      else setLaunchNotice(result.ok?'Launch request accepted by Companion. Game readiness is unverified. Update Companion for saved launch receipts.':result.error??'The companion could not launch this item.');
    } catch {setLaunchNotice('Desktop launch needs Realhub Companion on this computer and a shortcut inside an approved Windows folder.');}
    finally{pendingLaunches.current.delete(game.path);setLaunching([...pendingLaunches.current]);}
  };
  const reviewLaunches=async()=>{
    if(historyLoading)return;setHistoryLoading(true);
    try{const result=await companionLaunchHistory();if(!result.ok)throw Error(result.error||'Launch history is unavailable.');setLaunches((result.receipts??[]).slice(0,50));setLaunchNotice(result.persistent===false?'Launch receipts could not be saved. Check Companion storage before launching.':'Launch receipts refreshed. Accepted requests do not verify game readiness.');}
    catch(error){setLaunchNotice(error instanceof Error?error.message:'Companion launch history is unavailable.');}
    finally{setHistoryLoading(false);}
  };
  const loadApprovedShortcuts = async () => {
    setCompanionLoading(true);
    try {
      const response = await companionFetch("/shortcuts?limit=300");
      const result = await response.json() as { ok?: boolean; shortcuts?: Array<{ name: string; path: string; launchUrl?: string }>; error?: string };
      if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
      const cachedIcons = loadGameIconCache();
      const next = (result.shortcuts ?? []).map((item) => ({
        ...item,
        size: 0,
        addedAt: Date.now(),
        iconData: cachedIcons[item.path],
      }));
      let merged: LocalItem[] = [];
      setGames((current) => {
        // Refresh existing rows too: legacy .url entries may have been saved
        // before the companion could safely surface their readable target.
        const incoming = new Map(next.map((item) => [item.path, item]));
        merged = [
          ...current.map((game) => {
            const refreshed = incoming.get(game.path);
            return refreshed ? { ...game, ...refreshed, iconData: game.iconData || refreshed.iconData } : game;
          }),
          ...next.filter((item) => !current.some((game) => game.path === item.path)),
        ];
        writeHub({ ...readHub(), games: merged.map(({ iconData: _icon, ...rest }) => rest) });
        return merged;
      });
      const withIcons = await pullMissingIcons(merged.length ? merged : next);
      const got = withIcons.filter((game) => game.iconData).length;
      setLaunchNotice(
        next.length
          ? `Added ${next.length} approved desktop shortcuts · ${got} icons cached. Desktop launch still needs the companion.`
          : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.",
      );
    } catch {
      setLaunchNotice("Companion connection unavailable. Start the local Realhub Companion, then try again.");
    } finally { setCompanionLoading(false); }
  };
  const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
  const visible = games
    .filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`)))
    .filter((game) => shortcutView === "all" || !isGameHelper(game))
    .sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop()!.localeCompare(b.name.split(".").pop()!) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  return (
    <HubShell
      eyebrow="Desktop game shelf"
      icon={<Gamepad2 className="size-4" />}
      title="A clearer game drawer."
      copy="Choose a dedicated games folder (icons from sibling .ico/.png), load approved Desktop shortcuts through the companion (shell icons + folder art), or set a cover manually. Web shortcuts open directly; desktop launchers need the companion."
    >
      <section aria-label="Desktop platform support" className="mt-5 rounded-lg border border-border p-4"><p role="status" className="text-xs leading-5 text-muted">{support.note}</p><Button size="sm" variant="secondary" className="mt-2 min-h-11" onClick={support.refresh}>Refresh desktop support</Button></section>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            accept=".url"
            onChange={(event) => void add(event.target.files, true)}
          />
          <span className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
            Add web game shortcut
          </span>
        </label>
        <Button variant="secondary" className="min-h-11 max-w-full whitespace-normal" disabled={companionLoading||!support.can('shortcut-catalog')} onClick={() => void loadApprovedShortcuts()}>
          {companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"}
        </Button>
        <Button variant="secondary" disabled={companionLoading||!support.can('steam-epic-catalog')} onClick={() => void (async () => {
          setCompanionLoading(true);
          try {
            const listed = await companionSteamEpicGames(250);
            if (!listed.length) {
              setLaunchNotice("No Steam/Epic libraries under approved roots. Add the Steam or Epic Games folder to REELCASE_ALLOWED_ROOTS.");
              return;
            }
            const next: LocalItem[] = listed.map((game) => ({
              name: game.name,
              path: game.path,
              size: 0,
              addedAt: Date.now(),
            }));
            setGames((current) => {
              const merged: LocalItem[] = [
                ...current,
                ...next.filter((item) => !current.some((game) => game.path === item.path)),
              ];
              const hubState = readHub();
              writeHub({ ...hubState, games: merged.map(({ iconData: _icon, ...rest }) => rest) });
              return merged;
            });
            setLaunchNotice(`Loaded ${listed.length} Steam/Epic title${listed.length === 1 ? "" : "s"} from known install dirs under approved roots.`);
            void pullMissingIcons(next);
          } finally {
            setCompanionLoading(false);
          }
        })()}>
          Load Steam / Epic from approved roots
        </Button>
        <Button
          variant="secondary"
          disabled={!support.can('shortcut-icons') || iconPulling || companionLoading || !games.some((game) => !game.iconData)}
          onClick={() => void (async () => {
            const next = await pullMissingIcons(games);
            const filled = next.filter((game) => game.iconData).length - games.filter((game) => game.iconData).length;
            setLaunchNotice(filled > 0 ? `Pulled ${filled} desktop icon${filled === 1 ? "" : "s"} via companion / folder art.` : "No new icons found. Start the companion or add .ico/.png next to launchers.");
          })()}
        >
          {iconPulling ? "Pulling icons…" : "Pull missing icons"}
        </Button>
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
            onChange={(event) => void add(event.target.files)}
          />
          <span className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm bg-elevated px-4 text-sm text-fg shadow-border">
            Choose game folder
          </span>
        </label>
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="min-h-11 w-full min-w-0 sm:w-64"
          placeholder="Filter your games"
          aria-label="Filter games"
        />
        {(["all", "ready", "desktop", "unknown"] as const).map((view) => <Button key={view} size="sm" variant={shortcutView === view ? "default" : "secondary"} onClick={() => setShortcutView(view)}>{view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"}</Button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">File type</span><Button size="sm" variant={fileType === "all" ? "default" : "secondary"} onClick={() => setFileType("all")}>All types</Button>{gameTypes.map((type) => <Button key={type} size="sm" variant={fileType === type ? "default" : "secondary"} onClick={() => setFileType(type)}>.{type}</Button>)}<span className="ml-2 text-xs text-muted">Sort</span>{(["name", "newest", "type"] as const).map((value) => <Button key={value} size="sm" variant={sort === value ? "default" : "secondary"} onClick={() => setSort(value)}>{value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"}</Button>)}</div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted"><span>{visible.length} shown · {games.filter((game) => gameKind(game) === "web-needs-target").length} web shortcuts need a readable target</span><Button size="sm" variant="ghost" onClick={() => downloadCsv([["name", "path", "kind", "extension", "launch_ready", "helper", "added_at"], ...games.map((game) => [game.name, game.path, gameKind(game), game.name.split(".").pop() ?? "", Boolean(game.launchUrl), isGameHelper(game), new Date(game.addedAt).toISOString()])], `reelcase-games-debug-${new Date().toISOString().slice(0, 10)}.csv`)}><Download className="size-3" /> Export game debug CSV</Button></div>
      {visible.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visible.map((game) => (
            <div
              key={game.path}
              className="flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent">
                {game.iconData ? (
                  <img src={game.iconData} alt="" className="size-full object-cover" />
                ) : (
                  gameBadge(game)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-fg">
                  {game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm" className="min-h-11"
                    disabled={launching.includes(game.path)||(!game.launchUrl&&!support.can('launch'))} aria-label={"Launch "+game.name}
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
                      if (gameKind(game) === "web-needs-target") { void launchDesktop(game); return; }
                      void launchDesktop(game);
                    }}
                  >
                    <Rocket className="size-3" />
                    {launching.includes(game.path) ? "Requesting launch…" : gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"}
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
                        reader.onload = () => {
                          const iconData = String(reader.result);
                          saveGameIcon(game.path, iconData);
                          saveGames(
                            games.map((item) =>
                              item.path === game.path
                                ? { ...item, iconData }
                                : item,
                            ),
                          );
                        };
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
      <section aria-label="Game launch receipts" className="mt-6 rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-medium text-fg">Recent launch requests</h2><p className="mt-1 text-xs leading-5 text-muted">Stored on this computer by Companion. A request can be accepted while the game is still loading. Game readiness is unverified.</p></div><Button variant="secondary" className="min-h-11" disabled={historyLoading||!support.can('launch-receipts')} onClick={()=>void reviewLaunches()}>{historyLoading?'Checking launch receipts…':'Review launch receipts'}</Button></div>
        {!launches.length && <p className="mt-3 text-sm text-muted">Launch a desktop game or review saved receipts. Nothing launches when you review.</p>}
        <ul className="mt-3 divide-y divide-border">{launches.slice(0,6).map(receipt=><li key={receipt.id} className="py-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="min-w-0 break-all text-sm font-medium">{receipt.name}</span><span className="rounded border border-border px-2 py-1 text-xs text-muted">{receipt.status==='accepted'?'Request accepted':receipt.status==='failed'?'Launch failed':receipt.status==='interrupted'?'Check before retry':'Pending request'}</span></div><p className="mt-1 text-xs leading-5 text-muted">{receipt.detail}</p><p className="mt-1 text-xs text-muted">{new Date(receipt.at).toLocaleString()} · {receipt.launcherExit===0?'Launcher exited successfully':'Launcher readiness unverified'}{receipt.reused?' · Reused recent request':''}</p>{!receipt.persistent&&<p className="mt-1 text-xs text-muted">Receipt storage is unavailable. Check Companion before another launch.</p>}</li>)}</ul>
      </section>
      {launchNotice && <p role="status" className="mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border">{launchNotice}</p>}
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
