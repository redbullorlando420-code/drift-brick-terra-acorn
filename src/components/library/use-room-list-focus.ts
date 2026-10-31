import { useLayoutEffect, useRef, type RefObject } from "react";
/** Restore only a removed, focused row. Never move focus away from chat/search or another panel. */
export function useRoomListFocus(
  root: RefObject<HTMLElement | null>,
  attribute: "data-room-queue-id" | "data-room-suggestion-id" | "data-connection-stage",
  keys: string[],
) {
  const owned = useRef<
    { node: HTMLElement; key: string; action?: string; index: number } | undefined
  >(undefined);
  const revision = JSON.stringify(keys);
  useLayoutEffect(() => {
    const panel = root.current;
    if (!panel) return;
    const focus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !panel.contains(target)) {
        owned.current = undefined;
        return;
      }
      const row = target.closest<HTMLElement>(`[${attribute}]`);
      if (!row) {
        owned.current = undefined;
        return;
      }
      const rows = Array.from(panel.querySelectorAll(`[${attribute}]`));
      owned.current = {
        node: target,
        key: row.getAttribute(attribute)!,
        action: target.getAttribute("data-room-focus-action") ?? undefined,
        index: rows.indexOf(row),
      };
    };
    const pointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !panel.contains(event.target)) owned.current = undefined;
    };
    document.addEventListener("focusin", focus);
    document.addEventListener("pointerdown", pointer, true);
    return () => {
      document.removeEventListener("focusin", focus);
      document.removeEventListener("pointerdown", pointer, true);
      owned.current = undefined;
    };
  }, [root, attribute]);
  useLayoutEffect(() => {
    const previous = owned.current,
      panel = root.current;
    if (!previous || !panel) return;
    if (previous.node.isConnected) return;
    if (document.activeElement !== document.body && document.activeElement !== null) {
      owned.current = undefined;
      return;
    }
    const rows = Array.from(panel.querySelectorAll<HTMLElement>(`[${attribute}]`)).filter(
      (row) => !row.hidden,
    );
    const row = rows[Math.min(previous.index, rows.length - 1)];
    const controls = row
      ? Array.from(
          row.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]"),
        )
      : [];
    const target =
      controls.find(
        (control) => control.getAttribute("data-room-focus-action") === previous.action,
      ) ??
      controls[0] ??
      row?.querySelector<HTMLElement>("[data-room-list-heading]") ??
      panel.querySelector<HTMLElement>("[data-room-list-heading]");
    owned.current = undefined;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [revision, root, attribute]);
}
