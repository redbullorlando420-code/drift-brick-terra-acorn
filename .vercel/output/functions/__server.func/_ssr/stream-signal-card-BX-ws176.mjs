import { t as validateSignalProfile } from "./stream-signal-section-CLmC1Ihv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stream-signal-card-BX-ws176.js
var STORY_SIZE = {
	width: 1080,
	height: 1920
};
var STORY_COLORS = {
	background: "#151721",
	paper: "#c7bceb",
	ink: "#242235",
	light: "#f2eefb",
	action: "#d8efa0"
};
function graphemes(text) {
	return typeof Intl.Segmenter === "function" ? [...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(text)].map((row) => row.segment) : Array.from(text);
}
function wrap(text, width, size, weight, measure) {
	const rows = [];
	let current = "";
	for (const char of graphemes(text.replace(/\s+/gu, " ").trim())) if (current && measure(current + char, size, weight) > width) {
		rows.push(current.trim());
		current = char;
	} else current += char;
	if (current) rows.push(current.trim());
	return rows;
}
function storyContrast(a, b) {
	const luminance = (hex) => [
		1,
		3,
		5
	].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255).map((c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [
		.2126,
		.7152,
		.0722
	][i], 0);
	const x = luminance(a), y = luminance(b);
	return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
/** One measured layout drives preview and PNG. Text stays in fixed safe regions;
* shortened grapheme sequences are disclosed before the download action. */
function layoutSignalStory(pack, measure) {
	if (Object.keys(validateSignalProfile(pack.profile)).length) throw Error("Correct this pack’s channel links and details before exporting its Story.");
	const p = pack.profile, warnings = [];
	const fit = (key, label, text, x, y, width, max, size, minimum, weight, lineHeight) => {
		let rows = wrap(text, width, size, weight, measure);
		while (size > minimum && (rows.length > max || rows.some((row) => measure(row, size, weight) > width))) {
			size -= 2;
			rows = wrap(text, width, size, weight, measure);
		}
		const shortened = rows.length > max || rows.some((row) => measure(row, size, weight) > width);
		if (shortened) {
			rows = rows.slice(0, max).map((row, i) => {
				const chars = graphemes(row), suffix = i === max - 1 || measure(row, size, weight) > width ? "…" : "";
				while (chars.length && measure(chars.join("") + suffix, size, weight) > width) chars.pop();
				return chars.join("") + suffix;
			});
			warnings.push(label + " is shortened in the image. The caption keeps its full text.");
		}
		return {
			key,
			label,
			text,
			lines: rows,
			size,
			weight,
			x,
			y,
			lineHeight,
			shortened
		};
	};
	const fields = [
		fit("creator", "Creator name", p.creator, 112, 320, 850, 2, 84, 58, 800, 92),
		fit("title", "Stream title", p.title, 152, 755, 770, 3, 64, 40, 700, 76),
		fit("game", "Game or category", p.game, 152, 1040, 770, 2, 42, 30, 500, 52),
		fit("message", "Community message", p.message, 112, 1260, 850, 4, 36, 28, 500, 46),
		fit("twitch", "Twitch link", "TWITCH  " + p.twitch.replace("https://", ""), 112, 1530, 850, 2, 29, 25, 600, 36),
		fit("youtube", "YouTube link", "YOUTUBE  " + p.youtube.replace("https://", ""), 112, 1640, 850, 2, 29, 25, 600, 36)
	];
	return {
		...STORY_SIZE,
		fields,
		warnings,
		contrast: [
			{
				label: "Main text on lavender",
				ratio: storyContrast(STORY_COLORS.ink, STORY_COLORS.paper)
			},
			{
				label: "Title on dark panel",
				ratio: storyContrast(STORY_COLORS.light, STORY_COLORS.ink)
			},
			{
				label: "Category on dark panel",
				ratio: storyContrast(STORY_COLORS.paper, STORY_COLORS.ink)
			},
			{
				label: "Lime label on dark panel",
				ratio: storyContrast(STORY_COLORS.action, STORY_COLORS.ink)
			}
		]
	};
}
function signalStoryCaption(pack) {
	if (Object.keys(validateSignalProfile(pack.profile)).length) throw Error("Use valid stream channel links before exporting a caption.");
	const p = pack.profile;
	return p.creator + " is going live!\n" + p.title + "\nPlaying " + p.game + "\n\n" + p.message + "\n\nTwitch: " + p.twitch + "\nYouTube: " + p.youtube + "\n\nImage description: A lavender Stream Signal announcement card with the creator, stream title, game and community message. The full announcement and both stream destinations are above.\n\nUpload the PNG in Instagram, then add Stickers → Link using a stream URL. Pixels are not clickable links. For a feed post, use a profile link where available. Sharing remains manual.\n";
}
async function prepareSignalStoryCard(pack) {
	await document.fonts.ready;
	const canvas = document.createElement("canvas");
	Object.assign(canvas, STORY_SIZE);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw Error("Your browser could not create the Story image.");
	const layout = layoutSignalStory(pack, (text, size, weight) => {
		ctx.font = weight + " " + size + "px Figtree, sans-serif";
		return ctx.measureText(text).width;
	});
	ctx.fillStyle = STORY_COLORS.background;
	ctx.fillRect(0, 0, 1080, 1920);
	ctx.fillStyle = STORY_COLORS.paper;
	ctx.fillRect(56, 56, 968, 1808);
	const text = (value, x, y, size, weight, color) => {
		ctx.fillStyle = color;
		ctx.font = weight + " " + size + "px Figtree, sans-serif";
		ctx.fillText(value, x, y);
	};
	text("STREAM SIGNAL / LIVE ANNOUNCEMENT", 112, 150, 30, 600, STORY_COLORS.ink);
	text("IS GOING LIVE", 112, 525, 36, 600, STORY_COLORS.ink);
	ctx.fillStyle = STORY_COLORS.ink;
	ctx.fillRect(112, 590, 856, 570);
	text("ON THE GRID", 152, 660, 30, 600, STORY_COLORS.action);
	for (const f of layout.fields) f.lines.forEach((line, index) => text(line, f.x, f.y + index * f.lineHeight, f.size, f.weight, f.key === "title" ? STORY_COLORS.light : f.key === "game" ? STORY_COLORS.paper : STORY_COLORS.ink));
	text("Join the community. Watch the next lap.", 112, 1780, 26, 500, STORY_COLORS.ink);
	return {
		blob: await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(Error("Could not encode the PNG.")), "image/png")),
		layout,
		caption: signalStoryCaption(pack)
	};
}
//#endregion
export { prepareSignalStoryCard };
