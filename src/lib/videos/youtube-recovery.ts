import type { FollowedChannel, ProviderFailure } from './types';
export type YoutubeLane = 'feed' | 'catalog' | 'live';
export function youtubeRecovery(channels: readonly FollowedChannel[], now = Date.now()) {
    const globalUntil = Math.max(0, ...channels.flatMap(c => [c.recentPull?.failure, c.lastProviderFailure, c.lastLiveFailure].filter((f): f is ProviderFailure => !!f && f.cooldownScope === 'all').map(f => f.retryAt ?? 0)));
    return channels.filter(c => c.kind === 'youtube').map(channel => {
        const failures = [{ lane: 'feed' as const, value: channel.recentPull?.failure }, { lane: 'catalog' as const, value: channel.lastProviderFailure }, { lane: 'live' as const, value: channel.lastLiveFailure }];
        const lanes = Object.fromEntries((['feed', 'catalog', 'live'] as const).map(lane => { const applicable = failures.filter(f => f.value && (f.value.cooldownScope === 'all' || f.value.cooldownScope === lane || !f.value.cooldownScope && f.lane === lane)); const retryAt = Math.max(globalUntil, 0, ...applicable.map(f => f.value!.retryAt ?? (f.lane === 'feed' ? channel.recentPull?.retryAt ?? 0 : 0))); const failure = applicable.sort((a, b) => b.value!.at - a.value!.at)[0]?.value; return [lane, { failure, retryAt, waiting: retryAt > now }]; })) as Record<YoutubeLane, {
            failure?: ProviderFailure;
            retryAt: number;
            waiting: boolean;
        }>;
        return { channel, lanes, globalUntil, hasFailure: failures.some(f => f.value) };
    });
}
