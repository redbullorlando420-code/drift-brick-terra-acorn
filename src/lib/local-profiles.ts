import { PERFORMANCE_MODE_KEY } from "./performance-profile.ts";
import { stageProfileArrival } from "./profile-arrival.ts";
import {
  currentProfileId,
  PROFILE_SELECTION_KEY,
  validProfileId,
  profileDatabaseName,
  assertProfileContext,
  PROFILE_PREFIX,
} from "./local-profile-storage.ts";
import { createProfileStorage } from "./local-profile-storage.ts";
import { readProfileSource, type ProfileSource } from "./profile-source.ts";
import {
  readProfileSettings,
  PROFILE_SETTINGS_PREFS_KEY,
  type ProfileSettings,
} from "./profile-settings-pack.ts";
export type LocalProfile = { id: string; name: string; createdAt: number };
export type ProfileRegistry = { version: 1; revision: number; profiles: LocalProfile[] };
export const DEFAULT_PROFILE: LocalProfile = { id: "default", name: "Default", createdAt: 0 };
export const PROFILE_REGISTRY_DB = "realhub-local-profiles";
export const PROFILE_LIMIT = 16;
export const PROFILE_REGISTRY_EVENT = "realhub:profile-registry";
const PROFILE_REGISTRY_CHANNEL = "realhub-profile-registry-v1";
export function validateProfileName(name: string): string {
  const trimmed = name.trim();
  if (
    !trimmed ||
    trimmed.length > 48 ||
    trimmed.toLocaleLowerCase() === "default" ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  )
    throw Error(
      "Use a unique profile name with 1–48 characters. Default is reserved; control characters are not allowed.",
    );
  return trimmed;
}
/** Control-plane hints only. Receivers always reread the transactional registry. */
function announceRegistry(revision: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_REGISTRY_EVENT));
  try {
    const channel = new BroadcastChannel(PROFILE_REGISTRY_CHANNEL);
    channel.postMessage({ version: 1, revision });
    channel.close();
  } catch {
    /* Focus refresh remains available when cross-tab transport is unavailable. */
  }
}
export function subscribeProfileRegistryChanges(notify: () => void) {
  const visible = () => {
    if (document.visibilityState !== "hidden") notify();
  };
  window.addEventListener(PROFILE_REGISTRY_EVENT, notify);
  window.addEventListener("focus", visible);
  document.addEventListener("visibilitychange", visible);
  let channel: BroadcastChannel | undefined;
  try {
    channel = new BroadcastChannel(PROFILE_REGISTRY_CHANNEL);
    channel.onmessage = (event) => {
      const hint = event.data;
      if (hint?.version === 1 && Number.isSafeInteger(hint.revision) && hint.revision >= 0)
        notify();
    };
  } catch {
    /* No polling fallback. */
  }
  return () => {
    window.removeEventListener(PROFILE_REGISTRY_EVENT, notify);
    window.removeEventListener("focus", visible);
    document.removeEventListener("visibilitychange", visible);
    channel?.close();
  };
}
export function readProfileRegistry(raw: unknown): ProfileRegistry {
  if (raw === undefined) return { version: 1, revision: 0, profiles: [] };
  const r = raw as ProfileRegistry;
  if (
    !r ||
    r.version !== 1 ||
    !Number.isSafeInteger(r.revision) ||
    r.revision < 0 ||
    !Array.isArray(r.profiles) ||
    r.profiles.length >= PROFILE_LIMIT ||
    r.profiles.some(
      (p) =>
        !p ||
        p.id === "default" ||
        !validProfileId(p.id) ||
        typeof p.name !== "string" ||
        !p.name.trim() ||
        p.name.length > 48 ||
        p.name.toLocaleLowerCase() === "default" ||
        !Number.isSafeInteger(p.createdAt) ||
        p.createdAt < 0,
    ) ||
    new Set(r.profiles.map((p) => p.id)).size !== r.profiles.length ||
    new Set(r.profiles.map((p) => p.name.toLocaleLowerCase())).size !== r.profiles.length
  )
    throw Error("The local profile registry is unsupported. Existing libraries were kept.");
  return r;
}
function openRegistry() {
  return new Promise<IDBDatabase>((yes, no) => {
    const request = indexedDB.open(PROFILE_REGISTRY_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("control");
    request.onsuccess = () => yes(request.result);
    request.onerror = () => no(request.error ?? Error("Local profile registry could not open."));
    request.onblocked = () =>
      no(Error("Another tab is updating the profile registry. Close that tab and retry."));
  });
}
export function createProfileRepository(
  open: () => Promise<IDBDatabase>,
  committed: (revision: number) => void = () => {},
) {
  async function list() {
    const db = await open();
    try {
      return await new Promise<ProfileRegistry>((yes, no) => {
        const tx = db.transaction("control"),
          r = tx.objectStore("control").get("registry");
        tx.oncomplete = () => {
          try {
            yes(readProfileRegistry(r.result));
          } catch (e) {
            no(e);
          }
        };
        tx.onerror = tx.onabort = () => no(tx.error ?? Error("Profiles could not be read."));
      });
    } finally {
      db.close();
    }
  }
  async function create(name: string, initialize?: (profile: LocalProfile) => () => void) {
    const trimmed = validateProfileName(name);
    const db = await open();
    try {
      return await new Promise<LocalProfile>((yes, no) => {
        const tx = db.transaction("control", "readwrite"),
          store = tx.objectStore("control"),
          read = store.get("registry");
        let cleanup: (() => void) | undefined;
        let result: LocalProfile,
          cause: unknown,
          revision = 0;
        tx.oncomplete = () => {
          try {
            committed(revision);
          } catch {}
          yes(result);
        };
        tx.onerror = tx.onabort = () => {
          try {
            cleanup?.();
          } catch {
            no(
              Error(
                "The new profile was not published. Its unused settings could not be cleared; existing profiles were kept.",
              ),
            );
            return;
          }
          no(cause ?? tx.error ?? Error("The new profile could not be saved."));
        };
        read.onsuccess = () => {
          try {
            const registry = readProfileRegistry(read.result);
            if (
              registry.profiles.some(
                (p) => p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
              )
            )
              throw Error("A profile already uses that name.");
            result = { id: "p-" + crypto.randomUUID(), name: trimmed, createdAt: Date.now() };
            const next = {
              version: 1 as const,
              revision: registry.revision + 1,
              profiles: [...registry.profiles, result],
            };
            readProfileRegistry(next);
            cleanup = initialize?.(result);
            revision = next.revision;
            store.put(next, "registry");
          } catch (e) {
            cause = e;
            tx.abort();
          }
        };
      });
    } finally {
      db.close();
    }
  }
  async function rename(id: string, name: string) {
    if (id === "default") throw Error("Default keeps its reserved name.");
    if (!validProfileId(id)) throw Error("Invalid profile selection.");
    const trimmed = validateProfileName(name),
      db = await open();
    try {
      return await new Promise<LocalProfile>((yes, no) => {
        const tx = db.transaction("control", "readwrite"),
          store = tx.objectStore("control"),
          read = store.get("registry");
        let result: LocalProfile, cause: unknown, revision: number | undefined;
        tx.oncomplete = () => {
          if (revision !== undefined) {
            try {
              committed(revision);
            } catch {}
          }
          yes(result);
        };
        tx.onerror = tx.onabort = () =>
          no(
            cause ??
              tx.error ??
              Error("The profile name could not be saved. Its previous name was kept."),
          );
        read.onsuccess = () => {
          try {
            const registry = readProfileRegistry(read.result),
              existing = registry.profiles.find((p) => p.id === id);
            if (!existing)
              throw Error("That local profile is no longer available. Refresh the profile list.");
            if (
              registry.profiles.some(
                (p) => p.id !== id && p.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
              )
            )
              throw Error("A profile already uses that name.");
            result = { ...existing, name: trimmed };
            if (existing.name === trimmed) return;
            const next: ProfileRegistry = {
              ...registry,
              revision: registry.revision + 1,
              profiles: registry.profiles.map((p) => (p.id === id ? result : p)),
            };
            readProfileRegistry(next);
            revision = next.revision;
            store.put(next, "registry");
          } catch (e) {
            cause = e;
            tx.abort();
          }
        };
      });
    } finally {
      db.close();
    }
  }
  return { list, create, rename };
}
const repository = createProfileRepository(openRegistry, announceRegistry);
export async function listLocalProfiles() {
  return [DEFAULT_PROFILE, ...(await repository.list()).profiles];
}
export const createLocalProfile = (name: string) => repository.create(name);
export const createConfiguredLocalProfile = (name: string, raw: ProfileSettings) => {
  const settings = readProfileSettings(raw);
  return repository.create(name, (profile) => {
    const storage = createProfileStorage(() => globalThis.localStorage, profile.id);
    if (storage.length)
      throw Error("The new profile namespace is not empty. No existing settings were overwritten.");
    const { performanceMode, ...prefs } = settings;
    const written: string[] = [];
    const cleanup = () => {
      let failed = false;
      for (const key of written) {
        try {
          storage.removeItem(key);
        } catch {
          failed = true;
        }
      }
      if (failed)
        throw Error(
          "The new profile was not published. Its unused settings could not be cleared; existing profiles were kept.",
        );
    };
    try {
      storage.setItem(PROFILE_SETTINGS_PREFS_KEY, JSON.stringify({ ...prefs, sourceId: "home" }));
      written.push(PROFILE_SETTINGS_PREFS_KEY);
      if (performanceMode !== undefined) {
        storage.setItem(PERFORMANCE_MODE_KEY, String(performanceMode));
        written.push(PERFORMANCE_MODE_KEY);
      }
    } catch (error) {
      cleanup();
      throw error;
    }
    return cleanup;
  });
};
export async function localProfileSource(): Promise<ProfileSource> {
  const profile = await activeLocalProfile();
  return readProfileSource({ version: 1, id: profile.id, name: profile.name });
}
export const renameLocalProfile = (id: string, name: string) => repository.rename(id, name);
export async function activeLocalProfile() {
  assertProfileContext();
  const id = currentProfileId();
  if (id === "default") return DEFAULT_PROFILE;
  const profile = (await listLocalProfiles()).find((p) => p.id === id);
  if (!profile)
    throw Error(
      "This local profile is missing. Return to Default; existing libraries have not been changed.",
    );
  return profile;
}
export async function validateProfileTarget(id: string) {
  if (!(await listLocalProfiles()).some((p) => p.id === id))
    throw Error("That local profile is no longer available.");
}
export function chooseDefaultProfile() {
  globalThis.sessionStorage.setItem(PROFILE_SELECTION_KEY, "default");
  stageProfileArrival(globalThis.sessionStorage,"default");
  location.reload();
}
export async function activateLocalProfile(id: string, check?:()=>void, release?:()=>void) {
  await validateProfileTarget(id);
  check?.();
  globalThis.sessionStorage.setItem(PROFILE_SELECTION_KEY, id);
  stageProfileArrival(globalThis.sessionStorage,id);
  release?.();
  location.reload();
}
export type ProfilePreview = {
  id: string;
  preferences: number;
  databases: Array<{ name: string; stores: Record<string, number> }>;
  measurement?: string;
};
/** Counts only; no titles, file handles, drafts or private tag values are read. */
export async function inspectLocalProfile(id = currentProfileId()): Promise<ProfilePreview> {
  if (!validProfileId(id)) throw Error("Invalid profile selection.");
  let preferences = 0;
  const prefix = PROFILE_PREFIX + id + ":";
  for (let i = 0; i < globalThis.localStorage.length; i++) {
    const key = globalThis.localStorage.key(i) ?? "";
    if (
      id === "default"
        ? /^(reelcase|realhub)[.:_-]/.test(key) &&
          !key.startsWith(PROFILE_PREFIX) &&
          key !== PROFILE_SELECTION_KEY
        : key.startsWith(prefix)
    )
      preferences++;
  }
  const result: ProfilePreview = { id, preferences, databases: [] };
  if (typeof indexedDB.databases !== "function")
    return {
      ...result,
      measurement:
        "Database counts unavailable in this browser. No databases were opened for this preview.",
    };
  const names = new Set((await indexedDB.databases()).map((row) => row.name));
  for (const base of ["reelcase", "reelcase-prints"]) {
    const name = profileDatabaseName(base, id);
    if (!names.has(name)) continue;
    const db = await new Promise<IDBDatabase>((yes, no) => {
      const r = indexedDB.open(name);
      r.onupgradeneeded = () => {
        r.transaction?.abort();
        no(Error("The database changed during preview. Retry to inspect the current setup."));
      };
      r.onsuccess = () => yes(r.result);
      r.onerror = () => no(r.error);
    });
    try {
      const counts: Record<string, number> = {};
      for (const store of Array.from(db.objectStoreNames))
        counts[store] = await new Promise<number>((yes, no) => {
          const r = db.transaction(store).objectStore(store).count();
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
      result.databases.push({ name, stores: counts });
    } finally {
      db.close();
    }
  }
  return result;
}
