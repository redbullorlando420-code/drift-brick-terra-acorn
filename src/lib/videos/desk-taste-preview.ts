import { forEachCatalogSlice } from "../catalog-work.ts";
import { guideVisibility, prepareGuide, type GuideInput } from "./guide-picks.ts";
import type { DeskTaste } from "./desk-taste.ts";
export const DESK_PREVIEW_LIMIT = 240;
/** Borrow the input only while preparing. Returned projections hold at most
 * twelve cards per ranking and no additional full-catalog reference. */
export async function previewDeskTaste(
  input: GuideInput,
  current: DeskTaste,
  proposal: DeskTaste,
  seed: number,
  now: number,
  turn: () => Promise<void>,
) {
  const visible = guideVisibility(input),
    sample: GuideInput["videos"][number][] = [];
  let eligible = 0;
  await forEachCatalogSlice(
    input.videos,
    (video) => {
      if (!visible(video) || video.remote?.live) return;
      eligible++;
      if (sample.length < DESK_PREVIEW_LIMIT) sample.push(video);
    },
    turn,
  );
  const scope = { ...input, videos: sample };
  const baseline = await prepareGuide(
    { ...scope, weights: current.weights, novelty: current.novelty },
    seed,
    now,
    turn,
  );
  const proposed = await prepareGuide(
    { ...scope, weights: proposal.weights, novelty: proposal.novelty },
    seed,
    now,
    turn,
  );
  return {
    baseline,
    proposed,
    sampled: sample.length,
    eligible,
    limited: sample.length < eligible,
  };
}
