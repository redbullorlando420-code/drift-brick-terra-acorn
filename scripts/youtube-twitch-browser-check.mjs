import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];
try {
  for (const viewport of [{ name: "desktop", width: 1280, height: 800 }, { name: "mobile", width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.addInitScript(() => Object.defineProperty(document, "hidden", { configurable: true, get: () => true }));
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const videos = Array.from({ length: 30_000 }, (_, index) => {
        const id = `tw:c:qa-${index}`;
        return {
          id, folderId: `tw:qa-${index % 30}`, name: `Archive clip ${index}`, path: `twitch/Creator ${index % 30}/Archive clip ${index}`,
          extension: "clip", mime: "video/twitch", size: 0, duration: 45, addedAt: Date.now() - index * 60_000,
          poster: "", src: `https://clips.twitch.tv/embed?clip=qa-${index}`,
          remote: { kind: "twitch", channelName: `Creator ${index % 30}`, videoId: `qa-${index}`, watchUrl: `https://clips.twitch.tv/qa-${index}` },
        };
      });
      for (let index = 0; index < 50_000; index++) videos.push({
        id: `yt:v:qa-${index}`, folderId: `yt:qa-${index % 180}`, name: `YouTube archive ${index}`,
        path: `youtube/YouTube creator ${index % 180 + 1}/YouTube archive ${index}`, extension: "youtube", mime: "video/youtube",
        size: 0, duration: 420, addedAt: Date.now() - index * 60_000, poster: "", src: `https://www.youtube.com/watch?v=qa-${index}`,
        remote: { kind: "youtube", channelName: `YouTube creator ${index % 180 + 1}`, videoId: `qa-${index}`, watchUrl: `https://www.youtube.com/watch?v=qa-${index}` },
      });
      const follows = [
        ...Array.from({ length: 30 }, (_, index) => ({ id: `tw:qa-${index}`, kind: "twitch", handle: `qa-${index}`, title: `Creator ${index}` })),
        ...Array.from({ length: 180 }, (_, index) => ({ id: `yt:qa-${index}`, kind: "youtube", handle: `qa-${index}`, title: `YouTube creator ${index + 1}`, catalogCheckedAt: (index + 1) * 1000 })),
      ];
      localStorage.setItem("reelcase.follows.v1", JSON.stringify({ channels: follows, savedAt: Date.now() }));
      const db = await new Promise((resolve, reject) => { const req = indexedDB.open("reelcase", 7); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
      try {
        await new Promise((resolve, reject) => { const tx = db.transaction("remote-cache", "readwrite"); tx.objectStore("remote-cache").put({ folders: [], checkedAt: Date.now() }, "meta"); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
        for (let offset = 0; offset < videos.length; offset += 400) {
          await new Promise((resolve, reject) => {
            const tx = db.transaction("remote-cache", "readwrite");
            const store = tx.objectStore("remote-cache");
            for (const video of videos.slice(offset, offset + 400)) store.put(video, `video:${video.id}`);
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
        }
      } finally { db.close(); }
    }, { timeout: 120_000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText(/80,000 indexed/).first().waitFor({ timeout: 90_000 });
    await page.waitForTimeout(2_000);
    if (viewport.name === "mobile") await page.getByRole("button", { name: /menu/i }).first().click();
    await page.getByRole("button", { name: /^Twitch/ }).first().click();
    try { await page.getByText("Clip shuffle", { exact: true }).waitFor({ timeout: 45_000 }); }
    catch (error) { throw new Error(`${viewport.name}: ${error.message}; body=${(await page.locator("body").innerText()).slice(0, 1200)}; errors=${errors.join(" | ")}`); }
    const before = await page.locator("text=Clips to explore").count();
    await page.getByRole("button", { name: "Shuffle clips" }).click();
    await page.getByLabel("Clip creator").selectOption("Creator 7");
    await page.waitForTimeout(200);
    const text = await page.locator("body").innerText();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (!before || !text.includes("Creator 7") || overflow || errors.length) throw new Error(`${viewport.name}: ${JSON.stringify({ before, overflow, errors })}`);
    const screenshot = `screenshots/youtube-twitch-80k-${viewport.name}.png`;
    await page.locator("text=Clip shuffle").first().scrollIntoViewIfNeeded();
    await page.screenshot({ path: screenshot, fullPage: false });
    if (viewport.name === "mobile") await page.getByRole("button", { name: /menu/i }).first().click();
    await page.getByRole("button", { name: /^YouTube/ }).first().click();
    await page.getByRole("button", { name: "Pull all creators & playlists" }).waitFor();
    try { await page.getByRole("button", { name: "Expand YouTube creator control", exact: true }).waitFor({ timeout: 20_000 }); }
    catch (error) { throw new Error(`${viewport.name}: ${error.message}; body=${(await page.locator("body").innerText()).slice(0, 1800)}; errors=${errors.join(" | ")}`); }
    if (await page.getByLabel("Sort followed creators").count()) throw new Error(`${viewport.name}: creator controls expanded without request`);
    const youtubeScreenshot = `screenshots/youtube-pull-80k-${viewport.name}.png`;
    await page.getByRole("button", { name: "Pull all creators & playlists" }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: youtubeScreenshot, fullPage: false });
    await page.getByRole("button", { name: "Expand YouTube creator control", exact: true }).click();
    const creatorButtons = page.getByRole("button", { name: /^Manage YouTube creator \d+$/ });
    if (await creatorButtons.count() !== 24) throw new Error(`${viewport.name}: expected 24 creator controls, got ${await creatorButtons.count()}`);
    const firstRecent = await creatorButtons.first().getAttribute("aria-label");
    await page.getByRole("button", { name: "A–Z" }).click();
    const firstName = await creatorButtons.first().getAttribute("aria-label");
    if (firstRecent !== "Manage YouTube creator 180" || firstName !== "Manage YouTube creator 1") throw new Error(`${viewport.name}: creator sort wrong: ${firstRecent}, ${firstName}`);
    await page.getByRole("button", { name: "Manage YouTube creator 5", exact: true }).click();
    await page.getByRole("button", { name: "Favorite creator", exact: true }).click();
    await page.getByRole("button", { name: "Favorites", exact: true }).click();
    if (await creatorButtons.first().getAttribute("aria-label") !== "Manage YouTube creator 5") throw new Error(`${viewport.name}: favorite sort wrong`);
    await page.getByRole("button", { name: /Collapse YouTube creator control/ }).click();
    if (await page.getByLabel("Sort followed creators").count()) throw new Error(`${viewport.name}: creator controls remained expanded`);
    await page.getByPlaceholder("Search your entire media desk…").fill("YouTube archive 49999");
    await page.getByText("1 ranked results", { exact: true }).waitFor({ timeout: 60_000 });
    await page.getByPlaceholder("Search your entire media desk…").fill("");
    const creatorOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (creatorOverflow || errors.length) throw new Error(`${viewport.name}: ${JSON.stringify({ creatorOverflow, errors })}`);
    results.push({ viewport: viewport.name, videoCount: 80_000, shuffled: true, creatorFilter: "Creator 7", creatorSort: [firstRecent, firstName], creatorControlsCompact: true, searchRanked: true, horizontalOverflow: creatorOverflow, pageErrors: errors, screenshot, youtubeScreenshot });
    await page.close();
  }
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
