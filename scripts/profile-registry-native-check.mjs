import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
import { profileRegistryStorageFixture } from "./profile-registry-storage-fixture.mjs";
import { profileSettingsStorageFixture } from './profile-settings-storage-fixture.mjs';
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone83-native.json", [
    resolve("screenshots"),
  ]);
const entry = "\0profile-fixture",
  bundle = await rolldown({
    input: entry,
    plugins: [
      {
        name: "fixture",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? ["src/lib/local-profile-storage.ts", "src/lib/local-profiles.ts"]
                .map(
                  (p) => "export * from " + JSON.stringify(resolve(p).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  }),
  built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((o) => o.type === "chunk").code,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  context = await browser.newContext(),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await context.route("**/__profile-fixture.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Isolated local profile fixture</title><p>Disposable profile storage tests</p>",
    }),
  );
  await context.route("**/__profile-fixture.mjs", (r) =>
    r.fulfill({ contentType: "text/javascript", body: code }),
  );
  await page.goto(new URL("/__profile-fixture.html", url).href);
  await page.evaluate(async () => {
    window.__p = await import("/__profile-fixture.mjs");
  });
  const checks = await page.evaluate(
    (source) => (0, eval)("(" + source + ")")(window.__p),
    profileRegistryStorageFixture.toString(),
  );
  checks.push(...await page.evaluate(source => (0,eval)('('+source+')')(window.__p),profileSettingsStorageFixture.toString()));
  if (errors.length) throw Error(errors.join("\n"));
  await writeFile(
    out,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "New adapter and registry only; no broad application migration was applied. Disposable browser context and database.",
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
