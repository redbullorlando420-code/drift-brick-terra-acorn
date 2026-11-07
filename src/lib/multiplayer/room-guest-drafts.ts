import { reviewedPreferences } from "../reviewed-preferences.ts";
import { roomQueueDraft } from "./room-queue-session.ts";
import { resolveRoomMedia, roomMediaKey, type RoomMediaDescriptor } from "./room-media.ts";
export type GuestDraftRow = {
  media: RoomMediaDescriptor;
  origin: "public" | "host";
  catalogRevision?: number;
  status: "draft" | "submitted";
};
export type GuestDrafts = { version: 1; room: string; rows: GuestDraftRow[] };
export function readGuestDrafts(raw: unknown): GuestDrafts {
  const r = raw as GuestDrafts;
  if (
    !r ||
    r.version !== 1 ||
    Object.keys(r).some((k) => !["version", "room", "rows"].includes(k)) ||
    typeof r.room !== "string" ||
    !/^[\w:-]{0,80}$/.test(r.room) ||
    !Array.isArray(r.rows) ||
    r.rows.length > 16
  )
    throw Error("Unsupported guest draft queue. Existing drafts were kept.");
  const seen = new Set<string>();
  const rows = r.rows.map((row) => {
    if (
      !row ||
      Object.keys(row).some((k) => !["media", "origin", "catalogRevision", "status"].includes(k)) ||
      !["draft", "submitted"].includes(row.status) ||
      !["public", "host"].includes(row.origin) ||
      (row.catalogRevision !== undefined &&
        (!Number.isSafeInteger(row.catalogRevision) || row.catalogRevision < 0))
    )
      throw Error("Invalid saved suggestion draft.");
    const media = roomQueueDraft([row.media]).media[0];
    if (!media) throw Error("Only supported public provider links can be saved in a guest draft.");
    const video = resolveRoomMedia(media)!.video!,
      key = roomMediaKey(video);
    if (seen.has(key)) throw Error("Duplicate draft identity.");
    seen.add(key);
    const { poster: _poster, description: _description, ...clean } = media;
    return {
      media: clean,
      origin: row.origin,
      status: row.status,
      ...(row.catalogRevision !== undefined ? { catalogRevision: row.catalogRevision } : {}),
    };
  });
  return { version: 1, room: r.room, rows };
}
export const draftIdentity = (row: GuestDraftRow) =>
  roomMediaKey(resolveRoomMedia(row.media)!.video!);
export function stageGuestDraft(state: GuestDrafts, room: string, row: GuestDraftRow) {
  if (state.room && state.room !== room && state.rows.length)
    throw Error(
      "Saved drafts belong to another room. Return to it or explicitly clear the draft queue first.",
    );
  const key = draftIdentity(row),
    old = state.rows.find((r) => draftIdentity(r) === key);
  if (old?.status === "submitted")
    throw Error(
      "This draft was already submitted. Review its delivery receipt before explicitly returning it to drafts.",
    );
  return readGuestDrafts({
    version: 1,
    room,
    rows: old ? state.rows.map((r) => (draftIdentity(r) === key ? row : r)) : [...state.rows, row],
  });
}
export function claimGuestDrafts(
  state: GuestDrafts,
  room: string,
  ids: readonly string[],
  catalogRevision?: number,
  connected = true,
) {
  if (state.room !== room || !connected)
    throw Error("Wait for the current host connection. Unsent drafts are retained.");
  if (!ids.length || ids.length > 8 || new Set(ids).size !== ids.length)
    throw Error("Choose one to eight distinct drafts per batch.");
  const chosen = ids.map((id) => state.rows.find((r) => draftIdentity(r) === id));
  if (chosen.some((r) => !r || r.status !== "draft"))
    throw Error("Selection changed or was already submitted. Review the draft queue.");
  if (
    chosen.some(
      (r) =>
        r!.origin === "host" &&
        (r!.catalogRevision === undefined || catalogRevision !== r!.catalogRevision),
    )
  )
    throw Error(
      "Host sharing changed or has not been verified. Find and stage this host item again before submitting.",
    );
  return readGuestDrafts({
    ...state,
    rows: state.rows.map((r) =>
      ids.includes(draftIdentity(r)) ? { ...r, status: "submitted" } : r,
    ),
  });
}
export const guestDrafts = reviewedPreferences<GuestDrafts>(
  "reelcase.room-guest-drafts.v1",
  () => ({ version: 1, room: "", rows: [] }),
  readGuestDrafts,
);
