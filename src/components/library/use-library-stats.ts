import { useEffect, useMemo, useState } from "react";
import { createSettledInput } from "@/lib/settled-input";
import type { LibraryStats, StatsInput } from "@/lib/videos/library-stats";
import { exportFeedback, getRating, getFeedbackRevision } from "@/lib/media-feedback";
import { createWeakSnapshotCache } from "@/lib/weak-snapshot-cache";
import { forEachCatalogEntry, forEachCatalogSlice, yieldCatalogTask } from "@/lib/catalog-work";
import { getInteractionPriorityDelay, scheduleBackgroundWork } from "@/lib/interaction-budget";
import { useLibrary } from "@/lib/videos/store";
import { sparseRecordScan } from "@/lib/sparse-record";
import { statsVideo } from "@/lib/videos/stats-video";

type Input = Omit<StatsInput, "ratings" | "tagLikes" | "watchTime">;
const completedStats = createWeakSnapshotCache<Input, LibraryStats>(60_000);
/** Snapshot results stay small; full records exist only in a disposable worker.
 * Replaced jobs, hidden tabs, playback and navigation release that worker. */
export function useLibraryStats(input: Input, revision: number) {
  const [settled, setSettled] = useState({ input, revision });
  const coalescer = useMemo(
    () => createSettledInput(setSettled, { quietMs: 800, maxWaitMs: 5_000 }),
    [],
  );
  useEffect(() => {
    if (input !== settled.input || revision !== settled.revision)
      coalescer.push({ input, revision });
  }, [input, revision, coalescer]);
  useEffect(() => () => coalescer.cancel(), [coalescer]);
  const [snapshot, setSnapshot] = useState<{
    data?: LibraryStats;
    pending: boolean;
    error: boolean;
  }>(() => {
    const data = completedStats.get(input, getFeedbackRevision());
    return { data, pending: !data, error: false };
  });
  const viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!visible || viewer) return;
    const input = settled.input;
    const cached = completedStats.get(input, getFeedbackRevision());
    if (cached) {
      setSnapshot({ data: cached, pending: false, error: false });
      return;
    }
    const controller = new AbortController();
    let worker: Worker | undefined,
      cancelTurn = () => {},
      rejectTurn: ((error: Error) => void) | undefined;
    let ack: (() => void) | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let feedbackRevision: number;
    const stop = () => {
      worker?.terminate();
      worker = undefined;
      clearTimeout(watchdog);
    };
    const failed = () => {
      if(controller.signal.aborted)return;
      stop();
      controller.abort();
      cancelTurn();rejectTurn?.(new Error("Statistics worker stopped"));
      ack?.();ack=undefined;
      setSnapshot((previous) => ({ ...previous, pending: false, error: true }));
    };
    const turn = async () => {
      controller.signal.throwIfAborted();
      await yieldCatalogTask();
      if (getInteractionPriorityDelay() > 0)
        await new Promise<void>((resolve, reject) => {
          rejectTurn = reject;
          cancelTurn = scheduleBackgroundWork(() => {
            rejectTurn = undefined;
            resolve();
          });
        });
      controller.signal.throwIfAborted();
    };
    const send = (field: keyof StatsInput, rows: unknown[]) =>
      new Promise<void>((resolve) => {
        controller.signal.throwIfAborted();
        ack = resolve;
        watchdog = setTimeout(failed, 30_000);
        worker!.postMessage({ field, rows });
      });
    const timer = setTimeout(() => {
      cancelTurn = scheduleBackgroundWork(() => {
        setSnapshot((previous) => ({ ...previous, pending: true, error: false }));
        try {
          worker = new Worker(
            new URL("../../lib/videos/library-stats.worker.ts", import.meta.url),
            { type: "module" },
          );
        } catch {
          failed();
          return;
        }
        worker.onerror = event=>{event.preventDefault();failed();};
        worker.onmessageerror = failed;
        worker.onmessage = ({ data }) => {
          if(controller.signal.aborted)return;
          clearTimeout(watchdog);
          if (data.next) {
            const done = ack;
            ack = undefined;
            done?.();
            return;
          }
          if (data.error) {
            failed();
            return;
          }
          stop();
          if (!controller.signal.aborted) {
            // A rating/playback update during packing must not turn a mixed
            // snapshot into an apparently fresh cached result.
            if (feedbackRevision === getFeedbackRevision())
              completedStats.put(input, feedbackRevision, data.data);
            setSnapshot({ data: data.data, pending: false, error: false });
          }
        };
        void (async () => {
          const feedback = exportFeedback();
          feedbackRevision = getFeedbackRevision();
          const records = { ...input, tagLikes: feedback.tagLikes, watchTime: feedback.watchTime };
          for (const field of Object.keys(records) as Array<keyof typeof records>) {
            let batch: unknown[] = [];
            const flush = async () => {
              await turn();
              if (batch.length) {
                const rows = batch;
                batch = [];
                await send(field, rows);
              }
            };
            if (field === "videos") {
              await forEachCatalogSlice(
                input.videos,
                (video) => {
                  batch.push(statsVideo(video));
                },
                flush,
                256,
              );
              await flush();
              batch = [];
              await forEachCatalogSlice(
                input.videos,
                (video) => {
                  const rating = getRating(video.id);
                  if (rating) batch.push([video.id, rating]);
                },
                async () => {
                  await turn();
                  if (batch.length) {
                    const rows = batch;
                    batch = [];
                    await send("ratings", rows);
                  }
                },
                256,
              );
              if (batch.length) await send("ratings", batch);
            } else {
              const value = records[field];
              if (Array.isArray(value))
                await forEachCatalogSlice(
                  value as unknown[],
                  (row) => {
                    batch.push(row);
                  },
                  flush,
                  256,
                );
              else {
                await forEachCatalogEntry(
                  sparseRecordScan(value as Record<string, unknown>),
                  (row) => {
                    if (row) batch.push(row);
                  },
                  flush,
                );
              }
              await flush();
            }
          }
          controller.signal.throwIfAborted();
          watchdog = setTimeout(failed, 60_000);
          worker!.postMessage({ done: true });
        })().catch(() => {
          if (!controller.signal.aborted) failed();
        });
      });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
      cancelTurn();
      rejectTurn?.(new Error("Stats replaced"));
      ack?.();
      stop();
    };
  }, [settled, viewer, visible]);
  return {
    ...snapshot,
    pending: !snapshot.error&&(snapshot.pending || input !== settled.input || revision !== settled.revision),
  };
}
