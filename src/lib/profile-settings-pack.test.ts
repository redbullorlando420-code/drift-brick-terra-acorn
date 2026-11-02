import { test } from "node:test";
import assert from "node:assert/strict";
import { readProfileSource } from "./profile-source.ts";
import {
  captureProfileSettings,
  makeProfileSettingsPack,
  parseProfileSettingsPack,
  readProfileSettings,
  selectProfileSettings,
} from "./profile-settings-pack.ts";
const source = { version: 1 as const, id: "p-11111111-1111-4111-8111-111111111111", name: "Alpha" };
const settings = {
  view: "list",
  sort: "name",
  hardwareAccel: false,
  performanceMode: "low-memory",
};
test("source-profile provenance is versioned, bounded and never accepts destination/authentication fields", () => {
  assert.deepEqual(readProfileSource(source), source);
  assert.deepEqual(readProfileSource({ version: 1, id: "default", name: "Default" }), {
    version: 1,
    id: "default",
    name: "Default",
  });
  for (const raw of [
    null,
    { ...source, version: 2 },
    { ...source, id: "../../escape" },
    { ...source, name: "x".repeat(49) },
    { ...source, name: " Alpha " },
    { ...source, name: "Bad\nlabel" },
    { ...source, userId: "account" },
    { ...source, target: "default" },
    { version: 1, id: "default", name: "Another" },
    { ...source, name: "DEFAULT" },
  ])
    assert.throws(() => readProfileSource(raw));
});
test("configuration capture copies exactly four allowlisted fields, preserving false values and no personal signals", () => {
  const input = {
    ...settings,
    history: ["private title"],
    tags: { private: ["private"] },
    adultPinHash: "hash",
    token: "secret",
    sourceId: "adults",
    model: "private model",
    companionUrl: "http://private/",
    nativeRoots: ["E:/personal"],
  };
  const captured = captureProfileSettings(input);
  assert.deepEqual(captured, settings);
  assert.deepEqual(Object.keys(captured).sort(), Object.keys(settings).sort());
  const text = JSON.stringify(
    makeProfileSettingsPack(source, captured, new Date("2026-11-02T12:00:00Z")),
  );
  for (const forbidden of [
    "private title",
    "token",
    "secret",
    "adultPinHash",
    "companionUrl",
    "nativeRoots",
    "sourceId",
  ])
    assert(!text.includes(forbidden));
  assert.equal(parseProfileSettingsPack(text).settings.hardwareAccel, false);
});
test("settings review selects only checked fields and leaves the input unchanged", () => {
  const before = JSON.stringify(settings);
  assert.deepEqual(selectProfileSettings(settings, ["view", "hardwareAccel", "view"]), {
    view: "list",
    hardwareAccel: false,
  });
  assert.equal(JSON.stringify(settings), before);
  assert.throws(() => selectProfileSettings(settings, []));
  assert.throws(() => selectProfileSettings({ view: "grid" }, ["sort"]));
});
test("unsupported settings and values fail closed rather than being copied to another profile", () => {
  for (const raw of [
    null,
    [],
    {},
    { view: "compact" },
    { sort: "private-path" },
    { hardwareAccel: 0 },
    { performanceMode: "unlimited" },
    { view: "grid", auth: "secret" },
    JSON.parse('{"__proto__":{"polluted":true},"view":"grid"}'),
  ])
    assert.throws(() => readProfileSettings(raw));
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
});
test("portable packs round-trip as version 1 and reject malformed, oversized and future input", () => {
  const pack = makeProfileSettingsPack(source, settings, new Date("2026-11-02T12:00:00Z"));
  assert.deepEqual(parseProfileSettingsPack(JSON.stringify(pack)), pack);
  for (const row of [
    { ...pack, version: 2 },
    { ...pack, format: "library-backup" },
    { ...pack, exportedAt: "nonsense" },
    { ...pack, auth: { token: "secret" } },
    { ...pack, settings: { view: "list", history: [] } },
  ])
    assert.throws(() => parseProfileSettingsPack(JSON.stringify(row)));
  assert.throws(() => parseProfileSettingsPack("broken"));
  assert.throws(() => parseProfileSettingsPack(" ".repeat(32769)));
});
