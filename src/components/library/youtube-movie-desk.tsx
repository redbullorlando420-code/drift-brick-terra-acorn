import { useEffect, useRef, useState } from "react";
import { ExternalLink, Film, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discoverYoutubeMovies } from "@/lib/remote/youtube-movie-functions";
import {
  MOVIE_REGIONS,
  movieWatchUrl,
  type MoviePage,
  type MovieRequest,
  type MovieRegion,
  type YoutubeMovie,
} from "@/lib/remote/youtube-movies";
import { movieWatchlist, updateMovieWatchlist } from "@/lib/movie-watchlist";
import { useReviewedDocument } from "./use-reviewed-document";

type Result = { request: MovieRequest; page: MoviePage };
const external =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-fg hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent";
export function YoutubeMovieDesk() {
  const saved = useReviewedDocument(movieWatchlist);
  const [tab, setTab] = useState<"catalog" | "search" | "saved">("catalog"),
    [region, setRegion] = useState<MovieRegion>("US"),
    [query, setQuery] = useState("");
  const [result, setResult] = useState<Result>(),
    [previous, setPrevious] = useState<Result[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all"),
    [savedQuery, setSavedQuery] = useState(""),
    [visible, setVisible] = useState(24),
    [last, setLast] = useState<MovieRequest>();
  const request = useRef<AbortController | null>(null),
    generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      request.current?.abort();
    },
    [],
  );
  const cancel = () => {
    generation.current++;
    request.current?.abort();
    request.current = null;
    setBusy(false);
  };
  const load = async (input: MovieRequest, appendHistory = false) => {
    cancel();
    const id = generation.current,
      controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setLast(input);
    setNotice("");
    try {
      const page = await discoverYoutubeMovies({ data: input, signal: controller.signal });
      if (id !== generation.current) return;
      if (!page || !Array.isArray(page.movies) || !Array.isArray(page.shelves))
        throw Error("YouTube returned an unreadable movie page. Try again.");
      setPrevious((rows) => (appendHistory && result ? [...rows, result].slice(-5) : []));
      setResult({ request: input, page });
      setVisible(24);
      setFilter("all");
    } catch (e) {
      if (id === generation.current)
        setError(e instanceof Error ? e.message : "Could not load YouTube Movies. Try again.");
    } finally {
      if (id === generation.current) {
        setBusy(false);
        request.current = null;
      }
    }
  };
  const switchTab = (next: typeof tab) => {
    cancel();
    setTab(next);
    setError("");
    setNotice("");
    setVisible(24);
    setFilter("all");
  };
  const changeSaved = (movie: YoutubeMovie, action: "save" | "remove" | "watched") => {
    try {
      movieWatchlist.write(updateMovieWatchlist(saved.data, movie, action));
      setNotice(
        action === "save"
          ? "Movie saved to this profile."
          : action === "remove"
            ? "Movie removed. Undo is available."
            : "Manual watch status saved.",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save. Your shelf was kept.");
    }
  };
  const exportSaved = () => {
    const text = [
      "YouTube movie shelf · official watch links",
      "Offer labels are observations, not playback entitlements.",
      "",
      ...saved.data.movies.flatMap((m) => [
        m.title + (m.year ? " (" + m.year + ")" : ""),
        m.offer + " · " + m.region + " · observed " + new Date(m.observedAt).toISOString(),
        movieWatchUrl(m.id),
        m.watchedAt !== undefined ? "Manually marked watched" : "Not marked watched",
        "",
      ]),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "youtube-movie-shelf.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const active = tab !== "saved" && result?.request.mode === tab ? result : undefined;
  const source =
    tab === "saved"
      ? saved.data.movies.filter((m) => m.title.toLowerCase().includes(savedQuery.toLowerCase()))
      : (active?.page.movies ?? []);
  const movies = source.filter(
    (m) =>
      filter === "all" ||
      (filter === "free"
        ? /free.*ads|free with/i.test(m.offer)
        : filter === "unwatched"
          ? saved.data.movies.find((s) => s.id === m.id)?.watchedAt === undefined
          : filter === "feature"
            ? (m.seconds ?? 0) >= 2400
            : !!m.seconds && m.seconds < 2400),
  );
  return (
    <section
      className="mb-5 rounded-xl border border-border bg-surface p-4 sm:p-6"
      aria-label="YouTube movie discovery"
      data-youtube-movies
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Beyond your library</p>
          <h2 className="mt-2 flex items-center gap-2 font-display text-2xl text-fg">
            <Film className="size-5" />
            YouTube Movies
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Discover actual films from YouTube’s movie catalog. Save a shortlist here, then watch
            through the official YouTube page.
          </p>
        </div>
        <a
          className={external}
          href="https://www.youtube.com/movies"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube catalog <ExternalLink className="size-4" />
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Movie discovery sections">
        {(
          [
            ["catalog", "Browse movies"],
            ["search", "Search films"],
            ["saved", "Saved movies · " + saved.data.movies.length],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            className="min-h-11"
            variant={tab === value ? "default" : "secondary"}
            aria-pressed={tab === value}
            onClick={() => switchTab(value)}
          >
            {value === "saved" && <Bookmark className="size-4" />}
            {label}
          </Button>
        ))}
      </div>
      {tab !== "saved" ? (
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load({ mode: tab, region, query: tab === "search" ? query : "" });
          }}
        >
          <label className="text-xs text-muted">
            Catalog region
            <select
              aria-label="Movie catalog region"
              className="mt-1 block min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"
              value={region}
              onChange={(e) => {
                cancel();
                setRegion(e.target.value as MovieRegion);
              }}
            >
              {MOVIE_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {
                    {
                      US: "United States",
                      GB: "United Kingdom",
                      AU: "Australia",
                      DE: "Germany",
                      JP: "Japan",
                    }[r]
                  }
                </option>
              ))}
            </select>
          </label>
          {tab === "search" && (
            <label className="min-w-0 flex-1 text-xs text-muted">
              Film title
              <Input
                className="mt-1 min-h-11"
                aria-label="YouTube film title"
                placeholder="Search for a film, e.g. Dune"
                maxLength={120}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          )}
          <Button
            type="submit"
            className="min-h-11"
            disabled={busy || (tab === "search" && !query.trim())}
          >
            {busy ? "Loading movies…" : tab === "search" ? "Find films" : "Load YouTube Movies"}
          </Button>
          {busy && (
            <Button type="button" variant="secondary" className="min-h-11" onClick={cancel}>
              Cancel movie request
            </Button>
          )}
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            aria-label="Search saved movies"
            className="min-h-11 min-w-0 flex-1"
            placeholder="Find a saved film"
            value={savedQuery}
            onChange={(e) => {
              setSavedQuery(e.target.value);
              setVisible(24);
            }}
          />
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => {
              movieWatchlist.reload();
              setNotice("");
            }}
          >
            Reload saved movies
          </Button>
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={exportSaved}
            disabled={!saved.data.movies.length}
          >
            Export movie shelf
          </Button>
          {saved.data.undo && (
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!saved.error}
              onClick={() => {
                try {
                  movieWatchlist.write({ version: 1, movies: saved.data.undo! });
                  setNotice("Movie shelf restored.");
                } catch (e) {
                  setNotice(String(e));
                }
              }}
            >
              Undo shelf change
            </Button>
          )}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-muted">
        Free, rental, purchase and subscription offers depend on your location and YouTube account.
        Offer labels reflect the last check; opening a film never marks it watched. Purchases and
        protected playback stay on YouTube.{" "}
        <a
          href="https://www.youtube.com/purchases"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Your purchases
        </a>{" "}
        ·{" "}
        <a
          href="https://support.google.com/youtube/answer/16618963?hl=en"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Availability guide
        </a>
      </p>
      {saved.error && (
        <div role="alert" className="mt-3 text-sm text-fg">
          {saved.error}
          {tab !== "saved" && (
            <Button
              variant="secondary"
              className="ml-2 min-h-11"
              onClick={() => movieWatchlist.reload()}
            >
              Reload saved movies
            </Button>
          )}
        </div>
      )}
      {error && (
        <div role="alert" className="mt-3 rounded-lg border border-border p-3 text-sm text-fg">
          {error}
          {last && (
            <Button
              className="ml-2 min-h-11"
              variant="secondary"
              onClick={() => void load(last, !!last.page)}
            >
              Retry movie request
            </Button>
          )}
        </div>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm text-accent">
          {notice}
        </p>
      )}
      {busy && (
        <p role="status" className="mt-3 text-sm text-muted">
          Checking public movie listings. Previous results stay available below.
        </p>
      )}
      {active && (
        <p className="mt-4 text-sm text-muted" role="status">
          {active.page.movies.length} film listings · {active.request.region}
          {active.request.mode === "search" ? " · “" + active.request.query + "”" : ""} · checked{" "}
          {new Date(active.page.observedAt).toLocaleString()}. Movie cards supplied by YouTube;
          account playback has not been checked.
        </p>
      )}
      {(active || tab === "saved") && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted">
              Show
              <select
                aria-label="Filter YouTube movies"
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setVisible(24);
                }}
                className="ml-2 min-h-11 max-w-full rounded-md border border-border bg-bg px-2 text-sm text-fg"
              >
                <option value="all">All films</option>
                <option value="free">Labeled free with ads</option>
                <option value="feature">Feature length · 40m+</option>
                <option value="short">Short films · 10–40m</option>
                {tab === "saved" && <option value="unwatched">Not marked watched</option>}
              </select>
            </label>
            <span className="text-xs text-muted">
              {movies.length} matches on this {tab === "saved" ? "saved shelf" : "provider page"}
            </span>
          </div>
          {!movies.length && (
            <p className="mt-4 rounded-lg bg-bg p-4 text-sm text-muted">
              {tab === "saved"
                ? "No saved movies match. Browse or search films and choose Save movie."
                : "No dedicated film cards match this page. Try another title, shelf or filter, or open the YouTube catalog. Ordinary videos and TV series are excluded."}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {movies.slice(0, visible).map((m) => {
              const entry = saved.data.movies.find((s) => s.id === m.id);
              return (
                <article
                  key={m.id}
                  data-youtube-movie={m.id}
                  className="min-w-0 overflow-hidden rounded-lg border border-border bg-bg/50"
                >
                  <MoviePoster movie={m} />
                  <div className="p-3">
                    <h3 className="break-words font-medium text-fg">{m.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {m.metadata || "Release metadata unavailable"}
                      {m.rating ? " · " + m.rating : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {m.seconds
                        ? Math.floor(m.seconds / 3600) +
                          ":" +
                          String(Math.floor(m.seconds / 60) % 60).padStart(2, "0") +
                          ":" +
                          String(m.seconds % 60).padStart(2, "0")
                        : "Runtime unavailable"}
                    </p>
                    <p className="mt-2 inline-block rounded bg-elevated px-2 py-1 text-xs text-accent">
                      {m.offer}
                    </p>
                    {m.description && (
                      <details className="mt-2 text-xs leading-5 text-muted">
                        <summary className="min-h-11 cursor-pointer py-3">Film details</summary>
                        <p>{m.description}</p>
                      </details>
                    )}
                    <div className="mt-3 flex flex-col gap-2">
                      <a
                        className={external}
                        href={movieWatchUrl(m.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open on YouTube <ExternalLink className="size-4 shrink-0" />
                      </a>
                      <Button
                        variant="secondary"
                        className="min-h-11 whitespace-normal"
                        disabled={!saved.ready || !!saved.error}
                        onClick={() => changeSaved(m, entry ? "remove" : "save")}
                      >
                        {entry ? "Remove saved movie" : "Save movie"}
                      </Button>
                      {tab === "saved" && (
                        <Button
                          variant="ghost"
                          className="min-h-11 whitespace-normal"
                          disabled={!saved.ready || !!saved.error}
                          onClick={() => changeSaved(m, "watched")}
                        >
                          {entry?.watchedAt !== undefined
                            ? "Undo watched mark"
                            : "Mark watched manually"}
                        </Button>
                      )}
                    </div>
                    {entry?.watchedAt !== undefined && (
                      <p className="mt-2 text-xs text-muted">Manually marked watched</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          {movies.length > visible && (
            <Button
              className="mt-4 min-h-11"
              variant="secondary"
              onClick={() => setVisible((n) => n + 24)}
            >
              Show more films on this page
            </Button>
          )}
        </>
      )}
      {active && (
        <div className="mt-4 flex flex-wrap gap-2">
          {previous.length > 0 && (
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={busy}
              onClick={() => {
                cancel();
                setResult(previous[previous.length - 1]);
                setPrevious((rows) => rows.slice(0, -1));
                setVisible(24);
                setFilter("all");
                setError("");
              }}
            >
              Previous movie page
            </Button>
          )}
          {active.page.next && (
            <Button
              className="min-h-11"
              disabled={busy}
              onClick={() => void load({ ...active.request, page: active.page.next! }, true)}
            >
              Next movie page
            </Button>
          )}
          {active.page.shelves.map((s) => (
            <Button
              key={s.page}
              variant="secondary"
              className="min-h-11"
              disabled={busy}
              onClick={() => void load({ ...active.request, page: s.page }, true)}
            >
              More: {s.title}
            </Button>
          ))}
        </div>
      )}
      {!active && tab !== "saved" && !busy && (
        <p className="mt-4 text-sm text-muted">
          {tab === "search"
            ? "Search uses YouTube’s Movies filter. Only dedicated film results appear."
            : "Load the current catalog when you want new films. There is no background movie polling."}
        </p>
      )}
    </section>
  );
}
function MoviePoster({ movie }: { movie: YoutubeMovie }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative flex aspect-[2/3] items-center justify-center bg-elevated text-muted">
      {movie.poster && !failed ? (
        <img
          src={movie.poster}
          alt={movie.title + " poster"}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="p-4 text-center">
          <Film className="mx-auto size-8" />
          <p className="mt-2 text-xs">Poster unavailable</p>
          {movie.poster && (
            <Button variant="ghost" className="mt-2 min-h-11" onClick={() => setFailed(false)}>
              Retry poster
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
