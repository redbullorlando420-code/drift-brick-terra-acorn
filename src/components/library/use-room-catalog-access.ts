import { useCallback, useEffect, useRef, useState } from "react";
import { catalogTurn } from "@/lib/catalog-turn";
import {
  buildRoomCatalogIndex,
  CLOSED_ROOM_CATALOG,
  roomCatalogRequestAllowed,
  type RoomCatalogIndex,
  type RoomCatalogPolicy,
} from "@/lib/multiplayer/room-catalog-policy";
import { roomMediaKey } from "@/lib/multiplayer/room-media";
import type { Folder, LibraryVideo } from "@/lib/videos/types";
export type RoomCatalogAuthority = {
  revision: number;
  policy: RoomCatalogPolicy;
  index?: RoomCatalogIndex;
  pending: boolean;
};
export function useRoomCatalogAccess(
  room: string,
  guest: boolean,
  videos: readonly LibraryVideo[],
  folders: readonly Folder[],
  hidden: Record<string, unknown>,
  unavailable: Record<string, unknown>,
) {
  const [version, refresh] = useState(0),
    authority = useRef<RoomCatalogAuthority>({
      revision: 0,
      policy: CLOSED_ROOM_CATALOG,
      pending: true,
    });
  const inputs = useRef<unknown[]>([]),
    next = [room, guest, videos, folders, hidden, unavailable];
  if (next.some((value, i) => value !== inputs.current[i])) {
    const roomChanged = room !== inputs.current[0] || guest !== inputs.current[1];
    inputs.current = next;
    authority.current = {
      revision: authority.current.revision + 1,
      policy: roomChanged ? CLOSED_ROOM_CATALOG : authority.current.policy,
      index: undefined,
      pending: true,
    };
  }
  useEffect(() => {
    if (!room || guest) return;
    const controller = new AbortController(),
      observed = inputs.current;
    void buildRoomCatalogIndex(videos, folders, hidden, unavailable, catalogTurn(controller.signal))
      .then((index) => {
        if (controller.signal.aborted || observed !== inputs.current) return;
        authority.current = {
          ...authority.current,
          index,
          pending: false,
          revision: authority.current.revision + 1,
        };
        refresh((value) => value + 1);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          authority.current = {
            ...authority.current,
            index: undefined,
            pending: false,
            revision: authority.current.revision + 1,
          };
          refresh((value) => value + 1);
        }
      });
    return () => controller.abort();
  }, [room, guest, videos, folders, hidden, unavailable]);
  const update = useCallback((policy: RoomCatalogPolicy) => {
    authority.current = {
      ...authority.current,
      policy: { ...policy, folders: [...new Set(policy.folders)] },
      revision: authority.current.revision + 1,
    };
    refresh((value) => value + 1);
  }, []);
  // Unknown public links can be suggested. Known host titles require the current
  // catalog scope, even when the guest changes the device ID in its descriptor.
  const allowsRequest = useCallback(
    (
      video: LibraryVideo,
      activeIds: readonly string[],
      lookup: (id: string) => LibraryVideo | undefined,
      revision = authority.current.revision,
    ) => {
      return roomCatalogRequestAllowed(
        authority.current,
        video,
        revision,
        activeIds.flatMap((id) => {
          const active = lookup(id);
          return active ? [roomMediaKey(active)] : [];
        }),
      );
    },
    [],
  );
  return { authority, version, update, allowsRequest };
}
