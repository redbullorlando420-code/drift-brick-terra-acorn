import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/curation-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0curation-fixture",
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
                "src/lib/videos/persist.ts",
                "src/lib/local-profiles.ts",
                "src/lib/videos/film-review.ts",
              ]
                .map(
                  (f) => "export * from " + JSON.stringify(resolve(f).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const code = (await bundle.generate({ format: "esm" })).output.find((r) => r.type === "chunk").code;
await bundle.close();
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text()))
        report.errors.push(m.text() + " " + m.location().url);
    });
    await context.route("**/__curation-fixture.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__curation-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><p>Disposable curation fixture</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/api/network-presence", (r) =>
      r.fulfill({ contentType: "application/json", body: '{"devices":[]}' }),
    );
    let brokenAttempts = 0;
    await context.route("https://images.example.test/**", (r) =>
      r.request().url().includes("broken") && ++brokenAttempts === 1
        ? r.abort("failed")
        : r.fulfill({
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240"/>',
          }),
    );
    await context.route("https://i.ytimg.com/**", (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>',
      }),
    );
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
      }),
    );
    await context.addInitScript(() => {
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (window.__quotaKeys?.includes(k))
          throw new DOMException("Controlled quota", "QuotaExceededError");
        return set.call(this, k, v);
      };
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (v, k) {
        if (window.__quotaFilm && this.name === "activity" && k === "film-reviews")
          throw new DOMException("Controlled quota", "QuotaExceededError");
        return put.call(this, v, k);
      };
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const openImports = async () => {
      const root = page.locator("[data-movie-import]");
      if ((await root.getAttribute("open")) === null)
        await root.locator(":scope > summary").click();
      return page.getByRole("region", { name: "Movie import review" });
    };
    const load = async (doc) => {
      const p = await openImports();
      await p.getByLabel("Movie import JSON", { exact: true }).setInputFiles({
        name: "review.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(doc)),
      });
      await p.getByRole("button", { name: "Preview movie import", exact: true }).click();
      await p.locator("[data-movie-import-row]").first().waitFor();
      return p;
    };
    const choose = async (p, id, key) =>
      p.getByRole("combobox", { name: "Movie match " + id, exact: true }).selectOption(key);
    const accept = async (p) => {
      await p
        .getByRole("checkbox", {
          name: "I reviewed the movie import matches and fields",
          exact: true,
        })
        .check();
      await p.getByRole("button", { name: "Apply reviewed movie import", exact: true }).click();
    };
    const filmLedger = () =>
        page.evaluate(() => JSON.parse(localStorage.getItem("reelcase.film-reviews.v1"))),
      marks = () =>
        page.evaluate(async () => {
          const p = await import("/__curation-fixture.mjs"),
            db = await new Promise((res, rej) => {
              const r = indexedDB.open("reelcase");
              r.onsuccess = () => res(r.result);
              r.onerror = () => rej(r.error);
            });
          try {
            const prefs = await new Promise((res, rej) => {
              const r = db.transaction("activity").objectStore("activity").get("preferences");
              r.onsuccess = () => res(r.result);
              r.onerror = () => rej(r.error);
            });
            return {
              resume: await p.restoreDurableResume(),
              tags: prefs?.sparseMetadataRecords?.tags ?? prefs?.tags ?? null,
            };
          } finally {
            db.close();
          }
        });
    const evidence = {
      format: "realhub-film-evidence",
      version: 1,
      name: "Owned Dune metadata",
      source: "Reviewed local export",
      rows: [
        {
          id: "one",
          filmId: "film:original",
          title: "Dune renamed by source",
          year: 2000,
          genre: "Science fiction",
          identifier: "imdb:tt0087182",
          poster: "https://images.example.test/poster.svg",
        },
        { id: "ambiguous", title: "Dune", year: 1984, genre: "Drama" },
        {
          id: "secret",
          filmId: "film:secret",
          title: "CANARY PRIVATE",
          year: 1984,
          genre: "Secret",
        },
      ],
    };
    const collection = {
      format: "realhub-movie-collection",
      version: 1,
      name: "Movie night",
      source: "Owner collection file",
      rows: [
        { id: "original", title: "Dune", year: 1984 },
        { id: "remake", title: "Dune", year: 2021 },
        { id: "trailer", title: "Dune Trailer", year: 1984 },
        { id: "lecture", title: "Physics Lecture", year: 1984 },
      ],
    };
    try {
      await page.goto(new URL("/__curation-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__curation-fixture.mjs"),
          now = Date.now(),
          folder = "qa-public";
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem("reelcase.pull-settings.v1", '{"automaticPulls":false}');
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          '{"library":true,"workspace":true,"tools":true}',
        );
        const row = (id, name, duration = 7200, folderId = folder) => ({
          id,
          name,
          folderId,
          path: "",
          extension: "yt",
          mime: "video/youtube",
          size: 0,
          duration,
          addedAt: 1,
          remote: {
            kind: "youtube",
            videoId: "v" + id.replace(/\W/g, "").slice(0, 10).padEnd(10, "0"),
            channelName: "Curation fixture",
            youtubeType: "upload",
          },
        });
        const movies = [
          row("movie-a", "Dune (1984)"),
          row("movie-a2", "Dune (1984) Extended"),
          row("movie-b", "Dune (2021)"),
          row("movie-c", "Dune (1984) Another identity"),
          row("trailer", "Dune Trailer (1984)", 900),
          row("lecture", "Physics Lecture (1984)"),
          row("private", "CANARY PRIVATE (1984)", 7200, "qa-private"),
        ];
        const anime = [
          row("ep1", "Moon Runner S01E01", 1400),
          row("ep2", "Moon Runner S01E02", 1400),
          row("ep4", "Moon Runner S01E04", 1400),
          row("ep4-alt", "Moon Runner S01E04 Alternative", 1400),
          row("absolute", "Moon Runner absolute 1", 1400),
          row("unknown", "Moon Runner unnumbered", 1400),
        ];
        await p.appendCatalogVideos([...movies, ...anime]);
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            { id: folder, name: "Curation fixtures", kind: "youtube", videoCount: 12 },
            { id: "qa-private", name: "Private fixtures", kind: "youtube", videoCount: 1 },
          ],
          checkedAt: 1,
        });
        p.savePrefs({
          ...p.loadPrefs(),
          hideDemo: true,
          privateFolderIds: ["qa-private"],
          sourceId: "home",
          follows: [],
          tags: Object.fromEntries(anime.map((v) => [v.id, ["anime"]])),
        });
        await p.waitForPrefsWrites();
        let l = p.EMPTY_FILMS;
        for (const [id, filmId, title, year] of [
          ["movie-a", "film:original", "Dune", 1984],
          ["movie-a2", "film:original", "Dune", 1984],
          ["movie-b", "film:remake", "Dune", 2021],
          ["movie-c", "film:alternate", "Dune", 1984],
          ["private", "film:secret", "CANARY PRIVATE", 1984],
        ])
          l = p.confirmFilm(
            l,
            id,
            {
              filmId,
              title,
              year,
              runtime: 7200,
              edition: "Theatrical",
              existing: Boolean(l.films[filmId]),
            },
            now,
          );
        await p.saveFilmReviews(l);
        await p.saveAnimeReviews({
          version: 1,
          updatedAt: now,
          series: {
            "anime:moon": {
              id: "anime:moon",
              title: "Moon Runner",
              release: "Original",
              aliases: [],
              ranges: [{ numbering: "season", season: 1, start: 1, end: 4 }],
              policy: { numbering: "season", threshold: 0.95, specials: false },
              at: now,
            },
          },
          episodes: Object.fromEntries(
            anime.map((v, i) => [
              v.id,
              {
                seriesId: "anime:moon",
                numbering: i === 4 ? "absolute" : "season",
                season: i === 4 ? 0 : 1,
                ...(i === 5 ? {} : { episode: [1, 2, 4, 4, 1][i] }),
                kind: i === 5 ? "unresolved" : "episode",
                preferred: false,
                at: now,
              },
            ]),
          ),
        });
        const resume = {
          progress: {
            ep1: { t: 1390, d: 1400, at: now - 1000 },
            ep2: { t: 500, d: 1400, at: now - 900 },
            ep4: { t: 1390, d: 1400, at: now - 800 },
          },
          resumeProgress: {},
          savedAt: now,
        };
        p.savePrefs({ ...p.loadPrefs(), progress: resume.progress, resumeProgress: {} });
        await p.waitForPrefsWrites();
        await p.saveActivitySnapshot({ ...resume, history: [], viewCounts: {} });
        localStorage.setItem("reelcase.resume.v1", JSON.stringify(resume));
        const db = await new Promise((res, rej) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
        await new Promise((res, rej) => {
          const tx = db.transaction("activity", "readwrite");
          tx.objectStore("activity").put(resume, "resume");
          tx.oncomplete = res;
          tx.onerror = () => rej(tx.error);
        });
        db.close();
        sessionStorage.setItem(
          "qa-curation-profile",
          (await p.createLocalProfile("Curation alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      const before = await marks();
      await nav("Movies");
      await page.locator('[data-movie-catalog="4"]').waitFor();
      let panel = await load(evidence);
      await panel
        .locator('[data-movie-import-row="ambiguous"]')
        .getByText("ambiguous", { exact: true })
        .waitFor();
      assert.equal(
        await panel
          .getByRole("combobox", { name: "Movie match secret", exact: true })
          .locator("option")
          .count(),
        1,
      );
      assert.equal((await filmLedger()).films["film:original"].genre, undefined);
      await choose(panel, "one", "film:original");
      assert(
        await panel.getByRole("checkbox", { name: "Import one poster", exact: true }).isDisabled(),
      );
      await panel.getByRole("button", { name: "Preview imported poster one", exact: true }).click();
      await panel.getByRole("checkbox", { name: "Import one poster", exact: true }).check();
      await panel
        .locator('[data-movie-import-row="one"]')
        .getByText(/title: Dune → Dune renamed by source · locked/)
        .waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "metadata preview fits viewport",
      );
      await panel.locator('[data-movie-import-row="one"]').scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-metadata-mobile.png" : "-metadata-desktop.png"),
      });
      await accept(panel);
      await panel.getByRole("status").filter({ hasText: "Reviewed metadata saved" }).waitFor();
      let saved = await filmLedger();
      assert.equal(saved.films["film:original"].genre, "Science fiction");
      assert.equal(saved.films["film:original"].poster, "https://images.example.test/poster.svg");
      assert.equal(saved.films["film:original"].year, 1984);
      assert.equal(saved.films["film:original"].title, "Dune");
      assert.equal(saved.importReceipt.rows.length, 1);
      assert.deepEqual(await marks(), before);
      report.checks.push(
        "Metadata preview distinguishes exact IDs, ambiguity and private exclusion; explicit Apply preserves owner identity locks and personal history while saving a reviewed receipt",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Movies");
      await page.locator('[data-movie-catalog="4"]').waitFor();
      panel = await openImports();
      await panel.getByRole("button", { name: "Undo metadata import", exact: true }).click();
      await page.waitForFunction(
        () =>
          !JSON.parse(localStorage.getItem("reelcase.film-reviews.v1")).films["film:original"]
            .genre,
      );
      report.checks.push(
        "Metadata inverse patch and receipt survive reload; Undo restores prior evidence without rewriting source classification",
      );
      panel = await load({
        ...evidence,
        rows: [{ ...evidence.rows[0], poster: "https://images.example.test/broken.svg" }],
      });
      await choose(panel, "one", "film:original");
      await panel.getByRole("button", { name: "Preview imported poster one", exact: true }).click();
      await panel.getByText(/Poster preview failed/).waitFor();
      assert(
        await panel.getByRole("checkbox", { name: "Import one poster", exact: true }).isDisabled(),
      );
      await panel.getByRole("button", { name: "Preview imported poster one", exact: true }).click();
      await panel
        .getByText("Poster preview loaded. Select its field to include it.", { exact: true })
        .waitFor();
      assert.equal(
        await panel.getByRole("checkbox", { name: "Import one poster", exact: true }).isEnabled(),
        true,
      );
      assert.equal((await filmLedger()).films["film:original"].poster, undefined);
      report.errors = report.errors.filter(
        (e) => !e.includes("https://images.example.test/broken.svg"),
      );
      panel = await load(evidence);
      await choose(panel, "one", "film:original");
      await page.evaluate(() => {
        window.__quotaKeys = ["reelcase.film-reviews.v1"];
        window.__quotaFilm = true;
      });
      await accept(panel);
      await panel
        .getByRole("alert")
        .filter({ hasText: /could not save/ })
        .waitFor();
      assert.equal((await filmLedger()).films["film:original"].genre, undefined);
      await page.evaluate(() => {
        window.__quotaKeys = [];
        window.__quotaFilm = false;
      });
      await accept(panel);
      await panel.getByRole("status").filter({ hasText: "Reviewed metadata saved" }).waitFor();
      panel = await load(collection);
      await choose(panel, "original", "film:original");
      await choose(panel, "remake", "film:remake");
      assert.equal(
        await panel
          .getByRole("combobox", { name: "Movie match trailer", exact: true })
          .locator("option")
          .count(),
        1,
      );
      assert.equal(
        await panel
          .getByRole("combobox", { name: "Movie match lecture", exact: true })
          .locator("option")
          .count(),
        1,
      );
      await page.evaluate(() => (window.__quotaKeys = ["reelcase.movie-collections.v1"]));
      await accept(panel);
      await panel.getByRole("alert").filter({ hasText: /quota/ }).waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.movie-collections.v1")),
        null,
      );
      await page.evaluate(() => (window.__quotaKeys = []));
      await accept(panel);
      await panel.getByRole("status").filter({ hasText: "Reviewed collection saved" }).waitFor();
      const id = await page.evaluate(
        () => JSON.parse(localStorage.getItem("reelcase.movie-collections.v1")).collections[0].id,
      );
      await page.getByRole("combobox", { name: "Movie collection", exact: true }).selectOption(id);
      await page.getByText("3 matching films", { exact: false }).waitFor();
      assert.equal(
        await page.locator("[data-movie-catalog]").getAttribute("data-movie-catalog"),
        "4",
      );
      await panel.getByText("Last collection review receipt", { exact: true }).click();
      await panel.getByText("Dune Trailer · rejected", { exact: true }).waitFor();
      await panel.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "collection preview fits viewport",
      );
      await page.screenshot({
        path: output.replace(".json", mobile ? "-movies-mobile.png" : "-movies-desktop.png"),
      });
      report.checks.push(
        "Movie collection imports retain rejected trailer/lecture rows, filter real movie memberships across editions, leave eligibility unchanged and preserve durable state on quota failures",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Movies");
      await page
        .getByRole("combobox", { name: "Movie collection", exact: true })
        .locator('option[value="' + id + '"]')
        .waitFor({ state: "attached" });
      panel = await openImports();
      await panel.getByRole("button", { name: "Undo collection import", exact: true }).click();
      assert.equal(
        await page
          .getByRole("combobox", { name: "Movie collection", exact: true })
          .locator("option")
          .count(),
        1,
      );
      await panel.getByRole("button", { name: "Undo collection import", exact: true }).click();
      assert.equal(
        await page
          .getByRole("combobox", { name: "Movie collection", exact: true })
          .locator("option")
          .count(),
        2,
      );
      panel=await load({...evidence,name:'Identifier-only review',rows:[{id:'identity-only',filmId:'film:remake',title:'Dune',year:2021,identifier:'tmdb:438631'}]});
      await choose(panel,'identity-only','film:remake');await accept(panel);
      await panel.getByRole('status').filter({hasText:'Reviewed metadata saved'}).waitFor();
      assert.equal((await filmLedger()).importReceipt.rows[0].identifier,'tmdb:438631');
      assert.equal((await filmLedger()).films['film:remake'].title,'Dune');
      await panel.getByRole('button',{name:'Undo metadata import',exact:true}).click();
      await page.waitForFunction(()=>JSON.parse(localStorage.getItem('reelcase.film-reviews.v1')).importReceipt.rows[0].identifier==='imdb:tt0087182');
      await nav("Anime");
      await page.locator('[data-anime-ready="true"]').waitFor();
      await page.getByRole("button", { name: /Open episode map: Moon Runner/ }).click();
      let tracking = page.locator('[data-series-progress="anime:moon"]');
      await tracking
        .getByText("2 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      await tracking.getByText("Correct or reset series tracking", { exact: true }).click();
      await tracking
        .getByRole("combobox", { name: "Series decision season:1:episode:2", exact: true })
        .selectOption("watched");
      await tracking
        .getByText("3 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      assert.deepEqual(await marks(), before);
      await tracking
        .getByRole("checkbox", { name: "I want to reset only this series tracking", exact: true })
        .check();
      await tracking
        .getByRole("button", { name: "Reset this series tracking", exact: true })
        .click();
      await tracking
        .getByText("0 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Anime");
      await page.locator('[data-anime-ready="true"]').waitFor();
      await page.getByRole("button", { name: /Open episode map: Moon Runner/ }).click();
      tracking = page.locator('[data-series-progress="anime:moon"]');
      await tracking
        .getByText("0 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      await tracking.getByText("Correct or reset series tracking", { exact: true }).click();
      await tracking
        .getByRole("button", { name: "Undo series tracking change", exact: true })
        .click();
      await tracking
        .getByText("3 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      assert.deepEqual(await marks(), before);
      await page.evaluate(() => (window.__quotaKeys = ["reelcase.series-progress.v1"]));
      await tracking
        .getByRole("combobox", { name: "Series decision season:1:episode:1", exact: true })
        .selectOption("unwatched");
      await tracking.getByRole("alert").filter({ hasText: /quota/ }).waitFor();
      await tracking
        .getByText("3 / 3 known episodes tracked as watched", { exact: true })
        .waitFor();
      await page.evaluate(() => (window.__quotaKeys = []));
      await tracking.getByRole('button',{name:'Reload series tracking',exact:true}).click();
      await tracking.getByRole('alert').waitFor({state:'detached'});
      await tracking.getByText('3 / 3 known episodes tracked as watched',{exact:true}).waitFor();
      await tracking.scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "series corrections fit viewport",
      );
      await page.screenshot({
        path: output.replace(".json", mobile ? "-series-mobile.png" : "-series-desktop.png"),
      });
      report.checks.push(
        "Series summaries count duplicate editions once, exclude missing/alternate/unresolved entries, support owner corrections and durable reset/undo, and preserve resume/history after quota rejection",
      );
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-curation-profile"),
        ),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Movies");
      assert.equal(
        await page
          .getByRole("combobox", { name: "Movie collection", exact: true })
          .locator("option")
          .count(),
        1,
      );
      panel = await openImports();
      assert.equal(
        await panel.getByRole("button", { name: "Undo metadata import", exact: true }).count(),
        0,
      );
      await nav("Anime");
      await page.locator('[data-anime-ready="true"]').waitFor();
      assert.equal(await page.locator("[data-series-progress]").count(), 0);
      await page.evaluate(() =>
        sessionStorage.setItem("realhub.active-local-profile.v1", "default"),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      assert.deepEqual(await marks(), before);
      report.checks.push(
        "A separate saved local profile cannot read the original profile’s movie receipts, collections or series decisions; returning preserves all original playback marks",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(report.errors, []);
    } catch (e) {
      report.error = e.stack;
      report.body = (await page.locator("body").innerText()).slice(-10000);
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.close();
      await writeFile(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Disposable profiles, saved film/anime evidence and controlled provider assets. No external movie database verification, actual media playback or physical-phone certification.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
