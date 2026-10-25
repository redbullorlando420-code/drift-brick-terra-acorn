import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mediaRange, serveDownloadMedia } from '../companion/download-media.mjs';

test('local media byte ranges handle seeking, suffixes and malformed/out-of-bounds requests', () => {
  assert.deepEqual(mediaRange(undefined, 100), { start: 0, end: 99, partial: false });
  assert.deepEqual(mediaRange('bytes=10-19', 100), { start: 10, end: 19, partial: true });
  assert.deepEqual(mediaRange('bytes=95-', 100), { start: 95, end: 99, partial: true });
  assert.deepEqual(mediaRange('bytes=-10', 100), { start: 90, end: 99, partial: true });
  assert.deepEqual(mediaRange('bytes=0-999', 100), { start: 0, end: 99, partial: true });
  for (const input of ['bytes=100-', 'bytes=3-2', 'bytes=-0', 'bytes=-', 'bytes=1-3,5-8', 'items=1-3', 'bytes=99999999999999999-']) assert.equal(mediaRange(input, 100), null);
});

test('completed local media serves bounded ranges and HEAD, with truthful missing/invalid responses', async t => {
  const root = mkdtempSync(join(tmpdir(), 'realhub-media-')), path = join(root, 'fixture.mp4');
  writeFileSync(path, Buffer.from('0123456789'));
  const server = createServer((req, res) => serveDownloadMedia(req, res, req.url === '/missing' ? null : { path, size: 10, mime: 'video/mp4' }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); rmSync(root, { recursive: true, force: true }); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const full = await fetch(base); assert.equal(full.status, 200); assert.equal(await full.text(), '0123456789'); assert.match(full.headers.get('cache-control'), /no-store/);
  const partial = await fetch(base, { headers: { Range: 'bytes=2-4' } }); assert.equal(partial.status, 206); assert.equal(partial.headers.get('content-range'), 'bytes 2-4/10'); assert.equal(await partial.text(), '234');
  const head = await fetch(base, { method: 'HEAD' }); assert.equal(head.headers.get('content-length'), '10'); assert.equal(await head.text(), '');
  const invalid = await fetch(base, { headers: { Range: 'bytes=10-' } }); assert.equal(invalid.status, 416); assert.equal(invalid.headers.get('content-range'), 'bytes */10');
  assert.equal((await fetch(base + '/missing')).status, 404);
});
