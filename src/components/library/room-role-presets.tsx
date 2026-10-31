import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ROOM_ROLES,
  roomRoleFor,
  sameRoomPermissions,
  type RoomPermissions,
  type RoomRole,
} from "@/lib/multiplayer/room-roles";
export function RoomRolePresets({
  permissions,
  revision,
  guest,
  onApply,
}: {
  permissions: RoomPermissions;
  revision: number;
  guest: boolean;
  onApply: (p: RoomPermissions) => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [draft, setDraft] = useState<{
    role: RoomRole;
    revision: number;
    before: RoomPermissions;
  } | null>(null);
  const active = roomRoleFor(permissions),
    label = active === "custom" ? "Custom" : ROOM_ROLES[active].label;
  const stale = Boolean(
    draft && (draft.revision !== revision || !sameRoomPermissions(draft.before, permissions)),
  );
  return (
    <section
      className="mb-3 rounded-md border border-border p-3"
      aria-label="Guest role presets"
      data-room-permission-revision={revision}
    >
      <p className="text-sm font-medium text-fg">
        {guest ? "Your room role" : "Guest role for this room"} · {label}
      </p>
      {guest ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          {active === "custom"
            ? "The host chose a custom combination of controls."
            : ROOM_ROLES[active].detail}{" "}
          Library visibility is a separate host choice.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs leading-5 text-muted">
            Applies to all guests. Preview a preset before applying, or keep using the independent
            controls below. Library sharing and local-file consent are separate.
          </p>
          <label className="mt-3 block text-xs text-muted">
            Preview guest role
            <select ref={selectRef}
              aria-label="Preview guest role"
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-fg"
              value={draft?.role ?? ""}
              onChange={(event) => {
                const role = event.target.value as RoomRole;
                if (role in ROOM_ROLES) setDraft({ role, revision, before: { ...permissions } });
              }}
            >
              <option value="">Choose a preset…</option>
              {Object.entries(ROOM_ROLES).map(([role, value]) => (
                <option key={role} value={role}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>
          {draft && (
            <div className="mt-3 space-y-2" role="region" aria-label="Role change preview">
              <p className="text-sm font-medium text-fg">
                {label} → {ROOM_ROLES[draft.role].label}
              </p>
              <p className="text-xs leading-5 text-muted">{ROOM_ROLES[draft.role].detail}</p>
              <p className="text-xs leading-5 text-muted">
                Current video, queue, chat and saved history stay in place. This grants no
                additional library visibility or access to local files. Pending requests using older
                controls will need to be sent again.
              </p>
              {stale && (
                <p role="status" className="text-xs text-accent">
                  Controls changed while this preview was open. Choose a preset again to review the
                  current state.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={stale}
                  onClick={() => {
                    if (!stale) {
                      onApply({ ...ROOM_ROLES[draft.role].permissions });
                      setDraft(null); selectRef.current?.focus();
                    }
                  }}
                >
                  Apply {ROOM_ROLES[draft.role].label} role
                </Button>
                <Button variant="secondary" onClick={() => {setDraft(null);selectRef.current?.focus();}}>
                  Cancel role preview
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
