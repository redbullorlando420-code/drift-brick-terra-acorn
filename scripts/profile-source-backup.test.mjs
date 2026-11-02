import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (error) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw error;
    }
  },
});
const { libraryPackSections, exportStreamingPack, packBlobSink } =
  await import("../src/lib/videos/library-pack-stream.ts");
const { preflightPack, inspectPreparedPack, inspectLegacyFiles } =
  await import("../src/lib/videos/pack-preflight.ts");
const { readPackStream } = await import("../src/lib/videos/pack-stream.ts");
const { buildLibraryPackFiles } = await import("../src/lib/videos/library-pack.ts");
const { planLibraryRestore } = await import("../src/lib/videos/library-restore-plan.ts");
const source = { version: 1, id: "p-11111111-1111-4111-8111-111111111111", name: "Alpha" };
const empty = () => ({
  follows: [],
  history: [],
  links: [],
  favorites: [],
  likes: [],
  viewCounts: {},
  cameCounts: {},
  progress: {},
  resumeProgress: {},
});
test("streaming profile manifest is checksummed, preserved through reinspection and optional for legacy packs", async () => {
  for (const labelled of [false, true]) {
    const sink = packBlobSink();
    await exportStreamingPack(
      libraryPackSections({ ...empty(), ...(labelled ? { sourceProfile: source } : {}) }, {}, {}),
      sink.sink,
      { turn: async () => {} },
    );
    const file = new File([sink.result()], "test.reelpack");
    if (labelled) {
      const changed = (await file.text()).replace('Alpha', 'Omega');
      assert.notEqual(changed, await file.text());
      await assert.rejects(readPackStream(new File([changed], 'tampered.reelpack')), /checksum|manifest/i);
    }
    const raw = await readPackStream(file);
    assert.deepEqual(raw.files.get("profile/source.json"), labelled ? source : undefined);
    const prepared = await preflightPack(file);
    assert.equal(prepared.report.ok, true);
    assert.deepEqual(prepared.report.sourceProfile, labelled ? source : undefined);
    const resumed = await inspectPreparedPack(new Map(prepared.files));
    assert.deepEqual(resumed.report.sourceProfile, prepared.report.sourceProfile);
  }
});
test("legacy root manifests carry profile context without changing compatible old imports", async () => {
  for (const labelled of [false, true]) {
    const files = buildLibraryPackFiles({
      ...empty(),
      ...(labelled ? { sourceProfile: source } : {}),
    });
    const manifest = JSON.parse(files["reelcase-library-pack/manifest.json"]);
    assert.deepEqual(manifest.sourceProfile, labelled ? source : undefined);
    const result = await inspectLegacyFiles(files);
    assert.equal(result.report.ok, true, JSON.stringify(result.report.issues));
    assert.deepEqual(result.report.sourceProfile, labelled ? source : undefined);
  }
});
test("future or conflicting profile metadata blocks review and source-only packs contain no restorable records", async () => {
  const content = { "follows/youtube.json": { channels: [] } };
  const bad = await inspectPreparedPack(
    new Map([...Object.entries(content), ["profile/source.json", { ...source, version: 2 }]]),
  );
  assert.equal(bad.report.ok, false);
  const only = await inspectPreparedPack(new Map([["profile/source.json", source]]));
  assert.equal(only.report.ok, false);
  const legacy = await inspectLegacyFiles({
    "manifest.json": JSON.stringify({ version: 1, sourceProfile: source }),
    "profile/source.json": JSON.stringify({ ...source, name: "Different" }),
    "follows/youtube.json": JSON.stringify({ channels: [] }),
  });
  assert.equal(legacy.report.ok, false);
});
test("source metadata cannot change destination preferences, profile identity or restore rows", async () => {
  const before = {
    version: 1,
    rows: [
      {
        store: "activity",
        key: "preferences",
        value: { sourceId: "settings", privateFolderIds: ["private-source"], adultPinHash: "keep" },
      },
    ],
    mirrors: {},
  };
  const incoming = new Map([["history/history.json", { entries: [] }]]);
  const a = await planLibraryRestore(structuredClone(before), new Map(), incoming, "merge", 100);
  const b = await planLibraryRestore(
    structuredClone(before),
    new Map(),
    new Map([...incoming, ["profile/source.json", source]]),
    "merge",
    100,
  );
  assert.deepEqual(a, b);
  assert(!JSON.stringify(b).includes(source.id));
});
