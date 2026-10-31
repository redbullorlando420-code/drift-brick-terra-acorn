import test from "node:test";
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
const { runFollowRemote, runFetchTwitchChapters } = await import("../src/lib/remote/api.ts");
test("routine Twitch archives and clips never query chapter markers; selected detail reads are validated and cached", async () => {
  const original = globalThis.fetch,
    calls = [];
  globalThis.fetch = async (_url, init) => {
    const input = JSON.parse(init.body);
    calls.push(input.query);
    assert(!new Headers(init.headers).has("authorization"));
    if (input.query.includes("moments"))
      return Response.json({
        data: {
          video: {
            id: input.variables.id,
            lengthSeconds: 200,
            moments: {
              edges: [
                {
                  node: {
                    positionMilliseconds: 0,
                    durationMilliseconds: 60000,
                    description: "Public game",
                  },
                },
              ],
            },
          },
        },
      });
    return Response.json({
      data: {
        user: {
          id: "owner",
          displayName: "Public fixture",
          stream: null,
          videos: { edges: [], pageInfo: { hasNextPage: false } },
          clips: { edges: [], pageInfo: { hasNextPage: false } },
        },
      },
    });
  };
  try {
    await runFollowRemote({
      kind: "twitch",
      query: "chapter_contract_fixture",
      twitchVodLimit: 100,
      clipLimit: 0,
    });
    await runFollowRemote({
      kind: "twitch",
      query: "chapter_contract_fixture",
      twitchClipMode: "archive",
      clipLimit: 2,
    });
    assert(calls.length >= 4);
    assert(calls.every((q) => !q.includes("moments")));
    const result = await runFetchTwitchChapters({ videoId: "879001" });
    assert.equal(result.state, "ready");
    assert.equal(result.chapters[0].label, "Public game");
    await runFetchTwitchChapters({ videoId: "879001" });
    assert.equal(calls.filter((q) => q.includes("moments")).length, 1);
    await assert.rejects(runFetchTwitchChapters({ videoId: "clip-slug" }));
    assert.equal(calls.filter((q) => q.includes("moments")).length, 1);
  } finally {
    globalThis.fetch = original;
  }
});
