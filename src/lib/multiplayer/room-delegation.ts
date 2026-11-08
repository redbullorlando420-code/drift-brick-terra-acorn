import { parseRoomQueueAction, parseRoomQueueEdit } from "./room-queue.ts";

export const ROOM_DELEGATION_LIMIT = 8;
export const ROOM_DELEGATION_DURATIONS = [1, 5, 15] as const;
export type RoomDelegation = {
  id: string;
  issuer: string;
  recipient: string;
  scope: "queue-order";
  expiresAt: number;
  durationMs: number;
};
export type RoomDelegationLease = {
  grant: RoomDelegation;
  generation: number;
  deadline: number;
};
export function readRoomDelegation(value: unknown): RoomDelegation | undefined {
  if (!value || typeof value !== "object") return;
  const row = value as RoomDelegation;
  if (
    ![row.id, row.issuer, row.recipient].every(
      (v) => typeof v === "string" && /^[\w-]{1,100}$/.test(v),
    )
  )
    return;
  if (
    row.scope !== "queue-order" ||
    !Number.isSafeInteger(row.expiresAt) ||
    !ROOM_DELEGATION_DURATIONS.some((minutes) => minutes * 60_000 === row.durationMs)
  )
    return;
  return {
    id: row.id,
    issuer: row.issuer,
    recipient: row.recipient,
    scope: row.scope,
    expiresAt: row.expiresAt,
    durationMs: row.durationMs,
  };
}
export function delegatedQueueOperation(
  type: unknown,
  operation: unknown,
  queue: readonly string[],
) {
  if (type === "queue-shuffle") return queue.length > 1;
  if (type === "queue-edit")
    return !!parseRoomQueueEdit(operation)?.ids.every((id) => queue.includes(id));
  if (type !== "queue-action") return false;
  const action = parseRoomQueueAction(operation);
  return (
    !!action &&
    action.kind !== "add" &&
    queue.includes(action.id) &&
    (!action.before || queue.includes(action.before))
  );
}
export function roomDelegationAllows(
  lease: RoomDelegationLease | undefined,
  identity: { from: string; host: string; generation?: number },
  packet: {
    type?: string;
    operation?: unknown;
    delegationId?: unknown;
    permissionRevision?: unknown;
  },
  permissionRevision: number,
  queue: readonly string[],
  monotonicNow: number,
) {
  return (
    !!lease &&
    identity.generation === lease.generation &&
    identity.from === lease.grant.recipient &&
    identity.host === lease.grant.issuer &&
    packet.delegationId === lease.grant.id &&
    packet.permissionRevision === permissionRevision &&
    monotonicNow < lease.deadline &&
    delegatedQueueOperation(packet.type, packet.operation, queue)
  );
}
