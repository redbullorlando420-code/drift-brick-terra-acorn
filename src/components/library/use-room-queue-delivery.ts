import { useCallback, useEffect, useRef, useState } from "react";
import { createLocalId } from "@/lib/local-id";
import {
  RoomQueueDelivery,
  readReceiptQuery,
  queueIntentFence,
  validQueueBasis,
  type QueuePacket,
  type QueueReceipt,
  type QueueOutcome,
  type QueueBasis,
  type IntentView,
} from "@/lib/multiplayer/room-delivery";
type Context = {
  room: string;
  guest: boolean;
  host: string;
  online: boolean;
  readyRevision: number;
  send: (data: unknown, to?: string) => void;
  notice: (text: string) => void;
  permissionRevision: number;
  catalogRevision?: number;
  basis: () => QueueBasis;
  peerAllowed: (id: string) => boolean;
};
export function useRoomQueueDelivery(context: Context) {
  const ref = useRef(context);
  ref.current = context;
  const delivery = useRef(new RoomQueueDelivery()),
    epoch = useRef(createLocalId("delivery-")),
    hostEpoch = useRef(""),
    previousHost = useRef(context.host),
    queries = useRef(new Map<string, { ids: Set<string>; at: number }>());
  const hostTimeAnchor=useRef({host:0,mono:0});
  const [rows, setRows] = useState<IntentView[]>([]),
    [ready, setReady] = useState(false),
    fingerprint = useRef("");
  const refresh = useCallback(() => {
    const next = delivery.current.view(),
      key = JSON.stringify(next);
    if (key === fingerprint.current) return;
    fingerprint.current = key;
    setRows(next);
  }, []);
  useEffect(() => {
    delivery.current.clear();
    queries.current.clear();
    epoch.current = createLocalId("delivery-");
    hostEpoch.current = "";
    setReady(false);
    fingerprint.current = "";
    setRows([]);
  }, [context.room, context.guest]);
  useEffect(() => {
    if (previousHost.current && context.host && context.host !== previousHost.current) {
      delivery.current.stop("superseded", Date.now());
      hostEpoch.current = "";
      setReady(false);
      queries.current.clear();
      refresh();
    }
    previousHost.current = context.host;
  }, [context.host, refresh]);
  const observe = useCallback(
    (from: string, data: { deliveryEpoch?: unknown;deliveryTime?:unknown }) => {
      if (
        !ref.current.guest ||
        typeof data.deliveryEpoch !== "string" ||
        !data.deliveryEpoch ||
        data.deliveryEpoch.length > 160
      )
        return;
      if (hostEpoch.current && hostEpoch.current !== data.deliveryEpoch) {
        delivery.current.stop("superseded", Date.now());
        queries.current.clear();
        refresh();
      }
      hostEpoch.current = data.deliveryEpoch;
      if(typeof data.deliveryTime==='number'&&Number.isSafeInteger(data.deliveryTime))hostTimeAnchor.current={host:data.deliveryTime,mono:performance.now()};
      setReady(true);
    },
    [refresh],
  );
  const check = useCallback(() => {
    const c = ref.current,
      now = Date.now(),
      result = delivery.current.tick(now, c.online && Boolean(hostEpoch.current));
    for (const [id, row] of queries.current) if (now - row.at > 8000) queries.current.delete(id);
    if (result.check.length && queries.current.size < 4) {
      const queryId = createLocalId("receipts-");
      queries.current.set(queryId, { ids: new Set(result.check), at: now });
      c.send(
        {
          type: "queue-receipt-query",
          queryId,
          requestIds: result.check,
          deliveryEpoch: hostEpoch.current,
        },
        c.host,
      );
    }
    if (result.expired.length) {
      c.notice(
        "Unconfirmed queue edits expired. The confirmed queue was kept; review it before sending a new edit.",
      );
      c.send({ type: "resync-request", sentAt: now }, c.host);
    }
    refresh();
  }, [refresh]);
  const pending = rows.filter((row) =>
    ["waiting", "checking", "offline"].includes(row.status),
  ).length;
  useEffect(() => {
    if (!context.guest || !context.room || !pending) return;
    const timer = setInterval(check, 1000);
    return () => clearInterval(timer);
  }, [context.guest, context.room, pending, check]);
  useEffect(() => {
    if (!context.guest || !pending) return;
    delivery.current.checkNow(Date.now());
    check();
  }, [context.online, context.readyRevision, context.guest, check]);
  const request = useCallback(
    (data: { type: string; [key: string]: unknown }, text: string) => {
      const c = ref.current;
      if (!c.room || !c.online || !hostEpoch.current) {
        c.notice("Waiting for the current host queue. Your draft stays on this device.");
        return false;
      }
      const packet: QueuePacket = {
        ...data,
        ...c.basis(),
        deliveryEpoch: hostEpoch.current,
        permissionRevision: c.permissionRevision,
        catalogRevision: c.catalogRevision,
        requestId: createLocalId("queue-"),
        sentAt: Date.now(),
        intentAt:Math.round(hostTimeAnchor.current.host+performance.now()-hostTimeAnchor.current.mono),
      };
      if (!delivery.current.enqueue(packet, Date.now())) {
        c.notice("Wait for your pending queue changes to be confirmed.");
        return false;
      }
      refresh();
      c.send(packet, c.host);
      c.notice(text);
      return true;
    },
    [refresh],
  );
  const stamp = useCallback(() => ({ deliveryEpoch: epoch.current, receiptProtocol: 1,deliveryTime:Date.now() }), []);
  const replay = useCallback((peer: string, id: string) => {
    const c = ref.current,
      receipt = delivery.current.receiptFor(peer, id, Date.now());
    if (receipt) {
      c.send(receipt, peer);
      return true;
    }
    if (!delivery.current.canConfirm(Date.now())) {
      c.send(
        {
          type: "queue-result",
          requestId: id,
          text: "The host is handling many queue changes. Wait before trying again.",
          outcome: "rejected",
          ...c.basis(),
          deliveryEpoch: epoch.current,
        },
        peer,
      );
      return true;
    }
    return false;
  }, []);
  const confirm = useCallback(
    (peer: string, id: string, text: string, outcome: QueueOutcome = "applied") => {
      const c = ref.current;
      c.send(
        delivery.current.confirm(peer, id, text, Date.now(), {
          outcome,
          ...c.basis(),
          deliveryEpoch: epoch.current,
        }),
        peer,
      );
    },
    [],
  );
  const guard = useCallback(
    (peer: string, packet: QueuePacket) => {
      const reason = queueIntentFence(
        packet,
        epoch.current,
        ref.current.basis(),
        delivery.current.requiresFence(peer, packet.requestId, Date.now()),
        Date.now(),
      );
      if (!reason) return true;
      confirm(
        peer,
        packet.requestId,
        reason === "superseded"
          ? "The room changed before this edit could be confirmed. It was not repeated."
          : "The host session changed. Refresh the queue and send a new edit.",
        reason,
      );
      return false;
    },
    [confirm],
  );
  const accept = useCallback(
    (peer: string, id: string, text: string, packet?: QueueReceipt) => {
      const c = ref.current;
      if (
        peer !== c.host ||
        packet?.deliveryEpoch !== hostEpoch.current ||
        !["applied", "superseded", "rejected"].includes(packet?.outcome ?? "")
      )
        return;
      if (!delivery.current.acknowledge(id, packet)) return;
      refresh();
      c.notice(text.slice(0, 300) || "The host confirmed the queue edit.");
    },
    [refresh],
  );
  const receive = useCallback(
    (peer: string, value: unknown) => {
      const c = ref.current,
        data = value as any;
      if (!data || typeof data !== "object") return false;
      if (!c.guest && data.type === "queue-receipt-query") {
        if (!c.peerAllowed(peer)) return true;
        const query = readReceiptQuery(data);
        if (!query) return true;
        const results = query.requestIds.map((requestId) => {
          const receipt = delivery.current.receiptFor(peer, requestId, Date.now());
          if (receipt) return { requestId, receipt };
          if (query.deliveryEpoch === epoch.current)
            delivery.current.noteQuery(peer, requestId, Date.now());
          return { requestId, missing: true };
        });
        c.send(
          {
            type: "queue-receipts",
            queryId: query.queryId,
            deliveryEpoch: epoch.current,
            ...c.basis(),
            results,
          },
          peer,
        );
        return true;
      }
      if (c.guest && data.type === "queue-receipts") {
        if (peer !== c.host) return true;
        const query = queries.current.get(data.queryId);
        if (
          !query ||
          !Array.isArray(data.results) ||
          data.results.length > 16 ||
          !validQueueBasis({
            queueRevision: data.queueRevision,
            selectionRevision: data.selectionRevision,
          }) ||
          typeof data.deliveryEpoch !== "string"
        )
          return true;
        queries.current.delete(data.queryId);
        if (data.deliveryEpoch !== hostEpoch.current) {
          delivery.current.stop("superseded", Date.now());
          refresh();
          c.send({ type: "resync-request", sentAt: Date.now() }, c.host);
          return true;
        }
        for (const result of data.results) {
          if (!query.ids.delete(result?.requestId)) continue;
          if (result.receipt) {
            const receipt = result.receipt as QueueReceipt;
            if (receipt.type === "queue-result" && receipt.requestId === result.requestId)
              accept(
                peer,
                receipt.requestId,
                typeof receipt.text === "string" ? receipt.text : "",
                receipt,
              );
          } else if (result.missing === true) {
            const packet = delivery.current.resolveMissing(
              result.requestId,
              data,
              data.deliveryEpoch,
              Date.now(),
            );
            if (packet) c.send(packet, c.host);
            else
              c.notice(
                "The host queue changed or this edit expired. It was not repeated; review the confirmed order.",
              );
          }
        }
        refresh();
        c.send({ type: "resync-request", sentAt: Date.now() }, c.host);
        return true;
      }
      return false;
    },
    [accept, refresh],
  );
  return {
    request,
    replay,
    confirm,
    accept,
    guard,
    observe,
    receive,
    stamp,
    pending,
    rows,
    ready,
    deliveryEpoch: hostEpoch.current,
  };
}
