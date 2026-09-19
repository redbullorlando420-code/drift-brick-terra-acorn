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
  wireframe: false,
  showGrid: true,
  lighting: "studio",
  explode: 0,
};

const KEY = "reelcase.print-edit.v1";

export function printEditKey(target: { path?: string; blobId?: string; sampleSrc?: string; name: string }): string {
  return target.blobId || target.sampleSrc || target.path || target.name;
}

export function loadPrintEdit(key: string): PrintEditState {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, Partial<PrintEditState>>;
    const row = all[key];
    if (!row || typeof row !== "object") return { ...DEFAULT_PRINT_EDIT };
    return { ...DEFAULT_PRINT_EDIT, ...row };
  } catch {
    return { ...DEFAULT_PRINT_EDIT };
  }
}

export function savePrintEdit(key: string, state: PrintEditState): void {
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, PrintEditState>;
    all[key] = state;
    const keys = Object.keys(all);
    if (keys.length > 80) {
      for (const drop of keys.slice(0, keys.length - 80)) delete all[drop];
    }
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}
