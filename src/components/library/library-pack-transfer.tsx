import {BACKUP_INSPECTION_EVENT,takeBackupInspection} from '@/lib/videos/backup-inspection-queue';
import { localProfileSource } from '@/lib/local-profiles';
import { currentProfileId } from '@/lib/local-profile-storage';
import { useLocalProfiles } from './use-local-profiles';
import {prepareLibraryRestore,restoreDurablePhotos} from '@/lib/videos/persist';
import {checkpointLibraryForRestore} from '@/lib/videos/store';
import {planLibraryRestore} from '@/lib/videos/library-restore-plan';
import {loadPackReview,savePackReview,discardPackReview} from '@/lib/videos/persist';
import {reviewPackConflicts,resolvePackConflicts,type ConflictReview,type ConflictChoice} from '@/lib/videos/pack-conflicts';
import type {SavedPackReview} from '@/lib/videos/pack-review-repository';
import {PackConflictReview} from './pack-conflict-review';
import {hydrateMediaHealth} from '@/lib/videos/persist';
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { exportFeedback } from "@/lib/media-feedback";
import { hydrateTopicAliases } from "@/lib/topic-alias-store";
import { hydrateTopicBridges } from "@/lib/topic-bridge-store";
import { hydrateRecommendationExposure } from "@/lib/recommendation-exposure-store";
import { hydrateGuidePreset } from "@/lib/guide-preset-store";
import { hydrateFilmReviews } from "@/lib/film-review-store";
import { hydrateAnimeReviews } from "@/lib/anime-review-store";
import { hydrateProviderViewing } from "@/lib/provider-viewing-store";
import {
  buildLibraryPackFiles,
  downloadLibraryPackZip,
  libraryPackExtras,
  type LibraryPackBuildInput,
  type LibraryPackMode,
} from "@/lib/videos/library-pack";
import {
  libraryPackSections,
  exportStreamingPack,
  packBlobSink,
  downloadPackBlob,
} from "@/lib/videos/library-pack-stream";
import {
  inspectLegacyFiles,
  inspectPreparedPack,
  preflightPack,
  type PreparedPack,
} from "@/lib/videos/pack-preflight";
import { companionImportLibraryPack, companionExportLibraryPack } from "@/lib/companion";
import { linksFromHistoryAndResume, loadDurablePhotosSync } from "@/lib/videos/persist";

function inputSnapshot(): LibraryPackBuildInput {
  const state = useLibrary.getState(),
    photos = loadDurablePhotosSync();
  return {
    follows: state.follows,
    adultVideos: state.videos,
    folders: state.folders,
    tags: state.tags,
    metadataProvenance:state.metadataProvenance,
    categories:state.categories,
    history: state.history,
    links: linksFromHistoryAndResume(state.history, state.resumeProgress),
    favorites: Object.keys(state.favorites),
    likes: Object.keys(state.likes),
    viewCounts: state.viewCounts,
    cameCounts: state.cameCounts,
    progress: state.progress,
    resumeProgress: state.resumeProgress,
    photoSources:
      photos?.sources ??
      state.folders
        .filter((f) => f.kind === "directory" || f.kind === "files")
        .map((f) => ({
          id: f.id,
          name: f.name,
          kind: f.kind as "directory" | "files",
          ...(f.photoCount != null ? { photoCount: f.photoCount } : {}),
          ...(f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}),
        })),
    photoMeta: photos?.meta,
    photoLikes: photos?.likes,
  };
}
function currentFiles() {
  const files = new Map<string, unknown>();
  for (const section of libraryPackSections(
    inputSnapshot(),
    exportFeedback(),
    libraryPackExtras(),
  )) {
    if (section.field === "$") files.set(section.file, section.data);
    else {
      if (!files.has(section.file)) files.set(section.file, {});
      (files.get(section.file) as Record<string, unknown>)[section.field] = section.data;
    }
  }
  return { files };
}
export function LibraryPackTransfer() {
  const profileRegistry = useLocalProfiles();
  const destinationName = profileRegistry.profiles.find(profile => profile.id === currentProfileId())?.name ?? 'Selected local profile';
  const sourceId=useLibrary(s=>s.sourceId);
  const [prepared, setPrepared] = useState<PreparedPack>(),
    [name, setName] = useState(""),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState(""),
    [mode, setMode] = useState<LibraryPackMode>("merge");
  const [progress, setProgress] = useState(0),
    [reviewed, setReviewed] = useState(false),
    [page, setPage] = useState(0);
  const [conflictReview,setConflictReview]=useState<ConflictReview>(),[choices,setChoices]=useState<Record<string,ConflictChoice>>({}),[savedReview,setSavedReview]=useState<SavedPackReview>();
  const [reviewLoaded,setReviewLoaded]=useState(false);
  useEffect(()=>{let alive=true;void loadPackReview().then(r=>{if(alive){setSavedReview(r);setReviewLoaded(true);}},e=>{if(alive){setNote(e instanceof Error?e.message:'Saved review could not be read.');setReviewLoaded(true);}});return()=>{alive=false;};},[]);
  const prepareConflicts=async(value:PreparedPack,signal:AbortSignal)=>{
    if(!value.report.ok){setConflictReview(undefined);setChoices({});return;}
    const review=await reviewPackConflicts(value.files,currentFiles().files,signal);setConflictReview(review);setChoices({});
  };
  const controller = useRef<AbortController | null>(null),
    latch = useRef(false),
    input = useRef<HTMLInputElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const run = async (work: (signal: AbortSignal) => Promise<void>) => {
    if (latch.current) return;
    latch.current = true;
    setBusy(true);
    const active = new AbortController();
    controller.current = active;
    try {
      await Promise.all([
        hydrateGuidePreset(),
        hydrateFilmReviews(),
        hydrateAnimeReviews(),
        hydrateProviderViewing(),
        hydrateMediaHealth(),
        hydrateTopicAliases(),
        hydrateTopicBridges(),
        hydrateRecommendationExposure(),
      ]);
      await restoreDurablePhotos();
      active.signal.throwIfAborted();
      await work(active.signal);
    } catch (e) {
      if (!active.signal.aborted)
        setNote(e instanceof Error ? e.message : "Backup operation failed.");
      else
        setNote(
          "Cancelled. The incomplete export was discarded; inspection did not import anything.",
        );
    } finally {
      latch.current = false;
      setBusy(false);
      controller.current = null;
    }
  };
  const inspect = (file: File) =>
    void run(async (signal) => {
      setPrepared(undefined);
      setReviewed(false);
      setPage(0);
      setName(file.name);
      setNote("Inspecting locally. Your library is unchanged.");
      const value = await preflightPack(file, currentFiles(), { signal });
      signal.throwIfAborted();
      await prepareConflicts(value,signal);
      setPrepared(value);
      setNote(
        value.report.ok
          ? "Review the report and import policy before applying."
          : "Validation failed. Nothing was imported.",
      );
    });
  useEffect(()=>{
    let frame=0;
    const receive=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(useLibrary.getState().sourceId!=='settings')return;const file=takeBackupInspection();if(file)inspect(file);});};
    window.addEventListener(BACKUP_INSPECTION_EVENT,receive);
    if(sourceId==='settings')receive();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener(BACKUP_INSPECTION_EVENT,receive);};
  },[sourceId]);
  const report = prepared?.report;
  const apply = () =>
    void run(async (signal) => {
      if (!prepared || !report?.ok) return;
      // Recompute consequences against current state immediately before commit.
      const checked = await inspectPreparedPack(prepared.files, currentFiles(), {
        signal,
        version: report.version ?? 1,
        format: report.format,
        bytes: report.bytes,
      });
      signal.throwIfAborted();
      if (!checked.report.ok) {
        setPrepared(checked);
        setReviewed(false);
        return;
      }
      if (
        checked.report.fingerprint !== report.fingerprint ||
        checked.report.conflicts !== report.conflicts ||
        checked.report.changed !== report.changed
      ) {
        setPrepared(checked);
        setReviewed(false);
        setNote("Your library changed during review. Review the updated report before applying.");
        return;
      }
      const latest=await reviewPackConflicts(checked.files,currentFiles().files,signal);
      if(!conflictReview||latest.fingerprint!==conflictReview.fingerprint){setPrepared(checked);setConflictReview(latest);setChoices({});setReviewed(false);setNote('Saved values changed during review. Choose again against the current values.');return;}
      const resolved=resolvePackConflicts(checked.files,latest,choices);
      await checkpointLibraryForRestore();
      const captured=currentFiles().files,verified=await reviewPackConflicts(checked.files,captured,signal);
      if(verified.fingerprint!==latest.fingerprint){setConflictReview(verified);setChoices({});setReviewed(false);setNote('Personal values changed while saving. Review the current values again.');return;}
      await prepareLibraryRestore(name,choices,verified.fingerprint,(base,restoreSignal)=>planLibraryRestore(base,captured,resolved,mode,Date.now(),restoreSignal),signal);
      setNote('Both generations were verified. Activate the prepared restore or discard it safely.');
    });
  return (
    <section
      aria-label="Library pack transfer"
      className="mt-4 space-y-4 rounded-lg border border-border bg-elevated p-5 shadow-border"
    >
      <div>
        <h2 className="font-display text-2xl text-fg">Library pack · review before import</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Private backup · contains personal data. Back up follows, creator collections, history, saved links, favorites, ratings, notes,
          resume marks, photo metadata and review ledgers. Streaming packs use bounded chunks with a
          final integrity manifest. Media files, catalog artwork and browser permissions stay on
          this device.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={busy}
          onClick={() =>
            void run(async (signal) => {
              setProgress(0);
              setNote("Preparing streaming export…");
              const blob = packBlobSink();
              const stats = await exportStreamingPack(
                libraryPackSections({...inputSnapshot(),sourceProfile:await localProfileSource()}, exportFeedback(), libraryPackExtras()),
                blob.sink,
                { signal, progress: (s) => setProgress(s.records) },
              );
              signal.throwIfAborted();
              downloadPackBlob(blob.result()!);
              setNote(
                `Streaming pack downloaded · ${stats.records.toLocaleString()} records · ${stats.bytes.toLocaleString()} bytes · ${stats.maxChunkBytes.toLocaleString()} byte largest chunk.`,
              );
            })
          }
        >
          Export streaming library pack
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => input.current?.click()}>
          Inspect backup file
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() =>
            void run(async (signal) => {
              setPrepared(undefined);
              setReviewed(false);
              setName("Companion folder");
              setNote("Reading approved Companion pack folder…");
              const result = await companionImportLibraryPack();
              signal.throwIfAborted();
              if (!result.ok || !result.files)
                throw Error(result.error || "No Companion pack files were returned.");
              setPrepared(await inspectLegacyFiles(result.files, currentFiles(), { signal }));
              setNote("Companion pack inspected. Review before importing.");
            })
          }
        >
          Inspect Companion pack
        </Button>
        {busy && (
          <Button variant="secondary" onClick={() => controller.current?.abort()}>
            Cancel backup operation
          </Button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept=".reelpack,.zip,.json,.csv,application/zip,application/json,text/csv"
        className="sr-only"
        aria-label="Backup file to inspect"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) inspect(file);
        }}
      />
      <details>
        <summary className="min-h-11 cursor-pointer text-sm text-accent">
          Legacy ZIP and Companion-folder export
        </summary>
        <p className="mb-3 text-xs leading-5 text-muted">
          Compatibility exports are limited to 10,000 records and 8 MiB of streamed metadata. Use
          the streaming pack for larger libraries.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Download legacy ZIP", "Save legacy pack to Companion"].map((label, index) => (
            <Button
              key={label}
              variant="secondary"
              disabled={busy}
              onClick={() =>
                void run(async (signal) => {
                  const input = {...inputSnapshot(),sourceProfile:await localProfileSource()},
                    feedback = exportFeedback();
                  let size = 0;
                  await exportStreamingPack(
                    libraryPackSections(input, feedback, libraryPackExtras()),
                    {
                      async write(bytes) {
                        size += bytes.length;
                        if (size > 8 * 1024 * 1024)
                          throw Error(
                            "Legacy export exceeds 8 MiB. Use Export streaming library pack.",
                          );
                      },
                      async close() {},
                      async abort() {},
                    },
                    {
                      signal,
                      progress: (stats) => {
                        if (stats.records > 10000)
                          throw Error(
                            "Legacy export exceeds 10,000 records. Use Export streaming library pack.",
                          );
                      },
                    },
                  );
                  signal.throwIfAborted();
                  if (index === 0) {
                    downloadLibraryPackZip(input);
                    setNote("Legacy ZIP downloaded.");
                  } else {
                    const result = await companionExportLibraryPack(buildLibraryPackFiles(input));
                    if (!result.ok) throw Error(result.error || "Companion export failed.");
                    setNote("Library pack saved to the approved Companion folder.");
                  }
                })
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </details>
      <p role="status" className="text-sm text-muted">
        {note}
        {busy && progress > 0 ? ` · ${progress.toLocaleString()} records prepared` : ""}
      </p>
      <p className="text-xs leading-5 text-muted">
        Streaming scratch: at most 128 records and 128 KiB per write. The browser download fallback
        retains the final file bytes, up to 128 MiB. Legacy ZIP inspection is limited to 32 MiB
        compressed. Checksum validation detects damaged files; backups are unencrypted and should be
        kept private.
      </p>
      {reviewLoaded&&savedReview&&<div aria-label="Saved backup review" className="space-y-3 rounded-md border border-border p-4"><p className="break-words text-sm">Saved review · {savedReview.name} · {new Date(savedReview.at).toLocaleString()}</p><p className="text-xs text-muted">Private backup metadata is saved locally in one review slot. Resuming rechecks every value; changed library data invalidates old choices. This is a review draft, not a rollback snapshot.</p><div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" disabled={busy} onClick={()=>void run(async signal=>{const draft=await loadPackReview();if(!draft)throw Error('The saved review was removed.');setSavedReview(draft);const value=await inspectPreparedPack(new Map(draft.files),currentFiles(),{signal});const review=await reviewPackConflicts(value.files,currentFiles().files,signal);setPrepared(value);setName(draft.name);setConflictReview(review);setChoices(review.fingerprint===draft.fingerprint?draft.choices:{});setReviewed(false);setNote(review.fingerprint===draft.fingerprint?'Saved review resumed. Choices were preserved.':'Library data changed. The backup is retained; review choices again.');})}>Resume saved review</Button><Button variant="ghost" className="min-h-11" disabled={busy} onClick={()=>void run(async()=>{await discardPackReview(savedReview);setSavedReview(undefined);setNote('Saved review discarded. Active library data was unchanged.');})}>Discard saved review</Button></div></div>}
      {report && (
        <div
          aria-label="Backup preflight report"
          className="space-y-4 rounded-md border border-border bg-bg/45 p-4"
        >
          <div>
            <h3 className="text-lg font-medium text-fg">
              {report.ok ? "Ready for review" : "Import blocked"}
            </h3>
            <p className="mt-1 break-words text-sm text-muted">
              {name} · {report.format} · version {report.version ?? "unknown"}
            </p>
            <div data-backup-profile-context className="mt-3 space-y-2 rounded-md border border-border p-3 text-sm">
              <p>Source profile: <strong>{report.sourceProfile?.name ?? 'Unknown · legacy backup without a profile label'}</strong>{report.sourceProfile && <span className="block break-all text-xs text-muted">Recorded source ID: {report.sourceProfile.id}</span>}</p>
              <p>Restore destination: <strong>{destinationName}</strong></p>
              <p className="text-xs leading-5 text-muted">The source label is descriptive. This review targets the profile currently open in this tab; it never selects, renames or switches to the source profile.</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Records", report.records],
              ["New or different", report.changed],
              ["Differing existing values", report.conflicts],
              ["Duplicate identities", report.duplicates],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-elevated p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 text-xl text-fg">{Number(value).toLocaleString()}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted">
            Sources · YouTube {report.sources.youtube ?? 0} · Twitch {report.sources.twitch ?? 0} ·{" "}
            {prepared!.files.size} recognized files
          </p>
          <details>
            <summary className="min-h-11 cursor-pointer text-sm text-accent">
              Section counts
            </summary>
            <ul className="space-y-1 text-xs text-muted">
              {Object.entries(report.counts).map(([key, value]) => (
                <li key={key} className="break-words">
                  {key} · {value.toLocaleString()}
                </li>
              ))}
            </ul>
          </details>
          {!!report.issueCount && (
            <div role="alert">
              <p className="text-sm font-medium text-fg">
                {report.issueCount.toLocaleString()} rejected records or sections · first 50
                locations retained
              </p>
              <ul className="mt-2 space-y-2 text-sm text-muted">
                {report.issues.slice(page * 10, page * 10 + 10).map((issue, i) => (
                  <li key={i} className="break-words">
                    <strong>{issue.location}</strong> · {issue.message}
                  </li>
                ))}
              </ul>
              {report.issues.length > 10 && (
                <div className="mt-2 flex gap-2">
                  <Button variant="ghost" disabled={!page} onClick={() => setPage((p) => p - 1)}>
                    Previous issues
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={(page + 1) * 10 >= report.issues.length}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next issues
                  </Button>
                </div>
              )}
            </div>
          )}
          {!!report.examples.length && (
            <details>
              <summary className="min-h-11 cursor-pointer text-sm text-accent">
                Review differing records · first 20
              </summary>
              <ul className="space-y-2 text-xs text-muted">
                {report.examples.map((e, i) => (
                  <li key={i} className="break-words">
                    {e.location} · {e.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {report.warnings.map((warning, i) => (
            <p key={i} className="break-words text-xs text-muted">
              {warning}
            </p>
          ))}
          {!report.ok && (
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setPrepared(undefined);
                setNote("Report discarded. Nothing was imported.");
              }}
            >
              Discard blocked report
            </Button>
          )}
          {report.ok&&conflictReview&&<PackConflictReview review={conflictReview} choices={choices} disabled={busy} onChange={next=>{setChoices(next);setReviewed(false);}}/>}
          {report.ok && (
            <>
              <label className="block text-sm text-fg">
                Follow import policy
                <select
                  aria-label="Follow import policy"
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value as LibraryPackMode);
                    setReviewed(false);
                  }}
                  className="mt-2 block min-h-11 w-full rounded-md border border-border bg-bg px-3"
                >
                  <option value="merge">Merge follows · keep unrelated sources</option>
                  <option value="replace-follows">Replace follows with this pack</option>
                </select>
              </label>
              <p className="text-sm leading-6 text-muted">
                {mode === "replace-follows"
                  ? `The current ${report.currentFollows} YouTube/Twitch follows will be replaced by the pack’s ${report.sources.youtube ?? 0} YouTube and ${report.sources.twitch ?? 0} Twitch entries. Saved media and personal records remain.`
                  : "New follows are added; existing source observations retain the newer checkpoint."}{" "}
                History and favorites are combined; counters keep the maximum. Differing ratings,
                notes, resume positions and metadata require explicit choices below. Feature ledgers use
                their existing merge rules. Preparing verifies a separate generation without replacing the current library.
                Activation retains one recovery slot; another activated restore replaces that earlier slot.
              </p>
              <label className="flex min-h-11 items-center gap-3 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={reviewed}
                  onChange={(e) => setReviewed(e.target.checked)}
                />
                I reviewed the source, current destination, differing records and import policy
              </label>
              <div className="flex flex-wrap gap-2">
                <Button disabled={busy || !reviewed || !conflictReview || conflictReview.conflicts.some(c=>!choices[c.id])} onClick={apply}>
                  Prepare reviewed restore
                </Button>
                <Button variant="secondary" className="min-h-11" disabled={busy||!conflictReview||!reviewLoaded} onClick={()=>void run(async signal=>{
                  const latest=await reviewPackConflicts(prepared!.files,currentFiles().files,signal);if(latest.fingerprint!==conflictReview?.fingerprint){setConflictReview(latest);setChoices({});setReviewed(false);throw Error('Library data changed. Review the updated fields before saving choices.');}
                  const next=await savePackReview(savedReview,{version:1,id:savedReview?.id??crypto.randomUUID(),name:name.slice(0,256),at:Date.now(),fingerprint:latest.fingerprint,files:[...prepared!.files],choices});setSavedReview(next);setNote('Backup review saved locally. Resume it after a reload; your active library was unchanged.');
                })}>Save review for later</Button>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setPrepared(undefined);
                    setReviewed(false);
                    setNote("Review discarded. Nothing was imported.");
                  }}
                >
                  Discard review
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
