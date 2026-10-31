import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { Kt as Clapperboard, Rt as ExternalLink } from "../_libs/lucide-react.mjs";
import { Bt as Input } from "./library-app-BzjSyqkW.mjs";
import { l as ServiceLink, s as HubShell } from "./hub-shared-4nVqg49O.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/streaming-section-BOGJCsP_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StreamingSection() {
	const [ratingQuery, setRatingQuery] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(HubShell, {
		eyebrow: "Movie streaming",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "size-4" }),
		title: "Streaming destinations",
		copy: "Keep watch sources separate from shopping. These official services and public collections open in their own sites.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-lg bg-elevated p-5 shadow-border",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium tracking-[0.14em] text-accent uppercase",
					children: "External rating search"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Look up a title on the source you trust. Searches open on the official site; Realhub does not copy ratings into your local catalog."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: ratingQuery,
						onChange: (event) => setRatingQuery(event.target.value),
						placeholder: "Search an anime, movie, or series",
						"aria-label": "External rating search"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							{
								label: "AniList",
								url: "https://anilist.co/search/anime?search="
							},
							{
								label: "AniDB",
								url: "https://anidb.net/anime/?adb.search="
							},
							{
								label: "Rotten Tomatoes",
								url: "https://www.rottentomatoes.com/search?search="
							}
						].map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `${source.url}${encodeURIComponent(ratingQuery.trim())}`,
							target: "_blank",
							rel: "noreferrer",
							className: "inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border",
							children: [source.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "ml-2 size-3.5" })]
						}, source.label))
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					name: "Netflix",
					href: "https://www.netflix.com/",
					copy: "Movies & series"
				},
				{
					name: "Hulu",
					href: "https://www.hulu.com/",
					copy: "TV & films"
				},
				{
					name: "Crunchyroll",
					href: "https://www.crunchyroll.com/",
					copy: "Anime streaming"
				},
				{
					name: "Kick",
					href: "https://kick.com/",
					copy: "Live streaming"
				},
				{
					name: "Vimeo",
					href: "https://vimeo.com/",
					copy: "Creator video"
				},
				{
					name: "Nebula",
					href: "https://nebula.tv/",
					copy: "Independent creators"
				},
				{
					name: "Plex",
					href: "https://www.plex.tv/",
					copy: "Personal media & streaming"
				},
				{
					name: "Internet Archive",
					href: "https://archive.org/details/feature_films",
					copy: "Open & public-domain films"
				},
				{
					name: "Old Time Movies",
					href: "https://archive.org/details/moviesandfilms",
					copy: "Classic and public-domain cinema"
				},
				{
					name: "Library of Congress",
					href: "https://www.loc.gov/film-and-videos/",
					copy: "Historic films and moving images"
				},
				{
					name: "Open Culture",
					href: "https://www.openculture.com/freemoviesonline",
					copy: "Free film collections and courses"
				},
				{
					name: "AniList",
					href: "https://anilist.co/",
					copy: "Anime discovery & ratings"
				},
				{
					name: "AniDB",
					href: "https://anidb.net/",
					copy: "Anime database"
				},
				{
					name: "Rotten Tomatoes",
					href: "https://www.rottentomatoes.com/",
					copy: "Critic & audience ratings"
				}
			].map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceLink, { ...service }, service.name))
		})]
	});
}
//#endregion
export { StreamingSection };
