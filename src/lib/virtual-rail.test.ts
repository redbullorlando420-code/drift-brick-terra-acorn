import assert from "node:assert/strict";
import test from "node:test";
import { railItems, railKeyboardTarget, railLimitForTarget, railWindow, railWindowStartForTarget, windowBoundaryTarget } from "./virtual-rail.ts";

test("virtual rail bounds its mounted card window", () => {
  assert.deepEqual(railWindow(80, 700, 140, 20), { start: 20, end: 27, visibleSlots: 7 });
  assert.deepEqual(railWindow(5, 700, 140, 20), { start: 0, end: 5, visibleSlots: 7 });
});

test("virtual rail keyboard targets stay inside the catalog", () => {
  assert.equal(railKeyboardTarget("ArrowLeft", 0, 12), null);
  assert.equal(railKeyboardTarget("ArrowRight", 0, 12), 1);
  assert.equal(railKeyboardTarget("Home", 7, 12), 0);
  assert.equal(railKeyboardTarget("End", 7, 12), 11);
  assert.equal(railKeyboardTarget("ArrowRight", 11, 12), null);
});

test("virtual rail expands and centers only the requested keyboard card", () => {
  assert.equal(railLimitForTarget(8, 8, 100), 24);
  assert.equal(railLimitForTarget(24, 99, 100), 100);
  assert.equal(railWindowStartForTarget(20, 100, 7), 17);
  assert.equal(railWindowStartForTarget(99, 100, 7), 93);
});

test('a million-entry End jump resolves only the visible card references', () => {
  for (const width of [390, 1280, 2560]) {
    for (const stride of [140, 176, 240]) {
      let reads = 0;
      const catalog = new Proxy(new Array<string>(1_000_000), {
        has: (_target, key) => /^\d+$/.test(String(key)),
        get(target, key, receiver) {
          if (/^\d+$/.test(String(key))) {
            assert.ok(Number(key) >= 999_970, 'no prefix reads'); reads++;
            return `video-${String(key)}`;
          }
          return Reflect.get(target, key, receiver);
        },
      });
      const result = railItems(catalog, 1_000_000, width, stride, 999_999);
      assert.equal(result.end, 1_000_000);
      assert.equal(result.items.at(-1), 'video-999999');
      assert.equal(reads, result.visibleSlots);
      assert.ok(reads <= 21);
    }
  }
});

test('logical rail limits and changed inventories resolve bounded valid windows', () => {
  const catalog = Array.from({length: 100}, (_, index) => index);
  assert.deepEqual(railItems(catalog, 8, 390, 140, 0).items, [0, 1, 2, 3, 4]);
  const shrunk = railItems(catalog.slice(0, 3), 1_000_000, 1280, 240, 999_999);
  assert.equal(shrunk.loaded, 3); assert.deepEqual(shrunk.items, [0, 1, 2]);
  assert.deepEqual(railItems(catalog, 0, 1280, 240, 0).items, []);
});

test('Tab boundaries distinguish leaving cards from entering a virtual window', () => {
  assert.equal(windowBoundaryTarget('previous', 20, 27, 100, true), 19);
  assert.equal(windowBoundaryTarget('previous', 20, 27, 100, false), 20);
  assert.equal(windowBoundaryTarget('next', 20, 27, 100, true), 27);
  assert.equal(windowBoundaryTarget('next', 20, 27, 100, false), 26);
  assert.equal(windowBoundaryTarget('previous', 0, 7, 100, true), null);
  assert.equal(windowBoundaryTarget('next', 93, 100, 100, true), null);
  assert.equal(windowBoundaryTarget('next', 0, 0, 100, false), 0);
  assert.equal(windowBoundaryTarget('previous', 100, 100, 100, false), 99);
});
