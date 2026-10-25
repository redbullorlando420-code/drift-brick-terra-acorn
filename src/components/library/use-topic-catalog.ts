import { startTransition, useEffect, useMemo, useState } from 'react';
import { createSettledInput } from '@/lib/settled-input';
import { useSessionPhase } from '@/lib/use-session-phase';
import { catalogTurn } from '@/lib/catalog-turn';
import { useLibrary } from '@/lib/videos/store';
import { getRating, getWatchTime, ratingPreference, tagIsLiked, watchTimeScore } from '@/lib/media-feedback';
import { selectTopicCatalog, summarizeTopicCatalog, type TopicCatalogInput, type TopicSelection, type TopicSummary, type TopicFilters } from '@/lib/videos/topic-catalog';

const taste = { liked: tagIsLiked, score: (id: string) => {
  const rating = getRating(id);
  return ratingPreference(rating) + (rating === 1 ? 0 : watchTimeScore(getWatchTime(id)) / 12);
} };
const EMPTY_SELECTION: TopicSelection = { videos: [], related: [] };
const EMPTY_SUMMARY: TopicSummary = { total: 0, linked: 0, saved: 0, counts: [], genres: [], gaps: [] };

export function useTopicCatalog(input: TopicCatalogInput, revision: number, selected: string | undefined,
  genre: string | undefined, provider: string, explorer: boolean, filters?:TopicFilters) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [settled, setSettled] = useState({ input, revision });
  const coalescer = useMemo(() => createSettledInput(setSettled, { quietMs: 600, maxWaitMs: 4_000 }), []);
  useEffect(() => {
    if (settled.input !== input || settled.revision !== revision) coalescer.push({ input, revision });
  }, [input, revision, coalescer]);
  useEffect(() => () => coalescer.cancel(), [coalescer]);
  const [summary, setSummary] = useState<{ input: TopicCatalogInput; revision: number; data: TopicSummary }>();
  const [selection, setSelection] = useState<{ input: TopicCatalogInput; revision: number; selected?: string;
    genre?: string; provider: string; filters?:TopicFilters; data: TopicSelection }>();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (phase !== 'active' || viewer || (summary?.input === settled.input && summary.revision === settled.revision)) return;
    const controller = new AbortController();
    setFailed(false);
    void summarizeTopicCatalog(settled.input, taste, catalogTurn(controller.signal)).then(data => {
      if (!controller.signal.aborted) startTransition(() => setSummary({ ...settled, data }));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [settled, phase, viewer]);
  useEffect(() => {
    if (!explorer || phase !== 'active' || viewer || summary?.input !== settled.input || summary.revision !== settled.revision) return;
    if (selection?.input === settled.input && selection.revision === settled.revision
      && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters) return;
    const controller = new AbortController();
    setFailed(false);
    void selectTopicCatalog(settled.input, selected, genre, provider, taste, catalogTurn(controller.signal),filters).then(data => {
      if (!controller.signal.aborted) startTransition(() => setSelection({ ...settled, selected, genre, provider, filters,data }));
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [settled, summary, selected, genre, provider, explorer, phase, viewer,filters]);
  const summaryReady = summary?.input === input && summary.revision === revision;
  const selectionReady = selection?.input === input && selection.revision === revision
    && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters;
  const sameVisibility = (previous: TopicCatalogInput) => previous.folders === input.folders
    && previous.unavailable === input.unavailable && previous.hiddenVideos === input.hiddenVideos && previous.hideDemo === input.hideDemo;
  const matchesReady = Boolean(selection && sameVisibility(selection.input)
    && selection.selected === selected && selection.genre === genre && selection.provider === provider && selection.filters === filters);
  return { summary: summary && sameVisibility(summary.input) ? summary.data : EMPTY_SUMMARY,
    selection: matchesReady ? selection!.data : EMPTY_SELECTION, matchesReady,
    pending: !failed && (!summaryReady || (explorer && !selectionReady)), failed, ready: summaryReady };
}
