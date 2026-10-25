import { createModuleLoader } from '@/lib/module-loader';

// Each desk owns its code boundary. Idle warmup and navigation reuse the same
// promise without fetching unrelated desks or their optional dependencies.
export const hubLoaders = {
  'stable-diffusion': createModuleLoader(() => import('./stable-diffusion-section').then(m => ({ default: m.StableDiffusionSection }))),
  'remote-desktop': createModuleLoader(() => import('./remote-desktop-section').then(m => ({ default: m.RemoteDesktopSection }))),
  anime: createModuleLoader(() => import('./anime-section').then(m => ({ default: m.AnimeSection }))),
  genres: createModuleLoader(() => import('./genre-section').then(m => ({ default: m.GenreSection }))),
  photos: createModuleLoader(() => import('./photos-section').then(m => ({ default: m.PhotosSection }))),
  spotify: createModuleLoader(() => import('./spotify-section').then(m => ({ default: m.SpotifySection }))),
  prints: createModuleLoader(() => import('./prints-section').then(m => ({ default: m.PrintsSection }))),
  games: createModuleLoader(() => import('./games-section').then(m => ({ default: m.GamesSection }))),
  shop: createModuleLoader(() => import('./shop-section').then(m => ({ default: m.ShopSection }))),
  streaming: createModuleLoader(() => import('./streaming-section').then(m => ({ default: m.StreamingSection }))),
  'stream-signal': createModuleLoader(() => import('./stream-signal-section').then(m => ({ default: m.StreamSignalSection }))),
  'watch-room': createModuleLoader(() => import('./watch-room-section').then(m => ({ default: m.WatchRoomSection }))),
  connection: createModuleLoader(() => import('./lan-connection-section').then(m => ({ default: m.LanConnectionSection }))),
  'find-phone': createModuleLoader(() => import('./find-phone-section').then(m => ({ default: m.FindPhoneSection }))),
  social: createModuleLoader(() => import('./social-section').then(m => ({ default: m.SocialSection }))),
  'mission-plan': createModuleLoader(() => import('./mission-plan-section').then(m => ({ default: m.MissionPlanSection }))),
  settings: createModuleLoader(() => import('./settings-section').then(m => ({ default: m.SettingsSection }))),
  stats: createModuleLoader(() => import('./stats-section').then(m => ({ default: m.StatsSection }))),
  'private-web': createModuleLoader(() => import('./private-web-shortcuts-section').then(m => ({ default: m.PrivateWebShortcuts }))),
};

export function warmHubDesk(sourceId: string): Promise<unknown> | undefined {
  if (Object.hasOwn(hubLoaders, sourceId)) return hubLoaders[sourceId as keyof typeof hubLoaders]();
}
