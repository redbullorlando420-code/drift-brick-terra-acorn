import test from "node:test";
import assert from "node:assert/strict";
import {
  platformContract,
  supportedCapabilities,
  platformActionIssue,
  configuredRootPaths,
} from "../companion/platform-contract.mjs";
import { negotiateCompanion, companionPathFeature } from "../src/lib/companion-protocol.ts";
test("Windows, POSIX and legacy-semicolon root declarations use explicit absolute path rules", () => {
  assert.deepEqual(configuredRootPaths("C:\\Media;E:\\Models;relative", "win32"), [
    "C:\\Media",
    "E:\\Models",
  ]);
  assert.deepEqual(configuredRootPaths("/srv/media:/home/me/Models:relative", "linux"), [
    "/srv/media",
    "/home/me/Models",
  ]);
  assert.deepEqual(configuredRootPaths("/Volumes/Media;/Users/me/Models", "darwin"), [
    "/Volumes/Media",
    "/Users/me/Models",
  ]);
  assert.equal(configuredRootPaths(Array(100).fill("/x").join(":"), "linux").length, 1);
  assert.deepEqual(configuredRootPaths("relative", "linux"), []);
});
test("portable file features remain available while desktop-only capability claims are removed on other OSes", () => {
  const caps = [
    "root-access",
    "prints-bridge",
    "print-save-transaction",
    "media-inspection",
    "youtube-downloads",
    "launch",
    "launch-receipts",
    "shortcut-catalog",
    "shortcut-icons",
    "steam-epic-catalog",
    "tray-autostart",
    "tray-notifications",
  ];
  for (const os of ["linux", "darwin", "other"]) {
    const filtered = supportedCapabilities(caps, os);
    assert.deepEqual(filtered, caps.slice(0, 5));
    const contract = platformContract(os);
    assert.equal(contract.windowsDesktop, false);
    assert.equal(contract.nativeDesktopVerified, false);
    assert.equal(contract.nativeInstallers, "external-setup");
  }
  assert.deepEqual(supportedCapabilities(caps, "win32"), caps);
});
test("unsupported native route families fail before Windows launch, registry, shortcut, tray or installer dispatch", () => {
  for (const os of ["linux", "darwin", "other"]) {
    for (const route of [
      "/launch",
      "/launch-receipts",
      "/shortcuts?limit=10",
      "/shortcut-icons",
      "/games/steam-epic",
      "/tray/autostart",
      "/tray/notify",
      "/studio/start",
      "/studio/qwen/start",
    ])
      assert(platformActionIssue(route, os), route);
    for (const route of [
      "/health",
      "/roots/status",
      "/prints/transactions/review",
      "/inspect-media",
      "/youtube/downloads",
      "/studio/status",
      "/studio/generate",
    ])
      assert.equal(platformActionIssue(route, os), null, route);
  }
  assert.equal(platformActionIssue("/launch", "win32"), null);
});
test("browser negotiation trusts the Companion OS rather than the browser OS and rejects contradictory desktop capability claims", () => {
  const health = {
    ok: true,
    service: "reelcase-companion",
    version: 17,
    protocol: { major: 1, minor: 0 },
    platform: { schema: 1, os: "linux" },
    capabilities: ["launch", "tray-autostart", "print-save-transaction", "prints-bridge"],
  };
  assert.deepEqual(negotiateCompanion(health).capabilities, [
    "print-save-transaction",
    "prints-bridge",
  ]);
  assert(
    negotiateCompanion({ ...health, platform: { schema: 1, os: "win32" } }).capabilities.includes(
      "launch",
    ),
  );
  assert(
    negotiateCompanion({ ...health, platform: undefined }).capabilities.includes("launch"),
    "older services retain explicit advertised compatibility without an inferred OS",
  );
  assert.equal(companionPathFeature("/prints/transactions/review"), "print-save-transaction");
  assert.equal(companionPathFeature("/tray/notify"), "tray-notifications");
});
