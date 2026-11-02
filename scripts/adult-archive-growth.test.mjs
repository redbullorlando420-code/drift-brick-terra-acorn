import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { runSearchAdultVideos } = await import("../src/lib/remote/api.ts");
const { walkAdultPull } = await import("../src/lib/videos/adult-pull-walk.ts");
test("real archive adapter walks beyond 12k saved titles with stable sorting, bounded responses and exact offsets", async () => {
  const original = globalThis.fetch,
    calls = [];
  globalThis.fetch = async (raw) => {
    const url = new URL(String(raw));
    assert.equal(url.hostname, "www.eporner.com");
    calls.push(url);
    const page = Number(url.searchParams.get("page"));
    assert.equal(url.searchParams.get("order"), "latest");
    assert.equal(url.searchParams.get("per_page"), "1000");
    return Response.json({
      videos: Array.from({ length: 1000 }, (_, i) => {
        const id = String((page - 1) * 1000 + i);
        return {
          id,
          title: "Archive fixture " + id,
          embed: "https://www.eporner.com/embed/" + id + "/",
          url: "https://www.eporner.com/video-" + id + "/",
        };
      }),
      total_pages: 100,
      total_count: 100000,
    });
  };
  try {
    const known = new Set(Array.from({ length: 12000 }, (_, i) => "eporner:" + i));
    const result = await walkAdultPull(
      800,
      1,
      0,
      async (page, offset, limit) => {
        const batch = await runSearchAdultVideos({
          query: "all",
          order: "latest",
          providers: ["eporner"],
          page,
          maxVideos: limit,
          providerOffsets: { eporner: offset },
        });
        assert(batch.videos.length <= 400);
        assert.equal(batch.partial, false);
        return {
          ...batch,
          nextPage: batch.providerNextPages.eporner,
          nextOffset: batch.providerNextOffsets.eporner,
        };
      },
      async () => {},
      { known, maxRequests: 40, refreshLimit: 4 },
    );
    assert.equal(result.newCount, 800);
    assert.equal(result.refreshedCount, 4);
    assert(
      result.videos.filter((v) => !known.has(v.id)).every((v) => Number(v.remote.videoId) >= 12000),
    );
    assert.equal(new Set(result.videos.map((v) => v.id)).size, 804);
    assert(result.requests <= 40);
    assert.deepEqual(
      calls.map((u) => Number(u.searchParams.get("page"))),
      Array.from({ length: 13 }, (_, i) => i + 1),
    );
    assert.equal(result.latest.nextPage, 13);
    assert.equal(result.latest.nextOffset, 800);
  } finally {
    globalThis.fetch = original;
  }
});
test("an unreadable Eporner page fails without silently changing sort or page size", async () => {
  const original = globalThis.fetch,
    calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return Response.json({ videos: [{ title: "Missing provider identity" }], total_pages: 999 });
  };
  try {
    await assert.rejects(
      runSearchAdultVideos({
        query: "all",
        order: "top-monthly",
        providers: ["eporner"],
        page: 991,
        maxVideos: 100,
      }),
      /malformed source identity/,
    );
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = original;
  }
});
