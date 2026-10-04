import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
const fixture = { snapshot: undefined, local: [], read: null };
globalThis.__startupStoreFixture = fixture;
const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const names = [...readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8').matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const bodies = {
  loadPrefs: 'return null;', loadRemoteSnapshot: 'return globalThis.__startupStoreFixture.snapshot;',
  loadCatalogVideos: 'return globalThis.__startupStoreFixture.local;',
  restoreEnrichmentRows: 'return arguments[0];', restoreDurableResume: 'return {progress:{},resumeProgress:{}};',
  restoreDurableMarks: 'return {viewCounts:{},cameCounts:{}};', restoreDurableShelves: 'return {authoritative:false,favorites:[],likes:[]};',
  restoreDurablePhotos: 'return {sources:[]};', loadActivitySnapshot: 'return undefined;',
};
const persistence = names.map(name => `export async function ${name}(){${bodies[name] ?? 'return [];'}}`).join('\n')
  .replace('export async function loadPrefs()', 'export function loadPrefs()') + '\nexport const PHOTO_META_LS_KEY="test-photos";';
registerHooks({ resolve(specifier, context, next) {
  if (specifier === './persist' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule(persistence), shortCircuit: true };
  if (specifier === '../idle-work' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule('export const idleEnrichment={enqueue:async()=>({})}; export function setEnrichmentViewerOpen(){};'), shortCircuit: true };
  if (specifier === '@/lib/remote/functions') return { url: asModule('export function followRemote(){}; export function importChannels(){}; export function refreshRemotes(){}; export function searchAdultVideos(){};'), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context); throw error;
  }
} });
const { useLibrary } = await import('../src/lib/videos/store.ts');
const card = (id, folderId='yt:test') => ({id,folderId,name:id,path:id,extension:'yt',mime:'video/youtube',size:0,addedAt:1,detailsOnDisk:true,
  remote:{kind:'youtube',videoId:id,channelName:'Test'}});

test('real startup rebases a catalog restore around a concurrent pull, unfollow, favorite, resume and navigation', async () => {
  const follows = [{id:'yt:test',kind:'youtube',title:'Test',handle:'@test',addedAt:1},{id:'yt:gone',kind:'youtube',title:'Gone',handle:'@gone',addedAt:1}];
  useLibrary.setState({hydrated:false,videos:[],folders:[],follows,favorites:{},likes:{},progress:{},resumeProgress:{},history:[],tags:{},metadataProvenance:{}});
  const rows = Array.from({length:4096},(_,i)=>card(String(i)));
  let edited = false;
  Object.defineProperty(rows[0], 'folderId', {get(){
    if (!edited) { edited=true; queueMicrotask(()=>{
      useLibrary.setState({videos:[{...card('0'),name:'Foreground title'},card('new-pull')], follows:[follows[0]],
        favorites:{saved:true}, progress:{'0':{t:30,d:80,at:20}}, resumeProgress:{'id:0':{t:10,d:80,at:1}}, sourceId:'history'});
    }); }
    return 'yt:test';
  }});
  fixture.snapshot = {videos:[...rows,card('saved','yt:gone'),card('discard','yt:gone')],folders:[],checkedAt:1};
  fixture.local=[{...card('0'),name:'Older local duplicate'}, { ...card('local','folder:disk'),remote:undefined,extension:'mp4',mime:'video/mp4'}];
  const work=useLibrary.getState().restoreFolders();
  assert.equal(edited,false,'restore returns before saved catalog traversal');
  await work;
  const state=useLibrary.getState();
  assert.equal(state.videos.length,4099); assert.equal(state.videos.find(row=>row.id==='0').name,'Foreground title');
  assert.equal(state.videos.some(row=>row.id==='new-pull'),true); assert.equal(state.videos.some(row=>row.id==='saved'),true);
  assert.equal(state.videos.some(row=>row.id==='discard'),false); assert.equal(state.progress['0'].t,30);
  assert.equal(state.sourceId,'history'); assert.equal(state.favorites.saved,true);
  assert.equal(state.folders.find(row=>row.id==='folder:disk').videoCount,1);
  assert.equal(new Set(state.videos.map(row=>row.id)).size,state.videos.length);
});
