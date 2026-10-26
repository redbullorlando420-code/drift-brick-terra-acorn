import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { YOUTUBE_TEXT_TAG_VERSION } from '../src/lib/videos/youtube-text-tags.ts';
const fixture = { saved: [], removed: [], creatorSaved: [], creatorSave: null, fullRemoteWrites: 0, viewer: false, wake: null, catalogReads: 0, remoteRows: new Map(), remoteSave: null };
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
  : name === 'saveCreatorCoverageRows' ? `export async function saveCreatorCoverageRows(rows,turn,valid){
    const f=globalThis.__enrichmentStoreFixture;await turn();await f.creatorSave?.(rows,valid);
    if(!valid())throw new DOMException('Changed','AbortError');f.creatorSaved.push(...structuredClone(rows));}`
  : name === 'loadCatalogVideo' ? 'export async function loadCatalogVideo(id){return globalThis.__enrichmentStoreFixture.remoteRows.get(id);}'
  : name === 'saveRemoteSnapshot' ? 'export async function saveRemoteSnapshot(snapshot){const f=globalThis.__enrichmentStoreFixture;f.fullRemoteWrites++;await f.remoteSave?.();for(const row of snapshot.videos)f.remoteRows.set(row.id,structuredClone(row));}'
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
  const row={...card('upgrade'),name:'Machine learning practical lesson',description:'Machine learning with Python\n01:30 Training neural networks #NeuralNetworks'};
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
  assert.equal(state.metadataProvenance.upgrade.youtubeTextTagVersion,YOUTUBE_TEXT_TAG_VERSION);assert.equal(fixture.saved.length,1);
  assert.equal(await useLibrary.getState().autoTagLibrary(),0);assert.equal(fixture.saved.length,1,'unchanged repair does not rewrite storage');
});

test('real creator repair returns before scans, patches only 48 names/tags, honors locks and writes only changed rows', async () => {
  fixture.creatorSaved=[];fixture.fullRemoteWrites=0;
  const follows=Array.from({length:1000},(_,i)=>({id:`yt:creator-${i}`,kind:'youtube',title:`Creator ${i}`,handle:String(i),channelId:`UC${i}`}));
  const videos=Array.from({length:80_000},(_,i)=>({id:String(i),folderId:`yt:creator-${i%1000}`,name:`Title ${i}`,path:String(i),extension:'yt',mime:'video/youtube',size:0,addedAt:1,
    get remote(){fixture.catalogReads++;return{kind:'youtube',channelId:`UC${i%1000}`,videoId:String(i)};}}));
  const guarded=value=>new Proxy(value,{ownKeys(){throw Error('large ledger enumerated');}});
  const tags=guarded({'0':['manual-choice'],unrelated:['keep']}), metadata=guarded({'0':{tags:{'manual-choice':'manual'},lockedFields:['tags'],updatedAt:1}});
  useLibrary.setState({videos,follows,tags,metadataProvenance:metadata,activeId:null,previewId:null,query:''});fixture.catalogReads=0;
  const action=useLibrary.getState().repairCreatorCoverage();
  assert.equal(fixture.catalogReads,0,'click returns before inspecting catalog rows');
  const result=await action;
  assert.deepEqual(result,{processed:48,repaired:48,tagged:47,remaining:79952});
  const state=useLibrary.getState();assert.equal(state.videos[47].remote.channelName,'Creator 47');
  assert.equal(state.videos[48],videos[48]);assert.equal(videos[0].remote.channelName,undefined);
  assert.deepEqual(state.tags['0'],['manual-choice']);assert.deepEqual(state.tags.unrelated,['keep']);
  assert.ok(state.tags['1'].includes('creator-creator-1'));
  assert.equal(state.metadataProvenance['1'].tags['creator-creator-1'],'provider:youtube');
  assert.equal(fixture.creatorSaved.length,48);assert.equal(fixture.creatorSaved[0].enrichment,undefined);
  assert.equal(fixture.fullRemoteWrites,0,'repair does not rewrite the full remote cache');
  assert.equal(fixture.wake,null);
});

test('creator repair waits behind a viewer, recovers from failed storage, and rebases a concurrent manual lock', async () => {
  fixture.creatorSaved=[];
  const videos=[{...card('repair'),remote:{kind:'youtube',channelId:'UCexact'}}];
  const follows=[{id:'yt:test',kind:'youtube',title:'Exact Creator',handle:'exact',channelId:'UCexact'}];
  const tags={},metadata={};
  useLibrary.setState({videos,follows,tags,metadataProvenance:metadata,previewId:'repair',activeId:null,query:''});
  let attempts=0;fixture.creatorSave=()=>{if(++attempts===1)throw Error('disk full');};
  const held=useLibrary.getState().repairCreatorCoverage();
  await new Promise(resolve=>setTimeout(resolve,10));assert.equal(attempts,0);
  useLibrary.setState({previewId:null});await assert.rejects(held,/disk full/);
  assert.equal(useLibrary.getState().videos,videos);assert.equal(useLibrary.getState().tags,tags);
  fixture.creatorSave=()=>{if(attempts++===1)useLibrary.getState().setVideoTags('repair',['manual-while-saving']);};
  const result=await useLibrary.getState().repairCreatorCoverage();
  assert.equal(result.repaired,1);assert.equal(result.tagged,0);
  assert.deepEqual(useLibrary.getState().tags.repair,['manual-while-saving']);
  assert.equal(fixture.creatorSaved.length,1);assert.equal(fixture.creatorSaved[0].enrichment,undefined);
  fixture.creatorSave=null;
});

test('removing exact follow evidence while repair is saving prevents stale publication', async () => {
  fixture.creatorSaved=[];
  const videos=[{...card('removed-follow'),remote:{kind:'youtube',channelId:'UCgone'}}];
  useLibrary.setState({videos,follows:[{id:'yt:gone',kind:'youtube',title:'Gone',handle:'gone',channelId:'UCgone'}],tags:{},metadataProvenance:{},activeId:null,previewId:null,query:''});
  fixture.creatorSave=()=>useLibrary.setState({follows:[]});
  const result=await useLibrary.getState().repairCreatorCoverage();
  assert.equal(result.repaired,0);assert.equal(useLibrary.getState().videos,videos);
  assert.equal(fixture.creatorSaved.length,0);fixture.creatorSave=null;
});

test('explicit watch metadata persists compact evidence and rechecks manual locks after asynchronous saving', async () => {
  const id = 'yt:metadata', youtubeId = 'BaW_jenozKc';
  const video = { ...card(id), name: 'An experiment', remote: { kind: 'youtube', videoId: youtubeId, channelName: 'Ada' } };
  useLibrary.setState({ videos: [video], folders: [], tags: { [id]: ['unknown-choice', 'python', 'my-choice', 'obsolete'] },
    metadataProvenance: { [id]: { tags: { 'my-choice': 'manual', obsolete: 'provider:youtube' } } }, activeId: null, previewId: null });
  fixture.remoteRows.clear();
  const metadata = { id: youtubeId, description: 'Machine learning with Python. #NeuralNetworks', keywords: ['Quantum circuits', 'Python'], date: '2024-05-12' };
  await useLibrary.getState().setYoutubeMetadata(id, metadata);
  let state = useLibrary.getState();
  for (const tag of ['unknown-choice', 'my-choice']) assert.ok(state.tags[id].includes(tag), tag);
  for(const tag of ['quantum-circuits','neuralnetworks'])assert(!state.tags[id].includes(tag),'uncorroborated metadata stays review-only');
   assert.ok(!state.tags[id].includes('obsolete')); assert.equal(state.metadataProvenance[id].tags['my-choice'], 'manual');
  assert.equal(state.metadataProvenance[id].tags.python, 'legacy', 'overlapping unknown tags cannot become provider-owned');
  assert.equal(state.videos[0].description, undefined); assert.equal(state.videos[0].remote.youtubeTagSummary.version, YOUTUBE_TEXT_TAG_VERSION);
  assert.equal(fixture.remoteRows.get(id).description, metadata.description); assert.deepEqual(fixture.remoteRows.get(id).remote.youtubeKeywords, metadata.keywords);
  let release, started; const saving = new Promise(resolve => { started = resolve; });
  fixture.remoteSave = () => new Promise(resolve => { release = resolve; started(); });
  const pending = useLibrary.getState().setYoutubeMetadata(id, { ...metadata, keywords: ['Robotics'] });
  await saving; useLibrary.getState().setVideoTags(id, ['late-manual']); release();
  assert.equal((await pending).locked, true); fixture.remoteSave = null;
  state = useLibrary.getState(); assert.deepEqual(state.tags[id], ['late-manual']); assert.equal(state.metadataProvenance[id].tags['late-manual'], 'manual');
  assert.deepEqual(fixture.remoteRows.get(id).remote.youtubeKeywords, ['Robotics']);
  const before = state.videos;
  fixture.remoteSave = async () => { throw Error('Disk write failed'); };
  await assert.rejects(useLibrary.getState().setYoutubeMetadata(id, metadata), /Disk write failed/); fixture.remoteSave = null;
  assert.equal(useLibrary.getState().videos, before); assert.deepEqual(useLibrary.getState().tags[id], ['late-manual']);
  await assert.rejects(useLibrary.getState().setYoutubeMetadata(id, { ...metadata, id: 'abcdefghijk' }), /no longer/);
  useLibrary.setState({ videos: [{ ...video, remote: { kind: 'youtube', watchUrl: `https://youtu.be/${youtubeId}` } }], tags: {}, metadataProvenance: {} });
  await useLibrary.getState().setYoutubeMetadata(id, metadata);
  assert.equal(useLibrary.getState().videos[0].remote.videoId, youtubeId, 'older URL-only imports gain their canonical ID');
});

test('real YouTube confidence review accepts weak evidence explicitly and preserves it across later provider refreshes',async()=>{
 const id='yt:confidence',youtubeId='BaW_jenozKc',row={...card(id),name:'Python workshop',remote:{kind:'youtube',videoId:youtubeId,channelName:'Ada'}};
 const favorites={unrelated:true},history=[{videoId:'other',at:1}];useLibrary.setState({videos:[row],folders:[],tags:{[id]:['my-choice']},metadataProvenance:{[id]:{tags:{'my-choice':'manual'},lockedFields:['category']}},favorites,history,activeId:null,previewId:null});
 await useLibrary.getState().setYoutubeMetadata(id,{id:youtubeId,description:'#Travel',keywords:['Travel']});
 let state=useLibrary.getState(),video=state.videos[0];assert(!state.tags[id].includes('travel'));assert(state.tags[id].includes('python'));
 const base={tags:state.tags[id],provenance:state.metadataProvenance[id],summary:video.remote.youtubeTagSummary,checkedAt:video.remote.youtubeTagsCheckedAt};
 assert.equal(state.acceptYoutubeTagSuggestions(id,['travel'],base),1);state=useLibrary.getState();assert.equal(state.metadataProvenance[id].tags.travel,'youtube-review');assert.equal(state.metadataProvenance[id].youtubeReviews.travel.score,55);assert.equal(state.metadataProvenance[id].tags['my-choice'],'manual');assert.deepEqual(state.metadataProvenance[id].lockedFields,['category']);
 await state.setYoutubeMetadata(id,{id:youtubeId,description:'Different description',keywords:[]});state=useLibrary.getState();assert(state.tags[id].includes('travel'));assert.equal(state.metadataProvenance[id].tags.travel,'youtube-review');assert.equal(state.favorites,favorites);assert.equal(state.history,history);
 assert.throws(()=>state.acceptYoutubeTagSuggestions(id,['travel'],base),/changed/);
 state.setVideoTags(id,['late-manual']);assert.throws(()=>useLibrary.getState().acceptYoutubeTagSuggestions(id,['travel'],base),/locked/);assert.deepEqual(useLibrary.getState().tags[id],['late-manual']);
});

test('hashtag-only YouTube titles cannot bypass review policy through automatic topic enrichment',async()=>{
 const id='yt:hash-policy',youtubeId='BaW_jenozKc',row={...card(id),name:'Update #Travel',remote:{kind:'youtube',videoId:youtubeId,channelName:'Ada'}};
 useLibrary.setState({videos:[row],folders:[],tags:{},metadataProvenance:{},activeId:null,previewId:null});
 await useLibrary.getState().setYoutubeMetadata(id,{id:youtubeId,description:'#Travel #Travel',keywords:['Travel']});
 assert(!useLibrary.getState().tags[id].includes('travel'));assert.deepEqual(useLibrary.getState().videos[0].remote.youtubeTagSummary.topics,[]);
});
