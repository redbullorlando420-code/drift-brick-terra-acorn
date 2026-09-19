import { useEffect, useRef, useState } from "react";
import { LoaderCircle, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadPrintBlob, isViewablePrintName, type PrintViewerTarget } from "@/lib/prints-blobs";

export type { PrintViewerTarget };

type Props = {
  target: PrintViewerTarget;
  onClose: () => void;
};

function formatHint(name: string): string {
  if (/\.gcode$/i.test(name)) return "G-code is a toolpath — open it in a slicer or printer UI.";
  if (/\.3mf$/i.test(name)) return "3MF preview uses three.js 3MFLoader when the archive is valid.";
  return "Drag to orbit · scroll to zoom · right-drag to pan";
}

/**
 * Lightweight three.js print inspector. three is dynamically imported so the
 * hub chunk stays lean until the user opens a model.
 */
export function PrintModelViewer({ target, onClose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [detail, setDetail] = useState(formatHint(target.name));
  const [stats, setStats] = useState<string>("");
  const resetRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let objectUrl: string | null = null;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let controls: import("three/examples/jsm/controls/OrbitControls.js").OrbitControls | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let root: import("three").Object3D | null = null;
    let resizeObs: ResizeObserver | null = null;

    const disposeObject = (object: import("three").Object3D) => {
      object.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (!material) return;
        const mats = Array.isArray(material) ? material : [material];
        for (const mat of mats) {
          for (const key of Object.keys(mat) as (keyof typeof mat)[]) {
            const value = mat[key] as unknown;
            if (value && typeof value === "object" && "dispose" in (value as object) && typeof (value as { dispose?: () => void }).dispose === "function") {
              (value as { dispose: () => void }).dispose();
            }
          }
          mat.dispose();
        }
      });
    };

    const fitCamera = (
      THREE: typeof import("three"),
      object: import("three").Object3D,
      cam: import("three").PerspectiveCamera,
      ctl: { target: import("three").Vector3; update?: () => void },
    ) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1);
      const distance = maxDim / (2 * Math.tan((cam.fov * Math.PI) / 360));
      cam.position.set(center.x + distance * 0.9, center.y + distance * 0.55, center.z + distance * 0.9);
      cam.near = Math.max(maxDim / 200, 0.01);
      cam.far = Math.max(maxDim * 40, 100);
      cam.updateProjectionMatrix();
      ctl.target.copy(center);
      resetRef.current = () => {
        cam.position.set(center.x + distance * 0.9, center.y + distance * 0.55, center.z + distance * 0.9);
        ctl.target.copy(center);
      };
      const tris =
        object instanceof THREE.Mesh && object.geometry?.index
          ? object.geometry.index.count / 3
          : Math.round(
              (() => {
                let count = 0;
                object.traverse((child) => {
                  const mesh = child as import("three").Mesh;
                  if (!mesh.isMesh || !mesh.geometry) return;
                  const geo = mesh.geometry;
                  count += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count ?? 0) / 3;
                });
                return count;
              })(),
            );
      setStats(`${Math.round(tris).toLocaleString()} tris · ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)} units`);
    };

    const run = async () => {
      setStatus("loading");
      setDetail(formatHint(target.name));
      if (!isViewablePrintName(target.name) && !target.sampleSrc) {
        setStatus("error");
        setDetail(formatHint(target.name));
        return;
      }

      const THREE = await import("three");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color("#0f1218");

      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
      camera.position.set(80, 60, 80);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(host.clientWidth || 640, host.clientHeight || 420, false);
      host.replaceChildren(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";
      renderer.domElement.setAttribute("aria-label", `3D preview of ${target.name}`);

      const hemi = new THREE.HemisphereLight(0xdde7ff, 0x222833, 1.1);
      const key = new THREE.DirectionalLight(0xffffff, 1.15);
      key.position.set(40, 80, 30);
      const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
      fill.position.set(-50, 20, -40);
      scene.add(hemi, key, fill);

      const grid = new THREE.GridHelper(120, 24, 0x3a4558, 0x222833);
      grid.position.y = 0;
      scene.add(grid);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = true;

      const resize = () => {
        if (!renderer || !camera || !host) return;
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };
      resize();
      resizeObs = new ResizeObserver(resize);
      resizeObs.observe(host);

      const tick = () => {
        if (disposed || !renderer || !scene || !camera || !controls) return;
        controls.update();
        renderer.render(scene, camera);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      let url = target.sampleSrc ?? null;
      let ext = (target.sampleSrc || target.name).split(".").pop()?.toLowerCase() ?? "";
      if (!url && target.blobId) {
        const record = await loadPrintBlob(target.blobId);
        if (!record) throw new Error("Saved model bytes are missing — re-add the file to view it.");
        objectUrl = URL.createObjectURL(record.blob);
        url = objectUrl;
        ext = record.name.split(".").pop()?.toLowerCase() ?? ext;
      }
      if (!url) throw new Error("No geometry source for this print file.");

      let object: import("three").Object3D;
      if (ext === "stl") {
        const { STLLoader } = await import("three/examples/jsm/loaders/STLLoader.js");
        const geometry = await new STLLoader().loadAsync(url);
        geometry.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0x6aa8ff,
          metalness: 0.05,
          roughness: 0.55,
          flatShading: false,
        });
        object = new THREE.Mesh(geometry, material);
      } else if (ext === "obj") {
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
        object = await new OBJLoader().loadAsync(url);
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x7ec8a3,
            metalness: 0.08,
            roughness: 0.5,
          });
        });
      } else if (ext === "glb" || ext === "gltf") {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const gltf = await new GLTFLoader().loadAsync(url);
        object = gltf.scene;
      } else if (ext === "3mf") {
        const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js");
        object = await new ThreeMFLoader().loadAsync(url);
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          if (!mesh.material) {
            mesh.material = new THREE.MeshStandardMaterial({ color: 0xc9a66b, metalness: 0.1, roughness: 0.55 });
          }
        });
      } else {
        throw new Error(`Unsupported format .${ext}`);
      }

      if (disposed) {
        disposeObject(object);
        return;
      }

      // Sit the model on the grid.
      const box = new THREE.Box3().setFromObject(object);
      object.position.y -= box.min.y;
      scene.add(object);
      root = object;
      fitCamera(THREE, object, camera, controls);
      setStatus("ready");
      setDetail(formatHint(target.name));
    };

    run().catch((error: unknown) => {
      if (disposed) return;
      setStatus("error");
      setDetail(error instanceof Error ? error.message : "Could not load this model.");
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObs?.disconnect();
      controls?.dispose();
      if (root && scene) {
        scene.remove(root);
        disposeObject(root);
      }
      if (scene) {
        while (scene.children.length) {
          const child = scene.children.pop();
          if (child) {
            scene.remove(child);
            disposeObject(child);
          }
        }
      }
      renderer?.dispose();
      if (renderer && "forceContextLoss" in renderer) (renderer as { forceContextLoss: () => void }).forceContextLoss();
      if (renderer?.domElement.parentElement === host) host.replaceChildren();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resetRef.current = null;
      renderer = null;
      controls = null;
      scene = null;
      camera = null;
      root = null;
    };
  }, [target]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg/95" role="dialog" aria-modal="true" aria-label={`View ${target.name}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">3D print viewer</p>
          <p className="truncate text-sm font-medium text-fg">{target.name}</p>
          <p className="truncate text-xs text-muted">
            {target.path}
            {target.size > 0 ? ` · ${(target.size < 1024 * 1024 ? `${Math.max(1, Math.round(target.size / 1024))} KB` : `${(target.size / 1024 / 1024).toFixed(1)} MB`)}` : ""}
            {stats ? ` · ${stats}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={status !== "ready"}
            onClick={() => resetRef.current?.()}
            aria-label="Reset camera"
          >
            <RotateCcw className="size-3.5" />
            Reset view
          </Button>
          <Button size="sm" variant="secondary" type="button" onClick={onClose} aria-label="Close viewer">
            <X className="size-3.5" />
            Close
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={hostRef} className="absolute inset-0 touch-none" />
        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted">
            <LoaderCircle className="size-4 animate-spin" />
            Loading model…
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="max-w-md rounded-lg bg-elevated px-4 py-3 text-center text-sm text-muted shadow-border">{detail}</p>
          </div>
        )}
      </div>
      {status === "ready" && <p className="border-t border-border px-4 py-2 text-xs text-subtle">{detail}</p>}
    </div>
  );
}
