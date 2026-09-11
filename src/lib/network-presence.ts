export type NetworkDevice = {
  id: string;
  label: string;
  kind: "desktop" | "mobile";
  lastSeen: number;
};

const DEVICE_ID_KEY = "reelcase.network-device.v1";

function newDeviceId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // HTTP home-network pages are not secure contexts in every browser, so
  // randomUUID may be unavailable. This is an ephemeral presence key, never a
  // credential or security boundary.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (letter) => {
    const value = Math.floor(Math.random() * 16);
    return (letter === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

function getDeviceId() {
  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY);
    if (saved && /^[a-z0-9-]{8,64}$/i.test(saved)) return saved;
    const next = newDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return newDeviceId();
  }
}

function deviceDetails() {
  const mobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
  const browser = /edg\//i.test(navigator.userAgent) ? "Edge" : /firefox\//i.test(navigator.userAgent) ? "Firefox" : /chrome\//i.test(navigator.userAgent) ? "Chrome" : "Browser";
  return { label: `${mobile ? "Mobile" : "Desktop"} · ${browser}`, kind: mobile ? "mobile" as const : "desktop" as const };
}

export function getNetworkDeviceId() { return getDeviceId(); }

export async function announceNetworkPresence() {
  const details = deviceDetails();
  const response = await fetch("/api/network-presence", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: getDeviceId(), ...details }),
    keepalive: true,
  });
  if (!response.ok) throw new Error("Network presence could not be updated");
  return response.json() as Promise<{ devices: NetworkDevice[] }>;
}

export async function listNetworkDevices() {
  const response = await fetch("/api/network-presence", { cache: "no-store" });
  if (!response.ok) throw new Error("Network devices could not be read");
  return response.json() as Promise<{ devices: NetworkDevice[] }>;
}
