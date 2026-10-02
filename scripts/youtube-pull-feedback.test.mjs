import { test } from 'node:test';
import assert from 'node:assert/strict';
import { restoreYoutubeCooldown, saveYoutubeCooldown, clearYoutubeCooldown, youtubeCooldownMessage } from '../src/lib/remote/youtube-pull-feedback.ts';

test('reload restores the latest provider deadline and expired deadlines allow new pulls', () => {
  const now = Date.now();
  const rows = [
    { kind: 'youtube', lastProviderFailure: { kind: 'rate-limited', retryAt: now + 600_000, message: 'YouTube HTTP 429', cooldownScope: 'catalog' } },
    { kind: 'twitch', lastProviderFailure: { kind: 'rate-limited', retryAt: now + 3_600_000 } },
    { kind: 'youtube', lastProviderFailure: { kind: 'unavailable', retryAt: now + 3_600_000 } },
  ];
  assert.deepEqual(restoreYoutubeCooldown(rows, now), { retryAt: now + 600_000, error: 'YouTube HTTP 429', cooldownScope: 'catalog' });
  assert.equal(restoreYoutubeCooldown(rows, now + 600_001), null);
  assert.match(youtubeCooldownMessage(now + 600_000), /HTTP 429/);
  assert.match(youtubeCooldownMessage(now + 600_000), /recommend waiting.*force a pull now/);
});

test('healthy catalog recovery clears the compact cooldown checkpoint for reload', () => {
  const oldWindow = globalThis.window;
  const storage = new Map();
  globalThis.window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } };
  try {
    saveYoutubeCooldown({ retryAt: Date.now() + 600_000, cooldownScope: 'all' });
    assert(restoreYoutubeCooldown([]));
    clearYoutubeCooldown();
    assert.equal(restoreYoutubeCooldown([]), null);
    assert.equal(storage.size, 0);
  } finally { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; }
});

test('compact checkpoint survives reload and falls back to durable follows when storage is full', () => {
  const oldWindow = globalThis.window;
  const storage = new Map();
  globalThis.window = { localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } };
  try {
    const cooldown = { retryAt: Date.now() + 600_000, error: 'YouTube HTTP 429', cooldownScope: 'catalog' };
    saveYoutubeCooldown(cooldown);
    assert.equal(storage.size, 1);
    assert(storage.values().next().value.length < 150);
    assert.deepEqual(restoreYoutubeCooldown([]), cooldown);
    globalThis.window.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    assert.doesNotThrow(() => saveYoutubeCooldown(cooldown));
    globalThis.window.localStorage.getItem = () => '{bad json';
    assert.deepEqual(restoreYoutubeCooldown([{ kind: 'youtube', lastProviderFailure: { kind: 'rate-limited', retryAt: cooldown.retryAt, message: cooldown.error, cooldownScope: cooldown.cooldownScope } }]), cooldown);
    assert.equal(restoreYoutubeCooldown([]), null);
  } finally { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; }
});

test('ambiguous legacy checkpoints and live-only limits do not freeze archive pulls', () => {
  const oldWindow = globalThis.window;
  const retryAt = Date.now() + 600_000;
  globalThis.window = { localStorage: { getItem: key => key.endsWith('.v1') ? JSON.stringify({ retryAt }) : null } };
  try {
    const follows = [undefined, 'live', 'feed'].map(cooldownScope => ({ kind: 'youtube', lastProviderFailure: { kind: 'rate-limited', retryAt, cooldownScope } }));
    assert.equal(restoreYoutubeCooldown(follows), null);
  } finally { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; }
});
