import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkHold } from './work-hold.ts';

test('optional work resumes only after every foreground owner releases', () => {
  const changes: boolean[] = [], hold = createWorkHold(value => changes.push(value));
  const ranking = hold.acquire(), navigation = hold.acquire();
  assert.equal(hold.held(), true); assert.deepEqual(changes, [true]);
  ranking(); ranking(); assert.equal(hold.held(), true);
  assert.deepEqual(changes, [true]);
  navigation(); navigation(); assert.equal(hold.held(), false);
  assert.deepEqual(changes, [true, false]);
  const next = hold.acquire(); ranking(); assert.equal(hold.held(), true);
  next(); assert.deepEqual(changes, [true, false, true, false]);
});
