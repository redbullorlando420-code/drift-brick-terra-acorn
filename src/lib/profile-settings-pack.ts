import { readProfileSource, type ProfileSource } from "./profile-source.ts";
export const PROFILE_SETTINGS_LIMIT = 32 * 1024;
export const PROFILE_SETTINGS_PREFS_KEY = "reelcase.prefs.v4";
export const PROFILE_SETTING_FIELDS = {
  view: { label: "Library layout", values: ["grid", "list"] },
  sort: {
    label: "Library sort",
    values: ["name", "added", "size", "duration", "recent", "type", "folder", "path"],
  },
  performanceMode: { label: "Performance preset", values: ["adaptive", "low-memory"] },
  hardwareAccel: { label: "Hardware playback preference", values: [true, false] },
} as const;
export type ProfileSettingKey = keyof typeof PROFILE_SETTING_FIELDS;
export type ProfileSettings = Partial<Record<ProfileSettingKey, string | boolean>>;
export type ProfileSettingsPack = {
  format: "realhub-profile-settings";
  version: 1;
  exportedAt: string;
  sourceProfile: ProfileSource;
  settings: ProfileSettings;
};
export function readProfileSettings(raw: unknown): ProfileSettings {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Error("Profile settings must be an object.");
  const keys = Object.keys(raw);
  if (!keys.length || keys.length > Object.keys(PROFILE_SETTING_FIELDS).length)
    throw Error("Choose 1–4 supported settings.");
  const settings: ProfileSettings = {};
  for (const key of keys) {
    if (!Object.hasOwn(PROFILE_SETTING_FIELDS, key))
      throw Error("This pack contains unsupported settings. No settings were applied.");
    const field = key as ProfileSettingKey,
      value = (raw as Record<string, unknown>)[key];
    if (!(PROFILE_SETTING_FIELDS[field].values as readonly unknown[]).includes(value))
      throw Error("Invalid value for " + PROFILE_SETTING_FIELDS[field].label + ".");
    settings[field] = value as string | boolean;
  }
  return settings;
}
export function selectProfileSettings(
  raw: unknown,
  keys: readonly ProfileSettingKey[],
): ProfileSettings {
  const valid = readProfileSettings(raw),
    selected: ProfileSettings = {};
  for (const key of new Set(keys)) {
    if (!Object.hasOwn(PROFILE_SETTING_FIELDS, key) || !Object.hasOwn(valid, key))
      throw Error("The selected setting is unavailable. Review the pack again.");
    selected[key] = valid[key];
  }
  return readProfileSettings(selected);
}
export function parseProfileSettingsPack(text: string): ProfileSettingsPack {
  if (new TextEncoder().encode(text).length > PROFILE_SETTINGS_LIMIT)
    throw Error("Profile settings packs are limited to 32 KiB.");
  let row: any;
  try {
    row = JSON.parse(text);
  } catch {
    throw Error("This settings pack is not valid JSON.");
  }
  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row) ||
    row.format !== "realhub-profile-settings" ||
    row.version !== 1 ||
    Object.keys(row).some(
      (key) => !["format", "version", "exportedAt", "sourceProfile", "settings"].includes(key),
    ) ||
    typeof row.exportedAt !== "string" ||
    row.exportedAt.length > 40 ||
    !Number.isFinite(Date.parse(row.exportedAt))
  )
    throw Error("Unsupported profile settings pack. Choose a version 1 Realhub settings export.");
  return {
    format: row.format,
    version: 1,
    exportedAt: row.exportedAt,
    sourceProfile: readProfileSource(row.sourceProfile),
    settings: readProfileSettings(row.settings),
  };
}
/** Deliberately omits history, identifiers, paths, endpoints, grants and account data. */
export function captureProfileSettings(state: Record<string, unknown>): ProfileSettings {
  return readProfileSettings(
    Object.fromEntries(Object.keys(PROFILE_SETTING_FIELDS).map((key) => [key, state[key]])),
  );
}
export function makeProfileSettingsPack(
  source: ProfileSource,
  settings: ProfileSettings,
  now = new Date(),
): ProfileSettingsPack {
  return parseProfileSettingsPack(
    JSON.stringify({
      format: "realhub-profile-settings",
      version: 1,
      exportedAt: now.toISOString(),
      sourceProfile: source,
      settings,
    }),
  );
}
