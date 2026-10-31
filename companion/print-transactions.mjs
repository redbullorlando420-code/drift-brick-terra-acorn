import {
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  existsSync,
  statSync,
  createWriteStream,
  createReadStream,
  linkSync,
  openSync,
  readSync,
  closeSync,
  fstatSync,
} from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
const LIMIT = 48 * 1024 * 1024;
const validName = (name) =>
  typeof name === "string" &&
  name.length <= 120 &&
  /^[a-z0-9][a-z0-9 _().-]*\.glb$/i.test(name) &&
  !/[. ]\./.test(name) &&
  !/[. ]$/.test(name) &&
  !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name);
const fileIdentity = (p) => {
  const s = statSync(p, { bigint: true });
  return [s.dev, s.ino, s.birthtimeNs].map(String).join(":");
};
export function createPrintTransactions({
  authority,
  receiptFile,
  defaultDirectory,
  now = Date.now,
  linkFile = linkSync,
  saveReceipt = renameSync,
}) {
  let rows = [],
    persistent = true,
    closed = false;
  const pending = new Map();
  try {
    if (statSync(receiptFile).size > 256 * 1024) throw Error();
    const data = JSON.parse(readFileSync(receiptFile, "utf8"));
    if (data.version !== 1 || !Array.isArray(data.rows)) throw Error();
    rows = data.rows
      .slice(0, 40)
      .filter(
        (r) =>
          r &&
          /^[a-f0-9-]{36}$/.test(r.id) &&
          typeof r.path === "string" &&
          r.path.length <= 4096 &&
          validName(basename(r.path)) &&
          Number.isSafeInteger(r.bytes) &&
          r.bytes > 0 &&
          r.bytes <= LIMIT &&
          /^[a-f0-9]{64}$/.test(r.sha256) &&
          Number.isSafeInteger(r.at) &&
          [
            "review",
            "uploading",
            "committing",
            "done",
            "interrupted",
            "cancelled",
            "error",
          ].includes(r.status),
      )
      .map((r) => ({
        id: r.id,
        path: r.path,
        bytes: r.bytes,
        sha256: r.sha256,
        at: r.at,
        tempIdentity:
          typeof r.tempIdentity === "string" && /^\d+:\d+:-?\d+$/.test(r.tempIdentity)
            ? r.tempIdentity
            : null,
        status: r.status === "done" || r.status === "cancelled" ? r.status : "interrupted",
        phase:
          r.status === "committing" ? "committing" : r.phase === "committing" ? "committing" : null,
      }));
  } catch (e) {
    if (e.code !== "ENOENT") persistent = false;
  }
  const save = () => {
    if (!persistent)
      throw Error(
        "Print transaction history is unavailable. Preserve the local receipt file and check Companion storage.",
      );
    const temp = receiptFile + "." + randomUUID() + ".tmp";
    try {
      writeFileSync(temp, JSON.stringify({ version: 1, rows }), { flag: "wx" });
      saveReceipt(temp, receiptFile);
    } catch {
      throw Error("Print transaction receipt could not be saved. Your original file is unchanged.");
    } finally {
      try {
        unlinkSync(temp);
      } catch {}
    }
  };
  const expose = (row) => ({
    id: row.id,
    path: row.path,
    name: basename(row.path),
    bytes: row.bytes,
    sha256: row.sha256,
    at: row.at,
    status: row.status,
    persistent,
    detail:
      row.status === "done"
        ? "Saved a verified new copy. The original is unchanged."
        : row.status === "review"
          ? "Review this new destination before saving."
          : row.status === "uploading"
            ? "Receiving the new copy."
            : row.status === "cancelled"
              ? "Save cancelled. The original is unchanged."
              : "Save is unconfirmed. Keep the editor draft; check status or prepare a new save.",
  });
  const removeTemp = (row, access) => {
    const temp = join(dirname(row.path), ".realhub-print-" + row.id + ".tmp");
    try {
      access?.assert(temp);
      if (row.tempIdentity && authority.check(temp) && fileIdentity(temp) === row.tempIdentity)
        unlinkSync(temp);
    } catch {}
  };
  const release = (id) => {
    const item = pending.get(id);
    if (!item) return;
    clearTimeout(item.timer);
    item.access.release();
    pending.delete(id);
  };
  const retire = (row, status) => {
    const item = pending.get(row.id);
    if (item) {
      item.controller.abort();
      if (!item.uploading) {
        removeTemp(row, item.access);
        release(row.id);
      }
    }
    if (row.status !== "done") {
      row.status = status;
      try {
        save();
      } catch {}
    }
  };
  const digest = async (file, access) => {
    const s = statSync(file);
    if (!s.isFile() || s.size > LIMIT) throw Error();
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(file, { highWaterMark: 65536 })) {
      access.assert(file);
      hash.update(chunk);
    }
    access.assert(file);
    return hash.digest("hex");
  };
  const status = async (id) => {
    const row = rows.find((r) => r.id === id);
    if (!row) throw Error("Print save receipt not found. Prepare a new save.");
    let access,
      verified = false;
    const wasDone = row.status === "done";
    if (wasDone || row.phase === "committing")
      try {
        access = authority.lease(dirname(row.path));
        access.assert(row.path);
        if (statSync(row.path).size !== row.bytes) throw Error();
        const temp = join(dirname(row.path), ".realhub-print-" + row.id + ".tmp");
        if (!wasDone && (!existsSync(temp) || fileIdentity(temp) !== fileIdentity(row.path)))
          throw Error();
        if ((await digest(row.path, access)) !== row.sha256) throw Error();
        if (!wasDone) {
          row.status = "done";
          save();
          row.phase = null;
        }
        verified = true;
        removeTemp(row, access);
        release(row.id);
      } catch {
        if (!wasDone) {
          row.status = "interrupted";
          row.phase = "committing";
        }
      } finally {
        access?.release();
      }
    if (wasDone && !verified)
      return {
        ...expose(row),
        status: "interrupted",
        detail:
          "The saved copy is unavailable or no longer approved. Keep your editor draft and check the destination.",
      };
    return expose(row);
  };
  return {
    folders: () => {
      const configured = defaultDirectory?.(),
        paths = authority.activePaths();
      return [
        ...new Set([
          ...(configured && authority.check(configured) ? [authority.check(configured)] : []),
          ...paths,
        ]),
      ].slice(0, 64);
    },
    prepare(body) {
      if (closed || !persistent)
        throw Error("Print saving is unavailable. Check Companion storage.");
      if (
        !validName(body.name) ||
        !Number.isSafeInteger(body.bytes) ||
        body.bytes < 1 ||
        body.bytes > LIMIT ||
        typeof body.sha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(body.sha256)
      )
        throw Error("Choose a GLB filename and a model within the 48 MiB save limit.");
      if (pending.size >= 8)
        throw Error("Too many print saves are waiting for review. Cancel an older save first.");
      const dir = authority.check(body.dir || defaultDirectory?.() || authority.activePaths()[0]);
      if (!dir || !statSync(dir).isDirectory())
        throw Error("Choose an existing approved destination folder.");
      const target = resolve(dir, body.name);
      authority.assertWrite(target);
      if (existsSync(target))
        throw Error(
          "That filename already exists. Choose a new name; existing files are never overwritten.",
        );
      const access = authority.lease(dir),
        controller = new AbortController(),
        row = {
          id: randomUUID(),
          path: target,
          bytes: body.bytes,
          sha256: body.sha256,
          at: now(),
          status: "review",
          phase: null,
        };
      let dropped;
      if (rows.length >= 40) {
        const index = rows.findLastIndex((r) => !pending.has(r.id));
        if (index < 0) {
          access.release();
          throw Error("Print save history is full.");
        }
        dropped = { index, row: rows.splice(index, 1)[0] };
      }
      rows.unshift(row);
      try {
        save();
      } catch (e) {
        rows.shift();
        if (dropped) rows.splice(dropped.index, 0, dropped.row);
        access.release();
        throw e;
      }
      const item = {
        access,
        controller,
        uploading: false,
        timer: setTimeout(() => retire(row, "interrupted"), 5 * 60_000),
      };
      item.timer.unref?.();
      pending.set(row.id, item);
      access.signal.addEventListener("abort", () => retire(row, "interrupted"), { once: true });
      return expose(row);
    },
    async commit(id, stream) {
      const row = rows.find((r) => r.id === id);
      if (row?.status === "done") return status(id);
      const item = pending.get(id);
      if (!row || !item || item.uploading || row.status !== "review" || closed)
        throw Error(
          "This save review expired or was interrupted. Keep the draft and prepare a new save.",
        );
      if ([...pending.values()].filter((p) => p.uploading).length >= 2)
        throw Error("Another print save is busy. Wait before uploading.");
      const { access, controller } = item,
        temp = join(dirname(row.path), ".realhub-print-" + id + ".tmp");
      let linked = false,
        uploadFd;
      try {
        access.assert(row.path, { write: true });
        if (existsSync(row.path)) throw Error("Destination exists. Choose another filename.");
        access.assert(temp, { write: true });
        uploadFd = openSync(temp, "wx", 0o600);
        const tempStat = fstatSync(uploadFd, { bigint: true });
        row.tempIdentity = [tempStat.dev, tempStat.ino, tempStat.birthtimeNs].map(String).join(":");
        item.uploading = true;
        row.status = "uploading";
        save();
        const hash = createHash("sha256");
        let bytes = 0;
        const check = new Transform({
          transform(chunk, encoding, done) {
            try {
              access.assert(temp, { write: true });
              bytes += chunk.length;
              if (bytes > row.bytes || bytes > LIMIT)
                throw Error("The print upload exceeds its reviewed size.");
              hash.update(chunk);
              done(null, chunk);
            } catch (e) {
              done(e);
            }
          },
        });
        const destination = createWriteStream(temp, {
          fd: uploadFd,
          autoClose: true,
          highWaterMark: 65536,
        });
        uploadFd = undefined;
        await pipeline(stream, check, destination, {
          signal: AbortSignal.any([access.signal, controller.signal]),
        });
        access.assert(temp);
        if (fileIdentity(temp) !== row.tempIdentity)
          throw Error("The temporary print file changed.");
        access.assert(row.path, { write: true });
        if (bytes !== row.bytes || hash.digest("hex") !== row.sha256)
          throw Error("Print upload checksum or size did not match the review.");
        const header = Buffer.alloc(20),
          fd = openSync(temp, "r");
        try {
          if (
            readSync(fd, header, 0, 20, 0) !== 20 ||
            header.readUInt32LE(0) !== 0x46546c67 ||
            header.readUInt32LE(4) !== 2 ||
            header.readUInt32LE(8) !== bytes ||
            header.readUInt32LE(16) !== 0x4e4f534a
          )
            throw Error();
          const jsonBytes = header.readUInt32LE(12);
          if (
            jsonBytes < 4 ||
            jsonBytes > 4 * 1024 * 1024 ||
            jsonBytes % 4 ||
            20 + jsonBytes > bytes
          )
            throw Error();
          const json = Buffer.alloc(jsonBytes);
          if (readSync(fd, json, 0, jsonBytes, 20) !== jsonBytes) throw Error();
          const data = JSON.parse(json.toString("utf8"));
          if (
            data.asset?.version !== "2.0" ||
            !Array.isArray(data.meshes) ||
            !data.meshes.length ||
            !Array.isArray(data.scenes)
          )
            throw Error();
          let position = 20 + jsonBytes,
            chunks = 0;
          while (position < bytes) {
            if (++chunks > 128) throw Error();
            const chunk = Buffer.alloc(8);
            if (readSync(fd, chunk, 0, 8, position) !== 8 || chunk.readUInt32LE(0) % 4)
              throw Error();
            position += 8 + chunk.readUInt32LE(0);
          }
          if (position !== bytes) throw Error();
        } finally {
          closeSync(fd);
        }
        row.status = "committing";
        row.phase = "committing";
        save();
        access.assert(row.path, { write: true });
        linkFile(temp, row.path);
        linked = true;
        row.status = "done";
        row.phase = null;
        save();
        removeTemp(row, access);
        return expose(row);
      } catch (error) {
        if (linked) {
          row.status = "interrupted";
          row.phase = "committing";
        } else {
          row.status = controller.signal.aborted || access.signal.aborted ? "interrupted" : "error";
          row.phase = null;
          removeTemp(row, access);
        }
        try {
          save();
        } catch {}
        throw Error(
          linked
            ? "The new copy may have been written, but its receipt is unconfirmed. Check this save status before trying again."
            : error.code === "ROOT_ACCESS_DENIED"
              ? "Folder access changed. The original is unchanged; keep your editor draft."
              : error.message === "Destination exists. Choose another filename."
                ? error.message
                : "Print save failed. The original is unchanged; keep your draft and review the destination.",
        );
      } finally {
        if (uploadFd !== undefined)
          try {
            closeSync(uploadFd);
          } catch {}
        release(id);
      }
    },
    status,
    cancel(id) {
      const row = rows.find((r) => r.id === id);
      if (!row) throw Error("Save receipt not found.");
      if (row.status !== "done") {
        const item = pending.get(id);
        if (!item) {
          let access;
          try {
            access = authority.lease(dirname(row.path));
            removeTemp(row, access);
          } finally {
            access?.release();
          }
        }
        retire(row, "cancelled");
      }
      return expose(row);
    },
    shutdown() {
      closed = true;
      for (const id of [...pending.keys()]) {
        const row = rows.find((r) => r.id === id);
        retire(row, "interrupted");
        release(id);
      }
    },
  };
}

/** Legacy byte-copy bridge: exclusive new-file creation, never replacement. */
export function createNewPrintFile(authority, target, bytes) {
  const access = authority.lease(dirname(target)),
    temp = join(dirname(target), ".realhub-print-" + randomUUID() + ".tmp");
  let fd, pin;
  try {
    access.assert(target, { write: true });
    if (existsSync(target))
      throw Error("The print filename already exists. Existing files are never overwritten.");
    access.assert(temp, { write: true });
    fd = openSync(temp, "wx", 0o600);
    const stat = fstatSync(fd, { bigint: true });
    pin = [stat.dev, stat.ino, stat.birthtimeNs].map(String).join(":");
    writeFileSync(fd, bytes);
    closeSync(fd); fd = undefined;
    access.assert(temp);
    if (fileIdentity(temp) !== pin) throw Error("Temporary file changed.");
    access.assert(target, { write: true });
    linkSync(temp, target);
    return target;
  } finally {
    if (fd !== undefined) try { closeSync(fd); } catch {}
    try {
      if (pin) {
        access.assert(temp);
        if (fileIdentity(temp) === pin) unlinkSync(temp);
      }
    } catch {}
    access.release();
  }
}
