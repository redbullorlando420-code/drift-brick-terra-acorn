import { useSyncExternalStore } from "react";
import { profileSwitchWork } from "@/lib/profile-switch-work";
import { useLibrary } from "@/lib/videos/store";

export function ProfileSwitchInventory() {
  useSyncExternalStore(profileSwitchWork.subscribe, profileSwitchWork.version, () => 0);
  const library = useLibrary((s) => s.remoteBusy || s.refreshing || !!s.scanning);
  const entries = profileSwitchWork.inventory();
  return (
    <section
      aria-label="Pending profile work"
      className="rounded-lg border border-border bg-bg p-3"
    >
      <p className="text-sm font-medium text-fg">Before switching</p>
      {!library && !entries.length ? (
        <p className="mt-1 text-xs text-muted">
          No pending tool work detected. The saved library will be checked before switching.
        </p>
      ) : (
        <ul className="mt-2 space-y-2 text-xs leading-5 text-muted">
          {library && (
            <li>
              <strong className="text-fg">Library: </strong>Finish the active pull or source scan.
            </li>
          )}
          {entries.map((item, i) => (
            <li key={item.label + ":" + i}>
              <strong className="text-fg">{item.label}: </strong>
              {item.detail}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
