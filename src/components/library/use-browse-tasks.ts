import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLibrary } from "@/lib/videos/store";
import {
  createBrowseHistory,
  browseRouteKey,
  validateBrowseTask,
  type BrowseTask,
} from "@/lib/browse-tasks";
import {
  browseTaskSnapshot,
  installBrowseTaskActions,
  updateBrowseTaskSession,
  finishBrowseRestore,
} from "@/lib/browse-task-session";
import { canonicalLocalId } from "@/lib/videos/local-identity";
import { lookupVideo } from "@/lib/videos/video-lookup";
import { publicVideoBoundary } from "@/lib/videos/public-visibility";
import { HUB_SOURCES } from "@/lib/library-navigation";

const builtins = new Set([
  ...HUB_SOURCES,
  "home",
  "landing",
  "movies",
  "favorites",
  "history",
  "adults",
  "adult-fetishes",
  "continue",
  "youtube",
  "twitch",
  "live",
  "classics",
  "all",
  "demo",
]);
const privateSource = (source: string) =>
  source === "adults" ||
  source === "adult-fetishes" ||
  Boolean(useLibrary.getState().folders.find((folder) => folder.id === source)?.adult);
const eligible = (id: string, privateTask: boolean) => {
  const state = useLibrary.getState(),
    video = lookupVideo(state.videos, canonicalLocalId(id));
  return video &&
    !state.hiddenVideos[video.id] &&
    !state.unavailable[video.id] &&
    !(state.hideDemo && video.isSample) &&
    (publicVideoBoundary(state.folders)(video) ? !privateTask : privateTask && state.adultsUnlocked)
    ? video
    : undefined;
};
export function useBrowseTasks({
  ready,
  source,
  query,
  resultRevision,
  options,
  restoreOptions,
}: {
  ready: boolean;
  source: string;
  query: string;
  resultRevision: number;
  options: BrowseTask["options"];
  restoreOptions(options: BrowseTask["options"]): void;
}) {
  const latest = useRef({ options, restoreOptions });
  useLayoutEffect(() => {
    latest.current = { options, restoreOptions };
  });
  const rendered = useRef({ ready, source, query, resultRevision });
  rendered.current = { ready, source, query, resultRevision };
  const runtime = useRef<{ applyOptions: () => void } | undefined>(undefined);
  const [catalogReady, setCatalogReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    // hydrated paints preferences before disk rows and their source folders.
    // Join the existing restore rather than misclassifying an unloaded source
    // or identity ledger as deleted, or starting another catalog reader.
    void useLibrary
      .getState()
      .restoreFolders()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled)
          updateBrowseTaskSession({
            message:
              "Saved places are waiting for library recovery. Reload after resolving the library error.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!catalogReady) return;
    let disposed = false,
      suppressed = false,
      timer: ReturnType<typeof setTimeout> | undefined,
      restoreTimer: ReturnType<typeof setTimeout> | undefined,
      ticket = 0,
      focused: string | undefined;
    let focusAnchor: { route: string; anchor: NonNullable<BrowseTask["anchor"]> } | undefined;
    let continueFocus = false;
    let focusResultRevision = resultRevision;
    let focusEvidence:
      { videos: WeakRef<object>; tags: WeakRef<object>; categories: WeakRef<object> } | undefined;
    const basic = (): BrowseTask => {
      const s = useLibrary.getState(),
        detail = s.previewId ?? s.activeId;
      return {
        source: s.sourceId,
        query: s.query,
        sort: s.sort,
        view: s.view,
        private: privateSource(s.sourceId),
        scroll: 0,
        options: {},
        ...(detail ? { detail: canonicalLocalId(detail) } : {}),
      };
    };
    const history = createBrowseHistory(basic());
    const publish = () => updateBrowseTaskSession({ ...history.state(), ready: true });
    const capture = () => {
      const task = history.current();
      // Do not attach an old grid's anchor while a destination is still loading.
      if (
        rendered.current.source !== task.source ||
        rendered.current.query !== task.query ||
        !rendered.current.ready
      )
        return task;
      const grids = [...document.querySelectorAll<HTMLElement>("[data-virtual-video-grid]")];
      const cards = [
        ...document.querySelectorAll<HTMLElement>("[data-video-card-open][data-video-card-id]"),
      ];
      const visible = cards.filter((card) => {
        const box = card.getBoundingClientRect();
        return box.bottom > 0 && box.top < window.innerHeight;
      });
      const selected = visible.find((card) => card.dataset.videoCardId === focused) || visible[0];
      const grid = selected?.closest<HTMLElement>("[data-virtual-video-grid]");
      const ids = grid
        ? [...grid.querySelectorAll<HTMLElement>("[data-video-card-open][data-video-card-id]")].map(
            (card) => card.dataset.videoCardId!,
          )
        : [];
      const index = selected ? ids.indexOf(selected.dataset.videoCardId!) : -1;
      const bounded = selected
        ? [
            selected.dataset.videoCardId!,
            ...ids.slice(Math.max(0, index - 1), index),
            ...ids.slice(index + 1, index + 3),
          ]
        : [];
      const taskOptions = Object.fromEntries(
        Object.entries(latest.current.options).filter(([key]) =>
          task.source === "youtube"
            ? key.startsWith("youtube")
            : task.source === "twitch"
              ? key.startsWith("twitch")
              : task.private
                ? key.startsWith("adult")
                : task.source === "history"
                  ? key.startsWith("history")
                  : task.source === "favorites"
                    ? key === "savedFilter"
                    : false,
        ),
      );
      const preferred =
        focusAnchor?.route === browseRouteKey(task) ? focusAnchor.anchor : undefined;
      const result = validateBrowseTask({
        ...task,
        options: taskOptions,
        scroll: Math.min(100_000_000, Math.max(0, window.scrollY)),
        anchor: undefined,
        ...(preferred
          ? { anchor: preferred }
          : grid && selected && grids.indexOf(grid) >= 0
            ? {
                anchor: {
                  ids: [...new Set(bounded.map(canonicalLocalId))],
                  grid: grids.indexOf(grid),
                  top: Math.max(-10000, Math.min(10000, selected.getBoundingClientRect().top)),
                },
              }
            : {}),
      });
      history.checkpoint(result);
      return result;
    };
    const cancelPending = () => {
      clearTimeout(timer);
      clearTimeout(restoreTimer);
      timer = undefined;
      restoreTimer = undefined;
      ticket++;
      updateBrowseTaskSession({ restore: undefined, message: "" });
    };
    const safe = (raw: BrowseTask) => {
      const task = validateBrowseTask(raw),
        state = useLibrary.getState();
      if (task.private && !state.adultsUnlocked)
        throw Error("Unlock Adults before opening a private place.");
      if (
        !builtins.has(task.source) &&
        !state.folders.some((folder) => folder.id === task.source) &&
        !state.follows.some((follow) => follow.id === task.source)
      )
        return {
          task: {
            ...task,
            source: task.private ? "adults" : "home",
            anchor: undefined,
            detail: undefined,
            options: {},
          },
          note: "The saved source is unavailable. The remaining search opened in its library desk.",
        };
      if (privateSource(task.source) !== task.private)
        return {
          task: {
            ...task,
            source: task.private ? "adults" : "home",
            anchor: undefined,
            detail: undefined,
            options: {},
          },
          note: "The saved desk’s privacy boundary changed. The remaining search opened in its library desk.",
        };
      return { task, note: "" };
    };
    const restore = (target: BrowseTask) => {
      const { task, note } = safe(target);
      cancelPending();
      suppressed = true;
      focused = undefined;
      focusAnchor = undefined;
      const state = useLibrary.getState();
      state.closePlayer();
      state.closePreview();
      state.setSource(task.source);
      state.setQuery(task.query);
      state.setSort(task.sort);
      state.setView(task.view);
      history.checkpoint(task);
      updateBrowseTaskSession({
        restore: { ticket, task, ready: false, note },
        message: note || "Restoring browse task…",
      });
      suppressed = false;
      publish();
      // The owner effect applies desk controls after existing route resets.
      runtime.current?.applyOptions();
    };
    runtime.current = {
      applyOptions() {
        const pending = browseTaskSnapshot().restore,
          frame = rendered.current;
        // Search preparation can temporarily unmount the whole grid. Its
        // focused logical identity lives here until the replacement is ready.
        // Weak references distinguish enrichment from an unrelated render
        // without retaining the previous catalog or enrichment maps.
        if (
          !pending &&
          frame.ready &&
          continueFocus &&
          focusAnchor &&
          focusAnchor.route === browseRouteKey(history.current()) &&
          focusAnchor.route === browseRouteKey(basic()) &&
          frame.source === history.current().source &&
          frame.query === history.current().query &&
          document.activeElement === document.body
        ) {
          const state = useLibrary.getState();
          if (
            focusEvidence &&
            (focusResultRevision !== frame.resultRevision ||
              focusEvidence.videos.deref() !== state.videos ||
              focusEvidence.tags.deref() !== state.tags ||
              focusEvidence.categories.deref() !== state.categories)
          ) {
            focusResultRevision = frame.resultRevision;
            focusEvidence = {
              videos: new WeakRef(state.videos),
              tags: new WeakRef(state.tags),
              categories: new WeakRef(state.categories),
            };
            const task = { ...history.current(), anchor: focusAnchor.anchor },
              currentTicket = ++ticket;
            updateBrowseTaskSession({
              restore: { ticket: currentTicket, task, ready: true },
              message: "Restoring the selected title after a catalog update…",
            });
            clearTimeout(restoreTimer);
            restoreTimer = setTimeout(
              () =>
                finishBrowseRestore(
                  currentTicket,
                  "The selected title is unavailable in this view. Your browse task is still open.",
                ),
              6000,
            );
          }
          return;
        }
        if (
          !pending ||
          pending.ready ||
          !frame.ready ||
          pending.task.source !== frame.source ||
          pending.task.query !== frame.query
        )
          return;
        latest.current.restoreOptions(pending.task.options);
        // Let the desk render once with its restored controls before grid owners
        // resolve identities against their new visible slices.
        requestAnimationFrame(() => {
          if (disposed || browseTaskSnapshot().restore?.ticket !== pending.ticket) return;
          const current = useLibrary.getState();
          if (current.sourceId !== pending.task.source || current.query !== pending.task.query)
            return;
          updateBrowseTaskSession({ restore: { ...pending, ready: true } });
          if (pending.task.detail) {
            const video = eligible(pending.task.detail, pending.task.private);
            if (video) {
              suppressed = true;
              current.openPreview(video.id);
              suppressed = false;
              finishBrowseRestore(
                pending.ticket,
                "Title preview restored. Playback starts only when you choose Play.",
              );
              return;
            }
          }
          if (!pending.task.anchor) {
            window.scrollTo({ top: pending.task.scroll, behavior: "instant" });
            finishBrowseRestore(pending.ticket, "Browse task restored.");
          } else
            restoreTimer = setTimeout(
              () =>
                finishBrowseRestore(
                  pending.ticket,
                  "The saved title position is unavailable in this view. Your browse task is still open.",
                ),
              6000,
            );
        });
      },
    };
    const uninstall = installBrowseTaskActions({
      capture,
      move(direction) {
        capture();
        const target = history.move(direction);
        if (target) {
          try {
            restore(target);
          } catch (e) {
            history.move(direction === 1 ? -1 : 1);
            updateBrowseTaskSession({
              message: e instanceof Error ? e.message : "Browse task unavailable.",
            });
          }
        }
        publish();
      },
      open(task) {
        const checked = safe(task);
        capture();
        history.push(checked.task);
        restore(task);
      },
    });
    const stop = useLibrary.subscribe((next, previous) => {
      if (disposed || suppressed) return;
      if (previous.adultsUnlocked && !next.adultsUnlocked) {
        history.clearPrivate();
        cancelPending();
        publish();
      }
      if (
        next.sourceId === previous.sourceId &&
        next.query === previous.query &&
        next.sort === previous.sort &&
        next.view === previous.view &&
        next.previewId === previous.previewId &&
        next.activeId === previous.activeId
      )
        return;
      if (timer === undefined) {
        capture();
        cancelPending();
        timer = setTimeout(() => {
          timer = undefined;
          if (disposed) return;
          history.push(basic());
          focused = undefined;
          focusAnchor = undefined;
          continueFocus = false;
          publish();
        }, 0);
      }
    });
    const focus = (event: FocusEvent) => {
      const el =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-video-card-id]")
          : null;
      if (!el) {
        if (event.target !== document.body && event.target !== document.documentElement)
          continueFocus = false;
        return;
      }
      continueFocus = true;
      focusResultRevision = rendered.current.resultRevision;
      const state = useLibrary.getState();
      focusEvidence = {
        videos: new WeakRef(state.videos),
        tags: new WeakRef(state.tags),
        categories: new WeakRef(state.categories),
      };
      focused = el.dataset.videoCardId;
      const grid = el.closest<HTMLElement>("[data-virtual-video-grid]");
      if (!grid || !focused) return;
      const ids = [...grid.querySelectorAll<HTMLElement>("[data-video-card-id]")].map(
          (card) => card.dataset.videoCardId!,
        ),
        index = ids.indexOf(focused);
      focusAnchor = {
        route: browseRouteKey(history.current()),
        anchor: {
          ids: [
            ...new Set(
              [
                focused,
                ...ids.slice(Math.max(0, index - 1), index),
                ...ids.slice(index + 1, index + 3),
              ].map(canonicalLocalId),
            ),
          ],
          grid: [...document.querySelectorAll("[data-virtual-video-grid]")].indexOf(grid),
          top: Math.max(-10000, Math.min(10000, el.getBoundingClientRect().top)),
        },
      };
    };
    const key = (event: KeyboardEvent) => {
      if (
        !event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        !["ArrowLeft", "ArrowRight"].includes(event.key)
      )
        return;
      if (
        event.target instanceof Element &&
        event.target.closest("input,textarea,select,[contenteditable=true]")
      )
        return;
      const target = history.state();
      if (event.key === "ArrowLeft" ? target.back : target.forward) {
        event.preventDefault();
        capture();
        const task = history.move(event.key === "ArrowLeft" ? -1 : 1);
        if (task)
          try {
            restore(task);
          } catch (e) {
            history.move(event.key === "ArrowLeft" ? 1 : -1);
            publish();
            updateBrowseTaskSession({
              message: e instanceof Error ? e.message : "Browse task unavailable.",
            });
          }
      }
    };
    document.addEventListener("focusin", focus);
    const pointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-video-card-id]"))
        continueFocus = false;
    };
    const scrollIntent = () => {
      continueFocus = false;
    };
    document.addEventListener("pointerdown", pointer, { passive: true });
    window.addEventListener("wheel", scrollIntent, { passive: true });
    window.addEventListener("touchstart", scrollIntent, { passive: true });
    window.addEventListener("keydown", key);
    publish();
    return () => {
      disposed = true;
      clearTimeout(timer);
      clearTimeout(restoreTimer);
      stop();
      uninstall();
      document.removeEventListener("focusin", focus);
      document.removeEventListener("pointerdown", pointer);
      window.removeEventListener("wheel", scrollIntent);
      window.removeEventListener("touchstart", scrollIntent);
      window.removeEventListener("keydown", key);
      runtime.current = undefined;
    };
  }, [catalogReady]);
  useEffect(() => {
    runtime.current?.applyOptions();
  });
}
