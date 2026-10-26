import { twitchPolicyAllows, twitchPullPolicy } from './twitch-pull-policy.ts';
import type { FollowedChannel } from './types.ts';

/**
 * Rotate Twitch checks fairly while letting never-checked import stubs get
 * their first provider response before established channels take another turn.
 */
export function selectTwitchRefreshBatch(channels: FollowedChannel[], limit: number, cursor: number, scope: 'archive' | 'live' | 'recent' = 'archive', now = Date.now()) {
  if (!channels.length || limit <= 0) return { channels: [] as FollowedChannel[], nextCursor: 0 };
  const start = ((Math.floor(cursor) % channels.length) + channels.length) % channels.length;
  const count = Math.min(Math.floor(limit), channels.length);
  const rotated = Array.from({ length: channels.length }, (_, index) => channels[(start + index) % channels.length]);
  const eligible = rotated.filter(channel => (scope === 'recent' ? channel.recentPull?.retryAt ?? 0 : channel[scope === 'live' ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt ?? 0) <= now);
  const pending = eligible.filter(channel => !channel.channelId && !channel.lastCheckedAt && !channel.lastProviderFailure);
  const settled = eligible.filter(channel => channel.channelId || channel.lastCheckedAt || channel.lastProviderFailure);
  // Live checks also update lastCheckedAt. Archive scheduling uses its own
  // durable timestamp so frequently live creators cannot distort rotation.
  if (scope === 'archive') settled.sort((a,b) => (a.twitchArchiveCheckedAt ?? a.twitchArchiveDiagnostics?.at ?? 0) - (b.twitchArchiveCheckedAt ?? b.twitchArchiveDiagnostics?.at ?? 0));
  if (scope === 'recent') settled.sort((a,b) => (a.recentPull?.attemptedAt ?? 0) - (b.recentPull?.attemptedAt ?? 0) || a.id.localeCompare(b.id));
  return { channels: [...pending, ...settled].slice(0, count), nextCursor: (start + count) % channels.length };
}

/** Bounded weighted lanes (4 high, 2 normal, 1 low) use the existing oldest-first
 * order within each tier. Every seven dispatches reserve a low turn; empty lanes
 * lend their slots. Provider budgets and live ordering are unchanged. */
export function selectTwitchPolicyBatch(channels:FollowedChannel[],limit:number,cursor:number,scope:'archive'|'recent'='recent',now=Date.now()) {
 const eligible=channels.filter(c=>twitchPolicyAllows(c,scope));
 const ordered=selectTwitchRefreshBatch(eligible,eligible.length,0,scope,now).channels;
 const lanes={high:[] as FollowedChannel[],normal:[] as FollowedChannel[],low:[] as FollowedChannel[]};
 for(const c of ordered)lanes[twitchPullPolicy(c).priority].push(c);
 const pattern=['high','normal','high','low','high','normal','high'] as const;
 const selected:FollowedChannel[]=[], used=new Set<string>();let offset=0;
 const positions={high:0,normal:0,low:0};
 const take=(tier:keyof typeof lanes)=>{while(used.has(lanes[tier][positions[tier]]?.id))positions[tier]++;const row=lanes[tier][positions[tier]];if(row)positions[tier]++;return row;};
 const count=Math.min(Math.max(0,Math.floor(limit)),ordered.length),start=((cursor%pattern.length)+pattern.length)%pattern.length;
 while(selected.length<count){const wanted=pattern[(start+offset++)%pattern.length];const row=take(wanted)??ordered.find(c=>!used.has(c.id));if(!row)break; if(used.has(row.id))continue;used.add(row.id);selected.push(row);}
 return {channels:selected,nextCursor:(start+offset)%pattern.length,skippedByPolicy:channels.length-eligible.length};
}
