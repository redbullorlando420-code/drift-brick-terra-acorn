import test from "node:test";
import assert from "node:assert/strict";
import { planAdultDiscovery } from "./adult-discovery-plan.ts";
import {
  ADULT_ARCHIVE_ORDERS,
  loadAdultArchiveCursors,
  saveAdultArchiveCursors,
} from "./adult-archive-cursors.ts";
import { ADULT_PULL_PROVIDERS } from "./adult-providers.ts";
test("independent sort lanes rotate without starving other providers or retrying a failed source", () => {
  const lanes: Record<string, any> = {};
  const read = (order: string) => lanes[order] ?? {};
  assert.deepEqual(planAdultDiscovery(read, 1000), {
    order: "latest",
    providers: ["eporner", "redtube"],
  });
  lanes.latest = { eporner: { page: 20, updatedAt: 900 }, redtube: { page: 10, updatedAt: 900 } };
  assert.deepEqual(planAdultDiscovery(read, 1000), {
    order: "top-weekly",
    providers: ["chaturbate", "myfreecams"],
  });
  for (const provider of ADULT_PULL_PROVIDERS.slice(2))
    lanes["top-weekly"] = { ...lanes["top-weekly"], [provider]: { page: 1, updatedAt: 950 } };
  assert.deepEqual(planAdultDiscovery(read, 1000), {
    order: "most-popular",
    providers: ["eporner", "redtube"],
  });
  lanes["top-weekly"].eporner = { page: 1, updatedAt: 990, state: "failed", retryAt: 2000 };
  assert.equal(planAdultDiscovery(read, 1000)?.providers.includes("eporner"), false);
  delete lanes["top-weekly"].eporner.state;
  assert.equal(
    planAdultDiscovery(read, 1000)?.providers.includes("eporner"),
    false,
    "Legacy cooldowns cannot be bypassed through another sort",
  );
  lanes["top-weekly"].eporner = { page: 1, updatedAt: 990, state: "exhausted", retryAt: 2000 };
  assert.equal(
    planAdultDiscovery(read, 1000)?.providers[0],
    "redtube",
    "Provider fairness still visits RedTube first",
  );
  lanes["most-popular"] = { redtube: { page: 2, updatedAt: 999 } };
  for (const provider of ADULT_PULL_PROVIDERS.slice(2))
    lanes["top-weekly"][provider].updatedAt = 999;
  assert(
    planAdultDiscovery(read, 1000)?.providers.includes("eporner"),
    "An exhausted listing does not block other sort lanes",
  );
});
test("all lanes cooling down create no eligible job and limits bound provider fanout", () => {
  const read = () =>
    Object.fromEntries(
      ADULT_PULL_PROVIDERS.map((p) => [
        p,
        {
          page: 1,
          query: "all",
          order: "latest",
          updatedAt: 1,
          retryAt: 2000,
          state: "exhausted" as const,
        },
      ]),
    );
  assert.equal(planAdultDiscovery(read, 1000), undefined);
  assert.equal(planAdultDiscovery(() => ({}), 1000, 1)?.providers.length, 1);
  assert.equal(ADULT_ARCHIVE_ORDERS.length, 5);
});
test("legacy rotating cursors restart once while stable cursors and query-specific depths remain intact", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
    },
  });
  values.set(
    "reelcase.adult-archive-cursors.v1",
    JSON.stringify({
      "eporner::all::latest": { page: 25, offset: 400, updatedAt: 1 },
      "eporner::science::latest": { page: 6, offset: 200, updatedAt: 1 },
    }),
  );
  assert.equal(loadAdultArchiveCursors("all", "latest").eporner?.page, 1);
  assert.equal(loadAdultArchiveCursors("all", "latest").eporner?.rewound, true);
  assert.equal(loadAdultArchiveCursors("science", "latest").eporner?.page, 6);
  saveAdultArchiveCursors(
    "all",
    "latest",
    { eporner: 26 },
    { eporner: 200 },
    { eporner: { added: 30, duplicates: 40 } },
  );
  const cursor = loadAdultArchiveCursors("all", "latest").eporner;
  assert.equal(cursor?.page, 26);
  assert.equal(cursor?.offset, 200);
  assert.equal(cursor?.rewound, undefined);
  assert.equal(cursor?.added, 30);
});
