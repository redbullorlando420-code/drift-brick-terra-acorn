import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
const fixture = { readStarted: false, aborted: false, release: undefined };
globalThis.__profileSwitchFixture = fixture;
const moduleOf = (source) => "data:text/javascript," + encodeURIComponent(source);
const names = [
  ...readFileSync(new URL("../src/lib/videos/persist.ts", import.meta.url), "utf8").matchAll(
    /export (?:async )?function (\w+)/g,
  ),
].map((m) => m[1]);
const bodies = {
  isCatalogDeleted: "return false;",
  mediaHealthSnapshot: "return {version:1,revision:0,entries:{}};",
  loadPrefs: "return null;",
  loadRemoteSnapshot: "return undefined;",
  restoreEnrichmentRows: "return arguments[0];",
  restoreDurableResume: "return {progress:{},resumeProgress:{}};",
  restoreDurableMarks: "return {viewCounts:{},cameCounts:{}};",
  restoreDurableShelves: "return {authoritative:false,favorites:[],likes:[]};",
  restoreDurablePhotos: "return {sources:[]};",
  loadActivitySnapshot: "return undefined;",
  loadCatalogVideos: `const f=globalThis.__profileSwitchFixture;f.readStarted=true;const signal=arguments[0]?.signal;return await new Promise((yes,no)=>{f.release=()=>yes([{id:'late-old-page',folderId:'old',name:'Late page',path:'late.mp4',extension:'mp4',mime:'video/mp4',size:1,addedAt:1}]);signal?.addEventListener('abort',()=>{f.aborted=true;no(signal.reason);},{once:true});});`,
};
const sync = new Set([
  "hiddenSourceFolders",
  "isCatalogDeleted",
  "mediaHealthSnapshot",
  "loadPrefs",
]);
const persistence =
  names
    .map(
      (name) =>
        `export ${sync.has(name) ? "" : "async "}function ${name}(){${bodies[name] ?? "return [];"}}`,
    )
    .join("\n") +
  '\nexport const PHOTO_META_LS_KEY="test-photos";export const catalogWriter={current:()=>undefined};';
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "./persist" && context.parentURL?.endsWith("/videos/store.ts"))
      return { url: moduleOf(persistence), shortCircuit: true };
    if (specifier === "../idle-work" && context.parentURL?.endsWith("/videos/store.ts"))
      return {
        url: moduleOf(
          "export const idleEnrichment={enqueue:async()=>({})};export function setEnrichmentViewerOpen(){};",
        ),
        shortCircuit: true,
      };
    if (specifier === "@/lib/remote/functions")
      return {
        url: moduleOf(
          "export function followRemote(){};export function importChannels(){};export function refreshRemotes(){};export function searchAdultVideos(){};",
        ),
        shortCircuit: true,
      };
    if (specifier.startsWith("@/"))
      return next(new URL("../src/" + specifier.slice(2) + ".ts", import.meta.url).href, context);
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier))
        return next(specifier + ".ts", context);
      throw error;
    }
  },
});
const { useLibrary, checkpointLibraryForProfileSwitch, releaseLibraryForProfileSwitch } =
  await import("../src/lib/videos/store.ts");
test("switch checkpoint cancels a held read, keeps views until activation, and refuses busy work", async () => {
  useLibrary.setState({
    hydrated: false,
    videos: [],
    folders: [],
    follows: [],
    favorites: {},
    likes: {},
    progress: {},
    resumeProgress: {},
    history: [],
    tags: {},
    metadataProvenance: {},
  });
  const restoring = useLibrary.getState().restoreFolders();
  while (!fixture.readStarted) await new Promise((r) => setTimeout(r, 5));
  useLibrary.setState({ remoteBusy: true });
  await assert.rejects(checkpointLibraryForProfileSwitch(), /Finish the active pull/);
  assert.equal(fixture.aborted, false, "A rejected switch keeps the current read");
  useLibrary.setState({
    remoteBusy: false,
    scanning: null,
    refreshing: false,
    activeId: "old-player",
    previewId: "old-preview",
  });
  await checkpointLibraryForProfileSwitch();
  await restoring;
  assert.equal(fixture.aborted, true);
  assert.equal(useLibrary.getState().activeId, "old-player");
  assert.equal(useLibrary.getState().previewId, "old-preview");
  releaseLibraryForProfileSwitch();
  assert.equal(useLibrary.getState().activeId, null);
  assert.equal(useLibrary.getState().previewId, null);
  fixture.release();
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(
    useLibrary.getState().videos.some((v) => v.id === "late-old-page"),
    false,
    "A late page cannot enter the switched workspace",
  );
});
