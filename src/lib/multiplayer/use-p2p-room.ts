import { useCallback, useEffect, useRef, useState } from "react";
import { P2PRoom, type PeerInfo } from "./p2p";

export function useP2PRoom(room: string, name: string) {
  const [selfId] = useState(() => `p-${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const ref = useRef<P2PRoom | null>(null);
  const listeners = useRef(new Set<(from: string, data: unknown) => void>());
  useEffect(() => {
    const p2p = new P2PRoom({ room, selfId, name, onPeersChanged: setPeers, onConnected: () => setJoined(true), onMessage: (from, data) => listeners.current.forEach((fn) => fn(from, data)) });
    ref.current = p2p; void p2p.join();
    return () => { ref.current = null; p2p.close(); };
  }, [room, selfId, name]);
  const send = useCallback((data: unknown, peer?: string) => ref.current?.send(data, peer), []);
  const onMessage = useCallback((fn: (from: string, data: unknown) => void) => { listeners.current.add(fn); return () => { listeners.current.delete(fn); }; }, []);
  return { selfId, peers, joined, send, onMessage };
}
