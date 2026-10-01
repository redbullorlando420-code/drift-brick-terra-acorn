import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SIDEBAR_GROUPS, restoreSidebarGroups, sidebarShortcut } from "./sidebar-state.ts";

test("sidebar groups restore only known boolean preferences and recover invalid storage", () => {
  assert.deepEqual(restoreSidebarGroups('{"library":false,"tools":true,"workspace":"false","other":true}'), { library: false, workspace: false, tools: true });
  assert.deepEqual(restoreSidebarGroups("broken"), DEFAULT_SIDEBAR_GROUPS);
  assert.deepEqual(restoreSidebarGroups(null), DEFAULT_SIDEBAR_GROUPS);
});
test("sidebar keyboard toggle respects editing and modified shortcuts", () => {
  const event = { key: "B", ctrlKey: true, metaKey: false, altKey: false, shiftKey: false };
  assert.equal(sidebarShortcut(event, false), true);
  assert.equal(sidebarShortcut(event, true), false);
  assert.equal(sidebarShortcut({ ...event, shiftKey: true }, false), false);
  assert.equal(sidebarShortcut({ ...event, ctrlKey: false, metaKey: true }, false), true);
  assert.equal(sidebarShortcut({ ...event, ctrlKey: false }, false), false);
});
