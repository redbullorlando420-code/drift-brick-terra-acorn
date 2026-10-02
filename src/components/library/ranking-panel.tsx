import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import {
  INTEREST_MULTIPLIERS,
  RATING_STAR_WEIGHTS,
  personalRankBreakdown,
  ratingAdjustedScore,
  ratingMultiplier,
  ratingPreference,
} from "@/lib/videos/ranking-core";

const pages = {
  YouTube: [
    [
      "Mixed from your creators",
      "A seeded rotation across saved creators and older uploads. Mix it up changes the seed. This discovery row does not sort by stars.",
    ],
    [
      "Latest uploads",
      "Newest uploads within each creator, then creators take turns. Your stars do not change this row.",
    ],
    [
      "Recommendations",
      "Creator and topic affinity, recent creator viewing, unseen and older-upload bonuses. Your video rating applies the shared multiplier plus star points. One-star videos are excluded. Likes, favorites, creator preferences, private marks and watch time receive bounded interest boosts; watched items retain a novelty penalty.",
    ],
    [
      "Creator balance",
      "Best candidates within each creator, then one creator at a time. This is a balanced mix, not a global score sort.",
    ],
    [
      "Trending / full catalog",
      "Trending uses provider views within a recent candidate window. The full catalog uses your chosen toolbar sort.",
    ],
  ],
  Adults: [
    [
      "Personal order",
      "Saves, likes, creator preferences, capped watch time, plays, private marks and hearted interests contribute evidence. Star points and bounded interest multipliers then adjust the score.",
    ],
    [
      "Recommendations",
      "Personal score stays intact. Relevant topics add at most 12 points, liked-topic overlap at most 10, and known preview artwork adds 3. One-star videos are excluded.",
    ],
    [
      "Related / topic rows",
      "Related results follow the current source, type and tag filters. Topic averages use only feedback evidence, with confidence smoothing for sparse topics.",
    ],
    [
      "Variety",
      "Providers and creators take turns. Overview rows rotate a bounded candidate window; score order is preserved inside each provider before that rotation.",
    ],
  ],
  Landing: [
    [
      "Personal local picks",
      "Shared personal score with capped watch time, creator affinity and useful topics. Watched and one-star titles are excluded from discovery.",
    ],
    [
      "Top-rated local picks",
      "Only videos rated 3–5. Stars lead, then personal score; shuffle breaks ties. Each folder supplies at most three.",
    ],
    [
      "Recent / random discovery",
      "Recent shelves use age; random discovery uses a fresh weighted sample. These rows are not rating leaderboards.",
    ],
  ],
  Other: [
    [
      "Preview suggestions",
      "Same creator, source, genre and bounded tag overlap establish relevance. The shared rating multiplier and smaller star bonus adjust that score. One-star videos are excluded.",
    ],
    [
      "Search",
      "Exact title and creator matches lead, then tags and saved reactions. Relevance is the main rule.",
    ],
    [
      "Twitch",
      "Live first, viewer count or A–Z follows the selected control. Personal shelves separately use feedback and useful topics.",
    ],
    [
      "Favorites / History / Continue",
      "Saved membership, activity order and resume marks determine inclusion. These pages are not discovery score rankings.",
    ],
  ],
} as const;
export function RankingGuide({ desk }: { desk: keyof typeof pages }) {
  const setSource = useLibrary((s) => s.setSource);
  return (
    <details className="mb-6 rounded-lg border border-border bg-surface p-4">
      <summary className="cursor-pointer text-sm font-medium text-fg">
        How {desk === "Other" ? "these pages rank" : `${desk} ranks videos`}
      </summary>
      <div className="mt-4 space-y-3">
        {pages[desk].map(([title, detail]) => (
          <div key={title}>
            <p className="text-sm font-medium text-fg">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{detail}</p>
          </div>
        ))}
        <Button
          className="h-auto min-h-11 whitespace-normal py-2"
          variant="secondary"
          onClick={() => setSource("stats")}
        >
          Open ranking formula and score comparison
        </Button>
      </div>
    </details>
  );
}

const tabs = ["Formula", "Compare scores", "Page ordering", "Interest boosts"] as const;
const contexts = [
  { label: "Personal shelves", weight: RATING_STAR_WEIGHTS.personal },
  { label: "YouTube discovery", weight: RATING_STAR_WEIGHTS.youtube },
  { label: "Preview suggestions", weight: RATING_STAR_WEIGHTS.preview },
] as const;
export function RankingPanel() {
  const [tab, setTab] = useState<number>(0),
    [base, setBase] = useState(20);
  const [weight, setWeight] = useState<number>(RATING_STAR_WEIGHTS.personal);
  const [rating, setRating] = useState(5),
    [favorite, setFavorite] = useState(true),
    [liked, setLiked] = useState(false),
    [watch, setWatch] = useState(4);
  const [topics, setTopics] = useState(0), [tagHearts, setTagHearts] = useState(0), [marks, setMarks] = useState(0);
  const [creatorLiked, setCreatorLiked] = useState(false), [creatorFavorite, setCreatorFavorite] = useState(false);
  const breakdown = personalRankBreakdown({ rating, favorite, liked, watch, topics, tagHearts, marks, creatorLiked, creatorFavorite });
  return (
    <section
      id="ranking-lab"
      aria-label="Ranking formula and controls"
      className="mt-2 rounded-xl border border-border bg-surface p-5 shadow-border sm:p-6"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-accent">Ranking lab</p>
      <h2 className="mt-2 font-display text-2xl text-fg">Understand what moves a video up.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Your saved stars keep their meaning: 1 dislikes, 2 is neutral, and 3–5 show increasing
        interest. Unrated videos remain discoverable.
      </p>
      <div role="tablist" aria-label="Ranking details" className="mt-5 flex flex-wrap gap-2">
        {tabs.map((label, index) => (
          <Button
            key={label}
            id={`ranking-tab-${index}`}
            role="tab"
            aria-selected={tab === index}
            aria-controls={`ranking-panel-${index}`}
            tabIndex={tab === index ? 0 : -1}
            variant={tab === index ? "default" : "secondary"}
            onClick={() => setTab(index)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % tabs.length
                  : event.key === "ArrowLeft"
                    ? (index + tabs.length - 1) % tabs.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? tabs.length - 1
                        : null;
              if (next !== null) {
                event.preventDefault();
                setTab(next);
                document.getElementById(`ranking-tab-${next}`)?.focus();
              }
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`ranking-panel-${tab}`}
        aria-labelledby={`ranking-tab-${tab}`}
        className="mt-5"
      >
        {tab === 0 && (
          <>
            <p className="text-sm leading-6 text-fg">
              (Evidence × star multiplier + star points + creator stars) × interest boost = personal score.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              For personal shelves, favorites add 12, likes add 6, and watch time adds at most 12.
              Repeat plays cap at 6, private marks at 12, useful topics at ±12, creator affinity at
              ±8, and freshness at 3. Repeats grow logarithmically. Learned dislikes lower topic and
              creator affinity; creator stars add a separate adjustment.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="py-3 pr-3">Rating</th>
                    <th className="py-3 pr-3">Multiplier</th>
                    <th className="py-3">Personal star points</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5].map((r) => (
                    <tr key={r} className="border-b border-border">
                      <td className="py-3 pr-3">
                        {r ? `${r} star${r === 1 ? "" : "s"}` : "Unrated"}
                      </td>
                      <td className="py-3 pr-3 tabular-nums">{ratingMultiplier(r).toFixed(2)}×</td>
                      <td className="py-3 tabular-nums">
                        {ratingPreference(r) * RATING_STAR_WEIGHTS.personal > 0 ? "+" : ""}
                        {ratingPreference(r) * RATING_STAR_WEIGHTS.personal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              YouTube discovery uses the same multipliers with a 6-point star weight; previews use a
              2-point weight so relevance still matters. Negative discovery scores divide by the
              multiplier, so a higher rating cannot make a penalty worse. One-star videos stay
              available in the catalog and saved pages, but are excluded from these recommendation
              rows.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              YouTube adds 10 for unseen videos and retains a 28-point novelty penalty for watched
              videos. Favorites add 12 and likes add 6, plus their interest multipliers. Hearted
              topics add up to 24; creator preferences, watch time and private marks also boost interest.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Topic preference uses total feedback ÷ (feedback count + 3). Unrated videos without
              other feedback add coverage, not votes. This stops one rating from creating an
              overconfident topic score.
            </p>
          </>
        )}
        {tab === 1 && (
          <div className="space-y-6">
            <p className="text-sm text-muted">
              Try the live formula below. These sample controls do not edit your saved ratings or
              ranking settings.
            </p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Comparison ranking context"
            >
              {contexts.map((context) => (
                <Button
                  key={context.weight}
                  aria-pressed={weight === context.weight}
                  variant={weight === context.weight ? "default" : "secondary"}
                  onClick={() => setWeight(context.weight)}
                >
                  {context.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted">
              Shared star multipliers · {weight}-point star weight. This compares scores before
              creator and provider balancing.
            </p>
            <label className="block max-w-xs text-sm text-fg">
              Evidence before rating
              <Input
                className="mt-2"
                type="number"
                min={-200}
                max={200}
                step={5}
                value={base}
                onChange={(e) =>
                  setBase(Math.max(-200, Math.min(200, Number(e.target.value) || 0)))
                }
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="rounded-lg bg-elevated p-3">
                  <p className="text-xs text-muted">
                    {r ? `${r} star${r === 1 ? "" : "s"}` : "Unrated"}
                  </p>
                  <p className="mt-1 text-lg tabular-nums text-fg">
                    {ratingAdjustedScore(base, r, weight).toFixed(1)} points
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="text-lg font-medium text-fg">Build a personal score</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="text-sm">
                  Video rating
                  <Input
                    className="mt-2 w-24"
                    type="number"
                    min={0}
                    max={5}
                    value={rating}
                    onChange={(e) =>
                      setRating(Math.max(0, Math.min(5, Math.round(Number(e.target.value) || 0))))
                    }
                  />
                </label>
                <label className="text-sm">
                  Watch points (0–12)
                  <Input
                    className="mt-2 w-32"
                    type="number"
                    min={0}
                    max={12}
                    value={watch}
                    onChange={(e) =>
                      setWatch(Math.max(0, Math.min(12, Number(e.target.value) || 0)))
                    }
                  />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={favorite}
                    onChange={(e) => setFavorite(e.target.checked)}
                  />
                  Favorite
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={liked}
                    onChange={(e) => setLiked(e.target.checked)}
                  />
                  Liked
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {[["Topic affinity (0–12)", topics, setTopics, 12], ["Hearted tags (0–3)", tagHearts, setTagHearts, 3], ["Private marks", marks, setMarks, 1000000]].map(([label, value, update, max]) => <label key={String(label)} className="text-sm">{String(label)}<Input className="mt-2 w-36" type="number" min={0} max={Number(max)} value={Number(value)} onChange={event => (update as (n: number) => void)(Math.max(0, Math.min(Number(max), Number(event.target.value) || 0)))} /></label>)}
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={creatorLiked} onChange={event => setCreatorLiked(event.target.checked)} />Liked creator</label>
                <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={creatorFavorite} onChange={event => setCreatorFavorite(event.target.checked)} />Favorite creator</label>
              </div>
              <p aria-live="polite" className="mt-4 text-lg tabular-nums text-accent">
                {breakdown.base.toFixed(1)} evidence × {breakdown.multiplier.toFixed(2)}{" "}
                {breakdown.ratingPoints >= 0 ? "+" : "−"} {Math.abs(breakdown.ratingPoints)} then {" "}
                {breakdown.interestMultiplier.toFixed(2)}× interest = {breakdown.score.toFixed(1)} points
              </p>
              <p className="mt-2 text-xs text-muted">
                Baseline 10 · favorite {breakdown.parts.favorite} · like {breakdown.parts.like} ·
                watch {breakdown.parts.watch} · creator likes {breakdown.parts.creatorLike} · creator favorite {breakdown.parts.creatorFavorite} · topics {breakdown.parts.topics} · marks {breakdown.parts.marks.toFixed(1)}
              </p>
            </div>
          </div>
        )}
        {tab === 3 && <div className="space-y-4">
          <p className="text-sm leading-6 text-muted">Independent interest families multiply together, capped at {INTEREST_MULTIPLIERS.maximum}× before creator/provider balancing. Ratings remain separate. Private marks and viewing time saturate; simply opening a card does not count as sustained viewing.</p>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-muted"><th className="py-3 pr-3">Your signal</th><th className="py-3 pr-3">Maximum boost</th><th className="py-3">How it grows</th></tr></thead><tbody>
            {[["Liked video", INTEREST_MULTIPLIERS.liked, "Saved like"], ["Favorite video", INTEREST_MULTIPLIERS.favorite, "Saved favorite"], ["Useful topics", INTEREST_MULTIPLIERS.topics, "Confidence-adjusted positive feedback"], ["Hearted tags", INTEREST_MULTIPLIERS.tagHearts, "Up to 3 distinct interests"], ["Liked channel", INTEREST_MULTIPLIERS.creatorLiked, "Creator like"], ["Favorite channel", INTEREST_MULTIPLIERS.creatorFavorite, "Separate creator favorite"], ["I cummed / private marks", INTEREST_MULTIPLIERS.marks, "Logarithmic; full multiplier at 7 marks"], ["Interaction time", INTEREST_MULTIPLIERS.watch, "Saved preview/playback time; capped at 12 watch points"]].map(([label, multiplier, detail]) => <tr key={String(label)} className="border-b border-border"><td className="py-3 pr-3">{label}</td><td className="py-3 pr-3 tabular-nums">{Number(multiplier).toFixed(2)}×</td><td className="py-3 text-muted">{detail}</td></tr>)}
          </tbody></table></div>
          <p className="text-sm leading-6 text-muted">A negative score divides by the boost, so positive feedback cannot make a penalty worse. Duplicate keywords and provider/creator labels do not add topic votes. Video likes, favorites, stars, private marks and watch time also teach related-topic preferences.</p>
        </div>}
        {tab === 2 && (
          <div className="space-y-5">
            {Object.entries(pages).map(([desk, rows]) => (
              <div key={desk}>
                <h3 className="text-lg font-medium text-fg">
                  {desk === "Other" ? "Preview, search and saved tabs" : desk}
                </h3>
                <dl className="mt-3 space-y-3">
                  {rows.map(([title, detail]) => (
                    <div key={title}>
                      <dt className="text-sm font-medium text-fg">{title}</dt>
                      <dd className="mt-1 text-sm leading-6 text-muted">{detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
