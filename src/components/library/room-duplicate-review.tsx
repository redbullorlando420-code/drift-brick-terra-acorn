import { Button } from "@/components/ui/button";
import { groupRoomQueue, type DuplicateGroups } from "@/lib/multiplayer/room-duplicates";
import { roomMediaKey } from "@/lib/multiplayer/room-media";
import type { LibraryVideo } from "@/lib/videos/types";

export function RoomDuplicateReview({
  queue,
  held,
  guest,
  full,
  onKeep,
  onConsolidate,
}: {
  queue: Array<{ id: string; video?: LibraryVideo }>;
  held: DuplicateGroups;
  guest: boolean;
  full: boolean;
  onKeep?: (key: string, requestId: string) => void;
  onConsolidate?: (key: string) => void;
}) {
  const groups = groupRoomQueue(
    queue.flatMap(({ id, video }) =>
      video?.remote ? [{ id, key: roomMediaKey(video), name: video.name }] : [],
    ),
    held,
  );
  if (!groups.length) return null;
  return (
    <details className="mt-4 rounded-md border border-border p-3">
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
        Duplicate review · {groups.length}
      </summary>
      <p className="text-xs leading-5 text-muted">
        Matches use the provider video identity. Keeping a repeat adds a separate slot.
        Consolidating keeps the earliest upcoming slot and leaves playback alone.
      </p>
      <ul className="mt-3 max-h-96 space-y-3 overflow-y-auto">
        {groups.map(({ key, slots, requests }) => (
          <li key={key} className="rounded-md bg-bg/50 p-3">
            <p className="break-words text-sm font-medium">
              {slots[0]?.name ?? requests[0]?.media.name}
            </p>
            <p className="mt-1 break-words text-xs text-muted">
              {key} · {slots.length} queued · {requests.length} awaiting review
            </p>
            {requests.map((request) => (
              <div
                key={request.id}
                className="mt-2 flex flex-wrap items-center justify-between gap-2"
              >
                <p className="min-w-0 break-words text-xs text-muted">
                  {request.source} · {request.media.name}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="min-h-11"
                  disabled={full}
                  onClick={() => onKeep?.(key, request.id)}
                >
                  Keep both
                </Button>
              </div>
            ))}
            {!guest && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2 min-h-11"
                onClick={() => onConsolidate?.(key)}
              >
                Consolidate matches
              </Button>
            )}
          </li>
        ))}
      </ul>
      {full && !guest && (
        <p className="mt-2 text-xs text-muted">
          Remove a queued title before keeping another slot.
        </p>
      )}
    </details>
  );
}
