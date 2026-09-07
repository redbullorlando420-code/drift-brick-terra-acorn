export type VisionProgress = (completed: number, total: number) => void;

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
  const results: string[][] = [];
  for (let index = 0; index < urls.length; index += 1) {
    const labels = await classifier(urls[index], { topk: 3 });
    results.push([...new Set(labels
      .filter((item) => item.score >= 0.08)
      .map((item) => item.label.toLowerCase().split(",")[0].replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
      .filter((label) => label.length >= 3)
      .slice(0, 3))]);
    onProgress?.(index + 1, urls.length);
  }
  return results;
}
