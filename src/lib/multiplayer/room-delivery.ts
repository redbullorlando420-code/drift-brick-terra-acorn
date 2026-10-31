export type QueuePacket = { type: string; requestId: string; [key: string]: unknown };
export type QueueOutcome = "applied" | "superseded" | "rejected";
export type QueueBasis = { queueRevision: number; selectionRevision: number };
export type QueueReceipt = {
  type: "queue-result";
  requestId: string;
  text: string;
  outcome?: QueueOutcome;
  queueRevision?: number;
  selectionRevision?: number;
  deliveryEpoch?: string;
};
export const ROOM_INTENT_TIMEOUT_MS = 45_000,
  ROOM_RECEIPT_LIFETIME_MS = 90_000;
export type IntentStatus = "waiting" | "checking" | "offline" | QueueOutcome | "expired";
export type IntentView = {
  id: string;
  action: string;
  status: IntentStatus;
  revision: number;
  at: number;
};
type Pending = {
  packet: QueuePacket;
  started: number;
  sent: number;
  status: IntentStatus;
  retried: boolean;
};
const validRevision = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export function validQueueBasis(value: unknown): value is QueueBasis {
  return Boolean(
    value &&
    typeof value === "object" &&
    validRevision((value as QueueBasis).queueRevision) &&
    validRevision((value as QueueBasis).selectionRevision),
  );
}
const sameBasis = (packet: QueuePacket, basis: QueueBasis) =>
  packet.queueRevision === basis.queueRevision &&
  packet.selectionRevision === basis.selectionRevision;
/** Session-only, receipt-first delivery. Unknown results are never blindly replayed. */
export class RoomQueueDelivery {
  private pending = new Map<string, Pending>();
  private receipts = new Map<string, { receipt: QueueReceipt; at: number }>();
  private queried = new Map<string, number>();
  private history: IntentView[] = [];
  get size() {
    return this.pending.size;
  }
  private key(peer: string, id: string) {
    return JSON.stringify([peer, id]);
  }
  enqueue(packet: QueuePacket, now: number) {
    if (this.pending.size >= 16 || this.pending.has(packet.requestId)) return false;
    this.pending.set(packet.requestId, {
      packet,
      started: now,
      sent: now,
      status: "waiting",
      retried: false,
    });
    return true;
  }
  private finish(id: string, status: IntentStatus, revision: number, now: number) {
    const entry = this.pending.get(id);
    if (!entry) return false;
    this.pending.delete(id);
    this.history = [
      { id, action: entry.packet.type, status, revision:revision>=0?revision:typeof entry.packet.queueRevision==='number'?entry.packet.queueRevision:0, at: now },
      ...this.history,
    ].slice(0, 8);
    return true;
  }
  acknowledge(id: string, receipt?: QueueReceipt, now = Date.now()) {
    return this.finish(id, receipt?.outcome ?? "applied", receipt?.queueRevision ?? 0, now);
  }
  stop(status: "superseded" | "expired", now: number) {
    for (const id of [...this.pending.keys()]) this.finish(id, status, -1, now);
  }
  tick(now: number, online = true) {
    const check: string[] = [],
      expired: string[] = [];
    for (const [id, entry] of this.pending) {
      if (now - entry.started >= ROOM_INTENT_TIMEOUT_MS) {
        this.finish(id, "expired", -1, now);
        expired.push(id);
        continue;
      }
      if (!online) {
        entry.status = "offline";
        continue;
      }
      if (entry.status === "offline" || now - entry.sent >= 3000) {
        entry.status = "checking";
        entry.sent = now;
        check.push(id);
      }
    }
    return { check, expired };
  }
  checkNow(now: number) {
    for (const entry of this.pending.values()) entry.sent = now - 3000;
  }
  resolveMissing(id: string, basis: QueueBasis, epoch: string, now: number) {
    const entry = this.pending.get(id);
    if (!entry) return;
    if (now - entry.started >= ROOM_INTENT_TIMEOUT_MS) {
      this.finish(id, "expired", basis.queueRevision, now);
      return;
    }
    if (entry.retried || entry.packet.deliveryEpoch !== epoch || !sameBasis(entry.packet, basis)) {
      this.finish(id, "superseded", basis.queueRevision, now);
      return;
    }
    entry.retried = true;
    entry.status = "waiting";
    entry.sent = now;
    entry.packet = { ...entry.packet, reconciled: true };
    return entry.packet;
  }
  view(): IntentView[] {
    return [...this.pending.values()]
      .map((row) => ({
        id: row.packet.requestId,
        action: row.packet.type,
        status: row.status,
        revision: typeof row.packet.queueRevision === "number" ? row.packet.queueRevision : 0,
        at: row.started,
      }))
      .slice(0, 16)
      .concat(this.history);
  }
  private prune(now: number) {
    for (const [key, entry] of this.receipts)
      if (now - entry.at >= ROOM_RECEIPT_LIFETIME_MS) this.receipts.delete(key);
    for (const [key, at] of this.queried)
      if (now - at >= ROOM_RECEIPT_LIFETIME_MS) this.queried.delete(key);
  }
  receiptFor(peer: string, id: string, now: number) {
    this.prune(now);
    return this.receipts.get(this.key(peer, id))?.receipt;
  }
  canConfirm(now: number) {
    this.prune(now);
    return this.receipts.size < 128 && this.queried.size < 128;
  }
  confirm(
    peer: string,
    id: string,
    text: string,
    now: number,
    extra: Partial<QueueReceipt> = {},
  ): QueueReceipt {
    const receipt: QueueReceipt = {
      type: "queue-result",
      requestId: id,
      text: text.slice(0, 300),
      ...extra,
    };
    if (this.canConfirm(now) || this.receipts.has(this.key(peer, id)))
      this.receipts.set(this.key(peer, id), { receipt, at: now });
    return receipt;
  }
  noteQuery(peer: string, id: string, now: number) {
    this.prune(now);
    const key = this.key(peer, id);
    if (this.queried.has(key) || this.queried.size < 128) this.queried.set(key, now);
  }
  requiresFence(peer: string, id: string, now: number) {
    this.prune(now);
    return this.queried.has(this.key(peer, id));
  }
  clear() {
    this.pending.clear();
    this.receipts.clear();
    this.queried.clear();
    this.history = [];
  }
}
export function readReceiptQuery(value: unknown) {
  const row = value as {
    type?: string;
    queryId?: unknown;
    requestIds?: unknown;
    deliveryEpoch?: unknown;
  };
  if (
    !row ||
    row.type !== "queue-receipt-query" ||
    typeof row.queryId !== "string" ||
    !row.queryId ||
    row.queryId.length > 100 ||
    typeof row.deliveryEpoch !== "string" ||
    row.deliveryEpoch.length > 160 ||
    !Array.isArray(row.requestIds) ||
    !row.requestIds.length ||
    row.requestIds.length > 16 ||
    row.requestIds.some((id) => typeof id !== "string" || !id || id.length > 160) ||
    new Set(row.requestIds).size !== row.requestIds.length
  )
    return;
  return {
    queryId: row.queryId,
    requestIds: row.requestIds as string[],
    deliveryEpoch: row.deliveryEpoch,
  };
}
export function queueIntentFence(
  packet: QueuePacket,
  epoch: string,
  basis: QueueBasis,
  queried = false,
  now?:number,
): QueueOutcome | undefined {
  if (packet.deliveryEpoch !== epoch || !validQueueBasis(packet)) return "rejected";
  if(now!==undefined&&(typeof packet.intentAt!=='number'||!Number.isSafeInteger(packet.intentAt)||packet.intentAt>now+5000||now-packet.intentAt>=ROOM_INTENT_TIMEOUT_MS))return 'superseded';
  if ((packet.reconciled === true || queried) && !sameBasis(packet, basis)) return "superseded";
}
