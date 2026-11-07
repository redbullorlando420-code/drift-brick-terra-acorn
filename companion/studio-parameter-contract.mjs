/** Contract for this Companion's bounded generation adapters, not arbitrary engine nodes. */
export function studioParameterContract(engine) {
  if (!["a1111", "comfy"].includes(engine)) throw Error("Unsupported studio adapter.");
  return {
    version: 1,
    adapterId: engine + "-form-v1",
    engine,
    source: "companion-adapter",
    sizes: [256, 512, 768],
    steps: { min: 1, max: 40, default: 20 },
    seed: { min: -1, max: 2147483647 },
    sampler: engine === "comfy" ? "euler" : "Euler",
    scheduler: engine === "comfy" ? "simple" : "Automatic",
    guidance: engine === "comfy" ? 4 : 7,
    turboGuidance: engine === "comfy" ? 1 : 7,
    denoise: 1,
  };
}
