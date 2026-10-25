import { LiveCheckStatus } from './live-check-status';
export function YoutubeLiveCheckStatus({ action = true }: { action?: boolean }) { return <LiveCheckStatus kind="youtube" action={action} />; }
