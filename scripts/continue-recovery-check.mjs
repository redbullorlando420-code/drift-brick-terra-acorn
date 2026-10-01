#!/usr/bin/env node
/**
 * Exercises the Continue selector through the browser module graph so Vite
 * resolves the same aliases and recovery helpers used in the app. No saved
 * catalog, history, or provider request is involved.
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const [url = "http://127.0.0.1:8080/"] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true, ...(process.platform === "win32" ? { channel: "chrome" } : {}) });

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const recovered = await page.evaluate(async () => {
    const { selectContinue } = await import("/src/lib/videos/store.ts");
    const now = Date.now();
    const mark = (offset) => ({ t: 180, d: 1_800, at: now - offset });
    const local = { id: "local", folderId: "folder:local", name: "Local film", path: "C:/media/local.mp4", src: "blob:local", extension: "mp4", mime: "video/mp4", size: 1, duration: 1_800, addedAt: now };
    const youtube = { id: "youtube", folderId: "yt:creator", name: "YouTube episode", path: "youtube:episode", extension: "yt", mime: "video/youtube", size: 0, duration: 1_800, addedAt: now, remote: { kind: "youtube", live: false, videoId: "episode", watchUrl: "https://www.youtube.com/watch?v=episode", embedUrl: "https://www.youtube.com/embed/episode" } };
    const twitch = { id: "twitch", folderId: "tw:creator", name: "Twitch VOD", path: "twitch:vod", extension: "vod", mime: "video/twitch", size: 0, duration: 1_800, addedAt: now, remote: { kind: "twitch", live: false, videoId: "123", watchUrl: "https://www.twitch.tv/videos/123", embedUrl: "https://player.twitch.tv/?video=v123" } };
    const state = {
      videos: [local, youtube, twitch],
      folders: [{ id: "folder:local", name: "Local", kind: "directory", videoCount: 1, health: "healthy" }],
      hideDemo: false,
      hiddenVideos: {},
      history: [{ eventId: "room:1", id: "room-recovery", at: now, url: "https://www.twitch.tv/videos/456", title: "Watch Room VOD", position: 240, duration: 1_800, source: "watch-room" }],
      progress: { local: mark(3), youtube: mark(2), twitch: mark(1) },
      resumeProgress: {
        "https://www.youtube.com/watch?v=episode": mark(2),
        "https://www.twitch.tv/videos/123": mark(1),
      },
    };
    return selectContinue(state).map((video) => ({ id: video.id, kind: video.remote?.kind ?? "local", title: video.name }));
  });
  assert.deepEqual(new Set(recovered.map((video) => video.id)), new Set(["local", "youtube", "twitch", "room-recovery"]));
  assert.equal(recovered.find((video) => video.id === "room-recovery")?.kind, "twitch");
  const activity = await page.evaluate(async () => {
    const { useLibrary, selectHistory, selectVisible, selectFavorites } = await import('/src/lib/videos/store.ts');
    const now = Date.now();
    const card = (id, folderId = 'public', extra = {}) => ({ id, folderId, name: id, path: id, size: 0, addedAt: now, extension: 'mp4', mime: 'video/mp4', ...extra });
    const rows = Array.from({ length: 100_000 }, (_, index) => card(String(index)));
    const shared = 'https://www.youtube.com/watch?v=shared';
    rows.push(card('alias-public', 'public', { src: shared }), card('private', 'private', { src: shared }), card('hidden'), card('demo', 'public', { isSample: true }));
    // Saved activity must not allocate a complete scope array before matching
    // the few requested titles. This fixture never enters the live store.
    Object.defineProperty(rows, 'filter', { value: () => { throw Error('saved activity filtered the full catalog'); } });
    const state = { ...useLibrary.getState(), videos: rows, sourceId: 'history', query: '', sort: 'added',
      folders: [{ id: 'public', name: 'Public', kind: 'directory' }, { id: 'private', name: 'Private', kind: 'directory', adult: true }],
      hideDemo: true, hiddenVideos: { hidden: true }, favorites: { '90000': true, private: true }, likes: {},
      history: [{ id: '90000', at: now }, { id: 'old-alias', at: now - 1, url: shared }, { id: 'private', at: now - 2 },
        { id: 'hidden', at: now - 3 }, { id: 'demo', at: now - 4 },
        { id: 'evicted', at: now - 5, title: 'Recovered episode', url: 'https://www.youtube.com/watch?v=evicted' }] };
    const publicHistory = selectHistory(state).map(video => video.id);
    const privateHistory = selectHistory(state, true).map(video => video.id);
    return { catalogSize: rows.length, publicHistory, privateHistory,
      visibleHistory: selectVisible(state).map(video => video.id),
      savedPublic: selectFavorites(state).map(video => video.id), savedPrivate: selectFavorites(state, true).map(video => video.id) };
  });
  assert.deepEqual(activity.publicHistory, ['90000', 'alias-public', 'evicted']);
  assert.deepEqual(activity.privateHistory, ['private']);
  assert.deepEqual(activity.visibleHistory, activity.publicHistory);
  assert.deepEqual(activity.savedPublic, ['90000']);
  assert.deepEqual(activity.savedPrivate, ['private']);
  console.log(JSON.stringify({ scenario: "local, YouTube, Twitch, and Watch Room resume recovery plus large saved activity", recovered, activity }, null, 2));
} finally {
  await browser.close();
}
