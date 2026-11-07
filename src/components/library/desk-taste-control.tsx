import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { getGuidePreset, hydrateGuidePreset } from "@/lib/guide-preset-store";
import { deskTasteStore, ensureDeskTaste } from "@/lib/desk-taste-store";
import {
  resolveDeskTaste,
  validateDeskTaste,
  type DeskTaste,
  type TasteDesk,
} from "@/lib/videos/desk-taste";
import { previewDeskTaste } from "@/lib/videos/desk-taste-preview";
import { catalogTurn } from "@/lib/catalog-turn";
import {
  getFeedbackRevision,
  getRating,
  creatorIsFavorited,
  recommendationTopicIsLiked,
  getRecommendationRejections,
} from "@/lib/media-feedback";
import {
  getRecommendationExposure,
  getExposureRevision,
} from "@/lib/recommendation-exposure-store";
import { getTopicBridges } from "@/lib/topic-bridge-store";
import type { GuideInput, GuideSnapshot } from "@/lib/videos/guide-picks";
import type { LibraryVideo } from "@/lib/videos/types";

export function useDeskTaste() {
  useEffect(ensureDeskTaste, []);
  return useSyncExternalStore(
    deskTasteStore.subscribe,
    deskTasteStore.getSnapshot,
    deskTasteStore.getSnapshot,
  );
}
const names: Record<TasteDesk, string> = {
  guide: "Guide",
  youtube: "YouTube",
  twitch: "Twitch",
  movies: "Movies",
};
export function DeskTasteControl({
  desk,
  movieVideos,
}: {
  desk: TasteDesk;
  movieVideos?: () => LibraryVideo[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <details
      data-desk-taste={desk}
      className="my-4 rounded-xl border border-border bg-surface p-4"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Tune {names[desk]} desk picks
        </span>
      </summary>
      {open && <DeskTasteEditor key={desk} desk={desk} movieVideos={movieVideos} />}
    </details>
  );
}
function DeskTasteEditor({
  desk,
  movieVideos,
}: {
  desk: TasteDesk;
  movieVideos?: () => LibraryVideo[];
}) {
  const saved = useDeskTaste(),
    videos = useLibrary((s) => s.videos),
    tags = useLibrary((s) => s.tags),
    favorites = useLibrary((s) => s.favorites),
    likes = useLibrary((s) => s.likes),
    history = useLibrary((s) => s.history),
    folders = useLibrary((s) => s.folders),
    hidden = useLibrary((s) => s.hiddenVideos),
    unavailable = useLibrary((s) => s.unavailable),
    viewer = useLibrary((s) => Boolean(s.previewId || s.activeId));
  const [revision, setRevision] = useState(0),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let live = true;
    void hydrateGuidePreset().then(() => {
      if (live) setLoaded(true);
    });
    const change = () => setRevision((n) => n + 1);
    for (const name of [
      "reelcase:guide-preset-change",
      "reelcase:rating-change",
      "reelcase:bridge-change",
      "reelcase:exposure-change",
    ])
      window.addEventListener(name, change);
    return () => {
      live = false;
      for (const name of [
        "reelcase:guide-preset-change",
        "reelcase:rating-change",
        "reelcase:bridge-change",
        "reelcase:exposure-change",
      ])
        window.removeEventListener(name, change);
    };
  }, []);
  const shared = getGuidePreset().current,
    effective = resolveDeskTaste(saved.saved, saved.temporary, desk, shared);
  const [draft, setDraft] = useState<DeskTaste>(() => ({
      weights: effective.weights,
      novelty: effective.novelty,
    })),
    [error, setError] = useState(""),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false);
  const request = useRef<AbortController | undefined>(undefined),
    seed = useRef(2746);
  const metadataProvenance=useLibrary(s=>s.metadataProvenance);
  const input = useMemo<GuideInput>(
    () => ({
      metadataProvenance,
      videos: desk === "movies" ? (movieVideos?.() ?? []) : videos,
      tags,
      favorites,
      likes,
      history,
      folders,
      hidden,
      unavailable,
      weights: shared,
      provider: desk === "youtube" || desk === "twitch" ? desk : undefined,
      bridgeSuppressions: getTopicBridges(),
      recommendationExposure: getRecommendationExposure(),
      recommendationRejections: getRecommendationRejections(),
      ratingOf: getRating,
      creatorIsFavorited,
      tagIsLiked: recommendationTopicIsLiked,
    }),
    [
      desk,
      movieVideos,
      videos,
      tags,
      favorites,
      likes,
      history,
      folders,
      hidden,
      unavailable,
      revision,
      shared,metadataProvenance,
    ],
  );
  const draftKey = JSON.stringify(draft),
    activeKey = JSON.stringify({ weights: effective.weights, novelty: effective.novelty });
  const previousActive = useRef(activeKey);
  useEffect(() => {
    if (previousActive.current !== activeKey) {
      previousActive.current = activeKey;
      setDraft({ weights: effective.weights, novelty: effective.novelty });
    }
  }, [activeKey]);
  const [packet, setPacket] = useState<{
    input: GuideInput;
    draft: string;
    active: string;
    feedback: number;
    exposure: number;
    data: Awaited<ReturnType<typeof previewDeskTaste>>;
  }>();
  const current =
    packet?.input === input &&
    packet.draft === draftKey &&
    packet.active === activeKey &&
    packet.feedback === getFeedbackRevision() && packet.exposure === getExposureRevision();
  const activePicks =
    packet?.input === input && packet.feedback === getFeedbackRevision() && packet.exposure === getExposureRevision()
      ? packet.draft === activeKey
        ? packet.data.proposed
        : packet.active === activeKey
          ? packet.data.baseline
          : undefined
      : undefined;
  useEffect(() => {
    if (request.current && !request.current.signal.aborted) {
      request.current.abort();
      setNote("Library observations changed or a viewer opened. Preview again before applying.");
    }
    setBusy(false);
    setPacket(undefined);
  }, [input, viewer]);
  useEffect(() => () => request.current?.abort(), []);
  const attempt = (work: () => void) => {
    try {
      work();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Desk tuning could not be updated.");
    }
  };
  const preview = async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const feedback = getFeedbackRevision(),
        exposure = getExposureRevision(),
        choice = validateDeskTaste(draft),
        result = await previewDeskTaste(
          input,
          effective,
          choice,
          seed.current,
          Date.now(),
          catalogTurn(controller.signal),
        );
      if (
        !controller.signal.aborted &&
        feedback === getFeedbackRevision() &&
        exposure === getExposureRevision()
      )
        setPacket({ input, draft: draftKey, active: activeKey, feedback, exposure, data: result });
      else if (!controller.signal.aborted)
        setNote("Observations changed during the comparison. Preview again before applying.");
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "The desk preview could not finish.");
    } finally {
      if (request.current === controller) { request.current=undefined;setBusy(false); }
    }
  };
  const noveltyLabel = (data: GuideSnapshot) =>
    !data.novelty?.available
      ? "No eligible history/exposure evidence in this sample; neutral novelty default."
      : `Familiarity evidence for ${data.novelty.selectedKnown}/${data.picks.length} picks · average ${data.novelty.meanFamiliarity === null ? "unknown" : Math.round(data.novelty.meanFamiliarity * 100) + "%"}${data.novelty.limited ? " · evidence capped; unobserved creators stay unknown" : ""}.`;
  return (
    <div className="mt-3 space-y-4" aria-label={`${names[desk]} desk tuning`}>
      <p className="text-sm leading-6 text-muted">
        These controls tune this desk’s local picks. In Guide, choose this source to apply its
        overlay to full-library picks and questions. Other provider shelves keep their own ranking.
        Adults and baseline feedback are unchanged.
      </p>
      <p data-desk-effective className="text-xs leading-5 text-muted">
        Active: {effective.origin} · favorites {effective.weights.favorite} · likes{" "}
        {effective.weights.like} · shared topics {effective.weights.topic} · novelty{" "}
        {effective.novelty}. Precedence: temporary desk mix → saved desk overlay → shared Guide
        preset.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void preview();
        }}
        className="space-y-4"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {(["favorite", "like", "topic"] as const).map((key) => (
            <label key={key} className="space-y-2 text-sm text-fg">
              {key === "favorite" ? "Favorites" : key === "like" ? "Likes" : "Shared topics"}
              <Input
                aria-label={`${names[desk]} ${key} weight`}
                type="number"
                min={0}
                max={key === "topic" ? 3 : 8}
                step={1}
                value={draft.weights[key]}
                onChange={(event) => {
                  setDraft({
                    ...draft,
                    weights: { ...draft.weights, [key]: Number(event.target.value) },
                  });
                  setNote("");
                }}
              />
            </label>
          ))}
        </div>
        <label className="block space-y-2 text-sm text-fg">
          Novelty and familiarity
          <select
            aria-label={`${names[desk]} novelty balance`}
            className="min-h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg"
            value={draft.novelty}
            onChange={(event) => {
              setDraft({ ...draft, novelty: Number(event.target.value) });
              setNote("");
            }}
          >
            {[
              [-2, "Prefer familiar"],
              [-1, "Slightly familiar"],
              [0, "Neutral"],
              [1, "Slightly new"],
              [2, "Prefer new"],
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs leading-5 text-muted">
          Novelty changes a score by at most one point. Recorded activity and shown recommendations
          are distinct from completed watches. Unknown creator evidence remains neutral. Guide’s
          temporary source/length/familiarity controls apply after these weights.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="min-h-11" disabled={busy || !loaded || viewer}>
            {busy ? "Preparing comparison…" : "Preview desk mix"}
          </Button>
          {busy && (
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() => {
                request.current?.abort();
                setBusy(false);
                setNote("Preview cancelled. Saved choices are unchanged.");
              }}
            >
              Cancel desk preview
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            className="min-h-11"
            disabled={!current || busy}
            onClick={() =>
              attempt(() => {
                deskTasteStore.apply(desk, draft);
                setNote(
                  "Temporary desk mix applied. Reloading clears it; saved feedback is unchanged.",
                );
              })
            }
          >
            Use for this session
          </Button>
          <Button
            type="button"
            className="min-h-11"
            disabled={!current || busy || Boolean(saved.error)}
            onClick={() =>
              attempt(() => {
                deskTasteStore.save(desk, draft);
                setNote(
                  "Desk overlay saved in this profile. Other desks and baseline feedback are unchanged.",
                );
              })
            }
          >
            Save desk overlay
          </Button>
        </div>
      </form>
      {packet?.input === input && (
        <section
          aria-label="Desk mix comparison"
          className="space-y-3 rounded-lg border border-border p-3"
        >
          <p className="text-xs text-muted">
            Compared {packet.data.sampled} of {packet.data.eligible} eligible recordings, in saved
            catalog order. This bounded preview can differ from full-library Guide ranking. Same
            seed and observations for both mixes.
            {!current
              ? " Controls, preferences or feedback changed; preview again before applying."
              : ""}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Current", packet.data.baseline],
              ["Proposed", packet.data.proposed],
            ].map(([label, value]) => {
              const data = value as GuideSnapshot;
              return (
                <div key={label as string}>
                  <h3 className="font-medium text-fg">{label as string} desk mix</h3>
                  <p className="mt-2 text-xs leading-5 text-muted">{noveltyLabel(data)}</p>
                  <ol className="mt-2 space-y-2">
                    {data.picks.slice(0, 6).map((video) => (
                      <li
                        key={video.id}
                        data-desk-preview-id={video.id}
                        className="text-sm text-fg"
                      >
                        {video.name}
                        <p className="text-xs text-muted">
                          {data.explanations[video.id]?.notices.at(-1)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>
      )}
      {activePicks && (
        <section aria-label="Active desk picks">
          <h3 className="font-medium text-fg">Active {names[desk]} desk picks</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {activePicks.picks.map((video) => (
              <Button
                key={video.id}
                variant="secondary"
                className="h-auto min-h-11 justify-start whitespace-normal text-left"
                data-desk-pick-id={video.id}
                onClick={() => useLibrary.getState().openPreview(video.id)}
              >
                {video.name}
              </Button>
            ))}
          </div>
          {!activePicks.picks.length && (
            <p className="text-sm text-muted">No unrecorded recordings in this sample.</p>
          )}
        </section>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() =>
            attempt(() => {
              deskTasteStore.clearTemporary(desk);
              setNote("Temporary desk mix cleared. Saved overlay or shared preset is active.");
            })
          }
        >
          Clear temporary desk mix
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={Boolean(saved.error)}
          onClick={() =>
            attempt(() => {
              deskTasteStore.reset(desk);
              setDraft({ weights: shared, novelty: 0 });
              setNote(
                "This desk reset to the shared preset. Other desk choices and baseline feedback were kept.",
              );
            })
          }
        >
          Reset this desk
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          onClick={() => {
            deskTasteStore.load();
            setNote("Desk preferences reloaded.");
          }}
        >
          Reload desk preferences
        </Button>
      </div>
      <p role="status" className="text-sm text-muted">
        {note}
      </p>
      {(error || saved.error) && (
        <p role="alert" className="text-sm text-danger">
          {error || saved.error}
        </p>
      )}
    </div>
  );
}
