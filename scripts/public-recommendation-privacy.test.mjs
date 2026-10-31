import test from "node:test";
import assert from "node:assert/strict";
import { prepareGuide, answerGuideQuery } from "../src/lib/videos/guide-picks.ts";
import { topicPostings } from "../src/lib/videos/topic-postings.ts";
import { auditTopicBridges } from "../src/lib/videos/topic-bridge-audit.ts";
import { distributionExport } from "../src/lib/videos/recommendation-report.ts";
import { youtubeCatalogSelection } from "../src/lib/videos/youtube-catalog-selection.ts";
import { selectSavedCards } from "../src/lib/videos/saved-library.ts";
const turn = async () => {},
  now = 1800000000000,
  folders = [{ id: "public" }, { id: "private", adult: true }];
const video = (id, extra = {}) => ({
  id,
  name: "Public science " + id,
  folderId: "public",
  path: "path/" + id,
  size: 0,
  mime: "video/youtube",
  extension: "yt",
  addedAt: 1,
  remote: { kind: "youtube", videoId: id, channelId: "PUBLIC_CREATOR_ID" },
  ...extra,
});
test("mixed private favorites, history and merged source signals never become public Guide evidence, topics or ordinary report exports", async () => {
  const secret = video("secret", { folderId: "private", name: "CANARY PRIVATE TITLE" }),
    merged = video("merged", { name: "CANARY MERGED TITLE" });
  merged.remote = { ...merged.remote, sourceIds: ["public", "private"] };
  const rows = [
      video("one"),
      video("two"),
      secret,
      merged,
      video("adult", { name: "CANARY ADULT TITLE", remote: { kind: "redtube" } }),
    ],
    input = {
      videos: rows,
      folders,
      tags: {
        secret: ["CANARY PRIVATE LABEL", "science"],
        merged: ["science"],
        one: ["science"],
        two: ["science"],
      },
      favorites: { secret: true, merged: true },
      likes: { secret: true },
      history: [{ id: "secret" }],
      hidden: {},
      unavailable: {},
    };
  let before;
  for (const adultsUnlocked of [false, true]) {
    const prepared = await prepareGuide({ ...input, adultsUnlocked }, 42, now, turn),
      query = await answerGuideQuery({ ...input, adultsUnlocked }, "science", 42, now, turn),
      report = distributionExport(prepared.distribution);
    assert.equal(prepared.publicCount, 2);
    assert.equal(prepared.favoriteCount, 0);
    assert.equal(prepared.likeCount, 0);
    assert.equal(prepared.historyCount, 0);
    assert.equal(prepared.mode, "discovery");
    for (const result of [prepared, query, report])
      assert.ok(!JSON.stringify(result).includes("CANARY"));
    assert.ok(!JSON.stringify(report).includes("Public science"));
    assert.ok(!JSON.stringify(report).includes("PUBLIC_CREATOR_ID"));
    const stable = JSON.stringify({
      picks: prepared.picks,
      explanations: prepared.explanations,
      report,
    });
    if (before) assert.equal(stable, before);
    before = stable;
  }
  const postings = await topicPostings({ ...input, hiddenVideos: {}, hideDemo: false }, turn);
  assert.deepEqual([...postings.eligible], [0, 1]);
  const audit = await auditTopicBridges(input, turn);
  assert.equal(audit.publicTitles, 2);
  assert.ok(!JSON.stringify(audit).includes("CANARY"));
  const selected = await youtubeCatalogSelection(
    {
      videos: rows,
      privateFolders: new Set(["private"]),
      hiddenVideos: {},
      unavailable: {},
      hideDemo: false,
    },
    new AbortController().signal,
    turn,
  );
  assert.deepEqual(new Set(selected.map((v) => v.id)), new Set(["one", "two"]));
  const saved = selectSavedCards(
    rows,
    { secret: true, merged: true, one: true },
    {},
    new Set(["private"]),
    false,
    {},
    false,
  );
  assert.deepEqual(
    saved.map((v) => v.id),
    ["one"],
  );
});
