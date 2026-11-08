import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const root = new URL("../", import.meta.url), day = 86_400_000;
export const readRegistry = () => JSON.parse(readFileSync(new URL("fixtures/provider-contracts/registry.json", root), "utf8"));
export function fixtureFreshness(registry = readRegistry(), observations = [], now = Date.now()) {
  if (registry.version !== 1 || typeof registry.owner !== "string" || !registry.owner ||
      !Array.isArray(registry.entries) || new Set(registry.entries.map(row => row.id)).size !== registry.entries.length)
    throw Error("Invalid provider fixture registry");
  const registered = /^(?:fixtures|scripts)\/[a-z0-9/._-]+$/i;
  return registry.entries.map(row => {
    const reviewed = Date.parse(row.reviewedAt + "T00:00:00Z");
    if (!/^[\w-]+$/.test(row.id) || !Number.isFinite(reviewed) || !Number.isSafeInteger(row.reviewDays) ||
        row.reviewDays < 1 || row.reviewDays > 90 || !row.provenance ||
        [row.fixture, row.runner].some(path => !registered.test(path) || path.includes("..") || !existsSync(new URL(path, root))))
      throw Error("Missing or invalid registered fixture: " + row.id);
    const latest = observations.filter(o => o.id === row.id && Number.isFinite(o.at) && o.at <= now)
      .sort((a,b) => b.at-a.at)[0];
    const canary = !row.canary ? "no authorized canary" : !latest || now - latest.at >= 7 * day
      ? "no recent authorized canary" : latest.status === "observed" ? "recent sample" : "last attempt unavailable";
    return { ...row, fixtureReview: reviewed > now ? "date ahead of release clock" :
      now - reviewed >= row.reviewDays * day ? "review due" : "in review window", canary,
      ...(row.canary && latest ? { canaryAt: new Date(latest.at).toISOString() } : {}) };
  });
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const observations = process.argv[2] ? JSON.parse(readFileSync(process.argv[2], "utf8")).observations : [];
  const rows = fixtureFreshness(undefined, observations);
  console.log(JSON.stringify({ owner: readRegistry().owner, parserResults: "Run the listed deterministic test runners separately.",
    liveAvailability: "Canaries are point-in-time samples only.", rows }, null, 2));
}
