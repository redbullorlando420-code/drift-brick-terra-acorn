/** Bounded per-peer scheduling. Native bufferedAmount is measured before every
 * write. Application priority cannot preempt bytes already admitted to SCTP. */
export const ROOM_OUTBOX_LIMITS = {
  queuedBytes: 256 * 1024,
  bulkBytes: 192 * 1024,
  packetBytes: 256 * 1024,
  bulkPacketBytes: 32 * 1024,
  packets: 64,
  nativeControlBytes: 256 * 1024,
  nativeBulkBytes: 8 * 1024,
  lowWaterBytes: 8 * 1024,
  lifetimeMs: 8000,
} as const;
export type RoomTraffic = "control" | "timing" | "catalog";
type Entry = {
  wire: string;
  bytes: number;
  traffic: RoomTraffic;
  key?: string;
  at: number;
  requestId?: string;
  revision?: number;
  valid?: () => boolean;
};
export type OutboxSnapshot = {
  queuedBytes: number;
  queuedPackets: number;
  nativeBytes: number;
  catalogPackets: number;
  dropped: number;
  coalesced: number;
  blocked: boolean;
};
export function roomTraffic(data: unknown): RoomTraffic {
  const row = data as {
    type?: string;
    seek?: boolean;
    playing?: boolean;
    observed?: boolean;
    clockRunning?: boolean;
  };
  if (
    row?.type === "host-catalog-result" &&
    typeof (data as { error?: unknown }).error !== "string"
  )
    return "catalog";
  if (
    row?.type === "sync" &&
    row.seek !== true &&
    row.playing === true &&
    (typeof row.observed === "boolean" || typeof row.clockRunning === "boolean")
  )
    return "timing";
  return "control";
}
export class RoomOutbox {
  private rows: Entry[] = [];
  private bytes = 0;
  private dropped = 0;
  private coalesced = 0;
  private closed = false;
  get size() {
    return this.rows.length;
  }
  private remove(predicate: (entry: Entry) => boolean, coalesce = false) {
    this.rows = this.rows.filter((row) => {
      if (!predicate(row)) return true;
      this.bytes -= row.bytes;
      if (coalesce) this.coalesced++;
      return false;
    });
  }
  cancelCatalog(id?: string, revision?: number, enabled = true) {
    this.remove(
      (row) =>
        row.traffic === "catalog" &&
        (id ? row.requestId === id : !enabled || row.revision !== revision),
    );
  }
  enqueue(data: unknown, wire: string, now: number, valid?: () => boolean) {
    if (this.closed) return false;
    const traffic = roomTraffic(data),
      row = data as {
        type?: string;
        requestId?: string;
        catalogRevision?: number;
        enabled?: boolean;
        videoId?: string;
        selectionRevision?: number;
      };
    const bytes = new TextEncoder().encode(wire).length;
    if (
      bytes >
      (traffic === "catalog" ? ROOM_OUTBOX_LIMITS.bulkPacketBytes : ROOM_OUTBOX_LIMITS.packetBytes)
    ) {
      this.dropped++;
      return false;
    }
    this.prune(now);
    if (row?.type === "host-catalog-status")
      this.cancelCatalog(undefined, row.catalogRevision, row.enabled !== false);
    if (
      (row?.type === "sync" && traffic === "control") ||
      row?.type === "video" ||
      row?.type === "room-state"
    )
      this.remove((entry) => entry.traffic === "timing", true);
    const key = traffic === "timing" ? "clock" : traffic === "catalog" ? row.requestId : undefined;
    if (key) this.remove((entry) => entry.traffic === traffic && entry.key === key, true);
    const limit =
      traffic === "catalog" ? ROOM_OUTBOX_LIMITS.bulkBytes : ROOM_OUTBOX_LIMITS.queuedBytes;
    if (
      traffic === "control" &&
      (this.bytes + bytes > limit || this.rows.length >= ROOM_OUTBOX_LIMITS.packets)
    )
      this.remove((entry) => entry.traffic !== "control");
    if (this.bytes + bytes > limit || this.rows.length >= ROOM_OUTBOX_LIMITS.packets) {
      this.dropped++;
      return false;
    }
    this.rows.push({
      wire,
      bytes,
      traffic,
      key,
      at: now,
      requestId: row?.requestId,
      revision: row?.catalogRevision,
      valid,
    });
    this.bytes += bytes;
    return true;
  }
  private prune(now: number) {
    this.remove((entry) => {
      if (entry.valid && !entry.valid()) return true;
      if (now - entry.at < ROOM_OUTBOX_LIMITS.lifetimeMs) return false;
      this.dropped++;
      return true;
    });
  }
  flush(
    channel: { readyState: string; bufferedAmount: number; send: (wire: string) => void },
    now: number,
  ) {
    if (this.closed) return;
    this.prune(now);
    if (channel.readyState !== "open") return;
    let bulkSent = false;
    for (let sent = 0; sent < 16; sent++) {
      const index = this.rows.findIndex((entry) => entry.traffic === "control");
      const timing = index < 0 ? this.rows.findIndex((entry) => entry.traffic === "timing") : -1;
      const chosen: number =
        index >= 0
          ? index
          : timing >= 0
            ? timing
            : bulkSent
              ? -1
              : this.rows.findIndex((entry) => entry.traffic === "catalog");
      if (chosen < 0) return;
      const row: Entry = this.rows[chosen]!;
      const buffered = Number.isFinite(channel.bufferedAmount)
        ? Math.max(0, channel.bufferedAmount)
        : 0;
      if (
        row.traffic === "catalog"
          ? buffered > ROOM_OUTBOX_LIMITS.nativeBulkBytes
          : buffered + row.bytes > ROOM_OUTBOX_LIMITS.nativeControlBytes
      )
        return;
      try {
        channel.send(row.wire);
      } catch {
        return;
      }
      this.rows.splice(chosen, 1);
      this.bytes -= row.bytes;
      bulkSent = bulkSent || row.traffic === "catalog";
    }
  }
  snapshot(nativeBytes = 0): OutboxSnapshot {
    return {
      queuedBytes: this.bytes,
      queuedPackets: this.rows.length,
      nativeBytes: Number.isFinite(nativeBytes) ? Math.max(0, nativeBytes) : 0,
      catalogPackets: this.rows.filter((row) => row.traffic === "catalog").length,
      dropped: this.dropped,
      coalesced: this.coalesced,
      blocked: this.rows.length > 0,
    };
  }
  close() {
    this.closed = true;
    this.rows = [];
    this.bytes = 0;
  }
}
