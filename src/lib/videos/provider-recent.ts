import { videoIsPrivate } from './public-visibility.ts';
import { forEachCatalogSlice } from '../catalog-work.ts';
import { youtubeContentKind, youtubePublicationTime, youtubePublicationPrecision } from './youtube-metadata.ts';
import type { LibraryVideo } from './types';
export function confirmedPublication(video: LibraryVideo, now = Date.now()) {
    if (video.remote?.live || video.remote?.youtubeType === 'upcoming')
        return 0;
    const at = video.remote?.kind === 'youtube' ? youtubeContentKind(video) === 'live' ? 0 : youtubePublicationTime(video) : video.remote?.kind === 'twitch' && video.remote.publishedSource === 'provider' && video.remote.publishedPrecision === 'instant' ? video.addedAt : 0;
    return Number.isFinite(at) && at > Date.UTC(2000, 0, 1) && at <= now ? at : 0;
}
export function publicationLabel(video: LibraryVideo) { const at = confirmedPublication(video); if (!at)
    return 'Publication unconfirmed'; return video.remote?.kind === 'youtube' && youtubePublicationPrecision(video) === 'day' ? 'Published ' + new Date(at).toISOString().slice(0, 10) + ' · date only' : 'Published ' + new Date(at).toLocaleString(); }
type Inputs = {
    kind: 'youtube' | 'twitch';
    videos: LibraryVideo[];
    hidden: Record<string, unknown>;
    unavailable: Record<string, unknown>;
    privateFolders: Set<string>;
    tags: Record<string, string[]>;
    favorites: Record<string, unknown>;
    likes: Record<string, unknown>;
    history: Array<{
        id: string;
        at: number;
        source?: string;
    }>;
    rating: (id: string) => number;
    tagLiked: (tag: string) => boolean;
    creatorLiked: (creator: string) => boolean;
    now: number;
};
export type ProviderRecent = {
    newest: LibraryVideo[];
    recommended: LibraryVideo[];
    played: LibraryVideo[];
    reasons: Record<string, string>;
    playedAt: Record<string, number>;
    confirmed: number;
    unknown: number;
};
export async function prepareProviderRecent(input: Inputs, turn: () => Promise<void>): Promise<ProviderRecent> {
    const newest: LibraryVideo[] = [], played: LibraryVideo[] = [], playedAt: Record<string, number> = {}, reasons: Record<string, string> = {};
    let confirmed = 0, unknown = 0;
    const playTimes = new Map<string, number>();
    for (const event of input.history.slice(0, 2000))
        if (event.at > 0 && event.at <= input.now && !playTimes.has(event.id))
            playTimes.set(event.id, event.at);
    const compare = (a: LibraryVideo, b: LibraryVideo) => confirmedPublication(b, input.now) - confirmedPublication(a, input.now) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    const keep = (rows: LibraryVideo[], row: LibraryVideo, cmp: (a: LibraryVideo, b: LibraryVideo) => number, limit: number) => { let low = 0, high = rows.length; while (low < high) {
        const mid = (low + high) >>> 1;
        if (cmp(row, rows[mid]!) < 0)
            high = mid;
        else
            low = mid + 1;
    } if (low < limit) {
        rows.splice(low, 0, row);
        if (rows.length > limit)
            rows.pop();
    } };
    await forEachCatalogSlice(input.videos, video => {
        if (video.remote?.kind !== input.kind || video.isSample || videoIsPrivate(input.privateFolders,video) || input.hidden[video.id] || input.unavailable[video.id] || video.remote.live || video.remote.youtubeType === 'upcoming')
            return;
        const at = playTimes.get(video.id);
        if (at) {
            playedAt[video.id] = at;
            keep(played, video, (a, b) => playTimes.get(b.id)! - playTimes.get(a.id)! || compare(a, b), 48);
        }
        if (!confirmedPublication(video, input.now)) {
            unknown++;
            return;
        }
        confirmed++;
        keep(newest, video, compare, 96);
    }, turn);
    const scored = newest.filter(v => input.now - confirmedPublication(v, input.now) <= 30 * 86400000).map(video => { const tags = (input.tags[video.id] ?? []).slice(0, 64), liked = tags.find(input.tagLiked), creator = input.creatorLiked(video.remote?.channelName ?? ''), rating = input.rating(video.id); const score = (liked ? 8 : 0) + (creator ? 6 : 0) + (input.favorites[video.id] ? 5 : 0) + (input.likes[video.id] ? 4 : 0) + (rating >= 3 ? rating * 2 : rating === 1 ? -100 : 0) - (playTimes.has(video.id) ? 5 : 0); reasons[video.id] = liked ? 'Matches your liked tag #' + liked : creator ? 'From a creator you like' : input.favorites[video.id] || input.likes[video.id] ? 'Saved or liked by you' : rating >= 3 ? 'Highly rated by you' : 'Recent release in your saved library'; return { video, score }; }).filter(row => row.score > -50).sort((a, b) => b.score - a.score || compare(a.video, b.video));
    const recommended: LibraryVideo[] = [], creators = new Map<string, number>();
    for (const { video } of scored) {
        const creator = video.remote?.channelId ?? video.folderId;
        if ((creators.get(creator) ?? 0) >= 3)
            continue;
        creators.set(creator, (creators.get(creator) ?? 0) + 1);
        recommended.push(video);
        if (recommended.length === 24)
            break;
    }
    const boundedTimes: Record<string, number> = {};
    for (const video of played)
        boundedTimes[video.id] = playedAt[video.id]!;
    return { newest: newest.slice(0, 48), recommended, played, reasons, playedAt: boundedTimes, confirmed, unknown };
}
