import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { P as Rocket } from "../_libs/lucide-react.mjs";
import { Dt as Input, Ot as Button, tr as createLocalId } from "./library-app-CrsCDQmv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/private-web-shortcuts-section-BSJlEmXt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";
function PrivateWebShortcuts() {
	const [links, setLinks] = (0, import_react.useState)(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
			return Array.isArray(saved) ? saved.filter((item) => typeof item?.name === "string" && typeof item?.url === "string") : [];
		} catch {
			return [];
		}
	});
	const [name, setName] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const save = (next) => {
		setLinks(next);
		localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next));
	};
	const add = () => {
		try {
			const parsed = new URL(url);
			if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
			save([...links, {
				id: createLocalId("link-"),
				name: name.trim() || parsed.hostname,
				url: parsed.toString()
			}]);
			setName("");
			setUrl("");
		} catch {
			setUrl("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 rounded-xl bg-elevated p-5 shadow-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
				children: "Private web shortcuts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-2xl text-fg",
				children: "Your saved destinations"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs leading-5 text-muted",
				children: "Add only links you trust. These are saved only in this browser and open when you press Launch."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Name",
						"aria-label": "Shortcut name"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: url,
						onChange: (event) => setUrl(event.target.value),
						placeholder: "https://…",
						"aria-label": "Shortcut URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						disabled: !url.trim(),
						onClick: add,
						children: "Save shortcut"
					})
				]
			}),
			links.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-2",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium text-fg",
								children: link.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: link.url
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => window.location.assign(link.url),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rocket, { className: "size-3" }), "Launch"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => save(links.filter((item) => item.id !== link.id)),
							children: "Remove"
						})
					]
				}, link.id))
			})
		]
	});
}
//#endregion
export { PrivateWebShortcuts };
