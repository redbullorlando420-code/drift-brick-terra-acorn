import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createArtworkAudit } from '../companion/artwork-audit.mjs';
test('artwork audit counts disk bytes and real reads by source without descending into folders', async () => {
  const root = await mkdtemp(join(tmpdir(), 'reelcase-audit-'));
  try {
    await writeFile(join(root, 'tw_stream.jpg'), '1234');
    await writeFile(join(root, 'yt_video.png'), '12');
    await writeFile(join(root, 'ignored.json'), '{}');
    await mkdir(join(root, 'nested'));
    await writeFile(join(root, 'nested', 'tw_hidden.jpg'), 'ignored');
    const audit = createArtworkAudit();
    audit.record('tw:stream', true);
    audit.record('tw:missing', false);
    const result = await audit.scan(root, { maxMs: 5_000 });
    assert.equal(result.sources.find(s => s.source === 'twitch').bytes, 4);
    assert.equal(result.sources.find(s => s.source === 'twitch').hits, 1);
    assert.equal(result.sources.find(s => s.source === 'twitch').misses, 1);
    assert.equal(result.sources.find(s => s.source === 'youtube').files, 1);
    assert.equal(result.sources.length, 2);
    assert.equal((await audit.scan(root, { maxEntries: 1 })).truncated, true);
  } finally { await rm(root, { recursive: true, force: true }); }
});
