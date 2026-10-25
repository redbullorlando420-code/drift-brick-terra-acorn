import { useCallback, useEffect, useRef, useState } from "react";
import { createLocalId } from "@/lib/local-id";
import { RoomQueueDelivery, type QueuePacket } from "@/lib/multiplayer/room-delivery";

export function useRoomQueueDelivery(room: string, guest: boolean, host: string,
  send: (data: unknown, peer?: string) => void, notice: (text: string) => void) {
  const delivery = useRef(new RoomQueueDelivery());
  const [pending, setPending] = useState(0);
  const hostRef = useRef(host);
  const previousHost = useRef(host);
  hostRef.current = host;
  useEffect(() => { delivery.current.clear(); setPending(0); }, [room, guest]);
  useEffect(() => {
    if (guest && previousHost.current && host && host !== previousHost.current && delivery.current.size) {
      delivery.current.clear(); setPending(0);
      notice('The host reconnected. Pending requests were stopped; check the confirmed queue before trying again.');
    }
    previousHost.current = host;
  }, [guest, host, notice]);
  useEffect(() => {
    if (!guest || !pending || !room) return;
    const timer = window.setInterval(() => {
      const result = delivery.current.tick(Date.now());
      for (const packet of result.resend) send(packet, hostRef.current || undefined);
      if (result.expired.length) {
        setPending(delivery.current.size);
        notice("The host did not confirm a queue change. Refreshing the shared order; check it before trying again.");
        send({ type: "resync-request", sentAt: Date.now() }, hostRef.current || undefined);
      }
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [guest, room, pending, send, notice]);
  const request = useCallback((data: { type: string; [key: string]: unknown }, text: string) => {
    if (!room) { notice("Join a room before changing its queue."); return false; }
    const packet: QueuePacket = { ...data, requestId: createLocalId("queue-"), sentAt: Date.now() };
    if (!delivery.current.enqueue(packet, Date.now())) {
      notice("Please wait for the host to confirm your pending queue changes."); return false;
    }
    setPending(delivery.current.size);
    send(packet, hostRef.current || undefined);
    notice(text);
    return true;
  }, [room, send, notice]);
  const replay = useCallback((peer: string, id: string) => {
    const receipt = delivery.current.receiptFor(peer, id, Date.now());
    if (receipt) { send(receipt, peer); return true; }
    if (!delivery.current.canConfirm(Date.now())) {
      send({ type: "queue-result", requestId: id, text: "The host is handling many queue changes. Please wait before trying again." }, peer);
      return true;
    }
    return false;
  }, [send]);
  const confirm = useCallback((peer: string, id: string, text: string) => {
    send(delivery.current.confirm(peer, id, text, Date.now()), peer);
  }, [send]);
  const accept = useCallback((peer: string, id: string, text: string) => {
    if (hostRef.current && peer !== hostRef.current || !delivery.current.acknowledge(id)) return;
    setPending(delivery.current.size);
    notice(text.slice(0, 300) || "Queue change confirmed by the host.");
  }, [notice]);
  return { request, replay, confirm, accept, pending };
}
