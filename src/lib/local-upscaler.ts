export const LOCAL_UPSCALER = {
  name: "Swin2SR x2 beta",
  model: "Xenova/swin2SR-classical-sr-x2-64",
  revision: "93dfc9089abda257351d3a58d5771e2c1ff69442",
  // Hugging Face's published digest for onnx/model_q4f16.onnx at this revision.
  sha256: "49ffa7b96532edb9553c74be11b623dafa26db1645611096a208449451a960df",
  artifactUrl: "https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/resolve/93dfc9089abda257351d3a58d5771e2c1ff69442/onnx/model_q4f16.onnx",
  shippedArtifactUrl: "/models/swin2sr-x2-q4f16.onnx",
  cacheKey: "/reelcase-local-models/upscaler.onnx",
} as const;

type ImageToImage = (image: string) => Promise<{ toBlob(type?: string, quality?: number): Promise<Blob> } | Array<{ toBlob(type?: string, quality?: number): Promise<Blob> }> >;
let upscaler: Promise<ImageToImage> | null = null;

/** Prefer Cache API install, then the shipped public artifact, else HF download. */
export async function resolveLocalUpscalerUrl(onStatus?: (status: string) => void): Promise<string | null> {
  try {
    if (typeof caches !== "undefined") {
      const cache = await caches.open("reelcase-local-models-v1");
      const cached = await cache.match(LOCAL_UPSCALER.cacheKey);
      if (cached) {
        onStatus?.("Using verified local upscaler cache…");
        const blob = await cached.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch {
    // Fall through to shipped artifact.
  }
  try {
    const shipped = await fetch(LOCAL_UPSCALER.shippedArtifactUrl, { method: "HEAD" });
    if (shipped.ok) {
      onStatus?.("Using bundled Swin2SR x2 beta…");
      return LOCAL_UPSCALER.shippedArtifactUrl;
    }
  } catch {
    // Fall through — transformers will fetch from Hugging Face.
  }
  return null;
}

/** Runs the small x2 ONNX model in the browser; it never overwrites an original. */
export async function upscaleImageLocally(url: string, onStatus?: (status: string) => void) {
  if (!upscaler) {
    upscaler = (async () => {
      const { env, pipeline } = await import("@huggingface/transformers");
      // Keep browser cache on so later Photos sessions reuse the same weights.
      env.allowLocalModels = true;
      env.useBrowserCache = true;
      const local = await resolveLocalUpscalerUrl(onStatus);
      if (local?.startsWith("blob:")) {
        // Seed the transformers cache under the HF URL the pipeline will request,
        // then revoke the temporary blob so the ONNX bytes are not pinned twice.
        try {
          if (typeof caches !== "undefined") {
            const cache = await caches.open("transformers-cache");
            const artifact = await fetch(local);
            await cache.put(LOCAL_UPSCALER.artifactUrl, artifact.clone());
          }
        } catch {
          // Pipeline can still download if seeding fails.
        } finally {
          try { URL.revokeObjectURL(local); } catch { /* ignore */ }
        }
      }
      onStatus?.(local ? "Loading local x2 model…" : "Downloading the local x2 model…");
      try {
        return await pipeline("image-to-image", LOCAL_UPSCALER.model, {
          device: typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm",
          dtype: "q4f16",
          revision: LOCAL_UPSCALER.revision,
          progress_callback: (update: { status?: string; file?: string }) => onStatus?.(update.status ?? update.file ?? "Preparing local x2 model…"),
        }) as unknown as ImageToImage;
      } catch (error) {
        if (!(typeof navigator !== "undefined" && "gpu" in navigator)) throw error;
        onStatus?.("WebGPU unavailable; retrying local x2 with WASM…");
        return pipeline("image-to-image", LOCAL_UPSCALER.model, {
          device: "wasm",
          dtype: "q4f16",
          revision: LOCAL_UPSCALER.revision,
          progress_callback: (update: { status?: string; file?: string }) => onStatus?.(update.status ?? update.file ?? "Preparing local x2 model…"),
        }) as unknown as ImageToImage;
      }
    })();
  }
  try {
    const output = await upscaler;
    onStatus?.("Upscaling locally…");
    const image = await output(url);
    const first = Array.isArray(image) ? image[0] : image;
    return URL.createObjectURL(await first.toBlob("image/png"));
  } catch (error) {
    upscaler = null;
    throw error;
  }
}
