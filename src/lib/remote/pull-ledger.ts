export type PullProvider = "youtube" | "twitch" | "adult" | "photos" | "multi";
export type PullActivity = {
  id: string;
  provider: PullProvider;
  action: string;
  startedAt: number;
  targets: string[];
  done: number;
  total: number;
  received: number;
  added: number;
  failed: number;
  status: "running";
};
export type PullRecord = Omit<PullActivity, "status" | "done"> & {
  finishedAt: number;
  done: number;
  status: "success" | "partial" | "failed";
  errors?: string[];
};

const KEY = "reelcase.pull-history.v1";
const MAX_RECORDS = 100;

export function loadPullHistory(): PullRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((row): row is PullRecord => Boolean(row && typeof row === "object"
      && typeof row.id === "string" && typeof row.startedAt === "number"
      && typeof row.finishedAt === "number" && ["youtube", "twitch", "adult", "photos", "multi"].includes(row.provider)
      && ["success", "partial", "failed"].includes(row.status))).slice(0, MAX_RECORDS);
  } catch { return []; }
}

export function savePullHistory(records: PullRecord[]) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS))); } catch { /* Pull reporting must never interrupt playback or refresh. */ }
}

export function makePullId() { return `pull:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`; }
