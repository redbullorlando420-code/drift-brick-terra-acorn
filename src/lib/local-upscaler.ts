export const LOCAL_UPSCALER = {
  name: "Swin2SR x2 beta",
  model: "Xenova/swin2SR-classical-sr-x2-64",
  revision: "93dfc9089abda257351d3a58d5771e2c1ff69442",
  // Hugging Face's published digest for onnx/model_q4f16.onnx at this revision.
  sha256: "49ffa7b96532edb9553c74be11b623dafa26db1645611096a208449451a960df",
  artifactUrl: "https://huggingface.co/Xenova/swin2SR-classical-sr-x2-64/resolve/93dfc9089abda257351d3a58d5771e2c1ff69442/onnx/model_q4f16.onnx",
  shippedArtifactUrl: "/models/swin2sr-x2-q4f16.onnx",
} as const;

type ImageToImage = (image: string) => Promise<{ toBlob(type?: string, quality?: number): Promise<Blob> } | Array<{ toBlob(type?: string, quality?: number): Promise<Blob> }> >;
let upscaler: Promise<ImageToImage> | null = null;

/** Runs the small x2 ONNX model in the browser; it never overwrites an original. */
export async function upscaleImageLocally(url: string, onStatus?: (status: string) => void) {
  if (!upscaler) {
    upscaler = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      onStatus?.("Downloading the local x2 model…");
      return pipeline("image-to-image", LOCAL_UPSCALER.model, {
        device: typeof navigator !== "undefined" && "gpu" in navigator ? "webgpu" : "wasm",
        dtype: "q4f16",
        revision: LOCAL_UPSCALER.revision,
        progress_callback: (update: { status?: string; file?: string }) => onStatus?.(update.status ?? update.file ?? "Preparing local x2 model…"),
      }) as unknown as ImageToImage;
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
