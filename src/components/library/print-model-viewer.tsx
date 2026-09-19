import { useEffect, useRef, useState } from "react";
import {
  Box,
  Expand,
  Grid3x3,
  LoaderCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadPrintBlob, isViewablePrintName, type PrintViewerTarget } from "@/lib/prints-blobs";
import {
  DEFAULT_PRINT_EDIT,
  loadPrintEdit,
  printEditKey,
  savePrintEdit,
  type PrintEditState,
} from "@/lib/print-edit-state";

export type { PrintViewerTarget };

type Props = {
  target: PrintViewerTarget;
  onClose: () => void;
};

type CameraPreset = "iso" | "front" | "top" | "side" | "back";

function formatHint(name: string): string {
  if (/\.gcode$/i.test(name)) return "G-code is a toolpath — open it in a slicer or printer UI.";
  if (/\.3mf$/i.test(name)) return "3MF preview uses three.js 3MFLoader when the archive is valid.";
  return "Drag to orbit · scroll to zoom · right-drag to pan · editor panel for transform & view";
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

/**
 * Lightweight three.js print inspector + practical in-section editor.
 * three is dynamically imported so the hub chunk stays lean until open.
 */
export function PrintModelViewer({ target, onClose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const editKey = printEditKey(target);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [detail, setDetail] = useState(formatHint(target.name));
  const [stats, setStats] = useState<string>("");
  const [edit, setEdit] = useState<PrintEditState>(() => loadPrintEdit(editKey));
  const [panelOpen, setPanelOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const editRef = useRef(edit);
  editRef.current = edit;
  const apiRef = useRef<{
    fit: (preset?: CameraPreset) => void;
    applyEdit: () => void;
    setGridVisible: (v: boolean) => void;
    setLighting: (mode: PrintEditState["lighting"]) => void;
  } | null>(null);

  useEffect(() => {
    savePrintEdit(editKey, edit);
    apiRef.current?.applyEdit();
    apiRef.current?.setGridVisible(edit.showGrid);
    apiRef.current?.setLighting(edit.lighting);
  }, [edit, editKey]);

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
    let pivot: import("three").Object3D | null = null;
    let grid: import("three").GridHelper | null = null;
    let hemi: import("three").HemisphereLight | null = null;
    let key: import("three").DirectionalLight | null = null;
    let fill: import("three").DirectionalLight | null = null;
    let rim: import("three").DirectionalLight | null = null;
    let resizeObs: ResizeObserver | null = null;
    let meshBases: Array<{ mesh: import("three").Object3D; base: import("three").Vector3 }> = [];
    let fitCenter = { x: 0, y: 0, z: 0 };
    let fitDistance = 80;
    let THREE_REF: typeof import("three") | null = null;

    const disposeObject = (object: import("three").Object3D) => {
      object.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material;
        if (!material) return;
        const mats = Array.isArray(material) ? material : [material];
        for (const mat of mats) {
          for (const keyName of Object.keys(mat) as (keyof typeof mat)[]) {
            const value = mat[keyName] as unknown;
            if (value && typeof value === "object" && "dispose" in (value as object) && typeof (value as { dispose?: () => void }).dispose === "function") {
              (value as { dispose: () => void }).dispose();
            }
          }
          mat.dispose();
        }
      });
    };

    const applyLighting = (mode: PrintEditState["lighting"]) => {
      if (!hemi || !key || !fill || !rim) return;
      if (mode === "studio") {
        hemi.intensity = 1.05;
        key.intensity = 1.2;
        fill.intensity = 0.4;
        rim.intensity = 0.35;
      } else if (mode === "bright") {
        hemi.intensity = 1.4;
        key.intensity = 1.6;
        fill.intensity = 0.7;
        rim.intensity = 0.2;
      } else if (mode === "soft") {
        hemi.intensity = 1.2;
        key.intensity = 0.55;
        fill.intensity = 0.85;
        rim.intensity = 0.15;
      } else {
        hemi.intensity = 0.45;
        key.intensity = 1.8;
        fill.intensity = 0.15;
        rim.intensity = 0.9;
      }
    };

    const applyEditToScene = () => {
      if (!pivot || !THREE_REF) return;
      const e = editRef.current;
      pivot.scale.setScalar(Math.max(0.05, e.scale));
      pivot.rotation.set(degToRad(e.rotX), degToRad(e.rotZ), degToRad(e.rotY), "XYZ");
      pivot.position.set(e.posX, e.posY, e.posZ);
      pivot.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (!mesh.isMesh || !mesh.material) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) {
          const std = mat as import("three").MeshStandardMaterial;
          if ("wireframe" in std) std.wireframe = e.wireframe;
          if ("color" in std && std.color && !(mesh.userData?.keepColor)) {
            try {
              std.color.set(e.color);
            } catch {
              /* invalid color */
            }
          }
          std.needsUpdate = true;
        }
      });
      // Explode multi-mesh assemblies along offsets from center.
      if (meshBases.length > 1) {
        for (const row of meshBases) {
          const dir = row.base.clone();
          if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
          else dir.normalize();
          row.mesh.position.copy(row.base).addScaledVector(dir, e.explode);
        }
      }
    };

    const fitCamera = (preset: CameraPreset = "iso") => {
      if (!camera || !controls || !THREE_REF) return;
      const c = fitCenter;
      const d = fitDistance;
      if (preset === "front") camera.position.set(c.x, c.y, c.z + d);
      else if (preset === "back") camera.position.set(c.x, c.y, c.z - d);
      else if (preset === "top") camera.position.set(c.x, c.y + d, c.z + 0.01);
      else if (preset === "side") camera.position.set(c.x + d, c.y, c.z);
      else camera.position.set(c.x + d * 0.9, c.y + d * 0.55, c.z + d * 0.9);
      controls.target.set(c.x, c.y, c.z);
      controls.update();
    };

    const measureAndFit = (THREE: typeof import("three"), object: import("three").Object3D) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z, 1);
      const distance = maxDim / (2 * Math.tan(((camera?.fov ?? 45) * Math.PI) / 360));
      fitCenter = { x: center.x, y: center.y, z: center.z };
      fitDistance = Math.max(distance * 1.35, maxDim * 1.2);
      if (camera) {
        camera.near = Math.max(maxDim / 200, 0.01);
        camera.far = Math.max(maxDim * 40, 100);
        camera.updateProjectionMatrix();
      }
      if (grid) {
        const gScale = Math.max(maxDim * 2.5, 40);
        grid.scale.setScalar(gScale / 120);
        grid.position.y = box.min.y;
      }
      fitCamera("iso");
      const tris = Math.round(
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
      setStats(`${tris.toLocaleString()} tris · ${size.x.toFixed(1)}×${size.y.toFixed(1)}×${size.z.toFixed(1)} units`);
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
      THREE_REF = THREE;
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

      hemi = new THREE.HemisphereLight(0xdde7ff, 0x222833, 1.05);
      key = new THREE.DirectionalLight(0xffffff, 1.2);
      key.position.set(40, 80, 30);
      fill = new THREE.DirectionalLight(0x88aaff, 0.4);
      fill.position.set(-50, 20, -40);
      rim = new THREE.DirectionalLight(0xffe6c8, 0.35);
      rim.position.set(-20, 40, 60);
      scene.add(hemi, key, fill, rim);
      applyLighting(editRef.current.lighting);

      grid = new THREE.GridHelper(120, 24, 0x3a4558, 0x222833);
      grid.position.y = 0;
      grid.visible = editRef.current.showGrid;
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
          color: editRef.current.color,
          metalness: 0.05,
          roughness: 0.55,
          flatShading: false,
          wireframe: editRef.current.wireframe,
        });
        object = new THREE.Mesh(geometry, material);
      } else if (ext === "obj") {
        const { OBJLoader } = await import("three/examples/jsm/loaders/OBJLoader.js");
        object = await new OBJLoader().loadAsync(url);
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          mesh.material = new THREE.MeshStandardMaterial({
            color: editRef.current.color,
            metalness: 0.08,
            roughness: 0.5,
            wireframe: editRef.current.wireframe,
          });
        });
      } else if (ext === "glb" || ext === "gltf") {
        const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
        const gltf = await new GLTFLoader().loadAsync(url);
        object = gltf.scene;
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (mesh.isMesh) mesh.userData.keepColor = true;
        });
      } else if (ext === "3mf") {
        const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js");
        object = await new ThreeMFLoader().loadAsync(url);
        object.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (!mesh.isMesh) return;
          if (!mesh.material) {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xc9a66b,
              metalness: 0.1,
              roughness: 0.55,
              wireframe: editRef.current.wireframe,
            });
          } else {
            mesh.userData.keepColor = true;
          }
        });
      } else {
        throw new Error(`Unsupported format .${ext}`);
      }

      if (disposed) {
        disposeObject(object);
        return;
      }

      const box = new THREE.Box3().setFromObject(object);
      object.position.y -= box.min.y;

      pivot = new THREE.Group();
      pivot.add(object);
      scene.add(pivot);
      root = pivot;

      meshBases = [];
      object.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (!mesh.isMesh) return;
        meshBases.push({ mesh, base: mesh.position.clone() });
      });

      measureAndFit(THREE, pivot);
      applyEditToScene();

      apiRef.current = {
        fit: (preset = "iso") => fitCamera(preset),
        applyEdit: applyEditToScene,
        setGridVisible: (v) => {
          if (grid) grid.visible = v;
        },
        setLighting: applyLighting,
      };

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
      apiRef.current = null;
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
      renderer = null;
      controls = null;
      scene = null;
      camera = null;
      root = null;
      pivot = null;
      grid = null;
    };
  }, [target]);

  const patch = (partial: Partial<PrintEditState>) => setEdit((prev) => ({ ...prev, ...partial }));

  const toggleFullscreen = async () => {
    const shell = shellRef.current;
    if (!shell) return;
    try {
      if (!document.fullscreenElement) {
        await shell.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      setFullscreen(Boolean(document.fullscreenElement));
    }
  };

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (n: number) => void,
    suffix = "",
  ) => (
    <label className="block text-xs text-muted">
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <span className="tabular-nums text-fg">
          {Number.isInteger(step) ? value : value.toFixed(2)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={status !== "ready"}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full accent-[var(--accent,#6aa8ff)]"
        aria-label={label}
      />
    </label>
  );

  return (
    <div
      ref={shellRef}
      className="fixed inset-0 z-50 flex flex-col bg-bg/95"
      role="dialog"
      aria-modal="true"
      aria-label={`View ${target.name}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">3D print viewer + editor</p>
          <p className="truncate text-sm font-medium text-fg">{target.name}</p>
          <p className="truncate text-xs text-muted">
            {target.path}
            {target.size > 0
              ? ` · ${target.size < 1024 * 1024 ? `${Math.max(1, Math.round(target.size / 1024))} KB` : `${(target.size / 1024 / 1024).toFixed(1)} MB`}`
              : ""}
            {stats ? ` · ${stats}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" type="button" disabled={status !== "ready"} onClick={() => apiRef.current?.fit("iso")} aria-label="Fit model">
            <Expand className="size-3.5" />
            Fit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            disabled={status !== "ready"}
            onClick={() => {
              setEdit({ ...DEFAULT_PRINT_EDIT });
              apiRef.current?.fit("iso");
            }}
            aria-label="Reset transform and camera"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button size="sm" variant="secondary" type="button" onClick={() => setPanelOpen((v) => !v)} aria-label="Toggle editor panel">
            <Box className="size-3.5" />
            {panelOpen ? "Hide editor" : "Editor"}
          </Button>
          <Button size="sm" variant="secondary" type="button" onClick={() => void toggleFullscreen()} aria-label="Toggle fullscreen">
            {fullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {fullscreen ? "Exit" : "Full"}
          </Button>
          <Button size="sm" variant="secondary" type="button" onClick={onClose} aria-label="Close viewer">
            <X className="size-3.5" />
            Close
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-h-0 min-w-0 flex-1">
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
          {status === "ready" && (
            <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1">
              {(["iso", "front", "top", "side", "back"] as CameraPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="pointer-events-auto rounded-sm bg-bg/80 px-2 py-1 text-[11px] font-medium text-fg shadow-border hover:bg-elevated"
                  onClick={() => apiRef.current?.fit(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}
        </div>

        {panelOpen && (
          <aside className="flex w-full max-w-xs shrink-0 flex-col gap-3 overflow-y-auto border-l border-border bg-surface p-4 sm:w-72">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">View</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={edit.wireframe ? "default" : "secondary"}
                  disabled={status !== "ready"}
                  onClick={() => patch({ wireframe: !edit.wireframe })}
                >
                  Wireframe
                </Button>
                <Button
                  size="sm"
                  variant={edit.showGrid ? "default" : "secondary"}
                  disabled={status !== "ready"}
                  onClick={() => patch({ showGrid: !edit.showGrid })}
                >
                  <Grid3x3 className="size-3.5" />
                  Grid
                </Button>
              </div>
              <p className="mt-3 flex items-center gap-1 text-xs text-muted">
                <Sun className="size-3.5" /> Lighting
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(["studio", "bright", "soft", "contrast"] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={edit.lighting === mode ? "default" : "secondary"}
                    disabled={status !== "ready"}
                    onClick={() => patch({ lighting: mode })}
                  >
                    {mode}
                  </Button>
                ))}
              </div>
              <label className="mt-3 block text-xs text-muted">
                Material color
                <Input
                  type="color"
                  value={edit.color}
                  disabled={status !== "ready"}
                  onChange={(event) => patch({ color: event.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer p-1"
                  aria-label="Material color"
                />
              </label>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Transform</p>
              <p className="mt-1 text-[11px] text-subtle">Saved locally for this model. Not a CAD suite — quick orientation for print checks.</p>
              <div className="mt-3 space-y-3">
                {slider("Scale", edit.scale, 0.1, 5, 0.05, (n) => patch({ scale: n }), "×")}
                {slider("Rotate X", edit.rotX, -180, 180, 1, (n) => patch({ rotX: n }), "°")}
                {slider("Rotate Y", edit.rotY, -180, 180, 1, (n) => patch({ rotY: n }), "°")}
                {slider("Rotate Z", edit.rotZ, -180, 180, 1, (n) => patch({ rotZ: n }), "°")}
                {slider("Move X", edit.posX, -100, 100, 0.5, (n) => patch({ posX: n }))}
                {slider("Move Y", edit.posY, -100, 100, 0.5, (n) => patch({ posY: n }))}
                {slider("Move Z", edit.posZ, -100, 100, 0.5, (n) => patch({ posZ: n }))}
                {slider("Explode parts", edit.explode, 0, 40, 0.5, (n) => patch({ explode: n }))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" disabled={status !== "ready"} onClick={() => patch({ rotX: 0, rotY: 0, rotZ: 0, posX: 0, posY: 0, posZ: 0, scale: 1, explode: 0 })}>
                  Clear transform
                </Button>
                <Button size="sm" variant="secondary" disabled={status !== "ready"} onClick={() => patch({ rotX: -90 })} title="Common bed flat correction">
                  Flat on bed (−90° X)
                </Button>
              </div>
            </div>
          </aside>
        )}
      </div>
      {status === "ready" && <p className="border-t border-border px-4 py-2 text-xs text-subtle">{detail}</p>}
    </div>
  );
}
