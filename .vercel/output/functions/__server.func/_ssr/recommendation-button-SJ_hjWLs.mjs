import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { vt as useRecommendationExposure } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recommendation-button-SJ_hjWLs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RecommendationButton({ video, surface = "browse", enabled = true, ...props }) {
	const ref = (0, import_react.useRef)(null);
	useRecommendationExposure(ref, video, surface, enabled);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		ref,
		"data-recommendation-card": enabled ? video.id : void 0
	});
}
//#endregion
export { RecommendationButton as t };
