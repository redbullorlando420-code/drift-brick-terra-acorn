import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeWatchMetadata } from '../src/lib/remote/youtube-video-metadata.ts';
import { youtubeTextTags, compactYoutubeTagEvidence, youtubeDescriptionTopics, YOUTUBE_TEXT_TAG_VERSION } from '../src/lib/videos/youtube-text-tags.ts';
import { catalogCard, withCatalogDetails } from '../src/lib/videos/catalog-card.ts';
import { mergeRemoteCatalog } from '../src/lib/videos/remote-merge.ts';
import { topicEvidence, hasTopicForScan } from '../src/lib/videos/topics.ts';

const id = 'jNQXAC9IVRw';
const html = data => `var ytInitialPlayerResponse = ${JSON.stringify(data)}; var recommendation = {"keywords":["wrong"]};`;
const row = (description, keywords = []) => ({ id: `yt:${id}`, folderId: 'yt:creator', name: 'Building machine learning models', path: id, extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 0, description,
  remote: { kind: 'youtube', videoId: id, channelName: 'Travel Music Channel', youtubeKeywords: keywords } });

test('matching YouTube player supplies bounded raw keywords, description and exact date', () => {
  const data = youtubeWatchMetadata(html({ videoDetails: { videoId: id, shortDescription: 'A { brace } and "quote".\n#Python', keywords: ['Machine Learning', 'Python', 'Python', null, 12] }, microformat: { playerMicroformatRenderer: { publishDate: '2005-04-23' } } }), id);
  assert.deepEqual(data, { id, description: 'A { brace } and "quote".\n#Python', keywords: ['Machine Learning', 'Python'], date: '2005-04-23' });
  const bounded = youtubeWatchMetadata(html({ videoDetails: { videoId: id, shortDescription: 'x'.repeat(50_000), keywords: Array.from({length: 300}, (_, i) => `${i} ${'a'.repeat(200)}`) } }), id);
  assert.equal(bounded.description.length, 16_000); assert.equal(bounded.keywords.length, 40); assert.ok(bounded.keywords.every(word => word.length <= 80));
});
test('consent pages, other videos, playability errors, invalid JSON and dates never supply tags or invented dates', () => {
  for (const page of ['<p>Consent</p>', html({ videoDetails: { videoId: 'abcdefghijk', keywords: ['wrong'] } }), html({ videoDetails: { videoId: id, keywords: ['wrong'] }, playabilityStatus: { status: 'LOGIN_REQUIRED' } }), 'var ytInitialPlayerResponse = {broken};']) assert.equal(youtubeWatchMetadata(page, id), undefined);
  const live = youtubeWatchMetadata(html({ videoDetails: { videoId: id, isLive: true }, microformat: { playerMicroformatRenderer: { publishDate: '2026-01-01' } } }), id);
  assert.equal(live.date, undefined);
  assert.equal(youtubeWatchMetadata(html({ videoDetails: { videoId: id }, microformat: { playerMicroformatRenderer: { publishDate: '2026-02-30' } } }), id).date, undefined);
  assert.equal(youtubeWatchMetadata(html({ videoDetails: { videoId: id } }), 'bad'), undefined);
});
test('creator phrases are normalized, chapters preserve order, and promotional filler cannot become suggested tags', () => {
  const video = row('We build machine learning models with Python. #NeuralNetworks\n00:00 Introduction\n02:10 Model evaluation model\nSponsored by a travel music brand #travel\nFollow me for anime\nhttps://example.test/minecraft', ['Machine Learning', 'machine_learning', '#Python', 'best', 'viral', 'Subscribe', 'C++']);
  const inferred = youtubeTextTags(video);
  for (const tag of ['machine-learning', 'python', 'cplusplus', 'neuralnetworks', 'model-evaluation-model']) assert.ok(inferred.tags.includes(tag), tag);
  assert.equal(inferred.tags.filter(tag => tag === 'machine-learning').length, 1);
  assert.equal(inferred.sources['machine-learning'], 'video-tag');
  for (const noise of ['best', 'viral', 'subscribe', 'travel', 'anime', 'minecraft', 'introduction']) assert.ok(!inferred.tags.includes(noise), noise);
  assert.equal(inferred.sources.cplusplus, 'video-tag');
});
test('compact evidence and creator keywords survive cache recovery, shallow feeds and on-demand details', () => {
  const full = row('Learn machine learning with Python. #NeuralNetworks', ['Python', 'Neural Networks']);
  const evidence = youtubeTextTags(full);
  full.remote.youtubeTagsCheckedAt = 100;
  full.remote.youtubeTagSummary = compactYoutubeTagEvidence(evidence);
  const card = catalogCard(full); assert.equal(card.description, undefined);
  assert.deepEqual(youtubeTextTags(card), evidence);
  assert.ok(hasTopicForScan(card, 'technology')); assert.match(topicEvidence(card).find(link => link.topic === 'technology').reason, /Title.category/);
  const feed = { ...row(undefined), remote: { kind: 'youtube', videoId: id }, name: 'A new listing title' };
  const merged = mergeRemoteCatalog([card], [feed], new Map([[card.id, 0]]), [])[0];
  assert.equal(merged.remote.youtubeTagsCheckedAt, 100);
  assert.deepEqual(merged.remote.youtubeKeywords, ['Python', 'Neural Networks']);
  assert(youtubeTextTags(merged).scores.every(score=>score<80),'renamed listing cannot retain a previous title anchor');
  const restored = withCatalogDetails(feed, full);
  assert.equal(restored.description, full.description); assert.equal(restored.remote.youtubeTagSummary, full.remote.youtubeTagSummary);
});

test('relevant late creator tags outrank an unrelated keyword dump and compact scans avoid title tokenization', () => {
  const video = { ...row(undefined, [...Array.from({ length: 35 }, (_, i) => `unrelated phrase ${i}`), 'MachineLearning', 'machine learning']), name: 'Machine learning projects' };
  const inferred = youtubeTextTags(video);
  assert.equal(inferred.tags[0], 'machine-learning'); assert.equal(inferred.sources['machine-learning'], 'video-tag');
  assert.equal(inferred.tags.filter(tag => tag === 'machine-learning').length, 1); assert.ok(inferred.tags.length <= 28);
  const sparse = { ...row(undefined), get name() { throw Error('Sparse topic scans must not tokenize titles'); } };
  assert.deepEqual(youtubeDescriptionTopics(sparse), []);
  const topics = [{ topic: 'technology', reason: 'Video tag: machine-learning' }];
  sparse.remote.youtubeTagSummary = { version: YOUTUBE_TEXT_TAG_VERSION, sources: {}, topics };
  assert.equal(youtubeDescriptionTopics(sparse), topics);
});
