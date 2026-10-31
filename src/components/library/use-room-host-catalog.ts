import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createLocalId } from "@/lib/local-id";
import { catalogTurn } from "@/lib/catalog-turn";
import { roomSearchPage } from "@/lib/multiplayer/room-search";
import {
  hostCatalogPayload,
  readHostCatalogPage,
  readHostCatalogQuery,
  type HostCatalogPage,
} from "@/lib/multiplayer/room-host-catalog";
import {
  catalogRequestCurrent,
  roomCatalogAllows,
  roomCatalogSearchText,
} from "@/lib/multiplayer/room-catalog-policy";
import type { RoomCatalogAuthority } from "./use-room-catalog-access";
import type { LibraryVideo } from "@/lib/videos/types";
type RoomTransport = {
  send: (data: unknown, to?: string, valid?:()=>boolean) => void;
  cancelCatalogResult?:(peer:string,id:string)=>void;
  onMessage: (listener: (from: string, data: unknown, channel: unknown) => void) => () => void;
  peers: Array<{ id: string; connectionState: string }>;
  readyRevision: number;
};
export function useRoomHostCatalog({
  transport,
  room,
  guest,
  hostId,
  candidates,
  preparing,
  authority,
}: {
  transport: RoomTransport;
  room: string;
  guest: boolean;
  hostId: string;
  candidates: LibraryVideo[];
  preparing: boolean;
  authority: { current: RoomCatalogAuthority };
}) {
  const { send, onMessage } = transport,
    peers = useRef(transport.peers);
  peers.current = transport.peers;
  const waiting = useRef(
    new Map<
      string,
      {
        resolve: (page: HostCatalogPage) => void;
        reject: (error: Error) => void;
        cleanup: () => void;
        revision: number;
      }
    >(),
  );
  const [status, setStatus] = useState({ enabled: false, revision: -1 }),
    statusRef = useRef(status);
  statusRef.current = status;
  const revision = authority.current.revision;
  const statusPacket = () => ({
    type: "host-catalog-status",
    enabled:
      authority.current.policy.enabled &&
      !preparing &&
      !authority.current.pending &&
      Boolean(authority.current.index),
    catalogRevision: authority.current.revision,
  });
  useEffect(() => {
    if (!guest && room) send(statusPacket());
  }, [guest, room, revision, preparing, transport.readyRevision, send]);
  useEffect(() => {
    if (guest || !room) return;
    const jobs = new Map<string, { id: string; controller: AbortController }>();
    const off = onMessage((from, raw) => {
      const packet = raw as any;
      if (!peers.current.some((peer) => peer.id === from && peer.connectionState === "connected"))
        return;
      if (packet?.type === "host-catalog-cancel" && jobs.get(from)?.id === packet.requestId) {
        jobs.get(from)?.controller.abort();
        transport.cancelCatalogResult?.(from,packet.requestId);
        jobs.delete(from);
        return;
      }
      if (packet?.type === "host-catalog-status-request") {
        send(statusPacket(), from);
        return;
      }
      if(packet?.type==='host-catalog-cancel' && typeof packet.requestId==='string'){transport.cancelCatalogResult?.(from,packet.requestId);return;}
      if (packet?.type !== "host-catalog-search") return;
      const request = readHostCatalogQuery(packet);
      if (!request) return;
      const snapshot = authority.current;
      if (!catalogRequestCurrent(snapshot.revision, packet.catalogRevision)) {
        send(statusPacket(), from);
        return;
      }
      if (jobs.get(from)?.id === request.requestId) return;
      jobs.get(from)?.controller.abort();
      const controller = new AbortController();
      jobs.set(from, { id: request.requestId, controller });
      const reply = (data: object) => {
        if (controller.signal.aborted || authority.current !== snapshot) return;
        send(
          {
            type: "host-catalog-result",
            requestId: request.requestId,
            catalogRevision: snapshot.revision,
            ...data,
          },
          from,
          ()=>authority.current===snapshot&&(typeof (data as {error?:unknown}).error==='string'||snapshot.policy.enabled&&!snapshot.pending),
        );
        jobs.delete(from);
      };
      if (!snapshot.policy.enabled) {
        reply({ error: "The host has turned off library browsing." });
        return;
      }
      if (preparing || snapshot.pending || !snapshot.index) {
        reply({ error: "The host is reviewing its public library. Try again in a moment." });
        return;
      }
      void roomSearchPage(
        candidates,
        request.query,
        request.offset,
        catalogTurn(controller.signal),
        roomCatalogAllows(snapshot.index, snapshot.policy),
        roomCatalogSearchText,
      )
        .then((page) => reply(hostCatalogPayload(page.videos, request.offset, page.hasMore)))
        .catch(() => {
          if (!controller.signal.aborted)
            reply({ error: "The host could not finish this search. Try again." });
        });
    });
    return () => {
      off();
      for (const job of jobs.values()) job.controller.abort();
    };
  }, [guest, room, candidates, preparing, revision, onMessage, send]);
  useEffect(() => {
    statusRef.current = { enabled: false, revision: -1 };
    setStatus(statusRef.current);
    const off = onMessage((from, raw) => {
      if (!guest || !hostId || from !== hostId) return;
      const packet = raw as any;
      if (packet?.type === "host-catalog-status") {
        if (
          !Number.isSafeInteger(packet.catalogRevision) ||
          packet.catalogRevision < 0 ||
          packet.catalogRevision < statusRef.current.revision
        )
          return;
        const next = { enabled: packet.enabled === true, revision: packet.catalogRevision };
        if (
          next.revision === statusRef.current.revision &&
          next.enabled === statusRef.current.enabled
        )
          return;
        statusRef.current = next;
        setStatus(next);
        for (const entry of [...waiting.current.values()]) {
          entry.cleanup();
          entry.reject(
            Error("The host changed library access. Search the current collections again."),
          );
        }
      }
      if (packet?.type !== "host-catalog-result" || typeof packet.requestId !== "string") return;
      const entry = waiting.current.get(packet.requestId);
      if (!entry) return;
      entry.cleanup();
      if (
        !catalogRequestCurrent(statusRef.current.revision, packet.catalogRevision) ||
        entry.revision !== packet.catalogRevision ||
        !statusRef.current.enabled
      ) {
        entry.reject(Error("Library access changed. Search again."));
        return;
      }
      if (typeof packet.error === "string") {
        entry.reject(Error(packet.error.slice(0, 240)));
        return;
      }
      const page = readHostCatalogPage(packet);
      if (!page) {
        entry.reject(Error("The host returned an unreadable result page."));
        return;
      }
      entry.resolve({ ...page, catalogRevision: packet.catalogRevision });
    });
    if (guest && hostId) send({ type: "host-catalog-status-request" }, hostId);
    return () => {
      off();
      for (const entry of [...waiting.current.values()]) {
        entry.cleanup();
        entry.reject(Error("The host connection changed. Search again when it reconnects."));
      }
    };
  }, [guest, hostId, room, onMessage]);
  const connected = Boolean(
    guest &&
    hostId &&
    transport.peers.some((peer) => peer.id === hostId && peer.connectionState === "connected"),
  );
  const search = useCallback(
    (query: string, offset: number, signal: AbortSignal) =>
      new Promise<HostCatalogPage>((resolve, reject) => {
        if (signal.aborted) {
          reject(Error("Search cancelled."));
          return;
        }
        if (!connected || !statusRef.current.enabled) {
          reject(
            Error(
              connected
                ? "The host has turned off library browsing."
                : "Waiting for the host connection.",
            ),
          );
          return;
        }
        if (waiting.current.size >= 4) {
          reject(Error("Wait for the current host search to finish."));
          return;
        }
        const requestId = createLocalId("catalog-"),
          requestRevision = statusRef.current.revision;
        const cleanup = () => {
          window.clearTimeout(timer);window.clearTimeout(retryTimer);
          signal.removeEventListener("abort", cancel);
          waiting.current.delete(requestId);
        };
        const cancel = () => {
          cleanup();
          send({ type: "host-catalog-cancel", requestId }, hostId);
          reject(Error("Search cancelled."));
        };
        const packet={type:'host-catalog-search',requestId,query:query.slice(0,160),offset,catalogRevision:requestRevision};
        const retryTimer=window.setTimeout(()=>{if(waiting.current.has(requestId)&&statusRef.current.enabled&&statusRef.current.revision===requestRevision)send(packet,hostId);},3500);
        const timer = window.setTimeout(() => {
          cleanup();
          send({ type: "host-catalog-cancel", requestId }, hostId);
          reject(Error("The host did not answer. Check the connection and try again."));
        }, 8000);
        waiting.current.set(requestId, { resolve, reject, cleanup, revision: requestRevision });
        signal.addEventListener("abort", cancel, { once: true });
        send(
          {
            type: "host-catalog-search",
            requestId,
            query: query.slice(0, 160),
            offset,
            catalogRevision: requestRevision,
          },
          hostId,
        );
      }),
    [connected, hostId, send, status],
  );
  return useMemo(
    () => ({ connected: connected && status.enabled, revision: status.revision, search }),
    [connected, status, search],
  );
}
