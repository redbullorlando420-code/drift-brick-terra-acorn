import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { ct as diagnosticText, g as DIAGNOSTIC_EXCLUDED } from "./live-rooms-DInVyvi_.mjs";
import { Vt as Button } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diagnostic-export-preview-4FHuJD2l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DiagnosticExportPreview({ kind, data }) {
	const [text, setText] = (0, import_react.useState)(""), [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setText("");
		setError("");
	}, [data]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "mt-3 rounded-md border border-border p-3",
		"aria-label": "Diagnostic privacy preview",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
				className: "min-h-11 cursor-pointer text-sm font-medium text-fg",
				children: "Shareable diagnostic · privacy preview"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-5 text-muted",
				children: "Only listed status categories and measurements are exported. Personal backups are separate and contain private data."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted",
				children: DIAGNOSTIC_EXCLUDED.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Excluded: ", item] }, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-3 min-h-11",
				onClick: () => {
					try {
						setText(diagnosticText(kind, data));
						setError("");
					} catch {
						setError("This diagnostic could not be prepared. No raw data was exported.");
					}
				},
				children: "Preview diagnostic JSON"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-sm text-accent",
				children: error
			}),
			text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				"aria-label": "Shareable diagnostic JSON",
				readOnly: true,
				value: text,
				className: "mt-3 min-h-44 w-full resize-y rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg"
			})
		]
	});
}
//#endregion
export { DiagnosticExportPreview as t };
