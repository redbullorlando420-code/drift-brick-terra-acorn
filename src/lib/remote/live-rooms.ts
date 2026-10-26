import type { LibraryVideo } from '../videos/types';
import {adultAdapter,canPullAdult} from '../videos/adult-provider-adapters.ts';
export type LiveRoomProvider = 'chaturbate' | 'myfreecams';
export type LiveRoomPage = {
  provider: LiveRoomProvider; videos: LibraryVideo[]; offset: number; nextOffset: number | null;
  total: number; checkedAt: number; stale: boolean; error?: string; retryAt?: number;
};
export const LIVE_ROOM_PAGE_SIZE = 24;
export function liveRoomRequest(raw: unknown) {
  const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  if (data.provider !== 'chaturbate' && data.provider !== 'myfreecams') throw new Error('Choose Chaturbate or MyFreeCams.');
  if(!canPullAdult(data.provider)||adultAdapter(data.provider)?.paging!=='directory')throw new Error('This provider has no live directory adapter.');
  const offset = Number(data.offset ?? 0), limit = Number(data.limit ?? LIVE_ROOM_PAGE_SIZE);
  if (!Number.isFinite(offset) || !Number.isFinite(limit)) throw new Error('Invalid live directory page.');
  return { provider: data.provider as LiveRoomProvider, offset: Math.max(0, Math.min(100_000, Math.floor(offset))), limit: Math.max(1, Math.min(48, Math.floor(limit))) };
}
