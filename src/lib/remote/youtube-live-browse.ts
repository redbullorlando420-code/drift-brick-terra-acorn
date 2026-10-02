import { browseYoutubeCatalog } from './youtube-browse';
import { youtubeLiveData } from './youtube-live';

/** Read the channel's actual Streams endpoint, including its current params.
 * Public browse metadata works independently of blocked HTML/player pages. */
export async function browseYoutubeLives(channelId: string) {
  const home = await browseYoutubeCatalog({ browseId: channelId }, undefined, true);
  if (home.metadata?.channelMetadataRenderer?.externalId !== channelId) throw new Error('YouTube did not confirm the requested live creator.');
  const tabs = home.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (!Array.isArray(tabs)) throw new Error('YouTube returned an unreadable channel tab list.');
  const streams = tabs.find((row: any) => /\/streams(?:[?#]|$)/.test(row.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url ?? '') || row.tabRenderer?.title === 'Live')?.tabRenderer;
  if (!streams) return youtubeLiveData(home, channelId);
  if (streams.selected) return youtubeLiveData(home, channelId);
  const endpoint = streams.endpoint?.browseEndpoint;
  if (endpoint?.browseId !== channelId || typeof endpoint.params !== 'string') throw new Error('YouTube Streams tab has no readable channel endpoint.');
  const page = await browseYoutubeCatalog({ browseId: channelId, params: endpoint.params }, undefined, true);
  return youtubeLiveData(page, channelId);
}
