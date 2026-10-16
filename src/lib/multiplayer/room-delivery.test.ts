import test from "node:test";
import assert from "node:assert/strict";
import { RoomQueueDelivery } from "./room-delivery.ts";

test("lost queue requests retry with the same payload and expire without endless work", () => {
  const delivery = new RoomQueueDelivery();
  const packet = { type: "queue-action", requestId: "move-1", operation: { kind: "up", id: "a" } };
  assert.equal(delivery.enqueue(packet, 0), true);
  assert.deepEqual(delivery.tick(2999), { resend: [], expired: [] });
  for (const now of [3000, 6000, 9000]) assert.equal(delivery.tick(now).resend[0], packet);
  assert.deepEqual(delivery.tick(12000), { resend: [], expired: ["move-1"] });
  assert.equal(delivery.size, 0);
  assert.deepEqual(delivery.tick(15000), { resend: [], expired: [] });
});
test("confirmation retires only its request and duplicate confirmations are ignored", () => {
  const delivery = new RoomQueueDelivery();
  for (const id of ["a", "b"]) delivery.enqueue({ type: "queue-shuffle", requestId: id }, 0);
  assert.equal(delivery.acknowledge("unknown"), false);
  assert.equal(delivery.acknowledge("a"), true);
  assert.equal(delivery.acknowledge("a"), false);
  assert.deepEqual(delivery.tick(3000).resend.map(packet => packet.requestId), ["b"]);
});
test("host replays receipts per peer without rerunning the action; busy cache preserves retry protection", () => {
  const delivery = new RoomQueueDelivery();
  const receipt = delivery.confirm("peer:a", "x", "Moved once", 0);
  assert.equal(delivery.receiptFor("peer:a", "x", 12000), receipt);
  assert.equal(delivery.receiptFor("peer", "a:x", 12000), undefined);
  assert.equal(delivery.receiptFor("other", "x", 12000), undefined);
  for (let i = 1; i < 128; i++) delivery.confirm("peer", String(i), "Done", 0);
  assert.equal(delivery.canConfirm(12000), false);
  assert.equal(delivery.receiptFor("peer:a", "x", 12000), receipt);
  assert.equal(delivery.canConfirm(30000), true);
  assert.equal(delivery.receiptFor("peer:a", "x", 30000), undefined);
});
test("pending work is bounded and room cleanup releases packets and receipts", () => {
  const delivery = new RoomQueueDelivery();
  for (let i = 0; i < 16; i++) assert.equal(delivery.enqueue({ type: "queue-batch", requestId: String(i) }, 0), true);
  assert.equal(delivery.enqueue({ type: "queue-batch", requestId: "overflow" }, 0), false);
  assert.equal(delivery.enqueue({ type: "queue-batch", requestId: "0" }, 0), false);
  delivery.confirm("peer", "0", "Done", 0);
  delivery.clear();
  assert.equal(delivery.size, 0);
  assert.equal(delivery.receiptFor("peer", "0", 0), undefined);
  assert.deepEqual(delivery.tick(3000), { resend: [], expired: [] });
});
