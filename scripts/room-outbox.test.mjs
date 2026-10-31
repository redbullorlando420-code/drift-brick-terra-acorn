import test from "node:test";
import assert from "node:assert/strict";
import {
  RoomOutbox,
  ROOM_OUTBOX_LIMITS as limits,
  roomTraffic,
} from "../src/lib/multiplayer/room-outbox.ts";
const send = (outbox, data, now = 0, valid) =>
  outbox.enqueue(data, JSON.stringify({ t: "d", d: data }), now, valid);
const channel = (bufferedAmount = 0) => ({
  readyState: "open",
  bufferedAmount,
  sent: [],
  send(wire) {
    this.sent.push(JSON.parse(wire).d);
    this.bufferedAmount += Buffer.byteLength(wire);
  },
});
const page = (id, revision = 1) => ({
  type: "host-catalog-result",
  requestId: id,
  catalogRevision: revision,
  media: [{ name: "x".repeat(12000) }],
});
test("control and chat precede paced catalog pages under backpressure without changing control order", () => {
  const box = new RoomOutbox(),
    c = channel(limits.nativeBulkBytes + 1);
  send(box, page("page-one"));
  send(box, { type: "chat", text: "hello" });
  send(box, { type: "sync", playing: false, seek: false });
  box.flush(c, 0);
  assert.deepEqual(
    c.sent.map((d) => d.type),
    ["chat", "sync"],
  );
  assert.equal(box.snapshot().catalogPackets, 1);
  c.bufferedAmount = 0;
  box.flush(c, 1);
  assert.equal(c.sent.at(-1).requestId, "page-one");
  assert.equal(box.size, 0);
});
test("obsolete clocks coalesce, while pause, seek and canonical state discard stale resume observations", () => {
  for (const interruption of [
    { type: "sync", playing: false },
    { type: "sync", playing: true, seek: true },
    { type: "room-state" },
    { type: "video" },
  ]) {
    const box = new RoomOutbox();
    for (let i = 0; i < 1000; i++)
      send(box, { type: "sync", playing: true, observed: true, position: i }, i);
    assert.equal(box.size, 1);
    assert.equal(box.snapshot().coalesced, 999);
    send(box, interruption, 1000);
    const c = channel();
    box.flush(c, 1000);
    assert.deepEqual(c.sent, [interruption]);
  }
  assert.equal(roomTraffic({ type: "sync", playing: true, seek: true }), "control");
  assert.equal(roomTraffic({ type: "sync-request" }), "control");
});
test("per-peer queues stay byte and packet bounded while urgent traffic has reserved space", () => {
  const box = new RoomOutbox();
  let accepted = 0;
  for (let i = 0; i < 10000; i++) if (send(box, page(String(i)))) accepted++;
  assert.ok(accepted > 0 && accepted < 64);
  assert.ok(box.snapshot().queuedBytes <= limits.bulkBytes);
  assert.ok(box.size <= limits.packets);
  assert(send(box, { type: "chat", text: "reserved control" }));
  const c = channel();
  box.flush(c, 0);
  assert.equal(c.sent[0].type, "chat");
  assert.ok(c.bufferedAmount < limits.nativeControlBytes);
  assert.equal(box.snapshot().dropped > 0, true);
  assert.equal(send(box, { type: "chat", text: "x".repeat(limits.packetBytes + 1) }), false);
});
test("revocation, search cancellation and last-moment authority guards remove unsent catalog metadata", () => {
  const box = new RoomOutbox();
  send(box, page("old"));
  send(box, { type: "host-catalog-status", catalogRevision: 2, enabled: true });
  assert.equal(box.snapshot().catalogPackets, 0);
  send(box, page("cancel", 2));
  box.cancelCatalog("cancel");
  assert.equal(box.snapshot().catalogPackets, 0);
  let allowed = true;
  send(box, page("guarded", 2), 0, () => allowed);
  allowed = false;
  const c = channel();
  box.flush(c, 1);
  assert.equal(
    c.sent.some((d) => d.type === "host-catalog-result"),
    false,
  );
  send(box, page("disabled", 2));
  send(box, { type: "host-catalog-status", catalogRevision: 2, enabled: false });
  assert.equal(box.snapshot().catalogPackets, 0);
});
test("closed, throwing and stalled channels do not leak buffers or create endless retained work", () => {
  const box = new RoomOutbox();
  send(box, page("held"));
  const c = channel(limits.nativeControlBytes);
  c.readyState = "closed";
  box.flush(c, 0);
  assert.equal(box.size, 1);
  c.readyState = "open";
  c.send = () => {
    throw Error("closed during send");
  };
  box.flush(c, 0);
  assert.equal(box.size, 1);
  box.flush(c, limits.lifetimeMs);
  assert.equal(box.size, 0);
  send(box, page("final"), limits.lifetimeMs);
  box.close();
  assert.equal(box.size, 0);
  assert.equal(send(box, page("after-close")), false);
});
test("three paced peers retain independent budgets and a slow guest cannot block another guest or host controls", () => {
  const peers = Array.from({ length: 3 }, () => ({
    box: new RoomOutbox(),
    channel: channel(limits.nativeBulkBytes + 1),
  }));
  for (const p of peers) for (let i = 0; i < 100; i++) send(p.box, page(String(i)));
  for (const p of peers) {
    send(p.box, { type: "chat", text: "hello" });
    send(p.box, { type: "sync", playing: false });
    p.box.flush(p.channel, 0);
    assert.deepEqual(
      p.channel.sent.map((row) => row.type),
      ["chat", "sync"],
    );
    assert.ok(p.box.snapshot().queuedBytes <= limits.queuedBytes);
  }
  peers[1].channel.bufferedAmount = 0;
  peers[1].box.flush(peers[1].channel, 1);
  assert.equal(peers[1].channel.sent.at(-1).type, "host-catalog-result");
  assert.equal(peers[0].channel.sent.length, 2);
});
