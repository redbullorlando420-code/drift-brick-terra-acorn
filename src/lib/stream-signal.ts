export const SIGNAL_PLATFORMS = ['x', 'facebook', 'instagram', 'tiktok'] as const;
export type SignalPlatform = typeof SIGNAL_PLATFORMS[number];
export const SIGNAL_SITES: Record<SignalPlatform, { name: string; url: string }> = {
  x: { name: 'X', url: 'https://x.com/' }, facebook: { name: 'Facebook', url: 'https://www.facebook.com/' },
  instagram: { name: 'Instagram', url: 'https://www.instagram.com/' }, tiktok: { name: 'TikTok', url: 'https://www.tiktok.com/' },
};
export type SignalProfile = { creator: string; twitch: string; youtube: string; title: string; game: string; message: string };
export type SignalPack = { id: string; createdAt: number; updatedAt: number; profile: SignalProfile;
  drafts: Record<SignalPlatform, string>; shared: Partial<Record<SignalPlatform, number>> };
export const DEFAULT_SIGNAL_PROFILE: SignalProfile = { creator: 'notyoda', twitch: 'https://www.twitch.tv/notyoda',
  youtube: 'https://www.youtube.com/@astronauta2706', title: 'On the grid with notyoda', game: 'iRacing Arcade',
  message: 'Come hang out, cheer on the laps, and join the community.' };
export const SIGNAL_LIMITS: Record<keyof SignalProfile, number> = { creator: 60, twitch: 256, youtube: 256, title: 140, game: 80, message: 600 };
export function signalOwnerPrefix(owner: string) { if (!owner) throw Error('A current app user is required.'); return `stream-signal:v1:${encodeURIComponent(owner)}:`; }
export function validateSignalProfile(profile: SignalProfile): Partial<Record<keyof SignalProfile, string>> {
  const errors: Partial<Record<keyof SignalProfile, string>> = {};
  for (const field of Object.keys(SIGNAL_LIMITS) as Array<keyof SignalProfile>) {
    if (profile[field].length > SIGNAL_LIMITS[field]) errors[field] = `Use ${SIGNAL_LIMITS[field]} characters or fewer.`;
    if (field !== 'message' && !profile[field].trim()) errors[field] = 'This field is required.';
  }
  for (const kind of ['twitch', 'youtube'] as const) {
    try {
      const u = new URL(profile[kind].trim());
      const validHost = kind === 'twitch' ? /^(?:www\.)?twitch\.tv$/i.test(u.hostname) : /^(?:www\.)?youtube\.com$/i.test(u.hostname);
      const validPath = kind === 'twitch' ? /^\/[a-zA-Z0-9_]{1,25}\/?$/.test(u.pathname)
        : /^\/(?:@[\p{L}\p{N}_.%\-]+|channel\/UC[\w-]{22}|(?:c|user)\/[\w.%\-]+)\/?$/u.test(u.pathname);
      if (u.protocol !== 'https:' || !validHost || !validPath || u.username || u.password || u.port || u.search || u.hash) throw Error();
    } catch { errors[kind] = kind === 'twitch' ? 'Use an HTTPS Twitch channel URL, such as https://www.twitch.tv/notyoda.' : 'Use an HTTPS YouTube @handle or channel URL.'; }
  }
  return errors;
}
export function normalizeSignalProfile(raw: unknown): SignalProfile {
  const row = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  return Object.fromEntries((Object.keys(SIGNAL_LIMITS) as Array<keyof SignalProfile>).map(key => [key,
    typeof row[key] === 'string' ? row[key].slice(0, SIGNAL_LIMITS[key]) : DEFAULT_SIGNAL_PROFILE[key]])) as SignalProfile;
}
const short = (text: string, limit: number) => [...text].length <= limit ? text : [...text].slice(0, limit - 1).join('') + '…';
export function generateSignalPack(input: SignalProfile, id: string, at = Date.now()): SignalPack {
  if (Object.keys(validateSignalProfile(input)).length) throw Error('Correct the channel setup fields before generating a pack.');
  const profile = Object.fromEntries(Object.entries(input).map(([key, value]) => [key, value.trim()])) as SignalProfile;
  const links = `Twitch: ${profile.twitch}\nYouTube: ${profile.youtube}`;
  // The generated X draft also fits a literal 280-character budget, including
  // both full links. User edits are never silently shortened.
  const xLinks = `${profile.twitch}\n${profile.youtube}`;
  if ([...xLinks].length > 210) throw Error('These channel URLs are too long for a short X post. Use shorter channel links.');
  const headline = short(`${profile.creator} is live · ${profile.game}! ${profile.title}`, 279 - [...xLinks].length);
  const common = `${profile.creator} is live!\n${profile.title}\nPlaying ${profile.game}\n\n${profile.message}\n\n${links}`;
  return { id, createdAt: at, updatedAt: at, profile, shared: {}, drafts: {
    x: `${headline}\n${xLinks}`, facebook: common,
    instagram: `${common}\n\nJoin the stream. Add a Link sticker to your Story or use your profile link. #LiveStream`,
    tiktok: `${profile.creator} is live playing ${profile.game}!\n${profile.title}\n${profile.message}\n\n${links}\n\nFind the stream through my profile link, if available. #Gaming #LiveStream`,
  } };
}
export function readSignalPack(raw: unknown): SignalPack {
  if (!raw || typeof raw !== 'object') throw Error('This saved pack is damaged. Your other packs are still available.');
  const p = raw as SignalPack;
  if (typeof p.id !== 'string' || !/^pack:\d{13}:\w[\w-]*$/.test(p.id) || !Number.isFinite(p.createdAt)
    || !p.drafts || !SIGNAL_PLATFORMS.every(key => typeof p.drafts[key] === 'string' && p.drafts[key].length <= 6000)) throw Error('This saved pack is damaged.');
  return { ...p, profile: normalizeSignalProfile(p.profile), shared: Object.fromEntries(SIGNAL_PLATFORMS.filter(key => Number.isFinite(p.shared?.[key])).map(key => [key, p.shared[key]])) };
}
export function composeOnX(text: string) { return `https://x.com/intent/post?${new URLSearchParams({ text })}`; }
export function exportSignalPack(pack: SignalPack) {
  return `STREAM SIGNAL — ${pack.profile.creator}\n${pack.profile.title}\nGame: ${pack.profile.game}\nCreated: ${new Date(pack.createdAt).toISOString()}\n\n${SIGNAL_PLATFORMS.map(key => `${SIGNAL_SITES[key].name.toUpperCase()}\nSite: ${SIGNAL_SITES[key].url}\nChecklist: ${pack.shared[key] ? 'manually marked shared' : 'not marked shared'}\n\n${pack.drafts[key]}`).join('\n\n--------------------\n\n')}\n\nSTREAM LINKS\nTwitch: ${pack.profile.twitch}\nYouTube: ${pack.profile.youtube}\n\nChecklist marks are manual notes, not platform publication receipts.\n`;
}
