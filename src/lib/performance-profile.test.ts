import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePerformanceProfile } from './performance-profile.ts';
import { railWindow } from './virtual-rail.ts';
import { gridWindow, GridRowMetrics } from './virtual-grid.ts';

test('constrained capabilities share ceilings and unknown/invalid hints retain normal defaults', () => {
  const low = resolvePerformanceProfile('adaptive', { cores: 2, memoryGiB: 2 });
  assert.equal(low.lowMemory, true);
  assert.equal(low.thumbnailWorkers, 1);
  assert.equal(low.artworkBytes, 2 * 1024 * 1024);
  assert.equal(low.imageRequests, 4);
  for (const hints of [{ cores: 4 }, { memoryGiB: 2 }, { saveData: true }]) assert.equal(resolvePerformanceProfile('adaptive', hints), low);
  for (const hints of [{}, { cores: 0, memoryGiB: -1 }, { cores: NaN, memoryGiB: Infinity }, { cores: 16, memoryGiB: 8 }]) {
    assert.equal(resolvePerformanceProfile('adaptive', hints).lowMemory, false);
  }
  assert.equal(resolvePerformanceProfile('low-memory', { cores: 32, memoryGiB: 8 }).reason, 'selected');
});

test('low-memory windows retain catalog positions and bounded visible references at desktop/phone widths', () => {
  const profile = resolvePerformanceProfile('low-memory');
  for (const width of [390, 1280]) {
    for (const position of [0, 510, 999990]) {
      const rail = railWindow(1_000_000, width, 236, position, profile.railOverscan);
      assert.ok(rail.end - rail.start <= Math.max(3, Math.ceil(width / 236)));
      assert.ok(rail.start <= position && rail.end > position);
    }
  }
  for (const columns of [1, 2, 3, 5, 7]) {
    const metrics = new GridRowMetrics(260);
    for (const top of [0, 511, 4_000_001, 900, 0]) {
      const window = gridWindow(1_000_000, columns, top, 844, metrics, profile.gridMountCap, 1);
      assert.ok(window.end - window.start <= profile.gridMountCap);
      const visibleEnd = (metrics.rowAt(top + 844, Math.ceil(1_000_000 / columns)) + 1) * columns;
      assert.ok(window.end >= visibleEnd, 'visible rows take priority over overscan');
      assert.ok(window.start <= metrics.rowAt(top, Math.ceil(1_000_000 / columns)) * columns);
    }
  }
});
