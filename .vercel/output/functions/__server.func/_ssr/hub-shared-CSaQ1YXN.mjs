import { t as cn } from "./utils-Cq6DDHIb.mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Pt as ExternalLink } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hub-shared-CSaQ1YXN.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"data-slot": "card",
		className: cn("flex flex-col gap-5 rounded-xl border border-border bg-surface py-5 text-fg shadow-sm", className),
		...props
	});
}
function CardHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card-header",
		className: cn("grid gap-2 px-5", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		"data-slot": "card-title",
		className: cn("font-display text-xl font-semibold leading-tight", className),
		...props
	});
}
function CardDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		"data-slot": "card-description",
		className: cn("text-sm leading-6 text-muted", className),
		...props
	});
}
function CardContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card-content",
		className: cn("space-y-4 px-5", className),
		...props
	});
}
function CardFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "card-footer",
		className: cn("flex flex-wrap items-center gap-2 px-5", className),
		...props
	});
}
var HUB_KEY = "reelcase.hub.v1";
function readHub() {
	const samples = [
		{
			name: "Calibration cube.stl",
			path: "Realhub samples/Calibration cube.stl",
			size: 2618,
			addedAt: 1,
			sampleSrc: "/samples/prints/calibration-cube.stl"
		},
		{
			name: "Cable clip.3mf",
			path: "Realhub samples/Cable clip.3mf",
			size: 94100,
			addedAt: 2
		},
		{
			name: "OpenSCAD phone stand.obj",
			path: "Open-source examples/OpenSCAD phone stand.obj",
			size: 318,
			addedAt: 4,
			sampleSrc: "/samples/prints/phone-stand.obj"
		},
		{
			name: "Gridfinity bin.3mf",
			path: "Open-source examples/Gridfinity bin.3mf",
			size: 784200,
			addedAt: 5
		},
		{
			name: "Benchy calibration.obj",
			path: "Open-source examples/Benchy calibration.obj",
			size: 236,
			addedAt: 6,
			sampleSrc: "/samples/prints/benchy.obj"
		},
		{
			name: "Parametric drawer label.stl",
			path: "Open-source examples/Parametric drawer label.stl",
			size: 229100,
			addedAt: 7
		},
		{
			name: "Tool tray.gcode",
			path: "Realhub samples/Tool tray.gcode",
			size: 1248e3,
			addedAt: 3
		}
	];
	try {
		const raw = localStorage.getItem(HUB_KEY);
		if (!raw) return {
			prints: samples,
			games: []
		};
		return JSON.parse(raw);
	} catch {
		return {
			prints: samples,
			games: []
		};
	}
}
function writeHub(next) {
	localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function bytes(value) {
	if (value <= 0) return "0 B";
	return value < 1048576 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`;
}
function downloadCsv(rows, filename) {
	const quote = (value) => `"${String(value).replaceAll("\"", "\"\"")}"`;
	const body = rows.map((row) => row.map(quote).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function HubShell({ eyebrow, icon, title, copy, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase",
				children: [
					icon,
					" ",
					eyebrow
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base",
				children: copy
			}),
			children
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-4 py-4 shadow-border",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xl tabular-nums text-fg",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: label
		})]
	});
}
function ServiceLink({ name, href, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		className: "rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl text-fg",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: copy
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent",
				children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })]
			})
		]
	});
}
function InfoCard({ icon, title, copy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "gap-0 bg-elevated",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl text-fg",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: copy
			})
		] })
	});
}
//#endregion
export { CardHeader as a, InfoCard as c, bytes as d, downloadCsv as f, CardFooter as i, ServiceLink as l, writeHub as m, CardContent as n, CardTitle as o, readHub as p, CardDescription as r, HubShell as s, Card as t, Stat as u };
