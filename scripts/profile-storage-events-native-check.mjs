import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone83-profile-events.json", [
  resolve("screenshots"),
]);
const bundle = await rolldown({ input: resolve("src/lib/local-profile-storage.ts") });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext(),
  errors = [];
const a = "p-11111111-1111-4111-8111-111111111111",
  b = "p-22222222-2222-4222-8222-222222222222";
try {
  await context.route("**/__profile-events.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Disposable profile event test</title><p>Native cross-tab storage test</p>",
    }),
  );
  await context.route("**/__profile-events.mjs", (r) =>
    r.fulfill({ contentType: "text/javascript", body: code }),
  );
  async function open(id) {
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(new URL("/__profile-events.html", url).href);
    await page.evaluate(async (id) => {
      sessionStorage.setItem("realhub.active-local-profile.v1", id);
      window.__adapter = await import("/__profile-events.mjs");
      window.__events = [];
      addEventListener("storage", (e) => window.__events.push({ key: e.key, value: e.newValue }));
    }, id);
    return page;
  }
  const first = await open(a),
    same = await open(a),
    other = await open(b),
    legacy = await open("default");
  await first.evaluate(() => window.__adapter.profileLocalStorage.setItem("reelcase.test", "A"));
  await same.waitForFunction(() =>
    window.__events.some((e) => e.key === "reelcase.test" && e.value === "A"),
  );
  await first.evaluate(() => localStorage.setItem("better-auth:test-barrier", "one"));
  for (const page of [same, other, legacy])
    await page.waitForFunction(() =>
      window.__events.some((e) => e.key === "better-auth:test-barrier" && e.value === "one"),
    );
  assert.equal(
    await other.evaluate(() => window.__events.some((e) => e.key === "reelcase.test")),
    false,
  );
  assert.equal(
    await legacy.evaluate(() => window.__events.some((e) => e.key === "reelcase.test")),
    false,
  );
  assert.equal(
    await same.evaluate(() => window.__adapter.profileLocalStorage.getItem("reelcase.test")),
    "A",
  );
  assert.equal(
    await other.evaluate(() => window.__adapter.profileLocalStorage.getItem("reelcase.test")),
    null,
  );
  await legacy.evaluate(() =>
    window.__adapter.profileLocalStorage.setItem("reelcase.legacy", "Default"),
  );
  await legacy.evaluate(() => localStorage.setItem("better-auth:test-barrier", "two"));
  for (const page of [first, same, other])
    await page.waitForFunction(() =>
      window.__events.some((e) => e.key === "better-auth:test-barrier" && e.value === "two"),
    );
  assert.equal(
    await same.evaluate(() => window.__events.some((e) => e.key === "reelcase.legacy")),
    false,
  );
  assert.equal(
    await other.evaluate(() => window.__events.some((e) => e.key === "reelcase.legacy")),
    false,
  );
  await first.evaluate((id) => {
    sessionStorage.setItem("realhub.active-local-profile.v1", id);
    window.__adapter.profileLocalStorage.setItem("reelcase.late", "still A");
  }, b);
  await same.waitForFunction(() => window.__events.some((e) => e.key === "reelcase.late"));
  assert.equal(
    await other.evaluate(() => window.__adapter.profileLocalStorage.getItem("reelcase.late")),
    null,
  );
  assert.equal(await first.evaluate(() => window.__adapter.currentProfileId()), a);
  assert.deepEqual(errors, []);
  const checks = [
    "Same-profile native events translated once",
    "Other profiles do not receive personal changes",
    "Default personal events filtered in new profiles",
    "Auth transport remains global",
    "Selection changes cannot redirect an existing document",
  ];
  await writeFile(
    out,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Unintegrated adapter in four disposable tabs; existing application sources were not migrated.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ ok: true, checks }));
} finally {
  await context.close();
  await browser.close();
}
