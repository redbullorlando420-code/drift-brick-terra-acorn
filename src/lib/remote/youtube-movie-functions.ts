import { createServerFn } from "@tanstack/react-start";
import { youtubePublicRequest, YOUTUBE_WEB_VERSION } from "./youtube-browse";
import {
  movieRequest,
  parseYoutubeMovies,
  type MoviePage,
  type MovieRequest,
} from "./youtube-movies";

type Target = { continuation: string } | { browseId: string; params: string };
const cache = new Map<string, { page: MoviePage; expires: number }>(),
  pending = new Map<string, Promise<MoviePage>>();
const handles = new Map<string, { scope: string; target: Target; expires: number }>();
const scope = (r: MovieRequest) => JSON.stringify([r.mode, r.region, r.query]);
function handle(r: MovieRequest, target: Target) {
  const key = crypto.randomUUID();
  handles.set(key, { scope: scope(r), target, expires: Date.now() + 15 * 60000 });
  while (handles.size > 256) handles.delete(handles.keys().next().value!);
  return key;
}
/** No polling, cookies, purchases, player extraction, or arbitrary provider URLs. */
export const discoverYoutubeMovies = createServerFn({ method: "POST" })
  .validator(movieRequest)
  .handler(async ({ data }) => {
    const key = JSON.stringify(data),
      now = Date.now();
    for (const [id, value] of handles) if (value.expires <= now) handles.delete(id);
    const hit = cache.get(key);
    if (hit && hit.expires > now) return hit.page;
    if (pending.has(key)) return pending.get(key)!;
    if (pending.size >= 4) throw Error("Movie discovery is busy. Wait a moment and retry.");
    let target: object =
      data.mode === "search"
        ? { query: data.query, params: "EgIQBA%3D%3D" }
        : { browseId: "FEstorefront" };
    if (data.page) {
      const saved = handles.get(data.page);
      if (!saved || saved.scope !== scope(data))
        throw Error("This movie page expired. Load the catalog or search again.");
      target = saved.target;
    }
    const task = (async () => {
      const raw = await youtubePublicRequest(data.mode === "search" ? "search" : "browse", {
        ...target,
        context: {
          client: {
            clientName: "WEB",
            clientVersion: YOUTUBE_WEB_VERSION,
            hl: "en",
            gl: data.region,
          },
        },
      });
      const parsed = parseYoutubeMovies(raw, data.region);
      const page: MoviePage = {
        movies: parsed.movies,
        observedAt: parsed.observedAt,
        next: parsed.continuation ? handle(data, { continuation: parsed.continuation }) : null,
        shelves: parsed.shelves.map((s) => ({
          title: s.title,
          page: handle(data, { browseId: "FEstorefront", params: s.params }),
        })),
      };
      cache.delete(key);
      cache.set(key, { page, expires: Date.now() + 5 * 60000 });
      while (cache.size > 24) cache.delete(cache.keys().next().value!);
      return page;
    })().finally(() => pending.delete(key));
    pending.set(key, task);
    return task;
  });
