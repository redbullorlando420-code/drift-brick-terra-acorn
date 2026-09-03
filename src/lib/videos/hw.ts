export type HwInfo = {
  supported: boolean;
  powerEfficient: boolean;
  smooth: boolean;
};

const cache = new Map<string, HwInfo>();

export async function probeHardwareDecode(
  mime: string,
  width = 1920,
  height = 1080,
): Promise<HwInfo> {
  const key = `${mime}:${width}x${height}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const fallback: HwInfo = { supported: true, powerEfficient: false, smooth: true };
  const mc = (
    navigator as Navigator & {
      mediaCapabilities?: {
        decodingInfo: (config: {
          type: "file" | "media-source";
          video: {
            contentType: string;
            width: number;
            height: number;
            bitrate: number;
            framerate: number;
            hardwareAcceleration?: "prefer-hardware" | "prefer-software" | "no-preference";
          };
        }) => Promise<{
          supported: boolean;
          powerEfficient: boolean;
          smooth: boolean;
        }>;
      };
    }
  ).mediaCapabilities;

  if (!mc?.decodingInfo) {
    cache.set(key, fallback);
    return fallback;
  }

  const contentType = mime.includes("codecs")
    ? mime
    : mime === "video/webm"
      ? 'video/webm; codecs="vp09.00.10.08"'
      : 'video/mp4; codecs="avc1.640028"';

  try {
    const hw = await mc.decodingInfo({
      type: "file",
      video: {
        contentType,
        width,
        height,
        bitrate: 8_000_000,
        framerate: 30,
        hardwareAcceleration: "prefer-hardware",
      },
    });
    const info: HwInfo = {
      supported: hw.supported,
      powerEfficient: hw.powerEfficient,
      smooth: hw.smooth,
    };
    cache.set(key, info);
    return info;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}

export function attachFrameCallback(
  video: HTMLVideoElement,
  onFrame: (time: number) => void,
): () => void {
  const el = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (
      cb: (now: number, meta: { mediaTime: number }) => void,
    ) => number;
    cancelVideoFrameCallback?: (id: number) => void;
  };
  if (typeof el.requestVideoFrameCallback !== "function") {
    const onTime = () => onFrame(video.currentTime);
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }
  let id = 0;
  let alive = true;
  const loop = (_now: number, meta: { mediaTime: number }) => {
    if (!alive) return;
    onFrame(meta.mediaTime);
    id = el.requestVideoFrameCallback!(loop);
  };
  id = el.requestVideoFrameCallback(loop);
  return () => {
    alive = false;
    el.cancelVideoFrameCallback?.(id);
  };
}

export async function bitmapFromVideo(
  video: HTMLVideoElement,
): Promise<ImageBitmap | null> {
  try {
    if (typeof createImageBitmap === "function" && video.videoWidth) {
      return await createImageBitmap(video);
    }
  } catch {
    return null;
  }
  return null;
}
