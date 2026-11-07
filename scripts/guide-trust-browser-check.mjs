import assert from "node:assert/strict";
import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/guide-trust-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0guide-trust-fixture",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "fixture",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? ["src/lib/videos/persist.ts", "src/lib/local-profiles.ts", "src/lib/local-profile-storage.ts", "src/lib/videos/guide-picks.ts"]
                .map(
                  (file) =>
                    "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((r) => r.type === "chunk").code;
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
    page.setDefaultTimeout(30000);
    page.on("response",r=>{if(r.status()>=400)console.log("QA response",r.status(),r.url());});
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    await context.route("**/__trust-fixture.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__trust-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><p>Disposable Guide trust fixture</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
      }),
    );
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const scope = mobile ? page.getByRole("dialog") : page.locator("aside"),
        target = scope.getByRole("button", { name: new RegExp("^" + name + "(?:\\s|$)") });
      if (name === "AI guide") {
        const group = scope.locator('button[aria-controls$="-tools"]');
        if ((await group.getAttribute("aria-expanded")) === "false") await group.click();
      }
      await target.click();
    };
    const ready = () => page.locator('[data-guide-catalog][data-guide-pending="false"]').waitFor();
    const controls = page.locator("[data-guide-diversity-control]"),
      mix = page.locator("[data-guide-picks]");
    const ask = async (text) => {
      await page.getByLabel("Library guide question", { exact: true }).fill(text);
      await page.getByRole("button", { name: "Ask guide", exact: true }).click();
      await page.locator("[data-guide-answer]").waitFor();
    };
    try {
      await page.goto(new URL("/__trust-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__trust-fixture.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem("reelcase.pull-settings.v1", '{"automaticPulls":false}');
        localStorage.setItem("reelcase.artwork-mode", "text");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        const row = (id, creator, kind = "twitch", old = false) => ({
          id,
          name: "Racing title " + id,
          folderId: kind === "twitch" ? "qa-twitch" : "qa-youtube",
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 1,
          duration: 1800,
          addedAt: old ? Date.UTC(2020, 0, 1) : Date.now() - 86400000,
          remote: {
            kind,
            videoId: id,
            channelName: creator,
            publishedSource: "provider",
            publishedPrecision: "day",
            publishedDate: old ? "2020-01-01" : "2026-11-01",
            description: "Provider body stays separate from owner tag attribution",
            ...(id === "alt-1" ? { youtubeKeywords: ["sailing"] } : {}),
          },
        });
        const dominant = Array.from({ length: 25 }, (_, i) => row("dominant-" + i, "Dominant QA")),
          alt = Array.from({ length: 14 }, (_, i) =>
            row("alt-" + i, "Alternative QA " + i, i === 1 ? "twitch" : "youtube", i < 8),
          ),
          origin = row("origin", "Origin QA"),
          privateRow = {
            ...row("private", "Private QA", "youtube", true),
            name: "PRIVATE TRUST SENTINEL",
            privateRetention: true,
          };
        await p.appendCatalogVideos([...dominant, ...alt, origin, privateRow]);
        const tags = {
            origin: ["iracing"],
            "alt-0": ["iracing"],
            "alt-1": ["sailing"],
            "alt-2": ["sailing"],
            "alt-3": ["sailing"],
          },
          metadataProvenance = {
            origin: { tags: { iracing: "legacy" } },
            "alt-0": { tags: { iracing: "manual" }, lockedFields: ["tags"] },
            "alt-1": { tags: { sailing: "provider:twitch" } },
            "alt-3": { tags: {}, lockedFields: ["tags"] },
            "alt-2": { tags: { sailing: "provider:youtube" }, lockedFields: ["tags"] },
          };
        p.savePrefs({ ...p.loadPrefs(), sourceId: "home", follows: [], tags, metadataProvenance });
        await p.waitForPrefsWrites();
        await p.saveDurableShelves([...dominant.map((r) => r.id), "origin"], []);
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            { id: "qa-twitch", name: "Twitch fixture", kind: "twitch", videoCount: 26 },
            { id: "qa-youtube", name: "YouTube fixture", kind: "youtube", videoCount: 15 },
          ],
          checkedAt: 1,
        });
        sessionStorage.setItem(
          "qa-other-profile",
          (await p.createLocalProfile("Guide trust alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("AI guide");
      await ready();
      const before = await mix
        .locator("[data-guide-suggestion]")
        .evaluateAll((rows) => rows.map((r) => r.getAttribute("data-guide-suggestion")));
      assert.equal(before.length, 12);
      assert(before.filter((id) => id.startsWith("dominant-")).length >= 11);
      await controls.locator("summary").click();
      await controls.getByLabel("Maximum Guide creator share", { exact: true }).selectOption("50");
      await controls.getByLabel("Minimum Guide sources", { exact: true }).selectOption("2");
      await controls.getByLabel("Guide older publication floor", { exact: true }).selectOption("2");
      assert.deepEqual(
        await mix
          .locator("[data-guide-suggestion]")
          .evaluateAll((rows) => rows.map((r) => r.getAttribute("data-guide-suggestion"))),
        before,
      );
      await controls.getByRole("button", { name: "Apply diversity floors", exact: true }).click();
      await ready();
      const result = page.getByLabel("Applied diversity result", { exact: true }).first();
      await result.getByText("Diversity floors met · 12 shown", { exact: true }).waitFor();
      const after = await mix
        .locator("[data-guide-suggestion]")
        .evaluateAll((rows) => rows.map((r) => r.getAttribute("data-guide-suggestion")));
      assert(after.filter((id) => id.startsWith("dominant-")).length <= 6);
      assert(after.some((id) => id.startsWith("alt-")));
      assert(
        !(await page.locator("[data-guide-catalog]").textContent()).includes(
          "PRIVATE TRUST SENTINEL",
        ),
      );
      report.checks.push(
        "Default ranking remains intact until explicit Apply; creator/source/publication floors change real picks and exclude private content",
      );
      await page.locator('[data-guide-report="mix"] summary').click();
      const downloadWait = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export mix fairness report", exact: true }).click();
      const download = await downloadWait,
        body = await readFile(await download.path(), "utf8"),
        exported = JSON.parse(body);
      assert.equal(exported.diversity.met, true);
      for (const forbidden of [
        "Dominant QA",
        "PRIVATE TRUST SENTINEL",
        "Racing title",
        "alt-0",
        "iracing",
      ])
        assert(!body.includes(forbidden));
      await ask("iracing");
      const answer = page.locator("[data-guide-answer]"),
        candidate = answer.locator('[data-guide-suggestion="alt-0"]');
      await candidate.locator("[data-guide-evidence] > summary").click();
      await candidate.locator('[data-reason-provenance="owner"]').waitFor();
      await candidate.locator("[data-reason-provenance-inspect] > summary").click();
      await candidate.getByText(/matched tag carries explicit owner attribution/).waitFor();
      assert(
        (await answer.getByLabel("Applied diversity result").textContent()).includes(
          "limited or unverified",
        ),
      );
      await candidate.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-provenance.png`),
      });
      await ask("sailing");
      for (const [id, kind] of [
        ["alt-1", "provider"],
        ["alt-2", "conflict"],
        ["alt-3", "unknown"],
      ]) {
        const card = page.locator("[data-guide-answer]").locator(`[data-guide-suggestion="${id}"]`);
        await card.locator("[data-guide-evidence] > summary").click();
        await card.locator(`[data-reason-provenance="${kind}"]`).waitFor();
      }
      await ask("unfindabletrustfixture");
      await page
        .locator("[data-guide-answer]")
        .getByText(/No eligible public titles/)
        .waitFor();
      assert.equal(await page.locator("[data-guide-answer] [data-reason-provenance]").count(), 0);
      report.checks.push(
        "Exact-field owner/provider/conflict/missing provenance; no stale excerpts after new questions; constrained queries report infeasibility; aggregate download omits identities",
      );
      await nav("Home");
      await nav("AI guide");
      await ready();
      await controls.locator("summary").click();
      assert.equal(
        await controls.getByLabel("Maximum Guide creator share", { exact: true }).inputValue(),
        "50",
      );
      await page.locator("[data-recommendation-session] > summary").click();
      await page.getByLabel("Guide source mix", { exact: true }).selectOption("twitch");
      await page.getByRole("button", { name: "Apply session mix", exact: true }).click();
      await ready();
      await page
        .getByLabel("Applied diversity result", { exact: true })
        .first()
        .getByText(/source floor could not be met/)
        .waitFor();
      assert(
        (
          await mix
            .locator("[data-guide-suggestion]")
            .evaluateAll((rows) => rows.map((r) => r.getAttribute("data-guide-suggestion")))
        ).every((id) => !id.startsWith("alt-") || id === "alt-1"),
      );
      await controls.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-controls.png`),
      });
      await controls.getByRole("button", { name: "Reset diversity floors", exact: true }).click();
      await ready();
      assert.equal(await page.getByLabel("Applied diversity result", { exact: true }).count(), 0);
      await controls.getByLabel("Maximum Guide creator share", { exact: true }).selectOption("50");
      await controls.getByRole("button", { name: "Apply diversity floors", exact: true }).click();
      await ready();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("AI guide");
      await ready();
      await controls.locator("summary").click();
      assert.equal(
        await controls.getByLabel("Maximum Guide creator share", { exact: true }).inputValue(),
        "100",
      );
      assert.equal(await page.getByLabel("Applied diversity result", { exact: true }).count(), 0);
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-other-profile"),
        ),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("AI guide");
      await ready();
      assert.equal(await mix.locator("[data-guide-suggestion]").count(), 0);
      assert(
        !(await page.locator("[data-guide-catalog]").textContent()).includes(
          "PRIVATE TRUST SENTINEL",
        ),
      );
      await page.goto(new URL('/__trust-blank.html',url).href);
      await page.evaluate(async()=>{const p=await import('/__trust-fixture.mjs');p.profileLocalStorage.setItem('reelcase.pulls-paused.v1','true');p.profileLocalStorage.setItem('reelcase.pull-settings.v1','{"automaticPulls":false}');p.profileLocalStorage.setItem('reelcase.artwork-mode','text');await p.appendCatalogVideos([0,1].map(i=>({id:'beta-'+i,name:'Beta science '+i,folderId:'beta-public',path:'beta-'+i,extension:'mp4',mime:'video/mp4',size:1,duration:1800,addedAt:1,remote:{kind:'youtube',videoId:'BetaVideo0'+i,channelName:'Beta creator'}})));p.savePrefs({...p.loadPrefs(),sourceId:'home',tags:{'beta-0':['science'],'beta-1':['science']}});await p.waitForPrefsWrites();p.saveDurableShelves(['beta-0'],[]);await p.saveRemoteSnapshot({videos:[],folders:[{id:'beta-public',name:'Beta public',kind:'youtube',videoCount:2}],checkedAt:1});});
      await page.goto(url);await page.locator('[data-home-ready="true"]').waitFor();
      const betaSnapshot=async()=>{const result={};for(const name of ['Home','Topics','Watch room','AI guide']){if(name==='Watch room'){if(mobile)await page.getByRole('button',{name:'Open menu',exact:true}).click();const scope=mobile?page.getByRole('dialog'):page.locator('aside'),group=scope.locator('button[aria-controls$="-workspace"]');if(await group.getAttribute('aria-expanded')==='false')await group.click();await scope.getByRole('button',{name:'Watch room',exact:true}).click();}else await nav(name);if(name==='AI guide')await ready();else await page.waitForTimeout(400);const text=await page.locator('main').textContent();assert(!text.includes('ALPHA_PRIVATE_CANARY'));assert(!text.includes('PRIVATE TRUST SENTINEL'));result[name]=await page.locator('[data-video-card-id]').evaluateAll(rows=>[...new Set(rows.map(r=>r.getAttribute('data-video-card-id')))].sort());}result.guide=await mix.locator('[data-guide-suggestion]').evaluateAll(rows=>rows.map(r=>({id:r.getAttribute('data-guide-suggestion'),reasons:[...r.querySelectorAll('[data-guide-reason]')].map(n=>n.textContent)})));result.weights=await page.locator('[data-guide-active-weights]').textContent();return result;};
      const betaBefore=await betaSnapshot();assert.equal(betaBefore.guide.length,2);
      const alpha=await context.newPage();await alpha.goto(new URL('/__trust-blank.html',url).href);
      await alpha.evaluate(async()=>{const p=await import('/__trust-fixture.mjs');p.savePrefs({...p.loadPrefs(),tags:{'beta-0':['ALPHA_PRIVATE_CANARY'],private:['ALPHA_PRIVATE_CANARY']},favorites:['private'],history:[{id:'private'}]});await p.waitForPrefsWrites();p.profileLocalStorage.setItem('reelcase.media-feedback.v1',JSON.stringify({ratings:{'beta-0':1},notes:{private:'ALPHA_PRIVATE_CANARY'},watchTime:{},creatorFavorites:{'beta creator':true},tagLikes:{ALPHA_PRIVATE_CANARY:true},recommendationRejections:{version:1,updatedAt:Date.now(),entries:[{scope:'title',target:'youtube:BetaVideo00',label:'ALPHA_PRIVATE_CANARY',at:Date.now()}]}}));p.profileLocalStorage.setItem('reelcase.desk-taste.v1',JSON.stringify({version:1,desks:{guide:{weights:{favorite:8,like:8,topic:3},novelty:2}}}));p.profileLocalStorage.setItem('reelcase.recommendation-exposure.v1',JSON.stringify({version:1,updatedAt:Date.now(),entries:[{key:'youtube:BetaVideo00',count:8,at:Date.now()}]}));let first=true;window.__held=p.prepareGuide({videos:[{id:'private',name:'ALPHA_PRIVATE_CANARY',folderId:'private',privateRetention:true,path:'private',extension:'mp4',mime:'video/mp4',size:1,addedAt:1}],tags:{private:['ALPHA_PRIVATE_CANARY']},favorites:{private:true},likes:{},history:[]},42,Date.now(),async()=>{if(first){first=false;await new Promise(r=>window.__release=r);}}).then(data=>{p.profileLocalStorage.setItem('qa-late-ranking',JSON.stringify(data));return true;});});
      await page.bringToFront();assert.deepEqual(await betaSnapshot(),betaBefore);await alpha.evaluate(async()=>{window.__release();await window.__held;});await alpha.close();await page.bringToFront();assert.deepEqual(await betaSnapshot(),betaBefore);
      assert.equal(await page.evaluate(async()=>{const p=await import('/__trust-fixture.mjs');return p.profileLocalStorage.getItem('qa-late-ranking');}),null);
      await page.locator('[data-guide-report="mix"] > summary').click();const betaDownloadWait=page.waitForEvent('download');await page.getByRole('button',{name:'Export mix fairness report',exact:true}).click();const betaDownload=await betaDownloadWait,betaReport=await readFile(await betaDownload.path(),'utf8');assert(!betaReport.includes('ALPHA_PRIVATE_CANARY'));assert.equal(JSON.parse(betaReport).weights.favorite,3);
      report.checks.push('Session/reset/reload and alternate profile verified; adversarial Alpha private tastes and released held ranking leave Beta Home/topics/room/Guide projections, reasons, weights and aggregate report unchanged');
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
      );
      assert.deepEqual(report.errors, []);
    } catch (e) {
      report.failure = e.stack ?? String(e);
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-failure.png`),
      });
      throw e;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    output,
    JSON.stringify(
      {
        ok: reports.length === 2 && reports.every((r) => !r.failure && !r.errors.length),
        reports,
        limitation:
          "Disposable profiles and saved metadata; real provider playback and physical-phone timing are outside this fixture.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output }));
