import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeMissionPlan, type Mission } from "./mission-plan.ts";

const defaults: Mission[] = [
  { id: "earlier-complete", title: "Earlier completion", detail: "Updated detail", done: true },
  { id: "recent-saved-library-hydration", title: "Saved-library hydration integrity", detail: "Verified", done: true },
  { id: "still-planned", title: "Still planned", detail: "Not verified", done: false },
  { id: "youtube-upgrade-03", title: "First-click trace", detail: "Verified", done: true },
  { id: "youtube-upgrade-05", title: "Artwork priority", detail: "Verified", done: true },
];

test("revision 2 promotes only the newly verified hydration milestone", () => {
  const saved: Mission[] = [
    { ...defaults[0], detail: "Old detail", done: false, status: "planned" },
    { ...defaults[1], done: false, status: "planned" },
    { id: "my-idea", title: "My idea", detail: "Keep this", done: false },
  ];
  const merged = mergeMissionPlan(saved, defaults, 2);
  assert.equal(merged[0].done, false);
  assert.equal(merged[0].detail, "Updated detail");
  assert.equal(merged[1].done, true);
  assert.equal(merged[1].status, "complete");
  assert.equal(merged[2].title, "My idea");
  assert.equal(merged[3].id, "still-planned");
  assert.equal(merged[4].id, "youtube-upgrade-03");
});

test("a later manual restore to planned remains saved", () => {
  const saved: Mission[] = [{ ...defaults[1], done: false, status: "planned" }];
  assert.equal(mergeMissionPlan(saved, defaults, 3)[0].done, false);
});

test("revision 3 promotes the YouTube trace without undoing manual restores", () => {
  const saved: Mission[] = [
    { ...defaults[0], done: false, status: "planned" },
    { ...defaults[3], done: false, status: "planned" },
  ];
  const merged = mergeMissionPlan(saved, defaults, 3);
  assert.equal(merged[0].done, false);
  assert.equal(merged[1].done, true);
  assert.equal(mergeMissionPlan([{ ...defaults[3], done: false }], defaults, 4)[0].done, false);
});

test("revision 4 promotes artwork priority while respecting older manual restores", () => {
  const saved: Mission[] = [
    { ...defaults[0], done: false, status: "planned" },
    { ...defaults[3], done: false, status: "planned" },
    { ...defaults[4], done: false, status: "in-progress" },
  ];
  const merged = mergeMissionPlan(saved, defaults, 4);
  assert.equal(merged[0].done, false);
  assert.equal(merged[1].done, false);
  assert.equal(merged[2].done, true);
  assert.equal(merged[2].status, "complete");
  assert.equal(mergeMissionPlan([{ ...defaults[4], done: false }], defaults, 5)[0].done, false);
});

test("pre-revision plans receive the original verified completions", () => {
  const saved: Mission[] = [{ ...defaults[0], done: false, status: "in-progress" }];
  assert.equal(mergeMissionPlan(saved, defaults, 0)[0].done, true);
});
test('revision 5 promotes only verified viewer milestones and preserves later manual choices', () => {
  const added: Mission[] = [
    { id: 'viewer-detail-isolation', title: 'Isolated details', detail: 'Verified', done: true },
    { id: 'viewer-detail-memory-budget', title: 'Bounded details', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Broader render audit', detail: 'Remaining work', done: false },
  ];
  const saved = added.map(row => ({ ...row, done: false, status: 'planned' as const }));
  const merged = mergeMissionPlan(saved, added, 5);
  assert.deepEqual(merged.map(row => row.done), [true, true, false]);
  assert.equal(mergeMissionPlan(saved, added, 6)[0].done, false);
});

test('revision 6 completes the verified search budget without completing broader audits', () => {
  const current: Mission[] = [
    { id: 'recent-search-result-budget', title: 'Search budget', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render audit', detail: 'More measurements needed', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 6).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 7)[0].done, false);
});

test('revision 7 starts the timer audit without completing it or changing other manual choices', () => {
  const current: Mission[] = [
    { id: 'smooth-09', title: 'Timer consolidation', detail: 'Partial isolation verified', done: false, status: 'in-progress' },
    { id: 'speed-03', title: 'Render audit', detail: 'Still in progress', done: false },
  ];
  const saved = current.map(row => ({ ...row, status: 'planned' as const }));
  const updated = mergeMissionPlan(saved, current, 7);
  assert.deepEqual(updated.map(row => row.status), ['in-progress', 'planned']);
  assert.deepEqual(updated.map(row => row.done), [false, false]);
  assert.equal(mergeMissionPlan(saved, current, 8)[0].status, 'planned');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'blocked' }], current, 7)[0].status, 'blocked');
});

test('revision 8 completes verified timer consolidation and preserves unrelated/later manual statuses', () => {
  const current: Mission[] = [
    { id: 'smooth-09', title: 'Timer consolidation', detail: 'Shared scheduler verified', done: true },
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'More work needed', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  const merged = mergeMissionPlan(saved, current, 8);
  assert.deepEqual(merged.map(row => row.done), [true, false, false]);
  assert.deepEqual(merged.map(row => row.status), ['complete', 'in-progress', 'in-progress']);
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'planned' }], current, 9)[0].status, 'planned');
});

test('revision 9 promotes only verified navigation and preserves later manual restores', () => {
  const current: Mission[] = [
    { id: 'smooth-01', title: 'Navigation transition budget', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render audit', detail: 'Card invalidation remains', done: false },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 9).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 10)[0].done, false);
});

test('revision 10 starts enrichment work honestly without completing it or overriding blocked/later choices', () => {
  const current: Mission[] = [
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'Queue shipped; large ledger materialization remains', done: false, status: 'in-progress' },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, status: 'planned' as const }));
  const updated = mergeMissionPlan(saved, current, 10);
  assert.deepEqual(updated.map(row => row.done), [false, false]);
  assert.deepEqual(updated.map(row => row.status), ['in-progress', 'planned']);
  assert.equal(mergeMissionPlan(saved, current, 11)[0].status, 'planned');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'blocked' }], current, 10)[0].status, 'blocked');
});

test('revision 11 completes only verified enrichment and respects later manual restores', () => {
  const current: Mission[] = [
    { id: 'speed-06', title: 'Idle enrichment queue', detail: 'Sparse updates verified', done: true },
    { id: 'speed-03', title: 'Render invalidation audit', detail: 'Still open', done: false },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  const merged = mergeMissionPlan(saved, current, 11);
  assert.deepEqual(merged.map(row => row.done), [true, false, false]);
  assert.equal(merged[0].status, 'complete');
  assert.equal(mergeMissionPlan([{ ...saved[0], status: 'planned' }], current, 12)[0].status, 'planned');
});

test('revision 12 completes verified virtualization without changing other or later manual choices', () => {
  const current: Mission[] = [
    { id: 'smooth-02', title: 'Long-list virtualization proof', detail: 'Verified', done: true },
    { id: 'speed-03', title: 'Render invalidation audit', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 12).map(row => row.done), [true, false]);
  assert.equal(mergeMissionPlan(saved, current, 13)[0].status, 'planned');
});

test('revision 13 completes only verified startup milestones and preserves later manual choices', () => {
  const current: Mission[] = [
    { id: 'speed-01', title: 'First interaction budget', detail: 'Verified', done: true },
    { id: 'recent-cold-home-readiness', title: 'Cold Home readiness proof', detail: 'Verified', done: true },
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Still open', done: false },
    { id: 'recent-memory-soak', title: 'Memory soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 13).map(row => row.done), [true, true, false, false]);
  assert.deepEqual(mergeMissionPlan(saved, current, 14).map(row => row.status), ['in-progress', 'in-progress', 'in-progress', 'in-progress']);
});

test('revision 14 completes the verified slow-device profile without resetting other or later choices', () => {
  const current: Mission[] = [
    { id: 'smooth-10', title: 'Slow-device profile', detail: 'Verified budgets', done: true },
    { id: 'speed-09', title: 'Mobile memory budget', detail: 'Broader audit remains', done: false },
    { id: 'recent-provider-soak', title: 'Provider soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 14).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 15)[0].status, 'in-progress');
});

test('revision 15 promotes only the verified render audit and preserves later manual status choices', () => {
  const current: Mission[] = [
    { id: 'speed-03', title: 'Render invalidation audit', detail: 'Verified stable search and keyed ratings', done: true },
    { id: 'smooth-11', title: 'Accessibility performance audit', detail: 'Broader focus audit remains', done: false },
    { id: 'recent-memory-soak', title: 'Memory soak', detail: 'Still open', done: false },
  ];
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 15).map(row => row.done), [true, false, false]);
  assert.equal(mergeMissionPlan(saved, current, 16)[0].status, 'in-progress');
});

test('revision 16 promotes mobile budgets without completing physical-device soak or resetting later choices', () => {
  const current: Mission[] = [
    {id:'speed-09',title:'Mobile memory budget',detail:'Verified phone budgets',done:true},
    {id:'recent-memory-soak',title:'Memory soak',detail:'Still open',done:false},
    {id:'smooth-11',title:'Accessibility performance audit',detail:'Still open',done:false},
  ];
  const saved=current.map(row=>({...row,done:false,status:'in-progress' as const}));
  assert.deepEqual(mergeMissionPlan(saved,current,16).map(row=>row.done),[true,false,false]);
  assert.equal(mergeMissionPlan(saved,current,17)[0].status,'in-progress');
});

test('revision 17 promotes verified keyboard browsing without changing soak or later manual choices', () => {
  const current: Mission[] = [
    {id:'smooth-11',title:'Accessibility performance audit',detail:'Verified deferred focus and viewer handoff',done:true},
    {id:'recent-memory-soak',title:'Memory soak',detail:'Still open',done:false},
    {id:'smooth-12',title:'Smoothness scorecard',detail:'Still open',done:false},
  ];
  const saved=current.map(row=>({...row,done:false,status:'in-progress' as const}));
  assert.deepEqual(mergeMissionPlan(saved,current,17).map(row=>row.done),[true,false,false]);
  assert.equal(mergeMissionPlan(saved,current,18)[0].status,'in-progress');
});

test('revision 18 promotes verified diagnostics and release gate without completing soak or resetting later choices', () => {
  const current: Mission[] = ['speed-08', 'speed-10', 'smooth-12', 'recent-memory-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: id !== 'recent-memory-soak' }));
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 18).map(row => row.done), [true, true, true, false]);
  assert.equal(mergeMissionPlan(saved, current, 19)[0].status, 'planned');
});

test('revision 20 completes only verified Twitch checkpoint, diagnostics and merge milestones', () => {
  const current: Mission[] = ['twitch-upgrade-01', 'twitch-upgrade-03', 'twitch-upgrade-09', 'twitch-upgrade-19', 'recent-provider-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: ['twitch-upgrade-01', 'twitch-upgrade-03', 'twitch-upgrade-09'].includes(id) }));
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 19).map(row => row.done), [true, true, true, false, false]);
  assert(mergeMissionPlan(saved, current, 20).every(row => row.status === 'planned'));
});

test('revision 21 promotes Twitch search, mobile rail and benchmark without completing soak or resetting later choices', () => {
  const verified = ['twitch-upgrade-16', 'twitch-upgrade-17', 'twitch-upgrade-20'];
  const current: Mission[] = [...verified, 'twitch-upgrade-19', 'recent-provider-soak', 'recent-memory-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: verified.includes(id) }));
  const saved = current.map(row => ({ ...row, done: false, status: 'planned' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 20).map(row => row.done), [true, true, true, false, false, false]);
  assert(mergeMissionPlan(saved, current, 21).every(row => row.status === 'planned'));
});

test('revision 22 promotes only provider budgets while preserving soak and later manual choices', () => {
  const current: Mission[] = ['speed-02', 'recent-provider-soak', 'recent-memory-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: id === 'speed-02' }));
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 21).map(row => row.done), [true, false, false]);
  assert(mergeMissionPlan(saved, current, 22).every(row => row.status === 'in-progress'));
});

test('revision 23 promotes YouTube dates, formats and regressions without completing soak or resetting later choices', () => {
  const verified = ['youtube-upgrade-07', 'youtube-upgrade-08', 'youtube-upgrade-20'];
  const current: Mission[] = [...verified, 'youtube-upgrade-06', 'youtube-upgrade-18', 'recent-provider-soak', 'recent-memory-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: verified.includes(id) }));
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 22).map(row => row.done), [true, true, true, false, false, false, false]);
  assert(mergeMissionPlan(saved, current, 23).every(row => row.status === 'in-progress'));
});

test('revision 24 promotes verified Twitch queue, retries, controls and failure recovery only once', () => {
  const verified = ['twitch-upgrade-02', 'twitch-upgrade-08', 'twitch-upgrade-10', 'twitch-upgrade-18'];
  const current: Mission[] = [...verified, 'twitch-upgrade-19', 'recent-provider-soak', 'recent-memory-soak'].map(id => ({ id, title: id, detail: 'Current evidence', done: verified.includes(id) }));
  const saved = current.map(row => ({ ...row, done: false, status: 'in-progress' as const }));
  assert.deepEqual(mergeMissionPlan(saved, current, 23).map(row => row.done), [true, true, true, true, false, false, false]);
  assert(mergeMissionPlan(saved, current, 24).every(row => row.status === 'in-progress'));
});

test('revision 25 promotes only verified creator review, offline audit and browser matrix, preserving physical/provider work and custom ideas', () => {
  const verified = ['youtube-upgrade-06', 'youtube-upgrade-17', 'youtube-upgrade-18', 'twitch-upgrade-19'];
  const current: Mission[] = [...verified, 'watch', 'watch-room-cross-device', 'sprint-19', 'recent-provider-soak', 'speed-01'].map(id => ({id,title:id,detail:'Current evidence',done:verified.includes(id) || id==='speed-01'}));
  const saved: Mission[] = [...current.map(row=>({...row,done:false,status:'planned' as const})),{id:'my-milestone',title:'My milestone',detail:'Keep my idea',done:false,status:'blocked'}];
  const migrated=mergeMissionPlan(saved,current,24);
  assert.deepEqual(migrated.map(row=>row.done),[true,true,true,true,false,false,false,false,false,false]);
  assert.equal(migrated.at(-1)?.detail,'Keep my idea');
  assert(mergeMissionPlan(saved,current,25).slice(0,-1).every(row=>row.status==='planned'));
});

test('revision 27 promotes only the verified response-contract and Twitch isolation milestones',()=>{
 const current:Mission[]=['next-022','next-038','next-024','next-001'].map(id=>({id,title:id,detail:'Current proof',done:id==='next-022'||id==='next-038',status:id==='next-022'||id==='next-038'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'planned' as const})),{id:'custom-provider-idea',title:'My idea',detail:'Keep exact words',done:false,status:'blocked'}];
 const migrated=mergeMissionPlan(saved,current,26);assert.deepEqual(migrated.map(m=>m.done),[true,true,false,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact words');
 const later=mergeMissionPlan(saved,current,27);assert(later.every(m=>!m.done));assert.equal(later.at(-1)?.status,'blocked');
});


test('revision 28 completes verified YouTube negative evidence without resetting prior or later manual reopens',()=>{
 const current:Mission[]=['next-022','next-038','next-024','next-023'].map(id=>({id,title:id,detail:'Current proof',done:id!=='next-023',status:id!=='next-023'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'in-progress' as const})),{id:'custom-live-idea',title:'My idea',detail:'Keep exact words',done:false,status:'blocked'}];
 const migrated=mergeMissionPlan(saved,current,27);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact words');
 assert(mergeMissionPlan(saved,current,28).every(m=>!m.done));
});


test('revision 29 promotes verified live coverage without resetting earlier or later manual choices',()=>{
 const current:Mission[]=['next-022','next-038','next-024','next-023','next-025'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-025',status:id!=='next-025'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'blocked' as const})),{id:'custom-live-plan',title:'My plan',detail:'Keep my words',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,28);assert.deepEqual(migrated.map(m=>m.done),[false,false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep my words');assert(mergeMissionPlan(saved,current,29).every(m=>!m.done));
});

test('revision 30 promotes verified clip coverage without resetting earlier reopens or unrelated work',()=>{
 const current:Mission[]=['next-022','next-038','next-024','next-023','next-031','next-032'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-032',status:id!=='next-032'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'blocked' as const})),{id:'custom-clip-plan',title:'My plan',detail:'Keep my exact words',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,29);assert.deepEqual(migrated.map(m=>m.done),[false,false,false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep my exact words');assert(mergeMissionPlan(saved,current,30).every(m=>!m.done));
});

test('revision 31 completes clip freshness once and preserves prior/manual reopens and custom work',()=>{
 const current:Mission[]=['next-023','next-031','next-032','next-033'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-033',status:id!=='next-033'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'blocked' as const})),{id:'custom-freshness',title:'My task',detail:'Preserve exact words',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,30);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Preserve exact words');assert(mergeMissionPlan(saved,current,31).every(m=>!m.done));
});

test('revision 32 promotes verified Twitch content types without resetting manual reopens or custom work',()=>{
 const current:Mission[]=['next-031','next-032','next-039','next-040'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-040',status:id!=='next-040'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(row=>({...row,done:false,status:'blocked' as const})),{id:'custom-types',title:'My idea',detail:'Keep exact custom words',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,31);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom words');assert(mergeMissionPlan(saved,current,32).every(m=>!m.done));
});

test('revision 33 promotes verified Twitch policies without resetting manual reopens or custom work',()=>{
 const current:Mission[]=['next-032','next-039','next-033','next-034'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-034',status:id!=='next-034'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'planned' as const})),{id:'custom',title:'Custom',detail:'Keep exact custom work',done:false}];
 const migrated=mergeMissionPlan(saved,current,32);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom work');assert(mergeMissionPlan(saved,current,33).every(m=>!m.done));
});

test('revision 34 promotes verified YouTube publication precision without resetting manual or custom work',()=>{
 const current:Mission[]=['next-039','next-033','next-027','next-028'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-028',status:id!=='next-028'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'planned' as const})),{id:'custom',title:'Custom',detail:'Keep exact custom work',done:false}];
 const migrated=mergeMissionPlan(saved,current,33);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom work');assert(mergeMissionPlan(saved,current,34).every(m=>!m.done));
});

test('revision 35 promotes session handoff once while preserving manual reopens, unrelated and custom work',()=>{
 const current:Mission[]=['next-033','next-027','next-047','next-048'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-048',status:id!=='next-048'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-session',title:'Custom',detail:'Keep exact custom session work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,34);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom session work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,35).every(m=>!m.done));
});

test('revision 36 promotes observed player readiness once and preserves prior, custom and later manual choices',()=>{
 const current:Mission[]=['next-027','next-047','next-044','next-045'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-045',status:id!=='next-045'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-readiness',title:'Custom',detail:'Keep exact custom readiness work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,35);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom readiness work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,36).every(m=>!m.done));
});

test('revision 37 promotes embed failure triage once without resetting manual reopens or custom work',()=>{
 const current:Mission[]=['next-047','next-044','next-028','next-029'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-029',status:id!=='next-029'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-triage',title:'Custom',detail:'Keep exact custom triage work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,36);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom triage work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,37).every(m=>!m.done));
});

test('revision 38 promotes recommendation evaluation once and preserves manual reopens and custom work',()=>{
 const current:Mission[]=['next-044','next-028','next-051','next-052'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-052',status:id!=='next-052'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-evaluation',title:'Custom',detail:'Keep exact custom evaluation work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,37);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom evaluation work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,38).every(m=>!m.done));
});

test('revision 39 promotes scoped rejection choices once while preserving manual reopens and custom work',()=>{
 const current:Mission[]=['next-028','next-051','next-052','next-053'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-053',status:id!=='next-053'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-choices',title:'Custom',detail:'Keep exact custom rejection work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,38);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom rejection work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,39).every(m=>!m.done));
});

test('revision 40 promotes recommendation exposure once and preserves unrelated reopens and custom choices',()=>{
 const current:Mission[]=['next-051','next-052','next-053','next-054'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-054',status:id!=='next-054'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-exposure',title:'Custom',detail:'Keep exact custom exposure work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,39);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom exposure work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,40).every(m=>!m.done));
});

test('revision 41 promotes reviewed topic aliases once without resetting unrelated reopens or custom work',()=>{
 const current:Mission[]=['next-052','next-053','next-054','next-055'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-055',status:id!=='next-055'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-alias',title:'Custom',detail:'Keep exact custom alias work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,40);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact custom alias work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,41).every(m=>!m.done));
});

test('revision 42 promotes tag confidence once and preserves unrelated reopens and custom work',()=>{
 const current:Mission[]=['next-053','next-054','next-055','next-056'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-056',status:id!=='next-056'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-confidence',title:'Custom',detail:'Keep exact confidence work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,41);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact confidence work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,42).every(m=>!m.done));
});

test('revision 43 promotes grounded Guide evidence once and preserves reopens and custom instructions',()=>{
 const current:Mission[]=['next-054','next-055','next-056','next-057'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-057',status:id!=='next-057'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-guide',title:'Custom',detail:'Keep exact Guide instructions',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,42);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact Guide instructions');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,43).every(m=>!m.done));
});

test('revision 44 promotes verified session tuning once and preserves earlier reopens and custom work',()=>{
 const current:Mission[]=['next-055','next-056','next-057','next-058'].map(id=>({id,title:id,detail:'Verified current defaults',done:id!=='next-058',status:id!=='next-058'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-session-tuning',title:'Custom',detail:'Keep exact session tuning work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,43);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact session tuning work');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,44).every(m=>!m.done));
});

test('revision 45 promotes verified topic bridges once without resetting reopens or custom work',()=>{
 const current:Mission[]=['next-056','next-057','next-058','next-059'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-059',status:id!=='next-059'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-bridge',title:'Custom',detail:'Keep exact bridge notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,44);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact bridge notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,45).every(m=>!m.done));
});

test('revision 46 promotes verified fairness reports once while retaining manual reopens and custom work',()=>{
 const current:Mission[]=['next-057','next-058','next-059','next-060'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-060',status:id!=='next-060'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-fairness',title:'Custom',detail:'Keep exact report notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,45);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact report notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,46).every(m=>!m.done));
});

test('revision 47 promotes verified experiment replay once and preserves manual and external work',()=>{
 const current:Mission[]=['next-058','next-059','next-060','next-061'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-061',status:id!=='next-061'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-replay',title:'Custom',detail:'Keep exact experiment notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,46);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact experiment notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,47).every(m=>!m.done));
});

test('revision 48 promotes the three verified film workflows together and preserves unrelated manual choices',()=>{
 const current:Mission[]=['next-060','next-061','next-062','next-063','next-064'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-064',status:id!=='next-064'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-film',title:'Custom',detail:'Keep exact film notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,47);assert.deepEqual(migrated.map(m=>m.done),[false,true,true,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact film notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,48).every(m=>!m.done));
});

test('revision 49 promotes the three verified anime workflows together while preserving reopens and custom work',()=>{
 const current:Mission[]=['next-063','next-064','next-065','next-066','next-067'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-067',status:id!=='next-067'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-anime',title:'Custom',detail:'Keep exact anime notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,48);assert.deepEqual(migrated.map(m=>m.done),[false,true,true,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact anime notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,49).every(m=>!m.done));
});

test('revision 50 promotes provider capabilities, quality and login recovery without completing privacy dependencies',()=>{
 const current:Mission[]=['next-066','next-067','next-068','next-069','next-070'].map(id=>({id,title:id,detail:'Verified defaults',done:id!=='next-069',status:id!=='next-069'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-provider',title:'Custom',detail:'Keep exact provider notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,49);assert.deepEqual(migrated.map(m=>m.done),[false,true,true,false,true,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact provider notes');assert.equal(migrated[0].status,'blocked');assert.equal(migrated.at(-1)?.status,'in-progress');assert(mergeMissionPlan(saved,current,50).every(m=>!m.done));
});

test('revision 51 promotes creator card, replay and offline contract delivery without changing external integration status',()=>{
 const current:Mission[]=['next-070','next-087','next-088','next-089','next-090','next-093'].map(id=>({id,title:id,detail:'Verified defaults',done:['next-070','next-088','next-089','next-090'].includes(id),status:['next-070','next-088','next-089','next-090'].includes(id)?'complete':'planned'}));
 const custom:Mission={id:'custom-creator',title:'Custom work',detail:'Keep exact notes',done:false,status:'blocked'};
 const saved=[...current.map(m=>({...m,done:false,status:'in-progress' as const})),custom];
 const migrated=mergeMissionPlan(saved,current,50);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,true,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact notes');assert(mergeMissionPlan(saved,current,51).every(m=>!m.done));
});

test('revision 52 promotes studio compatibility, notes and lifecycle without claiming resumable downloads or output retention',()=>{
 const done=['next-081','next-083','next-084'];const current:Mission[]=['next-080','next-081','next-082','next-083','next-084','next-085','next-086'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id),status:done.includes(id)?'complete':'planned'}));const saved=current.map(m=>({...m,done:false,status:'in-progress' as const}));const migrated=mergeMissionPlan(saved,current,51);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,true,true,false,false]);assert(mergeMissionPlan(saved,current,52).every(m=>!m.done));
});

test('revision 53 promotes verified recipes and keyboard coverage together while preserving manual reopens',()=>{
 const done=['next-084','next-085','next-095'];const current:Mission[]=['next-084','next-085','next-086','next-094','next-095','next-096'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id),status:done.includes(id)?'complete':'planned'}));const saved=current.map(m=>({...m,done:false,status:'blocked' as const}));const migrated=mergeMissionPlan(saved,current,52);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,false,true,false]);assert(mergeMissionPlan(saved,current,53).every(m=>!m.done));
});

test('revision 54 promotes worker recovery and artwork lifecycle without changing unrelated reopens',()=>{
 const done=['next-022','next-013','next-016'];const current:Mission[]=['next-022','next-013','next-014','next-015','next-016','next-017'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id),status:done.includes(id)?'complete':'planned'}));const saved=current.map(m=>({...m,done:false,status:'blocked' as const}));const migrated=mergeMissionPlan(saved,current,53);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,false,true,false]);assert(mergeMissionPlan(saved,current,54).every(m=>!m.done));
});

test('revision 55 promotes verified feed repair and endpoint recovery while retaining custom/manual states',()=>{
 const done=['next-021','next-027','next-029'];const current:Mission[]=['next-020','next-021','next-027','next-029','next-030'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id),status:done.includes(id)?'complete':'planned'}));const saved=current.map(m=>({...m,done:false,status:'blocked' as const}));const migrated=mergeMissionPlan(saved,current,54);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,true,false]);assert(mergeMissionPlan(saved,current,55).every(m=>!m.done));
});

 test('revision 56 promotes live allocation and dispatch evidence once without changing unrelated or custom work',()=>{
 const done=['next-018','next-030']; const current:Mission[]=['next-017','next-018','next-029','next-030','next-040'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-029',status:done.includes(id)||id==='next-029'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-live',title:'Custom',detail:'Keep exact work',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,55); assert.deepEqual(migrated.map(m=>m.done),[false,true,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact work');assert(mergeMissionPlan(saved,current,56).every(m=>!m.done));
 });

test('revision 57 promotes verified room connection and role workflows once and preserves unrelated manual work',()=>{
 const done=['next-041','next-046'];const current:Mission[]=['next-030','next-041','next-042','next-043','next-046','next-048'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-030',status:done.includes(id)||id==='next-030'?'complete':'planned'}));const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-room',title:'My room idea',detail:'Keep my exact words',done:false,status:'in-progress'}];const migrated=mergeMissionPlan(saved,current,56);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep my exact words');assert(mergeMissionPlan(saved,current,57).every(m=>!m.done));
});

test('revision 58 promotes catalog privacy and recommendation isolation once, preserving reopens and custom work',()=>{
 const done=['next-043','next-069'];const current:Mission[]=['next-041','next-042','next-043','next-048','next-069','next-070'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-041',status:done.includes(id)||id==='next-041'?'complete':'planned'}));const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-privacy',title:'Private idea',detail:'Keep exact private notes',done:false,status:'in-progress'}];const migrated=mergeMissionPlan(saved,current,57);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact private notes');assert.equal(migrated[1].status,'blocked');assert(mergeMissionPlan(saved,current,58).every(m=>!m.done));
});

test('revision 59 promotes paced transport and reconnect receipts once while preserving manual/custom work',()=>{
 const done=['next-042','next-048'];const current:Mission[]=['next-041','next-042','next-043','next-045','next-048','next-049'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-043',status:done.includes(id)||id==='next-043'?'complete':'planned'}));const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-reconnect',title:'My room follow-up',detail:'Keep exact draft',done:false,status:'in-progress'}];const migrated=mergeMissionPlan(saved,current,58);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact draft');assert.equal(migrated[3].status,'blocked');assert(mergeMissionPlan(saved,current,59).every(m=>!m.done));
});

test('revision 60 promotes verified live guidance and device captions once, preserving unrelated manual and custom states',()=>{
 const done=['next-045','next-049']; const current:Mission[]=['next-042','next-045','next-048','next-049','next-050'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-042',status:done.includes(id)||id==='next-042'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-device',title:'My caption idea',detail:'Keep exact draft',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,59); assert.deepEqual(migrated.map(m=>m.done),[false,true,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep exact draft');assert.equal(migrated[4].status,'blocked');assert(mergeMissionPlan(saved,current,60).every(m=>!m.done));
});

test('revision 61 promotes the room audit protocol and semantic status policy once without changing external verification or manual reopens',()=>{
 const done=['next-050','next-096'];const current:Mission[]=['next-045','next-050','next-071','next-095','next-096','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:done.includes(id)||id==='next-045',status:done.includes(id)||id==='next-045'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-reader',title:'My reader check',detail:'Keep speech output unverified',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,60);assert.deepEqual(migrated.map(m=>m.done),[false,true,false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep speech output unverified');assert(mergeMissionPlan(saved,current,61).every(m=>!m.done));
});


test('revision 62 promotes Companion negotiation and recovery once without resetting manual, custom or external states',()=>{
 const complete=['next-071','next-072'];const current:Mission[]=['next-050','next-071','next-072','next-073','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-050',status:complete.includes(id)||id==='next-050'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-native',title:'My native check',detail:'Preserve my exact notes',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,61);assert.deepEqual(migrated.map(m=>m.done),[false,true,true,false,false,false]);assert.equal(migrated.at(-1)?.detail,'Preserve my exact notes');assert(mergeMissionPlan(saved,current,62).every(m=>!m.done));
});


test('revision 63 completes downloader auth and update checklist once without changing external, prior or custom states',()=>{
 const ids=['next-075','next-079'];const current:Mission[]=['next-071','next-073','next-075','next-079','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:ids.includes(id)||id==='next-071',status:ids.includes(id)||id==='next-071'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-update',title:'My update notes',detail:'Keep private backup review open',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,62);assert.deepEqual(result.map(m=>m.done),[false,false,true,true,false,false]);assert.equal(result.at(-1)?.detail,'Keep private backup review open');assert(mergeMissionPlan(saved,current,63).every(m=>!m.done));
});


test('revision 64 promotes verified chapter support and canary tooling once without asserting healthy external providers',()=>{
 const complete=['next-037','next-040'];const current:Mission[]=['next-034','next-037','next-040','next-079','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-079',status:complete.includes(id)||id==='next-079'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-twitch',title:'My provider check',detail:'Keep live observation unverified',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,63);assert.deepEqual(result.map(m=>m.done),[false,true,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep live observation unverified');assert(mergeMissionPlan(saved,current,64).every(m=>!m.done));
});


test('revision 65 promotes measured ranking work and Save Data once without resetting manual, external or custom states',()=>{
 const complete=['next-015','next-019'];const current:Mission[]=['next-012','next-015','next-019','next-040','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-040',status:complete.includes(id)||id==='next-040'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-budget',title:'My budget review',detail:'Keep physical phone measurements open',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,64);assert.deepEqual(result.map(m=>m.done),[false,true,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep physical phone measurements open');assert(mergeMissionPlan(saved,current,65).every(m=>!m.done));
});


test('revision 66 promotes provider allocation and import review once while preserving manual, custom and external states',()=>{
 const complete=['next-012','next-017'];const current:Mission[]=['next-003','next-012','next-015','next-017','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-015',status:complete.includes(id)||id==='next-015'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-import',title:'My import review',detail:'Keep account access unverified',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,65);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false]);assert.equal(result.at(-1)?.detail,'Keep account access unverified');assert(mergeMissionPlan(saved,current,66).every(m=>!m.done));
});

test('revision 67 promotes upcoming transitions and playlist reconciliation once without changing other manual or external work',()=>{
 const complete=['next-025','next-026'];const current:Mission[]=['next-003','next-017','next-025','next-026','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-017',status:complete.includes(id)||id==='next-017'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-playlists',title:'My playlist idea',detail:'Keep native and real-provider checks open',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,66);assert.deepEqual(result.map(m=>m.done),[false,false,true,true,false,false]);assert.equal(result.at(-1)?.detail,'Keep native and real-provider checks open');assert(mergeMissionPlan(saved,current,67).every(m=>!m.done));
});


test('revision 68 promotes backup inspection and streaming exports together while preserving manual reopens and external checks',()=>{
 const complete=['next-003','next-005'];const current:Mission[]=['next-001','next-003','next-004','next-005','next-026','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-026',status:complete.includes(id)||id==='next-026'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-backup',title:'My backup notes',detail:'Keep atomic restore and physical-device tests open',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,67);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep atomic restore and physical-device tests open');assert(mergeMissionPlan(saved,current,68).every(m=>!m.done));
});


test('revision 69 promotes folder access and diagnostic privacy without completing unrelated integration work',()=>{
 const complete=['next-073','next-091'];const current:Mission[]=['next-003','next-073','next-074','next-091','next-092','next-093'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-003',status:complete.includes(id)||id==='next-003'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-access',title:'My access notes',detail:'Keep native and private profile verification open',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,68);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep native and private profile verification open');assert(mergeMissionPlan(saved,current,69).every(m=>!m.done));
});


test('revision 70 promotes verified disk budgets and launch receipts once while preserving manual and external states',()=>{
 const complete=['next-076','next-077'];const current:Mission[]=['next-073','next-074','next-076','next-077','next-078','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-073',status:complete.includes(id)||id==='next-073'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-desktop',title:'My desktop notes',detail:'Keep native game readiness unverified',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,69);assert.deepEqual(result.map(m=>m.done),[false,false,true,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep native game readiness unverified');assert(mergeMissionPlan(saved,current,70).every(m=>!m.done));
});

test('revision 71 promotes verified print saves and platform contracts while retaining manual and external states',()=>{
 const complete=['next-078','next-080'];const current:Mission[]=['next-076','next-078','next-079','next-080','next-082','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-076',status:complete.includes(id)||id==='next-076'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-platform',title:'My platform notes',detail:'Keep native OS execution unverified',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,70);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false,false]);assert.equal(result.at(-1)?.detail,'Keep native OS execution unverified');assert(mergeMissionPlan(saved,current,71).every(m=>!m.done));
});


test('revision 72 promotes capability permissions and contextual setup once without changing manual or external states',()=>{
 const complete=['next-092','next-097'];const current:Mission[]=['next-080','next-092','next-093','next-097','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-080',status:complete.includes(id)||id==='next-080'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-consent',title:'My setup choice',detail:'Keep native pairing unverified',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,71);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false]);assert.equal(result.at(-1)?.detail,'Keep native pairing unverified');assert(mergeMissionPlan(saved,current,72).every(m=>!m.done));
});


test('revision 73 promotes model recovery and app remote safeguards without asserting native session readiness',()=>{
 const complete=['next-082','next-093'];const current:Mission[]=['next-080','next-082','next-086','next-093','next-098'].map(id=>({id,title:id,detail:'Current defaults',done:complete.includes(id)||id==='next-080',status:complete.includes(id)||id==='next-080'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-native-peer',title:'My native peer check',detail:'No actual RustDesk session verified',done:false,status:'in-progress'}];const result=mergeMissionPlan(saved,current,72);assert.deepEqual(result.map(m=>m.done),[false,true,false,true,false,false]);assert.equal(result.at(-1)?.detail,'No actual RustDesk session verified');assert(mergeMissionPlan(saved,current,73).every(m=>!m.done));
});

test('revision 74 promotes readiness once without converting installation or manual integration states to verification',()=>{
 const current:Mission[]=['companion','next-093','next-098','next-099'].map(id=>({id,title:id,detail:'Current contract',done:id!=='next-099',status:id!=='next-099'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-native-check',title:'Verify my device',detail:'Keep real session and engine tests open',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,73);assert.deepEqual(migrated.map(m=>m.done),[false,false,true,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep real session and engine tests open');assert(mergeMissionPlan(saved,current,74).every(m=>!m.done));
});

test('revision 75 promotes durable mutations and storage recovery once while preserving manual, custom and external checks',()=>{
 const current:Mission[]=['next-001','next-002','next-004','next-006','next-098'].map(id=>({id,title:id,detail:'Current contract',done:['next-001','next-002','next-098'].includes(id),status:['next-001','next-002','next-098'].includes(id)?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-recovery',title:'My recovery choice',detail:'Keep full restore, cross-tab leasing and native checks open',done:false,status:'in-progress'}];
 const migrated=mergeMissionPlan(saved,current,74);assert.deepEqual(migrated.map(m=>m.done),[true,true,false,false,false,false]);assert.equal(migrated.at(-1)?.detail,'Keep full restore, cross-tab leasing and native checks open');assert(mergeMissionPlan(saved,current,75).every(m=>!m.done));
});


test('revision 76 promotes Twitch media aliases and image retention once without completing unresolved foundations',()=>{
 const ids=['next-036','next-086'];const current:Mission[]=['next-006','next-007','next-034','next-036','next-084','next-086','next-087'].map(id=>({id,title:id,detail:'Current contract',done:ids.includes(id)||id==='next-084',status:ids.includes(id)||id==='next-084'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-preserved-76',title:'Keep my work',detail:'Native engine and rename verification remain separate',done:false,status:'in-progress'}];
 const result=mergeMissionPlan(saved,current,75);assert.deepEqual(result.map(m=>m.done),[false,false,false,true,false,true,false,false]);assert(mergeMissionPlan(saved,current,76).every(m=>!m.done));assert.equal(result.at(-1)?.detail,'Native engine and rename verification remain separate');
});


test('revision 77 promotes shared catalog leases and announcement revisions without completing dependent recovery work',()=>{
 const ids=['next-006','next-087'];const current:Mission[]=['next-001','next-004','next-006','next-007','next-010','next-087','next-094'].map(id=>({id,title:id,detail:'Current contract',done:ids.includes(id)||id==='next-001',status:ids.includes(id)||id==='next-001'?'complete':'planned'}));
 const saved:Mission[]=[...current.map(m=>({...m,done:false,status:'blocked' as const})),{id:'custom-77',title:'My recovery plan',detail:'Keep tombstones, whole-library restore and native checks separate',done:false,status:'in-progress'}];const result=mergeMissionPlan(saved,current,76);assert.deepEqual(result.map(m=>m.done),[false,false,true,false,false,true,false,false]);assert(mergeMissionPlan(saved,current,77).every(m=>!m.done));assert.equal(result.at(-1)?.detail,'Keep tombstones, whole-library restore and native checks separate');
});
