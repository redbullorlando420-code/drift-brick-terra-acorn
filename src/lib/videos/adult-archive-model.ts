import { ADULT_PULL_PROVIDERS, type AdultPullProvider } from "./adult-providers.ts";
export const ARCHIVE_LEDGER_KEY = "adult-archive-cursors:v1";
export const ARCHIVE_POSITION_LIMIT = 512;
export const ADULT_ARCHIVE_ORDERS = [
  "latest",
  "most-popular",
  "top-rated",
  "top-monthly",
  "top-weekly",
] as const;
export type AdultArchiveCursor = {
  page: number;
  query: string;
  order: string;
  updatedAt: number;
  offset?: number;
  retryAt?: number;
  paging?: 2;
  state?: "ready" | "exhausted" | "failed";
  added?: number;
  duplicates?: number;
  received?: number;
  rewound?: boolean;
  checkpointId?: string;
};
export type ArchivePosition = {
  provider: AdultPullProvider;
  cursor: AdultArchiveCursor;
  token: string;
  accepted: number;
};
export type ArchiveLedger = { version: 1; positions: Record<string, ArchivePosition> };
export type ArchiveCheckpoint = {
  version: 1;
  provider: AdultPullProvider;
  query: string;
  order: string;
  before: string | null;
  token: string;
  cursor: AdultArchiveCursor;
  acceptedIds: string[];
};
export const archiveQuery = (query: string) => query.trim().toLowerCase() || "all";
export const archiveLaneKey = (provider: string, query: string, order: string) =>
  `${provider}::${archiveQuery(query)}::${order}`;
const number = (value: unknown, max = 1e14) =>
  Number.isSafeInteger(value) && Number(value) >= 0 && Number(value) <= max;
const token = (value: unknown): value is string =>
  typeof value === "string" && /^[a-z0-9:_-]{1,96}$/i.test(value);
export function validArchiveCursor(value: unknown): value is AdultArchiveCursor {
  const row = value as AdultArchiveCursor;
  if (
    !row ||
    typeof row !== "object" ||
    Object.keys(row).some(
      (key) =>
        ![
          "page",
          "query",
          "order",
          "updatedAt",
          "offset",
          "retryAt",
          "paging",
          "state",
          "added",
          "duplicates",
          "received",
          "rewound",
          "checkpointId",
        ].includes(key),
    ) ||
    (row.rewound !== undefined && typeof row.rewound !== "boolean")
  )
    return false;
  return (
    !!row &&
    typeof row === "object" &&
    number(row.page, 100000) &&
    row.page >= 1 &&
    typeof row.query === "string" &&
    row.query.length <= 200 &&
    typeof row.order === "string" &&
    (ADULT_ARCHIVE_ORDERS as readonly string[]).includes(row.order) &&
    number(row.updatedAt) &&
    [row.offset].every((v) => v === undefined || number(v, 10000)) &&
    [row.retryAt].every((v) => v === undefined || number(v)) &&
    [row.added, row.duplicates, row.received].every(
      (v) => v === undefined || number(v, 10000000),
    ) &&
    (row.paging === undefined || row.paging === 2) &&
    (row.state === undefined || ["ready", "exhausted", "failed"].includes(row.state)) &&
    (row.checkpointId === undefined || token(row.checkpointId))
  );
}
export function readArchiveLedger(value: unknown): ArchiveLedger {
  if (value === undefined) return { version: 1, positions: {} };
  const ledger = value as ArchiveLedger;
  if (
    !ledger ||
    ledger.version !== 1 ||
    !ledger.positions ||
    typeof ledger.positions !== "object" ||
    Array.isArray(ledger.positions) ||
    Object.keys(ledger.positions).length > ARCHIVE_POSITION_LIMIT
  )
    throw Error(
      "Unsupported or damaged archive positions. Existing catalog and resume data were preserved.",
    );
  for (const [key, row] of Object.entries(ledger.positions))
    if (
      !row ||
      !(ADULT_PULL_PROVIDERS as readonly string[]).includes(row.provider) ||
      !validArchiveCursor(row.cursor) ||
      !token(row.token) ||
      !number(row.accepted, 432) ||
      key !== archiveLaneKey(row.provider, row.cursor.query, row.cursor.order) ||
      row.cursor.checkpointId !== row.token
    )
      throw Error("Invalid saved archive position. Existing data was preserved.");
  return ledger;
}
export function validArchiveCheckpoint(value: unknown): value is ArchiveCheckpoint {
  const row = value as ArchiveCheckpoint;
  return (
    !!row &&
    row.version === 1 &&
    (ADULT_PULL_PROVIDERS as readonly string[]).includes(row.provider) &&
    typeof row.query === "string" &&
    row.query === archiveQuery(row.query) &&
    validArchiveCursor(row.cursor) &&
    row.cursor.query === row.query &&
    row.cursor.order === row.order &&
    token(row.token) &&
    row.cursor.checkpointId === row.token &&
    (row.before === null || token(row.before)) &&
    Array.isArray(row.acceptedIds) &&
    row.acceptedIds.length <= 432 &&
    new Set(row.acceptedIds).size === row.acceptedIds.length &&
    row.acceptedIds.every((id) => typeof id === "string" && id.length > 0 && id.length <= 2048)
  );
}
/** Old preferences are suggestions only for lanes absent from the durable ledger. */
export function migrateArchiveLedger(
  current: ArchiveLedger,
  legacy: Record<string, AdultArchiveCursor>,
): ArchiveLedger {
  const positions = { ...current.positions };
  const rows = Object.entries(legacy)
    .filter(
      ([key, row]) =>
        validArchiveCursor(row) &&
        ADULT_PULL_PROVIDERS.some(
          (provider) => key === archiveLaneKey(provider, row.query, row.order),
        ),
    )
    .sort(
      (a, b) =>
        Number(archiveQuery(b[1].query) === "all") - Number(archiveQuery(a[1].query) === "all") ||
        b[1].updatedAt - a[1].updatedAt,
    );
  for (const [key, row] of rows) {
    if (Object.hasOwn(positions, key) || Object.keys(positions).length >= ARCHIVE_POSITION_LIMIT)
      continue;
    const provider = key.split("::")[0] as AdultPullProvider;
    let hash = 2166136261;
    for (const char of JSON.stringify([key, row]))
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    const id = "legacy:" + (hash >>> 0).toString(16);
    positions[key] = {
      provider,
      token: id,
      accepted: 0,
      cursor: { ...row, query: archiveQuery(row.query), checkpointId: id },
    };
  }
  return { version: 1, positions };
}
