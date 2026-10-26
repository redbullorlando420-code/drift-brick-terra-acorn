import { previewRoomSessionImport, type RoomSessionFile } from '@/lib/multiplayer/room-session-file';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Heart, History, Search, MessageCircle, MonitorPlay, Pause, Play, Radio, Star, Users, Wifi, ListVideo, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { registerPeriodicTask } from '@/lib/periodic-work';
import { twitchEmbedUrl, currentTwitchEmbedContext } from "@/lib/videos/twitch-embed";
import { useP2PRoom } from "@/lib/multiplayer";
import { createLocalId } from '@/lib/local-id';
import { clampRoomPosition, estimatedProviderPosition, normalizeGuestOffset, guestPlaybackPosition, hostPlaybackPosition } from "@/lib/multiplayer/room-clock";
import { describeRoomMedia, resolveRoomMedia, resolveRoomRequest, mergeRoomMedia, normalizeRoomVideo, parseRoomLinks, roomMediaKey, type RoomMediaDescriptor } from "@/lib/multiplayer/room-media";
import { ROOM_QUEUE_LIMIT, normalizeRoomQueue, distinctRoomQueue, applyRoomQueueAction, parseRoomQueueAction, shuffleRoomQueue, applyRoomQueueEdit, parseRoomQueueEdit, type RoomQueueEdit, type RoomQueueAction } from '@/lib/multiplayer/room-queue';
import { ROOM_QUEUE_DRAFT_KEY, roomQueueDraft, readRoomQueueDraft, acceptsRoomSelection, nextPlayableRoomTitle, roomRecentMedia, type RoomQueueDraft } from '@/lib/multiplayer/room-queue-session';
import { RoomInvitation, useRoomInvitation } from './room-invitation';
import { YoutubeEmbedRecovery } from "./youtube-embed-recovery";
import { useYoutubeEmbedDiagnostics } from "./use-youtube-embed-diagnostics";
import { useRoomPlayerReadiness } from "./use-room-player-readiness";
import { RoomParticipationPanel } from "./room-participation-panel";
import { guestPlaybackRequest } from "@/lib/multiplayer/room-playback-access";
import { RoomQueuePanel } from './room-queue-panel';
import { RoomRecentPanel } from './room-recent-panel';
import { useRoomHostCatalog } from './use-room-host-catalog';
import { RoomWatchHistoryPanel } from './room-watch-history-panel';
import { ROOM_HISTORY_KEY, readRoomHistory, rememberRoomVideo, type RoomWatchEntry } from '@/lib/multiplayer/room-watch-history';
import { RoomSuggestionsPanel } from './room-suggestions-panel';
import { addRoomSuggestions, readRoomSuggestions, acceptsRoomReviewRevision, type RoomSuggestion } from '@/lib/multiplayer/room-suggestions';
import { providerPosition, providerNeedsCorrection, providerPlaybackWanted, youtubeLiveInfo, roomClockSample, roomPacketElapsed, type ProviderClock } from '@/lib/multiplayer/room-provider-clock';
import { roomYoutubeError } from '@/lib/multiplayer/room-player-recovery';
import { RoomRecommendations } from './room-recommendations';
import { useRoomQueueDelivery } from './use-room-queue-delivery';
import { lookupVideo } from "@/lib/videos/video-lookup";
import { resolvePlayUrl, pinPlayUrl } from "@/lib/videos/sources";
import { useRoomLocalStream } from "./use-room-local-stream";
import { RoomStreamPlayer } from "./room-stream-player";
import { RoomGuestTiming } from "./room-guest-timing";
import { RoomRelaySettings } from "./room-relay-settings";
import type { RoomRelayConfig } from "@/lib/multiplayer/relay-config";
import { getRating, setRating as saveRating } from "@/lib/media-feedback";
import { measureInteraction } from "@/lib/interaction-budget";
import { catalogTurn } from "@/lib/catalog-turn";
import { prepareRoomCandidates } from "@/lib/multiplayer/room-candidates";
import { NATIVE_PLAYABLE, type LibraryVideo } from "@/lib/videos/types";
import { AdultComments } from "./adult-comments";
import { bytes, HubShell } from './hub-shared';

function watchRoomEmbed(video: LibraryVideo) {
  const base = video.remote?.embedUrl;
  if (!base) return "";
  if (video.remote?.kind === "twitch") {
    // Use the same canonical route as the full player: Twitch VOD embeds need
    // a v-prefixed ID plus the exact parent host, not the raw catalog URL.
    return twitchEmbedUrl(video.remote, currentTwitchEmbedContext().parents) ?? "";
  }
  const url = new URL(base);
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("rel", "0");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("controls", "1");
  url.searchParams.set("origin", window.location.origin);
  if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
  return url.toString();
}

function watchRoomPoster(video: LibraryVideo) {
  if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
  return video.poster;
}

function canStageRoomVideo(video: LibraryVideo) {
  return video.remote ? Boolean(describeRoomMedia(video)) : Boolean(video.src || NATIVE_PLAYABLE.has(video.extension.toLowerCase()));
}

function roomShuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}

type LocalRoomShare = { name: string; fingerprint: string; size: number; modified: number };

type RoomLedgerEvent = {
  at: number;
  kind: "session" | "state" | "timeline" | "queue" | "request" | "dropped";
  detail: string;
};

type RoomHealth = {
  lastPublishedAt: number;
  lastHostStateAt: number;
  lastQueueAt: number;
  lastDriftSeconds: number;
  queueRevision: number;
  queueRequests: number;
  queueAccepted: number;
  staleDropped: number;
  resyncRequests: number;
};

function normalizeLocalRoomQueue(value: unknown) {
  if (!Array.isArray(value)) return [] as LocalRoomShare[];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const share = item as Partial<LocalRoomShare>;
    if (typeof share.name !== "string" || typeof share.fingerprint !== "string" || !share.name.trim() || !share.fingerprint.trim() || seen.has(share.fingerprint)) return [];
    seen.add(share.fingerprint);
    return [{ name: share.name, fingerprint: share.fingerprint, size: Math.max(0, Number(share.size) || 0), modified: Math.max(0, Number(share.modified) || 0) }];
  }).slice(0, 24);
}

function trustedRoomSentAt(value: unknown, now = Date.now()) {
  const sentAt = typeof value === "number" && Number.isFinite(value) ? value : 0;
  // A room packet should be fresh. A wildly future clock would otherwise make
  // every honest state look stale until the tab is refreshed.
  return sentAt > 0 && sentAt <= now + 60_000 ? sentAt : 0;
}

function roomTimeLabel(at: number) {
  return at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "waiting";
}

function localRoomFingerprint(file: File) {
  // A privacy-preserving match key, not a content hash. It is enough to stop
  // an accidental same-name handoff while never reading or transmitting bytes.
  return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}

type TwitchRoomPlayer = {
  play: () => void;
  pause: () => void;
  setMuted?: (muted: boolean) => void;
  seek: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration?: () => number;
  addEventListener: (event: string, handler: () => void) => void;
};

type TwitchEmbedApi = { Player: new (target: string, options: Record<string, unknown>) => TwitchRoomPlayer & { constructor: { READY?: string; PLAY?: string; PAUSE?: string; SEEK?: string } } };

let twitchEmbedLoader: Promise<TwitchEmbedApi> | undefined;

function loadTwitchEmbed(): Promise<TwitchEmbedApi> {
  return twitchEmbedLoader ??= new Promise<TwitchEmbedApi>((resolve, reject) => {
    const ready = (window as Window & { Twitch?: TwitchEmbedApi }).Twitch;
    if (ready?.Player) { resolve(ready); return; }
    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.async = true;
    const timeout = window.setTimeout(() => { script.remove(); reject(new Error('Twitch player script timed out')); }, 10_000);
    script.onload = () => {
      window.clearTimeout(timeout); script.remove();
      const api = (window as Window & { Twitch?: TwitchEmbedApi }).Twitch;
      if (api?.Player) resolve(api); else reject(new Error("Twitch player API unavailable"));
    };
    script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error("Twitch player script failed to load")); };
    document.head.append(script);
  }).catch(error => { twitchEmbedLoader = undefined; throw error; });
}

export function WatchRoomSection() {
  const twitchEnvironment = useMemo(currentTwitchEmbedContext, []);
  const [roomCode, setRoomCode] = useState(
    () => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  );
  const [roomInput, setRoomInput] = useState("");
  const [recentLocalRoom, setRecentLocalRoom] = useState(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
  const [name, setName] = useState(() => localStorage.getItem("reelcase.profile-name") || (new URLSearchParams(window.location.search).get('theater')==='1'?'Guest':'Host'));
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);
  const [guestAccess, setGuestAccess] = useState(false);
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [localShare, setLocalShare] = useState<LocalRoomShare | null>(null);
  const [pickedLocalVideo, setPickedLocalVideo] = useState<File | null>(null);
  const localFiles = useRef(new Map<string, File>());
  const [pendingLocalShare, setPendingLocalShare] = useState<LocalRoomShare | null>(null);
  const [sharedRoomVideos, setSharedRoomVideos] = useState<Record<string, LibraryVideo>>({});
  const sharedRoomVideosRef = useRef(sharedRoomVideos);
  sharedRoomVideosRef.current = sharedRoomVideos;
  const [sharedLocalMedia, setSharedLocalMedia] = useState<RoomMediaDescriptor | null>(null);
  const [mediaHostId, setMediaHostId] = useState("");
  const [localQueue, setLocalQueue] = useState<LocalRoomShare[]>([]);
  const [localShareMatches, setLocalShareMatches] = useState<Record<string, { name: string; fingerprint: string; at: number }>>({});
  const [rokuAddress, setRokuAddress] = useState("");
  const [rokuReady, setRokuReady] = useState(false);
  const [rokuDevices, setRokuDevices] = useState<{ address: string; location: string }[]>([]);
  const [rokuNotice, setRokuNotice] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const [queueNotice, setQueueNotice] = useState('');
  const [reviewQueue, setReviewQueue] = useState(() => { try { return localStorage.getItem('reelcase.watch-room.review-queue') === 'true'; } catch { return false; } });
  const [suggestions, setSuggestions] = useState<RoomSuggestion[]>([]);
  const reviewRevision = useRef(0), acceptedReviewRevision = useRef(0);
  const suggestionsRef = useRef(suggestions); suggestionsRef.current = suggestions;
  const [reviewNotice, setReviewNotice] = useState('');
  const requestsAnchor = useRef<HTMLDivElement>(null);
  const [guestQueueEnabled, setGuestQueueEnabled] = useState(() => localStorage.getItem('reelcase.watch-room.guest-queue') !== 'false');
  const [guestPlaybackEnabled,setGuestPlaybackEnabled]=useState(()=>{try{return localStorage.getItem('reelcase.watch-room.guest-playback')!=='false';}catch{return true;}});
  const [guestSeekingEnabled,setGuestSeekingEnabled]=useState(()=>{try{return localStorage.getItem('reelcase.watch-room.guest-seeking')!=='false';}catch{return true;}});
  const [catalogShared,setCatalogShared]=useState(true),[localTitlesShared,setLocalTitlesShared]=useState(false);
  const [savedQueue, setSavedQueue] = useState<RoomQueueDraft | undefined>(() => {
    try { return readRoomQueueDraft(localStorage.getItem(ROOM_QUEUE_DRAFT_KEY)); } catch { return undefined; }
  });
  const pendingQueueDraft = useRef<RoomQueueDraft | undefined>(undefined);
  const queueDraftTimer = useRef<number | undefined>(undefined);
  const undoQueue = useRef<{ ids: string[]; media: RoomMediaDescriptor[]; revision: number } | undefined>(undefined);
  const [undoRevision, setUndoRevision] = useState<number>();
  const selectionRevision = useRef(0);
  const acceptedSelectionRevision = useRef(0);
  const mediaHostRef = useRef('');
  const [autoAdvance,setAutoAdvance]=useState(()=>localStorage.getItem('reelcase.watch-room.auto-advance')!=='false');
  const lastEndedTitle=useRef('');
  const [roomHealth, setRoomHealth] = useState<RoomHealth>({ lastPublishedAt: 0, lastHostStateAt: 0, lastQueueAt: 0, lastDriftSeconds: 0, queueRevision: 0, queueRequests: 0, queueAccepted: 0, staleDropped: 0, resyncRequests: 0 });
  const [roomLedger, setRoomLedger] = useState<RoomLedgerEvent[]>([]);
  const [ledgerRoom, setLedgerRoom] = useState("");
  const [stageSize, setStageSize] = useState<"compact" | "theater" | "cinema">("theater");
  const [playback, setPlayback] = useState({ playing: false, position: 0 });
  const [guestOffset, setGuestOffset] = useState(() => {
    try { return normalizeGuestOffset(Number(localStorage.getItem("reelcase.watch-room.guest-offset.v1") ?? 0)); }
    catch { return 0; }
  });
  const guestPlayerOffset = useRef(0);
  const [timelineEvidence, setTimelineEvidence] = useState<{ source: "local" | "remote" | "estimated"; at: number }>({ source: "local", at: Date.now() });
  const [recentMedia, setRecentMedia] = useState<RoomMediaDescriptor[]>([]);
  const recentMediaRef = useRef(recentMedia); recentMediaRef.current = recentMedia;
  const [sessionPlayedMedia,setSessionPlayedMedia]=useState<RoomMediaDescriptor[]>([]);
  const [watchHistory,setWatchHistory]=useState<RoomWatchEntry[]>(()=>{try{return readRoomHistory(localStorage.getItem(ROOM_HISTORY_KEY));}catch{return [];}});
  const watchHistoryRef=useRef(watchHistory),lastHistorySelection=useRef('');
  const [historyNotice,setHistoryNotice]=useState('');
  const roomHistoryAnchor=useRef<HTMLDivElement>(null);
  const [playerReload, setPlayerReload] = useState(0);
  const [playerNotice, setPlayerNotice] = useState('');
  const roomStage = useRef<HTMLDivElement>(null), roomQueueAnchor = useRef<HTMLDivElement>(null), roomChat = useRef<HTMLElement>(null), roomParticipationAnchor = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState<string[]>([]);
  const chatScroll = useRef<HTMLDivElement>(null), chatAtBottom = useRef(true);
  useEffect(() => { if (chatAtBottom.current && chatScroll.current) chatScroll.current.scrollTop = chatScroll.current.scrollHeight; }, [chat]);
  const [message, setMessage] = useState("");
  const [roomCandidates, setRoomCandidates] = useState<LibraryVideo[]>([]);
  const [roomCandidatesPending, setRoomCandidatesPending] = useState(false);
  const [roomLocalToolsOpen, setRoomLocalToolsOpen] = useState(false);
  const [roomRatingRevision, setRoomRatingRevision] = useState(0);
  const [partyPrompt, setPartyPrompt] = useState("Pick the next vibe");
  const [partyVotes, setPartyVotes] = useState<Record<string, number>>({ Comedy: 0, Action: 0, Surprise: 0 });
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const [pulseStatus, setPulseStatus] = useState("No chat transport test yet.");
  const [friends, setFriends] = useState<{ name: string; code: string }[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]"); return Array.isArray(saved) ? saved.slice(0, 16) : []; } catch { return []; }
  });
  const videos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const history = useLibrary((s) => s.history);
  const recordPlay = useLibrary((s) => s.recordPlay);
  const unavailable = useLibrary((s) => s.unavailable);
  useEffect(() => { localStorage.setItem("reelcase.profile-name", name.trim() || "Host"); }, [name]);
  const [sharedVideoId, setSharedVideoIdState] = useState(
    () => {
      if(new URLSearchParams(window.location.search).get('theater')==='1') return '';
      const pending = localStorage.getItem("reelcase.watch-room.pending-video");
      const requested = pending ? videos.find((video) => video.id === pending && canStageRoomVideo(video)) : undefined;
      return requested?.id ?? videos.find(canStageRoomVideo)?.id ?? "";
    },
  );
  const currentVideoIdRef = useRef(sharedVideoId);
  const setSharedVideoId = (id: string) => {
    currentVideoIdRef.current = id;
    setSharedVideoIdState(id);
  };
  const adoptRoomMedia = useCallback((values: unknown[], ids: string[]) => {
    const next = mergeRoomMedia(sharedRoomVideosRef.current, values, ids);
    sharedRoomVideosRef.current = next;
    setSharedRoomVideos(next);
  }, []);
  // Session-only evidence from this iframe or the authoritative host. Keep it
  // scoped to one title; a live broadcast must not turn the next VOD into live.
  const [detectedLiveId, setDetectedLiveId] = useState('');
  const detectedLiveIdRef = useRef('');
  const markRoomLive = (id: string) => { detectedLiveIdRef.current = id; setDetectedLiveId(id); };
  const sharedVideo = useMemo(() => {
    const video = joinedAsGuest ? sharedRoomVideos[sharedVideoId] ?? lookupVideo(videos,sharedVideoId) : lookupVideo(videos,sharedVideoId) ?? sharedRoomVideos[sharedVideoId];
    const normalized = video ? normalizeRoomVideo(video) : undefined;
    return normalized?.remote?.kind === 'youtube' && detectedLiveId === sharedVideoId
      ? {...normalized, remote:{...normalized.remote, live:true}} : normalized;
  },[videos,sharedRoomVideos,sharedVideoId,joinedAsGuest,detectedLiveId]);
  const isRoomLive = (id = sharedVideoId) => Boolean(id && (detectedLiveIdRef.current === id || (id === sharedVideoId ? sharedVideo : roomVideoForId(id))?.remote?.live));
  const roomVideoForId = (id: string) => joinedAsGuest ? sharedRoomVideosRef.current[id] ?? lookupVideo(videos,id) : lookupVideo(videos, id) ?? sharedRoomVideosRef.current[id];
  useEffect(()=>{
    if(!activeRoom||!playback.playing||!sharedVideo?.remote)return;
    const media=describeRoomMedia(sharedVideo);if(!media)return;
    const selection=`${activeRoom}:${roomMediaKey(sharedVideo)}`;
    if(lastHistorySelection.current===selection)return;
    lastHistorySelection.current=selection;
    setSessionPlayedMedia(current=>roomRecentMedia([media,...current]));
    const next=rememberRoomVideo(watchHistoryRef.current,media);
    watchHistoryRef.current=next;setWatchHistory(next);
    try{localStorage.setItem(ROOM_HISTORY_KEY,JSON.stringify({version:1,entries:next}));setHistoryNotice('');}
    catch{setHistoryNotice('History is available for this session, but this browser could not save it.');}
  },[activeRoom,sharedVideo,playback.playing]);
  const clearWatchHistory=useCallback(()=>{
    watchHistoryRef.current=[];setWatchHistory([]);
    try{localStorage.removeItem(ROOM_HISTORY_KEY);setHistoryNotice('Your saved room history was cleared.');}
    catch{setHistoryNotice('History was cleared for this session, but browser storage could not be updated.');}
  },[]);
  const pickedLocalShare = pickedLocalVideo ? { name: pickedLocalVideo.name, fingerprint: localRoomFingerprint(pickedLocalVideo), size: pickedLocalVideo.size, modified: pickedLocalVideo.lastModified } : null;
  useEffect(() => {
    const retained = new Set([sharedVideoId, ...queue, ...(undoQueue.current?.ids ?? [])]);
    for (const id of localFiles.current.keys()) if (!retained.has(id)) localFiles.current.delete(id);
  }, [sharedVideoId, queue, undoRevision]);
  const roomRating = useMemo(() => sharedVideoId ? getRating(sharedVideoId) : 0, [roomRatingRevision, sharedVideoId]);
  const twitchClip = sharedVideo?.remote?.kind === "twitch" && (sharedVideo.extension === "clip" || sharedVideo.remote.embedUrl?.includes("clips.twitch.tv"));
  // Providers occasionally surface corrupt/millisecond clocks. Never let an
  // untrusted embed turn the room state into days of phantom playback.
  const [measuredDuration, setMeasuredDuration] = useState<{ videoId: string; seconds: number } | null>(null);
  const roomDuration = (videoId = sharedVideoId) => {
    // YouTube reports elapsed broadcast age as duration for live streams.
    // It is not a fixed VOD endpoint and must never clamp playback/seeks.
    if (isRoomLive(videoId)) return undefined;
    if (videoId === sharedVideoId) {
      const mediaDuration = roomVideoRef.current?.duration;
      const twitchDuration = sharedVideo?.remote?.kind === "twitch" && !sharedVideo.remote.live ? twitchPlayerRef.current?.getDuration?.() : undefined;
      for (const duration of [mediaDuration, twitchDuration, measuredDuration?.videoId === videoId ? measuredDuration.seconds : undefined])
        if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) return duration;
    }
    const video = videoId === sharedVideoId ? sharedVideo : videos.find((item) => item.id === videoId);
    return video?.remote?.live ? undefined : video?.duration;
  };
  const clampRoomClock = (seconds: number, videoId = sharedVideoId) => clampRoomPosition(seconds, roomDuration(videoId));
  const providerClockFlags = () => {
    const sample=sharedVideo?.remote?.kind==='youtube'?providerPosition(youtubeClock.current,sharedVideo.id,performance.now()):undefined;
    return {live:isRoomLive() ? true : sharedVideo?.remote?.kind !== 'youtube' || youtubeMetadataReady.current === sharedVideoId ? false : undefined,observed:sample!==undefined || sharedVideo?.remote?.kind==='twitch' && Boolean(twitchPlayerRef.current),clockRunning:sample!==undefined?youtubeClock.current?.state===1:sharedVideo?.remote?.kind==='twitch'?twitchPlayingRef.current:true};
  };
  const currentHostClock = () => {
    const media = roomVideoRef.current;
    if (media && !sharedVideo?.remote) {
      const actual = media.currentTime;
      return clampRoomClock(actual > 0.25 || playback.position <= 0.25 ? actual : playback.position);
    }
    const observed = sharedVideo?.remote?.kind === 'youtube' ? providerPosition(youtubeClock.current, sharedVideo.id, performance.now()) : undefined;
    if (observed !== undefined) return clampRoomClock(observed);
    const estimated = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && (sharedVideo?.remote?.kind !== "twitch" || twitchPlayingRef.current) ? youtubePlaybackStartedAt.current : null, Date.now());
    const twitch = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    return clampRoomClock(typeof twitch === "number" && Number.isFinite(twitch) && !sharedVideo?.remote?.live && (twitch>0.25 || playback.position<=0.25) ? twitch : estimated);
  };
  const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice("local:".length);
  const roomVideoRef = useRef<HTMLVideoElement>(null);
  const remoteFrameRef = useRef<HTMLIFrameElement>(null);
  const twitchPlayerHostRef = useRef<HTMLDivElement>(null);
  const twitchPlayerRef = useRef<TwitchRoomPlayer | null>(null);
  const twitchPlayingRef = useRef(false);
  const twitchProgress = useRef<{id:string;position:number;movedAt:number} | undefined>(undefined);
  const [twitchActuallyPlaying, setTwitchActuallyPlaying] = useState(false);
  const [remoteFrameReady, setRemoteFrameReady] = useState<{id:string;at:number}|null>(null);
  const youtubeClock = useRef<ProviderClock | undefined>(undefined);
  const youtubeReady = useRef(false);
  const catchUpOnStart = useRef(true);
  const lastProviderCorrection = useRef(-Infinity);
  const [hostClockRunning, setHostClockRunning] = useState(true);
  const clockOffset = useRef(0);
  const clockBestRtt = useRef(Infinity);
  const clockPings = useRef(new Map<string, {wall:number;mono:number}>());
  const [remoteSeekNonce, setRemoteSeekNonce] = useState(0);
  const lastYoutubeSeekNonce = useRef(0);
  const lastYoutubePlaybackCommand = useRef<boolean | null>(null);
  const youtubeMetadataReady = useRef('');
  const acceptLiveStatus = (id: string | undefined, live: unknown) => {
    if (!id || typeof live !== 'boolean' || roomVideoForId(id)?.remote?.kind !== 'youtube') return;
    if (live) markRoomLive(id);
    if (youtubeMetadataReady.current !== id) {
      youtubeMetadataReady.current=id;lastYoutubeSeekNonce.current=-1;setRemoteSeekNonce(value=>value+1);
    }
  };
  const lastTwitchSeekNonce = useRef(0);
  const lastTwitchPlaybackCommand = useRef<boolean | null>(null);
  const suppressRemotePlayerEchoUntil = useRef(0);
  const [twitchPlayerStatus, setTwitchPlayerStatus] = useState("Waiting for Twitch player…");
  const [twitchPlayerReady, setTwitchPlayerReady] = useState(0);
  const [candidateSeed, setCandidateSeed] = useState(() => Date.now());
  const [roomPickLimit, setRoomPickLimit] = useState(18);
  const youtubePlaybackStartedAt = useRef<number | null>(null);
  const [localVideoSource, setLocalVideoSource] = useState<{file:File;url:string}|null>(null);
  const localVideoUrl = localVideoSource?.file === localVideo ? localVideoSource.url : "";
  const [resolvedRoomSource, setResolvedRoomSource] = useState<{ id: string; url: string } | null>(null);
  const lastRoomTick = useRef(0);
  const lastRoomHistoryId = useRef("");
  const lastRoomPosition = useRef(0);
  const applyingRemotePlaybackUntil = useRef(0);
  const queueRevisionRef = useRef(0);
  const lastAcceptedQueueRevision = useRef(0);
  const lastAcceptedTimelineAt = useRef(0);
  const lastAcceptedRoomStateAt = useRef(0);
  const room = activeRoom ?? "";
  const [relayConfig, setRelayConfig] = useState<RoomRelayConfig>();
  const p2p = useP2PRoom(room, name.trim() || "Guest", relayConfig);
  const hostCatalog=useRoomHostCatalog({transport:p2p,room,guest:joinedAsGuest,hostId:mediaHostId,candidates:roomCandidates,preparing:roomCandidatesPending,shared:catalogShared,localTitles:localTitlesShared});
  const peersRef = useRef(p2p.peers); peersRef.current = p2p.peers;
  // A confirmed host in the roster may be using the same-browser relay;
  // do not disable a working fallback merely because ICE is still gathering.
  const hostConnected = Boolean(mediaHostId && p2p.peers.some(peer => peer.id === mediaHostId));
  const queueWritable = !joinedAsGuest || guestQueueEnabled && !reviewQueue && hostConnected;
  const canSuggest = joinedAsGuest && guestQueueEnabled && reviewQueue && hostConnected;
  const { request: requestQueueChange, replay: replayQueueReceipt, confirm: confirmQueueChange, accept: acceptQueueReceipt, pending: pendingQueueChanges } = useRoomQueueDelivery(room, joinedAsGuest, mediaHostId, p2p.send, setQueueNotice);
  const matchingLocalSource = localShare && sharedVideoId === `local:${localShare.fingerprint}` ? localVideoUrl : "";
  const libraryLocalSource = !joinedAsGuest ? resolvedRoomSource?.id === sharedVideoId ? resolvedRoomSource.url : !sharedVideo?.remote ? sharedVideo?.src ?? "" : "" : "";
  const hostLocalSource = !joinedAsGuest ? matchingLocalSource || libraryLocalSource : "";
  useEffect(() => {
    if (joinedAsGuest || !sharedVideo || sharedVideo.remote || !room || sharedVideo.id.startsWith("local:")) return;
    let cancelled = false;
    const release = pinPlayUrl(sharedVideo.id);
    void resolvePlayUrl(sharedVideo).then((url) => {
      if (!cancelled) setResolvedRoomSource({ id: sharedVideo.id, url });
    }).catch((error) => { if (!cancelled) setInviteNotice(error instanceof Error ? error.message : "The host could not open this local file."); });
    return () => { cancelled = true; release(); };
  }, [joinedAsGuest, sharedVideo, room]);
  const localStream = useRoomLocalStream(roomVideoRef, hostLocalSource, Boolean(room) && !joinedAsGuest, p2p.setMediaStream);
  const roomMedia = useMemo(() => {
    const descriptor = describeRoomMedia(sharedVideo, sharedVideoId === `local:${localShare?.fingerprint}` ? localShare : null);
    const seconds = measuredDuration?.videoId === sharedVideoId ? measuredDuration.seconds : descriptor?.duration;
    return descriptor?.kind === "local" ? { ...descriptor, duration:typeof seconds === "number" && Number.isFinite(seconds) && seconds>0 ? Math.min(seconds,12*60*60) : undefined, streamId: localStream.streamId || undefined } : descriptor;
  }, [sharedVideo, sharedVideoId, localShare, localStream.streamId, measuredDuration]);
  const roomQueueMedia = useMemo(() => queue.map(id => {
    const file = localFiles.current.get(id);
    const share = file ? { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified } : undefined;
    return describeRoomMedia(lookupVideo(videos,id) ?? sharedRoomVideos[id], share);
  }).filter(Boolean), [videos, queue, sharedRoomVideos]);
  const incomingStream = p2p.mediaStreams[mediaHostId];
  const guestLocalStream = joinedAsGuest && !matchingLocalSource && sharedLocalMedia?.id === sharedVideoId && sharedLocalMedia.streamId === incomingStream?.id ? incomingStream : undefined;
  const playerCapability=sharedVideo?.remote?.kind==='youtube'?'youtube':sharedVideo?.remote?.kind==='twitch'?(twitchClip?'clip':'twitch'):sharedVideoId?'local':'none';
  const playerInitial=!sharedVideoId?'idle':twitchClip||sharedVideo?.remote?.kind==='twitch'&&twitchEnvironment.blocked?'unsupported':playerCapability==='local'&&!guestLocalStream&&!matchingLocalSource&&!libraryLocalSource?'waiting':'loading';
  const playerScope=room+':'+sharedVideoId+':'+playerReload+':'+(guestLocalStream?.id||matchingLocalSource||libraryLocalSource);
  const {report:localPlayerReadiness,observe:observePlayer}=useRoomPlayerReadiness(playerScope,joinedAsGuest?acceptedSelectionRevision.current:selectionRevision.current,playerCapability,playerInitial);
  const youtubeDiagnostics=useYoutubeEmbedDiagnostics(room,sharedVideo?.remote?.kind==='youtube'?sharedVideo.remote.videoId??'':'',playerReload);
  const youtubeFailure=useRef<'error'|'timeout'|undefined>(undefined);
  const nativePlayerReadiness={onCanPlay:()=>observePlayer('ready'),onPlaying:()=>observePlayer('playing'),onWaiting:()=>observePlayer('buffering'),onStalled:()=>observePlayer('buffering'),onError:()=>observePlayer('error')};
  const timingAdjustsPlayback = Boolean(sharedVideo?.remote
    ? !sharedVideo.remote.live && !twitchClip && ["youtube", "twitch"].includes(sharedVideo.remote.kind)
    : matchingLocalSource && localShareIsMatched && !guestLocalStream);
  guestPlayerOffset.current = joinedAsGuest && timingAdjustsPlayback ? guestOffset : 0;
  const devicePlaybackPosition = guestPlaybackPosition(playback.position, guestPlayerOffset.current, roomDuration());
  const adjustedTimerPosition = guestPlaybackPosition(playback.position, joinedAsGuest ? guestOffset : 0, roomDuration());
  const changeGuestOffset = (seconds: number) => {
    const value = normalizeGuestOffset(seconds);
    applyingRemotePlaybackUntil.current = Date.now() + 1200;
    suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
    setGuestOffset(value);
    try { localStorage.setItem("reelcase.watch-room.guest-offset.v1", String(value)); } catch { /* Session adjustment still works. */ }
  };
  const acceptRoomMedia = useCallback((from: string, value: unknown, id?: string) => {
    const resolved = resolveRoomMedia(value);
    if (!resolved || resolved.descriptor.id !== id) return;
    setMediaHostId(from);
    mediaHostRef.current = from;
    setSharedLocalMedia(resolved.descriptor.kind === "local" ? resolved.descriptor : null);
    if (resolved.video) adoptRoomMedia([value], [resolved.descriptor.id, ...queueRef.current]);
    if (resolved.descriptor.local) setPendingLocalShare(resolved.descriptor.local);
  }, [adoptRoomMedia]);
  const invitation = useRoomInvitation(activeRoom ?? roomCode);
  const roomInvite = invitation.url;
  useEffect(() => {
    setSharedRoomVideos({});
    recentMediaRef.current = []; setRecentMedia([]); setSessionPlayedMedia([]); setPlayerNotice('');
    clockOffset.current=0;clockBestRtt.current=Infinity;clockPings.current.clear();setHostClockRunning(true);
    suggestionsRef.current = []; setSuggestions([]); setReviewNotice(''); reviewRevision.current = 0; acceptedReviewRevision.current = 0;
    try { setReviewQueue(!joinedAsGuest && localStorage.getItem('reelcase.watch-room.review-queue') === 'true'); } catch { setReviewQueue(false); }
    setSharedLocalMedia(null);
    setMediaHostId("");
    mediaHostRef.current = '';
    try { setGuestQueueEnabled(joinedAsGuest || localStorage.getItem('reelcase.watch-room.guest-queue') !== 'false'); }
    catch { setGuestQueueEnabled(true); }
    try {setGuestPlaybackEnabled(joinedAsGuest||localStorage.getItem('reelcase.watch-room.guest-playback')!=='false');setGuestSeekingEnabled(joinedAsGuest||localStorage.getItem('reelcase.watch-room.guest-seeking')!=='false');}catch{setGuestPlaybackEnabled(true);setGuestSeekingEnabled(true);}
    selectionRevision.current = 0;
    acceptedSelectionRevision.current = 0;
    undoQueue.current = undefined; setUndoRevision(undefined);
    queueRevisionRef.current = 0;
    queueRef.current = queue;
    if(joinedAsGuest) {queueRef.current=[];setQueue([]);setSharedVideoId('');}
    setQueueNotice('');
    lastAcceptedQueueRevision.current = 0;
    lastAcceptedTimelineAt.current = 0;
    lastAcceptedRoomStateAt.current = 0;
    setRoomHealth({ lastPublishedAt: 0, lastHostStateAt: 0, lastQueueAt: 0, lastDriftSeconds: 0, queueRevision: 0, queueRequests: 0, queueAccepted: 0, staleDropped: 0, resyncRequests: 0 });
    if (!room) { setRoomLedger([]); setLedgerRoom(""); return; }
    try {
      const stored = JSON.parse(localStorage.getItem(`reelcase.watch-room.ledger.v1:${room}`) ?? "[]");
      setRoomLedger(Array.isArray(stored) ? stored.filter((item): item is RoomLedgerEvent => Boolean(item && typeof item.at === "number" && typeof item.kind === "string" && typeof item.detail === "string")).slice(-32) : []);
    } catch { setRoomLedger([]); }
    setLedgerRoom(room);
  }, [room]);
  useEffect(() => {
    if (!room || ledgerRoom !== room) return;
    try { localStorage.setItem(`reelcase.watch-room.ledger.v1:${room}`, JSON.stringify(roomLedger.slice(-32))); } catch { /* diagnostics are best-effort */ }
  }, [ledgerRoom, room, roomLedger]);
  const noteRoom = useCallback((kind: RoomLedgerEvent["kind"], detail: string) => {
    if (!room) return;
    setRoomLedger((events) => [...events, { at: Date.now(), kind, detail }].slice(-32));
  }, [room]);
  useEffect(() => {
    if (!room || ledgerRoom !== room) return;
    noteRoom("session", `Opened as ${joinedAsGuest ? "guest" : "host"}; room commands require a fresh host state.`);
  }, [joinedAsGuest, ledgerRoom, noteRoom, room]);
  useEffect(() => {
    if (!localVideo) { setLocalVideoSource(null); return; }
    const url = URL.createObjectURL(localVideo);
    setLocalVideoSource({file:localVideo,url});
    return () => URL.revokeObjectURL(url);
  }, [localVideo]);
  useEffect(() => {
    localStorage.removeItem("reelcase.watch-room.pending-video");
  }, []);
  // Open local file sources only when selected; allocating URLs for the whole
  // catalog would waste memory. Guests receive provider metadata or RTC media.
  useEffect(() => {
    if (!activeRoom) {
      setRoomCandidates([]);
      setRoomCandidatesPending(false);
      return;
    }
    const controller = new AbortController();
    setRoomCandidates([]);
    setRoomCandidatesPending(true);
    const turn = catalogTurn(controller.signal);
    void prepareRoomCandidates({
      videos, shared: sharedRoomVideos, guest: joinedAsGuest, favorites, hidden: hiddenVideos,
      unavailable, history, seed: candidateSeed, canStage: canStageRoomVideo, rank: roomShuffleRank,
    }, turn).then((rows) => {
      if (controller.signal.aborted) return;
      setRoomCandidates(rows);
      setRoomCandidatesPending(false);
    }).catch(() => {
      if (!controller.signal.aborted) {
        setRoomCandidates([]);
        setRoomCandidatesPending(false);
        setInviteNotice("Room recommendations could not be prepared. Try reopening the room.");
      }
    });
    return () => controller.abort();
  }, [activeRoom, candidateSeed, favorites, hiddenVideos, history, videos, joinedAsGuest, sharedRoomVideos, unavailable]);
  useEffect(() => { const refresh = () => setRoomRatingRevision((value) => value + 1); window.addEventListener("reelcase:rating-change", refresh); return () => window.removeEventListener("reelcase:rating-change", refresh); }, []);
  const localQueueCandidates = useMemo(
    () => {
      if (!roomLocalToolsOpen) return [];
      const result: LibraryVideo[] = [];
      for (const video of roomCandidates) {
        if (video.remote || video.id === sharedVideoId || queue.includes(video.id)) continue;
        result.push(video);
        if (result.length === 18) break;
      }
      return result;
    },
    [queue, roomCandidates, roomLocalToolsOpen, sharedVideoId],
  );
  const youtubeRoomCandidates = useMemo(() => roomCandidates.filter((video) => video.remote?.kind === "youtube"), [roomCandidates]);
  const queueRecommendations = useMemo(() => {
    const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
    const queued = new Set(queue);
    const unseen: LibraryVideo[] = [];
    for (const video of roomCandidates) {
      if (video.id === sharedVideoId || queued.has(video.id) || alreadyShown.has(video.id)) continue;
      unseen.push(video);
      if (unseen.length === 12) break;
    }
    // Small libraries may not have a second pool yet; keep the control useful.
    return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
  }, [candidateSeed, queue, roomCandidates, roomPickLimit, sharedVideoId]);
  useEffect(() => {
    // Changing every candidate/queue rail while watching needlessly reranked
    // the full room catalog. Keep manual shuffle available during playback.
    if (!activeRoom || playback.playing) return;
    return registerPeriodicTask({ name: 'Room discoveries', everyMs: 30_000, work: () => setCandidateSeed(Date.now()) }).cancel;
  }, [activeRoom, playback.playing]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
    if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
    setRoomInput(invitedRoom);
    if (params.get("theater") === "1") {
      setJoinedAsGuest(true);
      setStageSize("cinema");
      setActiveRoom(invitedRoom);
    }
  }, []);
  useEffect(() => {
    // Host is the authoritative publisher. Previously guests echoed the
    // room-state they had just received, which could race a newer host state.
    if (joinedAsGuest || !p2p.peers.length) return;
    const sentAt = Date.now();
    queueRevisionRef.current = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current);
    p2p.send({
      type: "room-state",
      playing: playback.playing,
      ...providerClockFlags(),
      position: currentHostClock(),
      videoId: sharedVideoId,
      media: roomMedia,
      queue,
      queueMedia: roomQueueMedia,
      recentMedia,
      localQueue,
      queueRevision: queueRevisionRef.current,
      selectionRevision: selectionRevision.current,
      guestQueueEnabled, guestPlaybackEnabled, guestSeekingEnabled, reviewQueue, suggestions: suggestionsRef.current, reviewRevision: reviewRevision.current,
      sentAt,
    });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt, queueRevision: queueRevisionRef.current }));
  // Timeline ticks already use the small sync packet. Full queue/media state
  // is needed only for joins and semantic changes, not once per second.
  }, [joinedAsGuest, guestQueueEnabled, guestPlaybackEnabled, guestSeekingEnabled, localQueue, p2p.readyRevision, p2p.peers.length, queue, roomMedia, roomQueueMedia, recentMedia, reviewQueue, suggestions, sharedVideoId]);
  useEffect(() => {
    // Registration can finish before the host has installed its listener or a
    // peer channel has opened. Retry until a fresh state actually arrives.
    if (!joinedAsGuest || !p2p.joined || lastAcceptedRoomStateAt.current) return;
    let attempts = 0;
    const request = () => {
      if (lastAcceptedRoomStateAt.current || ++attempts > 8) { task.cancel(); return; }
      p2p.send({ type: "resync-request", sentAt: Date.now() });
      setRoomHealth((health) => ({ ...health, resyncRequests: health.resyncRequests + 1 }));
      if (attempts === 1) noteRoom("request", "Requested the host’s initial state.");
    };
    const task = registerPeriodicTask({ name: 'Room initial sync', mode: 'always', background: false,
      firstMs: 0, everyMs: 1_500, work: request });
    return task.cancel;
  }, [joinedAsGuest, noteRoom, p2p.joined, p2p.readyRevision, p2p.send, room]);
  const requestClockSample = () => {
    const requestId = createLocalId('clock-');
    if (clockPings.current.size >= 8) clockPings.current.clear();
    clockPings.current.set(requestId,{wall:Date.now(),mono:performance.now()});
    p2p.send({type:'clock-request',requestId},mediaHostRef.current || undefined);
  };
  const clockRequest = useRef(requestClockSample); clockRequest.current=requestClockSample;
  const resumeProvider = useRef<()=>void>(()=>{});
  useEffect(()=>{
    if (!joinedAsGuest || !p2p.joined) return;
    const samples=[0,500,1500].map(delay=>window.setTimeout(()=>clockRequest.current(),delay));
    const resume=()=>{if(document.visibilityState==='visible'){clockBestRtt.current=Infinity;clockRequest.current();resumeProvider.current();}};
    document.addEventListener('visibilitychange',resume);window.addEventListener('pageshow',resume);
    return()=>{samples.forEach(window.clearTimeout);document.removeEventListener('visibilitychange',resume);window.removeEventListener('pageshow',resume);};
  },[joinedAsGuest,p2p.joined,p2p.readyRevision,room]);
  useEffect(
    () =>
      p2p.onMessage((from, raw, channel) => {
        const data = raw as {
          type?: string;
          text?: string;
          name?: string;
          playing?: boolean;
          position?: number;
          sentAt?: number; hostTime?: number; clockRunning?: boolean; observed?: boolean; live?: boolean;
          seek?: boolean;
          videoId?: string;
          media?: RoomMediaDescriptor;
          queue?: string[];
          queueMedia?: unknown[];
          recentMedia?: unknown[];
          queueRevision?: number;
          selectionRevision?: number;
          guestQueueEnabled?: boolean;
          guestPlaybackEnabled?: boolean;
          guestSeekingEnabled?: boolean;
          reviewQueue?: boolean;
          reviewRevision?: number;
          suggestions?: unknown;
          localQueue?: LocalRoomShare[];
          fingerprint?: string;
          size?: number;
          modified?: number;
          action?: "play" | "stage";
          operation?: unknown;
          requestId?: string;
          skipped?: number;
          duplicates?: number;
          truncated?: boolean;
        };
        if (!data || typeof data !== 'object') return;
        if (data.requestId !== undefined && (typeof data.requestId !== 'string' || !data.requestId || data.requestId.length > 160)) return;
        const canonical = ['room-state', 'sync', 'video', 'queue', 'local-queue', 'share-ready', 'queue-result', 'video-rejected', 'queue-review-status', 'clock-result', 'playback-rejected'].includes(data.type ?? '');
        if (joinedAsGuest && canonical && mediaHostRef.current && from !== mediaHostRef.current) {
          const hostStillConnected = peersRef.current.some(peer => peer.id === mediaHostRef.current && peer.connectionState === 'connected');
          if (hostStillConnected || data.type !== 'room-state') return;
          // A reloaded host has a new peer identity and a fresh revision clock.
          acceptedSelectionRevision.current = 0; lastAcceptedQueueRevision.current = 0; acceptedReviewRevision.current = 0; clockBestRtt.current=Infinity;
          lastAcceptedRoomStateAt.current = 0; lastAcceptedTimelineAt.current = 0;
        }
        if (joinedAsGuest && ['room-state', 'video', 'sync'].includes(data.type ?? '')) {
          if (data.type !== 'video' && !trustedRoomSentAt(data.sentAt, Date.now() + (joinedAsGuest ? clockOffset.current : 0))) return;
          if (!acceptsRoomSelection(acceptedSelectionRevision.current, data.selectionRevision, currentVideoIdRef.current, data.videoId)) return;
          if (typeof data.selectionRevision === 'number') acceptedSelectionRevision.current = data.selectionRevision;
        }
        if (!joinedAsGuest && (!guestQueueEnabled || reviewQueue && data.type !== 'queue-suggest') && ['queue-suggest', 'queue-action', 'queue-edit', 'queue-batch', 'queue-shuffle', 'queue-request', 'next-request', 'video-request', 'local-queue-request', 'local-stage-request'].includes(data.type ?? '')) {
          if (typeof data.requestId === 'string' && data.requestId.length <= 160) {
            if (!replayQueueReceipt(from, data.requestId)) confirmQueueChange(from, data.requestId, guestQueueEnabled ? 'The host is reviewing suggestions. Suggest a public video instead of editing the live queue.' : 'The host has locked queue edits and video selection. Playback timing and chat are still available.');
          } else p2p.send({ type: 'queue-rejected', text: 'The host has locked queue edits and video selection.' }, from);
          return;
        }
        if (data.type === 'clock-request' && !joinedAsGuest && data.requestId) p2p.send({type:'clock-result',requestId:data.requestId,hostTime:Date.now()},from);
        if (data.type === 'clock-result' && joinedAsGuest && data.requestId) {
          const ping = clockPings.current.get(data.requestId); clockPings.current.delete(data.requestId);
          const sample = ping && roomClockSample(ping.wall,ping.mono,performance.now(),Number(data.hostTime));
          if (sample && sample.rtt < clockBestRtt.current) { clockBestRtt.current=sample.rtt; clockOffset.current=sample.offset; p2p.send({type:"resync-request",sentAt:Date.now()}); }
        }
        if (data.type === "chat" && data.text)
          setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
        if (data.type === "room-pulse") p2p.send({ type: "room-pulse-ack", sentAt: data.sentAt }, from);
        if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Chat transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
        if (data.type === "share-ready" && data.name && data.fingerprint) {
          const share = { name: data.name, fingerprint: data.fingerprint, size: Number(data.size) || 0, modified: Number(data.modified) || 0 };
          setPendingLocalShare(share);
          setInviteNotice(`${data.name} is shared by the host. Playback streams to this device; choosing a matching local copy is optional.`);
        }
        if (data.type === "share-matched" && data.name && data.fingerprint) {
          setLocalShareMatches((matches) => ({ ...matches, [from]: { name: data.name!, fingerprint: data.fingerprint!, at: Date.now() } }));
          setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
        }
        if (data.type === 'playback-rejected' && joinedAsGuest && typeof data.text === 'string') setInviteNotice(data.text.slice(0,300));
        if (data.type === "sync-request" && !joinedAsGuest) {
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored a guest playback request with an invalid clock.");
          } else {
            noteRoom("request", data.seek ? "Accepted a guest timeline seek request." : "Accepted a guest playback request.");
            if (data.videoId && data.videoId !== sharedVideoId) {
              noteRoom("dropped", "Ignored a playback request for a different video.");
            } else {
              const request = guestPlaybackRequest(playback,data,{playback:guestPlaybackEnabled,seeking:guestSeekingEnabled,live:isRoomLive()});
              if(!request.allowed){p2p.send({type:'playback-rejected',text:request.reason},from);noteRoom('dropped','Rejected a guest request outside the current playback permissions.');}
              else sync({playing:request.playing,position:clampRoomClock(request.position)},request.seek,true);
            }
          }
        }
        if (data.type === "sync") {
          // Only guests consume canonical playback packets. The host remains
          // the clock leader even when guests make a control request.
          if (!joinedAsGuest) return;
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt || sentAt < Math.max(lastAcceptedTimelineAt.current, lastAcceptedRoomStateAt.current)) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored an expired or out-of-order playback command.");
            return;
          }
          // A late provider event from the title that was just replaced must
          // never rewind the current room. Sync packets now carry their title
          // identity, while legacy packets retain the conservative clock guard.
          if (data.videoId && currentVideoIdRef.current && data.videoId !== currentVideoIdRef.current) return;
          acceptLiveStatus(data.videoId, data.live);
          const position = Number(data.position) || 0;
          const elapsed = data.playing ? roomPacketElapsed(sentAt, Date.now(), clockOffset.current) : 0;
          const nextPosition = position + elapsed;
          // Old iframe events can occasionally report 0 after a pause. Unless
          // this is an explicit seek/new-video command, never let that stale
          // value rewind an established room timeline.
          const safePosition = clampRoomClock(!data.observed && !data.seek && nextPosition < lastRoomPosition.current
            ? lastRoomPosition.current
            : nextPosition, data.videoId);
          const drift = Math.abs(safePosition - estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && hostClockRunning ? youtubePlaybackStartedAt.current : null, Date.now()));
          lastAcceptedTimelineAt.current = sentAt;
          lastRoomPosition.current = safePosition;
          setHostClockRunning(data.clockRunning !== false);
          youtubePlaybackStartedAt.current = data.playing && data.clockRunning !== false ? Date.now() - safePosition * 1000 : null;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          if (!isRoomLive(data.videoId) && (data.seek || drift > 0.75)) setRemoteSeekNonce((value) => value + 1);
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
          setRoomHealth((health) => ({ ...health, lastDriftSeconds: drift, lastHostStateAt: Date.now() }));
          if (!isRoomLive(data.videoId) && drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s of playback drift over ${channel}.`);
        }
        if (data.type === "video" && data.videoId && joinedAsGuest) {
          setSharedVideoId(data.videoId);
          acceptRoomMedia(from, data.media, data.videoId);
        }
        if (data.type === "video-request" && data.videoId && !joinedAsGuest) {
          if (typeof data.requestId === 'string' && data.requestId.length <= 160 && replayQueueReceipt(from, data.requestId)) return;
          const requested = resolveGuestRoomVideo(data.videoId,data.media);
          if (requested) { noteRoom("request", "Accepted a guest video request."); chooseVideo(requested,data.action==='play'); }
          else p2p.send({type:"video-rejected",text:"The host cannot open that file. Ask the host to choose and queue it; public YouTube and Twitch links can be shared directly."},from);
          if (typeof data.requestId === 'string' && data.requestId.length <= 160) confirmQueueChange(from, data.requestId, requested ? 'Video selection confirmed by the host.' : 'That video is unavailable on the host; the current video was kept.');
        }
        if (data.type === "video-rejected" && joinedAsGuest) setInviteNotice(data.text?.slice(0,300) || "The host could not play that title.");
        if (data.type === 'next-request' && !joinedAsGuest) {
          if (typeof data.requestId === 'string' && data.requestId.length <= 160 && replayQueueReceipt(from, data.requestId)) return;
          const current = data.videoId === currentVideoIdRef.current;
          if (current) playNext();
          if (typeof data.requestId === 'string' && data.requestId.length <= 160) confirmQueueChange(from, data.requestId, current ? 'Next-title request confirmed by the host.' : 'The room already moved to another video; your old request was not repeated.');
        }
        if (data.type === "queue-shuffle" && !joinedAsGuest && typeof data.requestId === "string" && data.requestId.length <= 160) {
          if (replayQueueReceipt(from, data.requestId)) return;
          shuffleQueue();
          confirmQueueChange(from, data.requestId, "Queue shuffle confirmed by the host.");
        }
        if (data.type === 'queue-action' && !joinedAsGuest) {
          let operation = parseRoomQueueAction(data.operation);
          if (!operation || typeof data.requestId !== 'string' || data.requestId.length>160) return;
          if (replayQueueReceipt(from, data.requestId)) return;
          const addsTitle = operation.kind === 'add' || operation.kind === 'next';
          const requested = addsTitle ? resolveGuestRoomVideo(operation.id,data.media) : undefined;
          if (addsTitle && !requested) {
            confirmQueueChange(from,data.requestId,'This title is unavailable on the host. YouTube and Twitch links can be shared; local files must be opened by the host.');
            return;
          }
          if (requested) operation = { ...operation, id: requested.id };
          if (operation.id === currentVideoIdRef.current || operation.kind === 'add' && queueRef.current.includes(operation.id)) {
            confirmQueueChange(from,data.requestId,'That video is already playing or queued.');
            return;
          }
          if (addsTitle && !queueRef.current.includes(operation.id) && queueRef.current.length >= ROOM_QUEUE_LIMIT) {
            confirmQueueChange(from,data.requestId,'The queue is full. Remove a title before adding another.');
            return;
          }
          publishQueue(applyRoomQueueAction(queueRef.current,operation));
          confirmQueueChange(from,data.requestId,'Queue change confirmed by the host.');
          noteRoom('queue',`Applied a guest ${operation.kind} action to the latest queue.`);
        }
        if (data.type === 'queue-edit' && !joinedAsGuest) {
          const edit = parseRoomQueueEdit(data.operation);
          if (!edit || typeof data.requestId !== 'string') return;
          if (replayQueueReceipt(from, data.requestId)) return;
          editQueue(edit);
          confirmQueueChange(from, data.requestId, 'Selected-title change confirmed by the host.');
        }
        if (data.type === "queue-batch" && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === "string" && data.requestId.length <= 160) {
          if (replayQueueReceipt(from, data.requestId)) return;
          const result=queueLinkBatch(data.queueMedia);
          const skipped=result.invalid+Math.min(48,Math.max(0,Number(data.skipped)||0));
          const duplicates=result.duplicates+Math.min(48,Math.max(0,Number(data.duplicates)||0));
          confirmQueueChange(from,data.requestId,batchQueueNotice({...result,invalid:skipped,duplicates},Boolean(data.truncated)));
        }
        if (data.type === 'queue-suggest' && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === 'string') {
          if (replayQueueReceipt(from, data.requestId)) return;
          if (!reviewQueue) { confirmQueueChange(from, data.requestId, 'Suggestion review is off. Use the normal queue controls.'); return; }
          const keys = [currentVideoIdRef.current, ...queueRef.current].flatMap(id => { const video = roomVideoForId(id); return video ? [roomMediaKey(video)] : []; });
          const result = addRoomSuggestions(suggestionsRef.current, data.queueMedia, from, peersRef.current.find(peer => peer.id === from)?.name || 'Guest', keys);
          if (result.added) { reviewRevision.current++; suggestionsRef.current = result.items; setSuggestions(result.items); }
          const invalid = result.invalid + Math.min(48, Math.max(0, Number(data.skipped) || 0));
          const duplicates = result.duplicates + Math.min(48, Math.max(0, Number(data.duplicates) || 0));
          const text = [result.added + ' sent for host review', duplicates ? duplicates + ' already playing, queued or awaiting review' : '', invalid ? invalid + ' invalid public videos' : '', result.limited ? result.limited + ' held back · suggestion limit reached' : '', data.truncated ? 'Only the first 48 links were checked' : ''].filter(Boolean).join(' · ');
          confirmQueueChange(from, data.requestId, text);
        }
        if (data.type === 'queue-review-status' && joinedAsGuest && typeof data.text === 'string') setQueueNotice(data.text.slice(0,300));
        if (data.type === "queue-result" && joinedAsGuest && typeof data.requestId === "string") acceptQueueReceipt(from, data.requestId, data.text || "");
        if (data.type === "queue-batch-result" && joinedAsGuest) setQueueNotice(data.text?.slice(0,300)||"The host checked your queue links.");
        if (data.type === 'queue-rejected' && joinedAsGuest) setQueueNotice(data.text?.slice(0,300) || 'The host could not apply this queue change.');
        if (data.type === "queue-request" && Array.isArray(data.queue) && !joinedAsGuest) {
          if (data.queueRevision !== queueRevisionRef.current) {
            p2p.send({type:'queue',queue:queueRef.current,queueMedia:roomQueueMedia,queueRevision:queueRevisionRef.current,sentAt:Date.now()},from);
            return;
          }
          // A guest can only propose titles the host can actually stage. This
          // prevents an out-of-date catalog or arbitrary packet from adding a
          // permanent “Unavailable title” entry to the canonical queue.
          const requested = normalizeRoomQueue(data.queue).filter((id) => id !== sharedVideoId && Boolean(lookupVideo(videos, id) && canStageRoomVideo(lookupVideo(videos, id)!)));
          const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
          queueRevisionRef.current = revision;
          lastAcceptedQueueRevision.current = revision;
          queueRef.current = requested;
          setQueue(requested);
          p2p.send({ type: "queue", queue: requested, queueMedia: requested.map((id) => describeRoomMedia(videos.find((video) => video.id === id))), queueRevision: revision, sentAt: Date.now() });
          setRoomHealth((health) => ({ ...health, queueAccepted: health.queueAccepted + 1, queueRevision: revision, lastQueueAt: Date.now() }));
          noteRoom("queue", `Accepted a guest queue proposal as revision ${revision}.`);
        }
        if (data.type === "queue" && Array.isArray(data.queue) && joinedAsGuest) {
          const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
          if (revision < lastAcceptedQueueRevision.current) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", `Ignored stale queue revision ${revision}.`);
          } else {
            const accepted = normalizeRoomQueue(data.queue);
            if (revision) lastAcceptedQueueRevision.current = revision;
            queueRef.current = accepted;
            setQueue(accepted);
            if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...accepted]);
            setRoomHealth((health) => ({ ...health, queueRevision: revision || health.queueRevision, lastQueueAt: Date.now() }));
          }
        }
        if (data.type === "local-queue-request" && Array.isArray(data.localQueue) && !joinedAsGuest) {
          const requested = normalizeLocalRoomQueue(data.localQueue);
          setLocalQueue(requested);
          p2p.send({ type: "local-queue", localQueue: requested, sentAt: Date.now() });
          noteRoom("queue", "Accepted a guest local-handoff queue proposal.");
        }
        if (data.type === "local-queue" && Array.isArray(data.localQueue) && joinedAsGuest) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
        if (data.type === "local-stage-request" && data.fingerprint && !joinedAsGuest) {
          const requested = localQueue.find((share) => share.fingerprint === data.fingerprint);
          if (requested) { noteRoom("request", "Accepted a guest request to stage a local handoff."); stageLocalShare(requested); }
        }
        if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({ ...votes, [data.name!]: Number(data.position) || 0 }));
        if (data.type === "room-state") {
          if (!joinedAsGuest) return;
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt || sentAt < Math.max(lastAcceptedRoomStateAt.current, lastAcceptedTimelineAt.current)) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored an expired or out-of-order host state.");
            return;
          }
          const videoChanged = Boolean(data.videoId && data.videoId !== currentVideoIdRef.current);
          mediaHostRef.current = from; setMediaHostId(from);
          if (Array.isArray(data.recentMedia)) { const recent = roomRecentMedia(data.recentMedia); recentMediaRef.current = recent; setRecentMedia(recent); }
          if (acceptsRoomReviewRevision(acceptedReviewRevision.current, data.reviewRevision)) {
            acceptedReviewRevision.current = data.reviewRevision ?? 0;
            setReviewQueue(data.reviewQueue === true);
            const items = readRoomSuggestions(data.suggestions); suggestionsRef.current = items; setSuggestions(items);
            if (typeof data.guestQueueEnabled === 'boolean') setGuestQueueEnabled(data.guestQueueEnabled);
            if (typeof data.guestPlaybackEnabled === 'boolean') setGuestPlaybackEnabled(data.guestPlaybackEnabled);
            if (typeof data.guestSeekingEnabled === 'boolean') setGuestSeekingEnabled(data.guestSeekingEnabled);
          }
          if (data.videoId) setSharedVideoId(data.videoId);
          acceptRoomMedia(from, data.media, data.videoId);
          acceptLiveStatus(data.videoId, data.live);
          if ((data.live === true || data.media?.live === true) && data.videoId) markRoomLive(data.videoId);
          if (Array.isArray(data.queue)) {
            const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
            if (revision >= lastAcceptedQueueRevision.current) {
              if (revision) lastAcceptedQueueRevision.current = revision;
              queueRef.current = normalizeRoomQueue(data.queue);
              setQueue(queueRef.current);
              if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...queueRef.current]);
              setRoomHealth((health) => ({ ...health, queueRevision: revision || health.queueRevision, lastQueueAt: Date.now() }));
            } else {
              setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
              noteRoom("dropped", `Ignored stale queue revision ${revision} in a room state.`);
            }
          }
          if (Array.isArray(data.localQueue)) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
          const position = Number(data.position) || 0;
          const elapsed = data.playing ? roomPacketElapsed(sentAt, Date.now(), clockOffset.current) : 0;
          const nextPosition = position + elapsed;
          const safePosition = clampRoomClock(!data.observed && !videoChanged && nextPosition + 0.75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
          const drift = Math.abs(safePosition - estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && hostClockRunning ? youtubePlaybackStartedAt.current : null, Date.now()));
          lastAcceptedRoomStateAt.current = sentAt;
          lastAcceptedTimelineAt.current = Math.max(lastAcceptedTimelineAt.current, sentAt);
          lastRoomPosition.current = safePosition;
          setHostClockRunning(data.clockRunning !== false);
          youtubePlaybackStartedAt.current = data.playing && data.clockRunning !== false ? Date.now() - safePosition * 1000 : null;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          if (videoChanged || !isRoomLive(data.videoId) && drift > 0.75) setRemoteSeekNonce((value) => value + 1);
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
          setRoomHealth((health) => ({ ...health, lastHostStateAt: Date.now(), lastDriftSeconds: drift }));
          if (!isRoomLive(data.videoId) && drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s from the authoritative room state.`);
        }
        if (data.type === "resync-request" && !joinedAsGuest) {
          const position = currentHostClock();
          const sentAt = Date.now();
          p2p.send({ type: "room-state", playing: playback.playing, ...providerClockFlags(), position, videoId: sharedVideoId, media: roomMedia, queue, queueMedia: roomQueueMedia, recentMedia: recentMediaRef.current, localQueue, queueRevision: queueRevisionRef.current, selectionRevision: selectionRevision.current, guestQueueEnabled, guestPlaybackEnabled, guestSeekingEnabled, reviewQueue, suggestions: suggestionsRef.current, reviewRevision: reviewRevision.current, sentAt }, from);
          setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
          noteRoom("state", "Sent a targeted state reconciliation to a guest.");
        }
      }),
    [joinedAsGuest, guestQueueEnabled, guestPlaybackEnabled, guestSeekingEnabled, reviewQueue, localQueue, noteRoom, p2p.onMessage, p2p.send, playback.playing, playback.position, queue, sharedVideoId, videos, sharedRoomVideos, measuredDuration, acceptRoomMedia, roomMedia, roomQueueMedia, replayQueueReceipt, confirmQueueChange, acceptQueueReceipt],
  );
  const sync = (next: { playing: boolean; position: number }, seek = false, explicit = false) => {
    if (seek && isRoomLive()) return;
    if (!seek && !explicit && Date.now() < applyingRemotePlaybackUntil.current) return;
    if (joinedAsGuest) {
      if(seek&&!guestSeekingEnabled||!seek&&!guestPlaybackEnabled){if(explicit||seek)setInviteNotice(seek?'The host is handling timeline seeking.':'The host is handling play and pause.');return;}
      p2p.send({ type: "sync-request", ...next, videoId: sharedVideoId, seek, sentAt: Date.now()+clockOffset.current });
      setInviteNotice("Playback change sent to the host. Your theater will reconcile when it is confirmed.");
      noteRoom("request", seek ? "Requested a host timeline seek." : "Requested a host playback update.");
      return;
    }
    if (next.playing && !playback.playing && lastEndedTitle.current === sharedVideoId) {
      next = { playing: true, position: 0 }; seek = true; lastEndedTitle.current = '';
    }
    // Prefer a fresh provider observation; the estimate is a fallback while
    // the iframe bridge is loading or temporarily unavailable.
    const isYoutube = sharedVideo?.remote?.kind === "youtube";
    const isTwitch = sharedVideo?.remote?.kind === "twitch";
    const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > 0.25;
    // Provider event handlers occasionally emit a transient zero immediately
    // after Play/Pause. That is not a seek. Never let it overwrite an
    // established VOD timeline unless the user explicitly asked to seek.
    const providerFallback = lastRoomPosition.current > 0.25 && next.position <= 0.25 && !seek;
    // A provider pause is a time capture, not a seek. Its callback can be
    // late (or transiently zero), so freeze the furthest trusted local clock.
    const providerClock = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing ? youtubePlaybackStartedAt.current : null, Date.now());
    const youtubeActual = isYoutube ? providerPosition(youtubeClock.current,sharedVideoId,performance.now()) : undefined;
    const position = !seek && youtubeActual !== undefined ? youtubeActual : !seek && !sharedVideo?.remote && roomVideoRef.current ? roomVideoRef.current.currentTime : seek ? next.position : (isYoutube || isTwitch) && !next.playing
      ? Math.max(providerClock, next.position)
      : isTwitch
        ? hasTwitchPosition
          ? Math.max(playerPosition, providerClock, next.position)
          : providerFallback ? providerClock : Math.max(providerClock, next.position)
        : providerFallback
          ? providerClock
          : isYoutube ? Math.max(providerClock, next.position) : next.position;
    const resolved = { ...next, position: clampRoomClock(position) };
    lastRoomPosition.current = resolved.position;
    youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1000 : null;
    setTimelineEvidence({ source: sharedVideo?.remote ? "estimated" : "local", at: Date.now() });
    setPlayback(resolved);
    if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
      lastRoomHistoryId.current = sharedVideoId;
      recordPlay(sharedVideoId, "watch-room");
    }
    if (seek) setRemoteSeekNonce((value) => value + 1);
    const sentAt = Date.now();
    p2p.send({ type: "sync", ...resolved, live:providerClockFlags().live, videoId: sharedVideoId, selectionRevision: selectionRevision.current, seek, sentAt });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
  };
  const syncDevicePlayback = (next: { playing: boolean; position: number }, seek = false) => {
    // Programmatic device alignment must not become a room-wide seek or echo.
    if (joinedAsGuest && Date.now() < applyingRemotePlaybackUntil.current) return;
    sync({ ...next, position: hostPlaybackPosition(next.position, guestPlayerOffset.current, roomDuration()) }, seek);
  };
  useEffect(() => {
    if (!joinedAsGuest) return;
    applyingRemotePlaybackUntil.current = Date.now() + 1200;
    suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
    setRemoteSeekNonce(value => value + 1);
  }, [guestOffset, joinedAsGuest]);
  useEffect(() => {
    const provider = sharedVideo?.remote?.kind;
    if (!provider || !playback.playing) return;
    const task = registerPeriodicTask({ name:'Room playback clock', mode:'always', background:false, everyMs:1000, work:()=>{
      const observed = !joinedAsGuest && provider === 'youtube' ? providerPosition(youtubeClock.current, sharedVideo.id, performance.now()) : undefined;
      const twitchRaw = !joinedAsGuest && provider === 'twitch' ? twitchPlayerRef.current?.getCurrentTime() : undefined;
      const twitchTime = typeof twitchRaw==='number' && (twitchRaw>0.25 || playback.position<=0.25) ? twitchRaw : undefined;
      const actual = observed ?? (typeof twitchTime === 'number' && Number.isFinite(twitchTime) ? twitchTime : undefined);
      if(!joinedAsGuest && provider==='twitch' && typeof twitchTime==='number'){
        const previous=twitchProgress.current;
        if(!previous || previous.id!==sharedVideo.id || Math.abs(previous.position-twitchTime)>0.03)twitchProgress.current={id:sharedVideo.id,position:twitchTime,movedAt:performance.now()};
      }
      const running = joinedAsGuest ? hostClockRunning : provider === 'youtube' && observed !== undefined ? youtubeClock.current?.state === 1 : provider === 'twitch' ? twitchPlayingRef.current && (!twitchProgress.current || performance.now()-twitchProgress.current.movedAt<1800) : true;
      const estimated = clampRoomClock(actual ?? estimatedProviderPosition(lastRoomPosition.current, playback.position, running ? youtubePlaybackStartedAt.current : null, Date.now()));
      lastRoomPosition.current = estimated;
      setPlayback(current => current.playing ? {...current, position:estimated} : current);
      setTimelineEvidence({source:actual === undefined ? 'estimated':'local',at:Date.now()});
       if (!joinedAsGuest) p2p.send({type:'sync',playing:true,position:estimated,live:providerClockFlags().live,clockRunning:running,observed:actual !== undefined,videoId:sharedVideoId,selectionRevision:selectionRevision.current,seek:false,sentAt:Date.now()});
    }});
    return task.cancel;
  },[joinedAsGuest,p2p.send,playback.playing,sharedVideo?.id,sharedVideo?.remote?.kind,hostClockRunning]);
  const resync = () => {
    if (joinedAsGuest) {
      p2p.send({ type: "resync-request", sentAt: Date.now() });
      setRoomHealth((health) => ({ ...health, resyncRequests: health.resyncRequests + 1 }));
      noteRoom("request", "Requested an explicit host state reconciliation.");
      setInviteNotice("Requested the host’s current room state.");
      return;
    }
    const position = currentHostClock();
    const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
    lastRoomPosition.current = position;
    youtubePlaybackStartedAt.current = playing ? Date.now() - position * 1000 : null;
    setPlayback({ playing, position });
    const sentAt = Date.now();
    p2p.send({ type: "room-state", playing, ...providerClockFlags(), position, videoId: sharedVideoId, media: roomMedia, queue, queueMedia: roomQueueMedia, recentMedia: recentMediaRef.current, localQueue, queueRevision: queueRevisionRef.current, selectionRevision: selectionRevision.current, guestQueueEnabled, guestPlaybackEnabled, guestSeekingEnabled, reviewQueue, suggestions: suggestionsRef.current, reviewRevision: reviewRevision.current, sentAt });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
    noteRoom("state", "Published an explicit room reconciliation.");
    setInviteNotice("Sent the current video and timeline to every guest.");
  };
  const providerTarget = () => guestPlaybackPosition(estimatedProviderPosition(lastRoomPosition.current,playback.position,playback.playing && (!joinedAsGuest || hostClockRunning) ? youtubePlaybackStartedAt.current : null,Date.now()),guestPlayerOffset.current,roomDuration());
  const providerSync = useRef(syncDevicePlayback); providerSync.current=syncDevicePlayback;
  const alignAfterStart = useRef<()=>void>(()=>{});
  alignAfterStart.current=()=>{
    if (!joinedAsGuest || !catchUpOnStart.current) return;
    catchUpOnStart.current=false;
    suppressRemotePlayerEchoUntil.current=Date.now()+1500;
    const target=providerTarget();
    if (sharedVideo?.remote?.kind==='youtube') {
      const frame=remoteFrameRef.current?.contentWindow,origin=new URL(watchRoomEmbed(sharedVideo)).origin;
      if (!isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) frame?.postMessage(JSON.stringify({event:'command',func:'seekTo',args:[target,true]}),origin);
      if (!providerPlaybackWanted(playback.playing,true,hostClockRunning,isRoomLive())) frame?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}),origin);
    } else if (sharedVideo?.remote?.kind==='twitch' && !twitchClip) {
      if (!sharedVideo.remote.live) twitchPlayerRef.current?.seek(target);
      if (!playback.playing || !hostClockRunning) twitchPlayerRef.current?.pause();
    }
    resync();
  };
  const startThisDevice=()=>{
    catchUpOnStart.current=true;youtubeFailure.current=undefined;setPlayerNotice('');suppressRemotePlayerEchoUntil.current=Date.now()+1500;
    const target=providerTarget();
    if (sharedVideo?.remote?.kind==='youtube') {
      const frame=remoteFrameRef.current?.contentWindow,origin=new URL(watchRoomEmbed(sharedVideo)).origin;
      if (!youtubeReady.current) { frame?.postMessage(JSON.stringify({event:'listening',id:'room-youtube'}),origin);setRemoteFrameReady({id:sharedVideo.id,at:Date.now()}); }
      if (!isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) frame?.postMessage(JSON.stringify({event:'command',func:'seekTo',args:[target,true]}),origin);
      const wanted=providerPlaybackWanted(playback.playing,joinedAsGuest,hostClockRunning,isRoomLive());
      lastYoutubePlaybackCommand.current=wanted;
      frame?.postMessage(JSON.stringify({event:'command',func:wanted?'playVideo':'pauseVideo',args:[]}),origin);
    } else if (sharedVideo?.remote?.kind==='twitch' && !twitchClip) {
      if (!sharedVideo.remote.live) twitchPlayerRef.current?.seek(target);
      if(playback.playing && hostClockRunning) twitchPlayerRef.current?.play(); else twitchPlayerRef.current?.pause();
    }
    clockRequest.current();resync();
  };
  resumeProvider.current=()=>{catchUpOnStart.current=true;if(youtubeClock.current?.state!==1)lastYoutubePlaybackCommand.current=null;setRemoteSeekNonce(value=>value+1);resync();};
  useEffect(() => {
    const media = roomVideoRef.current;
    if (!media || sharedVideo?.remote) return;
    let cancelled = false;
    const driftLimit = playback.playing ? 0.65 : 0.1;
    if (Math.abs(media.currentTime - devicePlaybackPosition) > driftLimit) {
      if (joinedAsGuest) applyingRemotePlaybackUntil.current = Date.now() + 900;
      media.currentTime = devicePlaybackPosition;
    }
    if (joinedAsGuest && (playback.playing && media.paused || !playback.playing && !media.paused)) applyingRemotePlaybackUntil.current=Date.now()+900;
    if (playback.playing && media.paused) void media.play().catch((error: unknown) => {
      if (cancelled || roomVideoRef.current !== media) return;
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        observePlayer("blocked");setInviteNotice("This browser needs a Play press to start the local video.");
        if (!joinedAsGuest) sync({ playing: false, position: media.currentTime });
      }
    });
    if (!playback.playing && !media.paused) media.pause();
    return () => { cancelled = true; };
  }, [playback, sharedVideo, libraryLocalSource, matchingLocalSource, joinedAsGuest, devicePlaybackPosition]);
  useEffect(() => {
    // YouTube's iframe API accepts command messages once enablejsapi=1 is in
    // the URL. This keeps the in-room controls meaningful instead of merely
    // changing a label beside an uncontrolled embed.
    if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id || !youtubeReady.current || youtubeFailure.current) return;
    const frame = remoteFrameRef.current?.contentWindow;
    if (!frame) return;
    const target = new URL(watchRoomEmbed(sharedVideo)).origin;
    // Seeking is destructive for an iframe player. Do it only for an explicit
    // +/- seek (or a newly selected video), never as a side effect of Pause.
    if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
      lastYoutubeSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce && !isRoomLive() && youtubeMetadataReady.current === sharedVideo.id) {
        suppressRemotePlayerEchoUntil.current = Date.now() + 1000;
        frame.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [joinedAsGuest ? providerTarget() : devicePlaybackPosition, true] }), target);
      }
    }
    // Clock packets and seek corrections must not restart an already-playing
    // iframe. Live viewers also buffer independently of the host's decoder.
    const wanted=providerPlaybackWanted(playback.playing,joinedAsGuest,hostClockRunning,isRoomLive());
    if (lastYoutubePlaybackCommand.current !== wanted) {
      lastYoutubePlaybackCommand.current=wanted;
      suppressRemotePlayerEchoUntil.current=Date.now()+750;
      frame.postMessage(JSON.stringify({ event: "command", func: wanted ? "playVideo" : "pauseVideo", args: [] }), target);
    }
  }, [playback.playing, remoteFrameReady, remoteSeekNonce, sharedVideo?.id, sharedVideo?.remote?.live, guestOffset, hostClockRunning, joinedAsGuest]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch" || twitchClip || twitchEnvironment.blocked) { twitchPlayerRef.current = null; return; }
    const host = twitchPlayerHostRef.current;
    if (!host) return;
    let cancelled = false;
    let readyTimeout: ReturnType<typeof setTimeout> | undefined;
    const hostId = `reelcase-twitch-${p2p.selfId}`;
    host.id = hostId;
    host.replaceChildren();
    twitchPlayingRef.current = false;
    setTwitchActuallyPlaying(false);
    setTwitchPlayerReady(0);
    lastTwitchSeekNonce.current = -1;
    setTwitchPlayerStatus("Loading Twitch interactive player…");
    void loadTwitchEmbed().then((api) => {
      if (cancelled) return;
      const live = Boolean(sharedVideo.remote?.live);
      const canonical = twitchEmbedUrl(sharedVideo.remote!, twitchEnvironment.parents);
      if (!canonical) throw Error('Twitch address is unavailable');
      const source = new URL(canonical), video = source.searchParams.get('video') ?? undefined, channel = source.searchParams.get('channel') ?? undefined;
      if (live ? !channel : !video) throw Error('Twitch channel or video is unavailable');
      const player = new api.Player(hostId, {
        width: "100%", height: "100%", parent: twitchEnvironment.parents, autoplay: false, muted: false,
        ...(live ? { channel } : { video }),
      });
      readyTimeout = setTimeout(() => { if (!cancelled) {observePlayer("error");setTwitchPlayerStatus("Twitch did not become ready. Check the room’s HTTPS address, then reload this player or open Twitch.");} }, 15000);
      twitchPlayerRef.current = player;
      lastTwitchPlaybackCommand.current = null;
      const events = player.constructor as { READY?: string; PLAY?: string; PAUSE?: string; SEEK?: string; PLAYING?: string; PLAYBACK_BLOCKED?: string; ENDED?:string };
      player.addEventListener(events.READY ?? "ready", () => { if (!cancelled) {
        clearTimeout(readyTimeout);
        const duration = player.getDuration?.();
        if (!live && typeof duration === "number" && Number.isFinite(duration) && duration > 0) setMeasuredDuration({ videoId: sharedVideo.id, seconds: duration });
        observePlayer("ready");setTwitchPlayerStatus("Twitch player ready. Use room controls to start."); setTwitchPlayerReady(Date.now());
      } });
      player.addEventListener(events.PLAY ?? "play", () => { if(cancelled)return;if(!twitchPlayingRef.current)observePlayer("buffering");const position = player.getCurrentTime(); if (!cancelled && (!joinedAsGuest || !catchUpOnStart.current) && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({ playing: true, position }); });
      player.addEventListener(events.PAUSE ?? "pause", () => { if(cancelled)return;observePlayer("paused");twitchPlayingRef.current = false; setTwitchActuallyPlaying(false); const position = player.getCurrentTime(); if (!cancelled && (!joinedAsGuest || !catchUpOnStart.current) && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({ playing: false, position }); });
      player.addEventListener(events.SEEK ?? "seek", () => { if (!cancelled && !live && Date.now() > suppressRemotePlayerEchoUntil.current) providerSync.current({ playing: true, position: player.getCurrentTime() }, true); });
      player.addEventListener(events.PLAYING ?? "playing", () => { if (!cancelled) { twitchPlayingRef.current = true; setTwitchActuallyPlaying(true); observePlayer("playing");setTwitchPlayerStatus("Twitch playback started."); alignAfterStart.current(); } });
      player.addEventListener(events.PLAYBACK_BLOCKED ?? "playback-blocked", () => { if (!cancelled) { twitchPlayingRef.current = false; setTwitchActuallyPlaying(false); observePlayer("blocked");setTwitchPlayerStatus("Twitch blocked playback. Press Play in its player or Start on this device."); catchUpOnStart.current=true; } });
      player.addEventListener(events.ENDED ?? 'ended',()=>{if(!cancelled) {observePlayer('ended');finishLatestRoomTitle.current();}});
    }).catch(() => { if (!cancelled) {observePlayer("error");setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below.");} });
    return () => { cancelled = true; clearTimeout(readyTimeout); twitchPlayerRef.current = null; lastTwitchPlaybackCommand.current = null; host.replaceChildren(); };
  // The player belongs to the selected card, not to every timeline tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2p.selfId, room, sharedVideo?.id, playerReload]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) return;
    const player = twitchPlayerRef.current;
    if (!player || !twitchPlayerReady) return;
    if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
      lastTwitchSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce && !sharedVideo.remote.live) {
        suppressRemotePlayerEchoUntil.current = Date.now() + 1_000;
        player.seek(joinedAsGuest ? providerTarget() : devicePlaybackPosition);
      }
    }
    if(joinedAsGuest && !sharedVideo.remote.live && playback.playing && hostClockRunning && twitchPlayingRef.current && !catchUpOnStart.current && Date.now()>suppressRemotePlayerEchoUntil.current && providerNeedsCorrection(player.getCurrentTime(),providerTarget(),performance.now(),lastProviderCorrection.current)) {
      lastProviderCorrection.current=performance.now();suppressRemotePlayerEchoUntil.current=Date.now()+1200;player.seek(providerTarget());
    }
    // A clock heartbeat is not a playback command. Calling play each second
    // can restart a buffering Twitch VOD near its first second.
    if (lastTwitchPlaybackCommand.current !== (playback.playing && (!joinedAsGuest || hostClockRunning))) {
      lastTwitchPlaybackCommand.current = playback.playing && (!joinedAsGuest || hostClockRunning);
      suppressRemotePlayerEchoUntil.current = Date.now() + 750;
      if (lastTwitchPlaybackCommand.current) player.play(); else player.pause();
    }
  }, [playback.playing, playback.position, remoteSeekNonce, sharedVideo?.id, twitchPlayerReady, guestOffset, hostClockRunning]);
  const toggleRoomPlayback = () => {
    const playing = !playback.playing;
    const player = twitchPlayerRef.current;
    // Call Twitch inside the click gesture to satisfy browser media policy;
    // the shared state still travels to every connected guest afterwards.
    if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchEnvironment.blocked && (!player || !twitchPlayerReady)) {
      setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
      return;
    }
    if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && player) {
      lastTwitchPlaybackCommand.current = playing;
      suppressRemotePlayerEchoUntil.current = Date.now() + 750;
      if (playing) {
        // This call is deliberately inside the click gesture. Do not mute a
        // VOD before trying to start it: Twitch permits a direct user-start
        // with sound, whereas a later effect-driven attempt can be rejected.
        player.setMuted?.(false);
        player.play();
        setTwitchPlayerStatus("Starting Twitch from the room control…");
        window.setTimeout(() => { if (!twitchPlayingRef.current) setTwitchPlayerStatus("Twitch is waiting for a Play press inside its player."); }, 1800);
      } else player.pause();
    }
    sync({ ...playback, playing }, false, true);
  };
  const chooseVideo = (video: LibraryVideo, startPlayback = false) => {
    if (joinedAsGuest) {
      if (!queueWritable) { setQueueNotice(hostConnected ? 'The host has locked queue edits and video selection.' : 'Waiting for the host connection before selecting a video.'); return; }
      requestQueueChange({ type: 'video-request', videoId: video.id, media: describeRoomMedia(video), action: startPlayback ? 'play' : 'stage' }, 'Video selection requested · waiting for host confirmation.');
      setInviteNotice(`Requested ${video.name} from the host. The room changes only after host confirmation.`);
      noteRoom("request", "Requested a host video change.");
      return;
    }
    const file = localFiles.current.get(video.id);
    if (!video.remote && video.id.startsWith("local:") && !file) {
      setInviteNotice(`Choose ${video.name} on the host before playing it.`);
      return;
    }
    const previous = roomVideoForId(currentVideoIdRef.current);
    if (previous?.remote && roomMediaKey(previous) !== roomMediaKey(video)) {
      const recent = roomRecentMedia([describeRoomMedia(previous), ...recentMediaRef.current]);
      recentMediaRef.current = recent; setRecentMedia(recent);
    }
    if (video.remote) adoptRoomMedia([describeRoomMedia(video)], [video.id, ...queueRef.current]);
    const share = file ? { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified } : null;
    setLocalVideo(file ?? null);
    setLocalShare(share);
    setLocalShareMatches({});
    selectionRevision.current++;
    lastEndedTitle.current = '';
    setSharedVideoId(video.id);
    const selectedKey = roomMediaKey(video);
    const remaining = queueRef.current.filter(id => {
      const queued = roomVideoForId(id);
      return queued && roomMediaKey(queued) !== selectedKey;
    });
    undoQueue.current = undefined; setUndoRevision(undefined);
    if (remaining.length !== queueRef.current.length) publishQueue(remaining, video.id, false);
    setPlayback({ playing: startPlayback, position: 0 });
    youtubePlaybackStartedAt.current=startPlayback?Date.now():null;
    lastRoomPosition.current = 0;
    lastRoomHistoryId.current = "";
    recordPlay(video.id, "watch-room");
    p2p.send({ type: "video", videoId: video.id, selectionRevision: selectionRevision.current, media: describeRoomMedia(video, share), sentAt: Date.now() });
    p2p.send({ type: "sync", playing: startPlayback, position: 0, videoId: video.id, selectionRevision: selectionRevision.current, seek: true, sentAt: Date.now() });
    noteRoom("state", "Host selected a new room video.");
  };
  const resolveGuestRoomVideo = (id: string, media: unknown) => {
    const requested = resolveRoomRequest(id, media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
    if (!requested || !canStageRoomVideo(requested)) return undefined;
    if (!requested.remote && requested.id.startsWith("local:") && !localFiles.current.has(requested.id)) return undefined;
    if (requested.remote) adoptRoomMedia([describeRoomMedia(requested)], [currentVideoIdRef.current, ...queueRef.current, requested.id]);
    return requested;
  };
  const queueDescriptors = (ids: string[]) => ids.flatMap(id => {
    const file = localFiles.current.get(id);
    const share = file ? { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified } : undefined;
    const descriptor = describeRoomMedia(roomVideoForId(id), share);
    return descriptor ? [descriptor] : [];
  });
  const flushQueueDraft = (notify = true) => {
    window.clearTimeout(queueDraftTimer.current);
    const draft = pendingQueueDraft.current;
    if (!draft) return;
    try {
      if (draft.media.length) localStorage.setItem(ROOM_QUEUE_DRAFT_KEY, JSON.stringify(draft));
      else localStorage.removeItem(ROOM_QUEUE_DRAFT_KEY);
      pendingQueueDraft.current = undefined;
      if (notify) setSavedQueue(draft.media.length ? draft : undefined);
    } catch { if (notify) setQueueNotice('The live queue is shared, but this browser could not save recovery. Free some browser storage and try another queue edit.'); }
  };
  const flushDraftRef = useRef(flushQueueDraft); flushDraftRef.current = flushQueueDraft;
  useEffect(() => {
    const flush = () => flushDraftRef.current(false);
    const hidden = () => { if (document.hidden) flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', hidden); flush(); };
  }, []);
  const publishQueue = (next: string[], currentId = currentVideoIdRef.current, recordUndo = true) => {
    measureInteraction("queue");
    const current = roomVideoForId(currentId);
    const bounded = distinctRoomQueue(next, id => {
      const video = roomVideoForId(id);
      return video && canStageRoomVideo(video) ? roomMediaKey(video) : undefined;
    }, current ? roomMediaKey(current) : undefined);
    if (bounded.length === queueRef.current.length && bounded.every((id, index) => id === queueRef.current[index])) return;
    const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
    if (recordUndo) undoQueue.current = { ids: [...queueRef.current], media: queueDescriptors(queueRef.current), revision };
    else undoQueue.current = undefined;
    setUndoRevision(undoQueue.current?.revision);
    queueRevisionRef.current = revision;
    lastAcceptedQueueRevision.current = revision;
    queueRef.current = bounded;
    setQueue(bounded);
    const media = queueDescriptors(bounded);
    p2p.send({ type: 'queue', queue: bounded, queueMedia: media, queueRevision: revision, sentAt: Date.now() });
    pendingQueueDraft.current = roomQueueDraft(media);
    window.clearTimeout(queueDraftTimer.current);
    queueDraftTimer.current = window.setTimeout(() => flushDraftRef.current(), 300);
    setRoomHealth((health) => ({ ...health, queueAccepted: health.queueAccepted + 1, queueRevision: revision, lastQueueAt: Date.now() }));
    noteRoom("queue", `Published queue revision ${revision} with ${bounded.length} title${bounded.length === 1 ? "" : "s"}.`);
  };
  const changeQueue = (operation: RoomQueueAction, video?: LibraryVideo) => {
    if (joinedAsGuest) {
      if (!queueWritable) { setQueueNotice(hostConnected ? 'The host has locked queue edits and video selection.' : 'Waiting for the host connection before changing the queue.'); return; }
      requestQueueChange({type:'queue-action',operation,media:describeRoomMedia(video ?? roomVideoForId(operation.id)),queueRevision:lastAcceptedQueueRevision.current},'Queue change sent · waiting for host confirmation.');
      setRoomHealth(health=>({...health,queueRequests:health.queueRequests+1}));
      return;
    }
    if ((operation.kind==='add'||operation.kind==='next') && !queueRef.current.includes(operation.id) && queueRef.current.length>=ROOM_QUEUE_LIMIT) {setQueueNotice('The queue holds 48 titles. Remove one before adding another.');return;}
    if (video?.remote) adoptRoomMedia([describeRoomMedia(video)], [currentVideoIdRef.current, ...queueRef.current, video.id]);
    publishQueue(applyRoomQueueAction(queueRef.current,operation));
  };
  const shuffleQueue = () => {
    if (joinedAsGuest) {
      if (!queueWritable) { setQueueNotice('Wait for an available host with guest queue editing enabled.'); return; }
      requestQueueChange({type:"queue-shuffle"},"Shuffle requested · waiting for host confirmation.");
      return;
    }
    if (queueRef.current.length < 2) return;
    publishQueue(shuffleRoomQueue(queueRef.current));
    setQueueNotice("Queue shuffled. The current video keeps playing.");
  };
  const editQueue = (edit: RoomQueueEdit) => {
    if (!parseRoomQueueEdit(edit)) return false;
    if (joinedAsGuest) {
      if (!queueWritable) { setQueueNotice('Wait for an available host with guest queue editing enabled.'); return false; }
      return requestQueueChange({ type: 'queue-edit', operation: edit }, 'Selected-title change sent · waiting for host confirmation.');
    }
    const count = queueRef.current.filter(id => edit.ids.includes(id)).length;
    publishQueue(applyRoomQueueEdit(queueRef.current, edit));
    setQueueNotice(count ? `${count} selected title${count === 1 ? '' : 's'} ${edit.kind === 'remove' ? 'removed' : edit.kind === 'next' ? 'moved to next' : 'moved to the end'}. The current video keeps playing.` : 'Those titles have already left the queue.');
    return true;
  };
  const queueLinkBatch = (values: unknown[]) => {
    const next=[...queueRef.current], media:RoomMediaDescriptor[]=[];
    const staged = new Map<string, LibraryVideo>();
    const seen=new Set([currentVideoIdRef.current,...next].flatMap(id=>{const video=roomVideoForId(id);return video?[roomMediaKey(video)]:[];}));
    const result={added:0,duplicates:0,invalid:0,full:0};
    for (const value of values.slice(0,ROOM_QUEUE_LIMIT)) {
      const resolved=resolveRoomMedia(value);
      if (!resolved?.video?.remote) {result.invalid++;continue;}
      const key=roomMediaKey(resolved.video);
      if (seen.has(key)) {result.duplicates++;continue;}
      if (next.length>=ROOM_QUEUE_LIMIT) {result.full++;continue;}
      const requested=resolveRoomRequest(resolved.video.id,value,id=>staged.get(id)??roomVideoForId(id),[currentVideoIdRef.current,...next]);
      if (!requested) {result.invalid++;continue;}
      staged.set(requested.id,requested);
      next.push(requested.id);seen.add(key);media.push(describeRoomMedia(requested)!);result.added++;
    }
    if (result.added) {adoptRoomMedia(media,[currentVideoIdRef.current,...next]);publishQueue(next);}
    return result;
  };
  const batchQueueNotice = (result:{added:number;duplicates:number;invalid:number;full:number},truncated=false) => [
    `${result.added} queued`,result.duplicates?`${result.duplicates} already playing/queued`:"",result.invalid?`${result.invalid} invalid or unavailable`:"",result.full?`${result.full} skipped · queue full`:"",truncated?"Only the first 48 links were checked":"",
  ].filter(Boolean).join(" · ");
  const decideSuggestion = (id: string, action: 'end' | 'next' | 'dismiss') => {
    if (joinedAsGuest) return;
    const item = suggestionsRef.current.find(value => value.id === id); if (!item) return;
    let text = 'The host dismissed ' + item.media.name + '.';
    if (action !== 'dismiss') {
      const keys = [currentVideoIdRef.current, ...queueRef.current].flatMap(id => { const video = roomVideoForId(id); return video ? [roomMediaKey(video)] : []; });
      if (keys.includes(item.id)) text = item.media.name + ' is already playing or queued. The request was resolved.';
      else {
        if (queueRef.current.length >= ROOM_QUEUE_LIMIT) { setReviewNotice('The queue is full. This suggestion is still waiting for review.'); return; }
        const video = resolveRoomMedia(item.media)?.video;
        const requested = video && resolveRoomRequest(video.id, item.media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
        if (!requested?.remote) { setReviewNotice('This public video could not be prepared. The suggestion was kept.'); return; }
        adoptRoomMedia([describeRoomMedia(requested)], [currentVideoIdRef.current, ...queueRef.current, requested.id]);
        publishQueue(applyRoomQueueAction(queueRef.current, { kind: action === 'next' ? 'next' : 'add', id: requested.id }));
        text = 'The host approved ' + item.media.name + (action === 'next' ? ' to play next.' : ' to the end of the queue.');
      }
    }
    const remaining = suggestionsRef.current.filter(value => value.id !== id); reviewRevision.current++; suggestionsRef.current = remaining; setSuggestions(remaining);
    setReviewNotice(text); p2p.send({ type: 'queue-review-status', text }, item.peer);
  };
  const suggestionDecision = useRef(decideSuggestion); suggestionDecision.current = decideSuggestion;
  const onSuggestionDecision = useCallback((id: string, action: 'end' | 'next' | 'dismiss') => suggestionDecision.current(id, action), []);
  const onReviewQueue = useCallback((value: boolean) => { reviewRevision.current++; setReviewQueue(value); setReviewNotice(''); try { localStorage.setItem('reelcase.watch-room.review-queue', String(value)); } catch {} }, []);
  const queuePublicLinks = (value:string) => {
    const parsed=parseRoomLinks(value);
    if (!parsed.videos.length) {setQueueNotice("Enter public YouTube or Twitch links, one per line.");return false;}
    if (joinedAsGuest) {
      if (canSuggest) return requestQueueChange({type:'queue-suggest',queueMedia:parsed.videos.map(video=>describeRoomMedia(video)),skipped:parsed.invalid,duplicates:parsed.duplicates,truncated:parsed.truncated}, parsed.videos.length + ' suggestions sent · waiting for host review confirmation.');
      if (!queueWritable) { setQueueNotice('Wait for an available host with guest queue editing enabled.'); return false; }
      return requestQueueChange({type:"queue-batch",queueMedia:parsed.videos.map(video=>describeRoomMedia(video)),skipped:parsed.invalid,duplicates:parsed.duplicates,truncated:parsed.truncated},`${parsed.videos.length} links sent · waiting for host confirmation.`);
    } else {
      const result=queueLinkBatch(parsed.videos.map(video=>describeRoomMedia(video)));
      setQueueNotice(batchQueueNotice({...result,invalid:result.invalid+parsed.invalid,duplicates:result.duplicates+parsed.duplicates},parsed.truncated));
    }
    return true;
  };
  const queueSessionFile = (file:RoomSessionFile) => {
    if(joinedAsGuest){setQueueNotice('Only the host can apply a session file.');return false;}
    const plan=previewRoomSessionImport(file,describeRoomMedia(roomVideoForId(currentVideoIdRef.current)),queueDescriptors(queueRef.current));
    if(!plan.media.length){setQueueNotice('No new session titles fit the current queue. Nothing was changed.');return false;}
    const result=queueLinkBatch(plan.media);
    setQueueNotice('Session file: '+batchQueueNotice(result)+'. The current video and playback settings are unchanged.');
    return result.added>0;
  };
  const queueSavedList = (media: RoomMediaDescriptor[]) => {
    // Revalidate stored descriptors; guests use the same acknowledged batch
    // path and current host policy as pasted links, preserving saved titles.
    const clean = roomQueueDraft(media).media;
    if (!clean.length) { setQueueNotice('This list has no available public links.'); return false; }
    if (joinedAsGuest) {
      if (canSuggest) return requestQueueChange({ type: 'queue-suggest', queueMedia: clean }, 'Saved list sent · waiting for host review confirmation.');
      if (!queueWritable) { setQueueNotice('Wait for an available host with guest queue editing enabled.'); return false; }
      return requestQueueChange({ type: 'queue-batch', queueMedia: clean }, 'Saved list sent · waiting for host confirmation.');
    }
    setQueueNotice('Saved list: ' + batchQueueNotice(queueLinkBatch(clean)) + '. The current video keeps playing.');
    return true;
  };
  const updateQueue = (next: string[]) => {
    if (!joinedAsGuest) { publishQueue(next); return; }
    // Older queue surfaces use a proposed array; translate changes into
    // intentions instead of allowing that stale array to replace host state.
    for (const id of queueRef.current) if (!next.includes(id)) changeQueue({kind:'remove',id});
    for (let index=next.length-1;index>=0;index--) {
      const id=next[index]!;
      if (!queueRef.current.includes(id)) changeQueue({kind:'add',id,before:next[index+1]});
      else if (next.indexOf(id)!==queueRef.current.indexOf(id) && next.length===queueRef.current.length) changeQueue({kind:'move',id,before:next[index+1]});
    }
  };
  const updateLocalQueue = (next: LocalRoomShare[]) => {
    const bounded = normalizeLocalRoomQueue(next);
    if (joinedAsGuest) {
      p2p.send({ type: "local-queue-request", localQueue: bounded, sentAt: Date.now() });
      noteRoom("request", "Sent a local-handoff queue proposal to the host.");
      setInviteNotice("Local handoff proposal sent to the host. It appears once confirmed.");
      return;
    }
    setLocalQueue(bounded);
    p2p.send({ type: "local-queue", localQueue: bounded, sentAt: Date.now() });
    noteRoom("queue", "Published the approved local-handoff queue.");
  };
  const stageLocalShare = (share: LocalRoomShare) => {
    if (joinedAsGuest) {
      p2p.send({ type: "local-stage-request", fingerprint: share.fingerprint, sentAt: Date.now() });
      noteRoom("request", "Requested that the host stage a local handoff.");
      setInviteNotice("Requested that the host stage this local handoff.");
      return;
    }
    if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
      setPendingLocalShare(share);
      setInviteNotice(`Choose ${share.name} on the host before staging its playback stream.`);
      return;
    }
    if (!guestAccess) { setInviteNotice("Confirm guest viewing access in Local sharing before staging this file."); return; }
    const previous = roomVideoForId(currentVideoIdRef.current);
    if (previous?.remote) { const recent = roomRecentMedia([describeRoomMedia(previous), ...recentMediaRef.current]); recentMediaRef.current = recent; setRecentMedia(recent); }
    selectionRevision.current++;
    setSharedVideoId(`local:${share.fingerprint}`);
    setPlayback({ playing: false, position: 0 });
    lastRoomPosition.current = 0;
    p2p.send({ type: "share-ready", ...share });
    p2p.send({ type: "video", videoId: `local:${share.fingerprint}`, selectionRevision: selectionRevision.current, media: describeRoomMedia(undefined, share) });
    p2p.send({ type: "sync", playing: false, position: 0, videoId: `local:${share.fingerprint}`, selectionRevision: selectionRevision.current, seek: true, sentAt: Date.now() });
    setInviteNotice(`${share.name} is staged. Press Play to stream it to every connected guest.`);
  };
  const selectLocalVideo = (file: File | null) => {
    if (!file) return;
    const share: LocalRoomShare = { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified };
    if (joinedAsGuest && !pendingLocalShare) {
      setInviteNotice("Wait for the host’s local-share request before matching a permitted file on this device.");
      return;
    }
    if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
      setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
      return;
    }
    if (!joinedAsGuest) {
      setPickedLocalVideo(file);
      setInviteNotice("File selected. Queue it or share it when ready; the current video keeps playing.");
      return;
    }
    setLocalVideo(file);
    setLocalShare(share);
    if (joinedAsGuest && pendingLocalShare) {
      setSharedVideoId(`local:${share.fingerprint}`);
      setPendingLocalShare(null);
      p2p.send({ type: "share-matched", name: share.name, fingerprint: share.fingerprint });
      setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
      return;
    }
  };
  const preparePickedLocal = (keepCurrent = true) => {
    if (joinedAsGuest || !pickedLocalVideo || !pickedLocalShare || !guestAccess) return undefined;
    const media = describeRoomMedia(undefined, pickedLocalShare);
    const video = resolveRoomMedia(media)?.video;
    if (!media || !video) return undefined;
    localFiles.current.set(video.id, pickedLocalVideo);
    adoptRoomMedia([media], keepCurrent ? [currentVideoIdRef.current, ...queueRef.current, video.id] : [video.id, ...queueRef.current]);
    return video;
  };
  const queuePickedLocal = () => {
    if (queueRef.current.length >= ROOM_QUEUE_LIMIT) {setQueueNotice("The queue is full. Remove a title first.");return;}
    const video = preparePickedLocal();
    if (!video) return;
    if (video.id === currentVideoIdRef.current || queueRef.current.includes(video.id)) {setQueueNotice("That file is already playing or queued.");return;}
    changeQueue({kind:"add",id:video.id},video);
    setQueueNotice(`${video.name} queued. Guests receive the host stream when it plays.`);
  };
  const sharePickedLocal = () => {
    const video = preparePickedLocal(false);
    if (!video || !pickedLocalShare) return;
    chooseVideo(video);
    p2p.send({type:"share-ready",...pickedLocalShare});
    setInviteNotice("Local playback shared. Press Play to stream it to the room; guests do not need a local copy.");
  };
  const queueVideo = (video: LibraryVideo) => {
    if (canSuggest) {
      if (!video.remote) { setQueueNotice('Only public YouTube and Twitch videos can be suggested.'); return; }
      requestQueueChange({type:'queue-suggest',queueMedia:[describeRoomMedia(video)]}, 'Suggestion sent · waiting for host review confirmation.'); return;
    }
    if (video.id !== sharedVideoId && !queue.includes(video.id)) changeQueue({kind:'add',id:video.id},video);
  };
  const queueImmediately = (video: LibraryVideo) => {
    if (video.id === sharedVideoId) return;
    changeQueue({kind:'next',id:video.id},video);
    if (!joinedAsGuest) setInviteNotice(`${video.name} will play next for everyone in the room.`);
  };
  const playNext = () => {
    if (joinedAsGuest) {
      if (!queueWritable) { setQueueNotice('Wait for an available host with guest queue editing enabled.'); return; }
      requestQueueChange({ type: 'next-request', videoId: currentVideoIdRef.current }, 'Next title requested · waiting for host confirmation.'); return;
    }
    const next = nextPlayableRoomTitle(queueRef.current, id => {
      const video = roomVideoForId(id);
      return Boolean(video && canStageRoomVideo(video) && (!id.startsWith('local:') || localFiles.current.has(id)) && !hiddenVideos[id] && !unavailable[id]);
    });
    if (next.skipped) publishQueue(queueRef.current.slice(next.skipped), currentVideoIdRef.current, false);
    if (next.id) chooseVideo(roomVideoForId(next.id)!, true);
    setQueueNotice(next.id ? `${next.skipped ? `${next.skipped} unavailable title${next.skipped === 1 ? '' : 's'} skipped. ` : ''}Playing the next queued video.` : 'The queue is finished. Add more videos when you are ready.');
    return Boolean(next.id);
  };
  const undoLastQueueChange = () => {
    const snapshot = undoQueue.current;
    if (joinedAsGuest || !snapshot || snapshot.revision !== queueRevisionRef.current) return;
    undoQueue.current = undefined; setUndoRevision(undefined);
    adoptRoomMedia(snapshot.media, [currentVideoIdRef.current, ...snapshot.ids]);
    publishQueue(snapshot.ids, currentVideoIdRef.current, false);
    setQueueNotice('Last queue change undone. The current video keeps playing.');
  };
  const restoreSavedQueue = () => {
    if (joinedAsGuest || !savedQueue || queueRef.current.length) return;
    const result = queueLinkBatch(savedQueue.media);
    setQueueNotice(`Recovered saved queue: ${batchQueueNotice(result)}. Press Play next when you are ready.`);
  };
  const queuePanelActions = useRef({
    autoAdvance: (_value: boolean) => {}, select: (_video: LibraryVideo) => {},
    add: (_video: LibraryVideo) => {}, change: (_action: RoomQueueAction) => {}, clear: () => {},
    next: () => {}, shuffle: () => {}, link: (_value: string): boolean => false,
    undo: () => {}, restore: () => {},
    edit: (_edit: RoomQueueEdit): boolean => false,
    loadList: (_media: RoomMediaDescriptor[]): boolean => false,
    importSession: (_file:RoomSessionFile):boolean=>false,
  });
  queuePanelActions.current = {
    autoAdvance: setAutoAdvance,
    select: video => chooseVideo(video, true),
    add: queueVideo,
    change: changeQueue,
    clear: () => updateQueue([]),
    next: playNext,
    shuffle: shuffleQueue,
    link: queuePublicLinks,
    undo: undoLastQueueChange,
    restore: restoreSavedQueue,
    edit: editQueue,
    loadList: queueSavedList,
    importSession: queueSessionFile,
  };
  const onQueueAutoAdvance = useCallback((value: boolean) => queuePanelActions.current.autoAdvance(value), []);
  const onQueueSelect = useCallback((video: LibraryVideo) => queuePanelActions.current.select(video), []);
  const onQueueAdd = useCallback((video: LibraryVideo) => queuePanelActions.current.add(video), []);
  const onQueueChange = useCallback((action: RoomQueueAction) => queuePanelActions.current.change(action), []);
  const onQueueClear = useCallback(() => queuePanelActions.current.clear(), []);
  const onQueueNext = useCallback(() => queuePanelActions.current.next(), []);
  const onQueueShuffle = useCallback(() => queuePanelActions.current.shuffle(), []);
  const onQueueLink = useCallback((value: string) => queuePanelActions.current.link(value), []);
  const onQueueUndo = useCallback(() => queuePanelActions.current.undo(), []);
  const onQueueRestore = useCallback(() => queuePanelActions.current.restore(), []);
  const onQueueEdit = useCallback((edit: RoomQueueEdit) => queuePanelActions.current.edit(edit), []);
  const onQueueLoadList = useCallback((media: RoomMediaDescriptor[]) => queuePanelActions.current.loadList(media), []);
  const onImportSession = useCallback((file:RoomSessionFile)=>queuePanelActions.current.importSession(file),[]);
  const onGuestQueueEditing = useCallback((value: boolean) => {
    reviewRevision.current++; setGuestQueueEnabled(value);
    try { localStorage.setItem('reelcase.watch-room.guest-queue', String(value)); } catch { /* Active-room setting still applies. */ }
  }, []);
  const recommendationSelectRef = useRef<(video: LibraryVideo) => void>(() => {});
  recommendationSelectRef.current = video => chooseVideo(video);
  const onRecommendationSelect = useCallback((video: LibraryVideo) => recommendationSelectRef.current(video), []);
  const onMixRecommendations = useCallback(() => { setCandidateSeed(Date.now()); setRoomPickLimit(18); }, []);
  const onLoadRecommendations = useCallback(() => setRoomPickLimit(limit => Math.min(roomCandidates.length, limit + 18)), [roomCandidates.length]);
  const queueCurrentMedia=useMemo(()=>describeRoomMedia(sharedVideo),[sharedVideo]);
  const queuePanelRows = useMemo(() => queue.map(id => ({
    id,
    video: joinedAsGuest ? sharedRoomVideos[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideos[id],
  })), [joinedAsGuest, queue, sharedRoomVideos, videos]);
  const finishRoomTitle = () => {
    if (joinedAsGuest || !playback.playing || sharedVideoId !== currentVideoIdRef.current || lastEndedTitle.current===sharedVideoId) return;
    lastEndedTitle.current=sharedVideoId;
    if (autoAdvance && queueRef.current.length && playNext()) return;
    sync({ playing: false, position: roomDuration() ?? currentHostClock() }, false, true);
    setQueueNotice(queueRef.current.length ? 'Video finished. Automatic next is off; choose Play next when ready.' : 'Queue finished. Add more videos or press Play to replay this video.');
  };
  const finishLatestRoomTitle=useRef(finishRoomTitle);
  finishLatestRoomTitle.current=finishRoomTitle;
  useEffect(()=>{lastEndedTitle.current='';youtubeFailure.current=undefined;setPlayerNotice('');youtubeClock.current=undefined;youtubeReady.current=false;youtubeMetadataReady.current='';lastYoutubePlaybackCommand.current=null;catchUpOnStart.current=true;},[sharedVideoId]);
  const reloadThisPlayer = () => {
    suppressRemotePlayerEchoUntil.current = Date.now() + 1500;
    youtubeFailure.current=undefined;
    youtubeReady.current=false;youtubeClock.current=undefined;youtubeMetadataReady.current='';lastYoutubePlaybackCommand.current=null;catchUpOnStart.current=true;setRemoteFrameReady(null); setRemoteSeekNonce(value => value + 1); setPlayerReload(value => value + 1);
    setPlayerNotice('Reloading this player only. The shared video, queue and room clock stay in place.');
  };
  const reloadPlayerRef=useRef(reloadThisPlayer);reloadPlayerRef.current=reloadThisPlayer;
  const onReloadThisPlayer=useCallback(()=>reloadPlayerRef.current(),[]);
  const jumpToRoomPart = (target: HTMLElement | null, control: string) => {
    if (!target) return;
    const input=target.querySelector<HTMLElement>(control);
    if(control.includes('Search room videos') && input){const details=input.closest('details');if(details)details.open=true;input.scrollIntoView({block:'center',behavior:'instant'});}
    else target.scrollIntoView({ block: 'start', behavior: 'instant' });
    input?.focus({ preventScroll: true });
  };
  const waitForPlayersRef=useRef(()=>{});waitForPlayersRef.current=()=>{if(!joinedAsGuest)sync({playing:false,position:currentHostClock()});};
  const onWaitForPlayers=useCallback(()=>waitForPlayersRef.current(),[]);
  const recentQueuedKeys = useMemo(() => queuePanelRows.flatMap(row => row.video ? [roomMediaKey(row.video)] : []), [queuePanelRows]);
  useEffect(()=> {
    try {localStorage.setItem('reelcase.watch-room.auto-advance',String(autoAdvance));}catch{/* Session preference. */}
  },[autoAdvance]);
  const youtubeMessages=useRef<(data:{event?:string;info?:unknown})=>void>(()=>{});
  youtubeMessages.current=data=>{
    if (sharedVideo?.remote?.kind!=='youtube') return;
    if (data.event==='onError') {const notice=roomYoutubeError(data.info);if(notice){youtubeFailure.current='error';youtubeDiagnostics.record('error',data.info);observePlayer('error');setPlayerNotice(notice);}return;}
    if (data.event==='onAutoplayBlocked') {youtubeDiagnostics.record('blocked');observePlayer('blocked');catchUpOnStart.current=true;setPlayerNotice('Your browser blocked autoplay. It needs a tap. Choose Start on this device, or press Play inside the video. The room keeps playing.');return;}
    if(data.event==='onReady' && !youtubeReady.current){if(youtubeFailure.current==='timeout')youtubeFailure.current=undefined;youtubeDiagnostics.record('ready');observePlayer('ready');youtubeReady.current=true;lastYoutubeSeekNonce.current=-1;lastYoutubePlaybackCommand.current=null;setRemoteSeekNonce(value=>value+1);}
    const info=data.info && typeof data.info==='object'?data.info as {playerState?:unknown;currentTime?:unknown;duration?:unknown}:undefined;
    const live=youtubeLiveInfo(info,sharedVideo.remote.videoId ?? '');
    if(live===true && !isRoomLive()) markRoomLive(sharedVideo.id);
    // A positive duration cannot distinguish a VOD from a live broadcast.
    // Wait for explicit iframe/host classification before the first VOD seek.
    if (youtubeMetadataReady.current!==sharedVideo.id && live!==undefined) {
      youtubeMetadataReady.current=sharedVideo.id;lastYoutubeSeekNonce.current=-1;setRemoteSeekNonce(value=>value+1);
    }
    const state=typeof info?.playerState==='number'?info.playerState:data.event==='onStateChange' && typeof data.info==='number'?data.info:undefined;
    // A delayed clock sample cannot clear a failure; require a fresh play event.
    if(youtubeFailure.current&&!(state===1&&data.event==='onStateChange'))return;
    if(state===1){youtubeFailure.current=undefined;youtubeDiagnostics.record('playing');}
    if(state!==undefined){const status=state===1?'playing':state===2?'paused':state===3?'buffering':state===0?'ended':state===5?'ready':undefined;if(status)observePlayer(status);}
    const previous=youtubeClock.current;
    if(typeof info?.currentTime==='number' && Number.isFinite(info.currentTime) && info.currentTime>=0 && info.currentTime<=43200) {
      youtubeClock.current={id:sharedVideo.id,position:info.currentTime,state:state ?? previous?.state ?? -1,at:performance.now()};
    } else if(state!==undefined) {
      youtubeClock.current={id:sharedVideo.id,position:providerPosition(previous,sharedVideo.id,performance.now()) ?? lastRoomPosition.current,state,at:performance.now()};
    }
    if (!isRoomLive() && typeof info?.duration==='number' && Number.isFinite(info.duration) && info.duration>0 && info.duration<=43200 && measuredDuration?.videoId!==sharedVideo.id) setMeasuredDuration({videoId:sharedVideo.id,seconds:info.duration});
    const actual=providerPosition(youtubeClock.current,sharedVideo.id,performance.now());
    if(!joinedAsGuest && actual!==undefined){lastRoomPosition.current=actual;youtubePlaybackStartedAt.current=youtubeClock.current?.state===1?Date.now()-actual*1000:null;}
    if(state===1){setPlayerNotice('');if(joinedAsGuest)alignAfterStart.current();else if(data.event==='onStateChange' && !playback.playing && Date.now()>suppressRemotePlayerEchoUntil.current)providerSync.current({playing:true,position:actual ?? playback.position});}
    if(data.event==='onStateChange' && state===2 && !joinedAsGuest && playback.playing && Date.now()>suppressRemotePlayerEchoUntil.current)providerSync.current({playing:false,position:actual ?? playback.position});
    if(joinedAsGuest && !isRoomLive() && youtubeMetadataReady.current===sharedVideo.id && playback.playing && hostClockRunning && youtubeClock.current?.state===1 && !catchUpOnStart.current && Date.now()>suppressRemotePlayerEchoUntil.current && providerNeedsCorrection(actual,providerTarget(),performance.now(),lastProviderCorrection.current)){
      lastProviderCorrection.current=performance.now();suppressRemotePlayerEchoUntil.current=Date.now()+1200;
      remoteFrameRef.current?.contentWindow?.postMessage(JSON.stringify({event:'command',func:'seekTo',args:[providerTarget(),true]}),new URL(watchRoomEmbed(sharedVideo)).origin);
    }
    if(state===0)finishLatestRoomTitle.current();
  };
  useEffect(()=>{
    if(sharedVideo?.remote?.kind!=='youtube')return;
    const listener=(event:MessageEvent)=>{
      if(event.source!==remoteFrameRef.current?.contentWindow || event.origin!==new URL(watchRoomEmbed(sharedVideo)).origin)return;
      try{const data=typeof event.data==='string'?JSON.parse(event.data):event.data;if(data && typeof data==='object')youtubeMessages.current(data);}catch{}
    };
    window.addEventListener('message',listener);return()=>window.removeEventListener('message',listener);
  },[sharedVideo?.id,playerReload]);
  useEffect(()=>{
    if(sharedVideo?.remote?.kind!=='youtube'||remoteFrameReady?.id!==sharedVideo.id)return;
    let attempts=0;
    const handshake=()=>{
      const target=new URL(watchRoomEmbed(sharedVideo)).origin,frame=remoteFrameRef.current?.contentWindow;
      frame?.postMessage(JSON.stringify({event:'listening',id:'room-youtube'}),target);
      for(const event of ['onReady','onStateChange','onError','onAutoplayBlocked'])frame?.postMessage(JSON.stringify({event:'command',func:'addEventListener',args:[event]}),target);
      if (++attempts>=20 || youtubeReady.current) {window.clearInterval(timer);if(!youtubeReady.current&&youtubeFailure.current!=='error'){youtubeFailure.current='timeout';youtubeDiagnostics.record('timeout');}}
    };
    const timer=window.setInterval(handshake,500);handshake();return()=>window.clearInterval(timer);
  },[sharedVideo?.id,remoteFrameReady]);
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setChat((rows) => [...rows, `You: ${text}`].slice(-50));
    p2p.send({ type: "chat", text, name: name.trim() || "Guest" });
    setMessage("");
  };
  if (!activeRoom)
    return (
      <HubShell
        eyebrow="LAN watch room"
        icon={<Users className="size-4" />}
        title="Watch together, on your terms."
        copy="Create a private room code or join one on the same network. Peers exchange names, chat, and playback commands over a direct or configured relay path."
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Create a room
            </p>
            <p className="mt-3 font-mono text-3xl tracking-[0.16em] text-fg">{roomCode}</p>
            <p className="mt-2 text-sm text-muted">
              Share this code only with people you want in your watch room.
            </p>
            <RoomInvitation invitation={invitation} started={false} onNotice={setInviteNotice}/>
            {!roomInvite && <p className="mt-2 text-xs leading-5 text-muted">This localhost address opens only on this computer. Use the home-network address in the Connection guide before sharing with another device. <button type="button" className="text-accent underline" onClick={() => useLibrary.getState().setSource("connection")}>Open Connection guide</button></p>}
            {inviteNotice && <p className="mt-2 break-all text-xs text-accent">{inviteNotice}</p>}
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setJoinedAsGuest(false);
                localStorage.setItem("reelcase.watch-room.last-host", roomCode);
                setRecentLocalRoom(roomCode);
                setActiveRoom(roomCode);
              }}
            >
              <Wifi className="size-4" /> Start room
            </Button>
            {savedQueue && /^RC[A-Z0-9]{4,12}$/.test(recentLocalRoom) && <Button variant="secondary" className="mt-2 min-h-11 w-full" onClick={() => {
              setRoomCode(recentLocalRoom); setJoinedAsGuest(false); setActiveRoom(recentLocalRoom);
            }}>Resume last room · {recentLocalRoom}</Button>}
            {savedQueue && <p className="mt-2 text-xs leading-5 text-muted">{savedQueue.media.length} public link{savedQueue.media.length === 1 ? '' : 's'} saved from your last queue. Restore them inside the room without starting playback.</p>}
            <p className="mt-3 text-xs leading-5 text-subtle">Testing on one computer? Start the room first, then use <strong className="text-fg">Open local guest window</strong> inside the room. A second browser window is a separate peer; a single tab cannot chat with itself.</p>
          </div>
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Join a theater
            </p>
            <p className="mt-2 text-sm text-muted">
              Guests enter a focused theater view first; controls and chat stay available beside the
              screen.
            </p>
            <Input
              className="mt-3"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value.toUpperCase())}
              placeholder="Enter room code"
              aria-label="Watch room code"
            />
            {recentLocalRoom && recentLocalRoom !== roomInput && <Button size="sm" variant="secondary" className="mt-2" onClick={() => { setRoomInput(recentLocalRoom); setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`); }}>Join local host · {recentLocalRoom}</Button>}
            <Input
              className="mt-2"
              value={name}
              maxLength={64}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your display name"
              aria-label="Your display name"
            />
            <Button
              variant="secondary"
              className="mt-3 w-full"
              disabled={!roomInput.trim()}
              onClick={() => {
                setJoinedAsGuest(true);
                setStageSize("cinema");
                setActiveRoom(roomInput.trim());
              }}
            >
              Join theater
            </Button>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local friends</p>
              <p className="mt-1 text-xs leading-5 text-muted">Save a trusted friend name and their current room code for one-tap joining on this network.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><Input value={friendName} onChange={(event) => setFriendName(event.target.value)} placeholder="Friend name" aria-label="Friend name"/><Input value={friendCode} onChange={(event) => setFriendCode(event.target.value.toUpperCase())} placeholder="Room code" aria-label="Friend room code"/></div>
              <Button size="sm" variant="secondary" className="mt-2" disabled={!friendName.trim() || !friendCode.trim()} onClick={() => { const next = [{ name: friendName.trim(), code: friendCode.trim() }, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16); setFriends(next); localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next)); setFriendName(""); setFriendCode(""); }}>Save friend</Button>
              {friends.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{friends.map((friend) => <Button key={`${friend.name}-${friend.code}`} size="sm" variant="secondary" onClick={() => { setRoomInput(friend.code); setName(friend.name); }}>{friend.name} · {friend.code}</Button>)}</div>}
            </div>
          </div>
        </div>
      </HubShell>
    );
  return (
    <HubShell
      eyebrow="Connected watch room"
      icon={<Users className="size-4" />}
      title={joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`}
      copy={
        joinedAsGuest
          ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles."
          : "Peer connection for your selected guests. Playback events are synchronized across connected devices."
      }
    >
      <nav aria-label="Watch room shortcuts" className="sticky top-0 z-20 mt-4 min-w-0 rounded-lg border border-border bg-surface p-2 shadow-border">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomStage.current, 'iframe, video')}><MonitorPlay className="size-4" />Player</Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomQueueAnchor.current, 'h3')}><ListVideo className="size-4" />Queue · {queue.length}</Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomQueueAnchor.current, '[aria-label="Search room videos"]')}><Search className="size-4"/>Find videos</Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomHistoryAnchor.current, 'h3')}><History className="size-4"/>History</Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomParticipationAnchor.current, 'h3')}><Users className="size-4" />Ready & votes</Button>
        <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(roomChat.current, 'input')}><MessageCircle className="size-4" />Chat</Button>
        {(reviewQueue || suggestions.length > 0) && <Button size="sm" variant="secondary" className="min-h-11" onClick={() => jumpToRoomPart(requestsAnchor.current, 'h3')}>Requests · {suggestions.length}</Button>}
        </div>
        <p className="mt-1 truncate px-1 text-xs text-muted">Next: {queuePanelRows[0]?.video?.name ?? 'Add a video to the queue'}</p>
      </nav>
      <div data-room-layout={stageSize} className={`mt-4 grid min-w-0 items-start gap-4 ${stageSize==='cinema'?'':'lg:grid-cols-[minmax(0,1.7fr)_minmax(22rem,0.8fr)]'}`}>
        <div className="min-w-0 rounded-lg bg-elevated p-3 shadow-border sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Synchronized playback
            </p>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Radio className={`size-3 ${p2p.joined ? "text-accent" : "text-subtle"}`} />
              {p2p.joined ? "Signaling online" : "Connecting…"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={!p2p.joined} onClick={() => {
              const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
              const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
              setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
            }}>Open local guest window</Button>
            <Button size="sm" variant="ghost" onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ room: activeRoom, invitation: roomInvite, invitationNote: roomInvite ? undefined : "Open Realhub from a home-network address before sharing this room with another device.", role: joinedAsGuest ? "guest" : "host", self: p2p.selfId, signaling: p2p.joined, peers: p2p.peers, transportTest: pulseStatus, reliability: roomHealth, ledger: roomLedger, events: p2p.events, capturedAt: new Date().toISOString() }, null, 2)).then(() => setInviteNotice("Connection and reconciliation diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic."))}>Copy room diagnostic</Button>
          </div>
          {!roomInvite && <p className="mt-2 text-xs leading-5 text-muted">A localhost invitation cannot open on another device. Open this room through the home-network address before sharing. <button type="button" className="text-accent underline" onClick={() => useLibrary.getState().setSource("connection")}>Open Connection guide</button></p>}
          <details className="mt-3 rounded-sm bg-bg/45 p-3"><summary className="cursor-pointer text-xs font-medium text-fg">Connection details · {p2p.peers.filter((peer) => peer.connectionState === "connected").length}/{p2p.peers.length} connected</summary>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Connection signals</p><span className="text-xs text-muted">{p2p.peers.filter((peer) => peer.connectionState === "connected").length}/{p2p.peers.length} connected · {p2p.peers.filter((peer) => peer.connectionState === "connected" && peer.candidateType === "relay").length} relayed</span></div>
            <RoomRelaySettings config={relayConfig} onChange={setRelayConfig} />
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted">{p2p.events.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}</div>
            {!p2p.peers.length && p2p.joined && <p className="mt-2 text-xs text-accent">Signaling is healthy, but no peer is in <strong>{activeRoom}</strong>. The other window must join this exact code—not create its own. Use Open local guest window or copy this room link.</p>}
            {p2p.peers.length > 0 && <div className="mt-2 space-y-1 text-xs text-muted">{p2p.peers.map((peer) => <p key={peer.id}><strong className="text-fg">{peer.name || "Guest"}</strong> · {peer.connectionState} · {peer.candidateType ?? "path pending"} · {peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`} · {peer.id.slice(-6)}</p>)}</div>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" disabled={!p2p.peers.some((peer) => peer.connectionState === "connected")} onClick={() => { setPulseStatus("Sending chat transport test…"); p2p.send({ type: "room-pulse", sentAt: Date.now() }); }}>Test chat transport</Button><span className="text-xs text-muted">{pulseStatus}</span></div>
          </details>
          <h2 className="mt-2 font-display text-3xl text-fg">
            {playback.playing && sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchActuallyPlaying ? "Twitch waiting for playback" : playback.playing ? "Playing together" : "Paused together"}
          </h2>
          <p className="mt-2 text-sm text-muted" aria-label="Room playback time" data-room-clock={playback.position}>
            Timeline {Math.floor(playback.position / 60)}:
            {String(Math.floor(playback.position % 60)).padStart(2, "0")} · {timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate"} · checked {new Date(timelineEvidence.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}.
          </p>
          <section aria-label="Room playback permissions" className="mt-3 rounded-md border border-border bg-bg/45 p-3">{joinedAsGuest?<p className="text-xs leading-5 text-muted">Your room controls · {guestPlaybackEnabled?'Play/pause allowed':'Host controls play/pause'} · {guestSeekingEnabled?'Seeking allowed for videos':'Host controls seeking'}. You can still start or reload your own device, join the ready check and vote for what’s next.</p>:<><p className="text-sm font-medium text-fg">Guest playback controls</p><label className="mt-2 flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" aria-label="Allow guests to play and pause" checked={guestPlaybackEnabled} onChange={event=>{const value=event.target.checked;reviewRevision.current++;setGuestPlaybackEnabled(value);try{localStorage.setItem('reelcase.watch-room.guest-playback',String(value));}catch{}}}/>Allow guests to play and pause</label><label className="flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" aria-label="Allow guests to seek videos" checked={guestSeekingEnabled} onChange={event=>{const value=event.target.checked;reviewRevision.current++;setGuestSeekingEnabled(value);try{localStorage.setItem('reelcase.watch-room.guest-seeking',String(value));}catch{}}}/>Allow guests to seek videos</label><p className="text-xs leading-5 text-muted">Playback and seeking are independent from queue access. Live streams keep their own clocks. Ready checks and votes remain available when controls are locked.</p></>}</section>
          {joinedAsGuest && <RoomGuestTiming offset={guestOffset} position={adjustedTimerPosition} adjustsPlayback={timingAdjustsPlayback} onChange={changeGuestOffset}/>}
          <details className="mt-4 rounded-md border border-border bg-bg/45 p-3" aria-label="Room reliability"><summary className="cursor-pointer text-xs font-medium text-fg">Room reliability · r{roomHealth.queueRevision} · {roomHealth.staleDropped} stale commands dropped</summary>
            <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Room reliability</p><p className="mt-1 text-xs text-muted">{joinedAsGuest ? "Guest commands are requests; the host publishes the canonical state." : "This device is the host and publishes the canonical state."}</p></div><span className="rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">{p2p.peers.some((peer) => peer.connectionState === "connected" && peer.candidateType === "relay") ? "TURN relay connected" : p2p.peers.some((peer) => peer.connectionState === "connected" && ["host", "srflx", "prflx"].includes(peer.candidateType ?? "")) ? "direct path connected" : p2p.peers.some((peer) => peer.connectionState === "connected") ? "connected · path pending" : p2p.joined ? "signaling online · peer pending" : "connecting"}</span></div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">{joinedAsGuest ? "Last host state" : "Last publish"}</span><strong className="mt-1 block text-fg">{roomTimeLabel(joinedAsGuest ? roomHealth.lastHostStateAt : roomHealth.lastPublishedAt)}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Queue revision</span><strong className="mt-1 block text-fg">r{roomHealth.queueRevision} · {queue.length} title{queue.length === 1 ? "" : "s"}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Last correction</span><strong className="mt-1 block text-fg">{roomHealth.lastDriftSeconds ? `${roomHealth.lastDriftSeconds.toFixed(1)}s` : "none needed"}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Safety checks</span><strong className="mt-1 block text-fg">{roomHealth.staleDropped} stale dropped · {roomHealth.resyncRequests} resync</strong></div></div>
            <details className="mt-3 rounded-sm bg-elevated p-2 text-xs text-muted"><summary className="cursor-pointer font-medium text-fg">Session ledger · {roomLedger.length} local event{roomLedger.length === 1 ? "" : "s"}</summary><div className="mt-2 max-h-32 space-y-1 overflow-y-auto">{roomLedger.length ? roomLedger.slice().reverse().map((event, index) => <p key={`${event.at}-${index}`}><span className="font-mono text-subtle">{roomTimeLabel(event.at)}</span> · {event.detail}</p>) : <p>No room decisions recorded yet.</p>}</div></details>
          </details>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={toggleRoomPlayback} disabled={joinedAsGuest && !guestPlaybackEnabled}>
              {playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playback.playing ? "Pause" : "Play"}
            </Button>
            <Button
              variant="secondary"
              disabled={Boolean(sharedVideo?.remote?.live) || joinedAsGuest && !guestSeekingEnabled}
              onClick={() => sync({ ...playback, position: clampRoomClock(playback.position - 15) }, true)}
            >
              −15 sec
            </Button>
            <Button
              variant="secondary"
              disabled={Boolean(sharedVideo?.remote?.live) || joinedAsGuest && !guestSeekingEnabled}
              onClick={() => sync({ ...playback, position: clampRoomClock(playback.position + 15) }, true)}
            >
              +15 sec
            </Button>
            <Button variant="secondary" onClick={resync}>
              <Wifi className="size-4" /> {joinedAsGuest ? "Request resync" : "Resync guests"}
            </Button>
            <Button variant="ghost" size="sm" disabled={!queueWritable || !queue.length || joinedAsGuest && pendingQueueChanges > 0} onClick={playNext}>
              {joinedAsGuest ? "Request next" : "Play next"} {queue.length ? `(${queue.length})` : ""}
            </Button>
          </div>
          {!joinedAsGuest&&<details className="mt-3 rounded-md border border-border p-3"><summary className="min-h-11 cursor-pointer text-sm font-medium text-fg">Guest library browsing</summary><label className="mt-2 flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" checked={catalogShared} onChange={event=>setCatalogShared(event.target.checked)} aria-label="Let guests search my library"/>Let guests search my public video library</label><label className="flex min-h-11 items-center gap-2 text-xs text-muted"><input type="checkbox" checked={localTitlesShared} disabled={!catalogShared} onChange={event=>setLocalTitlesShared(event.target.checked)} aria-label="Include local video titles for guests"/>Include local video titles</label><p className="mt-1 text-xs leading-5 text-muted">Guests receive one page of matching titles. File paths and handles stay on this device. Queue edits still follow your guest access and review settings.</p></details>}
          {inviteNotice && <p className="mt-3 text-xs text-accent">{inviteNotice}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Stage size</span>
            {(["compact", "theater", "cinema"] as const).map((size) => (
              <Button
                key={size}
                size="sm"
                variant={stageSize === size ? "default" : "secondary"}
                aria-pressed={stageSize===size}
                onClick={() => setStageSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
          <div
            ref={roomStage}
            data-room-stage={stageSize}
            className={`mt-3 mx-auto w-full max-w-full scroll-mt-36 overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "max-w-md" : ""}`}
          >
            {guestLocalStream ? <RoomStreamPlayer stream={guestLocalStream} title={sharedVideo?.name ?? sharedLocalMedia?.name ?? "Host video"} playing={playback.playing} position={playback.position} duration={roomDuration()} onPlayback={playing=>sync({...playback,playing},false,true)} onSeek={position=>sync({...playback,position},true,true)} onResync={resync} onReadiness={observePlayer}/> : matchingLocalSource && localShareIsMatched ? (
              <video
                key={sharedVideoId}
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={matchingLocalSource}
                controls
                playsInline
                {...nativePlayerReadiness}
                onLoadedMetadata={() => { observePlayer("ready");const seconds = roomVideoRef.current?.duration; if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({ videoId: sharedVideoId, seconds }); }}
                onEnded={()=>{observePlayer("ended");finishRoomTitle();}}
                onPlay={() => syncDevicePlayback({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })}
                onPause={() => {observePlayer("paused");syncDevicePlayback({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 });}}
                onSeeked={() => syncDevicePlayback({ playing: roomVideoRef.current ? !roomVideoRef.current.paused : false, position: roomVideoRef.current?.currentTime ?? 0 }, true)}
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : sharedVideo?.remote?.kind === "twitch" && twitchEnvironment.blocked ? (
              <section aria-label="Twitch embed setup" className="space-y-3 p-5 text-sm text-muted"><h3 className="font-display text-xl text-fg">Twitch needs an HTTPS room address</h3><p>This device opened the room through an HTTP network address. Twitch requires HTTPS for embedded viewing. Ask the host to share an HTTPS invitation from Join on your phone, then rejoin with that link.</p><p>Your chat, queue and votes still work here. Open on Twitch below plays outside the room and cannot synchronize its video.</p></section>
            ) : sharedVideo?.remote?.kind === "twitch" && !twitchClip ? (
              <div className="w-full overflow-x-auto bg-bg" aria-label="Twitch player viewport">
                <div className="relative aspect-video w-full" style={{ minWidth: 400, minHeight: 300 }}><div ref={twitchPlayerHostRef} className="absolute inset-0" /></div>
              </div>
            ) : twitchClip && sharedVideo?.remote?.embedUrl ? (
              <div className="w-full overflow-x-auto" aria-label="Twitch player viewport"><iframe title={sharedVideo.name} key={sharedVideo.id + ':' + playerReload} src={watchRoomEmbed(sharedVideo)} className="aspect-video w-full border-0" style={{ minWidth: 400, minHeight: 300 }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
            ) : sharedVideo?.remote?.embedUrl ? (
              <iframe
                ref={remoteFrameRef}
                key={`${sharedVideo.id}:${playerReload}`}
                title={sharedVideo.name}
                src={watchRoomEmbed(sharedVideo)}
                className="aspect-video w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => {youtubeReady.current=false;youtubeClock.current=undefined;youtubeMetadataReady.current='';catchUpOnStart.current=true;lastYoutubeSeekNonce.current=-1;lastYoutubePlaybackCommand.current=null;setRemoteFrameReady({id:sharedVideo.id,at:Date.now()});}}
              />
            ) : libraryLocalSource ? (
              <video
                key={sharedVideoId}
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={libraryLocalSource}
                controls
                playsInline
                {...nativePlayerReadiness}
                onLoadedMetadata={() => { observePlayer("ready");const seconds = roomVideoRef.current?.duration; if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({ videoId: sharedVideoId, seconds }); }}
                onEnded={()=>{observePlayer("ended");finishRoomTitle();}}
                onPlay={() =>
                  syncDevicePlayback({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onPause={() => {observePlayer("paused");syncDevicePlayback({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 });}}
                onSeeked={() =>
                  syncDevicePlayback({
                    playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
                    position: roomVideoRef.current?.currentTime ?? 0,
                  }, true)
                }
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-sm text-muted">
                <img src="/art/realhub-projector.webp" alt="" loading="lazy" className="mb-2 h-28 w-36 object-contain" />
                {sharedLocalMedia?.id === sharedVideoId ? `Waiting for the host to play ${sharedLocalMedia.name}. Local video streams directly to this device once playback starts.` : sharedVideoId.startsWith("local:") ? "Waiting for the host’s local video stream or a matching file on this device." : "Choose a starter movie or an online video to show it to the room."}
              </div>
            )}
          </div>
          {sharedVideo?.remote?.kind === 'twitch' && !twitchEnvironment.blocked && <div className="mt-2 text-xs leading-5 text-muted">{!twitchClip && <p role="status">{twitchPlayerStatus}</p>}<p className="sm:hidden">Twitch needs a player at least 400 × 300 pixels. Swipe inside its player area to reach the edges, or turn your phone sideways.</p></div>}
          {sharedVideo?.remote?.kind==='youtube'?<YoutubeEmbedRecovery key={room} videoId={sharedVideo.remote.videoId??''} rows={youtubeDiagnostics.rows} notice={playerNotice} onReload={onReloadThisPlayer} onClearEarlier={youtubeDiagnostics.clearEarlier}/>:sharedVideo?.remote && <div className="mt-3 rounded-md border border-border bg-bg/45 p-3" aria-label="Player recovery"><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" className="min-h-11" onClick={reloadThisPlayer}><RefreshCw className="size-3" />Reload this player</Button>{sharedVideo.remote.watchUrl && <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs text-accent hover:bg-elevated"><ExternalLink className="size-3" />Open on {sharedVideo.remote.kind === "twitch" ? "Twitch" : "provider"}</a>}<p className="text-xs text-muted">Affects this device. Use Play next to change the room video.</p></div>{playerNotice && <p role="status" className="mt-2 text-xs leading-5 text-accent">{playerNotice}</p>}</div>}
          {localStream.status && <p className="mt-2 text-xs text-muted">{localStream.status}</p>}
          {joinedAsGuest && sharedVideo?.remote && !twitchClip && !(sharedVideo.remote.kind === "twitch" && twitchEnvironment.blocked) && <div className="mt-3 rounded-md border border-border bg-bg/45 p-3" aria-label="Start phone playback"><Button variant="secondary" className="min-h-11" onClick={startThisDevice}>Start on this device</Button><p className="mt-2 text-xs leading-5 text-muted">{sharedVideo.remote.live ? 'If this phone needs a tap, start here or press Play inside the video. This starts your live player without pausing everyone. YouTube and Twitch control each viewer’s live delay.' : 'If this phone needs a tap, start here or press Play inside the video. Your player catches up with the host without pausing everyone. Returning from the lock screen requests fresh timing automatically.'}</p></div>}
          {guestLocalStream && <p className="mt-2 text-xs text-muted">Watching the host’s local video. Use the room controls to pause or seek for everyone.</p>}
          {sharedVideo?.remote?.kind === "youtube" ? (
            <p className="mt-2 text-xs text-subtle">
              {sharedVideo.remote.live ? 'YouTube Live · Play and pause are shared. Each viewer buffers independently; YouTube may give viewers different live delays. Live playback keeps its own clock.' : 'YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command.'}
            </p>
          ) : sharedVideo?.remote?.kind === "twitch" && twitchClip ? (
            <p className="mt-2 text-xs text-subtle">Twitch clips use Twitch’s separate clip player. Use its own controls to watch; room selection and chat remain shared. If Twitch shows a content classification error, <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="text-accent underline">open the clip directly</a>.</p>
          ) : sharedVideo?.remote?.kind === "twitch" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle"><p><strong className="text-fg">Twitch currently needs one manual Play press in each viewer’s embed.</strong> Browser media rules prevent Realhub from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls.</p>{sharedVideo.remote.watchUrl && <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><ExternalLink className="mr-1 size-3"/>Open Twitch directly</a>}</div>
          ) : null}
          {sharedVideo && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 p-3"><span className="mr-auto min-w-0 truncate text-sm font-medium text-fg">{sharedVideo.name}</span><Button size="sm" variant={favorites[sharedVideo.id] ? "default" : "secondary"} onClick={() => toggleFavorite(sharedVideo.id)}><Heart className={`size-4 ${favorites[sharedVideo.id] ? "fill-current" : ""}`} />{favorites[sharedVideo.id] ? "Favorited" : "Favorite"}</Button><div className="flex items-center gap-1" aria-label="Rate current room video">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className="flex size-9 items-center justify-center rounded-md text-accent hover:bg-elevated" aria-label={`Rate ${sharedVideo.name} ${value} stars`} aria-pressed={roomRating === value} onClick={() => { saveRating(sharedVideo.id, roomRating === value ? 0 : value); setRoomRatingRevision((revision) => revision + 1); }}><Star className={`size-4 ${value <= roomRating ? "fill-current" : ""}`} /></button>)}</div></div>}
          <details className="mt-5 rounded-md border border-border bg-bg/35 p-3"><summary className="cursor-pointer text-sm font-medium text-fg">Explore more videos and advanced queue controls</summary><p className="mt-3 text-xs text-muted">Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage.</p>
          <RoomRecommendations videos={roomCandidates} youtubeVideos={youtubeRoomCandidates} currentId={sharedVideoId} visibleCount={roomPickLimit} pending={roomCandidatesPending} onSelect={onRecommendationSelect} onMix={onMixRecommendations} onLoadMore={onLoadRecommendations}/>
          <div className="mt-3 rounded-md bg-bg/45 p-3 shadow-border">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-fg">Up next queue</p>
              <span className="text-xs text-muted">{joinedAsGuest ? "Propose changes; host confirms the shared order" : "Host-controlled shared order"}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">The shared queue beside chat is the confirmed order. Add a recommendation below without interrupting the current video.</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {roomCandidates
                    .filter((video) => video.id !== sharedVideoId)
                .slice(0, 12)
                .map((video) => (
                  <span key={video.id} className="inline-flex shrink-0 overflow-hidden rounded-sm shadow-border">
                    <Button size="sm" variant="secondary" onClick={() => queueImmediately(video)}>Play next</Button>
                    <Button size="sm" variant="ghost" disabled={queue.includes(video.id)} onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>
                  </span>
                ))}
            </div>
            {queueRecommendations.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">More queue ideas</p><span className="text-xs text-muted">Different from the theater picks above</span></div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {queueRecommendations.map((video) => (
                  <span key={video.id} className="inline-flex shrink-0 overflow-hidden rounded-sm shadow-border">
                    <Button size="sm" variant="secondary" onClick={() => queueImmediately(video)}>Play next</Button>
                    <Button size="sm" variant="ghost" onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>
                  </span>
                ))}
              </div>
            </div>}
            {localQueueCandidates.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Ready local files</p><span className="text-xs text-muted">Add to queue without opening now</span></div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {localQueueCandidates.map((video) => <Button key={video.id} size="sm" variant="ghost" onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>)}
              </div>
            </div>}
            {localQueue.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Approved local handoffs</p><span className="text-xs text-muted">Shared manifest · files stay on each device</span></div>
              <div className="mt-2 space-y-2">{localQueue.map((share) => <div key={share.fingerprint} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2"><span className="min-w-0 truncate text-xs text-fg">{share.name} · {bytes(share.size)}</span><div className="flex gap-1"><Button size="sm" variant="secondary" onClick={() => stageLocalShare(share)}>Stage</Button><Button size="sm" variant="ghost" onClick={() => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint))}>Remove</Button></div></div>)}</div>
            </div>}
          </div></details>
          <details className="mt-4 rounded-md border border-border bg-bg/35 p-3" onToggle={event => setRoomLocalToolsOpen(event.currentTarget.open)}><summary className="cursor-pointer text-sm font-medium text-fg">Local sharing, games & TV</summary>
          <div className="mt-5 rounded-md bg-bg/45 p-4 shadow-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-accent" />
              <p className="text-sm font-medium text-fg">Share local video</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Choose a file you may share with your guests. Playback streams from the host;
              phones do not need a copy of the file. Keep this player open while watching.
            </p>
            <label className="mt-3 block">
              <input
                className="sr-only"
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  selectLocalVideo(file);
                }}
              />
              <span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border">
                {joinedAsGuest ? localVideo?.name ?? "Choose matching local video" : pickedLocalVideo?.name ?? "Choose local video"}
              </span>
            </label>
            {(pickedLocalShare ?? localShare) && <p className="mt-2 text-xs text-subtle">Selected file · {bytes((pickedLocalShare ?? localShare)!.size)}. Only title and match metadata are shared; file bytes stream during playback.</p>}
            {localShare && <p className="mt-1 text-xs text-muted">Optional local copies · {Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length}/{p2p.peers.length} guests matched this file. Other guests receive the host’s playback stream.</p>}
            {pendingLocalShare && <p className="mt-2 text-xs text-accent">Optional local copy: {pendingLocalShare.name} · {bytes(pendingLocalShare.size)}. You may choose a matching copy above instead of receiving the stream.</p>}
            <label className="mt-3 flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={guestAccess}
                onChange={(event) => setGuestAccess(event.target.checked)}
              />
              <span>
                I confirm guests have access to this video and may receive this direct share.
              </span>
            </label>
            <Button
              size="sm"
              className="mt-3"
              disabled={joinedAsGuest || !pickedLocalVideo || !guestAccess || !p2p.peers.length}
              onClick={sharePickedLocal}
            >
              Send sharing request
            </Button>
            {!joinedAsGuest && <Button size="sm" variant="secondary" className="mt-3 ml-2 min-h-11" disabled={!pickedLocalVideo || !guestAccess || queue.length >= ROOM_QUEUE_LIMIT} onClick={queuePickedLocal}>Queue selected local file</Button>}
            <Button size="sm" variant="ghost" className="mt-3 min-h-11" disabled={!(pickedLocalShare ?? localShare)} onClick={() => { const share=pickedLocalShare??localShare; if (!share) return; if (!localQueue.some((item) => item.fingerprint === share.fingerprint)) updateLocalQueue([...localQueue, share]); setInviteNotice("Added file match metadata to the handoff list. Queue selected local file above for automatic playback."); }}>Add to matching-file list</Button>
          </div>
          <div className="mt-4 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="text-sm font-medium text-fg">Watch-party mini games</p>
            <p className="mt-1 text-xs text-muted">Start a lightweight shared vote while the room is paused. Votes are sent to connected guests.</p>
            <Input className="mt-3" value={partyPrompt} onChange={(event) => setPartyPrompt(event.target.value)} aria-label="Party vote question" />
            <div className="mt-3 flex flex-wrap gap-2">{Object.keys(partyVotes).map((choice) => <Button key={choice} size="sm" variant="secondary" onClick={() => { const next = (partyVotes[choice] ?? 0) + 1; setPartyVotes((votes) => ({ ...votes, [choice]: next })); p2p.send({ type: "party-vote", name: choice, position: next }); }}>{choice} · {partyVotes[choice] ?? 0}</Button>)}</div>
            <p className="mt-3 text-xs text-accent">Now voting: {partyPrompt}</p>
          </div>
          <div className="mt-3 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="flex items-center gap-2 text-sm font-medium text-fg">
              <MonitorPlay className="size-4 text-accent" />
              Roku handoff
            </p>
            <ol className="mt-2 space-y-1 text-xs text-muted">
              <li>
                <span className="mr-2 text-accent">1.</span>On Roku, open Settings → Network → About
                and copy its IP address.
              </li>
              <li>
                <span className="mr-2 text-accent">2.</span>Enter it below to save this TV as a
                trusted handoff target.
              </li>
              <li>
                <span className="mr-2 text-accent">3.</span>Launch the channel and copy the room
                invitation to your Roku browser or companion app.
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={rokuAddress}
                onChange={(event) => {
                  setRokuAddress(event.target.value);
                  setRokuReady(false);
                }}
                placeholder="Roku IP address, e.g. 192.168.1.24"
                aria-label="Roku IP address"
              />
              <Button
                variant="secondary"
                disabled={!rokuAddress.trim()}
                onClick={() => {
                  setRokuReady(true);
                  localStorage.setItem("reelcase.roku", rokuAddress.trim());
                }}
              >
                Save & pair TV
              </Button>
              <Button variant="secondary" onClick={() => void (async () => {
                try {
                  const response = await fetch("http://127.0.0.1:43123/roku/discover");
                  const data = await response.json() as { devices?: { address: string; location: string }[] };
                  const devices = data.devices ?? [];
                  setRokuDevices(devices);
                  setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
                } catch { setRokuNotice("Roku discovery needs the local Realhub Companion running on this Windows computer."); }
              })()}>
                Discover TVs
              </Button>
            </div>
            {rokuNotice && <p className="mt-2 text-xs text-muted">{rokuNotice}</p>}
            {rokuDevices.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{rokuDevices.map((device) => <Button key={device.address} size="sm" variant="secondary" onClick={() => { setRokuAddress(device.address); setRokuReady(true); localStorage.setItem("reelcase.roku", device.address); }}>{device.address}</Button>)}</div>}
            {rokuReady && (
              <div className="mt-3 rounded-sm bg-elevated p-3">
                <span className="text-xs text-accent">Step 3 ready · {rokuAddress}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
                      window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
                      navigator.clipboard?.writeText(url).catch(() => {});
                    }}
                  >
                    Launch & copy room link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRokuReady(false);
                      localStorage.removeItem("reelcase.roku");
                    }}
                  >
                    Forget TV
                  </Button>
                </div>
              </div>
            )}
          </div>
          </details>
        </div>
        <div className={stageSize==='cinema'?'grid min-w-0 items-start gap-4 lg:grid-cols-2':'min-w-0 space-y-4 self-start'}>
        {room && <div ref={roomParticipationAnchor} className="scroll-mt-36"><RoomParticipationPanel key={room + ':' + joinedAsGuest} localPlayer={localPlayerReadiness} playing={playback.playing} onWait={onWaitForPlayers} room={room} guest={joinedAsGuest} hostId={mediaHostId} selfId={p2p.selfId} peers={p2p.peers} readyRevision={p2p.readyRevision} send={p2p.send} onMessage={p2p.onMessage} queue={queuePanelRows} onPrioritize={onQueueChange} /></div>}
        <div ref={roomQueueAnchor} className="scroll-mt-36"><RoomQueuePanel key={room} hostCatalog={joinedAsGuest?hostCatalog:undefined} preferHost={joinedAsGuest&&!videos.length} candidates={roomCandidates} queue={queuePanelRows} currentId={sharedVideoId} currentTitle={sharedVideo?.name} currentMediaKey={sharedVideo?roomMediaKey(sharedVideo):undefined} guest={joinedAsGuest} writable={queueWritable} suggesting={canSuggest} reviewMode={reviewQueue} onReviewMode={onReviewQueue} guestEditing={guestQueueEnabled} onGuestEditing={onGuestQueueEditing} canUndo={!joinedAsGuest && undoRevision === queueRevisionRef.current} onUndo={onQueueUndo} savedCount={savedQueue?.media.length ?? 0} onRestore={onQueueRestore} notice={queueNotice} pending={pendingQueueChanges} autoAdvance={autoAdvance} onAutoAdvance={onQueueAutoAdvance} onSelect={onQueueSelect} onAdd={onQueueAdd} onChange={onQueueChange} onEdit={onQueueEdit} onClear={onQueueClear} onNext={onQueueNext} onShuffle={onQueueShuffle} onLink={onQueueLink} onLoadList={onQueueLoadList} onImportSession={onImportSession} currentMedia={queueCurrentMedia} playedMedia={sessionPlayedMedia} catalogPending={roomCandidatesPending}/></div>
        <section ref={roomChat} className="scroll-mt-36 rounded-lg bg-elevated p-4 shadow-border">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <MessageCircle className="size-4 text-accent" /> Room chat
          </p>
          <div ref={chatScroll} role="log" aria-label="Room messages" aria-live="polite" onScroll={event => { const target = event.currentTarget; chatAtBottom.current = target.scrollHeight - target.clientHeight - target.scrollTop < 48; }} className="mt-3 min-h-24 max-h-48 space-y-2 overflow-y-auto text-sm text-muted">
            {chat.map((row, index) => (
              <p key={`${row}-${index}`} className="rounded-sm bg-bg/45 px-3 py-2">
                {row}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Say something"
              aria-label="Room chat message"
            />
            <Button size="sm" onClick={send}>
              Send
            </Button>
          </div>
        </section>
        {joinedAsGuest?<details className="rounded-lg border border-border bg-surface p-4"><summary className="cursor-pointer text-sm text-fg">Invite another guest</summary><RoomInvitation invitation={invitation} started onNotice={setInviteNotice}/></details>:<RoomInvitation invitation={invitation} started onNotice={setInviteNotice}/>}
        {(reviewQueue || suggestions.length > 0) && <div ref={requestsAnchor} className="scroll-mt-36"><RoomSuggestionsPanel items={suggestions} guest={joinedAsGuest} enabled={guestQueueEnabled && reviewQueue} full={queue.length >= ROOM_QUEUE_LIMIT} notice={reviewNotice} onDecide={onSuggestionDecision}/></div>}
        <div ref={roomHistoryAnchor} className="scroll-mt-36"><RoomWatchHistoryPanel entries={watchHistory} writable={queueWritable} guest={joinedAsGuest} pending={pendingQueueChanges} full={queue.length>=ROOM_QUEUE_LIMIT} queuedKeys={recentQueuedKeys} onPlay={onQueueSelect} onQueue={onQueueAdd} onClear={clearWatchHistory} notice={historyNotice}/></div>
        <RoomRecentPanel media={recentMedia} currentKey={sharedVideo ? roomMediaKey(sharedVideo) : undefined} queuedKeys={recentQueuedKeys} writable={queueWritable} guest={joinedAsGuest} pending={pendingQueueChanges} full={queue.length >= ROOM_QUEUE_LIMIT} onPlay={onQueueSelect} onQueue={onQueueAdd}/>
        {sharedVideo?.remote?.kind === "youtube" && <section className="rounded-lg bg-elevated p-2 shadow-border"><AdultComments video={sharedVideo}/></section>}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-4 shadow-border">
        <p className="text-sm font-medium text-fg">Guests & connection status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
            You · {p2p.joined ? "ready" : "joining"}
          </span>
          {p2p.peers.length ? (
            p2p.peers.map((peer) => (
              <span key={peer.id} className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
                {peer.name || "Guest"} · {peer.connectionState}
                {peer.rttMs ? ` · ${peer.rttMs}ms` : ""}
              </span>
            ))
          ) : (
            <span className="text-xs text-subtle">
              Waiting for guests to join with the room code.
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            value={name}
            maxLength={64}
            onChange={(event) => setName(event.target.value)}
            aria-label="Display name"
            className="max-w-56"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              flushQueueDraft();
              setActiveRoom(null);
              queueRef.current = [];
              setQueue([]);
              localFiles.current.clear();
              setLocalVideo(null);
              setLocalShare(null);
              setPickedLocalVideo(null);
              setPendingLocalShare(null);
              setPlayback({playing:false,position:0});
              setSharedVideoId("");
              setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
            }}
          >
            Leave room
          </Button>
        </div>
      </div>
    </HubShell>
  );
}
