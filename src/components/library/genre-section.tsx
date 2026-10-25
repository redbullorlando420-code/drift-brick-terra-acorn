import { TopicLinks } from './topic-links';
import { Clapperboard } from "lucide-react";
import { HubShell } from './hub-shared';

export function GenreSection() {
  return <HubShell eyebrow="Topic explorer" icon={<Clapperboard className="size-4"/>} title="Explore ideas across sources." copy="Follow useful topics across local media, YouTube and Twitch. Each connection shows its saved tag or title evidence."><TopicLinks explorer /></HubShell>;
}
