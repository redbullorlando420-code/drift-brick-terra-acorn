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

export function savePrintEdit(key: string, state: PrintEditState): void {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, PrintEditState>;
    all[key] = sanitizePrintEdit(state);
    const keys = Object.keys(all);
    if (keys.length > 80) {
      for (const drop of keys.slice(0, keys.length - 80)) delete all[drop];
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
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
