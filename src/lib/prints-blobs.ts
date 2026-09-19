/** Local IndexedDB store for 3D print file bytes (viewer only). Metadata stays in localStorage. */

const DB_NAME = "reelcase-prints";
const DB_VERSION = 1;
const STORE = "blobs";
const MAX_BLOBS = 32;
const MAX_BYTES = 48 * 1024 * 1024; // 48 MB per file
const MAX_TOTAL_BYTES = 192 * 1024 * 1024; // 192 MB across all print blobs

export type PrintBlobRecord = {
  id: string;
  name: string;
  path: string;
  mime: string;
  size: number;
  addedAt: number;
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("prints IndexedDB open failed"));
  });
}

export function printFileId(file: File): string {
  return `print:${file.name.normalize("NFKC").toLowerCase()}:${file.size}:${file.lastModified}`;
}

export function isViewablePrintName(name: string): boolean {
  return /\.(stl|obj|glb|gltf|3mf)$/i.test(name);
}

export async function savePrintBlob(file: File, id = printFileId(file)): Promise<string | null> {
  if (!isViewablePrintName(file.name)) return null;
  if (file.size <= 0 || file.size > MAX_BYTES) return null;
  const record: PrintBlobRecord = {
    id,
    name: file.name,
    path: file.webkitRelativePath || file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    addedAt: Date.now(),
    blob: file,
  };
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  await prunePrintBlobs();
  return id;
}

export async function loadPrintBlob(id: string): Promise<PrintBlobRecord | undefined> {
  try {
    const db = await openDb();
    try {
      return await new Promise<PrintBlobRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(id);
        req.onsuccess = () => resolve(req.result as PrintBlobRecord | undefined);
        req.onerror = () => reject(req.error);
      });
    } finally {
      db.close();
    }
  } catch {
    return undefined;
  }
}

export async function deletePrintBlob(id: string): Promise<void> {
  try {
    const db = await openDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch {
    /* storage unavailable */
  }
}

async function prunePrintBlobs(): Promise<void> {
  try {
    const db = await openDb();
    try {
      const all = await new Promise<PrintBlobRecord[]>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).getAll();
        req.onsuccess = () => resolve((req.result as PrintBlobRecord[]) ?? []);
        req.onerror = () => reject(req.error);
      });
      const ordered = [...all].sort((a, b) => a.addedAt - b.addedAt);
      let total = ordered.reduce((sum, row) => sum + (row.size || 0), 0);
      const drop: PrintBlobRecord[] = [];
      while (ordered.length - drop.length > MAX_BLOBS || total > MAX_TOTAL_BYTES) {
        const oldest = ordered[drop.length];
        if (!oldest) break;
        drop.push(oldest);
        total -= oldest.size || 0;
      }
      if (!drop.length) return;
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        for (const row of drop) store.delete(row.id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  } catch {
    /* ignore prune failures */
  }
}


export type PrintViewerTarget = {
  name: string;
  path: string;
  size: number;
  sampleSrc?: string;
  blobId?: string;
};
