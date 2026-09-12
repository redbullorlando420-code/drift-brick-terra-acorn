/** Best-effort offline save for adult embeds via local Companion + yt-dlp. */

export type OfflineSaveResult =
  | { ok: true; detail: string }
  | { ok: false; error: string; needs?: string[] };

export async function requestAdultOfflineSave(url: string): Promise<OfflineSaveResult> {
  const target = url.trim();
  if (!/^https:\/\//i.test(target)) return { ok: false, error: "No https URL to save." };
  try {
    const res = await fetch("http://127.0.0.1:43123/offline/save", {
      method: "POST",
      headers: { "content-type": "application/json", origin: window.location.origin },
      body: JSON.stringify({ url: target }),
      signal: AbortSignal.timeout(6000),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      needs?: string[];
      detail?: string;
      path?: string;
    };
    if (res.ok && data.ok) {
      return { ok: true, detail: data.detail || (data.path ? `Download started into ${data.path}` : "Download started.") };
    }
    return {
      ok: false,
      error: data.error || `Companion offline save unavailable (HTTP ${res.status}).`,
      needs: data.needs,
    };
  } catch {
    return {
      ok: false,
      error: "Reelcase Companion is not running. Start it locally to enable offline save.",
      needs: [
        "Start Reelcase Companion",
        "Install yt-dlp on PATH or set YT_DLP_PATH",
        "Set REELCASE_ALLOWED_ROOTS / optional REELCASE_DOWNLOAD_DIR",
      ],
    };
  }
}
