import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companionHealth, companionGetThumb } from './companion.ts';
import { listNetworkDevices } from './network-presence.ts';

test('companion availability coalesces concurrent probes, caches briefly and supports explicit retry', async () => {
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (_url, init) => {
    requests++;
    assert.ok(init?.signal, 'availability probes have a deadline');
    await Promise.resolve();
    return Response.json({ ok: true, version: 10 });
  };
  try {
    const checks = await Promise.all(Array.from({ length: 40 }, () => companionHealth(true)));
    assert.equal(requests, 1);
    assert.equal(checks[0]?.version, 10);
    await companionHealth(); assert.equal(requests, 1);
    await companionHealth(true); assert.equal(requests, 2);
    globalThis.fetch = async () => { requests++; throw new Error('offline'); };
    assert.equal(await companionHealth(true), null);
    assert.equal(await companionHealth(), null);
    assert.equal(requests, 3);
  } finally { globalThis.fetch = oldFetch; }
});

test('offline thumbnail cache reads fall back promptly and stop hammering an unavailable companion', async () => {
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (_url, init) => { requests++; assert.ok(init?.signal); throw new Error('offline'); };
  try {
    assert.equal(await companionGetThumb('first'), null);
    for (let i = 0; i < 100; i++) assert.equal(await companionGetThumb(String(i)), null);
    assert.equal(requests, 1);
  } finally { globalThis.fetch = oldFetch; }
});

test('simultaneous device panels share one bounded presence request', async () => {
  const oldFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (_url, init) => { requests++; assert.ok(init?.signal); return Response.json({ devices: [{ id: 'test-device' }] }); };
  try {
    const results = await Promise.all(Array.from({ length: 20 }, () => listNetworkDevices()));
    assert.equal(requests, 1);
    assert.equal(results[0].devices[0].id, 'test-device');
    await listNetworkDevices(); assert.equal(requests, 1);
  } finally { globalThis.fetch = oldFetch; }
});
