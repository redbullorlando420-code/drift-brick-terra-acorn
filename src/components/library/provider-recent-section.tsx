import { startTransition, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoCard } from './video-card';
import { useBrowseLibrary } from './use-browse-library';
import { useLibrary } from '@/lib/videos/store';
import { adultFolderIds } from '@/lib/videos/adult-providers';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { getRating, tagIsLiked, creatorIsLiked, creatorIsFavorited } from '@/lib/media-feedback';
import { prepareProviderRecent, publicationLabel, type ProviderRecent } from '@/lib/videos/provider-recent';
const EMPTY: ProviderRecent = { newest: [], recommended: [], played: [], reasons: {}, playedAt: {}, confirmed: 0, unknown: 0 };
export function ProviderRecentSection({ kind }: {
    kind: 'youtube' | 'twitch';
}) {
    const videos = useBrowseLibrary(s => s.videos), folders = useBrowseLibrary(s => s.folders), hidden = useBrowseLibrary(s => s.hiddenVideos), unavailable = useBrowseLibrary(s => s.unavailable), tags = useBrowseLibrary(s => s.tags), favorites = useBrowseLibrary(s => s.favorites), likes = useBrowseLibrary(s => s.likes), history = useBrowseLibrary(s => s.history);
    const viewer = useLibrary(s => Boolean(s.activeId || s.previewId)), phase = useSessionPhase();
    const [tab, setTab] = useState<'newest' | 'recommended' | 'played'>('newest'), [limit, setLimit] = useState(8), [revision, setRevision] = useState(0), [error, setError] = useState('');
    const scope = useMemo(() => ({ kind, videos, folders, hidden, unavailable, tags, favorites, likes, history, revision }), [kind, videos, folders, hidden, unavailable, tags, favorites, likes, history, revision]);
    const [packet, setPacket] = useState<{
        scope: typeof scope;
        data: ProviderRecent;
    }>();
    useEffect(() => { const changed = () => setRevision(n => n + 1); window.addEventListener('reelcase:rating-change', changed); return () => window.removeEventListener('reelcase:rating-change', changed); }, []);
    useEffect(() => { if (viewer || phase !== 'active' || packet?.scope === scope)
        return; const controller = new AbortController(); setError(''); void prepareProviderRecent({ ...scope, privateFolders: adultFolderIds(folders), rating: getRating, tagLiked: tagIsLiked, creatorLiked: name => creatorIsLiked(name) || creatorIsFavorited(name), now: Date.now() }, catalogTurn(controller.signal)).then(data => { if (!controller.signal.aborted)
        startTransition(() => setPacket({ scope, data })); }).catch(() => { if (!controller.signal.aborted)
        setError('Recent videos could not be prepared. Your saved catalog is unchanged.'); }); return () => controller.abort(); }, [scope, viewer, phase]);
    const pending = packet?.scope !== scope && !error, data = packet?.scope.kind === kind && packet.scope.videos === videos && packet.scope.folders === folders && packet.scope.hidden === hidden && packet.scope.unavailable === unavailable ? packet.data : EMPTY, rows = data[tab];
    const name = kind === 'youtube' ? 'YouTube' : 'Twitch';
    return <section data-provider-recent={kind} aria-label={name + ' recent videos'} aria-busy={pending} className="mb-7 min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-accent">Recent videos</p><h2 className="mt-1 font-display text-2xl text-fg">Fresh on {name}</h2><p className="mt-2 max-w-3xl text-xs leading-5 text-muted">Newest uses confirmed provider publication evidence, never download or pull time. Date-only uploads have no claimed time of day. Recommendations use the newest confirmed releases from the last 30 days.</p></div><Button variant="secondary" className="min-h-11" onClick={() => setRevision(n => n + 1)}>Refresh recent picks</Button></div><div className="mt-4 flex flex-wrap gap-2" aria-label={name + ' recent view'}>{([['newest', 'Newest published'], ['recommended', 'Recommended recent'], ['played', 'Recently opened']] as const).map(([id, label]) => <Button key={id} variant={tab === id ? 'default' : 'secondary'} className="min-h-11" aria-pressed={tab === id} onClick={() => { setTab(id); setLimit(8); }}>{label}</Button>)}</div><p className="mt-3 text-xs text-muted">{pending ? 'Updating recent videos in the background…' : data.confirmed.toLocaleString() + ' confirmed dates · ' + data.unknown.toLocaleString() + ' unconfirmed dates excluded from newest'}{tab === 'played' ? ' · Last opened in Realhub; embedded players do not report confirmed watch duration.' : ''}</p>{error && <p role="alert" className="mt-3 text-sm text-muted">{error} Use Refresh recent picks to retry.</p>}<div className="mt-4 flex min-w-0 gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible xl:grid-cols-4">{rows.slice(0, limit).map(video => <article key={video.id} data-recent-video={video.id} className="w-64 min-w-0 shrink-0 sm:w-auto"><VideoCard video={video} variant="grid" recommendation={tab === 'recommended'}/><p className="mt-2 text-xs leading-5 text-muted">{publicationLabel(video)}</p>{tab === 'recommended' && <p className="mt-1 text-xs text-accent">{data.reasons[video.id]}</p>}{tab === 'played' && <p className="mt-1 text-xs text-accent">Opened {new Date(data.playedAt[video.id]!).toLocaleString()}</p>}</article>)}</div>{!pending && !rows.length && <p role="status" className="mt-4 rounded-lg bg-bg p-4 text-sm text-muted">{tab === 'played' ? 'No recent opens saved for this provider.' : tab === 'recommended' ? 'No confirmed releases from the last 30 days yet. Check recent uploads or verify an upload date.' : 'No confirmed publication dates yet. Check recent uploads; older unverified titles stay in your full catalog.'}</p>}{rows.length > limit && <Button variant="secondary" className="mt-4 min-h-11" onClick={() => setLimit(n => Math.min(48, n + 8))}>Show 8 more recent videos</Button>}</section>;
}
