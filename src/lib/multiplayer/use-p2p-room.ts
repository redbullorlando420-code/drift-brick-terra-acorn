import { useCallback, useEffect, useRef, useState } from "react";
import { createShortLocalId } from "@/lib/local-id";
import type {OutboxSnapshot} from './room-outbox';
import { P2PRoom, defaultIceServers, type PeerInfo } from "./p2p";
import type { RoomRelayConfig } from "./relay-config";

export function useP2PRoom(room: string, name: string, relay?: RoomRelayConfig) {
  const [selfId] = useState(() => createShortLocalId("p-"));
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const [signaling,setSignaling]=useState<'connecting'|'online'|'retrying'>('connecting');
  const [relayReceived,setRelayReceived]=useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [mediaStreams, setMediaStreams] = useState<Record<string, MediaStream>>({});
  const [transport,setTransport]=useState<OutboxSnapshot>({queuedBytes:0,queuedPackets:0,nativeBytes:0,catalogPackets:0,dropped:0,coalesced:0,blocked:false});
  const [readyRevision, setReadyRevision] = useState(0);
  const outboundMedia = useRef<MediaStream | null>(null);
  const ref = useRef<P2PRoom | null>(null);
  const nameRef = useRef(name); nameRef.current = name;
  const listeners = useRef(new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>());
  useEffect(() => {
    setTransport({queuedBytes:0,queuedPackets:0,nativeBytes:0,catalogPackets:0,dropped:0,coalesced:0,blocked:false});
    setMediaStreams({});setSignaling('connecting');setRelayReceived(false);
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
      onSignalingState:setSignaling, onLocalRelayMessage:()=>setRelayReceived(true),
      onTransportChanged:setTransport, onConnected: () => setJoined(true), onDebug: (event) => setEvents((items) => [event, ...items].slice(0, 16)), onMessage: (from, data, channel) => listeners.current.forEach((fn) => fn(from, data, channel)) });
    p2p.setMediaStream(outboundMedia.current);
    ref.current = p2p; void p2p.join();
    return () => { ref.current = null; p2p.close(); };
  }, [room, selfId, relay]);
  // Presence names ride the next existing signaling poll. Typing a new name
  // must not destroy every peer channel and active local-video stream.
  useEffect(() => { ref.current?.setName(name); }, [name]);
  const send = useCallback((data: unknown, peer?: string,valid?:()=>boolean) => ref.current?.send(data, peer,valid), []);
  const cancelCatalogResult=useCallback((peer:string,id:string)=>ref.current?.cancelCatalogResult(peer,id),[]);
  const setMediaStream = useCallback((stream: MediaStream | null) => {
    outboundMedia.current = stream;
    ref.current?.setMediaStream(stream);
  }, []);
  const onMessage = useCallback((fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => { listeners.current.add(fn); return () => { listeners.current.delete(fn); }; }, []);
  const retrySignaling=useCallback(()=>ref.current?.retrySignaling(),[]);
  const retryPeers=useCallback(()=>ref.current?.retryPeers(),[]);
  return { transport, cancelCatalogResult, signaling, relayReceived, retrySignaling, retryPeers, selfId, peers, joined, events, send, onMessage, mediaStreams, setMediaStream, readyRevision };
}
