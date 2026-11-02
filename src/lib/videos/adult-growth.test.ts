import test from "node:test";
import assert from "node:assert/strict";
import {
  adultGrowthCounts,
  adultMediaClass,
  adultVideoGoalRemaining,
  rememberAdultGrowthChanges,
} from "./adult-growth.ts";
import {
  adultGrowthPreset,
  DEFAULT_PULL_SETTINGS,
  normalizePullSettings,
} from "../pull-settings.ts";
import type { LibraryVideo } from "./types";
const card = (id: string, kind = "eporner", mime = "video/mp4"): LibraryVideo =>
  ({
    id,
    folderId: kind + ":discover",
    name: id,
    extension: mime.startsWith("image") ? "image" : "mp4",
    mime,
    addedAt: 1,
    remote: { kind, videoId: id },
  }) as LibraryVideo;

test("a mixed 20k catalog counts real archived videos separately and yields while restoring", async () => {
  const rows = Array.from({ length: 20_000 }, (_, i) =>
    i < 9000
      ? card("v" + i)
      : i < 17000
        ? card("p" + i, "booru", "image/jpeg")
        : card("r" + i, "chaturbate"),
  );
  let yielded = false;
  setTimeout(() => {
    yielded = true;
  }, 0);
  const first = adultGrowthCounts(rows);
  assert.equal(adultGrowthCounts(rows), first);
  const counts = await first;
  assert(yielded);
  assert.deepEqual(counts, { archivedVideos: 9000, photos: 8000, liveRooms: 3000, unknown: 0 });
  assert.equal(adultVideoGoalRemaining(counts, 10_000), 1000);
  assert.equal(
    adultMediaClass({ ...card("unknown", "reddit"), mime: "", extension: "" }),
    "unknown",
  );
});
test("accepted refreshes and media reclassification update a cached snapshot without counting growth twice", async () => {
  const old = [card("saved"), card("picture", "reddit", "image/jpeg")];
  await adultGrowthCounts(old);
  const after = { ...old[1]!, mime: "video/mp4", extension: "mp4" },
    fresh = card("fresh");
  const next = [old[0]!, after, fresh];
  rememberAdultGrowthChanges(old, next, [
    { before: old[0], after: old[0]! },
    { before: old[1], after },
    { after: fresh },
  ]);
  assert.deepEqual(await adultGrowthCounts(next), {
    archivedVideos: 3,
    photos: 0,
    liveRooms: 0,
    unknown: 0,
  });
  assert.equal((await adultGrowthCounts(old)).photos, 1);
  assert.equal(
    (await adultGrowthCounts(next.slice(1))).archivedVideos,
    2,
    "cleanup/restored arrays are counted afresh",
  );
});
test("larger growth reserves shared capacity and preserves explicit stops and slower custom budgets", () => {
  const current = normalizePullSettings({
    adultMaxEntries: 100000,
    remoteMaxEntries: 200000,
    adultBatchVideos: 2000,
    adultIntervalSeconds: 120,
  });
  const upgraded = normalizePullSettings({ ...current, ...adultGrowthPreset(current) });
  assert.equal(upgraded.adultMaxEntries, 300000);
  assert.equal(upgraded.adultCatalogTarget, 250000);
  assert(
    upgraded.remoteMaxEntries >=
      upgraded.adultMaxEntries +
        upgraded.youtubeMaxEntries +
        upgraded.twitchMaxEntries +
        upgraded.otherMaxEntries,
  );
  assert.equal(upgraded.adultBatchVideos, 10000);
  assert.equal(upgraded.adultIntervalSeconds, 60);
  const disabled = normalizePullSettings({
    ...DEFAULT_PULL_SETTINGS,
    adultMaxEntries: 0,
    remoteMaxEntries: 0,
    automaticPulls: false,
  });
  const patch = adultGrowthPreset(disabled);
  assert.equal(patch.adultMaxEntries, 0);
  assert.equal(patch.remoteMaxEntries, 0);
  assert.equal(patch.automaticPulls, undefined);
  assert.equal(normalizePullSettings({ adultBatchVideos: 1000000 }).adultBatchVideos, 50000);
});
