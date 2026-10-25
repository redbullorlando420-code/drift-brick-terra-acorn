import test from "node:test";
import assert from "node:assert/strict";
import { TOPICS, topicsForVideo, hasTopicForScan, topicEvidence, topicEvidenceForScan, reconcileProviderTopicTags } from "./topics.ts";
import type { LibraryVideo } from "./types.ts";
const video = (name: string, genre?: string): LibraryVideo => ({id:name,folderId:"yt:creator",name,genre,path:"youtube/creator",mime:"video/youtube",extension:"yt",size:0,addedAt:0});

test('single-topic scans match complete evidence without replacing the card cache', () => {
  const fixtures = [video('Physics coding anime movie'), video('A quiet day', 'Manga'),
    { ...video('Today'), remote: { kind: 'youtube' as const }, description: 'Subscribe for anime\n00:20 A manga drawing tutorial\nhttps://example.com/gaming' },
    { ...video('A'.repeat(501) + ' anime'), remote: { kind: 'twitch' as const, channelName: 'anime' }, description: 'Anime music' },
    { ...video('Unrelated'), remote: { kind: 'youtube' as const }, description: 'Subscribe to my anime channel' }];
  for (const row of fixtures) for (const tags of [[], ['#Anime', 'coding', 'tech'], ['science', 'not-a-topic']]) {
    const expected = topicEvidenceForScan(row, tags).map(link => link.topic);
    for (const topic of [...TOPICS, 'unknown']) assert.equal(hasTopicForScan(row, topic, tags), expected.includes(topic), `${row.name.slice(0, 30)}: ${topic}`);
  }
  const row = video('anime'), saved = ['music'], resident = topicEvidence(row, saved);
  assert.equal(hasTopicForScan(row, 'anime', ['anime']), true);
  assert.equal(topicEvidence(row, saved), resident);
  assert.equal(hasTopicForScan(row, 'music', saved), true);
});
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
