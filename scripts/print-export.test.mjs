import test from "node:test";
import assert from "node:assert/strict";
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, Vector3, Box3 } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  exportPrintCopy,
  isSavedPrintScene,
  defaultPrintCopyName,
  validPrintCopyName,
  printModelSignature,
  loadSavedPrintCopy,
  rememberSavedPrintCopy,
} from "../src/lib/print-save.ts";
import { DEFAULT_PRINT_EDIT, sanitizePrintEdit } from "../src/lib/print-edit-state.ts";
class Reader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((bytes) => {
      this.result = "data:" + blob.type + ";base64," + Buffer.from(bytes).toString("base64");
      this.onloadend?.();
    });
  }
}
globalThis.FileReader = Reader;
test("GLB export/reopen preserves world transforms and material color while excluding explode and wireframe without mutating the source", async () => {
  const root = new Group(),
    mesh = new Mesh(
      new BoxGeometry(2, 4, 6),
      new MeshStandardMaterial({ color: "#ff8844", wireframe: true }),
    );
  root.position.set(12, -7, 3);
  root.rotation.set(0.2, -0.6, 0.4);
  root.scale.setScalar(1.7);
  root.add(mesh);
  const base = new Vector3(3, 2, 0);
  mesh.position.copy(base).add(new Vector3(0, 20, 0));
  const expected = root.clone(true);
  expected.children[0].position.copy(base);
  const bounds = new Box3().setFromObject(expected),
    sourcePosition = mesh.position.clone(),
    blob = await exportPrintCopy(root, [{ mesh, base }]);
  assert(blob.size > 100);
  const reopened = await new GLTFLoader().parseAsync(await blob.arrayBuffer(), "");
  assert(isSavedPrintScene(reopened.scene));
  const actual = new Box3().setFromObject(reopened.scene);
  assert(actual.min.distanceTo(bounds.min) < 1e-5);
  assert(actual.max.distanceTo(bounds.max) < 1e-5);
  let material;
  reopened.scene.traverse((node) => {
    if (node.isMesh) material = node.material;
  });
  assert.equal(material.color.getHexString(), "ff8844");
  assert.equal(material.wireframe, false);
  assert(mesh.position.equals(sourcePosition));
  assert.equal(mesh.material.wireframe, true);
  mesh.geometry.dispose();
  mesh.material.dispose();
});
test("save naming, dirty signatures and corrupt local edit state are bounded and meaningful", () => {
  assert.equal(defaultPrintCopyName("thing.stl"), "thing-edited.glb");
  assert(!validPrintCopyName("../escape.glb"));
  assert(!validPrintCopyName("CON.glb"));
  assert(validPrintCopyName("new model.glb"));
  assert.equal(
    printModelSignature(DEFAULT_PRINT_EDIT),
    printModelSignature({ ...DEFAULT_PRINT_EDIT, wireframe: true, explode: 20, lighting: "soft" }),
  );
  assert.notEqual(
    printModelSignature(DEFAULT_PRINT_EDIT),
    printModelSignature({ ...DEFAULT_PRINT_EDIT, posY: 5 }),
  );
  const safe = sanitizePrintEdit({
    scale: Infinity,
    posX: 999,
    rotY: NaN,
    color: "url(secret)",
    showGrid: false,
  });
  assert.equal(safe.scale, 1);
  assert.equal(safe.posX, 100);
  assert.equal(safe.rotY, 0);
  assert.equal(safe.color, DEFAULT_PRINT_EDIT.color);
  assert.equal(safe.showGrid, false);
});
test("saved-copy receipts are bounded and storage failure never fabricates persistence", () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
  const receipt = { status: "done", path: "/private/copy.glb" };
  for (let i = 0; i < 90; i++)
    assert(rememberSavedPrintCopy("model-" + i, { signature: "[]", receipt }));
  assert.equal(Object.keys(JSON.parse(values.get("reelcase.print-saved-copies.v1"))).length, 80);
  assert.equal(loadSavedPrintCopy("model-0"), null);
  assert.equal(loadSavedPrintCopy("model-89").receipt.path, "/private/copy.glb");
  globalThis.localStorage.setItem = () => {
    throw Error("Quota fixture");
  };
  assert.equal(rememberSavedPrintCopy("lost", { signature: "[]", receipt }), false);
  delete globalThis.localStorage;
});
