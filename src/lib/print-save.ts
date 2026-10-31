import type { Object3D, Mesh, Vector3, Material } from "three";
import type { PrintEditState } from "./print-edit-state";
export const PRINT_SAVE_LIMIT = 48 * 1024 * 1024;
export const PRINT_FORMAT_NOTE =
  "GLB stores the current static geometry, transforms and supported embedded materials. STL and OBJ do not retain these material edits, so edited copies are saved as GLB. Camera, lighting, grid, wireframe and explode preview are excluded. Animations, CAD constraints and slicer settings are not exported. Source units are retained; check scale in your slicer.";
export const printModelSignature = (edit: PrintEditState) =>
  JSON.stringify([
    edit.scale,
    edit.rotX,
    edit.rotY,
    edit.rotZ,
    edit.posX,
    edit.posY,
    edit.posZ,
    edit.overrideMaterial ? edit.color : null,
    edit.overrideMaterial,
  ]);
export function isSavedPrintScene(object: Object3D) {
  let found = false;
  object.traverse((node) => {
    const value = node.userData?.reelcasePrint;
    if (value?.version === 1 && value.origin === "preserve") found = true;
  });
  return found;
}
export function defaultPrintCopyName(name: string) {
  return (
    (name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9 _().-]/gi, "_")
      .replace(/^[^a-z0-9]+/gi, "")
      .slice(0, 95) || "model") + "-edited.glb"
  );
}
export function validPrintCopyName(name: string) {
  return (
    name.length <= 120 &&
    /^[a-z0-9][a-z0-9 _().-]*\.glb$/i.test(name) &&
    !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)
  );
}
export async function exportPrintCopy(
  object: Object3D,
  bases: Array<{ mesh: Object3D; base: Vector3 }>,
) {
  object.updateMatrixWorld(true);
  const arrays = new Set<ArrayBufferLike>(),
    textures = new Set<unknown>();
  let bytes = 0,
    pixels = 0;
  object.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    for (const attribute of [
      ...Object.values(mesh.geometry.attributes),
      ...(mesh.geometry.index ? [mesh.geometry.index] : []),
    ]) {
      const array = attribute.array;
      if (!arrays.has(array.buffer)) {
        arrays.add(array.buffer);
        bytes += array.byteLength;
      }
    }
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
      for (const value of Object.values(material)) {
        if (value && typeof value === "object" && value.isTexture && !textures.has(value)) {
          textures.add(value);
          const image = value.image;
          pixels += Math.min(image?.width ?? 0, 2048) * Math.min(image?.height ?? 0, 2048);
        }
      }
  });
  if (bytes > 32 * 1024 * 1024 || pixels > 16 * 1024 * 1024)
    throw Error(
      "This scene exceeds the editor export budget. Use a desktop model editor for this file.",
    );
  const clone = object.clone(true),
    materials: Material[] = [];
  let index = 0;
  clone.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const base = bases[index++];
    if (base) mesh.position.copy(base.base);
    const copy = (original: Material) => {
      const material = original.clone();
      if ("wireframe" in material) material.wireframe = false;
      materials.push(material);
      return material;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(copy) : copy(mesh.material);
  });
  clone.userData = { reelcasePrint: { version: 1, origin: "preserve", units: "source-units" } };
  clone.updateMatrixWorld(true);
  try {
    const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
    const buffer = await new GLTFExporter().parseAsync(clone, {
      binary: true,
      onlyVisible: true,
      maxTextureSize: 2048,
    });
    if (
      !(buffer instanceof ArrayBuffer) ||
      !buffer.byteLength ||
      buffer.byteLength > PRINT_SAVE_LIMIT
    )
      throw Error("The edited GLB exceeds the 48 MiB save limit.");
    return new Blob([buffer], { type: "model/gltf-binary" });
  } finally {
    materials.forEach((material) => material.dispose());
  }
}
export type PrintSaveReceipt = {
  id: string;
  path: string;
  name: string;
  bytes: number;
  sha256: string;
  at: number;
  status: "review" | "uploading" | "committing" | "done" | "interrupted" | "cancelled" | "error";
  detail: string;
  persistent: boolean;
};
export type PrintSavedCopy = { signature: string; receipt: PrintSaveReceipt };
const KEY = "reelcase.print-saved-copies.v1";
export function loadSavedPrintCopy(key: string): PrintSavedCopy | null {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}"),
      row = data[key];
    return row &&
      typeof row.signature === "string" &&
      row.signature.length < 512 &&
      row.receipt?.status === "done" &&
      typeof row.receipt.path === "string" &&
      row.receipt.path.length <= 4096
      ? row
      : null;
  } catch {
    return null;
  }
}
export function rememberSavedPrintCopy(key: string, value: PrintSavedCopy) {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    data[key] = value;
    for (const old of Object.keys(data).slice(0, -80)) delete data[old];
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export const printPendingKey = (key: string) =>
  "reelcase.print-save-pending.v1:" + encodeURIComponent(key);
