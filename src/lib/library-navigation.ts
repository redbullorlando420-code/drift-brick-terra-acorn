import type { SourceId } from './videos/types';

/** These workspaces own their content instead of rendering the video grid. */
export const HUB_SOURCES = new Set<string>([
  'stable-diffusion', 'remote-desktop',
  'photos', 'anime', 'spotify', 'prints', 'games', 'shop', 'streaming', 'social',
  'watch-room', 'stream-signal', 'settings', 'stats', 'genres', 'assistant', 'mission-plan', 'connection', 'find-phone',
]);

/** An explicit search submitted from a tool needs a visible result desk.
 * Provider/local scopes and the private tag desk keep their existing scope. */
export function searchResultSource(source: SourceId): SourceId {
  return HUB_SOURCES.has(source) ? 'home' : source;
}

const SOURCE_LABELS: Record<string, string> = {
  'stable-diffusion': 'Stable Diffusion', 'remote-desktop': 'Remote desktop',
  home: 'Home', landing: 'Landing page', movies: 'Movies', youtube: 'YouTube',
  twitch: 'Twitch', live: 'Live', continue: 'Continue watching', history: 'History',
  favorites: 'Favorites', adults: 'Adults', 'adult-fetishes': 'Private topics',
  photos: 'Photos', anime: 'Anime', spotify: 'Spotify', prints: 'Prints', games: 'Games',
  shop: 'Shop', streaming: 'Streaming', social: 'Social', 'watch-room': 'Watch Room',
  'stream-signal': 'Stream Signal',
  settings: 'Settings', stats: 'Stats', genres: 'Topics', assistant: 'Assistant',
  'mission-plan': 'Milestones', connection: 'Connection', 'find-phone': 'Find phone',
  classics: 'Classics', all: 'All titles', demo: 'Demo library',
};

export function navigationSourceLabel(source: SourceId, folders: readonly { id: string; name: string }[]) {
  return SOURCE_LABELS[source] ?? folders.find(folder => folder.id === source)?.name ?? 'Library';
}
