import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  statSync,
  realpathSync,
  linkSync,
  unlinkSync,
} from "node:fs";
import { mkdir, open, stat, unlink } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, sep } from "node:path";
import { createHash, randomUUID } from "node:crypto";
const ROLES = ["checkpoints", "diffusion_models", "text_encoders", "vae"],
  STATES = [
    "prepared",
    "downloading",
    "paused",
    "interrupted",
    "restart-required",
    "verifying",
    "publishing",
    "done",
    "cancelled",
    "error",
  ];
const MAX = 8,
  CHUNK = 4 * 1024 * 1024,
  CHECKPOINT = 16 * 1024 * 1024;
const fileIdentity = (path) => {
  const s = statSync(path, { bigint: true });
  return [s.dev, s.ino, s.birthtimeNs].join(":");
};
const safeName = (name) =>
  typeof name === "string" &&
  /^[\w .-]{1,180}\.safetensors$/.test(name) &&
  !name.includes("..") &&
  !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name);
const same = (a, b) =>
  ["repo", "revision", "file", "role", "name", "bytes", "sha256"].every((key) => a[key] === b[key]);
export async function modelRange(fetchRemote, url, start, end, total, signal, etag) {
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    const parsed = new URL(current);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      !/(^|\.)huggingface\.co$|(^|\.)hf\.co$/.test(parsed.hostname)
    )
      throw Error("Model redirects must stay on approved HTTPS Hugging Face hosts.");
    const response = await fetchRemote(current, {
      headers: {
        Range: "bytes=" + start + "-" + end,
        "Accept-Encoding": "identity",
        ...(etag ? { "If-Range": etag } : {}),
      },
      redirect: "manual",
      signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = response.headers.get("location");
      await response.body?.cancel();
      if (!next) throw Error("Model redirect has no destination.");
      current = new URL(next, current).href;
      continue;
    }
    const observed = response.headers.get("etag");
    if (etag && observed !== etag) {
      await response.body?.cancel();
      throw Object.assign(
        Error("Remote file identity changed. Review a fresh transfer; the saved partial was kept."),
        { restart: true },
      );
    }
    if (
      response.status !== 206 ||
      response.headers.get("content-range") !== "bytes " + start + "-" + end + "/" + total ||
      (response.headers.get("content-encoding") &&
        !["identity"].includes(response.headers.get("content-encoding")))
    ) {
      await response.body?.cancel();
      throw Object.assign(
        Error("The model server did not return the requested unchanged bounded range."),
        { restart: !!etag },
      );
    }
    if (Number(response.headers.get("content-length")) > end - start + 1) {
      await response.body?.cancel();
      throw Error("Model range exceeded its byte budget.");
    }
    const parts = [];
    let count = 0;
    for await (const chunk of response.body) {
      signal.throwIfAborted();
      count += chunk.length;
      if (count > end - start + 1) throw Error("Model range exceeded its byte budget.");
      parts.push(chunk);
    }
    if (count !== end - start + 1)
      throw Error("Incomplete model range. The last verified checkpoint was kept.");
    return {
      bytes: Buffer.concat(parts, count),
      etag: observed && !/^W\//.test(observed) && observed.length <= 512 ? observed : undefined,
    };
  }
  throw Error("Too many model redirects.");
}
export function createModelTransfers({
  dir,
  folder,
  fetchRemote,
  inspect,
  validate,
  now = Date.now,
  saveJournal,
}) {
  const journal = join(dir, ".local-model-transfers.json"),
    owner = realpathSync(dir),
    ownerId = fileIdentity(dir);
  let rows = [],
    error = "";
  try {
    if (existsSync(journal)) {
      if (statSync(journal).size > 131072) throw Error();
      const saved = JSON.parse(readFileSync(journal, "utf8"));
      if (saved.version !== 1 || !Array.isArray(saved.rows) || saved.rows.length > MAX)
        throw Error();
      for (const raw of saved.rows) {
        if (
          !raw ||
          !/^[a-f0-9-]{36}$/.test(raw.id) ||
          !ROLES.includes(raw.role) ||
          !safeName(raw.name) ||
          !STATES.includes(raw.state) ||
          !/^[\w.-]+\/[\w.-]+$/.test(raw.repo) ||
          !/^[a-f0-9]{40}$/.test(raw.revision) ||
          typeof raw.file !== "string" ||
          raw.file.length > 1024 ||
          raw.file.split("/").some((s) => !s || s === ".." || s === ".") ||
          !/^[a-f0-9]{64}$/.test(raw.sha256) ||
          !Number.isSafeInteger(raw.bytes) ||
          raw.bytes < 10 ||
          raw.bytes > 30e9 ||
          !Number.isSafeInteger(raw.received) ||
          raw.received < 0 ||
          raw.received > raw.bytes ||
          (raw.received > 0 && !/^[a-f0-9]{64}$/.test(raw.prefixHash)) ||
          (raw.partIdentity !== undefined && !/^[0-9:]+$/.test(raw.partIdentity)) ||
          (raw.folderIdentity !== undefined && !/^[0-9:]+$/.test(raw.folderIdentity))
        )
          throw Error();
        const row = Object.fromEntries(
          [
            "id",
            "repo",
            "revision",
            "file",
            "role",
            "name",
            "bytes",
            "sha256",
            "received",
            "prefixHash",
            "partIdentity",
            "folderIdentity",
            "state",
            "etag",
            "note",
            "updatedAt",
          ]
            .filter((k) => raw[k] !== undefined)
            .map((k) => [k, raw[k]]),
        );
        if (row.etag && (typeof row.etag !== "string" || row.etag.length > 512)) throw Error();
        row.note = typeof row.note === "string" ? row.note.slice(0, 300) : "";
        if (["downloading", "verifying", "prepared"].includes(row.state)) {
          row.state = "interrupted";
          row.note =
            "Companion stopped. Review this transfer before resuming; no download was replayed.";
        }
        rows.push(row);
      }
      if (new Set(rows.map((r) => r.id)).size !== rows.length) throw Error();
    }
  } catch {
    rows = [];
    error =
      "Model transfer receipts are unreadable or newer than this Companion. Preserve the journal and repair it before starting another transfer.";
  }
  function persist() {
    if (error) throw Error(error);
    const value = { version: 1, rows };
    if (JSON.stringify(value).length > 131072)
      throw Error("Model transfer receipt budget exceeded.");
    if (saveJournal) {
      saveJournal(value);
      return;
    }
    const temp = journal + ".tmp-" + randomUUID();
    try {
      writeFileSync(temp, JSON.stringify(value), { flag: "wx", mode: 0o600 });
      renameSync(temp, journal);
    } finally {
      try {
        unlinkSync(temp);
      } catch {}
    }
  }
  function locations(row, create = false) {
    if (fileIdentity(dir) !== ownerId || realpathSync(dir) !== owner)
      throw Error("Companion model storage identity changed.");
    const directory = folder(row.role);
    if (create && !existsSync(directory)) throw Error("Create model storage before pinning it.");
    const resolved = realpathSync(directory);
    if (!resolved.startsWith(owner + sep))
      throw Error("Model destination is outside Companion-managed storage.");
    if (row.folderIdentity && row.folderIdentity !== fileIdentity(directory))
      throw Error("Model destination identity changed; the partial was retained.");
    return {
      directory,
      target: join(directory, row.name),
      part: join(directory, ".realhub-model-" + row.id + ".partial"),
    };
  }
  const summary = (row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    repo: row.repo,
    revision: row.revision,
    state: row.state,
    received: row.received,
    bytes: row.bytes,
    note: row.note,
    updatedAt: row.updatedAt,
  });
  function get(id) {
    if (error) throw Error(error);
    const row = rows.find((r) => r.id === id);
    if (!row) throw Error("Model transfer receipt not found.");
    return row;
  }
  function update(row, state, note) {
    Object.assign(row, { state, note, updatedAt: now() });
    persist();
  }
  async function hashFile(file, bytes, signal) {
    const hash = createHash("sha256");
    if (bytes)
      for await (const chunk of createReadStream(file, {
        start: 0,
        end: bytes - 1,
        highWaterMark: 65536,
      })) {
        signal?.throwIfAborted();
        hash.update(chunk);
      }
    return hash;
  }
  async function partial(row, signal) {
    const paths = locations(row);
    if (!row.partIdentity) {
      if (row.received) throw Error("Partial file ownership was not recorded.");
      return { ...paths, hash: createHash("sha256"), extra: 0 };
    }
    if (realpathSync(paths.part) !== paths.part)
      throw Error("Partial file is no longer in its pinned model folder.");
    const info = await stat(paths.part);
    if (
      fileIdentity(paths.part) !== row.partIdentity ||
      !info.isFile() ||
      info.size < row.received ||
      info.size - row.received > CHECKPOINT + CHUNK
    )
      throw Error("Partial file identity or size changed. Keep it and start a separate transfer.");
    const hash = await hashFile(paths.part, row.received, signal);
    if (row.received && hash.copy().digest("hex") !== row.prefixHash)
      throw Error("Partial file contents changed; it was not adopted or deleted.");
    if (fileIdentity(paths.part) !== row.partIdentity)
      throw Error("Partial file changed while verifying.");
    return { ...paths, hash, extra: info.size - row.received };
  }
  async function remote(row, signal) {
    const metadata = await inspect(
      "https://huggingface.co/" + row.repo + "/resolve/" + row.revision + "/" + row.file,
    );
    signal.throwIfAborted();
    const entry = metadata.files.find((f) => f.file === row.file);
    if (!entry || !same(row, { ...entry, repo: metadata.repo, revision: metadata.revision }))
      throw Object.assign(
        Error(
          "Publisher revision, size, checksum or model role changed. The existing partial and installed models were kept.",
        ),
        { restart: true },
      );
    const probe = await modelRange(
      fetchRemote,
      "https://huggingface.co/" + row.repo + "/resolve/" + row.revision + "/" + row.file,
      0,
      7,
      row.bytes,
      signal,
      row.etag,
    );
    return probe.etag;
  }
  async function prepare(entry, metadata, { fresh = false } = {}) {
    if (error) throw Error(error);
    const spec = {
      repo: metadata.repo,
      revision: metadata.revision,
      file: entry.file,
      role: entry.role,
      name: entry.name,
      bytes: entry.bytes,
      sha256: entry.sha256,
    };
    if (!safeName(spec.name) || !ROLES.includes(spec.role))
      throw Error("Model file name or component is unsupported.");
    const old = rows.find((row) => same(row, spec) && row.state !== "cancelled");
    if (old && !fresh) {
      if (old.state !== "done")
        throw Error(
          "A saved transfer exists for this model. Review it to resume or explicitly start a separate fresh transfer.",
        );
      old.state = "prepared";
      old.received = 0;
      delete old.prefixHash;
      delete old.partIdentity;
      persist();
      return old;
    }
    if (rows.length >= MAX) {
      const index = rows.findLastIndex(
        (row) => ["done", "cancelled"].includes(row.state) && !row.partIdentity,
      );
      if (index < 0)
        throw Error(
          "Eight model transfer receipts are retained. Cancel or finish a saved transfer first.",
        );
      rows.splice(index, 1);
    }
    const row = {
      ...spec,
      id: randomUUID(),
      state: "prepared",
      received: 0,
      note: "Transfer prepared; no model file is installed.",
      updatedAt: now(),
    };
    rows.unshift(row);
    persist();
    return row;
  }
  async function review(id, signal = new AbortController().signal) {
    const row = get(id);
    if (row.state === "error")
      return {
        ...summary(row),
        canResume: false,
        restartRequired: true,
        issue:
          "This transfer failed integrity or compatibility checks. Review a separate fresh transfer; no unverified weights are installed.",
      };
    if (row.state === "cancelled")
      throw Error("This transfer was cancelled. Inspect the model to start again.");
    if (row.state === "done") return { ...summary(row), canResume: false, restartRequired: false };
    try {
      if (row.partIdentity) await partial(row, signal);
      const etag = await remote(row, signal);
      if (!row.etag && etag) {
        row.etag = etag;
        persist();
      }
      return { ...summary(row), canResume: true, restartRequired: false };
    } catch (cause) {
      signal.throwIfAborted();
      if (cause.restart) update(row, "restart-required", cause.message);
      return {
        ...summary(row),
        canResume: false,
        restartRequired: !!cause.restart,
        issue: cause.message,
      };
    }
  }
  async function cleanup(row) {
    if (!row.partIdentity) return true;
    try {
      const { part } = await partial(row);
      if (row.partIdentity && fileIdentity(part) === row.partIdentity) await unlink(part);
      return true;
    } catch {
      return false;
    }
  }
  async function cancel(id) {
    const row = get(id);
    if (row.state === "done")
      throw Error("An installed model cannot be removed by cancelling a transfer.");
    const clean = await cleanup(row);
    if (clean) delete row.partIdentity;
    update(
      row,
      "cancelled",
      clean
        ? "Cancelled. Owned partial data was removed; installed models are unchanged."
        : "Cancelled. Unverified partial data was retained for manual review; installed models are unchanged.",
    );
    return summary(row);
  }
  async function transfer(row, current, signal, { resume = false } = {}) {
    if (error) throw Error(error);
    let handle,
      hash,
      offset = row.received,
      paths;
    current.received += offset;
    let checkpoint = offset;
    try {
      if (resume) {
        const checked = await review(row.id, signal);
        if (!checked.canResume)
          throw Object.assign(Error(checked.issue || "Review a fresh transfer."), {
            restart: checked.restartRequired,
          });
      }
      signal.throwIfAborted();
      await mkdir(folder(row.role), { recursive: true });
      paths = locations(row);
      row.folderIdentity ??= fileIdentity(paths.directory);
      if (existsSync(paths.target)) {
        if (!realpathSync(paths.target).startsWith(owner + sep))
          throw Error("Existing model resolves outside managed storage.");
        const info = await stat(paths.target),
          observed = await hashFile(paths.target, info.size, signal);
        if (info.size !== row.bytes || observed.digest("hex") !== row.sha256)
          throw Error(
            "An existing model uses this filename with different bytes. It was preserved; choose a different model name.",
          );
        await validate(paths.target, row.role);
        signal.throwIfAborted();
        current.received += row.bytes - offset;
        update(row, "done", "Existing file matches the reviewed publisher checksum and format.");
        if (await cleanup(row)) delete row.partIdentity;
        persist();
        return;
      }
      if (row.state === "publishing" && row.partIdentity) {
        /* A missing destination can safely resume the owned verified partial. */
      }
      if (row.partIdentity) {
        const verified = await partial(row, signal);
        hash = verified.hash;
        handle = await open(paths.part, "r+");
        if (fileIdentity(paths.part) !== row.partIdentity)
          throw Error("Partial ownership changed.");
        if (verified.extra) await handle.truncate(offset);
      } else {
        handle = await open(paths.part, "wx");
        row.partIdentity = fileIdentity(paths.part);
        hash = createHash("sha256");
        persist();
      }
      const url =
        "https://huggingface.co/" + row.repo + "/resolve/" + row.revision + "/" + row.file;
      async function range(start, end) {
        locations(row);
        signal.throwIfAborted();
        const result = await modelRange(fetchRemote, url, start, end, row.bytes, signal, row.etag);
        if (!row.etag && result.etag) {
          row.etag = result.etag;
          persist();
        }
        return result.bytes;
      }
      if (row.role === "checkpoints" && !offset) {
        current.note = "Checking checkpoint compatibility…";
        const prefix = await range(0, 7),
          length = Number(prefix.readBigUInt64LE());
        if (!Number.isSafeInteger(length) || length < 2 || length > 8e6 || length + 8 >= row.bytes)
          throw Object.assign(Error("Not a valid bounded safetensors checkpoint."), {
            invalid: true,
          });
        const header = JSON.parse((await range(8, 7 + length)).toString("utf8"));
        if (!Object.keys(header).some((k) => k.startsWith("model.diffusion_model.input_blocks.")))
          throw Object.assign(
            Error(
              "This is not an SD 1.x/SDXL full checkpoint; the large download was not started.",
            ),
            { invalid: true },
          );
      }
      update(row, "downloading", "Receiving bounded model ranges.");
      while (offset < row.bytes) {
        const end = Math.min(row.bytes - 1, offset + CHUNK - 1),
          bytes = await range(offset, end);
        signal.throwIfAborted();
        let written = 0;
        while (written < bytes.length) {
          const result = await handle.write(
            bytes,
            written,
            bytes.length - written,
            offset + written,
          );
          if (!result.bytesWritten) throw Error("Model disk write stopped.");
          written += result.bytesWritten;
        }
        hash.update(bytes);
        offset = end + 1;
        current.received += bytes.length;
        current.note = "Downloading " + row.name;
        if (offset - checkpoint >= CHECKPOINT || offset === row.bytes) {
          await handle.sync();
          row.received = offset;
          row.prefixHash = hash.copy().digest("hex");
          persist();
          checkpoint = offset;
        }
      }
      await handle.close();
      handle = null;
      update(row, "verifying", "Checking complete SHA-256 and model format…");
      current.note = row.note;
      if (hash.digest("hex") !== row.sha256)
        throw Object.assign(
          Error("Model checksum mismatch. Unverified weights were not enabled."),
          { invalid: true },
        );
      await validate(paths.part, row.role);
      signal.throwIfAborted();
      locations(row);
      if (fileIdentity(paths.part) !== row.partIdentity)
        throw Error("Partial ownership changed before publication.");
      update(row, "publishing", "Verified file ready for exclusive publication.");
      signal.throwIfAborted();
      locations(row);
      linkSync(paths.part, paths.target);
      update(row, "done", "Model verified and installed; refresh the engine to discover it.");
      unlinkSync(paths.part);
      delete row.partIdentity;
      persist();
      await import("node:fs/promises").then(({ writeFile }) =>
        writeFile(
          paths.target + ".source.json",
          JSON.stringify({
            repo: row.repo,
            revision: row.revision,
            file: row.file,
            sha256: row.sha256,
          }),
          {flag:"wx"},
        ),
      );
    } catch (cause) {
      if (row.state === "done") return;
      if (handle) {
        try {
          await handle.sync();
          if (hash) {
            row.received = offset;
            row.prefixHash = hash.copy().digest("hex");
            persist();
          }
        } catch {}
        await handle.close().catch(() => {});
        handle = null;
      }
      if (signal.aborted && signal.reason === "cancel") {
        await cancel(row.id);
      } else if (cause.invalid) {
        const clean = await cleanup(row);
        if (clean) delete row.partIdentity;
        update(
          row,
          "error",
          cause.message + (clean ? "" : " Partial data could not be verified and was retained."),
        );
      } else
        update(
          row,
          cause.restart
            ? "restart-required"
            : signal.aborted && signal.reason === "pause"
              ? "paused"
              : "interrupted",
          cause.restart
            ? cause.message
            : signal.aborted
              ? "Transfer stopped. Review before resuming; installed models were preserved."
              : "Transfer interrupted. Review the saved partial before retrying.",
        );
      throw cause;
    } finally {
      await handle?.close().catch(() => {});
    }
  }
  async function resumeEntry(id) {
    const row = get(id);
    if (
      ![
        "paused",
        "interrupted",
        "restart-required",
        "prepared",
        "verifying",
        "publishing",
      ].includes(row.state)
    )
      throw Error("Only interrupted or paused transfers can resume.");
    return row;
  }
  async function fresh(id) {
    const row = get(id);
    if (["downloading", "verifying"].includes(row.state))
      throw Error("Pause the active transfer before preparing another copy.");
    const metadata = await inspect("https://huggingface.co/" + row.repo);
    const entry = metadata.files.find((f) => f.file === row.file);
    if (!entry?.supported) throw Error("The current publisher file is unsupported or missing.");
    const spec = {
      repo: metadata.repo,
      revision: metadata.revision,
      file: entry.file,
      role: entry.role,
      name: entry.name,
      bytes: entry.bytes,
      sha256: entry.sha256,
    };
    return {
      entry,
      metadata,
      source: spec,
      fingerprint: createHash("sha256").update(JSON.stringify(spec)).digest("hex"),
    };
  }
  return {
    prepare,
    transfer,
    review,
    cancel,
    resumeEntry,
    fresh,
    list: () => ({
      version: 1,
      maxEntries: MAX,
      error: error || undefined,
      entries: rows.map(summary),
    }),
    get,
  };
}
