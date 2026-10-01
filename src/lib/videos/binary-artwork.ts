const sizes = new Map<string, number>();
export const binaryArtworkSnapshot = () => ({ urls: sizes.size, bytes: [...sizes.values()].reduce((sum, size) => sum + size, 0) });
export const artworkBytes = (value: string | Blob) => typeof value === 'string' ? sizes.get(value) ?? value.length * 2 : value.size;
export function artworkUrl(value: string | Blob) {
  if (typeof value === 'string') return value;
  const url = URL.createObjectURL(value); sizes.set(url, value.size); return url;
}
export function releaseArtwork(url: string) {
  if (sizes.delete(url)) URL.revokeObjectURL(url);
}
/** Old data URLs remain readable; native decoding avoids a base64 JS byte loop. */
export async function binaryArtwork(value: string | Blob): Promise<string | Blob> {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) return value;
  try { return await (await fetch(value)).blob(); } catch { return value; }
}
/** Only the optional companion mirror needs base64, never the live card cache. */
export function artworkDataUrl(value: string | Blob): Promise<string> {
  if (typeof value === 'string') return Promise.resolve(value);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(value);
  });
}
