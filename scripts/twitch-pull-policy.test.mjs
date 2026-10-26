import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const p = await import("../src/lib/videos/twitch-pull-policy.ts");
const { selectTwitchRefreshBatch, selectTwitchPolicyBatch } =
  await import("../src/lib/videos/twitch-refresh-selection.ts");
const { normalizeFollowCheckpoints } = await import("../src/lib/videos/follow-checkpoints.ts");
const { mergeResolvedFollow } = await import("../src/lib/videos/follow-identity.ts");
const { mergeTwitchClipObservation, retainNewerTwitchClipFollow } =
  await import("../src/lib/videos/twitch-clip-freshness.ts");
const policy = (clips = true, vods = true, priority = "normal") => ({
  version: 1,
  clips,
  vods,
  priority,
});
const channel = (id = "policy", value) => ({
  id: "tw:" + id,
  kind: "twitch",
  handle: id,
  title: id,
  channelId: "owner-" + id,
  ...(value ? { twitchPullPolicy: value } : {}),
});
test("legacy follows keep all content and normal priority without a migration write; policy input is compact and bounded", () => {
  const old = channel();
  assert.equal(p.twitchPullPolicy(old), p.DEFAULT_TWITCH_PULL_POLICY);
  assert(!Object.hasOwn(old, "twitchPullPolicy"));
  for (const bad of [
    null,
    {},
    policy("false"),
    { ...policy(), version: 2 },
    policy(true, true, "extreme"),
  ])
    assert.equal(p.normalizeTwitchPullPolicy(bad), undefined);
  assert.deepEqual(
    p.normalizeTwitchPullPolicy({ ...policy(false, true, "low"), extra: Array(1000).fill("junk") }),
    policy(false, true, "low"),
  );
  assert.deepEqual(
    normalizeFollowCheckpoints({
      ...channel("a", policy(false, true, "high")),
      recentPull: { attemptedAt: 1, failures: 0 },
    }).twitchPullPolicy,
    policy(false, true, "high"),
  );
  assert.equal(
    normalizeFollowCheckpoints({ kind: "youtube", twitchPullPolicy: policy() }).twitchPullPolicy,
    undefined,
  );
});
test("automatic exclusions are lane-specific and reported separately; live is always allowed", () => {
  const clipOff = channel("clipOff", policy(false, true)),
    vodOff = channel("vodOff", policy(true, false)),
    allOff = channel("off", policy(false, false));
  assert(p.twitchPolicyAllows(clipOff, "recent"));
  assert(p.twitchPolicyAllows(clipOff, "archive"));
  assert(!p.twitchPolicyAllows(vodOff, "archive"));
  assert(!p.twitchPolicyAllows(allOff, "recent"));
  for (const c of [clipOff, vodOff, allOff]) assert(p.twitchPolicyAllows(c, "live"));
  assert.deepEqual(
    p.twitchPullPolicySummary([channel(), clipOff, vodOff, allOff, { kind: "youtube" }]),
    { creators: 4, clipsSkipped: 2, vodsSkipped: 2, contentSkipped: 1 },
  );
});
test("weighted priority reserves low turns and rotates oldest-first across 600 follows under existing batch bounds", () => {
  let rows = Array.from({ length: 600 }, (_, i) => ({
      ...channel(String(i), policy(true, true, i < 200 ? "high" : i < 400 ? "normal" : "low")),
      lastCheckedAt: 1,
      recentPull: { attemptedAt: 1, checkedAt: 1, failures: 0 },
    })),
    cursor = 0,
    seen = new Set(),
    counts = { high: 0, normal: 0, low: 0 };
  for (let i = 0; i < 7; i++) {
    const b = selectTwitchPolicyBatch(rows, 1, cursor, "recent", 10000);
    cursor = b.nextCursor;
    assert.equal(b.channels.length, 1);
    const c = b.channels[0];
    counts[c.twitchPullPolicy.priority]++;
  }
  assert.deepEqual(counts, { high: 4, normal: 2, low: 1 });
  cursor = 0;
  for (let i = 0; i < 650; i++) {
    const b = selectTwitchPolicyBatch(rows, 12, cursor, "recent", 100000 + i);
    cursor = b.nextCursor;
    assert(b.channels.length <= 12);
    assert.equal(new Set(b.channels.map((c) => c.id)).size, b.channels.length);
    for (const c of b.channels) seen.add(c.id);
    const ids = new Set(b.channels.map((c) => c.id));
    rows = rows.map((c) =>
      ids.has(c.id)
        ? { ...c, recentPull: { attemptedAt: 10000 + i, checkedAt: 10000 + i, failures: 0 } }
        : c,
    );
    if (seen.size === 600) break;
  }
  assert.equal(seen.size, 600);
  const legacy = rows.map(({ twitchPullPolicy, ...c }) => c);
  assert.deepEqual(
    selectTwitchPolicyBatch(legacy, 12, 0).channels,
    selectTwitchRefreshBatch(legacy, 12, 0, "recent").channels,
  );
});
test("retry waits and disabled content consume no priority slots; archive skips only VOD-disabled creators", () => {
  const rows = [
    channel("disabled", policy(false, false, "high")),
    {
      ...channel("held", policy(true, true, "high")),
      recentPull: { attemptedAt: 1, failures: 1, retryAt: 2000 },
    },
    channel("low", policy(true, false, "low")),
    channel("normal"),
  ];
  assert.deepEqual(
    selectTwitchPolicyBatch(rows, 10, 0, "recent", 1000)
      .channels.map((c) => c.id)
      .sort(),
    ["tw:low", "tw:normal"],
  );
  assert.deepEqual(
    selectTwitchPolicyBatch(rows, 10, 0, "archive", 1000).channels.map((c) => c.id),
    ["tw:held", "tw:normal"],
  );
});
test("late live/archive/clip and resolved import copies cannot overwrite current user policy", () => {
  const current = channel("owner", policy(false, true, "low")),
    old = { ...current, twitchPullPolicy: policy() };
  assert.equal(p.retainTwitchPullPolicy(current, old).twitchPullPolicy, current.twitchPullPolicy);
  assert.equal(
    retainNewerTwitchClipFollow(current, old).twitchPullPolicy,
    current.twitchPullPolicy,
  );
  assert.equal(
    mergeTwitchClipObservation(current, { ...old, twitchClipRecentCheckedAt: 1000 }, "recent", 1000)
      .twitchPullPolicy,
    current.twitchPullPolicy,
  );
  assert.equal(mergeResolvedFollow([current], old)[0].twitchPullPolicy, current.twitchPullPolicy);
  assert.equal(
    mergeResolvedFollow([current], { ...old, id: "tw:renamed", handle: "renamed" })[0]
      .twitchPullPolicy,
    current.twitchPullPolicy,
  );
});
test("actual refresh adapter skips disabled shelves and all-content exclusions without suppressing live or explicit manual pulls", async () => {
  const { runRefreshRemotes } = await import("../src/lib/remote/api.ts");
  const original = globalThis.fetch;
  let reads = [];
  globalThis.fetch = async (_url, init) => {
    const input = JSON.parse(init.body);
    reads.push(input);
    const clip = /clips\(/.test(input.query),
      vod = /videos\(/.test(input.query);
    return Response.json({
      data: {
        user: {
          id: "owner-" + input.variables.login,
          displayName: input.variables.login,
          stream: { title: "Still live", viewersCount: 42 },
          ...(vod
            ? {
                videos: {
                  edges: Array.from({ length: input.variables.first }, (_, i) => ({
                    node: {
                      id: input.variables.login + "-" + i,
                      title: "Broadcast",
                      lengthSeconds: 10,
                    },
                  })),
                  pageInfo: { hasNextPage: false },
                },
              }
            : {}),
          ...(clip
            ? {
                clips: {
                  edges: [
                    {
                      node: {
                        slug: input.variables.login + "-clip",
                        title: "Clip",
                        durationSeconds: 20,
                      },
                    },
                  ],
                  pageInfo: { hasNextPage: false },
                },
              }
            : {}),
        },
      },
    });
  };
  try {
    const noClips = channel("policy_noclips", policy(false, true));
    let out = await runRefreshRemotes({
      channels: [noClips],
      twitchRoutine: true,
      twitchApplyPolicy: true,
    });
    assert(out.videos.some((v) => v.extension === "vod"));
    assert(out.videos.some((v) => v.remote.live));
    assert(!reads.some((r) => /clips\(/.test(r.query)));
    assert(out.liveCheckedIds.includes(noClips.id));
    reads = [];
    const noVods = channel("policy_novods", policy(true, false));
    out = await runRefreshRemotes({
      channels: [noVods],
      twitchRoutine: true,
      twitchApplyPolicy: true,
    });
    assert(!reads.some((r) => /videos\(/.test(r.query)));
    assert(out.videos.some((v) => v.extension === "clip"));
    assert(out.liveCheckedIds.includes(noVods.id));
    assert.equal(out.channels[0].twitchArchiveDiagnostics, undefined);
    reads = [];
    const off = channel("policy_off", policy(false, false));
    out = await runRefreshRemotes({ channels: [off], twitchApplyPolicy: true });
    assert.equal(reads.length, 0);
    assert.deepEqual(out.refreshedIds, []);
    assert.equal(out.channels[0], off);
    out = await runRefreshRemotes({
      channels: [off],
      twitchLiveOnly: true,
      twitchApplyPolicy: true,
    });
    assert(out.liveCheckedIds.includes(off.id));
    assert.equal(out.channels[0].live, true);
    assert.equal(reads.length, 1);
    reads = [];
    out = await runRefreshRemotes({
      channels: [off],
      twitchRoutine: true,
      twitchApplyPolicy: false,
    });
    assert(reads.some((r) => /clips\(/.test(r.query)));
    assert(reads.some((r) => /videos\(/.test(r.query)));
    assert(out.refreshedIds.includes(off.id));
    assert(reads.every((r) => !r.variables.first || r.variables.first <= 100));
  } finally {
    globalThis.fetch = original;
  }
});

test('library-pack import retains valid policy, clamps its contract, and leaves legacy defaults implicit',async()=>{
 const {applyLibraryPackFiles}=await import('../src/lib/videos/library-pack.ts');let rows=[];
 const hooks={getFollows:()=>rows,setFollows:r=>{rows=r;},getHistory:()=>[],setHistory:()=>{},getViewCounts:()=>({}),getCameCounts:()=>({}),setMarks:()=>{},getFavorites:()=>[],getLikes:()=>[],setShelves:()=>{},getProgress:()=>({}),getResumeProgress:()=>({}),setResume:()=>{},getLinks:()=>[],setLinks:()=>{}};
 applyLibraryPackFiles({'follows/twitch.json':JSON.stringify({channels:[channel('backup',{...policy(false,true,'low'),untrusted:'discard'}),channel('legacy'),channel('bad',{...policy(),version:99})]})},hooks);
 assert.equal(rows.length,3);assert.deepEqual(rows.find(c=>c.handle==='backup').twitchPullPolicy,policy(false,true,'low'));assert.equal(rows.find(c=>c.handle==='legacy').twitchPullPolicy,undefined);assert.equal(rows.find(c=>c.handle==='bad').twitchPullPolicy,undefined);
});

test('a policy-limited profile failure preserves old evidence, waits for its retry, and recovers without requesting a disabled VOD shelf',async()=>{
 const {runRefreshRemotes}=await import('../src/lib/remote/api.ts'),fetchBefore=globalThis.fetch,clock=Date.now;let now=clock(),reads=[],fail=true;Date.now=()=>now;
 const c={...channel('policy_recovery',policy(true,false)),live:true,liveCheckedAt:now-1000,twitchArchiveCheckedAt:now-5000,twitchArchiveCursor:'saved-archive'};
 globalThis.fetch=async(_u,init)=>{const q=JSON.parse(init.body);reads.push(q);if(fail)throw Error('Synthetic network offline');return Response.json({data:{user:{id:c.channelId,displayName:c.title,stream:null,...(/clips\(/.test(q.query)?{clips:{edges:[],pageInfo:{hasNextPage:false}}}:{})}}});};
 try{
  const failed=await runRefreshRemotes({channels:[c],twitchApplyPolicy:true,twitchRoutine:true});const held=failed.channels[0];assert(held.recentPull.failure);assert(held.recentPull.retryAt>now);assert.equal(held.live,true);assert.equal(held.liveCheckedAt,c.liveCheckedAt);assert.equal(held.twitchArchiveCursor,c.twitchArchiveCursor);assert.deepEqual(failed.refreshedIds,[]);
  const n=reads.length;await runRefreshRemotes({channels:[held],twitchApplyPolicy:true,twitchRoutine:true});assert.equal(reads.length,n);
  now+=60*60_000;fail=false;const recovered=await runRefreshRemotes({channels:[held],twitchApplyPolicy:true,twitchRoutine:true});assert(recovered.refreshedIds.includes(c.id));assert.equal(recovered.channels[0].recentPull.failures,0);assert.equal(recovered.channels[0].recentPull.failure,undefined);assert.equal(recovered.channels[0].twitchArchiveCursor,c.twitchArchiveCursor);assert(reads.every(q=>!/videos\(/.test(q.query)));assert.equal(recovered.channels[0].live,false);
 }finally{globalThis.fetch=fetchBefore;Date.now=clock;}
});
