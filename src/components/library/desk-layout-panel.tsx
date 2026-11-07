import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deskLayouts,
  changeDeskLayout,
  DEFAULT_DESK_LAYOUT,
  type DeskLayout,
  type LayoutDesk,
} from "@/lib/desk-layouts";
import { browseTaskSnapshot } from "@/lib/browse-task-session";
export function useSavedDeskLayout(source: string, apply: (layout: DeskLayout) => void) {
  const latest = useRef(apply);
  latest.current = apply;
  useLayoutEffect(() => {
    if (
      !["youtube", "twitch", "movies"].includes(source) ||
      browseTaskSnapshot().restore?.task.source === source
    )
      return;
    const saved = deskLayouts.read().desks[source as LayoutDesk];
    if (saved) latest.current(saved);
  }, [source]);
}
export function DeskLayoutPanel({
  desk,
  current,
  apply,
}: {
  desk: LayoutDesk;
  current: DeskLayout;
  apply: (layout: DeskLayout) => void;
}) {
  const [note, setNote] = useState(""),
    [error, setError] = useState("");
  const act = (fn: () => void) => {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Layout could not be saved.");
    }
  };
  return (
    <details
      data-desk-layout={desk}
      className="my-4 rounded-lg border border-border bg-surface p-4"
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
        Saved desk layout
      </summary>
      <p className="mt-2 text-sm leading-6 text-muted">
        Save this desk’s current grid/list view and expanded shelves. Search, sort, selected titles
        and playback are excluded. Saved choices apply on ordinary desk entry; returning to a saved
        browsing task keeps that task’s layout.
      </p>
      <p data-layout-current className="mt-2 text-xs text-muted">
        Current: {current.view} · recommendations {current.explore ? "expanded" : "collapsed"} ·
        catalog {current.catalog ? "expanded" : "collapsed"}.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          className="min-h-11"
          onClick={() =>
            act(() => {
              deskLayouts.write(changeDeskLayout(deskLayouts.get(), desk, current));
              setNote("Current layout saved for this desk and profile.");
            })
          }
        >
          Save current desk layout
        </Button>
        <Button
          className="min-h-11"
          variant="secondary"
          onClick={() =>
            act(() => {
              deskLayouts.write(changeDeskLayout(deskLayouts.get(), desk));
              apply(DEFAULT_DESK_LAYOUT);
              setNote(
                "This desk reset to grid and collapsed shelves. Undo is available after reload.",
              );
            })
          }
        >
          Reset this desk layout
        </Button>
        <Button
          className="min-h-11"
          variant="secondary"
          onClick={() =>
            act(() => {
              const s = deskLayouts.get();
              if (s.undo?.desk !== desk)
                throw Error("No reset/save for this desk is available to undo.");
              const previous = s.undo.previous;
              deskLayouts.write(changeDeskLayout(s, desk, previous));
              apply(previous ?? DEFAULT_DESK_LAYOUT);
              setNote("Previous layout restored. Other desk layouts are unchanged.");
            })
          }
        >
          Undo desk layout change
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            deskLayouts.read();
            setNote("Saved layouts reloaded.");
            setError(deskLayouts.error());
          }}
        >
          Reload saved layouts
        </Button>
      </div>
      <p role="status" className="mt-2 text-xs text-muted">
        {note}
      </p>
      {(error || deskLayouts.error()) && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error || deskLayouts.error()}
        </p>
      )}
    </details>
  );
}
