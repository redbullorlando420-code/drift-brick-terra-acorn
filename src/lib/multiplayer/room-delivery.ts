export type QueuePacket = { type: string; requestId: string; [key: string]: unknown };
export type QueueReceipt = { type: "queue-result"; requestId: string; text: string };
const RETRY_MS = 3_000;
const TIMEOUT_MS = 12_000;

/** Session-only delivery state. Retries keep their original identity so a lost
 * confirmation cannot apply a relative move or shuffle twice. */
export class RoomQueueDelivery {
  private pending = new Map<string, { packet: QueuePacket; started: number; sent: number }>();
  private receipts = new Map<string, { receipt: QueueReceipt; at: number }>();
  get size() { return this.pending.size; }
  enqueue(packet: QueuePacket, now: number) {
    if (this.pending.size >= 16 || this.pending.has(packet.requestId)) return false;
    this.pending.set(packet.requestId, { packet, started: now, sent: now });
    return true;
  }
  acknowledge(id: string) { return this.pending.delete(id); }
  tick(now: number) {
    const resend: QueuePacket[] = [], expired: string[] = [];
    for (const [id, entry] of this.pending) {
      if (now - entry.started >= TIMEOUT_MS) { this.pending.delete(id); expired.push(id); }
      else if (now - entry.sent >= RETRY_MS) { entry.sent = now; resend.push(entry.packet); }
    }
    return { resend, expired };
  }
  private prune(now: number) {
    for (const [key, entry] of this.receipts) if (now - entry.at >= 30_000) this.receipts.delete(key);
  }
  receiptFor(peer: string, id: string, now: number) {
    this.prune(now);
    return this.receipts.get(JSON.stringify([peer, id]))?.receipt;
  }
  canConfirm(now: number) { this.prune(now); return this.receipts.size < 128; }
  confirm(peer: string, id: string, text: string, now: number): QueueReceipt {
    const receipt: QueueReceipt = { type: "queue-result", requestId: id, text: text.slice(0, 300) };
    this.receipts.set(JSON.stringify([peer, id]), { receipt, at: now });
    return receipt;
  }
  clear() { this.pending.clear(); this.receipts.clear(); }
}
