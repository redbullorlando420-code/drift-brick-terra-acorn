import test from "node:test";
import assert from "node:assert/strict";
import { mergeMissionPlan, MISSION_PLAN_REVISION } from "../src/lib/mission-plan.ts";
import { ALL_NEXT_LEVEL_MISSIONS } from "../src/lib/mission-roadmap.ts";
import { studioParameterContract } from "../companion/studio-parameter-contract.mjs";
import { generationPayload, createCreativeTools } from "../companion/creative-tools.mjs";
import { qwenGraph } from "../companion/qwen-engine.mjs";
import {
  previewRecipeConversion,
  readStudioParameterContract,
} from "../src/lib/studio-recipe-migration.ts";
import {
  parseRecipe,
  recipeDocument,
  restoreRecipes,
  readStoredRecipesStrict,
} from "../src/lib/studio-recipes.ts";
import {
  DEFAULT_PRINT_EDIT,
  loadPrintEdit,
  savePrintEdit,
  printComparisonSnapshot,
  changePrintComparison,
  comparePrintEdits,
} from "../src/lib/print-edit-state.ts";
import { readLabPlan, DEFAULT_LAB_PLAN } from "../src/lib/lab-conditional.ts";
import {
  createLabState,
  startLabWindow,
  receiveConditionalBallot,
  receiveLabBallot,
  closeLabWindow,
  observeLabState,
  stepLabController,
  stopLab,
  previewLabPlan,
} from "../src/lib/stream-signal-lab.ts";
import {
  createLabRun,
  recordLabEvent,
  exportLabTrace,
  parseLabTrace,
  createLabPlayback,
  advanceLabPlayback,
  labChecksum,
} from "../src/lib/stream-signal-replay.ts";
const recipe = {
  id: "original",
  savedAt: 100,
  name: "Original recipe",
  settings: {
    prompt: "Original forest",
    negative: "blur",
    steps: 20,
    seed: 123,
    size: 256,
    model: "forest.safetensors",
  },
  provenance: {
    engine: "a1111",
    width: 256,
    height: 256,
    modelName: "forest.safetensors",
    sampler: "DPM++ 2M",
    scheduler: "Karras",
    guidance: 12,
    denoise: 0.7,
    sha256: "a".repeat(64),
  },
};
test("future or partially damaged recipe shelves remain readable only as raw data and cannot be rewritten by conversion", () => {
  const valid = JSON.stringify([recipe]);
  assert.equal(readStoredRecipesStrict(valid).length, 1);
  const future = {
    ...recipe,
    id: "future",
    parameterSchema: { version: 2, adapterId: "a1111-form-v2", engine: "a1111" },
  };
  assert.throws(
    () => readStoredRecipesStrict(JSON.stringify([recipe, future])),
    /unsupported or damaged/,
  );
  assert.throws(() => readStoredRecipesStrict("not json"), /unreadable/);
  assert.throws(
    () => readStoredRecipesStrict(JSON.stringify(Array(9).fill(recipe))),
    /Unsupported/,
  );
});
test("revision 101 completes only recipe migration, print comparison and conditional lab work once", () => {
  assert.ok(MISSION_PLAN_REVISION >= 101);
  const ids = ["next-171", "next-176", "next-180"],
    saved = ALL_NEXT_LEVEL_MISSIONS.map((m) =>
      [...ids, "next-139"].includes(m.id) ? { ...m, done: false, status: "blocked" } : m,
    );
  const next = mergeMissionPlan(saved, ALL_NEXT_LEVEL_MISSIONS, 100);
  for (const id of ids) assert.equal(next.find((m) => m.id === id).done, true);
  assert.equal(next.find((m) => m.id === "next-139").status, "blocked");
  next.find((m) => m.id === "next-176").done = false;
  next.find((m) => m.id === "next-176").status = "in-progress";
  assert.equal(
    mergeMissionPlan(next, ALL_NEXT_LEVEL_MISSIONS, 101).find((m) => m.id === "next-176").status,
    "in-progress",
  );
});
test("adapter contracts match actual fixed generation parameters and reject unknown schemas", () => {
  const a = studioParameterContract("a1111"),
    q = studioParameterContract("comfy"),
    payload = generationPayload({ prompt: "x", width: 512, height: 512 }),
    graph = qwenGraph(payload, "qwen-turbo.safetensors", 123);
  assert.equal(payload.sampler_name, a.sampler);
  assert.equal(payload.cfg_scale, a.guidance);
  assert.equal(graph["6"].inputs.sampler_name, q.sampler);
  assert.equal(graph["6"].inputs.cfg, q.turboGuidance);
  assert.throws(() => readStudioParameterContract({ ...a, version: 2 }));
  assert.throws(() => readStudioParameterContract({ ...a, sizes: [100000] }));
});
test("the connected status route advertises its actual adapter contract without submitting generation", async () => {
  const urls = [],
    tools = createCreativeTools({
      dir: ".",
      platform: "linux",
      fetchLocal: async (url) => {
        urls.push(url);
        return new Response(JSON.stringify([{ title: "good.safetensors" }]), {
          headers: { "content-type": "application/json" },
        });
      },
    });
  try {
    const response = await tools("/studio/status", "GET", {});
    assert.equal(response.connected, true);
    assert.equal(
      readStudioParameterContract(response.parameterContract).adapterId,
      "a1111-form-v1",
    );
    assert.equal(urls.length, 1);
    assert(urls[0].endsWith("/sdapi/v1/sd-models"));
  } finally {
    await tools.shutdown();
  }
});
test("reviewed conversion retains original prompt/seed/model, describes removed values and survives recipe reload/export", () => {
  const original = JSON.stringify(recipe),
    contract = {
      ...studioParameterContract("a1111"),
      sizes: [512],
      steps: { min: 25, max: 40, default: 25 },
    },
    plan = previewRecipeConversion(recipe, contract, "forest.safetensors", 200);
  assert.equal(JSON.stringify(recipe), original);
  assert.equal(plan.converted.settings.prompt, recipe.settings.prompt);
  assert.equal(plan.converted.settings.negative, "blur");
  assert.equal(plan.converted.settings.seed, 123);
  assert.equal(plan.converted.settings.size, 512);
  assert.equal(plan.converted.settings.steps, 25);
  assert.equal(plan.converted.provenance.sha256, "a".repeat(64));
  assert(plan.changes.some((s) => s.startsWith("Sampler:")));
  assert(plan.changes.some((s) => s.startsWith("Guidance:")));
  assert.equal(recipeDocument(plan.converted).version, 3);
  const restored = restoreRecipes(
    JSON.stringify([recipe, { ...plan.converted, id: "converted", savedAt: 200 }]),
  );
  assert.equal(restored.length, 2);
  assert.equal(restored[0].provenance.sampler, "DPM++ 2M");
  assert.equal(restored[1].conversion.sourceId, "original");
  assert.equal(
    parseRecipe(JSON.stringify(recipeDocument(plan.converted))).parameterSchema.adapterId,
    "a1111-form-v1",
  );
});
test("different-engine/model conversion drops unverified model declarations and unsupported schemas cannot load", () => {
  const plan = previewRecipeConversion(
    recipe,
    studioParameterContract("comfy"),
    "qwen-turbo.safetensors",
  );
  assert.equal(plan.converted.provenance.sha256, undefined);
  assert.equal(plan.converted.provenance.guidance, 1);
  assert.equal(plan.converted.settings.prompt, recipe.settings.prompt);
  assert.throws(
    () =>
      parseRecipe(
        JSON.stringify({
          ...recipeDocument(plan.converted),
          parameterSchema: { version: 2, adapterId: "comfy-form-v1", engine: "comfy" },
        }),
      ),
    /Unsupported/,
  );
});
const data = new Map();
let deny = false;
globalThis.localStorage = {
  getItem: (k) => data.get(k) ?? null,
  setItem: (k, v) => {
    if (deny) throw Error("Quota");
    data.set(k, v);
  },
  removeItem: (k) => data.delete(k),
};
test("workspace comparison has numeric/model/view differences, durable revert and reload-safe undo", () => {
  data.clear();
  const initial = { ...DEFAULT_PRINT_EDIT },
    working = { ...initial, scale: 2, rotX: 90, showGrid: false };
  assert(savePrintEdit("model", initial));
  const original = printComparisonSnapshot("model");
  assert(savePrintEdit("model", working));
  const snapshot = printComparisonSnapshot("model");
  const diffs = comparePrintEdits(working, initial);
  assert.equal(diffs.find((d) => d.field === "scale").kind, "model");
  assert.equal(diffs.find((d) => d.field === "showGrid").kind, "view");
  const reverted = changePrintComparison("model", snapshot.token, "revert", original.baseline);
  assert.deepEqual(loadPrintEdit("model"), initial);
  assert.deepEqual(reverted.undo.working, working);
  const restored = changePrintComparison("model", printComparisonSnapshot("model").token, "undo");
  assert.deepEqual(restored.working, working);
  assert.equal(restored.undo, undefined);
});
test("capture/revert conflicts, quota and future comparison formats preserve prior workspace bytes", () => {
  data.clear();
  savePrintEdit("model", DEFAULT_PRINT_EDIT);
  const first = printComparisonSnapshot("model");
  savePrintEdit("model", { ...DEFAULT_PRINT_EDIT, scale: 2 });
  assert.throws(() => changePrintComparison("model", first.token, "capture"), /changed/);
  const token = printComparisonSnapshot("model").token,
    before = data.get("reelcase.print-edit.v1");
  deny = true;
  assert.throws(() => changePrintComparison("model", token, "capture"), /Quota/);
  assert.equal(data.get("reelcase.print-edit.v1"), before);
  assert.equal(savePrintEdit("model", { ...DEFAULT_PRINT_EDIT, scale: 3 }), false);
  deny = false;
  const raw = JSON.parse(before);
  raw.model.comparison = { version: 2, baseline: DEFAULT_PRINT_EDIT };
  data.set("reelcase.print-edit.v1", JSON.stringify(raw));
  assert.throws(() => printComparisonSnapshot("model"), /Unsupported/);
  assert(savePrintEdit("model", { ...DEFAULT_PRINT_EDIT, scale: 4 }));
  assert.equal(JSON.parse(data.get("reelcase.print-edit.v1")).model.comparison.version, 2);
});
test("a stale viewer cannot autosave over another tab or consume its new baseline", () => {
  data.clear();
  savePrintEdit("model", DEFAULT_PRINT_EDIT);
  const token = printComparisonSnapshot("model").token;
  savePrintEdit("model", { ...DEFAULT_PRINT_EDIT, scale: 3 });
  const latest = data.get("reelcase.print-edit.v1");
  assert.equal(savePrintEdit("model", { ...DEFAULT_PRINT_EDIT, scale: 2 }, token), false);
  assert.equal(data.get("reelcase.print-edit.v1"), latest);
  assert.throws(() => changePrintComparison("model", token, "revert"), /changed/);
});
const plan = (steps, onFalse = "stop-sequence") =>
  readLabPlan({ version: 1, steps, maxAgeMs: 1000, timeoutMs: 3000, onFalse });
const voted = (p) => {
  let s = startLabWindow(createLabState(), 15, 0);
  s = observeLabState(s, 1);
  s = receiveConditionalBallot(s, "viewer", "message", p, 2);
  return closeLabWindow(s, 3);
};
test("conditional votes use latest whole plan per viewer, reject duplicates and tie deterministically", () => {
  let s = startLabWindow(createLabState(), 15, 0);
  s = receiveConditionalBallot(s, "Viewer", "a", DEFAULT_LAB_PLAN, 1);
  const duplicate = receiveConditionalBallot(
    s,
    "Viewer",
    "a",
    plan([{ move: "attack", when: {} }]),
    2,
  );
  assert.equal(duplicate.plans.viewer.steps.length, 3);
  s = receiveLabBallot(s, "Viewer", "b", "attack", 3);
  assert.equal(s.plans.viewer, undefined);
  assert.deepEqual(s.ballots.viewer, ["attack"]);
  const a = plan([{ move: "defend", when: { guarded: false } }]),
    b = plan([{ move: "heal", when: { healthAtMost: 80 } }]);
  const choose = (order) => {
    let q = startLabWindow(createLabState(), 15, 0);
    for (const [i, p] of order.entries())
      q = receiveConditionalBallot(q, "v" + i, "id" + i, p, 1 + i);
    return closeLabWindow(q, 4).queue.map((r) => [r.move, r.rule.when]);
  };
  assert.deepEqual(choose([a, b]), choose([b, a]));
});
test("freshness, timeout and changing preconditions skip/stop according to explicit policy; resource checks remain bounded", () => {
  const p = plan([
    { move: "defend", when: {} },
    { move: "attack", when: { guarded: false } },
    { move: "heal", when: {} },
  ]);
  let s = voted(p);
  s = stepLabController(s, 4);
  assert(s.guarded);
  s = stepLabController(s, 5);
  assert.equal(s.queue.length, 0);
  assert(s.log.at(-1).includes("guard precondition"));
  const skipping = voted(plan(p.steps, "skip-move"));
  let k = stepLabController(skipping, 4);
  k = stepLabController(k, 5);
  assert.equal(k.queue[0].move, "heal");
  assert(k.log.at(-1).includes("skipped"));
  assert.equal(stepLabController(voted(p), 1002).queue.length, 0);
  assert(stepLabController(voted(p), 4000).log.at(-1).includes("timed out"));
  assert.equal(stopLab(voted(p)).queue.length, 0);
  assert.deepEqual(stopLab(voted(p)).plans, {});
});
test("conditional previews never mutate simulation and unsupported/unbounded plans cannot enter a ballot", () => {
  const s = observeLabState(createLabState(), 1),
    before = JSON.stringify(s),
    rows = previewLabPlan(s, DEFAULT_LAB_PLAN, 2);
  assert(rows.length);
  assert.equal(JSON.stringify(s), before);
  for (const raw of [
    { ...DEFAULT_LAB_PLAN, steps: Array(5).fill({ move: "attack", when: {} }) },
    { ...DEFAULT_LAB_PLAN, maxAgeMs: -1 },
    { ...DEFAULT_LAB_PLAN, steps: [{ move: "steer", when: {} }] },
    { ...DEFAULT_LAB_PLAN, steps: [{ move: "attack", when: { energyAtLeast: 200 } }] },
  ])
    assert.throws(() => readLabPlan(raw));
});
test("battle-v2 replay preserves conditional rules/checkpoints while battle-v1 remains reproducible", () => {
  let run = createLabRun();
  for (const event of [
    { type: "start", at: 0, seconds: 15 },
    { type: "observe", at: 1 },
    { type: "plan-ballot", at: 2, viewer: "v", id: "a", plan: DEFAULT_LAB_PLAN },
    { type: "close", at: 3 },
    { type: "step", at: 4 },
    { type: "step", at: 5 },
    { type: "stop", at: 6 },
  ])
    run = recordLabEvent(run, event);
  assert.equal(run.trace.version, 2);
  let replay = createLabPlayback(parseLabTrace(exportLabTrace(run.trace)));
  replay = advanceLabPlayback(replay, run.trace.events.length);
  assert.equal(replay.status, "complete");
  assert.equal(labChecksum(replay.state), labChecksum(run.state));
  let old = createLabRun();
  old = recordLabEvent(old, { type: "start", at: 0, seconds: 15 });
  old = recordLabEvent(old, { type: "ballot", at: 1, viewer: "v", id: "id", text: "attack" });
  old = recordLabEvent(old, { type: "close", at: 2 });
  old = recordLabEvent(old, { type: "step", at: 3 });
  assert.equal(old.trace.version, 1);
  assert.equal(advanceLabPlayback(createLabPlayback(old.trace), 4).status, "complete");
});
