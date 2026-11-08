import { PROFILE_ARRIVAL_KEY, validProfileId } from "./local-profile-storage.ts";

const LIFETIME = 2 * 60_000;
export function stageProfileArrival(
  storage: Pick<Storage, "setItem">,
  destination: string,
  now = Date.now(),
) {
  if (!validProfileId(destination)) return;
  try {
    storage.setItem(
      PROFILE_ARRIVAL_KEY,
      JSON.stringify({ version: 1, destination, target: "home-heading", at: now }),
    );
  } catch {
    /* A browser without session storage still opens the profile normally. */
  }
}
export function takeProfileArrival(
  storage: Pick<Storage, "getItem" | "removeItem">,
  destination: string,
  now = Date.now(),
) {
  try {
    const text = storage.getItem(PROFILE_ARRIVAL_KEY);
    if (!text) return false;
    storage.removeItem(PROFILE_ARRIVAL_KEY);
    if (text.length > 300 || !validProfileId(destination)) return false;
    const row = JSON.parse(text);
    return (
      row?.version === 1 &&
      row.destination === destination &&
      row.target === "home-heading" &&
      Number.isSafeInteger(row.at) &&
      now >= row.at &&
      now - row.at < LIFETIME
    );
  } catch {
    return false;
  }
}
