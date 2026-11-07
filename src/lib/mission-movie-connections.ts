import type { Mission } from "./mission-plan";
/** Explicitly requested movie work; append without renumbering the fixed 200-task roadmap. */
export const MOVIE_CONNECTION_MISSIONS: Mission[] = [
  {
    id: "movie-connect-01",
    title: "Connect the public YouTube Movies catalog",
    done: true,
    status: "complete",
    detail:
      "Browse dedicated YouTube film listings inside Movies with provider runtime, release metadata, offer labels, region, observation time, movie-only shelves and bounded on-demand paging.",
    brief: {
      track: "Movie connections",
      priority: "P1",
      dependsOn: [],
      files: [
        "src/lib/remote/youtube-movie-functions.ts",
        "src/lib/remote/youtube-movies.ts",
        "src/components/library/youtube-movie-desk.tsx",
      ],
      steps: [
        "Use the existing YouTube transport and request budgets to fetch the public movie storefront only after an explicit owner action.",
        "Project dedicated film cards, exclude TV and ordinary videos, retain unknown runtime/offer evidence, and bind opaque page handles to the selected region and query.",
        "Bound result pages, shared cache and concurrent requests; keep prior results on errors, release stale requests, and provide official provider fallback links.",
      ],
      acceptance: [
        "Live anonymous catalog and shelf browsing return film cards with source observations; mock TV, ads, duplicate and ordinary-video cards never become confirmed films.",
        "Desktop/mobile navigation, bounded paging, cancellation and request failure recovery pass without background polling, hidden players or original library mutations.",
      ],
      external:
        "YouTube may change its public catalog format. Offers and protected playback remain subject to location, account and provider availability.",
    },
  },
  {
    id: "movie-connect-02",
    title: "Search YouTube for actual film listings",
    done: true,
    status: "complete",
    detail:
      "Search titles using YouTube’s Movies filter, retain dedicated movie evidence, show poster/details/runtime and distinguish unknown offers from free or paid availability.",
    brief: {
      track: "Movie connections",
      priority: "P1",
      dependsOn: ["movie-connect-01"],
      files: [
        "src/lib/remote/youtube-movies.ts",
        "src/components/library/youtube-movie-desk.tsx",
        "scripts/youtube-movies-browser-check.mjs",
      ],
      steps: [
        "Submit a bounded film-title query through the current public Movies search filter, with region and page handles validated independently of URLs.",
        "Retain only dedicated movie renderers and provider release/rating/offer evidence; avoid promoting trailers, reviews or long videos based on title or duration alone.",
        "Show lazy posters, details, length/offer filters, explicit empty/error states and stale-request cancellation while preserving existing collection search.",
      ],
      acceptance: [
        "A real title search returns dedicated film cards through the running application; provider fixtures verify runtime, year, rating, offer and source exclusions.",
        "Desktop/mobile title search, previous/next pages, filters and cancellation preserve the selected query evidence without false watched marks or console errors.",
      ],
      external:
        "Film metadata is a public provider observation, not independent verification, a streaming entitlement or guaranteed regional availability.",
    },
  },
  {
    id: "movie-connect-03",
    title: "Keep a profile-local movie shortlist with official playback",
    done: true,
    status: "complete",
    detail:
      "Save film observations in the current local profile, filter and export the shortlist, manually mark watched and undo changes after reload. Open official YouTube pages without claiming in-app rental playback.",
    brief: {
      track: "Movie connections",
      priority: "P1",
      dependsOn: ["movie-connect-01", "movie-connect-02"],
      files: [
        "src/lib/movie-watchlist.ts",
        "src/components/library/youtube-movie-desk.tsx",
        "src/lib/movie-watchlist.test.ts",
      ],
      steps: [
        "Persist a bounded validated movie document through the existing profile storage adapter, requiring successful conflict-checked writes before publishing changes.",
        "Provide save/remove, saved-title search, manual watched toggles, a reload-safe inverse and plain-text export with canonical provider watch links.",
        "Open the official watch page separately, preserve original media playback history and library classification, and clearly label location/account/offer limitations.",
      ],
      acceptance: [
        "Reload, undo, explicit watched marks and export preserve saved metadata, while quota failures, conflicting edits and future schemas retain prior saved data.",
        "Disposable alternate profiles cannot read the original shortlist; opening a provider link never marks a film watched and no protected player is mounted.",
      ],
      external:
        "Shortlists remain local profile tool documents. Purchasing, signing in and protected film playback happen on YouTube; legacy library ZIP restore does not carry this tool document.",
    },
  },
];
