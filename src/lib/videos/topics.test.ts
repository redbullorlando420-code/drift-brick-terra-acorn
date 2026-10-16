import test from "node:test";
import assert from "node:assert/strict";
import { topicsForVideo, topicEvidence, topicEvidenceForScan, reconcileProviderTopicTags } from "./topics.ts";
import type { LibraryVideo } from "./types.ts";
const video = (name: string, genre?: string): LibraryVideo => ({id:name,folderId:"yt:creator",name,genre,path:"youtube/creator",mime:"video/youtube",extension:"yt",size:0,addedAt:0});
test('complete-catalog scans preserve evidence without filling or replacing the resident card cache', () => {
  const row = video('Physics coding'), tags = ['science'];
  const first = topicEvidenceForScan(row, tags), second = topicEvidenceForScan(row, tags);
  assert.deepEqual(first, second); assert.notEqual(first, second);
  const resident = topicEvidence(row, tags);
  assert.equal(topicEvidenceForScan(row, tags), resident);
  const changed = ['music'];
  assert.deepEqual(topicEvidenceForScan(row, changed), topicEvidenceForScan(row, changed));
  assert.equal(topicEvidence(row, tags), resident, 'temporary scans never replace card evidence');
});
test("ASMR and known game categories create explainable topic links", () => {
  assert.deepEqual(topicsForVideo(video("ASMR relaxing massage")), ["relaxing"]);
  assert.ok(topicsForVideo(video("Today's stream", "World of Warcraft")).includes("gaming"));
  assert.ok(topicsForVideo(video("Visiting a cafe in Japan")).includes("travel"));
  assert.match(topicEvidence(video("ASMR relaxing massage"))[0]!.reason, /Title\/category/);
});
test("promotional descriptions and creator names do not invent topic links", () => {
  const row = {...video("Today's update"), description:"Subscribe to my gaming travel music channels", path:"youtube/GamingCreator/travel"};
  assert.deepEqual(topicsForVideo(row), []);
  assert.deepEqual(topicsForVideo(row, ["coding"]), ["technology"]);
});
test("unsupported provider topics are repaired while manual, unknown, and locked choices survive", () => {
  const row = {...video("Visiting a cafe in Japan"), remote:{kind:"youtube" as const}};
  const tags = ["anime", "travel", "food", "relaxing", "creator-abroad-in-japan"];
  const provenance = {tags:{anime:"provider:youtube" as const,travel:"provider:youtube" as const,food:"manual" as const}};
  assert.deepEqual(reconcileProviderTopicTags(row, tags, provenance), ["travel", "food", "relaxing", "creator-abroad-in-japan"]);
  assert.equal(reconcileProviderTopicTags(row, tags, {...provenance,lockedFields:["tags"]}), tags);
  assert.equal(reconcileProviderTopicTags(row, tags), tags);
});
