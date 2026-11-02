import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { sourceVisibilityStorageFixture as libraryRestoreStorageFixture } from "./source-visibility-storage-fixture.mjs";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone82-native.json", [
    resolve("screenshots"),
  ]);
const entry = "\0restore-native",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "fixture",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? [
                "src/lib/restore-epoch.ts",
                "src/lib/writer-lease.ts",
                "src/lib/videos/restore-snapshot.ts",
                "src/lib/videos/library-restore-repository.ts",
                "src/lib/videos/source-visibility.ts",
              ]
                .map(
                  (p) => "export * from " + JSON.stringify(resolve(p).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  }),
  generated = await bundle.generate({ format: "esm" });
await bundle.close();
const code = generated.output.find((o) => o.type === "chunk").code,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  context = await browser.newContext(),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await context.route("**/__restore-native.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Isolated restore storage test</title><p>Native IndexedDB fault fixture</p>",
    }),
  );
  await context.route("**/__restore-native.mjs", (r) =>
    r.fulfill({ contentType: "text/javascript", body: code }),
  );
  await page.goto(new URL("/__restore-native.html", url).href);
  await page.evaluate(async () => {
    window.__probe = await import("/__restore-native.mjs");
  });
  const checks = await page.evaluate(
    async (source) => (0, eval)("(" + source + ")")(window.__probe),
    libraryRestoreStorageFixture.toString(),
  );
  if (errors.length) throw Error(errors.join("\n"));
  await writeFile(
    out,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Native browser IndexedDB and localStorage in a new isolated context; no actual user data modified.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
} catch (e) {
  await writeFile(out, JSON.stringify({ ok: false, error: e.stack, errors }, null, 2));
  throw e;
} finally {
  await context.close();
  await browser.close();
}
