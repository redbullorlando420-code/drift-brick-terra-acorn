import { useCallback, useEffect, useRef, useState } from "react";
import { createShortLocalId } from "@/lib/local-id";
import { P2PRoom, defaultIceServers, type PeerInfo } from "./p2p";
import type { RoomRelayConfig } from "./relay-config";

export function useP2PRoom(room: string, name: string, relay?: RoomRelayConfig) {
  const [selfId] = useState(() => createShortLocalId("p-"));
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [mediaStreams, setMediaStreams] = useState<Record<string, MediaStream>>({});
  const [readyRevision, setReadyRevision] = useState(0);
  const outboundMedia = useRef<MediaStream | null>(null);
  const ref = useRef<P2PRoom | null>(null);
  const nameRef = useRef(name); nameRef.current = name;
  const listeners = useRef(new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>());
  useEffect(() => {
    setMediaStreams({});
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
    const p2p = new P2PRoom({ room, selfId, name: nameRef.current.slice(0, 64), iceServers: relay ? [...defaultIceServers(), ...relay.iceServers] : undefined, iceTransportPolicy: relay?.iceTransportPolicy,
      onPeersChanged: (next) => {
        setPeers(next);
        setMediaStreams((current) => Object.fromEntries(Object.entries(current).filter(([id]) => next.some((peer) => peer.id === id))));
      },
      onMediaStream: (from, stream) => setMediaStreams((current) => ({ ...current, [from]: stream })),
      onPeerReady: () => setReadyRevision((value) => value + 1),
      onConnected: () => setJoined(true), onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)), onMessage: (from, data, channel) => listeners.current.forEach((fn) => fn(from, data, channel)) });
    p2p.setMediaStream(outboundMedia.current);
    ref.current = p2p; void p2p.join();
    return () => { ref.current = null; p2p.close(); };
  }, [room, selfId, relay]);
  // Presence names ride the next existing signaling poll. Typing a new name
  // must not destroy every peer channel and active local-video stream.
  useEffect(() => { ref.current?.setName(name); }, [name]);
  const send = useCallback((data: unknown, peer?: string) => ref.current?.send(data, peer), []);
  const setMediaStream = useCallback((stream: MediaStream | null) => {
    outboundMedia.current = stream;
    ref.current?.setMediaStream(stream);
  }, []);
  const onMessage = useCallback((fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => { listeners.current.add(fn); return () => { listeners.current.delete(fn); }; }, []);
  return { selfId, peers, joined, events, send, onMessage, mediaStreams, setMediaStream, readyRevision };
}
