import { LiveCheckStatus } from './live-check-status';
export function TwitchLiveCheckStatus({ action = true }: { action?: boolean }) { return <LiveCheckStatus kind="twitch" action={action} />; }
