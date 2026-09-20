import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as RotateCcw, F as Minimize2, H as LoaderCircle, Tt as Box, et as Grid3x3, f as Sun, n as X, pt as Expand, z as Maximize2 } from "../_libs/lucide-react.mjs";
import { h as Input, x as Button } from "./routes-NqJQcerD.mjs";
import { n as isViewablePrintName, r as loadPrintBlob } from "./hub-sections-DuL6PypP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/print-model-viewer-BBXhQTgw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_PRINT_EDIT = {
	scale: 1,
	rotX: 0,
	rotY: 0,
	rotZ: 0,
	posX: 0,
	posY: 0,
	posZ: 0,
	color: "#6aa8ff",
	wireframe: false,
	showGrid: true,
	lighting: "studio",
	explode: 0
};
var KEY = "reelcase.print-edit.v1";
function printEditKey(target) {
	return target.blobId || target.sampleSrc || target.path || target.name;
}
function loadPrintEdit(key) {
	try {
		const row = JSON.parse(localStorage.getItem(KEY) ?? "{}")[key];
		if (!row || typeof row !== "object") return { ...DEFAULT_PRINT_EDIT };
		return {
			...DEFAULT_PRINT_EDIT,
			...row
		};
	} catch {
		return { ...DEFAULT_PRINT_EDIT };
	}
}
function savePrintEdit(key, state) {
	try {
		const all = JSON.parse(localStorage.getItem(KEY) ?? "{}");
		all[key] = state;
		const keys = Object.keys(all);
		if (keys.length > 80) for (const drop of keys.slice(0, keys.length - 80)) delete all[drop];
		localStorage.setItem(KEY, JSON.stringify(all));
	} catch {}
}
function formatHint(name) {
	if (/\.gcode$/i.test(name)) return "G-code is a toolpath — open it in a slicer or printer UI.";
	if (/\.3mf$/i.test(name)) return "3MF preview uses three.js 3MFLoader when the archive is valid.";
	return "Drag to orbit · scroll to zoom · right-drag to pan · editor panel for transform & view";
}
function degToRad(d) {
	return d * Math.PI / 180;
}
/**
* Lightweight three.js print inspector + practical in-section editor.
* three is dynamically imported so the hub chunk stays lean until open.
*/
function PrintModelViewer({ target, onClose }) {
	const hostRef = (0, import_react.useRef)(null);
	const shellRef = (0, import_react.useRef)(null);
	const editKey = printEditKey(target);
	const [status, setStatus] = (0, import_react.useState)("loading");
	const [detail, setDetail] = (0, import_react.useState)(formatHint(target.name));
	const [stats, setStats] = (0, import_react.useState)("");
	const [edit, setEdit] = (0, import_react.useState)(() => loadPrintEdit(editKey));
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(true);
	const [fullscreen, setFullscreen] = (0, import_react.useState)(false);
	const editRef = (0, import_react.useRef)(edit);
	editRef.current = edit;
	const apiRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		savePrintEdit(editKey, edit);
		apiRef.current?.applyEdit();
		apiRef.current?.setGridVisible(edit.showGrid);
		apiRef.current?.setLighting(edit.lighting);
	}, [edit, editKey]);
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
		let pivot = null;
		let grid = null;
		let hemi = null;
		let key = null;
		let fill = null;
		let rim = null;
		let resizeObs = null;
		let meshBases = [];
		let fitCenter = {
			x: 0,
			y: 0,
			z: 0
		};
		let fitDistance = 80;
		let THREE_REF = null;
		const disposeObject = (object) => {
			object.traverse((child) => {
				const mesh = child;
				if (mesh.geometry) mesh.geometry.dispose();
				const material = mesh.material;
				if (!material) return;
				const mats = Array.isArray(material) ? material : [material];
				for (const mat of mats) {
					for (const keyName of Object.keys(mat)) {
						const value = mat[keyName];
						if (value && typeof value === "object" && "dispose" in value && typeof value.dispose === "function") value.dispose();
					}
					mat.dispose();
				}
			});
		};
		const applyLighting = (mode) => {
			if (!hemi || !key || !fill || !rim) return;
			if (mode === "studio") {
				hemi.intensity = 1.05;
				key.intensity = 1.2;
				fill.intensity = .4;
				rim.intensity = .35;
			} else if (mode === "bright") {
				hemi.intensity = 1.4;
				key.intensity = 1.6;
				fill.intensity = .7;
				rim.intensity = .2;
			} else if (mode === "soft") {
				hemi.intensity = 1.2;
				key.intensity = .55;
				fill.intensity = .85;
				rim.intensity = .15;
			} else {
				hemi.intensity = .45;
				key.intensity = 1.8;
				fill.intensity = .15;
				rim.intensity = .9;
			}
		};
		const applyEditToScene = () => {
			if (!pivot || !THREE_REF) return;
			const e = editRef.current;
			pivot.scale.setScalar(Math.max(.05, e.scale));
			pivot.rotation.set(degToRad(e.rotX), degToRad(e.rotZ), degToRad(e.rotY), "XYZ");
			pivot.position.set(e.posX, e.posY, e.posZ);
			pivot.traverse((child) => {
				const mesh = child;
				if (!mesh.isMesh || !mesh.material) return;
				const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
				for (const mat of mats) {
					const std = mat;
					if ("wireframe" in std) std.wireframe = e.wireframe;
					if ("color" in std && std.color && !mesh.userData?.keepColor) try {
						std.color.set(e.color);
					} catch {}
					std.needsUpdate = true;
				}
			});
			if (meshBases.length > 1) for (const row of meshBases) {
				const dir = row.base.clone();
				if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
				else dir.normalize();
				row.mesh.position.copy(row.base).addScaledVector(dir, e.explode);
			}
		};
		const fitCamera = (preset = "iso") => {
			if (!camera || !controls || !THREE_REF) return;
			const c = fitCenter;
			const d = fitDistance;
			if (preset === "front") camera.position.set(c.x, c.y, c.z + d);
			else if (preset === "back") camera.position.set(c.x, c.y, c.z - d);
			else if (preset === "top") camera.position.set(c.x, c.y + d, c.z + .01);
			else if (preset === "side") camera.position.set(c.x + d, c.y, c.z);
			else camera.position.set(c.x + d * .9, c.y + d * .55, c.z + d * .9);
			controls.target.set(c.x, c.y, c.z);
			controls.update();
		};
		const measureAndFit = (THREE, object) => {
			const box = new THREE.Box3().setFromObject(object);
			const size = box.getSize(new THREE.Vector3());
			const center = box.getCenter(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z, 1);
			const distance = maxDim / (2 * Math.tan((camera?.fov ?? 45) * Math.PI / 360));
			fitCenter = {
				x: center.x,
				y: center.y,
				z: center.z
			};
			fitDistance = Math.max(distance * 1.35, maxDim * 1.2);
			if (camera) {
				camera.near = Math.max(maxDim / 200, .01);
				camera.far = Math.max(maxDim * 40, 100);
				camera.updateProjectionMatrix();
			}
			if (grid) {
				const gScale = Math.max(maxDim * 2.5, 40);
				grid.scale.setScalar(gScale / 120);
				grid.position.y = box.min.y;
			}
			fitCamera("iso");
			const tris = Math.round((() => {
				let count = 0;
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh || !mesh.geometry) return;
					const geo = mesh.geometry;
					count += geo.index ? geo.index.count / 3 : (geo.attributes.position?.count ?? 0) / 3;
				});
				return count;
			})());
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
			const THREE = await import("../_libs/three.mjs").then((n) => n.o);
			THREE_REF = THREE;
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
			hemi = new THREE.HemisphereLight(14542847, 2238515, 1.05);
			key = new THREE.DirectionalLight(16777215, 1.2);
			key.position.set(40, 80, 30);
			fill = new THREE.DirectionalLight(8956671, .4);
			fill.position.set(-50, 20, -40);
			rim = new THREE.DirectionalLight(16770760, .35);
			rim.position.set(-20, 40, 60);
			scene.add(hemi, key, fill, rim);
			applyLighting(editRef.current.lighting);
			grid = new THREE.GridHelper(120, 24, 3818840, 2238515);
			grid.position.y = 0;
			grid.visible = editRef.current.showGrid;
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
					color: editRef.current.color,
					metalness: .05,
					roughness: .55,
					flatShading: false,
					wireframe: editRef.current.wireframe
				});
				object = new THREE.Mesh(geometry, material);
			} else if (ext === "obj") {
				const { OBJLoader } = await import("../_libs/three.mjs").then((n) => n.n);
				object = await new OBJLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					mesh.material = new THREE.MeshStandardMaterial({
						color: editRef.current.color,
						metalness: .08,
						roughness: .5,
						wireframe: editRef.current.wireframe
					});
				});
			} else if (ext === "glb" || ext === "gltf") {
				const { GLTFLoader } = await import("../_libs/three.mjs").then((n) => n.r);
				object = (await new GLTFLoader().loadAsync(url)).scene;
				object.traverse((child) => {
					const mesh = child;
					if (mesh.isMesh) mesh.userData.keepColor = true;
				});
			} else if (ext === "3mf") {
				const { ThreeMFLoader } = await import("../_libs/three.mjs").then((n) => n.i);
				object = await new ThreeMFLoader().loadAsync(url);
				object.traverse((child) => {
					const mesh = child;
					if (!mesh.isMesh) return;
					if (!mesh.material) mesh.material = new THREE.MeshStandardMaterial({
						color: 13215339,
						metalness: .1,
						roughness: .55,
						wireframe: editRef.current.wireframe
					});
					else mesh.userData.keepColor = true;
				});
			} else throw new Error(`Unsupported format .${ext}`);
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
				const mesh = child;
				if (!mesh.isMesh) return;
				meshBases.push({
					mesh,
					base: mesh.position.clone()
				});
			});
			measureAndFit(THREE, pivot);
			applyEditToScene();
			apiRef.current = {
				fit: (preset = "iso") => fitCamera(preset),
				applyEdit: applyEditToScene,
				setGridVisible: (v) => {
					if (grid) grid.visible = v;
				},
				setLighting: applyLighting
			};
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
			apiRef.current = null;
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
			renderer = null;
			controls = null;
			scene = null;
			camera = null;
			root = null;
			pivot = null;
			grid = null;
		};
	}, [target]);
	const patch = (partial) => setEdit((prev) => ({
		...prev,
		...partial
	}));
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
	(0, import_react.useEffect)(() => {
		const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);
	const slider = (label, value, min, max, step, onChange, suffix = "") => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular-nums text-fg",
				children: [Number.isInteger(step) ? value : value.toFixed(2), suffix]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "range",
			min,
			max,
			step,
			value,
			disabled: status !== "ready",
			onChange: (event) => onChange(Number(event.target.value)),
			className: "mt-1 w-full accent-[var(--accent,#6aa8ff)]",
			"aria-label": label
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: shellRef,
		className: "fixed inset-0 z-50 flex flex-col bg-bg/95",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `View ${target.name}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "3D print viewer + editor"
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
					className: "flex shrink-0 flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							type: "button",
							disabled: status !== "ready",
							onClick: () => apiRef.current?.fit("iso"),
							"aria-label": "Fit model",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Expand, { className: "size-3.5" }), "Fit"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							type: "button",
							disabled: status !== "ready",
							onClick: () => {
								setEdit({ ...DEFAULT_PRINT_EDIT });
								apiRef.current?.fit("iso");
							},
							"aria-label": "Reset transform and camera",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "Reset"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							type: "button",
							onClick: () => setPanelOpen((v) => !v),
							"aria-label": "Toggle editor panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-3.5" }), panelOpen ? "Hide editor" : "Editor"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							type: "button",
							onClick: () => void toggleFullscreen(),
							"aria-label": "Toggle fullscreen",
							children: [fullscreen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minimize2, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "size-3.5" }), fullscreen ? "Exit" : "Full"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							type: "button",
							onClick: onClose,
							"aria-label": "Close viewer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" }), "Close"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-0 min-w-0 flex-1",
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
						}),
						status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-1",
							children: [
								"iso",
								"front",
								"top",
								"side",
								"back"
							].map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "pointer-events-auto rounded-sm bg-bg/80 px-2 py-1 text-[11px] font-medium text-fg shadow-border hover:bg-elevated",
								onClick: () => apiRef.current?.fit(preset),
								children: preset
							}, preset))
						})
					]
				}), panelOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex w-full max-w-xs shrink-0 flex-col gap-3 overflow-y-auto border-l border-border bg-surface p-4 sm:w-72",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
							children: "View"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: edit.wireframe ? "default" : "secondary",
								disabled: status !== "ready",
								onClick: () => patch({ wireframe: !edit.wireframe }),
								children: "Wireframe"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: edit.showGrid ? "default" : "secondary",
								disabled: status !== "ready",
								onClick: () => patch({ showGrid: !edit.showGrid }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-3.5" }), "Grid"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 flex items-center gap-1 text-xs text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5" }), " Lighting"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 flex flex-wrap gap-1",
							children: [
								"studio",
								"bright",
								"soft",
								"contrast"
							].map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: edit.lighting === mode ? "default" : "secondary",
								disabled: status !== "ready",
								onClick: () => patch({ lighting: mode }),
								children: mode
							}, mode))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-3 block text-xs text-muted",
							children: ["Material color", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "color",
								value: edit.color,
								disabled: status !== "ready",
								onChange: (event) => patch({ color: event.target.value }),
								className: "mt-1 h-9 w-full cursor-pointer p-1",
								"aria-label": "Material color"
							})]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border pt-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
								children: "Transform"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[11px] text-subtle",
								children: "Saved locally for this model. Not a CAD suite — quick orientation for print checks."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 space-y-3",
								children: [
									slider("Scale", edit.scale, .1, 5, .05, (n) => patch({ scale: n }), "×"),
									slider("Rotate X", edit.rotX, -180, 180, 1, (n) => patch({ rotX: n }), "°"),
									slider("Rotate Y", edit.rotY, -180, 180, 1, (n) => patch({ rotY: n }), "°"),
									slider("Rotate Z", edit.rotZ, -180, 180, 1, (n) => patch({ rotZ: n }), "°"),
									slider("Move X", edit.posX, -100, 100, .5, (n) => patch({ posX: n })),
									slider("Move Y", edit.posY, -100, 100, .5, (n) => patch({ posY: n })),
									slider("Move Z", edit.posZ, -100, 100, .5, (n) => patch({ posZ: n })),
									slider("Explode parts", edit.explode, 0, 40, .5, (n) => patch({ explode: n }))
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: status !== "ready",
									onClick: () => patch({
										rotX: 0,
										rotY: 0,
										rotZ: 0,
										posX: 0,
										posY: 0,
										posZ: 0,
										scale: 1,
										explode: 0
									}),
									children: "Clear transform"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									disabled: status !== "ready",
									onClick: () => patch({ rotX: -90 }),
									title: "Common bed flat correction",
									children: "Flat on bed (−90° X)"
								})]
							})
						]
					})]
				})]
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
