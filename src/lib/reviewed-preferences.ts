import { profileLocalStorage } from "./local-profile-storage.ts";
/** Small explicit-save documents; publish only after a successful conflict-checked write. */
export function reviewedPreferences<T>(
  key: string,
  empty: () => T,
  parse: (raw: unknown) => T,
  storage: Pick<Storage, "getItem" | "setItem"> = profileLocalStorage,
) {
  let value = empty(),
    bytes: string | null = null,
    loaded = false,
    error = "";
  return {
    read() {
      try {
        const raw = storage.getItem(key);
        if (raw !== null && raw.length > 64000)
          throw Error("Saved settings exceed the supported size.");
        value = raw === null ? empty() : parse(JSON.parse(raw));
        bytes = raw;
        loaded = true;
        error = "";
      } catch (e) {
        loaded = false;
        error = e instanceof Error ? e.message : "Settings could not be read.";
      }
      return value;
    },
    get: () => value,
    error: () => error,
    write(next: T) {
      if (!loaded) throw Error(error || "Reload these settings before saving.");
      const clean = parse(next),
        raw = JSON.stringify(clean);
      if (raw.length > 64000) throw Error("Settings exceed the supported size.");
      if (storage.getItem(key) !== bytes)
        throw Error("Settings changed in another tab. Reload before saving.");
      storage.setItem(key, raw);
      bytes = raw;
      value = clean;
      return value;
    },
  };
}
