import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context);
    throw error;
  }
} });
const { summarizeTopicCatalog, selectTopicCatalog, topicConnectionsCsv } = await import('../src/lib/videos/topic-catalog.ts');
const { topicEvidence } = await import('../src/lib/videos/topics.ts');
const row = (id, name = id, kind = 'youtube', folderId = kind) => ({ id, name, folderId, path: id,
  extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 1, ...(kind === 'local' ? {} : { remote: { kind } }) });
const base = videos => ({ videos, folders: [{ id: 'local' }, { id: 'private', adult: true }],
  tags: {}, unavailable: {}, hiddenVideos: {}, hideDemo: true });
const taste = { score: id => id === 'liked' ? 3.5 : id === 'disliked' ? -3 : 0, liked: topic => topic === 'science' };
const turn = async () => {};

test('topic aggregates preserve privacy, hidden/demo filters, saved evidence and taste ordering', async () => {
  const input = { ...base([
    row('liked', 'Physics and coding'), row('disliked', 'Physics experiment', 'twitch'),
    row('saved', 'Ordinary title', 'local'), row('inferred', 'Music performance'), row('unlinked'),
    row('adult', 'Science', 'eporner'), row('private', 'Science', 'local', 'private'),
    row('missing-local', 'Science', 'local', 'missing'), row('hidden', 'Science'), row('gone', 'Science'),
    { ...row('demo', 'Science'), isSample: true }
  ]), tags: { saved: ['coding', 'music', 'unknown'] }, hiddenVideos: { hidden: true }, unavailable: { gone: true } };
  const result = await summarizeTopicCatalog(input, taste, turn);
  assert.equal(result.total, 5); assert.equal(result.linked, 4); assert.equal(result.saved, 1);
  assert.equal(result.counts[0][0], 'science');
  const science = result.counts.find(([topic]) => topic === 'science')[1];
  assert.equal(science.count, 2); assert.equal(science.ratingTotal, 0.5);
  assert.deepEqual([...science.providers], ['youtube', 'twitch']);
  assert.equal(result.counts.find(([topic]) => topic === 'technology')[1].saved, 1);
  assert.ok(!('rows' in result) && !('videos' in result), 'summary keeps no full row catalog');
  assert.equal(result.gaps.find(source => source.id === 'youtube').total, 3);
});

test('provider/genre/topic selection retains exact catalog order and related topic scores', async () => {
  const videos = [row('liked', 'Physics coding'), row('two', 'Physics music', 'twitch'),
    { ...row('genre', 'Ordinary title', 'twitch'), genre: 'My category' }, row('private', 'Science', 'youtube', 'private')];
  const input = base(videos);
  const selected = await selectTopicCatalog(input, 'science', undefined, 'all', taste, turn);
  assert.deepEqual(selected.videos, videos.slice(0, 2));
  const technology = selected.related.find(([topic]) => topic === 'technology')[1];
  assert.equal(technology.shared, 1); assert.equal(technology.ratingTotal, 3.5);
  assert.deepEqual((await selectTopicCatalog(input, 'science', undefined, 'twitch', taste, turn)).videos, [videos[1]]);
  assert.deepEqual((await selectTopicCatalog(input, undefined, 'My category', 'twitch', taste, turn)).videos, [videos[2]]);
  assert.equal((await selectTopicCatalog(input, undefined, undefined, 'local', taste, turn)).videos.length, 0);
});

test('CSV uses prepared saved/inferred totals without touching the catalog again', async () => {
  const input = { ...base([row('one', 'Physics'), row('two', 'Ordinary')]), tags: { two: ['science'] } };
  const summary = await summarizeTopicCatalog(input, taste, turn);
  input.videos = new Proxy([], { get() { throw new Error('Export rescanned catalog'); } });
  assert.match(topicConnectionsCsv(summary), /"science","2","0","0.0","youtube","1","1"/);
});

test('large topic libraries yield throughout scans and keep complete matching references and bounded gaps', async () => {
  const videos = Array.from({ length: 20_000 }, (_, index) => ({ ...row(String(index), 'Ordinary'),
    folderId: `source-${index % 100}`, genre: `Category ${index % 1000}` }));
  const tags = Object.fromEntries(videos.map(video => [video.id, ['science']]));
  const input = { ...base(videos), tags };
  let yields = 0, scores = 0;
  const localTaste = { ...taste, score: () => { scores++; return 1; } };
  const summary = await summarizeTopicCatalog(input, localTaste, async () => { yields++; });
  assert.equal(summary.total, 20_000); assert.equal(summary.saved, 20_000);
  assert.equal(summary.counts[0][1].count, 20_000); assert.equal(scores, 20_000);
  assert.equal(summary.gaps.length, 8); assert.equal(summary.genres.length, 1000); assert.ok(yields > 80);
  const matches = await selectTopicCatalog(input, 'science', undefined, 'all', taste, turn);
  assert.equal(matches.videos.length, videos.length); assert.equal(matches.videos[19999], videos[19999]);
  assert.equal(topicEvidence(videos[0], tags['0'])[0].saved, true);
});

test('cancelled topic scans never inspect the remaining catalog or produce a partial result', async () => {
  const input = base(Array.from({ length: 2000 }, (_, i) => row(String(i), 'Science')));
  for (const run of [next => summarizeTopicCatalog(input, taste, next), next => selectTopicCatalog(input, 'science', undefined, 'all', taste, next)]) {
    let yields = 0;
    await assert.rejects(run(async () => { if (++yields === 3) throw new Error('replaced'); }), /replaced/);
    assert.equal(yields, 3);
  }
});
