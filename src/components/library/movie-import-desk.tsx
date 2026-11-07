import { createLocalId } from "@/lib/local-id";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { catalogTurn } from "@/lib/catalog-turn";
import { useLibrary } from "@/lib/videos/store";
import { changeFilmReviews, changeFilmReviewsDurably } from "@/lib/film-review-store";
import {
  FILM_FIELDS,
  previewFilmFields,
  undoFilmReview,
  type FilmField,
} from "@/lib/videos/film-review";
import {
  MOVIE_IMPORT_BYTES,
  readMovieImportText,
  previewMovieImport,
  applyMovieEvidence,
  type MovieImport,
  type MovieImportPreview,
} from "@/lib/videos/movie-import";
import {
  movieCollections,
  applyMovieCollection,
  undoMovieCollection,
} from "@/lib/movie-collections";
import type { MovieCatalog } from "@/lib/videos/movie-catalog";
import { useFilmReviews } from "./use-film-reviews";
import { useReviewedDocument } from "./use-reviewed-document";
const selectClass =
  "min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg";
function download(value: unknown, name: string) {
  const url = URL.createObjectURL(
      new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function MovieImportDesk({ catalog, pending }: { catalog: MovieCatalog; pending: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      data-movie-import
      className="mb-5 rounded-lg border border-border bg-surface p-4"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
        Import movie metadata or collections
      </summary>
      {open && <MovieImportWorkflow catalog={catalog} pending={pending} />}
    </details>
  );
}
function MovieImportWorkflow({ catalog, pending }: { catalog: MovieCatalog; pending: boolean }) {
  const films = useFilmReviews(),
    collections = useReviewedDocument(movieCollections),
    provenance = useLibrary((s) => s.metadataProvenance);
  const posterAttempt = useRef(0);
  const [posters, setPosters] = useState<
    Record<string, { url: string; loaded: boolean; failed: boolean; attempt: number }>
  >({});
  const [doc, setDoc] = useState<MovieImport>(),
    [rows, setRows] = useState<MovieImportPreview[]>([]),
    [choices, setChoices] = useState<Record<string, { key: string; fields: FilmField[] }>>({}),
    [target, setTarget] = useState(""),
    [name, setName] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [page, setPage] = useState(0);
  const scope = useMemo(
      () => ({ catalog, ledger: films.ledger, provenance }),
      [catalog, films.ledger, provenance],
    ),
    [previewScope, setPreviewScope] = useState<typeof scope>(),
    [locked, setLocked] = useState<Set<string>>(new Set()),
    request = useRef<AbortController | undefined>(undefined),
    operation = useRef(false),
    newId = useRef("");
  useEffect(() => () => request.current?.abort(), []);
  const fresh = previewScope === scope,
    selected = Object.keys(choices).length,
    offset = Math.min(page * 10, Math.max(0, Math.ceil(rows.length / 10) - 1) * 10);
  const invalidate = () => {
    request.current?.abort();
    setReviewed(false);
    setPosters({});
    setRows([]);
    setChoices({});
    setPreviewScope(undefined);
    setNotice("");
    setPage(0);
  };
  const preview = async () => {
    if (!doc || busy || pending || !films.ready) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setReviewed(false);
    try {
      const turn = catalogTurn(controller.signal),
        blocked = new Set<string>();
      for (let i = 0; i < catalog.videos.length; i++) {
        if (i % 256 === 0) await turn();
        const v = catalog.videos[i]!,
          id = films.ledger.versions[v.id]?.filmId;
        if (id && provenance[v.id]?.lockedFields?.includes("category")) blocked.add(id);
      }
      const result = await previewMovieImport(doc, films.ledger, catalog.videos, turn);
      if (controller.signal.aborted) return;
      setRows(result);
      setLocked(blocked);
      setChoices({});
      setPreviewScope(scope);
      setPage(0);
      setNotice("Preview only. No film fields, classification or collection membership changed.");
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Preview failed.");
    } finally {
      if (request.current === controller) setBusy(false);
    }
  };
  const apply = async () => {
    if (operation.current) return;
    operation.current = true;
    try {
      if (!doc || !fresh || !reviewed)
        throw Error("Preview the current catalog and confirm your selected matches first.");
      if (doc.format === "realhub-film-evidence") {
        if (
          rows.some(
            (p) =>
              choices[p.row.id]?.fields.includes("poster") &&
              (!posters[p.row.id]?.loaded || posters[p.row.id]?.url !== p.row.poster),
          )
        )
          throw Error("Preview every selected poster successfully before importing it.");
        setBusy(true);
        const changed = await changeFilmReviewsDurably(films.ledger, (l) =>
          applyMovieEvidence(l, doc, rows, choices, locked),
        );
        setNotice(
          changed
            ? "Reviewed metadata saved with an import receipt and one reversible film change."
            : "No unlocked fields changed; the import was already applied or fields are locked.",
        );
      } else {
        const id = target || (newId.current ||= createLocalId("collection:")),
          next = applyMovieCollection(
            collections.data,
            doc,
            rows,
            Object.fromEntries(Object.entries(choices).map(([id, c]) => [id, c.key])),
            id,
            name,
          );
        movieCollections.write(next);
        setTarget(id);
        setNotice(
          "Reviewed collection saved. Film eligibility, tags, source records and playback history were retained.",
        );
      }
      setReviewed(false);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  const template = (format: MovieImport["format"]) =>
    download(
      {
        format,
        version: 1,
        name: format === "realhub-film-evidence" ? "Movie metadata review" : "My movie collection",
        source: "Owner-selected file; verify its source",
        rows: [
          {
            id: "example-1",
            title: "Example film",
            year: 2000,
            ...(format === "realhub-film-evidence" ? { genre: "Drama" } : {}),
          },
        ],
      },
      format + ".json",
    );
  return (
    <section aria-label="Movie import review" className="mt-3 text-fg">
      <p className="text-sm leading-6 text-muted">
        Choose a JSON file, preview exact and ambiguous matches, then explicitly accept rows.
        Metadata enriches existing owner-reviewed films; collection files select only titles already
        eligible for Movies. Unmatched titles stay unclassified. Files never start provider
        requests.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => template("realhub-film-evidence")}>
          Download metadata template
        </Button>
        <Button variant="secondary" onClick={() => template("realhub-movie-collection")}>
          Download collection template
        </Button>
      </div>
      <label className="mt-3 block text-sm">
        Movie import JSON
        <input
          aria-label="Movie import JSON"
          type="file"
          accept=".json,application/json"
          disabled={busy}
          className="mt-2 block min-h-11 w-full min-w-0 text-sm"
          onChange={async (e) => {
            const file = e.currentTarget.files?.[0];
            invalidate();
            setDoc(undefined);
            setError("");
            if (!file) return;
            const controller = new AbortController();
            request.current = controller;
            try {
              if (file.size > MOVIE_IMPORT_BYTES)
                throw Error("Choose a movie import smaller than 128 KB.");
              const parsed = readMovieImportText(await file.text());
              if (controller.signal.aborted) return;
              setDoc(parsed);
              setName(parsed.name);
              setTarget("");
              newId.current = "";
            } catch (err) {
              if (!controller.signal.aborted)
                setError(err instanceof Error ? err.message : "Invalid movie file.");
            }
          }}
        />
      </label>
      {doc && (
        <>
          <p className="mt-2 text-sm">
            {doc.name} · {doc.rows.length} rows ·{" "}
            {doc.format === "realhub-film-evidence" ? "Metadata evidence" : "Collection membership"}
          </p>
          <p className="mt-1 break-words text-xs text-muted">
            Declared source: {doc.source}. This is file provenance, not an external verification.
            Optional IMDb/TMDB identifiers are recorded as declarations, never guessed or fetched.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={pending || busy || !films.ready || films.status === "pending"}
              onClick={() => void preview()}
            >
              {busy ? "Working…" : "Preview movie import"}
            </Button>
            <Button
              variant="secondary"
              disabled={!busy || operation.current}
              onClick={() => {
                request.current?.abort();
                setBusy(false);
                setNotice("Preview cancelled; nothing was changed.");
              }}
            >
              Cancel preview
            </Button>
          </div>
        </>
      )}
      {rows.length > 0 && (
        <>
          <p role="status" className="mt-3 text-sm">
            {rows.filter((r) => r.state === "exact").length} exact ·{" "}
            {rows.filter((r) => r.state === "ambiguous").length} ambiguous ·{" "}
            {rows.filter((r) => r.state === "unmatched").length} unmatched. {selected} selected.
          </p>
          {!fresh && (
            <p className="mt-2 text-sm text-accent">
              The catalog or film reviews changed. Preview again before applying.
            </p>
          )}
          <div className="mt-3 space-y-3">
            {rows.slice(offset, offset + 10).map((p) => {
              const c = choices[p.row.id],
                match = p.matches.find((m) => m.key === c?.key),
                film = match?.filmId ? films.ledger.films[match.filmId] : undefined;
              return (
                <article
                  data-movie-import-row={p.row.id}
                  key={p.row.id}
                  className="min-w-0 rounded-md border border-border p-3"
                >
                  <h4 className="break-words text-sm font-medium">
                    {p.row.title}
                    {p.row.year ? " (" + p.row.year + ")" : ""}
                  </h4>
                  <p className="mt-1 text-xs text-muted">
                    {p.state}
                    {p.truncated
                      ? " · more matches exist; refine the file with an exact film/source ID"
                      : ""}
                    {p.row.identifier ? " · declared " + p.row.identifier : ""}
                  </p>
                  <label className="mt-2 block text-xs text-muted">
                    Reviewed match
                    <select
                      aria-label={"Movie match " + p.row.id}
                      className={selectClass}
                      value={c?.key ?? ""}
                      disabled={!fresh || busy}
                      onChange={(e) => {
                        const key = e.target.value,
                          m = p.matches.find((m) => m.key === key),
                          f = m?.filmId ? films.ledger.films[m.filmId] : undefined,
                          fields = f
                            ? previewFilmFields(
                                f,
                                p.row,
                                FILM_FIELDS.filter((k) => p.row[k] !== undefined),
                                locked.has(f.id),
                              )
                                .filter((r) => r.state === "ready" && r.field !== "poster")
                                .map((r) => r.field)
                            : [];
                        setChoices((prev) => {
                          const next = { ...prev };
                          if (key) next[p.row.id] = { key, fields };
                          else delete next[p.row.id];
                          return next;
                        });
                        setReviewed(false);
                      }}
                    >
                      <option value="">Skip / reject this row</option>
                      {p.matches.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.title} ({m.year ?? "year unknown"}) ·{" "}
                          {m.filmId ? "reviewed film" : "eligible movie source"}
                        </option>
                      ))}
                    </select>
                  </label>
                  {p.state === "unmatched" && (
                    <p className="mt-2 text-xs text-muted">
                      No eligible match. Review a complete film’s identity in the film desk first,
                      or refine the title/year. Trailers, lectures and unavailable/private sources
                      cannot be promoted by this import.
                    </p>
                  )}
                  {film && p.row.poster && doc?.format === "realhub-film-evidence" && (
                    <div className="mt-3">
                      <Button
                        variant="secondary"
                        disabled={!fresh || busy || posters[p.row.id]?.loaded}
                        onClick={() => {
                          const attempt = ++posterAttempt.current;
                          setPosters((v) => ({
                            ...v,
                            [p.row.id]: {
                              url: p.row.poster!,
                              loaded: false,
                              failed: false,
                              attempt,
                            },
                          }));
                        }}
                      >
                        Preview imported poster {p.row.id}
                      </Button>
                      {posters[p.row.id] && (
                        <img
                          key={posters[p.row.id]!.url + ":" + posters[p.row.id]!.attempt}
                          alt={"Imported poster preview " + p.row.title}
                          src={posters[p.row.id]!.url}
                          referrerPolicy="no-referrer"
                          className="mt-2 max-h-48 max-w-full object-contain"
                          onLoad={() =>
                            setPosters((v) =>
                              v[p.row.id]?.url === p.row.poster &&
                              v[p.row.id]?.attempt === posters[p.row.id]?.attempt
                                ? {
                                    ...v,
                                    [p.row.id]: { ...v[p.row.id]!, loaded: true, failed: false },
                                  }
                                : v,
                            )
                          }
                          onError={() =>
                            setPosters((v) =>
                              v[p.row.id]?.url === p.row.poster &&
                              v[p.row.id]?.attempt === posters[p.row.id]?.attempt
                                ? {
                                    ...v,
                                    [p.row.id]: { ...v[p.row.id]!, loaded: false, failed: true },
                                  }
                                : v,
                            )
                          }
                        />
                      )}
                      <p className="mt-2 text-xs text-muted">
                        {posters[p.row.id]?.failed
                          ? "Poster preview failed. Its field cannot replace the saved artwork."
                          : posters[p.row.id]?.loaded
                            ? "Poster preview loaded. Select its field to include it."
                            : "Load the poster preview before selecting its field. This explicit action contacts the declared image host."}
                      </p>
                    </div>
                  )}
                  {film && doc?.format === "realhub-film-evidence" && (
                    <div className="mt-2 space-y-2">
                      {previewFilmFields(
                        film,
                        p.row,
                        FILM_FIELDS.filter((k) => p.row[k] !== undefined),
                        locked.has(film.id),
                      ).map((f) => (
                        <label
                          key={f.field}
                          className="flex min-h-11 items-center gap-2 break-words text-xs"
                        >
                          <input
                            type="checkbox"
                            aria-label={"Import " + p.row.id + " " + f.field}
                            checked={c?.fields.includes(f.field) ?? false}
                            disabled={
                              !fresh ||
                              busy ||
                              f.state === "locked" ||
                              f.state === "invalid" ||
                              (f.field === "poster" &&
                                (!posters[p.row.id]?.loaded ||
                                  posters[p.row.id]?.url !== p.row.poster))
                            }
                            onChange={(e) => {
                              setChoices((v) => ({
                                ...v,
                                [p.row.id]: {
                                  key: c!.key,
                                  fields: e.target.checked
                                    ? [...c!.fields, f.field]
                                    : c!.fields.filter((k) => k !== f.field),
                                },
                              }));
                              setReviewed(false);
                            }}
                          />
                          <span className="min-w-0 break-words">
                            {f.field}: {String(f.before) || "empty"} → {String(f.after) || "empty"}{" "}
                            · {f.state}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {rows.length > 10 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={!offset || busy}
                onClick={() => setPage(offset / 10 - 1)}
              >
                Previous import rows
              </Button>
              <Button
                variant="secondary"
                disabled={offset + 10 >= rows.length || busy}
                onClick={() => setPage(offset / 10 + 1)}
              >
                Next import rows
              </Button>
            </div>
          )}
          {doc?.format === "realhub-movie-collection" && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs">
                Destination collection
                <select
                  className={selectClass}
                  aria-label="Destination movie collection"
                  value={target}
                  onChange={(e) => {
                    setTarget(e.target.value);
                    setName(
                      collections.data.collections.find((c) => c.id === e.target.value)?.name ??
                        doc.name,
                    );
                    setReviewed(false);
                  }}
                >
                  <option value="">Create a new collection</option>
                  {collections.data.collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs">
                Collection name
                <Input
                  aria-label="Imported movie collection name"
                  value={name}
                  maxLength={100}
                  onChange={(e) => {
                    setName(e.target.value);
                    setReviewed(false);
                  }}
                />
              </label>
            </div>
          )}
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              aria-label="I reviewed the movie import matches and fields"
              checked={reviewed}
              disabled={!fresh || busy}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I reviewed these matches and selected fields. Skipped rows stay rejected in the
            collection receipt.
          </label>
          <Button
            className="mt-2"
            disabled={
              !fresh ||
              !selected ||
              !reviewed ||
              busy ||
              !collections.ready ||
              Boolean(collections.error) ||
              (doc?.format === "realhub-film-evidence" && selected > 8)
            }
            onClick={() => void apply()}
          >
            Apply reviewed movie import
          </Button>
          {doc?.format === "realhub-film-evidence" && selected > 8 && (
            <p className="mt-2 text-xs text-muted">
              Apply at most eight distinct reviewed films at a time.
            </p>
          )}
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {films.ledger.importReceipt && (
          <Button
            variant="secondary"
            disabled={
              films.ledger.action !== "Applied reviewed movie metadata import" ||
              films.status === "pending" ||
              busy
            }
            onClick={() => {
              try {
                changeFilmReviews(undoFilmReview);
                setNotice(
                  "Last metadata import undone; original source records and personal tags were retained.",
                );
                setError("");
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Undo metadata import
          </Button>
        )}
        {collections.data.undo && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => {
              try {
                movieCollections.write(undoMovieCollection(collections.data));
                setNotice("Collection membership restored; film classification was unchanged.");
                setError("");
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Undo collection import
          </Button>
        )}
        <Button variant="secondary" disabled={busy} onClick={() => {movieCollections.reload();setError('');setNotice('Saved movie collections reloaded.');}}>
          Reload movie collections
        </Button>
      </div>
      {films.ledger.importReceipt && (
        <p className="mt-2 break-words text-xs text-muted">
          Last metadata import: {films.ledger.importReceipt.name} ·{" "}
          {films.ledger.importReceipt.source} · {films.ledger.importReceipt.rows.length} changed
          films. Source fields:{" "}
          {films.ledger.importReceipt.rows.map((r) => r.fields.length?r.fields.join(", "):"reviewed identifier").join("; ")}. Undo applies
          only while it is the latest film review change.
        </p>
      )}
      {collections.data.review && (
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer text-xs content-center">
            Last collection review receipt
          </summary>
          <p className="text-xs text-muted">
            {collections.data.review.source} ·{" "}
            {collections.data.review.rows.filter((r) => r.decision === "included").length} included
            · {collections.data.review.rows.filter((r) => r.decision === "rejected").length}{" "}
            rejected
          </p>
          <ul className="max-h-48 overflow-y-auto text-xs text-muted">
            {collections.data.review.rows.map((r) => (
              <li className="py-1" key={r.id}>
                {r.title} · {r.decision}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p role="status" className="mt-3 text-sm text-muted">
        {notice}
      </p>
      {(error || collections.error) && (
        <p role="alert" className="mt-2 break-words text-sm text-danger">
          {error || collections.error}
        </p>
      )}
    </section>
  );
}
