import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Exercise pipeline lifetime without downloading models or allocating tensors.
const virtual = new URL("./vision-test-pipeline.mjs", import.meta.url).href;
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "@huggingface/transformers" || specifier === virtual) return { url: virtual, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url !== virtual) return next(url, context);
    return { format: "module", shortCircuit: true, source: `
      export const probe = { created: 0, disposed: 0, waiting: [] };
      export async function pipeline() {
        probe.created++;
        const classify = () => new Promise((resolve, reject) => probe.waiting.push({ resolve, reject }));
        classify.dispose = async () => { probe.disposed++; };
        return classify;
      }
    ` };
  },
});
const { classifyImagesLocally } = await import("./local-vision.ts");
const { probe } = await import(virtual) as { probe: { created: number; disposed: number; waiting: Array<{ resolve: (labels: Array<{ label: string; score: number }>) => void; reject: (error: Error) => void }> } };

test("empty jobs allocate no model and concurrent jobs release it only after both finish", async () => {
  assert.deepEqual(await classifyImagesLocally([]), []);
  assert.equal(probe.created, 0);
  const first = classifyImagesLocally(["first"]);
  const second = classifyImagesLocally(["second"]);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(probe.created, 1);
  assert.equal(probe.waiting.length, 2);
  probe.waiting.shift()!.resolve([{ label: "a cat", score: 0.9 }]);
  await first;
  assert.equal(probe.disposed, 0);
  probe.waiting.shift()!.resolve([{ label: "a dog", score: 0.9 }]);
  await second;
  assert.equal(probe.disposed, 1);
});

test("failed inference releases its model and a later job loads a usable replacement", async () => {
  const failed = classifyImagesLocally(["broken"]);
  const rejection = assert.rejects(failed, /Decode failed/);
  await new Promise(resolve => setImmediate(resolve));
  probe.waiting.shift()!.reject(new Error("Decode failed"));
  await rejection;
  assert.equal(probe.disposed, 2);
  const recovered = classifyImagesLocally(["recovered"]);
  await new Promise(resolve => setImmediate(resolve));
  probe.waiting.shift()!.resolve([]);
  await recovered;
  assert.equal(probe.created, 3);
  assert.equal(probe.disposed, 3);
});
