import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { O as Search } from "../_libs/lucide-react.mjs";
import { s as HubShell } from "./hub-shared-CSaQ1YXN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/find-phone-section-CQrYbJY4.js
var import_jsx_runtime = require_jsx_runtime();
function FindPhoneSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Device recovery",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" }),
		title: "Find your phone.",
		copy: "Open your device maker’s official locator. Realhub does not collect location data or keep a copy of your account credentials.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.google.com/android/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "Android"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My Device"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Google’s official Android device locator in a secure new tab."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "https://www.icloud.com/find/",
				target: "_blank",
				rel: "noopener noreferrer",
				className: "rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
						children: "iPhone"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-2xl text-fg",
						children: "Find My"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Open Apple’s official device locator in a secure new tab."
					})
				]
			})]
		})
	});
}
//#endregion
export { FindPhoneSection };
