import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRedditImageUrl } from './reddit-media-status.ts';

test('normal photos inspect headers and cancel the body without downloading it', async () => {
  let cancelled = 0;
  const response = new Response(new ReadableStream({ cancel() { cancelled++; } }), { headers: { 'content-type': 'image/jpeg' } });
  const result = await inspectRedditImageUrl('https://i.redd.it/normal-test.jpg', (async () => response) as typeof fetch);
  assert.equal(result.removed, false); assert.equal(cancelled, 1);
});
test('SVG removal text behind a jpg URL is detected and concurrent probes share one request', async () => {
  let requests = 0;
  const request = (async () => { requests++; await new Promise(resolve => setTimeout(resolve, 5));
    return new Response('<svg><style>text{fill:black}</style><text>[ Removed by Reddit ]</text></svg>', { headers: { 'content-type': 'image/svg+xml' } }); }) as typeof fetch;
  const url = 'https://preview.redd.it/photo-status-test.jpg';
  const [a, b] = await Promise.all([inspectRedditImageUrl(url, request), inspectRedditImageUrl(url, request)]);
  assert.equal(a.removed, true); assert.deepEqual(b, a); assert.equal(requests, 1);
  assert.deepEqual(await inspectRedditImageUrl(url, request), a); assert.equal(requests, 1);
});
test('only allowlisted HTTPS media endpoints are fetched; redirects cannot reach other hosts', async () => {
  let requests = 0;
  const request = (async () => { requests++; return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } }); }) as typeof fetch;
  for (const url of ['http://i.redd.it/a.jpg', 'https://i.redd.it.evil.test/a.jpg', 'https://user@i.redd.it/a.jpg', 'https://i.redd.it:8080/a.jpg']) {
    assert.equal((await inspectRedditImageUrl(url, request)).removed, false);
  }
  assert.equal(requests, 0);
  assert.equal((await inspectRedditImageUrl('https://i.redd.it/redirect-test.jpg', request)).removed, false);
  assert.equal(requests, 1);
});
test('transient errors and legitimate SVG content never hide a photo', async () => {
  for (const status of [403, 404, 429, 503]) {
    assert.equal((await inspectRedditImageUrl(`https://i.redd.it/error-${status}.jpg`, (async () => new Response('failure', { status })) as typeof fetch)).removed, false);
  }
  assert.equal((await inspectRedditImageUrl('https://i.redd.it/valid-svg.jpg', (async () => new Response('<svg><text>Hello</text></svg>', { headers: { 'content-type': 'image/svg+xml' } })) as typeof fetch)).removed, false);
});
test('inspection stops at its byte budget and does not scan a full remote file', async () => {
  let cancelled = false;
  const body = new ReadableStream<Uint8Array>({ pull(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(32768))); }, cancel() { cancelled = true; } });
  assert.equal((await inspectRedditImageUrl('https://i.redd.it/large-svg.jpg', (async () => new Response(body, { headers: { 'content-type': 'image/svg+xml' } })) as typeof fetch)).removed, false);
  assert.equal(cancelled, true);
});
