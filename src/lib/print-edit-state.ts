import { profileLocalStorage as localStorage } from "./local-profile-storage.ts";
/** Persist lightweight print viewer/editor transforms per model key (local only). */

export type PrintEditState = {
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  posX: number;
  posY: number;
  posZ: number;
  color: string;
  overrideMaterial: boolean;
  wireframe: boolean;
  showGrid: boolean;
  lighting: "studio" | "bright" | "soft" | "contrast";
  explode: number;
};

export const DEFAULT_PRINT_EDIT: PrintEditState = {
  scale: 1,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  posX: 0,
  posY: 0,
  posZ: 0,
  color: "#6aa8ff",
  overrideMaterial: false,
  wireframe: false,
  showGrid: true,
  lighting: "studio",
  explode: 0,
};

const KEY = "reelcase.print-edit.v1";
export type PrintComparison = {
  version: 1;
  baseline: PrintEditState;
  undo?: { working: PrintEditState; baseline: PrintEditState };
};
const record = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === "object" && !Array.isArray(v));
function readAll() {
  const raw = localStorage.getItem(KEY);
  if (raw && raw.length > 512000)
    throw Error("Print workspace storage exceeds its supported size. Existing edits were kept.");
  const all: unknown = JSON.parse(raw ?? "{}");
  if (!record(all) || Object.keys(all).length > 80)
    throw Error("Unsupported print workspace storage. Existing edits were kept.");
  return all;
}
function putAll(all: Record<string, unknown>) {
  if (Object.keys(all).length > 80)
    throw Error("All 80 print workspace slots are used. Existing workspaces were kept.");
  const raw = JSON.stringify(all);
  if (raw.length > 512000)
    throw Error("Print workspaces exceed 512,000 characters. Existing edits were kept.");
  localStorage.setItem(KEY, raw);
}
function comparison(raw: unknown): PrintComparison | undefined {
  if (raw === undefined) return;
  const r = raw as PrintComparison;
  if (
    !r ||
    r.version !== 1 ||
    !record(r.baseline) ||
    (r.undo && (!record(r.undo.working) || !record(r.undo.baseline)))
  )
    throw Error("Unsupported print comparison. Existing comparison data was kept.");
  return {
    version: 1,
    baseline: sanitizePrintEdit(r.baseline),
    ...(r.undo
      ? {
          undo: {
            working: sanitizePrintEdit(r.undo.working),
            baseline: sanitizePrintEdit(r.undo.baseline),
          },
        }
      : {}),
  };
}
export function printComparisonSnapshot(key: string) {
  const all = readAll(),
    row = all[key];
  if (row !== undefined && !record(row)) throw Error("Invalid saved print workspace.");
  const saved = comparison((row as any)?.comparison);
  return {
    token: JSON.stringify(row ?? null),
    working: sanitizePrintEdit((row ?? {}) as Partial<PrintEditState>),
    baseline: saved?.baseline ?? sanitizePrintEdit((row ?? {}) as Partial<PrintEditState>),
    undo: saved?.undo,
    captured: Boolean(saved),
  };
}
export const printEditToken = (key: string) => JSON.stringify(readAll()[key] ?? null);
export function loadPrintWorkspace(key: string) {
  const row = readAll()[key];
  if (row !== undefined && !record(row)) throw Error("Invalid saved print workspace.");
  return {
    working: sanitizePrintEdit((row ?? {}) as Partial<PrintEditState>),
    token: JSON.stringify(row ?? null),
  };
}
/** One conflict-checked workspace write retains both the new working state and its inverse. */
export function changePrintComparison(
  key: string,
  token: string,
  action: "capture" | "revert" | "undo",
  fallback?: PrintEditState,
) {
  const all = readAll(),
    row = all[key];
  if (JSON.stringify(row ?? null) !== token)
    throw Error("This print workspace changed. Review the current comparison again.");
  const current = printComparisonSnapshot(key);
  if (!current.captured && fallback) current.baseline = sanitizePrintEdit(fallback);
  const working =
    action === "revert"
      ? current.baseline
      : action === "undo"
        ? current.undo?.working
        : current.working;
  if (!working) throw Error("No comparison change is available to undo.");
  const baseline =
    action === "capture"
      ? current.working
      : action === "undo"
        ? current.undo!.baseline
        : current.baseline;
  all[key] = {
    ...(record(row) ? row : {}),
    ...working,
    comparison: {
      version: 1,
      baseline,
      ...(action !== "undo"
        ? { undo: { working: current.working, baseline: current.baseline } }
        : {}),
    },
  };
  putAll(all);
  return printComparisonSnapshot(key);
}
export function comparePrintEdits(working: PrintEditState, baseline: PrintEditState) {
  return (Object.keys(DEFAULT_PRINT_EDIT) as Array<keyof PrintEditState>)
    .filter((field) => working[field] !== baseline[field])
    .map((field) => ({
      field,
      before: baseline[field],
      after: working[field],
      kind: ["wireframe", "showGrid", "lighting", "explode"].includes(field) ? "view" : "model",
    }));
}

export function printEditKey(target: {
  path?: string;
  blobId?: string;
  sampleSrc?: string;
  name: string;
}): string {
  return target.blobId || target.sampleSrc || target.path || target.name;
}

export function loadPrintEdit(key: string): PrintEditState {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<
      string,
      Partial<PrintEditState>
    >;
    const row = all[key];
    if (!row || typeof row !== "object") return { ...DEFAULT_PRINT_EDIT };
    return sanitizePrintEdit(row);
  } catch {
    return { ...DEFAULT_PRINT_EDIT };
  }
}

export function savePrintEdit(key: string, state: PrintEditState, expected?: string): boolean {
  try {
    const all = readAll(),
      row = all[key];
    if (expected !== undefined && JSON.stringify(row ?? null) !== expected) return false;
    if (row !== undefined && !record(row)) return false;
    const next = { ...(record(row) ? row : {}), ...sanitizePrintEdit(state) };
    if (JSON.stringify(row) === JSON.stringify(next)) return true;
    all[key] = next;
    putAll(all);
    return true;
  } catch {
    return false;
  }
}

export function sanitizePrintEdit(value: Partial<PrintEditState>): PrintEditState {
  const result = { ...DEFAULT_PRINT_EDIT };
  for (const key of ["scale", "rotX", "rotY", "rotZ", "posX", "posY", "posZ", "explode"] as const) {
    const n = value[key],
      min = key === "scale" ? 0.05 : key === "explode" ? 0 : key.startsWith("rot") ? -180 : -100,
      max = key === "scale" ? 5 : key === "explode" ? 40 : key.startsWith("rot") ? 180 : 100;
    if (typeof n === "number" && Number.isFinite(n)) result[key] = Math.min(max, Math.max(min, n));
  }
  if (typeof value.color === "string" && /^#[a-f0-9]{6}$/i.test(value.color))
    result.color = value.color;
  for (const key of ["wireframe", "showGrid", "overrideMaterial"] as const)
    if (typeof value[key] === "boolean") result[key] = value[key];
  if (["studio", "bright", "soft", "contrast"].includes(value.lighting || ""))
    result.lighting = value.lighting!;
  if (
    value.overrideMaterial === undefined &&
    typeof value.color === "string" &&
    /^#[a-f0-9]{6}$/i.test(value.color) &&
    value.color.toLowerCase() !== DEFAULT_PRINT_EDIT.color
  )
    result.overrideMaterial = true;
  return result;
}
