import test from "node:test";
import assert from "node:assert/strict";
import {
  negotiateCompanion,
  companionFeatureIssue,
  companionPathFeature,
} from "../src/lib/companion-protocol.ts";
import { companionHealth, companionFetch } from "../src/lib/companion.ts";
const old = { ok: true, service: "reelcase-companion", version: 10 };
test("documented legacy file operations remain usable without claiming newer capabilities", () => {
  const result = negotiateCompanion(old);
  assert(result.compatible && result.legacy);
  assert.equal(companionFeatureIssue(result, "file-health"), undefined);
  assert.match(companionFeatureIssue(result, "youtube-downloads"), /v11/);
  assert.match(companionFeatureIssue(result, "task-receipts"), /v13/);
  const restricted = negotiateCompanion({
    ...old,
    capabilities: ["file-health", "unknown-feature", {}, "file-health"],
  });
  assert.deepEqual(restricted.capabilities, ["file-health"]);
  assert(companionFeatureIssue(restricted, "launch"));
});
test("protocol major and malformed responses fail closed; additive minor and unknown fields are ignored", () => {
  for (const value of [
    null,
    { ...old, protocol: { major: 2, minor: 0 } },
    { ...old, protocol: null },
    { ...old, version: 99 },
    { ...old, service: "other" },
    { ...old, ok: false },
  ])
    assert.equal(negotiateCompanion(value).compatible, false);
  const result = negotiateCompanion({
    ...old,
    version: 13,
    protocol: { major: 1, minor: 99 },
    capabilities: ["file-health", "future-field"],
    secret: "CANARY",
  });
  assert(result.compatible && !result.legacy);
  assert.deepEqual(result.capabilities, ["file-health"]);
  assert(!JSON.stringify(result).includes("CANARY"));
});
test("native route families negotiate file, download, artwork, print, launch and creative features", () => {
  for (const [path, feature] of [
    ["/source-health", "file-health"],
    ["/youtube/downloads/id/resume", "youtube-downloads"],
    ["/thumbs/get?id=x", "thumb-disk-cache"],
    ["/prints/save", "prints-bridge"],
    ["/launch", "launch"],
    ["/tasks/id/cancel", "task-receipts"],
    ["/studio/models/upload?name=x", "studio-models"],
  ])
    assert.equal(companionPathFeature(path), feature);
  assert.equal(companionPathFeature("https://example.org/launch"), undefined);
  assert.equal(companionPathFeature("/unknown"), undefined);
});
test("one coalesced health probe gates unsupported operations before dispatch while allowed legacy reads still work", async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  let health = { ...old, capabilities: ["file-health"] },
    reads = 0,
    actions = [];
  globalThis.fetch = async (url) => {
    if (url.endsWith("/health")) {
      reads++;
      return Response.json(health);
    }
    actions.push(url);
    return Response.json({ ok: true, roots: [] });
  };
  await companionHealth(true);
  const responses = await Promise.all([
    companionFetch("/source-health"),
    companionFetch("/tasks"),
    companionFetch("/prints/list"),
  ]);
  assert.equal(responses[0].status, 200);
  assert.equal(responses[1].status, 503);
  assert.match((await responses[1].json()).error, /v13/);
  assert.equal(actions.length, 1);
  assert.equal(reads, 1);
  health = { ...old, protocol: { major: 2, minor: 0 } };
  await companionHealth(true);
  assert.equal((await companionFetch("/source-health")).status, 503);
  assert.equal(actions.length, 1);
});
