import { useEffect, useRef } from "react";
import { profileSwitchWork, type ProfileWork } from "@/lib/profile-switch-work";

export function useProfileCheckpoint(
  read: () => ProfileWork | undefined,
  checkpoint?: () => void | Promise<void>,
) {
  const current = useRef({ read, checkpoint });
  current.current = { read, checkpoint };
  useEffect(() => {
    const slot = profileSwitchWork.register({
      read: () => current.current.read(),
      checkpoint: () => current.current.checkpoint?.(),
    });
    return slot.detach;
  }, []);
}
