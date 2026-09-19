/** Thin client for the optional loopback Reelcase Companion (127.0.0.1 only). */

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

export async function companionCacheThumbUrl(id: string, url: string): Promise<boolean> {
  try {
    const response = await companionFetch("/thumbs/cache-url", {
      method: "POST",
      body: JSON.stringify({ id, url }),
    });
    const data = await response.json() as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return false;
  }
}
