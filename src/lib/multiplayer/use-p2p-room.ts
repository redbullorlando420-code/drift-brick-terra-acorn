import { useCallback, useEffect, useRef, useState } from "react";
import { createShortLocalId } from "@/lib/local-id";
import { P2PRoom, defaultIceServers, type PeerInfo } from "./p2p";
import type { RoomRelayConfig } from "./relay-config";

export function useP2PRoom(room: string, name: string, relay?: RoomRelayConfig) {
  const [selfId] = useState(() => createShortLocalId("p-"));
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const ref = useRef<P2PRoom | null>(null);
  const listeners = useRef(new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>());
  useEffect(() => {
    if (!room.trim()) {
      setJoined(false);
      setPeers([]);
      setEvents([]);
      ref.current = null;
      return;
    }
    setEvents(["Preparing room connection…"]);
    setJoined(false);
    setPeers([]);
    const p2p = new P2PRoom({ room, selfId, name, iceServers: relay ? [...defaultIceServers(), ...relay.iceServers] : undefined, iceTransportPolicy: relay?.iceTransportPolicy, onPeersChanged: setPeers, onConnected: () => setJoined(true), onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)), onMessage: (from, data, channel) => listeners.current.forEach((fn) => fn(from, data, channel)) });
    ref.current = p2p; void p2p.join();
    return () => { ref.current = null; p2p.close(); };
  }, [room, selfId, name, relay]);
  const send = useCallback((data: unknown, peer?: string) => ref.current?.send(data, peer), []);
  const onMessage = useCallback((fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => { listeners.current.add(fn); return () => { listeners.current.delete(fn); }; }, []);
  return { selfId, peers, joined, events, send, onMessage };
}
