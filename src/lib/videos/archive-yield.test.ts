import test from "node:test";
import assert from "node:assert/strict";
import { archiveYieldWeight, nextArchiveYield, validArchiveYield } from "./archive-yield.ts";
import { explainAdultDiscovery } from "./adult-discovery-plan.ts";
import { ADULT_PULL_PROVIDERS } from "./adult-providers.ts";
test("durable yield is bounded, credits useful refreshes conservatively and recovers gradually", () => {
  let value = nextArchiveYield(undefined, { added: 100, received: 100 }, 100);
  assert.equal(archiveYieldWeight(value), 250);
  for (let i = 0; i < 12; i++) value = nextArchiveYield(value, { added: 100, received: 100 }, 100);
  assert.equal(value.windows, 8);
  assert.equal(archiveYieldWeight(value), 1000);
  value = nextArchiveYield(value, { state: "failed" }, 0);
  assert.equal(archiveYieldWeight(value), 0);
  const weights: number[] = [];
  for (let i = 0; i < 4; i++) {
    value = nextArchiveYield(value, { added: 100, received: 100 }, 100);
    weights.push(archiveYieldWeight(value));
  }
  assert(weights.every((weight, i) => !i || weight > weights[i - 1]!));
  const repeat = nextArchiveYield(undefined, { added: 0, received: 32, duplicates: 400 }, 32);
  assert(repeat.score > 0 && repeat.score < 100);
  for (const bad of [
    { ...value, version: 2 },
    { ...value, score: 1001 },
    { ...value, recovery: -1 },
    { ...value, windows: 9 },
  ])
    assert.equal(validArchiveYield(bad), false);
});
test("productive slots cannot displace oldest exploration or bypass provider cooldowns", () => {
  const lanes: any = {};
  for (const provider of ADULT_PULL_PROVIDERS)
    lanes[provider] = {
      page: 1,
      query: "all",
      order: "top-weekly",
      updatedAt: 100,
      yield: { version: 1, windows: 8, score: 0, recovery: 8 },
    };
  // Keep video-only sorts cooling without blocking provider-wide eligibility.
  const read = (order: string) =>
    order === "top-weekly"
      ? lanes
      : Object.fromEntries(
          ["eporner", "redtube"].map((provider) => [
            provider,
            { page: 1, state: "exhausted", retryAt: 2000, updatedAt: 100 },
          ]),
        );
  lanes.chaturbate.updatedAt = 1;
  lanes.redgifs.yield.score = 900;
  lanes.booru.yield.score = 10;
  const first = explainAdultDiscovery(read, 1000);
  assert.deepEqual(first.plan?.providers, ["chaturbate", "redgifs"]);
  lanes.redgifs.state = "failed";
  lanes.redgifs.retryAt = 2000;
  assert.equal(explainAdultDiscovery(read, 1000).plan?.providers.includes("redgifs"), false);
  // Repeated productive selection still updates recency; all eligible sources
  // eventually own the first guaranteed slot, irrespective of score.
  const seen = new Set();
  for (let turn = 0; turn < 14; turn++) {
    const decision = explainAdultDiscovery(read, 1000 + turn),
      plan = decision.plan!;
    assert.equal(plan.providers[0], decision.tasks[0]?.provider);
    for (const provider of plan.providers) {
      seen.add(provider);
      lanes[provider].updatedAt = 1000 + turn;
    }
  }
  for (const provider of ADULT_PULL_PROVIDERS.filter((p) => p !== "redgifs"))
    assert(seen.has(provider), provider);
});
