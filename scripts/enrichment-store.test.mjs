import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
const fixture = { saved: [], removed: [], viewer: false, wake: null, catalogReads: 0 };
globalThis.__enrichmentStoreFixture = fixture;
const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
const queueUrl = new URL('../src/lib/idle-queue.ts', import.meta.url).href;
const idleModule = `import { createIdleQueue } from ${JSON.stringify(queueUrl)};
const f = globalThis.__enrichmentStoreFixture;
export const idleEnrichment = createIdleQueue({ allowed:()=>!f.viewer,
 turn:()=>new Promise(resolve=>setImmediate(resolve)), subscribe:wake=>{f.wake=wake;return()=>{f.wake=null;};} });
f.queue=idleEnrichment;
export function setEnrichmentViewerOpen(open,searching=false){f.viewer=open||searching;f.wake?.(true);}`;
const names = [...readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8').matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const persistence = names.map(name => name === 'loadPrefs' ? 'export function loadPrefs(){return null;}'
  : name === 'saveEnrichmentRows' ? 'export async function saveEnrichmentRows(rows){globalThis.__enrichmentStoreFixture.saved.push(...structuredClone(rows));}'
  : name === 'removeEnrichmentRows' ? 'export async function removeEnrichmentRows(ids){globalThis.__enrichmentStoreFixture.removed.push(...ids);}'
  : `export async function ${name}(){return [];}`).join('\n') + '\nexport const PHOTO_META_LS_KEY="test-photos";';
registerHooks({ resolve(specifier, context, next) {
  if (specifier === '../idle-work' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule(idleModule), shortCircuit: true };
  if (specifier === './persist' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule(persistence), shortCircuit: true };
  if (specifier === '@/lib/remote/functions') return { url: asModule('export function followRemote(){};export function importChannels(){};export function refreshRemotes(){};export function searchAdultVideos(){};'), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context); throw error;
  }
} });
const { useLibrary } = await import('../src/lib/videos/store.ts');
const card = id => ({ id, folderId:'yt:test', name:'Space telescope science lecture', path:id, extension:'yt', mime:'video/youtube', size:0, addedAt:1,
  get remote() { fixture.catalogReads++; return { kind:'youtube', channelName:'Ada', videoId:id }; } });
test('real store metadata actions return before catalog parsing, honor locks, save compact provider provenance, and hold during a viewer', async () => {
  const videos = Array.from({length:100_000}, (_,i)=>card(String(i)));
  useLibrary.setState({ videos, folders:[], tags:{'0':['manual-choice']}, metadataProvenance:{'0':{tags:{'manual-choice':'manual'},lockedFields:['tags'],updatedAt:1}}, activeId:null, previewId:null });
  fixture.catalogReads = 0;
  const action = useLibrary.getState().enrichMetadataTail();
  assert.equal(fixture.catalogReads,0,'click handler does not scan/parse the catalog');
  const result = await action;
  assert.equal(result.processed,48); assert.equal(fixture.saved.length,48); assert.equal(fixture.saved.some(row=>row.id==='0'),false);
  assert.deepEqual(useLibrary.getState().tags['0'],['manual-choice']);
  assert.ok(fixture.saved.every(row=>row.tags.length<=32 && Object.values(row.provenance.tags).every(source=>source==='provider:youtube')));
  assert.ok(useLibrary.getState().tags['1'].includes('creator-ada'));
  useLibrary.setState({previewId:'1'}); fixture.catalogReads=0;
  const held = useLibrary.getState().enrichMetadataTail();
  await new Promise(resolve=>setTimeout(resolve,10)); assert.equal(fixture.catalogReads,0);
  useLibrary.setState({previewId:null}); const resumed = await held;
  assert.equal(resumed.processed,48); assert.equal(fixture.saved.length,96); assert.equal(fixture.wake,null,'completed owners release subscriptions');
  useLibrary.setState({query:'science'});fixture.catalogReads=0;
  const searchHeld=useLibrary.getState().enrichMetadataTail();
  await new Promise(resolve=>setTimeout(resolve,10));assert.equal(fixture.catalogReads,0,'search holds optional tag mutation');
  useLibrary.setState({query:''});assert.equal((await searchHeld).processed,48);
});
test('real smart tags retain source/creator filters and manual locks without a catalog-sized click stack', async () => {
  fixture.saved=[];
  useLibrary.setState({videos:[card('manual'),card('auto')],tags:{manual:['keep']},metadataProvenance:{manual:{tags:{keep:'manual'},lockedFields:['tags']}},previewId:null,activeId:null});
  fixture.catalogReads=0;const action=useLibrary.getState().autoTagLibrary();assert.equal(fixture.catalogReads,0);
  assert.equal(await action,1);assert.deepEqual(useLibrary.getState().tags.manual,['keep']);assert.ok(useLibrary.getState().tags.auto.includes('creator-ada'));
  assert.equal(fixture.saved.length,1);
});
test('manual and accepted inspection edits never enumerate the existing tag ledgers', () => {
  const guarded = value => new Proxy(value, { ownKeys() { throw Error('large tag ledger enumerated'); } });
  const local = { ...card('local'), remote: undefined };
  const tags = guarded({ local: ['existing'], unrelated: ['keep'] }), provenance = guarded({});
  useLibrary.setState({ videos:[local],tags,metadataProvenance:provenance,categories:{},previewId:null,activeId:null });
  assert.equal(useLibrary.getState().applyReviewedTags('local',['science'],'local-vision'),1);
  assert.deepEqual(tags.local,['existing']);assert.ok(useLibrary.getState().tags.local.includes('science'));
  useLibrary.getState().setVideoTags('local',['manual-choice']);
  useLibrary.getState().setVideoCategory('local','Manual category');
  const state=useLibrary.getState();assert.deepEqual(state.tags.local,['manual-choice']);assert.deepEqual(state.tags.unrelated,['keep']);
  assert.deepEqual(state.metadataProvenance.local.lockedFields,['tags','category']);assert.equal(state.categories.local,'Manual category');
});
test('removing a folder removes only its sparse enrichment records as well as its catalog metadata', async () => {
  fixture.removed=[];
  useLibrary.setState({videos:[{...card('doomed'),folderId:'doomed-folder'},{...card('kept'),folderId:'kept-folder'}],folders:[],tags:{doomed:['old'],kept:['keep']},metadataProvenance:{},activeId:null,previewId:null});
  await useLibrary.getState().removeFolder('doomed-folder');
  assert.deepEqual(fixture.removed,['doomed']);assert.deepEqual(useLibrary.getState().videos.map(video=>video.id),['kept']);assert.deepEqual(useLibrary.getState().tags,{kept:['keep']});
});

test('cached YouTube repair replaces saturated provider tags, preserves manual locks and saves idempotent versioned rows', async () => {
  fixture.saved=[];
  const stale=Array.from({length:30},(_,i)=>`obsolete${i}`);
  const row={...card('upgrade'),name:'A practical lesson',description:'Machine learning with Python\n01:30 Training neural networks #NeuralNetworks'};
  const current=['my-choice',...stale];
  useLibrary.setState({videos:[row,{...row,id:'locked'}],tags:{upgrade:current,locked:['keep']},metadataProvenance:{
    upgrade:{tags:{'my-choice':'manual',...Object.fromEntries(stale.map(tag=>[tag,'provider:youtube']))}},
    locked:{tags:{keep:'manual'},lockedFields:['tags']}},previewId:null,activeId:null});
  useLibrary.getState().repairCachedMetadata();
  await new Promise((resolve,reject)=>{
    const off=fixture.queue.subscribe(()=>{const snapshot=fixture.queue.getSnapshot();if(snapshot.error){off();reject(Error(snapshot.error));}else if(!snapshot.jobs.length){off();resolve();}});
  });
  const state=useLibrary.getState();assert.ok(state.tags.upgrade.includes('my-choice'));assert.ok(state.tags.upgrade.includes('machine-learning'));
  assert.ok(state.tags.upgrade.includes('technology'));assert.ok(!state.tags.upgrade.includes('obsolete0'));
  assert.deepEqual(state.tags.locked,['keep']);assert.equal(state.metadataProvenance.upgrade.tags['my-choice'],'manual');
  assert.equal(state.metadataProvenance.upgrade.youtubeTextTagVersion,2);assert.equal(fixture.saved.length,1);
  assert.equal(await useLibrary.getState().autoTagLibrary(),0);assert.equal(fixture.saved.length,1,'unchanged repair does not rewrite storage');
});
