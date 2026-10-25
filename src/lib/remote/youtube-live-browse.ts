import { validateYoutubeLiveContent } from './youtube-contract';
import { browseYoutubeCatalog } from './youtube-browse';
import { type YoutubeLiveObservation } from './youtube-live';
import { isYoutubeStreamsTab, youtubeCatalogLiveEvidence, type YoutubeLiveRead } from './youtube-live-evidence';
import { YoutubeRequestError } from './youtube-transport';

type Target = { browseId: string; params?: string };
const ENDPOINT_TTL = 6 * 60 * 60_000;
export class YoutubeLiveLayoutError extends Error { constructor(message: string) { super(message); this.name = 'YoutubeLiveLayoutError'; } }

/** Only a changed public layout/endpoint merits navigation recovery. Retrying
 * timeouts, server failures or a body-budget error through Home and HTML can
 * turn one eight-second failure into three expensive requests. */
export function canRecoverYoutubeLiveLayout(error: unknown) {
  return error instanceof YoutubeLiveLayoutError || error instanceof SyntaxError
    || error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404) && !error.retryAt;
}

/** Cache navigation endpoints, never live answers. A fresh Streams response is
 * required on every check. Reused params must confirm creator and Streams tab. */
export function createYoutubeLiveReader(read: (target: Target) => Promise<any>, now = () => Date.now()) {
  const endpoints = new Map<string, { params?: string; at: number }>();
  const inflight = new Map<string, Promise<YoutubeLiveRead>>();
  let shared: { params: string; at: number } | undefined;
  const tabsFor = (page: any, id: string): any[] => {
    if (page?.metadata?.channelMetadataRenderer?.externalId !== id) throw new YoutubeLiveLayoutError('YouTube did not confirm the requested live creator.');
    const tabs = page.contents?.twoColumnBrowseResultsRenderer?.tabs;
    if (!Array.isArray(tabs)) throw new YoutubeLiveLayoutError('YouTube returned an unreadable channel tab list.');
    return tabs;
  };
  const isStreams = isYoutubeStreamsTab;
  const observationsFor = (page: any, id: string) => {
    const selected = tabsFor(page, id).find(row => row.tabRenderer?.selected)?.tabRenderer;
    if (!selected?.content || typeof selected.content !== 'object') throw new YoutubeLiveLayoutError('YouTube returned an incomplete channel tab; the previous live observation was kept.');
    try { validateYoutubeLiveContent(selected.content); return youtubeCatalogLiveEvidence(page, id, now()); }
    catch (error) { throw new YoutubeLiveLayoutError(error instanceof Error ? error.message : 'YouTube returned an unreadable live catalog.'); }
  };
  const remember = (id: string, params?: string) => {
    endpoints.delete(id); endpoints.set(id, { params, at: now() });
    while (endpoints.size > 4096) endpoints.delete(endpoints.keys().next().value!);
    if (params) shared = { params, at: now() };
  };
  const streamsPage = async (id: string, params: string) => {
    const page = await read({ browseId: id, params });
    const selected = tabsFor(page, id).find(row => row.tabRenderer?.selected)?.tabRenderer;
    return { page, selected, confirmed: isStreams(selected) };
  };
  const load = async (id: string) => {
    const cached = endpoints.get(id);
    const endpoint = cached && now() - cached.at < ENDPOINT_TTL ? cached : undefined;
    const common = shared && now() - shared.at < ENDPOINT_TTL ? shared : undefined;
    const params = endpoint ? endpoint.params : common?.params;
    let home: any;
    if (params) {
      try {
        const result = await streamsPage(id, params);
        if (result.confirmed) { const lives = observationsFor(result.page, id); remember(id, params); return lives; }
        // A valid creator page can return Home when a tab disappears or its
        // params change. Recover from that very response, without reading it twice.
        home = result.page;
      }
      catch (error) {
        if (!canRecoverYoutubeLiveLayout(error)) throw error;
        endpoints.delete(id);
      }
    }
    home ??= await read({ browseId: id });
    const tabs = tabsFor(home, id);
    const streams = tabs.find(row => isStreams(row.tabRenderer))?.tabRenderer;
    if (!streams) { const lives = observationsFor(home, id); remember(id); return lives; }
    const target = streams.endpoint?.browseEndpoint;
    if (streams.selected) {
      if (target?.browseId === id && typeof target.params === 'string' && target.params.length <= 512) remember(id, target.params);
      return observationsFor(home, id);
    }
    if (target?.browseId !== id || typeof target.params !== 'string' || !target.params || target.params.length > 512) throw new YoutubeLiveLayoutError('YouTube Streams tab has no readable channel endpoint.');
    const result = await streamsPage(id, target.params);
    if (!result.confirmed) throw new YoutubeLiveLayoutError('YouTube did not confirm the Streams tab; the previous live observation was kept.');
    const lives = observationsFor(result.page, id);
    // A navigation-only Home shell is enough to discover a real Streams
    // endpoint, but cannot itself supply negative evidence. Only the confirmed
    // Streams page above may do that. Keep Home positives when content exists.
    const selected = tabs.find(row => row.tabRenderer?.selected)?.tabRenderer;
    let homeLives: YoutubeLiveObservation[] = [];
    if(selected?.content) { try { homeLives = observationsFor(home,id).observations; } catch { /* A confirmed Streams result does not require a complete Home shelf. */ } }
    remember(id, target.params);
    const observations = [...new Map([...homeLives, ...lives.observations].map(row => [row.id, row])).values()].slice(0, 64);
    return {...lives, observations, evidence:{...lives.evidence,state:observations.length ? 'live' as const : lives.evidence.state}};
  };
  const inspect = (channelId: string): Promise<YoutubeLiveRead> => {
    if (!/^UC[A-Za-z0-9_-]{20,}$/.test(channelId)) return Promise.reject(new Error('A verified YouTube channel is required for live checks.'));
    const pending = inflight.get(channelId);
    if (pending) return pending;
    const task = load(channelId).finally(() => inflight.delete(channelId));
    inflight.set(channelId, task);
    return task;
  };
  const rowInflight = new Map<string, Promise<YoutubeLiveObservation[]>>();
  const readRows = (channelId: string) => {
    const pending = rowInflight.get(channelId); if (pending) return pending;
    const task = inspect(channelId).then(result=>result.observations).finally(()=>rowInflight.delete(channelId));
    rowInflight.set(channelId,task); return task;
  };
  return Object.assign(readRows, {inspect});
}

export const browseYoutubeLives = createYoutubeLiveReader(target => browseYoutubeCatalog(target, undefined, true));
