import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Kt as Clapperboard } from "../_libs/lucide-react.mjs";
import { s as HubShell } from "./hub-shared-4nVqg49O.mjs";
import { t as TopicLinks } from "./topic-links-DtWaw5yn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/genre-section-BUlIAzng.js
var import_jsx_runtime = require_jsx_runtime();
function GenreSection() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HubShell, {
		eyebrow: "Topic explorer",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Explore ideas across sources.",
		copy: "Follow useful topics across local media, YouTube and Twitch. Each connection shows its saved tag or title evidence.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopicLinks, { explorer: true })
	});
}
//#endregion
export { GenreSection };
