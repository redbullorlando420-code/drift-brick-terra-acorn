import { validProfileId } from "./local-profile-storage.ts";
export const PROFILE_SOURCE_FILE = "profile/source.json";
export type ProfileSource = { version: 1; id: string; name: string };
/** Descriptive provenance only. Never a restore destination or authentication identity. */
export function readProfileSource(raw: unknown): ProfileSource {
  const row = raw as ProfileSource;
  if (
    !row ||
    typeof row !== "object" ||
    Array.isArray(row) ||
    row.version !== 1 ||
    typeof row.id !== "string" ||
    !validProfileId(row.id) ||
    typeof row.name !== "string" ||
    !row.name.trim() ||
    row.name !== row.name.trim() ||
    row.name.length > 48 ||
    /[\u0000-\u001f\u007f]/.test(row.name) ||
    Object.keys(row).some((key) => !["version", "id", "name"].includes(key)) ||
    (row.id === "default" ? row.name !== "Default" : row.name.toLocaleLowerCase() === "default")
  )
    throw Error("Unsupported source-profile metadata. The backup was not applied.");
  return { version: 1, id: row.id, name: row.name };
}
