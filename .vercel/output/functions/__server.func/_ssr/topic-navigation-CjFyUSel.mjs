import { Vt as useLibrary } from "./store-uZbLuJol.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/topic-navigation-CjFyUSel.js
/** Open a topic without yanking the user off Adults into Genres/Search. */
function openTopic(topic) {
	const clean = topic.trim().replace(/^#/, "");
	if (!clean) return;
	const state = useLibrary.getState();
	if (state.sourceId === "adults" || state.sourceId === "adult-fetishes") {
		state.setQuery("");
		state.setSource("adults");
		if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag: clean } }));
		return;
	}
	state.setQuery(clean);
	state.setSource("genres");
}
//#endregion
export { openTopic as t };
