import { dataSaverActive } from '@/lib/data-saver';
let preview: Promise<typeof import("./pre-video")> | undefined;
let player: Promise<typeof import("./player")> | undefined;
export const loadVideoPreview = () => preview ??= import("./pre-video").catch(error => { preview = undefined; throw error; });
export const loadVideoPlayer = () => player ??= import("./player").catch(error => { player = undefined; throw error; });
export function warmVideoPreview() { if (!dataSaverActive()) void loadVideoPreview().catch(() => undefined); }
export function warmVideoPlayer() { if (!dataSaverActive()) void loadVideoPlayer().catch(() => undefined); }
