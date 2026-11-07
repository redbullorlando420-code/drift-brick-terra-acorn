import test from "node:test";
import assert from "node:assert/strict";
import {
  archiveWindowState,
  archiveNotBefore,
  normalizeArchiveWindow,
  validArchiveWindow,
  DEFAULT_ARCHIVE_WINDOW,
} from "./archive-work-window.ts";
const window = (startMinute: number, endMinute: number, timeZone = "UTC") => ({
  version: 1 as const,
  enabled: true,
  startMinute,
  endMinute,
  timeZone,
});
const state = (config: ReturnType<typeof window>, at: string) =>
  archiveWindowState(config, Date.parse(at));
test("work windows are optional, normalized, bounded and fail closed when damaged", () => {
  assert.equal(archiveWindowState(undefined, 0).open, true);
  assert.equal(archiveWindowState(DEFAULT_ARCHIVE_WINDOW, 0).open, true);
  for (const raw of [
    window(5, 5),
    window(-1, 60),
    window(0, 1440),
    window(0, 1, "Unknown/Zone"),
    { ...window(0, 1), version: 2 },
  ]) {
    assert.equal(validArchiveWindow(raw), false);
    const result = archiveWindowState(normalizeArchiveWindow(raw), 0);
    assert.equal(result.open, false);
    assert.equal(result.valid, false);
    assert.equal(result.nextChangeAt, Infinity);
  }
  assert.deepEqual(normalizeArchiveWindow(undefined), DEFAULT_ARCHIVE_WINDOW);
  const saved = normalizeArchiveWindow(window(60, 120));
  assert.equal(
    normalizeArchiveWindow(saved),
    saved,
    "unrelated settings saves retain the schedule identity and do not reset an edited draft",
  );
});
test("overnight hours include start and exclude end with exact next boundaries", () => {
  const config = window(1380, 60);
  assert.equal(state(config, "2026-11-03T23:00:00Z").open, true);
  assert.equal(state(config, "2026-11-04T00:59:59Z").open, true);
  const closed = state(config, "2026-11-04T01:00:00Z");
  assert.equal(closed.open, false);
  assert.equal(closed.nextChangeAt, Date.parse("2026-11-04T23:00:00Z"));
  assert.equal(archiveNotBefore(config, Date.parse("2026-11-04T00:30:00Z")), 0);
});
test("spring DST skips nonexistent minutes and opens at the first real allowed minute", () => {
  const config = window(150, 240, "America/New_York");
  const before = state(config, "2026-03-08T06:59:00Z");
  assert.equal(before.open, false);
  assert.equal(before.nextChangeAt, Date.parse("2026-03-08T07:00:00Z"));
  assert.equal(state(config, "2026-03-08T07:00:00Z").open, true);
  assert.equal(state(config, "2026-03-08T08:00:00Z").open, false);
});
test("fall DST applies repeated wall-clock hours twice and survives backward clocks", () => {
  const config = window(75, 105, "America/New_York");
  assert.equal(state(config, "2026-11-01T05:20:00Z").open, true);
  const closed = state(config, "2026-11-01T05:50:00Z");
  assert.equal(closed.open, false);
  assert.equal(closed.nextChangeAt, Date.parse("2026-11-01T06:15:00Z"));
  assert.equal(state(config, "2026-11-01T06:20:00Z").open, true);
  assert.equal(state(config, "2026-11-01T06:45:00Z").open, false);
  assert.equal(state(config, "2026-11-01T05:20:00Z").open, true);
});
