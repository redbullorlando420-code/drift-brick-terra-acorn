import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogTurn } from "@/lib/catalog-turn";
import { roomSearchPage } from "@/lib/multiplayer/room-search";
import {
  roomCatalogAllows,
  roomCatalogName,
  type RoomCatalogPolicy,
} from "@/lib/multiplayer/room-catalog-policy";
import type { LibraryVideo } from "@/lib/videos/types";
import type { RoomCatalogAuthority } from "./use-room-catalog-access";
export function RoomCatalogSharing({
  access,
  candidates,
  onChange,
}: {
  access: RoomCatalogAuthority;
  candidates: LibraryVideo[];
  onChange: (policy: RoomCatalogPolicy) => void;
}) {
  const [draft, setDraft] = useState<RoomCatalogPolicy>(),
    [filter, setFilter] = useState(""),
    [page, setPage] = useState(0),
    [preview, setPreview] = useState<LibraryVideo[]>([]),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false);
  const [draftRevision, setDraftRevision] = useState(0),
    policy = draft ?? access.policy;
  const collections = useMemo(
    () =>
      access.index?.collections.filter(
        (row) =>
          !filter || (row.name + " " + row.source).toLowerCase().includes(filter.toLowerCase()),
      ) ?? [],
    [access.index, filter],
  );
  const change = (next: RoomCatalogPolicy) => {
    setDraft(next);
    setDraftRevision(access.revision);
  };
  useEffect(() => {
    setPreview([]);
    setMore(false);
    if (!draft || draftRevision !== access.revision) return;
    const controller = new AbortController();
    setBusy(true);
    void roomSearchPage(
      candidates,
      "",
      0,
      catalogTurn(controller.signal),
      roomCatalogAllows(access.index, draft),
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setPreview(result.videos);
          setMore(result.hasMore);
          setBusy(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [draft, draftRevision, access.revision, access.index, candidates]);
  const stale = Boolean(draft && draftRevision !== access.revision);
  return (
    <details
      className="mt-3 rounded-md border border-border p-3"
      aria-label="Guest catalog privacy"
      data-catalog-revision={access.revision}
    >
      <summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">
        Guest library browsing
      </summary>
      <p className="mt-2 text-xs leading-5 text-muted">
        Choose public collections, then review the titles before sharing. Private and adult sources
        stay excluded, even when unlocked. Browsing starts off in each room session. Current
        playback and the confirmed queue keep their existing access.
      </p>
      <label className="flex min-h-11 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={policy.enabled}
          onChange={(e) => {
            if (!e.target.checked) {
              onChange({ ...access.policy, enabled: false });
              setDraft(undefined);
            } else change({ ...policy, enabled: true });
          }}
          aria-label="Let guests search my library"
        />
        Let guests search selected collections
      </label>
      <label className="flex min-h-11 items-center gap-2 text-xs text-muted">
        <input
          type="checkbox"
          checked={policy.localTitles}
          onChange={(e) => {
            if (!e.target.checked) {
              onChange({ ...access.policy, localTitles: false });
              setDraft(undefined);
            } else change({ ...policy, localTitles: true });
          }}
          aria-label="Include local video titles for guests"
        />
        Include local video titles
      </label>
      <Input
        aria-label="Filter shareable collections"
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setPage(0);
        }}
        placeholder="Find a collection or source"
        className="mt-2"
      />
      <div className="mt-2 max-h-72 overflow-y-auto" aria-label="Shareable collections">
        {collections.slice(page * 12, page * 12 + 12).map((row) => (
          <label key={row.id} className="flex min-h-11 items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={policy.folders.includes(row.id)}
              aria-label={"Share collection " + row.name}
              onChange={(e) => {
                if (!e.target.checked && access.policy.folders.includes(row.id)) {
                  onChange({
                    ...access.policy,
                    folders: access.policy.folders.filter((id) => id !== row.id),
                  });
                  setDraft(undefined);
                  return;
                }
                change({
                  ...policy,
                  folders: e.target.checked
                    ? [...policy.folders, row.id]
                    : policy.folders.filter((id) => id !== row.id),
                });
              }}
            />
            <span className="min-w-0 break-words">
              {row.name}
              <span className="block text-[11px]">
                {row.source} · {row.count.toLocaleString()} public titles
              </span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!page}
          onClick={() => setPage((value) => value - 1)}
        >
          Previous collections
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={(page + 1) * 12 >= collections.length}
          onClick={() => setPage((value) => value + 1)}
        >
          More collections
        </Button>
        <span className="text-xs text-muted">
          {collections.length} collections · {access.policy.folders.length} selected
        </span>
      </div>
      {access.pending && (
        <p role="status" className="mt-2 text-xs text-muted">
          Checking public collections…
        </p>
      )}
      {!access.pending && !access.index && (
        <p role="alert" className="mt-2 text-xs text-muted">
          Collection review could not finish. Browsing remains unavailable; reopen this room to
          retry.
        </p>
      )}
      {draft && (
        <section aria-label="Guest catalog preview" className="mt-3 rounded-md bg-bg/50 p-3">
          <h4 className="text-sm font-medium text-fg">Guest-visible title preview</h4>
          <p className="mt-1 text-xs text-muted">
            {stale
              ? "The library or permissions changed. Review your selection again."
              : busy
                ? "Preparing preview…"
                : draft.enabled
                  ? preview.length +
                    " titles on the first page" +
                    (more ? " · more pages available" : "")
                  : "Browsing will be turned off."}
          </p>
          <ul className="mt-2 max-h-60 space-y-1 overflow-y-auto text-xs text-muted">
            {!stale &&
              preview.map((video) => (
                <li key={video.id} className="break-words">
                  {roomCatalogName(video)}
                </li>
              ))}
          </ul>
          <p className="mt-2 text-xs leading-5 text-muted">
            Guests can search title and creator only. Descriptions, saved tags, folder labels, file
            paths, local size and file timestamps are excluded. Changing access cannot erase titles
            already received by another device.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={stale || busy || access.pending || !access.index}
              onClick={() => {
                onChange(draft);
                setDraft(undefined);
              }}
            >
              Apply catalog sharing
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setDraft(undefined)}>
              Cancel catalog preview
            </Button>
          </div>
        </section>
      )}
      <p className="mt-2 text-xs text-muted">
        Active: {access.policy.enabled ? "selected collections shared" : "browsing off"} · revision{" "}
        {access.revision}. Revocation clears pending search pages. Queue edits still follow guest
        role and review settings.
      </p>
    </details>
  );
}
