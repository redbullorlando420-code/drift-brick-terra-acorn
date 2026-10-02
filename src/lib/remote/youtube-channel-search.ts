import { youtubeInitialData } from './youtube-page-data.ts';
const normalized = (value: string) => value.normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
/** Display names must resolve to one exact public channel result. Never take
 * an arbitrary recommended channel or the first similarly named creator. */
export function exactYoutubeChannel(html: string, query: string): string | null {
  return exactYoutubeChannelData(youtubeInitialData(html), query);
}
export function exactYoutubeChannelData(data: unknown, query: string): string | null {
  const matches = new Set<string>(), stack: unknown[] = [data];
  const expected = normalized(query);
  if (!expected) return null;
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    const row = node as Record<string, any>;
    const channel = row.channelRenderer;
    const title = channel?.title?.simpleText ?? channel?.title?.runs?.map((run: any) => run.text ?? '').join('') ?? '';
    if (/^UC[\w-]{20,}$/.test(channel?.channelId ?? '') && normalized(title) === expected) matches.add(channel.channelId);
    for (const value of Object.values(row)) if (value && typeof value === 'object') stack.push(value);
  }
  return matches.size === 1 ? [...matches][0] : null;
}
