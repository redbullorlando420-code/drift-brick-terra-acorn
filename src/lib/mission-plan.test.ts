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
