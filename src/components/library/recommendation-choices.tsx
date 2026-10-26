import { RecommendationExposureControl } from './recommendation-exposure-control';
import { useEffect, useState } from 'react';
import { ThumbsDown, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { creatorIsFavorited, getRecommendationRejections, setRecommendationRejection, getFeedbackSaveState, retryFeedbackSave } from '@/lib/media-feedback';
import { creatorRejectionTarget, titleRejectionTarget, rejectionKey, type RecommendationRejection } from '@/lib/videos/recommendation-rejections';
import { topicEvidence } from '@/lib/videos/topics';
import type { LibraryVideo } from '@/lib/videos/types';

const PAGE_SIZE = 8;
export function RecommendationChoices({ video, tags, favorite }: { video: LibraryVideo; tags: string[]; favorite: boolean }) {
  const [, refresh] = useState(0), [topic, setTopic] = useState(''), [page, setPage] = useState(0);
  const [message, setMessage] = useState(''), [error, setError] = useState('');
  useEffect(() => { const changed = () => refresh(value => value + 1); window.addEventListener('reelcase:rating-change', changed); window.addEventListener('reelcase:feedback-save', changed); return () => { window.removeEventListener('reelcase:rating-change', changed); window.removeEventListener('reelcase:feedback-save', changed); }; }, []);
  const ledger = getRecommendationRejections(), creator = creatorRejectionTarget(video), topics = topicEvidence(video, tags);
  const selectedTopic = topics.some(link => link.topic === topic) ? topic : topics[0]?.topic ?? '';
  const currentPage = Math.min(page, Math.max(0, Math.ceil(ledger.entries.length / PAGE_SIZE) - 1));
  const apply = (entry: RecommendationRejection, remove = false) => {
    try { setRecommendationRejection(entry, remove); setError(''); setMessage(remove ? 'Choice undone. Its ranking penalty was removed.' : 'Choice applied. Matching recommendations will rank lower.'); refresh(value => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'This choice could not be saved. Try again.'); }
  };
  const choice = (entry: Omit<RecommendationRejection, 'at'>, label: string) => {
    const saved = ledger.entries.find(row => rejectionKey(row) === rejectionKey(entry));
    return <Button type="button" variant="secondary" className="min-h-11 max-w-full whitespace-normal text-left" aria-pressed={Boolean(saved)} onClick={() => apply(saved ?? { ...entry, at: Date.now() }, Boolean(saved))}>{saved ? <Undo2 className="size-4 shrink-0" /> : <ThumbsDown className="size-4 shrink-0" />}{saved ? 'Undo: ' : ''}{label}</Button>;
  };
  return <details data-recommendation-choices className="mt-4 rounded-lg border border-border bg-elevated/55 p-4">
    <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">Not interested? Tune recommendations</summary>
    <p className="mt-2 text-sm leading-6 text-muted">Choose exactly what you want less of. This lowers scores in YouTube picks, Twitch VOD recommendations, the Guide, and preview suggestions. Videos remain searchable; ratings and visibility stay as you set them.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {choice({ scope: 'title', target: titleRejectionTarget(video), label: video.name }, 'Less of this title')}
      {creator && choice({ scope: 'creator', target: creator, label: video.remote?.channelName ?? 'This local folder' }, video.remote ? 'Less from this creator' : 'Less from this folder')}
    </div>
    {topics.length > 0 && <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"><label className="min-w-0 flex-1 text-xs text-muted">Topic to reduce<select aria-label="Topic to recommend less" value={selectedTopic} onChange={event => setTopic(event.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-bg px-3 text-sm text-fg">{topics.map(link => <option key={link.topic} value={link.topic}>{link.topic}</option>)}</select></label>{choice({ scope: 'topic', target: selectedTopic, label: selectedTopic }, 'Less of this topic')}</div>}
    <p className="mt-3 text-xs leading-5 text-muted">Title choices affect only that media identity. Creator choices stay within that provider; topic choices apply across public sources. Saved titles and favorited creators bypass these penalties. A hearted topic bypasses its topic penalty.</p>
    {(favorite || creatorIsFavorited(video.remote?.channelName ?? '')) && <p className="mt-2 text-xs text-accent">This title is protected by a favorite. Your choices remain saved and apply if that favorite is removed.</p>}
    <p role="status" className="mt-2 text-xs text-muted">{message}{getFeedbackSaveState() === "pending" ? " Saving to this browser…" : message && getFeedbackSaveState() === "saved" ? " Saved to this browser." : ""}</p>
    {getFeedbackSaveState() === "failed" && <div role="alert" className="mt-3 text-sm text-fg"><p>Browser storage could not save your feedback. Choices work for this session; retry before closing or export a library pack.</p><Button type="button" variant="secondary" className="mt-2 min-h-11" onClick={retryFeedbackSave}>Retry saving feedback</Button></div>}{error && <p role="alert" className="mt-2 text-sm text-fg">{error}</p>}
    <RecommendationExposureControl />
    <details className="mt-3 border-t border-border pt-3" data-rejection-review><summary className="min-h-11 cursor-pointer content-center text-sm text-fg">Review saved choices ({ledger.entries.length}/512)</summary>
      {ledger.entries.length ? <><ul className="mt-2 space-y-2">{ledger.entries.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map(entry => <li key={rejectionKey(entry)} className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-bg/50 p-3"><div className="min-w-0"><p className="break-words text-sm text-fg">{entry.label}</p><p className="text-xs text-muted">{entry.scope}</p></div><Button type="button" variant="secondary" className="min-h-11 shrink-0" aria-label={'Undo ' + entry.scope + ' choice: ' + entry.label} onClick={() => apply(entry, true)}><Undo2 className="size-4" />Undo</Button></li>)}</ul>{ledger.entries.length > PAGE_SIZE && <div className="mt-3 flex items-center justify-between gap-2"><Button type="button" variant="secondary" className="min-h-11" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Previous choices</Button><span className="text-xs text-muted">Page {currentPage + 1} of {Math.ceil(ledger.entries.length / PAGE_SIZE)}</span><Button type="button" variant="secondary" className="min-h-11" disabled={(currentPage + 1) * PAGE_SIZE >= ledger.entries.length} onClick={() => setPage(currentPage + 1)}>Next choices</Button></div>}</> : <p className="mt-2 text-sm text-muted">No rejection choices saved. Your current ratings and favorites still guide recommendations.</p>}
      <p className="mt-3 text-xs leading-5 text-muted">Private to this browser library. Included in your library pack; never sent to Watch Together guests. Up to 512 choices are kept without automatic expiry or silent eviction.</p>
    </details>
  </details>;
}
