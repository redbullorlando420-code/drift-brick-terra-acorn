/** Local cache for desktop game icons (data URLs). Kept separate from hub metadata to avoid blowing reelcase.hub.v1. */

const KEY = "reelcase.game-icons.v1";
const MAX_ENTRIES = 100;
const MAX_DATA_URL = 400_000; // ~300KB decoded

export function loadGameIconCache(): Record<string, string> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

export function saveGameIcon(path: string, iconData: string): void {
  if (!path || !iconData || iconData.length > MAX_DATA_URL) return;
  try {
    const all = loadGameIconCache();
    all[path] = iconData;
    const keys = Object.keys(all);
    if (keys.length > MAX_ENTRIES) {
      for (const drop of keys.slice(0, keys.length - MAX_ENTRIES)) delete all[drop];
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* quota — drop oldest half */
    try {
      const all = loadGameIconCache();
      const keys = Object.keys(all);
      for (const drop of keys.slice(0, Math.ceil(keys.length / 2))) delete all[drop];
      all[path] = iconData;
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
      /* storage unavailable */
    }
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("icon read failed"));
    reader.readAsDataURL(file);
  });
}

/** Match launcher files to sibling .ico/.png/.jpg in a folder FileList. */
export async function iconsFromFolderFiles(files: File[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const byStem = new Map<string, File>();
  const byDirStem = new Map<string, File>();
  for (const file of files) {
    if (!/\.(png|ico|jpe?g|webp)$/i.test(file.name)) continue;
    const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
    const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    byStem.set(stem, file);
    byDirStem.set(`${dir}::${stem}`, file);
    if (/^(icon|game|header|cover|logo)$/i.test(stem)) {
      byDirStem.set(`${dir}::__folder__`, file);
    }
  }
  for (const file of files) {
    if (!/\.(exe|lnk|url|appref-ms)$/i.test(file.name)) continue;
    const rel = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
    const stem = file.name.replace(/\.[^.]+$/, "").toLowerCase();
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    const iconFile =
      byDirStem.get(`${dir}::${stem}`) ||
      byStem.get(stem) ||
      byDirStem.get(`${dir}::__folder__`);
    if (!iconFile || iconFile.size > 1_200_000) continue;
    try {
      const data = await readFileAsDataUrl(iconFile);
      if (data.startsWith("data:image")) out.set(rel || file.name, data);
    } catch {
      /* skip unreadable */
    }
  }
  return out;
}

export async function fetchCompanionIcons(paths: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const pending = paths.filter(Boolean).slice(0, 40);
  if (!pending.length) return out;
  try {
    const response = await fetch("http://127.0.0.1:43123/shortcut-icons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paths: pending }),
    });
    const result = await response.json() as {
      ok?: boolean;
      icons?: Array<{ path: string; iconData?: string | null }>;
    };
    if (!result.ok || !result.icons) return out;
    for (const row of result.icons) {
      if (row.iconData?.startsWith("data:image")) {
        out.set(row.path, row.iconData);
        saveGameIcon(row.path, row.iconData);
      }
    }
  } catch {
    /* companion offline */
  }
  return out;
}
