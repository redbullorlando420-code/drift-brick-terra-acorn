import type { BrowseTask } from "./browse-tasks";

export type BrowseRestore = { ticket: number; task: BrowseTask; ready: boolean; note?: string };
type Snapshot = {
  back: boolean;
  forward: boolean;
  ready: boolean;
  message: string;
  restore?: BrowseRestore;
};
let snapshot: Snapshot = { back: false, forward: false, ready: false, message: "" };
const listeners = new Set<() => void>();
export const subscribeBrowseTasks = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const browseTaskSnapshot = () => snapshot;
export function updateBrowseTaskSession(value: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...value };
  for (const listener of listeners) listener();
}
type Actions = {
  move(direction: -1 | 1): void;
  capture(): BrowseTask;
  open(task: BrowseTask): void;
};
let actions: Actions | undefined;
export function installBrowseTaskActions(next: Actions) {
  actions = next;
  return () => {
    if (actions === next) {
      actions = undefined;
      updateBrowseTaskSession({
        back: false,
        forward: false,
        ready: false,
        restore: undefined,
        message: "",
      });
    }
  };
}
export const browseBack = () => actions?.move(-1);
export const browseForward = () => actions?.move(1);
export function captureBrowseTask() {
  if (!actions) throw Error("Wait for your library to finish loading.");
  return actions.capture();
}
export function openBrowseTask(task: BrowseTask) {
  if (!actions) throw Error("Wait for your library to finish loading.");
  actions.open(task);
}
export function finishBrowseRestore(ticket: number, message = "Place restored.") {
  if (snapshot.restore?.ticket !== ticket) return;
  updateBrowseTaskSession({
    restore: undefined,
    message: [snapshot.restore.note, message].filter(Boolean).join(" "),
  });
}
