export type VisionProgress = (completed: number, total: number) => void;
export type VisionLabel = { label: string; score: number };

/**
 * Optional, user-initiated image classification. The model executes in the
 * browser (WebGPU when available, otherwise WASM); photo bytes stay local.
 * The model download is cached by the browser for later passes.
 */
export async function classifyImagesLocally(urls: string[], onProgress?: VisionProgress) {
  const { pipeline } = await import("@huggingface/transformers");
  type Result = { label: string; score: number };
  const classifier = await pipeline(
    "image-classification",
    "onnx-community/mobilenetv4_conv_small.e2400_r224_in1k",
    { device: typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm" },
  ) as unknown as (url: string, options: { topk: number }) => Promise<Result[]>;
  // A small bounded pool takes advantage of WebGPU/WASM workers without
  // flooding memory with decoded image tensors.  Five candidates gives the
  // tag review desk more useful coverage than the old three-label pass.
  const results: VisionLabel[][] = Array.from({ length: urls.length }, () => [] as VisionLabel[]);
  let cursor = 0;
  let completed = 0;
  const workers = Array.from({ length: Math.min(3, urls.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= urls.length) return;
      const labels = await classifier(urls[index], { topk: 5 });
      const seen = new Set<string>();
      results[index] = labels
        .map((item) => ({ label: item.label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), score: item.score }))
        .filter((item) => item.score >= 0.045 && item.label.length >= 3 && !seen.has(item.label) && Boolean(seen.add(item.label)))
        .slice(0, 5);
      completed += 1;
      onProgress?.(completed, urls.length);
    }
  });
  await Promise.all(workers);
  return results;
}
