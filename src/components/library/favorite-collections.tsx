import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { creatorIsLiked, exportFeedback } from "@/lib/media-feedback";
import { useLibrary } from "@/lib/videos/store";
import { openTopic } from "@/lib/videos/topic-navigation";
import { isTopicTag } from "@/lib/videos/topics";

/** Personal collections are small; no full-library inference or image decoding. */
export function FavoriteCollections() {
  const follows = useLibrary(s => s.follows);
  const setSource = useLibrary(s => s.setSource);
  const setQuery = useLibrary(s => s.setQuery);
  const [revision, setRevision] = useState(0);
  const [limit, setLimit] = useState(24);
  useEffect(() => {
    const refresh = () => setRevision(n => n + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);
  const saved = useMemo(() => ({
    creators: follows.filter(channel => creatorIsLiked(channel.title) || creatorIsLiked(channel.handle)),
    topics: Object.keys(exportFeedback().tagLikes).filter(isTopicTag),
  }), [follows, revision]);
  return <section aria-label="Saved creators and topics" className="mb-6 grid gap-4 lg:grid-cols-2">
    <div className="rounded-lg border border-border bg-surface p-4"><h2 className="font-display text-xl text-fg">Favorite creators · {saved.creators.length}</h2><div className="mt-3 flex flex-wrap gap-2">{saved.creators.slice(0, limit).map(channel => <Button key={channel.id} variant="secondary" onClick={() => { setQuery(""); setSource(channel.id); }}>{channel.title || channel.handle} · {channel.kind === "youtube" ? "YouTube" : "Twitch"}</Button>)}</div>{!saved.creators.length && <p className="mt-3 text-sm text-muted">Heart a creator in Manage creators to pin them here.</p>}</div>
    <div className="rounded-lg border border-border bg-surface p-4"><h2 className="font-display text-xl text-fg">Favorite topics · {saved.topics.length}</h2><div className="mt-3 flex flex-wrap gap-2">{saved.topics.slice(0, limit).map(topic => <Button key={topic} variant="secondary" onClick={() => openTopic(topic)}>#{topic}</Button>)}</div>{!saved.topics.length && <p className="mt-3 text-sm text-muted">Heart a public topic to pin it here.</p>}</div>
    {(saved.creators.length > limit || saved.topics.length > limit) && <Button variant="secondary" onClick={() => setLimit(n => n + 100)}>Show more saved collections</Button>}
  </section>;
}
