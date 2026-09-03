export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`reelcase.adults.v1:${pin}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function isPinShape(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
