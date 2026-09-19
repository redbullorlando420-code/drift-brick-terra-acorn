import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { B as LoaderCircle, S as RotateCcw, n as X } from "../_libs/lucide-react.mjs";
import { _ as Button } from "./routes-DqMIPFyJ.mjs";
import { n as isViewablePrintName, r as loadPrintBlob } from "./hub-sections-WkvAufF_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/print-model-viewer-lyVdLc5a.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatHint(name) {
	if (/\.gcode$/i.test(name)) return "G-code is a toolpath — open it in a slicer or printer UI.";
	if (/\.3mf$/i.test(name)) return "3MF preview uses three.js 3MFLoader when the archive is valid.";
	return "Drag to orbit · scroll to zoom · right-drag to pan";
}
/**
* Lightweight three.js print inspector. three is dynamically imported so the
* hub chunk stays lean until the user opens a model.
*/
function PrintModelViewer({ target, onClose }) {
	const hostRef = (0, import_react.useRef)(null);
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [detail, setDetail] = (0, import_react.useState)(formatHint(target.name));
	const [stats, setStats] = (0, import_react.useState)("");
	const resetRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!host) return;
		let disposed = false;
		let objectUrl = null;
		let frame = 0;
		let renderer = null;
		let controls = null;
		let scene = null;
		let camera = null;
		let root = null;
		let resizeObs = null;
		const disposeObject = (object) => {
			object.traverse((child) => {
				const mesh = child;
				if (mesh.geometry) mesh.geometry.dispose();
				const material = mesh.material;
				if (!material) return;
				const mats = Array.isArray(material) ? material : [material];
				for (const mat of mats) {
					for (const key of Object.keys(mat)) {
						const value = mat[key];
						if (value && typeof value === "object" && "dispose" in value && typeof value.dispose === "function") value.dispose();
					}
					mat.dispose();
				}
			});
		};
		const fitCamera = (THREE, object, cam, ctl) => {
			const box = new THREE.Box3().setFromObject(object);
			const size = box.getSize(new THREE.Vector3());
			const center = box.getCenter(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z, 1);
			const distance = maxDim / (2 * Math.tan(cam.fov * Math.PI / 360));
			cam.position.set(center.x + distance * .9, center.y + distance * .55, center.z + distance * .9);
			cam.near = Math.max(maxDim / 200, .01);
			cam.far = Math.max(maxDim * 40, 100);
			cam.updateProjectionMatrix();
			ctl.target.copy(center);
			resetRef.current = () => {
				cam.position.set(center.x + distance * .9, center.y + distance * .55, center.z + distance * .9);
				ctl.target.copy(center);
			};
			const tris = object instanceof THREE.Mesh && object.geometry?.index ? object.geometry.index.count / 3 : Math.round((() => {
				let count = 0;
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh || !mesh.geometry) return;
					const geo = mesh.geometry;
					count += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count ?? 0) / 3;
				});
				return count;
			})());
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
			const THREE = await import("../_libs/three.mjs").then((n) => n.o);
			const { OrbitControls } = await import("../_libs/three.mjs").then((n) => n.a);
			if (disposed) return;
			scene = new THREE.Scene();
			scene.background = new THREE.Color("#0f1218");
			camera = new THREE.PerspectiveCamera(45, 1, .1, 2e3);
			camera.position.set(80, 60, 80);
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: false,
				powerPreference: "low-power"
			});
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
			renderer.setSize(host.clientWidth || 640, host.clientHeight || 420, false);
			host.replaceChildren(renderer.domElement);
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "100%";
			renderer.domElement.style.display = "block";
			renderer.domElement.setAttribute("aria-label", `3D preview of ${target.name}`);
			const hemi = new THREE.HemisphereLight(14542847, 2238515, 1.1);
			const key = new THREE.DirectionalLight(16777215, 1.15);
			key.position.set(40, 80, 30);
			const fill = new THREE.DirectionalLight(8956671, .35);
			fill.position.set(-50, 20, -40);
			scene.add(hemi, key, fill);
			const grid = new THREE.GridHelper(120, 24, 3818840, 2238515);
			grid.position.y = 0;
			scene.add(grid);
			controls = new OrbitControls(camera, renderer.domElement);
			controls.enableDamping = true;
			controls.dampingFactor = .08;
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
			let object;
			if (ext === "stl") {
				const { STLLoader } = await import("../_libs/three.mjs").then((n) => n.t);
				const geometry = await new STLLoader().loadAsync(url);
				geometry.computeVertexNormals();
				const material = new THREE.MeshStandardMaterial({
					color: 6990079,
					metalness: .05,
					roughness: .55,
					flatShading: false
				});
				object = new THREE.Mesh(geometry, material);
			} else if (ext === "obj") {
				const { OBJLoader } = await import("../_libs/three.mjs").then((n) => n.n);
				object = await new OBJLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					mesh.material = new THREE.MeshStandardMaterial({
						color: 8308899,
						metalness: .08,
						roughness: .5
					});
				});
			} else if (ext === "glb" || ext === "gltf") {
				const { GLTFLoader } = await import("../_libs/three.mjs").then((n) => n.r);
				object = (await new GLTFLoader().loadAsync(url)).scene;
			} else if (ext === "3mf") {
				const { ThreeMFLoader } = await import("../_libs/three.mjs").then((n) => n.i);
				object = await new ThreeMFLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					if (!mesh.material) mesh.material = new THREE.MeshStandardMaterial({
						color: 13215339,
						metalness: .1,
						roughness: .55
					});
				});
			} else throw new Error(`Unsupported format .${ext}`);
			if (disposed) {
				disposeObject(object);
				return;
			}
			const box = new THREE.Box3().setFromObject(object);
			object.position.y -= box.min.y;
			scene.add(object);
			root = object;
			fitCamera(THREE, object, camera, controls);
			setStatus("ready");
			setDetail(formatHint(target.name));
		};
		run().catch((error) => {
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
			if (scene) while (scene.children.length) {
				const child = scene.children.pop();
				if (child) {
					scene.remove(child);
					disposeObject(child);
				}
			}
			renderer?.dispose();
			if (renderer && "forceContextLoss" in renderer) renderer.forceContextLoss();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-bg/95",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `View ${target.name}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "3D print viewer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-medium text-fg",
							children: target.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								target.path,
								target.size > 0 ? ` · ${target.size < 1048576 ? `${Math.max(1, Math.round(target.size / 1024))} KB` : `${(target.size / 1024 / 1024).toFixed(1)} MB`}` : "",
								stats ? ` · ${stats}` : ""
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						type: "button",
						disabled: status !== "ready",
						onClick: () => resetRef.current?.(),
						"aria-label": "Reset camera",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset view"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						type: "button",
						onClick: onClose,
						"aria-label": "Close viewer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Close"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-h-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: hostRef,
						className: "absolute inset-0 touch-none"
					}),
					status === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), "Loading model…"]
					}),
					status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 flex items-center justify-center p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "max-w-md rounded-lg bg-elevated px-4 py-3 text-center text-sm text-muted shadow-border",
							children: detail
						})
					})
				]
			}),
			status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-border px-4 py-2 text-xs text-subtle",
				children: detail
			})
		]
	});
}
//#endregion
export { PrintModelViewer };
