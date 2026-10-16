import test from 'node:test';
import assert from 'node:assert/strict';
import { createGridAdmission } from './grid-admission.ts';

function fixture(initial = 48) {
  const jobs: Array<{ work: () => void; cancelled: boolean }> = [];
  const controller = createGridAdmission(initial, work => {
    const job = { work, cancelled: false }; jobs.push(job);
    return () => { job.cancelled = true; };
  });
  const turn = () => {
    const job = jobs.find(row => !row.cancelled);
    if (!job) return false;
    job.cancelled = true; job.work(); return true;
  };
  return { controller, jobs, turn };
}

test('a page request acknowledges immediately and admits at most eight entries per scheduled paint boundary', () => {
  const { controller, turn, jobs } = fixture();
  controller.setMaximum(1_000_000);
  const original = controller.snapshot();
  let notifications = 0;
  const stop = controller.subscribe(() => { notifications++; });
  controller.request(48);
  assert.deepEqual(controller.snapshot(), { loaded: 48, target: 96, pending: true });
  assert.deepEqual(original, { loaded: 48, target: 48, pending: false });
  let previous = 48;
  while (turn()) {
    const next = controller.snapshot().loaded;
    assert.ok(next - previous > 0 && next - previous <= 8); previous = next;
    assert.ok(jobs.filter(row => !row.cancelled).length <= 1);
  }
  assert.deepEqual(controller.snapshot(), { loaded: 96, target: 96, pending: false });
  assert.equal(notifications, 7);
  assert.strictEqual(controller.snapshot(), controller.snapshot());
  stop();
});

test('queued page requests reach the exact final bound without inventing entries', () => {
  const { controller, turn } = fixture(24);
  controller.setMaximum(101);
  controller.request(48); controller.request(48); controller.request(48);
  while (turn()) {}
  assert.deepEqual(controller.snapshot(), { loaded: 101, target: 101, pending: false });
  controller.request(48);
  assert.equal(turn(), false);
  controller.setMaximum(200); controller.request(48);
  while (turn()) {}
  assert.equal(controller.snapshot().loaded, 149);
});

test('viewer and hidden-page holds cancel their pending task and resume without polling or restarting progress', () => {
  const { controller, turn, jobs } = fixture();
  controller.request(48); turn();
  const stale = jobs.find(row => !row.cancelled)!;
  controller.hold(true);
  const held = controller.snapshot();
  stale.work();
  assert.strictEqual(controller.snapshot(), held);
  assert.equal(turn(), false);
  controller.request(48);
  assert.equal(turn(), false);
  controller.hold(false);
  while (turn()) {}
  assert.equal(controller.snapshot().loaded, 144);
});

test('resetting source or changing the maximum invalidates even a callback delivered after cancellation', () => {
  const { controller, turn, jobs } = fixture();
  controller.request(48);
  const old = jobs[0]!;
  controller.reset(24); old.work();
  assert.deepEqual(controller.snapshot(), { loaded: 24, target: 24, pending: false });
  controller.request(48);
  const beforeShrink = jobs.find(row => !row.cancelled)!;
  controller.setMaximum(31); beforeShrink.work();
  assert.equal(controller.snapshot().loaded, 24);
  while (turn()) {}
  assert.deepEqual(controller.snapshot(), { loaded: 31, target: 31, pending: false });
});
