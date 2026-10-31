import test from "node:test";
import assert from "node:assert/strict";
import {
  RoomQueueDelivery,
  ROOM_INTENT_TIMEOUT_MS,
  ROOM_RECEIPT_LIFETIME_MS,
  queueIntentFence,
  readReceiptQuery,
} from "./room-delivery.ts";
const basis = { queueRevision: 3, selectionRevision: 2 },
  packet = (id = "one") => ({
    type: "queue-action",
    requestId: id,
    operation: { kind: "add", id: "title" },
    ...basis,
    deliveryEpoch: "host-one",
    permissionRevision: 1,
    catalogRevision: 2,
  });
test("lost acknowledgement checks a receipt and confirms an applied operation without replaying it", () => {
  const guest = new RoomQueueDelivery(),
    host = new RoomQueueDelivery(),
    p = packet();
  guest.enqueue(p, 0);
  const receipt = host.confirm("guest", p.requestId, "Applied once", 1, {
    outcome: "applied",
    deliveryEpoch: "host-one",
    queueRevision: 4,
    selectionRevision: 2,
  });
  assert.deepEqual(guest.tick(3000), { check: ["one"], expired: [] });
  assert.equal(host.receiptFor("guest", "one", 3000), receipt);
  assert(guest.acknowledge("one", receipt, 3000));
  assert.equal(guest.size, 0);
  assert.equal(guest.view()[0]!.status, "applied");
  assert.deepEqual(guest.tick(6000), { check: [], expired: [] });
});
test("missing receipt retries once with stable identity and only an unchanged queue, selection and host", () => {
  const guest = new RoomQueueDelivery(),
    p = packet();
  guest.enqueue(p, 0);
  guest.tick(3000);
  const retry = guest.resolveMissing("one", basis, "host-one", 3100)!;
  assert.equal(retry.requestId, p.requestId);
  assert.equal(retry.reconciled, true);
  assert.equal(queueIntentFence(retry, "host-one", basis), undefined);
  assert.equal(guest.resolveMissing("one", basis, "host-one", 6000), undefined);
  assert.equal(guest.view()[0]!.status, "superseded");
  for (const [current, epoch] of [
    [{ queueRevision: 4, selectionRevision: 2 }, "host-one"],
    [{ queueRevision: 3, selectionRevision: 3 }, "host-one"],
    [basis, "host-two"],
  ] as const) {
    const pending = new RoomQueueDelivery();
    pending.enqueue(p, 0);
    assert.equal(pending.resolveMissing("one", current, epoch, 3000), undefined);
    assert.equal(pending.view()[0]!.status, "superseded");
  }
});
test("consumed or removed titles cannot reappear after a reconnect, even if the old original arrives after the receipt query", () => {
  const host = new RoomQueueDelivery(),
    p = packet();
  host.noteQuery("guest", "one", 1000);
  assert(host.requiresFence("guest", "one", 3000));
  assert.equal(
    queueIntentFence(
      p,
      "host-one",
      { queueRevision: 4, selectionRevision: 3 },
      host.requiresFence("guest", "one", 3000),
    ),
    "superseded",
  );
  assert.equal(
    queueIntentFence({ ...p, reconciled: true }, "host-one", {
      queueRevision: 4,
      selectionRevision: 3,
    }),
    "superseded",
  );
  // Ordinary new concurrent intentions still rebase onto the latest host queue.
  assert.equal(
    queueIntentFence(p, "host-one", { queueRevision: 4, selectionRevision: 3 }),
    undefined,
  );
});
test("offline intents remain pending, reconnect queries precede retry, and orphaned work expires without mutations", () => {
  const delivery = new RoomQueueDelivery();
  delivery.enqueue(packet(), 0);
  assert.deepEqual(delivery.tick(2000, false), { check: [], expired: [] });
  assert.equal(delivery.view()[0]!.status, "offline");
  assert.deepEqual(delivery.tick(2100, true), { check: ["one"], expired: [] });
  assert.equal(delivery.view()[0]!.status, "checking");
  assert.deepEqual(delivery.tick(ROOM_INTENT_TIMEOUT_MS), { check: [], expired: ["one"] });
  assert.equal(delivery.size, 0);
  assert.equal(delivery.view()[0]!.status, "expired");
  assert.equal(delivery.view()[0]!.revision,3);
  assert.equal(delivery.resolveMissing("one", basis, "host-one", 50000), undefined);
});
test("receipts and query fences are isolated by peer, bounded, retained beyond intent expiry and cleared per room", () => {
  const delivery = new RoomQueueDelivery(),
    receipt = delivery.confirm("peer:a", "x", "Done", 0, { outcome: "applied" });
  assert.equal(delivery.receiptFor("peer:a", "x", ROOM_INTENT_TIMEOUT_MS), receipt);
  assert.equal(delivery.receiptFor("peer", "a:x", 1), undefined);
  assert.equal(delivery.receiptFor("other", "x", 1), undefined);
  for (let i = 1; i < 128; i++) delivery.confirm("peer", String(i), "Done", 0);
  assert.equal(delivery.canConfirm(ROOM_INTENT_TIMEOUT_MS), false);
  delivery.noteQuery("peer", "x", 0);
  assert(delivery.requiresFence("peer", "x", ROOM_INTENT_TIMEOUT_MS));
  assert.equal(delivery.canConfirm(ROOM_RECEIPT_LIFETIME_MS), true);
  assert.equal(delivery.receiptFor("peer:a", "x", ROOM_RECEIPT_LIFETIME_MS), undefined);
  assert.equal(delivery.requiresFence("peer", "x", ROOM_RECEIPT_LIFETIME_MS), false);
  delivery.enqueue(packet(), 0);
  delivery.clear();
  assert.equal(delivery.size, 0);
  assert.deepEqual(delivery.view(), []);
});
test("pending operations and completed history stay bounded, duplicate receipts do not grow history", () => {
  const delivery = new RoomQueueDelivery();
  for (let i = 0; i < 16; i++) assert(delivery.enqueue(packet(String(i)), 0));
  assert.equal(delivery.enqueue(packet("extra"), 0), false);
  assert.equal(delivery.enqueue(packet("0"), 0), false);
  for (let i = 0; i < 16; i++)
    assert(
      delivery.acknowledge(
        String(i),
        { type: "queue-result", requestId: String(i), text: "Done", outcome: "rejected" },
        10,
      ),
    );
  assert.equal(delivery.view().length, 8);
  assert.equal(delivery.acknowledge("0"), false);
  assert.equal(delivery.view().length, 8);
});
test("receipt queries reject oversized/duplicate identities and old host generations cannot authorize edits", () => {
  const q = {
    type: "queue-receipt-query",
    queryId: "q",
    requestIds: ["a"],
    deliveryEpoch: "host-one",
  };
  assert(readReceiptQuery(q));
  for (const row of [
    { ...q, queryId: "" },
    { ...q, requestIds: ["a", "a"] },
    { ...q, requestIds: Array(17).fill("a") },
    { ...q, requestIds: [{}] },
    { ...q, deliveryEpoch: "x".repeat(161) },
  ])
    assert.equal(readReceiptQuery(row), undefined);
  for (const row of [
    { ...packet(), deliveryEpoch: "old" },
    { ...packet(), queueRevision: NaN },
    { ...packet(), selectionRevision: -1 },
    { ...packet(), deliveryEpoch: undefined },
  ])
    assert.equal(queueIntentFence(row, "host-one", basis), "rejected");
});

test('delayed original expires at the host even after receipt and query histories have been pruned',()=>{
 const p={...packet(),intentAt:100000},host=new RoomQueueDelivery();host.noteQuery('guest',p.requestId,100000);assert.equal(queueIntentFence(p,'host-one',basis,false,100001),undefined);
 assert.equal(host.requiresFence('guest',p.requestId,100000+ROOM_RECEIPT_LIFETIME_MS),false);
 assert.equal(queueIntentFence(p,'host-one',basis,false,100000+ROOM_RECEIPT_LIFETIME_MS),'superseded');
 assert.equal(queueIntentFence({...p,intentAt:undefined},'host-one',basis,false,100001),'superseded');assert.equal(queueIntentFence({...p,intentAt:106000},'host-one',basis,false,100000),'superseded');
});
