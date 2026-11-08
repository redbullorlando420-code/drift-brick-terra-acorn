import { profileChannelName } from "./local-profile-storage.ts";

const listeners = new Set<(id: string) => void>();
let channel: BroadcastChannel | undefined;
const valid = (id: unknown): id is string =>
  typeof id === "string" && id.length > 0 && id.length <= 600;
export function onDirectoryGrantForgotten(listener: (id: string) => void) {
  listeners.add(listener);
  if (!channel && typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(profileChannelName("reelcase-directory-grants-v1"));
    channel.onmessage = (event) => {
      if (valid(event.data)) for (const run of listeners) run(event.data);
    };
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      channel?.close();
      channel = undefined;
    }
  };
}
export function publishDirectoryGrantForgotten(id: string) {
  if (!valid(id)) return;
  for (const run of listeners) run(id);
  try {
    channel?.postMessage(id);
  } catch {
    /* The committed grant remains forgotten after reload. */
  }
}
