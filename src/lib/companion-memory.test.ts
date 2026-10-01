import { test } from "node:test";
import assert from "node:assert/strict";
import { companionCacheThumbUrl, getCompanionMemorySnapshot } from "./companion.ts";
import { trackSessionActivity } from "./session-activity.ts";

test("poster mirroring bounds stalled bursts, deduplicates frames, and backs off when offline", async () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldFetch = globalThis.fetch;
  const surface = Object.assign(new EventTarget(), { setInterval: () => 1, clearInterval: () => {} });
  Object.defineProperty(globalThis, "window", { configurable: true, value: surface });
  Object.defineProperty(globalThis, "document", { configurable: true, value: Object.assign(new EventTarget(), { hidden: false }) });
  const stop = trackSessionActivity(() => {});
  let unblock!: () => void;
  const blocked = new Promise<void>(resolve => { unblock = resolve; });
  let requests = 0, active = 0, peak = 0, offline = false;
  globalThis.fetch = async (_url, init) => {
    assert.ok(init?.signal, "each request must have a deadline");
    peak = Math.max(peak, ++active); requests++;
    try {
      if (requests === 1) await blocked;
      if (offline) throw new Error("Companion offline");
      return new Response('{"ok":true}', { headers: { "content-type": "application/json" } });
    } finally { active--; }
  };
  try {
    const pending = [companionCacheThumbUrl("initial", "https://example.com/first.jpg")];
    await Promise.resolve();
    for (let i = 0; i < 6000; i++) pending.push(companionCacheThumbUrl(`frame-${i}`, `https://example.com/${i}.jpg`));
    assert.ok(getCompanionMemorySnapshot().posters.pending <= 96);
    unblock(); await Promise.all(pending);
    assert.equal(peak, 1);
    assert.ok(requests <= 98);
    const before = requests;
    assert.equal(await companionCacheThumbUrl("frame-5999", "https://example.com/5999.jpg"), true);
    assert.equal(requests, before);
    offline = true;
    await Promise.all(Array.from({ length: 1000 }, (_, i) => companionCacheThumbUrl(`offline-${i}`, `https://example.com/offline-${i}.jpg`)));
    assert.equal(requests, before + 1);
    assert.equal(getCompanionMemorySnapshot().posters.pending, 0);
  } finally {
    stop(); globalThis.fetch = oldFetch;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow); else Reflect.deleteProperty(globalThis, "window");
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument); else Reflect.deleteProperty(globalThis, "document");
  }
});
