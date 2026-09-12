export type VisionProgress = (completed: number, total: number) => void;
export type VisionLabel = { label: string; score: number };
export type VisionModelId = "semantic" | "semanticPlus" | "semanticPro";
export type VisionModelResult = { model: VisionModelId; labels: VisionLabel[][]; elapsedMs: number };
export type VisionBenchmark = {
  sampleSize: number;
  semantic: VisionModelResult;
  semanticPlus: VisionModelResult;
  semanticPro: VisionModelResult;
};
export type VisionModelStatus = { status?: string; file?: string; loaded?: number; total?: number };

export const VISION_MODELS = {
  semantic: {
    name: "CLIP open-vocabulary", purpose: "Accurate review tags", model: "Xenova/clip-vit-base-patch32",
    // Pinning a verified Transformers.js revision makes benchmarks repeatable.
    revision: "d15189d7028b43f1d3e65039190477f6af591c2a",
  },
  semanticPlus: {
    name: "SigLIP semantic+", purpose: "Stronger semantic photo review", model: "Xenova/siglip-base-patch16-224",
    // Hugging Face's verified ONNX/Transformers.js revision. The first run is
    // optional and downloads to browser cache; every later run reuses it.
    revision: "4649052",
  },
  semanticPro: {
    name: "SigLIP large+",
    purpose: "Highest-detail browser semantic review",
    model: "Xenova/siglip-large-patch16-256",
  },
} as const;
// CLIP scores candidates against each other. This is intentionally a concrete,
// photo-library vocabulary, rather than the unrelated ImageNet labels returned
// by a closed ImageNet classifier. Keep phrases short and review the output.
const SEMANTIC_TOPICS = [
  "a person", "a portrait", "a selfie", "a group of people", "a baby", "a child", "a pet", "a dog", "a cat", "a bird", "a horse", "wildlife",
  "food", "a meal", "dessert", "a drink", "a restaurant", "a kitchen", "a recipe", "travel", "a vacation", "a hotel", "an airport", "a beach", "an ocean", "a lake", "a mountain", "a forest", "a sunset", "a sunrise", "a landscape", "nature", "a garden", "a flower", "a tree",
  "a vehicle", "a car", "a truck", "a motorcycle", "a bicycle", "a boat", "an airplane", "a train", "a building", "a house", "an apartment", "a city", "a street", "architecture", "a landmark", "a bridge", "a pool",
  "a party", "a wedding", "a birthday", "a concert", "a festival", "a sport", "a game", "fitness", "a team", "a trophy", "a stage", "a crowd",
  "a document", "a receipt", "an invoice", "a form", "a book", "a screen", "a screenshot", "a computer", "a phone", "a television", "a video game", "a chart", "a map", "a product", "clothing", "shoes", "jewelry", "furniture", "a toy", "art", "a drawing", "a painting", "a meme",
  "an indoor scene", "an outdoor scene", "night", "low light", "snow", "rain", "autumn", "spring", "summer", "winter", "black and white photo", "close-up photo",
] as const;
type ImageClassifier = (url: string, options: { topk: number } | readonly string[]) => Promise<Array<{ label: string; score: number }>>;
const classifiers = new Map<VisionModelId, Promise<ImageClassifier>>();

function cleanLabel(label: string) { return label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function device() { return typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm"; }
async function classifierFor(model: VisionModelId, onStatus?: (status: VisionModelStatus) => void) {
  let classifier = classifiers.get(model);
  if (!classifier) {
    classifier = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const definition = VISION_MODELS[model];
      const task = "zero-shot-image-classification";
      const options = { progress_callback: onStatus, ...("revision" in definition ? { revision: definition.revision } : {}) };
      try {
        return await pipeline(task, definition.model, { device: device(), ...options }) as unknown as ImageClassifier;
      } catch (error) {
        // WebGPU can reject larger semantic models despite being present. A
        // local WASM retry is slower but keeps the benchmark truthful and usable.
        if (device() !== "webgpu") throw error;
        onStatus?.({ status: "WebGPU unavailable; retrying locally with WASM" });
        return pipeline(task, definition.model, { device: "wasm", ...options }) as unknown as ImageClassifier;
      }
    })();
    classifiers.set(model, classifier);
  }
  try { return await classifier; } catch (error) { classifiers.delete(model); throw error; }
}

/**
 * Optional, user-initiated image classification. The model executes in the
 * browser (WebGPU when available, otherwise WASM); photo bytes stay local.
 * The model download is cached by the browser for later passes.
 */
export async function classifyImagesLocally(urls: string[], onProgress?: VisionProgress, model: VisionModelId = "semanticPlus", onModelStatus?: (status: VisionModelStatus) => void): Promise<VisionLabel[][]> {
  const classifier = await classifierFor(model, onModelStatus);
  // WebGPU can keep two inferences in flight; WASM stays serial because a
  // second large tensor normally makes it slower and less responsive.
  const results: VisionLabel[][] = Array.from({ length: urls.length }, () => [] as VisionLabel[]);
  let cursor = 0;
  let completed = 0;
  const workerCount = device() === "webgpu" ? 2 : 1;
  const workers = Array.from({ length: Math.min(workerCount, urls.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= urls.length) return;
      const labels = await classifier(urls[index], SEMANTIC_TOPICS);
      const seen = new Set<string>();
      results[index] = labels
        .map((item) => ({ label: cleanLabel(item.label), score: item.score }))
        .filter((item) => item.score >= 0.018 && item.label.length >= 3 && !seen.has(item.label) && Boolean(seen.add(item.label)))
        .slice(0, 5);
      completed += 1;
      onProgress?.(completed, urls.length);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Measures preparation and inference on the same local sample; it never changes defaults. */
export async function benchmarkVisionModelsLocally(urls: string[], onProgress?: (model: VisionModelId, done: number, total: number) => void, onModelStatus?: (model: VisionModelId, status: VisionModelStatus) => void): Promise<VisionBenchmark> {
  const run = async (model: VisionModelId): Promise<VisionModelResult> => {
    const started = performance.now();
    onModelStatus?.(model, { status: `Preparing ${VISION_MODELS[model].name}` });
    const labels = await classifyImagesLocally(urls, (done, total) => onProgress?.(model, done, total), model, (status) => onModelStatus?.(model, status));
    return { model, labels, elapsedMs: performance.now() - started };
  };
  return {
    sampleSize: urls.length,
    semantic: await run("semantic"),
    semanticPlus: await run("semanticPlus"),
    semanticPro: await run("semanticPro"),
  };
}
