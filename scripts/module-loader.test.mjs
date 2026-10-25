import assert from 'node:assert/strict';
import test from 'node:test';
import { createModuleLoader } from '../src/lib/module-loader.ts';

test('idle warmup and concurrent navigation share one request and module', async () => {
  let calls = 0;
  let finish;
  const module = { default: () => null };
  const load = createModuleLoader(() => { calls++; return new Promise(resolve => { finish = resolve; }); });
  const warmup = load();
  const navigation = load();
  assert.equal(warmup, navigation);
  await Promise.resolve();
  assert.equal(calls, 1);
  finish(module);
  assert.equal(await navigation, module);
  assert.equal(load(), warmup);
  assert.equal(calls, 1);
});

test('failed warmup can retry on navigation without poisoning another desk', async () => {
  let attempts = 0, otherCalls = 0;
  const module = { default: () => null };
  const load = createModuleLoader(() => ++attempts === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(module));
  const other = createModuleLoader(async () => { otherCalls++; return module; });
  await assert.rejects(load(), /offline/);
  assert.equal(otherCalls, 0);
  assert.equal(await load(), module);
  assert.equal(attempts, 2);
  assert.equal(await other(), module);
  assert.equal(otherCalls, 1);
});

test('synchronous loader failure also releases the cached request', async () => {
  let attempts = 0;
  const load = createModuleLoader(() => { if (++attempts === 1) throw new Error('unavailable'); return Promise.resolve('ready'); });
  await assert.rejects(load(), /unavailable/);
  assert.equal(await load(), 'ready');
});
