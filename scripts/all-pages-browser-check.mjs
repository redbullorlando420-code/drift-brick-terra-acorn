import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";

// Derive the inventory from the actual sidebar, so new pages cannot silently
// disappear from this audit. This check always uses disposable browser storage.
const sidebar = readFileSync("src/components/library/sidebar.tsx", "utf8");
const inventory = sidebar.slice(
  sidebar.indexOf("const NAV_GROUPS"),
  sidebar.indexOf("function NavItem"),
);
const pages = [...inventory.matchAll(/\[['"]([^'"]+)['"],\s*['"]([^'"]+)['"],/g)].map(
  ([, id, name]) => ({ id, name }),
);
if (pages.length < 30) throw Error("Incomplete sidebar inventory");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/all-pages-dev.json", [
  resolve("screenshots"),
]);
const reports = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });
const save = () =>
  writeFileSync(
    output,
    JSON.stringify({ ok: reports.every((r) => !r.failures.length), pages, reports }, null, 2),
  );
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        status: 503,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ ok: false, error: "Companion offline (isolated QA)" }),
      }),
    );
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    let errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto(url);
    await page.locator('[data-home-ready="true"]').waitFor({ timeout: 60000 });
    for (const target of pages) {
      errors = [];
      const report = { mobile, ...target, failures: [], tabs: [], headings: [], controls: [] };
      reports.push(report);
      try {
        if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
        const nav = page.getByRole("navigation", { name: "Library navigation" });
        await nav
          .getByRole("button", {
            name: new RegExp(
              "^" + target.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\s+\\d+)?$",
            ),
          })
          .click();
        await page.locator('main[aria-busy="false"]').waitFor();
        await page
          .getByText("Loading this library workspace…", { exact: true })
          .waitFor({ state: "hidden" });
        await page.waitForTimeout(400);
        const main = page.locator("main");
        if ((await main.innerText()).trim().length < 20) report.failures.push("Empty main content");
        report.headings = await main.locator("h1,h2,h3").allTextContents();
        report.controls = (await main.locator("button").allTextContents())
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 70);
        const inspect = async (label) => {
          const layout = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            offscreen: [...document.querySelectorAll("main *")]
              .filter((n) => {
                const r = n.getBoundingClientRect();
                return (
                  r.width > 20 &&
                  r.right > innerWidth + 2 &&
                  getComputedStyle(n).position !== "fixed" &&
                  getComputedStyle(n).visibility !== "hidden"
                );
              })
              .slice(0, 8)
              .map((n) => ({
                tag: n.tagName,
                text: n.textContent?.slice(0, 100),
                class: n.className,
              })),
          }));
          if (layout.overflow) report.failures.push({ label, ...layout });
        };
        await inspect("page");
        await page.screenshot({
          path: output.replace(
            /\.json$/,
            "-" + (mobile ? "mobile" : "desktop") + "-" + target.id + ".png",
          ),
        });
        // ARIA tabs are navigation only; native/service action buttons are never
        // clicked generically. Their workflows have dedicated fixture checks.
        const names = await main.getByRole("tab").allTextContents();
        for (const name of names) {
          const tab = main.getByRole("tab", { name: name.trim(), exact: true });
          if ((await tab.count()) !== 1 || (await tab.isDisabled())) continue;
          await tab.click();
          await page.waitForTimeout(150);
          report.tabs.push(name.trim());
          await inspect("tab " + name.trim());
        }
        const details = main.locator("details");
        for (let i = 0; i < Math.min(await details.count(), 8); i++) {
          const item = details.nth(i);
          if ((await item.getAttribute("open")) === null)
            await item.locator(":scope > summary").click();
        }
        await inspect("expanded details");
      } catch (error) {
        report.failures.push(error.message);
        await page
          .screenshot({
            path: output.replace(
              /\.json$/,
              "-" + (mobile ? "mobile" : "desktop") + "-" + target.id + "-failure.png",
            ),
          })
          .catch(() => {});
      }
      report.errors = [...new Set(errors)];
      // A deliberately offline companion may log an HTTP failure, but uncaught
      // exceptions and any other console errors remain failures.
      report.failures.push(
        ...report.errors.filter((e) => !e.includes("503 (Service Unavailable)")),
      );
      console.log(
        JSON.stringify({
          mobile,
          id: target.id,
          tabs: report.tabs.length,
          failures: report.failures,
        }),
      );
      save();
    }
    for (const route of ["/landing", "/missing-page-qa"]) {
      const report = { mobile, id: route, failures: [] };
      reports.push(report);
      errors = [];
      try {
        await page.goto(new URL(route, url).href);
        await page.waitForTimeout(800);
        report.text = (await page.locator("body").innerText()).slice(0, 1000);
        if (report.text.trim().length < 30) report.failures.push("Empty route");
        report.failures.push(...errors.filter((e) => !e.includes("404 (Not Found)")));
      } catch (e) {
        report.failures.push(e.message);
      }
      save();
    }
    await context.close();
  }
} finally {
  await browser.close();
  save();
}
if (reports.some((r) => r.failures.length)) process.exitCode = 1;
