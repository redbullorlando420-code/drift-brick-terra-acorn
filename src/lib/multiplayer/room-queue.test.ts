import assert from "node:assert/strict";
import test from "node:test";
import { applyRoomQueueAction, normalizeRoomQueue, parseRoomQueueAction, distinctRoomQueue, shuffleRoomQueue, applyRoomQueueEdit, parseRoomQueueEdit } from "./room-queue.ts";

test('selected-title edits preserve latest host order and unrelated concurrent additions', () => {
  const current = ['new', 'c', 'a', 'b', 'later'];
  assert.deepEqual(applyRoomQueueEdit(current, { kind: 'next', ids: ['a', 'c', 'gone'] }), ['c', 'a', 'new', 'b', 'later']);
  assert.deepEqual(applyRoomQueueEdit(current, { kind: 'end', ids: ['a', 'c'] }), ['new', 'b', 'later', 'c', 'a']);
  assert.deepEqual(applyRoomQueueEdit(current, { kind: 'remove', ids: ['c', 'a', 'gone'] }), ['new', 'b', 'later']);
  for (const kind of ['next', 'end', 'remove'] as const) {
    const edit = { kind, ids: ['a', 'c', 'gone'] };
    const once = applyRoomQueueEdit(current, edit);
    assert.deepEqual(applyRoomQueueEdit(once, edit), once);
    assert.deepEqual(applyRoomQueueEdit([], edit), []);
  }
});
test('batch edit packets reject malformed or oversized selections and normalize duplicate IDs', () => {
  assert.deepEqual(parseRoomQueueEdit({ kind: 'remove', ids: [' a ', 'a', 'b'] }), { kind: 'remove', ids: ['a', 'b'] });
  for (const value of [null, {kind:'replace', ids:['a']}, {kind:'next',ids:[]}, {kind:'end',ids:['']}, {kind:'remove',ids:[1]}, {kind:'remove',ids:['x'.repeat(601)]}, {kind:'remove',ids:Array(49).fill('a')}]) assert.equal(parseRoomQueueEdit(value), null);
  assert.equal(applyRoomQueueEdit(Array.from({length:100},(_,i)=>String(i)), {kind:'next',ids:['99']}).length,48);
});
test("concurrent guest intentions preserve unrelated titles and duplicate retries are idempotent", () => {
  let rows = ["a", "b"];
  rows = applyRoomQueueAction(rows, { kind: "add", id: "c" });
  rows = applyRoomQueueAction(rows, { kind: "remove", id: "a" });
  rows = applyRoomQueueAction(rows, { kind: "add", id: "c" });
  assert.deepEqual(rows, ["b", "c"]);
  assert.deepEqual(applyRoomQueueAction(rows, { kind: "move", id: "c", before: "b" }), ["c", "b"]);
  assert.deepEqual(applyRoomQueueAction(rows, { kind: "move", id: "missing", before: "b" }), rows);
});

test("canonical queues exclude the playing title and duplicate device IDs without losing order", () => {
  const keys:Record<string,string>={host:"youtube:a",guest:"youtube:a",playing:"twitch:vod:1",other:"youtube:b"};
  assert.deepEqual(distinctRoomQueue(["host","other","guest","playing","missing"],id=>keys[id],"twitch:vod:1"),["host","other"]);
  assert.deepEqual(distinctRoomQueue(["guest","host","other"],id=>keys[id]),["guest","other"]);
});
test("queue actions remain bounded and tolerate an anchor removed by another guest", () => {
  const rows = Array.from({ length: 48 }, (_, i) => String(i));
  assert.deepEqual(applyRoomQueueAction(rows, { kind: "add", id: "overflow" }), rows);
  assert.deepEqual(applyRoomQueueAction(["a", "b"], { kind: "move", id: "a", before: "gone" }), [
    "b",
    "a",
  ]);
  assert.deepEqual(normalizeRoomQueue([" a ", "a", null, "", "x".repeat(601)]), ["a"]);
  assert.equal(parseRoomQueueAction({ kind: "replace", id: "a" }), null);
  assert.equal(parseRoomQueueAction({ kind: "add", id: "a", before: 42 }), null);
});

test("play next uses the latest head and can move an existing title in a full queue", () => {
  assert.deepEqual(applyRoomQueueAction(["new-head","a","b"],{kind:"next",id:"b"}),["b","new-head","a"]);
  const full=Array.from({length:48},(_,i)=>String(i));
  assert.deepEqual(applyRoomQueueAction(full,{kind:"next",id:"47"}),["47",...full.slice(0,47)]);
  assert.deepEqual(applyRoomQueueAction(full,{kind:"next",id:"new"}),full);
  assert.deepEqual(parseRoomQueueAction({kind:"next",id:" b "}),{kind:"next",id:"b",before:undefined});
});

test("relative moves use the latest order after another guest removes or inserts a neighbor", () => {
  const withoutNeighbor = applyRoomQueueAction(["a", "b", "c", "d"], {kind:"remove",id:"b"});
  assert.deepEqual(applyRoomQueueAction(withoutNeighbor,{kind:"up",id:"c"}),["c","a","d"]);
  const withNeighbor = applyRoomQueueAction(["a", "c", "d"], {kind:"add",id:"new",before:"c"});
  assert.deepEqual(applyRoomQueueAction(withNeighbor,{kind:"up",id:"c"}),["a","c","new","d"]);
  assert.deepEqual(applyRoomQueueAction(["a","b","c"],{kind:"down",id:"a"}),["b","a","c"]);
  for (const [kind,id] of [["up","a"],["down","c"],["up","gone"]] as const)
    assert.deepEqual(applyRoomQueueAction(["a","b","c"],{kind,id}),["a","b","c"]);
  assert.equal(parseRoomQueueAction({kind:"up",id:"c"})?.kind,"up");
});

test("shuffle preserves bounded membership and changes the order even on an identity draw", () => {
  const rows=Array.from({length:48},(_,i)=>String(i));
  for (const draw of [()=>0,()=>1,()=>NaN,()=>0.5]) {
    const result=shuffleRoomQueue(rows,draw);
    assert.deepEqual([...result].sort(),[...rows].sort());
    assert.notDeepEqual(result,rows);
  }
  assert.deepEqual(shuffleRoomQueue([]),[]);
  assert.deepEqual(shuffleRoomQueue(["one","one"]),["one"]);
  assert.equal(shuffleRoomQueue([...rows,"overflow"]).length,48);
});
