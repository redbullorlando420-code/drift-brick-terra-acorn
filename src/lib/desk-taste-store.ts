import { profileLocalStorage } from "./local-profile-storage.ts";
import {
  DESK_TASTE_KEY,
  emptyDeskTaste,
  readDeskTaste,
  validateDeskTaste,
  type DeskTaste,
  type DeskTasteLedger,
  type TasteDesk,
} from "./videos/desk-taste.ts";
export function createDeskTasteStore(
  storage: Pick<Storage, "getItem" | "setItem"> = profileLocalStorage,
) {
  let baseline: string | null = null,
    loaded = false;
  let snapshot: {
    saved: DeskTasteLedger;
    temporary: Partial<Record<TasteDesk, DeskTaste>>;
    error: string;
  } = { saved: emptyDeskTaste(), temporary: {}, error: "" };
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };
  const load = () => {
    try {
      const raw = storage.getItem(DESK_TASTE_KEY),
        saved = readDeskTaste(raw);
      baseline = raw;
      loaded = true;
      snapshot = { ...snapshot, saved, error: "" };
    } catch (e) {
      loaded = false;
      snapshot = {
        ...snapshot,
        error: e instanceof Error ? e.message : "Desk tuning could not be loaded.",
      };
    }
    emit();
    return snapshot;
  };
  const write = (saved: DeskTasteLedger, desk: TasteDesk) => {
    if (!loaded) throw Error(snapshot.error || "Reload desk preferences before saving.");
    const clean = readDeskTaste(JSON.stringify(saved));
    if (storage.getItem(DESK_TASTE_KEY) !== baseline)
      throw Error("Desk preferences changed in another tab. Reload before saving.");
    const raw = JSON.stringify(clean);
    storage.setItem(DESK_TASTE_KEY, raw);
    baseline = raw;
    const temporary = { ...snapshot.temporary };
    delete temporary[desk];
    snapshot = { saved: clean, temporary, error: "" };
    emit();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    load,
    save(desk: TasteDesk, value: DeskTaste) {
      write(
        { version: 1, desks: { ...snapshot.saved.desks, [desk]: validateDeskTaste(value) } },
        desk,
      );
    },
    apply(desk: TasteDesk, value: DeskTaste) {
      snapshot = {
        ...snapshot,
        temporary: { ...snapshot.temporary, [desk]: validateDeskTaste(value) },
      };
      emit();
    },
    clearTemporary(desk: TasteDesk) {
      if (!snapshot.temporary[desk]) return;
      const temporary = { ...snapshot.temporary };
      delete temporary[desk];
      snapshot = { ...snapshot, temporary };
      emit();
    },
    reset(desk: TasteDesk) {
      const desks = { ...snapshot.saved.desks };
      delete desks[desk];
      write({ version: 1, desks }, desk);
    },
  };
}
export const deskTasteStore = createDeskTasteStore();
let started = false;
export function ensureDeskTaste() {
  if (started || typeof window === "undefined") return;
  started = true;
  deskTasteStore.load();
  const listener = (event: StorageEvent) => {
    if (event.key === DESK_TASTE_KEY || event.key === null) deskTasteStore.load();
  };
  window.addEventListener("storage", listener);
  import.meta.hot?.dispose(() => {
    window.removeEventListener("storage", listener);
    started = false;
  });
}
