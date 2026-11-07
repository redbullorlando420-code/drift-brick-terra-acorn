import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Bookmark, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { defaultSearchDates, type SearchDateFilter } from "@/lib/videos/search-dates";
import {
  createSearchWorkspaceStore,
  reorderWorkspace,
  type SearchWorkspace,
  type SearchWorkspaces,
} from "@/lib/search-workspaces";
import {
  emptySearchQuery,
  encodeSearchQuery,
  parseSearchQuery,
  queryChips,
  removeQueryChip,
  validateSearchQuery,
  type SearchQuery,
} from "@/lib/videos/search-query";

const privateDesk = (source: string) => source === "adults" || source === "adult-fetishes";
const selectClass =
  "min-h-11 w-full rounded-md border border-border bg-elevated px-3 text-sm text-fg";
function apply(query: SearchQuery, scope: "public" | "private") {
  const state = useLibrary.getState();
  if (scope === "private" && !state.adultsUnlocked)
    throw Error("Unlock Adults before opening a private search.");
  const encoded = encodeSearchQuery(query);
  if (!encoded) throw Error("Add search text or at least one filter.");
  // One synchronous owner transition clears eligibility before any old promise
  // can settle. Existing effects abort the worker and ranking jobs on change.
  state.setSource(scope === "private" ? "adults" : "home");
  state.setQuery(encoded);
}
export function SearchWorkspaceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="secondary"
        className="min-h-11"
        aria-label="Saved searches and filters"
        title="Saved searches and filters"
        onClick={() => setOpen(true)}
      >
        <Bookmark className="size-4" />
        <span className="hidden 2xl:inline">Saved searches</span>
      </Button>
      {open && <SearchWorkspaceEditor onClose={() => setOpen(false)} />}
    </>
  );
}
function SearchWorkspaceEditor({ onClose }: { onClose(): void }) {
  const owner = useMemo(() => createSearchWorkspaceStore(), []);
  const adultsUnlocked = useLibrary((state) => state.adultsUnlocked);
  const current = useLibrary.getState(),
    parsed = parseSearchQuery(current.query);
  const [query, setQuery] = useState<SearchQuery>(() => ({
    ...parsed.query,
    source:
      parsed.query.source === "all" && ["youtube", "twitch"].includes(current.sourceId)
        ? (current.sourceId as "youtube" | "twitch")
        : parsed.query.source,
  }));
  const [scope, setScope] = useState<"public" | "private">(
    privateDesk(current.sourceId) ? "private" : "public",
  );
  const [workspaces, setWorkspaces] = useState<SearchWorkspaces>({ version: 1, entries: [] });
  const [loaded, setLoaded] = useState(false),
    [error, setError] = useState(parsed.error ?? ""),
    [note, setNote] = useState("");
  const [name, setName] = useState(""),
    [selected, setSelected] = useState("");
  const [min, setMin] = useState(query.minSeconds === null ? "" : String(query.minSeconds / 60)),
    [max, setMax] = useState(query.maxSeconds === null ? "" : String(query.maxSeconds / 60));
  const [tag, setTag] = useState("");
  const reload = () => {
    try {
      setWorkspaces(owner.load());
      setLoaded(true);
      setError("");
    } catch (e) {
      setLoaded(false);
      setError(e instanceof Error ? e.message : "Saved searches unavailable.");
    }
  };
  useEffect(reload, [owner]);
  const patch = (value: Partial<SearchQuery>) => {
    setQuery((q) => ({ ...q, ...value }));
    setNote("");
  };
  const datePatch = (value: Partial<SearchDateFilter>) =>
    patch({ date: { ...(query.date ?? defaultSearchDates()), ...value } });
  const draft = () =>
    validateSearchQuery({
      ...query,
      minSeconds: min === "" ? null : Number(min) * 60,
      maxSeconds: max === "" ? null : Number(max) * 60,
    });
  const attempt = (work: () => void) => {
    try {
      setError("");
      work();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search could not be updated.");
    }
  };
  const write = (next: SearchWorkspaces, message: string) => {
    setWorkspaces(owner.save(next));
    setNote(message);
  };
  const choose = (row: SearchWorkspace) => {
    setSelected(row.id);
    setName(row.name);
    setScope(row.scope);
    setQuery(row.query);
    setMin(row.query.minSeconds === null ? "" : String(row.query.minSeconds / 60));
    setMax(row.query.maxSeconds === null ? "" : String(row.query.maxSeconds / 60));
    setNote("Loaded into the editor. Open search when ready.");
    setError("");
  };
  const chips = queryChips(query).filter((chip) => chip.key !== "duration");
  const visibleWorkspaces = workspaces.entries.filter(
    (row) => row.scope === scope && (scope !== "private" || adultsUnlocked),
  );
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-xl overflow-y-auto p-5 [&>button:last-child]:size-11"
        aria-describedby={undefined}
      >
        <SheetTitle className="pr-12">Search workspaces</SheetTitle>
        <p className="text-sm leading-6 text-muted">
          Named searches stay in this local profile. Filters search saved media; they do not pull
          new videos.
        </p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            attempt(() => {
              apply(draft(), scope);
              onClose();
            });
          }}
        >
          <label className="block space-y-2 text-sm text-fg">
            Search text
            <Input
              aria-label="Workspace search text"
              maxLength={300}
              value={query.text}
              onChange={(e) => patch({ text: e.target.value })}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-fg">
              Search desk
              <select
                aria-label="Search desk"
                className={selectClass}
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value as typeof scope);
                  setSelected("");
                  setName("");
                  setQuery(emptySearchQuery());
                  setMin("");
                  setMax("");
                  setTag("");
                }}
              >
                <option value="public">Public library</option>
                <option value="private" disabled={!adultsUnlocked}>
                  Adults · private
                </option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-fg">
              Source
              <select
                aria-label="Search source"
                className={selectClass}
                value={query.source}
                onChange={(e) => patch({ source: e.target.value as SearchQuery["source"] })}
              >
                <option value="all">All sources in this desk</option>
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="local">Local files</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-fg">
              Minimum minutes
              <Input
                aria-label="Minimum minutes"
                type="number"
                min="0"
                max="10080"
                step="any"
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm text-fg">
              Maximum minutes
              <Input
                aria-label="Maximum minutes"
                type="number"
                min="0"
                max="10080"
                step="any"
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </label>
          </div>
          <label className="block space-y-2 text-sm text-fg">
            Exact category
            <Input
              aria-label="Exact search category"
              maxLength={80}
              value={query.category}
              onChange={(e) => patch({ category: e.target.value })}
            />
          </label>
          <div className="flex items-end gap-2">
            <label className="min-w-0 flex-1 space-y-2 text-sm text-fg">
              Exact tag
              <Input
                aria-label="Add search tag"
                maxLength={80}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    attempt(() => {
                      patch({
                        tags: validateSearchQuery({ ...query, tags: [...query.tags, tag] }).tags,
                      });
                      setTag("");
                    });
                  }
                }}
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11"
              onClick={() =>
                attempt(() => {
                  patch({
                    tags: validateSearchQuery({ ...query, tags: [...query.tags, tag] }).tags,
                  });
                  setTag("");
                })
              }
            >
              Add tag
            </Button>
          </div>
          <details className="rounded-lg border border-border p-3" aria-label="Date search filters">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-fg">
              Date filters · {query.date ? "active" : "optional"}
            </summary>
            <label className="flex min-h-11 items-center gap-2 text-sm text-fg">
              <input
                type="checkbox"
                aria-label="Use date filter"
                checked={Boolean(query.date)}
                onChange={(e) =>
                  patch({ date: e.target.checked ? defaultSearchDates() : undefined })
                }
              />
              Use a date filter
            </label>
            <fieldset disabled={!query.date} className="space-y-3 disabled:opacity-60">
              <legend className="sr-only">Publication and local import dates</legend>
              <label className="block space-y-2 text-sm text-fg">
                Date field
                <select
                  className={selectClass}
                  aria-label="Search date field"
                  value={query.date?.field ?? "published"}
                  onChange={(e) =>
                    datePatch({ field: e.target.value as SearchDateFilter["field"] })
                  }
                >
                  <option value="published">Evidenced publication date</option>
                  <option value="added">Added to library · local files</option>
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-fg">
                  From (inclusive)
                  <Input
                    type="date"
                    aria-label="Search date from"
                    value={query.date?.from ?? ""}
                    onChange={(e) => datePatch({ from: e.target.value })}
                  />
                </label>
                <label className="space-y-2 text-sm text-fg">
                  Through (inclusive)
                  <Input
                    type="date"
                    aria-label="Search date through"
                    value={query.date?.to ?? ""}
                    onChange={(e) => datePatch({ to: e.target.value })}
                  />
                </label>
              </div>
              <label className="block space-y-2 text-sm text-fg">
                Unknown dates
                <select
                  aria-label="Unknown search dates"
                  className={selectClass}
                  value={query.date?.unknown ?? "exclude"}
                  onChange={(e) =>
                    datePatch({ unknown: e.target.value as SearchDateFilter["unknown"] })
                  }
                >
                  <option value="exclude">Exclude unknown dates</option>
                  <option value="include">Include unknown dates alongside the range</option>
                  <option value="only">Only unknown dates · ignore range</option>
                </select>
              </label>
              <label className="block space-y-2 text-sm text-fg">
                Partial publication dates
                <select
                  aria-label="Partial search dates"
                  className={selectClass}
                  value={query.date?.partial ?? "overlap"}
                  onChange={(e) =>
                    datePatch({ partial: e.target.value as SearchDateFilter["partial"] })
                  }
                >
                  <option value="overlap">
                    Include year/month evidence when its period overlaps
                  </option>
                  <option value="exclude">Exclude year/month evidence</option>
                </select>
              </label>
            </fieldset>
            <p className="mt-3 text-xs leading-5 text-muted">
              All boundaries use UTC calendar days. Day-only dates keep the provider’s stated day.
              Relative, scheduled and unproven dates remain unknown. Local added time is separate;
              provider download/import times are unavailable and never borrowed from publication
              time.
            </p>
          </details>
          <div aria-label="Draft search filters" className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 max-w-full whitespace-normal break-words"
                key={chip.key}
                aria-label={`Remove draft ${chip.label}`}
                onClick={() => {
                  setQuery(removeQueryChip(query, chip.key));
                  setNote("");
                }}
              >
                {chip.label}
                <X className="size-3 shrink-0" />
              </Button>
            ))}
          </div>
          <p className="text-xs leading-5 text-muted">
            All constraints must match. Tags include saved and inferred tags. Category uses your
            override, then the media genre. Unknown durations are excluded from duration filters.
            Text keeps the existing word and prefix matching.
          </p>
          <Button type="submit" className="min-h-11 w-full">
            Open search
          </Button>
        </form>
        {error && (
          <p role="alert" className="mt-3 break-words text-sm text-danger">
            {error}
          </p>
        )}
        {note && (
          <p role="status" className="mt-3 text-sm text-accent">
            {note}
          </p>
        )}
        <section aria-label="Saved search workspaces" className="mt-5 border-t border-border pt-4">
          <h2 className="text-base font-medium text-fg">
            Saved in this profile · {scope === "private" ? "private desk" : "public library"}
          </h2>
          <label className="mt-3 block space-y-2 text-sm text-fg">
            Workspace name
            <Input
              aria-label="Workspace name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              className="min-h-11"
              variant="secondary"
              disabled={!loaded}
              onClick={() =>
                attempt(() => {
                  const q = draft();
                  if (!encodeSearchQuery(q))
                    throw Error("Add search text or a filter before saving.");
                  const row: SearchWorkspace = { id: crypto.randomUUID(), name, query: q, scope };
                  write(
                    { version: 1, entries: [...workspaces.entries, row] },
                    "New search saved in this profile.",
                  );
                  setSelected(row.id);
                })
              }
            >
              Save as new
            </Button>
            <Button
              className="min-h-11"
              variant="secondary"
              disabled={!loaded || !selected}
              onClick={() =>
                attempt(() => {
                  const q = draft();
                  if (!encodeSearchQuery(q))
                    throw Error("Add search text or a filter before saving.");
                  write(
                    {
                      version: 1,
                      entries: workspaces.entries.map((row) =>
                        row.id === selected ? { ...row, name, query: q, scope } : row,
                      ),
                    },
                    "Search name and filters updated.",
                  );
                })
              }
            >
              Update selected
            </Button>
            <Button className="min-h-11" variant="ghost" onClick={reload}>
              Reload saved searches
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Up to 32 searches. Select one to rename or edit it. Removal only removes the saved
            query.
          </p>
          <ul className="mt-3 space-y-3">
            {visibleWorkspaces.map((row) => (
              <li key={row.id} className="rounded-lg border border-border bg-elevated p-3">
                <button
                  type="button"
                  className="min-h-11 w-full break-words text-left text-sm font-medium text-fg"
                  aria-pressed={selected === row.id}
                  onClick={() => choose(row)}
                >
                  {row.name}
                </button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11"
                    aria-label={`Open saved search ${row.name}`}
                    onClick={() =>
                      attempt(() => {
                        apply(row.query, row.scope);
                        onClose();
                      })
                    }
                  >
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    aria-label={`Move ${row.name} up`}
                    disabled={visibleWorkspaces[0]?.id === row.id}
                    onClick={() =>
                      attempt(() =>
                        write(reorderWorkspace(workspaces, row.id, -1), "Search order saved."),
                      )
                    }
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    aria-label={`Move ${row.name} down`}
                    disabled={visibleWorkspaces.at(-1)?.id === row.id}
                    onClick={() =>
                      attempt(() =>
                        write(reorderWorkspace(workspaces, row.id, 1), "Search order saved."),
                      )
                    }
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11"
                    aria-label={`Remove saved search ${row.name}`}
                    onClick={() =>
                      attempt(() => {
                        write(
                          {
                            version: 1,
                            entries: workspaces.entries.filter((item) => item.id !== row.id),
                          },
                          "Saved query removed. Media was kept.",
                        );
                        if (selected === row.id) {
                          setSelected("");
                          setName("");
                        }
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {loaded && !workspaces.entries.some((row) => row.scope === scope) && (
            <p className="mt-3 text-sm text-muted">No saved searches in this desk yet.</p>
          )}
        </section>
      </SheetContent>
    </Sheet>
  );
}
export function SearchQueryChips({ raw }: { raw: string }) {
  const parsed = parseSearchQuery(raw);
  if (parsed.error)
    return (
      <p
        role="alert"
        className="mb-4 rounded-lg border border-border bg-surface p-4 text-sm text-danger"
      >
        {parsed.error}
      </p>
    );
  const chips = queryChips(parsed.query);
  if (!chips.length) return null;
  return (
    <div aria-label="Active search filters" className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Button
          className="min-h-11 max-w-full whitespace-normal break-words"
          key={chip.key}
          variant="secondary"
          aria-label={`Remove ${chip.label}`}
          onClick={() =>
            useLibrary
              .getState()
              .setQuery(encodeSearchQuery(removeQueryChip(parsed.query, chip.key)))
          }
        >
          {chip.label}
          <X className="size-3 shrink-0" />
        </Button>
      ))}
    </div>
  );
}
