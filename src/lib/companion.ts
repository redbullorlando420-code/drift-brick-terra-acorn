/** Thin client for the optional loopback Realhub Companion (127.0.0.1 only). */
import { CoalescedWriter } from "./coalesced-writer.ts";
import { allowAutomaticRefresh } from "./session-activity.ts";

export const COMPANION_ORIGIN = "http://127.0.0.1:43123";

export type CompanionHealth = {
  ok?: boolean;
  service?: string;
  version?: number;
  roots?: number;
  desktopEnabled?: boolean;
  ytDlp?: boolean;
  downloadRoot?: string | null;
  libraryPackRoot?: string | null;
  thumbCacheRoot?: string | null;
  printsRoot?: string | null;
  trayBadge?: number;
  capabilities?: string[];
};

async function companionFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${COMPANION_ORIGIN}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(10_000),
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

export async function companionHealth(): Promise<CompanionHealth | null> {
  try {
    const response = await companionFetch("/health");
    if (!response.ok) return null;
    return await response.json() as CompanionHealth;
  } catch {
    return null;
  }
}

export type CompanionMediaInspection = {
  requested: string;
  available: boolean;
  inspected?: boolean;
  reason?: string;
  duration?: number;
  bytes?: number;
  streams?: Array<{ type?: string; codec?: string; width?: number; height?: number }>;
  tags?: Partial<Record<"title" | "artist" | "album" | "genre" | "date" | "comment", string>>;
};

/**
 * Optional, local-only metadata inspection. The Companion independently
 * verifies every path is inside its approved roots and accepts at most 12.
 */
export async function companionInspectMedia(paths: string[]): Promise<{ ok: boolean; entries: CompanionMediaInspection[]; note?: string; error?: string }> {
  const boundedPaths = paths.filter((path): path is string => typeof path === "string" && Boolean(path.trim())).slice(0, 12);
  if (!boundedPaths.length) return { ok: false, entries: [], error: "No approved local files were selected." };
  try {
    const response = await companionFetch("/inspect-media", {
      method: "POST",
      body: JSON.stringify({ paths: boundedPaths }),
    });
    const data = await response.json() as { ok?: boolean; entries?: CompanionMediaInspection[]; note?: string; error?: string };
    return {
      ok: Boolean(response.ok && data.ok),
      entries: Array.isArray(data.entries) ? data.entries : [],
      ...(data.note ? { note: data.note } : {}),
      ...(data.error ? { error: data.error } : {}),
    };
  } catch {
    return { ok: false, entries: [], error: "Companion offline. Start it on this computer, then try again." };
  }
}

export type SteamEpicGame = {
  name: string;
  path: string;
  folder?: string;
  platform: "steam" | "epic" | string;
  iconPath?: string;
};

export async function companionSteamEpicGames(limit = 250): Promise<SteamEpicGame[]> {
  try {
    const response = await companionFetch(`/games/steam-epic?limit=${limit}`);
    const data = await response.json() as { ok?: boolean; games?: SteamEpicGame[] };
    return data.ok && Array.isArray(data.games) ? data.games : [];
  } catch {
    return [];
  }
}

export async function companionExportLibraryPack(files: Record<string, string>): Promise<{ ok: boolean; root?: string; written?: string[]; error?: string }> {
  try {
    const response = await companionFetch("/library-pack/export", {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    return await response.json() as { ok: boolean; root?: string; written?: string[]; error?: string };
  } catch {
    return { ok: false, error: "Companion offline." };
  }
}

export async function companionImportLibraryPack(): Promise<{ ok: boolean; root?: string; files?: Record<string, string>; error?: string }> {
  try {
    const response = await companionFetch("/library-pack/import");
    return await response.json() as { ok: boolean; root?: string; files?: Record<string, string>; error?: string };
  } catch {
    return { ok: false, error: "Companion offline." };
  }
}

export async function companionPutThumb(id: string, dataUrl: string): Promise<boolean> {
  try {
    const response = await companionFetch("/thumbs/put", {
      method: "POST",
      body: JSON.stringify({ id, dataUrl }),
    });
    const data = await response.json() as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function companionGetThumb(id: string): Promise<string | null> {
  try {
    const response = await companionFetch(`/thumbs/get?id=${encodeURIComponent(id)}`);
    if (!response.ok) return null;
    const data = await response.json() as { ok?: boolean; dataUrl?: string };
    return data.ok && data.dataUrl?.startsWith("data:image") ? data.dataUrl : null;
  } catch {
    return null;
  }
}

export type ArtworkAudit = { ok: boolean; error?: string; at?: number; startedAt?: number; truncated?: boolean; skipped?: number;
  sources?: Array<{ source: string; files: number; bytes: number; hits: number; misses: number; oldestAt: number | null }> };
export async function companionArtworkAudit(): Promise<ArtworkAudit> {
  try {
    const response = await companionFetch("/thumbs/audit", { signal: AbortSignal.timeout(5_000) });
    if (!response.ok) return { ok: false, error: "Restart the updated Companion to enable the artwork audit." };
    return await response.json() as ArtworkAudit;
  } catch { return { ok: false, error: "Companion is unavailable. Start it with an approved thumbnail cache folder to inspect disk artwork." }; }
}

export type CompanionPrintFile = { name: string; path: string; size: number; suffix?: string };

export async function companionListPrints(limit = 200): Promise<{ prints: CompanionPrintFile[]; printsRoot?: string | null }> {
  try {
    const response = await companionFetch(`/prints/list?limit=${limit}`);
    const data = await response.json() as { ok?: boolean; prints?: CompanionPrintFile[]; printsRoot?: string | null };
    return { prints: data.ok && Array.isArray(data.prints) ? data.prints : [], printsRoot: data.printsRoot };
  } catch {
    return { prints: [] };
  }
}

export async function companionReadPrint(path: string): Promise<{ ok: boolean; name?: string; path?: string; size?: number; dataBase64?: string; error?: string }> {
  try {
    const response = await companionFetch(`/prints/file?path=${encodeURIComponent(path)}`);
    return await response.json() as { ok: boolean; name?: string; path?: string; size?: number; dataBase64?: string; error?: string };
  } catch {
    return { ok: false, error: "Companion offline." };
  }
}

export async function companionSavePrint(name: string, dataBase64: string, dir?: string): Promise<{ ok: boolean; path?: string; error?: string }> {
  try {
    const response = await companionFetch("/prints/save", {
      method: "POST",
      body: JSON.stringify({ name, dataBase64, dir }),
    });
    return await response.json() as { ok: boolean; path?: string; error?: string };
  } catch {
    return { ok: false, error: "Companion offline." };
  }
}

export async function companionSetAutostart(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const response = await companionFetch("/tray/autostart", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    });
    return await response.json() as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: "Companion offline." };
  }
}

export async function companionAckJobs(): Promise<void> {
  try {
    await companionFetch("/jobs/ack", { method: "POST", body: "{}" });
  } catch {
    /* offline */
  }
}

const mirroredPosters = new Map<string, string>();
let posterRetryAt = 0;
const posterMirror = new CoalescedWriter<string, string>(async rows => {
  for (const [id, url] of rows) {
    if (!allowAutomaticRefresh() || Date.now() < posterRetryAt || mirroredPosters.get(id) === url) continue;
    try {
      const response = await companionFetch("/thumbs/cache-url", { method: "POST", body: JSON.stringify({ id, url }) });
      const data = await response.json() as { ok?: boolean };
      if (response.ok && data.ok) {
        mirroredPosters.delete(id);
        mirroredPosters.set(id, url);
        if (mirroredPosters.size > 256) mirroredPosters.delete(mirroredPosters.keys().next().value!);
      } else posterRetryAt = Date.now() + 60_000;
    } catch { posterRetryAt = Date.now() + 60_000; }
  }
}, { batchSize: 2, maxPending: 96, maxWeight: 256 * 1024, weight: url => url.length * 2 });

export async function companionCacheThumbUrl(id: string, url: string): Promise<boolean> {
  if (!id || !url || !allowAutomaticRefresh() || Date.now() < posterRetryAt) return false;
  if (mirroredPosters.get(id) === url) return true;
  await posterMirror.write(id, url);
  return mirroredPosters.get(id) === url;
}

export function getCompanionMemorySnapshot() { return { posters: posterMirror.snapshot(), rememberedPosters: mirroredPosters.size }; }
