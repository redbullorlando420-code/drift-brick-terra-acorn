import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareSettingsAudit } from '../src/lib/videos/settings-audit.ts';
import { patchSparseRecord } from '../src/lib/sparse-record.ts';

const video = (id, remote) => ({ id, name: `Title ${id}`, folderId: 'yt:source', path: `E:/library/${id}.mp4`, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 1, ...(remote ? { remote } : {}) });
const input = patch => ({ videos: [], follows: [], tags: {}, metadata: {}, hidden: {}, ...patch });

test('settings audit preserves local, metadata, hidden and exact creator diagnostics', async () => {
  const videos = [video('local'), video('locked'), video('named', { kind: 'youtube', channelName: 'Existing' }),
    video('repair', { kind: 'youtube', channelId: 'UCsource' }), video('unknown', { kind: 'twitch' }), video('adult', { kind: 'redgifs' })];
  const result = await prepareSettingsAudit(input({ videos,
    follows: [{ id: 'yt:source', kind: 'youtube', title: 'Source', handle: 'source', channelId: 'UCsource' }],
    tags: { local: ['year-2026', 'vision-tree'], named: ['science'] },
    metadata: { locked: { tags: {}, lockedFields: ['tags'] } }, hidden: patchSparseRecord({ local: true }, [['evicted', true]]) }), async () => {});
  assert.deepEqual(result.smartTagStatus, { local: 2, tagged: 1, waiting: 1 });
  assert.deepEqual(result.vision, { processed: 1, waiting: 1, eligible: true });
  assert.deepEqual(result.creatorCoverage, { total: 3, present: 1, repairable: 1, unresolved: 1, ambiguous: [] });
  assert.deepEqual(result.hiddenTitles, [{ id: 'local', name: 'Title local' }, { id: 'evicted', name: 'evicted' }]);
  assert.deepEqual(result.companionInspectionCandidates.map(row => row.id), ['local', 'locked']);
  assert.equal(result.metadataTailCoverage.find(row => row.source === 'local').locked, 1);
});

test('80,000 missing names use one follow index and hidden export/cancel boundaries remain cooperative', async t => {
  let followReads = 0, turns = 0;
  const follows = Array.from({ length: 4000 }, (_, index) => ({ id: `yt:${index}`, kind: 'youtube', handle: String(index), channelId: `UC${index}`,
    get title() { followReads++; return `Creator ${index}`; } }));
  const videos = Array.from({ length: 80_000 }, (_, index) => ({ ...video(String(index), { kind: 'youtube', channelId: `UC${index % 4000}` }), folderId: `yt:${index % 4000}` }));
  const hidden = Object.fromEntries(videos.slice(0, 60000).map(row => [row.id, true]));
  const started = performance.now();
  const source = input({ follows, videos, hidden });
  const result = await prepareSettingsAudit(source, async () => { turns++; });
  assert.equal(result.creatorCoverage.repairable, 80000); assert.equal(result.hiddenTitles.length, 60000);
  assert.equal(followReads, 4000); assert.ok(turns > 270);
  t.diagnostic(`80,000 nameless titles / 4,000 follows audited in ${Math.round(performance.now() - started)}ms with ${followReads} follow reads (in-process fixture)`);
  let checkpoints = 0;
  await assert.rejects(prepareSettingsAudit(source, async () => { if (++checkpoints === 4) throw Error('superseded'); }), /superseded/);
});
