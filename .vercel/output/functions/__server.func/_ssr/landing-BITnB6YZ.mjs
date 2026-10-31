import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $n as useLibrary } from "./store-0MIXEefC.mjs";
import { o as LibraryApp } from "./library-app-BzjSyqkW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/landing-BITnB6YZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LandingRoute() {
	const navigate = useNavigate();
	const setSource = useLibrary((state) => state.setSource);
	(0, import_react.useLayoutEffect)(() => {
		setSource("landing");
		navigate({
			to: "/",
			replace: true
		});
	}, [navigate, setSource]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryApp, {});
}
//#endregion
export { LandingRoute as component };
