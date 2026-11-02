import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currentProfileId } from "@/lib/local-profile-storage";
import { useLibrary } from "@/lib/videos/store";
import { useLocalProfiles, requestProfileControls } from "./use-local-profiles";

export function ProfileIdentity({ onOpen }: { onOpen?: () => void }) {
  const registry = useLocalProfiles();
  const profile = registry.profiles.find((row) => row.id === currentProfileId());
  const label =
    registry.status === "loading"
      ? "Loading profile…"
      : (profile?.name ??
        (currentProfileId() === "default" ? "Default · names unavailable" : "Profile unavailable"));
  return (
    <Button
      variant="secondary"
      className="min-h-11 min-w-0 max-w-full gap-2"
      data-profile-identity
      title={"Local profile: " + label}
      aria-label={"Local profile: " + label + ". Open profile controls"}
      onClick={() => {
        const state = useLibrary.getState();
        if (state.activeId) state.closePlayer();
        if (state.previewId) state.closePreview();
        requestProfileControls();
        state.setQuery("");
        state.setSource("accounts");
        onOpen?.();
      }}
    >
      <UserRound className="size-4 shrink-0" aria-hidden="true" />
      <span className="max-w-40 truncate text-xs">{label}</span>
    </Button>
  );
}
