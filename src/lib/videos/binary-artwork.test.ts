import { test } from 'node:test';
import assert from 'node:assert/strict';
import { artworkBytes, artworkUrl, binaryArtwork, binaryArtworkSnapshot, releaseArtwork } from './binary-artwork.ts';

test('base64 disk records decode losslessly and blob URL ownership is released exactly once', async () => {
  const bytes = Uint8Array.from({ length: 65536 }, (_, i) => i % 256);
  const legacy = `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}`;
  const blob = await binaryArtwork(legacy);
  assert.ok(blob instanceof Blob);
  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), bytes);
  const url = artworkUrl(blob);
  assert.equal(artworkBytes(url), bytes.length);
  assert.ok(artworkBytes(legacy) > artworkBytes(url) * 2.6);
  assert.deepEqual(binaryArtworkSnapshot(), { urls: 1, bytes: bytes.length });
  assert.deepEqual(new Uint8Array(await (await fetch(url)).arrayBuffer()), bytes);
  releaseArtwork(url); releaseArtwork(url);
  assert.deepEqual(binaryArtworkSnapshot(), { urls: 0, bytes: 0 });
  await assert.rejects(fetch(url));
});
test('provider URLs and already binary records do not create extra copies', async () => {
  const remote = 'https://example.com/artwork.jpg', blob = new Blob(['tiny'], { type: 'image/jpeg' });
  assert.equal(await binaryArtwork(remote), remote);
  assert.equal(await binaryArtwork(blob), blob);
  const first = artworkUrl(blob), second = artworkUrl(blob);
  releaseArtwork(first); assert.equal(binaryArtworkSnapshot().urls, 1);
  releaseArtwork(second); assert.equal(binaryArtworkSnapshot().urls, 0);
});
