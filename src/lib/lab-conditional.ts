import type { LabMove, LabState } from "./stream-signal-lab.ts";
export type LabCondition = {
  healthAtMost?: number;
  energyAtLeast?: number;
  enemyAtLeast?: number;
  guarded?: boolean;
};
export type LabPlan = {
  version: 1;
  steps: Array<{ move: LabMove; when: LabCondition }>;
  maxAgeMs: number;
  timeoutMs: number;
  onFalse: "stop-sequence" | "skip-move";
};
export type LabRule = {
  when: LabCondition;
  maxAgeMs: number;
  timeoutMs: number;
  onFalse: LabPlan["onFalse"];
  queuedAt: number;
};
const object = (r: unknown): r is Record<string, unknown> =>
  !!r && typeof r === "object" && !Array.isArray(r);
const only = (r: Record<string, unknown>, keys: string[]) => {
  if (Object.keys(r).some((k) => !keys.includes(k)))
    throw Error("Unknown conditional-plan fields are not supported.");
};
export function readLabPlan(raw: unknown): LabPlan {
  if (!object(raw)) throw Error("Use a conditional plan object.");
  only(raw, ["version", "steps", "maxAgeMs", "timeoutMs", "onFalse"]);
  const r = raw as unknown as LabPlan;
  if (
    r.version !== 1 ||
    !Array.isArray(r.steps) ||
    !r.steps.length ||
    r.steps.length > 4 ||
    !Number.isInteger(r.maxAgeMs) ||
    r.maxAgeMs < 100 ||
    r.maxAgeMs > 30000 ||
    !Number.isInteger(r.timeoutMs) ||
    r.timeoutMs < 1000 ||
    r.timeoutMs > 120000 ||
    !["stop-sequence", "skip-move"].includes(r.onFalse)
  )
    throw Error(
      "Use 1–4 moves, observation freshness 100–30000 ms, timeout 1000–120000 ms and an explicit interruption policy.",
    );
  const steps = r.steps.map((row) => {
    if (
      !object(row) ||
      !["attack", "defend", "heal"].includes(row.move as string) ||
      !object(row.when)
    )
      throw Error("Each step needs a supported move and state conditions.");
    only(row, ["move", "when"]);
    only(row.when, ["healthAtMost", "energyAtLeast", "enemyAtLeast", "guarded"]);
    const when: LabCondition = {};
    for (const key of ["healthAtMost", "energyAtLeast", "enemyAtLeast"] as const) {
      const n = row.when[key];
      if (n !== undefined) {
        if (!Number.isInteger(n) || Number(n) < 0 || Number(n) > 100)
          throw Error("Resource thresholds must be integers from 0 to 100.");
        when[key] = n as number;
      }
    }
    if (row.when.guarded !== undefined) {
      if (typeof row.when.guarded !== "boolean")
        throw Error("Guarded condition must be true or false.");
      when.guarded = row.when.guarded;
    }
    return { move: row.move as LabMove, when };
  });
  return { version: 1, steps, maxAgeMs: r.maxAgeMs, timeoutMs: r.timeoutMs, onFalse: r.onFalse };
}
export function parseLabPlan(text: string) {
  if (text.length > 4096) throw Error("Conditional plans are limited to 4 KiB.");
  return readLabPlan(JSON.parse(text));
}
export function labRuleFailure(state: LabState, rule: LabRule, now: number) {
  if (!Number.isFinite(now) || now < rule.queuedAt || now - rule.queuedAt >= rule.timeoutMs)
    return { reason: "sequence timed out or clock is invalid", stop: true };
  if (
    state.observedAt === undefined ||
    state.observedAt > now ||
    now - state.observedAt > rule.maxAgeMs
  )
    return {
      reason: "local simulator observation is missing or stale",
      stop: rule.onFalse === "stop-sequence",
    };
  const c = rule.when,
    failed =
      c.healthAtMost !== undefined && state.health > c.healthAtMost
        ? "health precondition is false"
        : c.energyAtLeast !== undefined && state.energy < c.energyAtLeast
          ? "energy precondition is false"
          : c.enemyAtLeast !== undefined && state.enemy < c.enemyAtLeast
            ? "opponent precondition is false"
            : c.guarded !== undefined && state.guarded !== c.guarded
              ? "guard precondition is false"
              : "";
  return failed ? { reason: failed, stop: rule.onFalse === "stop-sequence" } : undefined;
}
export const DEFAULT_LAB_PLAN: LabPlan = {
  version: 1,
  steps: [
    { move: "defend", when: { energyAtLeast: 10 } },
    { move: "attack", when: { guarded: true, energyAtLeast: 20 } },
    { move: "heal", when: { healthAtMost: 80, energyAtLeast: 25 } },
  ],
  maxAgeMs: 10000,
  timeoutMs: 60000,
  onFalse: "stop-sequence",
};
