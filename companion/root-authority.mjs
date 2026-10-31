import {
  realpathSync,
  statSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  openSync,
  closeSync,
  fstatSync,
  constants,
} from "node:fs";
import { resolve, relative, sep, dirname, join, isAbsolute } from "node:path";
import { createHash, randomUUID } from "node:crypto";
const within = (parent, child) => {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith(".." + sep) && rel !== ".." && !isAbsolute(rel));
};
const identity = (path) => {
  const stat = statSync(path, { bigint: true });
  return String(stat.dev) + ":" + String(stat.ino) + ":" + String(stat.birthtimeNs);
};
const denied = () =>
  Object.assign(
    new Error(
      "Folder access changed or the path is outside approved folders. Recheck Companion folder access.",
    ),
    { code: "ROOT_ACCESS_DENIED" },
  );
/** Pins configured folders to their canonical path AND filesystem identity.
 * Browser actions can revoke/reapprove these pinned folders, never add roots.
 * No broad scans: checks touch configured folders and requested ancestors only. */
export function createRootAuthority(paths, { policyFile, intervalMs = 250 } = {}) {
  const roots = [],
    listeners = new Set(),
    leases = new Set();
  let generation = 1,
    timer,
    closed = false,
    saveError = false;
  let disabled = [];
  try {
    const stat = statSync(policyFile);
    if (stat.size > 32768) throw Error();
    const saved = JSON.parse(readFileSync(policyFile, "utf8"));
    if (
      saved.version !== 1 ||
      !Array.isArray(saved.disabled) ||
      saved.disabled.length > 64 ||
      saved.disabled.some((id) => typeof id !== "string" || !/^[a-f0-9]{24}$/.test(id))
    )
      throw Error();
    disabled = saved.disabled;
  } catch (e) {
    if (policyFile && e.code !== "ENOENT") saveError = true;
  }
  for (const raw of [...new Set(paths)].slice(0, 64))
    try {
      const source = resolve(raw),
        canonical = realpathSync(source),
        stat = statSync(canonical);
      if (!stat.isDirectory() || roots.some((r) => r.canonical === canonical)) continue;
      const pin = identity(canonical),
        id = createHash("sha256").update(source).digest("hex").slice(0, 24);
      roots.push({
        id,
        source,
        canonical,
        pin,
        revision: 1,
        enabled: !saveError && !disabled.includes(id),
        state: saveError ? "policy-unreadable" : disabled.includes(id) ? "revoked" : "approved",
      });
    } catch {}
  const persist = () => {
    if (!policyFile) return;
    const temp = policyFile + "." + randomUUID() + ".tmp";
    try {
      writeFileSync(
        temp,
        JSON.stringify({ version: 1, disabled: roots.filter((r) => !r.enabled).map((r) => r.id) }),
        { flag: "wx" },
      );
      renameSync(temp, policyFile);
      saveError = false;
    } catch {
      try {
        unlinkSync(temp);
      } catch {}
      saveError = true;
      throw Object.assign(
        Error(
          "Folder access policy could not be saved. Revoked access remains blocked in this process; verify local configuration before restarting Companion.",
        ),
        { code: "ROOT_POLICY_SAVE" },
      );
    }
  };
  const emit = (root) => {
    generation++;
    for (const lease of leases) if (lease.root === root) lease.controller.abort(denied());
    for (const listener of listeners) listener();
  };
  const validate = (root) => {
    if (!root.enabled) return false;
    try {
      if (realpathSync(root.source) !== root.canonical || identity(root.source) !== root.pin)
        throw denied();
      return true;
    } catch {
      root.enabled = false;
      root.state = "identity-changed";
      root.revision++;
      emit(root);
      try {
        persist();
      } catch {}
      return false;
    }
  };
  const resolvePath = (raw, write = false) => {
    if (closed || typeof raw !== "string" || !raw || raw.length > 32768) return null;
    const requested = resolve(raw);
    let current = requested,
      tail = [];
    try {
      while (!existsSync(current)) {
        if (!write) return null;
        const parent = dirname(current);
        if (parent === current || tail.length >= 32) return null;
        tail.unshift(current.slice(parent.length + (parent.endsWith(sep) ? 0 : 1)));
        current = parent;
      }
      const canonical = join(realpathSync(current), ...tail);
      const root = roots.find((r) => within(r.canonical, canonical) && validate(r));
      return root ? { path: canonical, root, requested } : null;
    } catch {
      return null;
    }
  };
  const pruneTimer = () => {
    if (!leases.size && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  const check = (raw) => resolvePath(raw)?.path ?? null;
  const lease = (raw, { write = false } = {}) => {
    const initial = resolvePath(raw, write);
    if (!initial) throw denied();
    const root = initial.root,
      revision = root.revision,
      controller = new AbortController();
    const pin = existsSync(initial.path) ? identity(initial.path) : null;
    const token = { root, controller };
    leases.add(token);
    if (!timer && !closed) {
      timer = setInterval(() => {
        for (const row of [...leases]) {
          try {
            row.assert();
          } catch {}
        }
      }, intervalMs);
      timer.unref?.();
    }
    const assert = (target = raw, { write: writing = write } = {}) => {
      controller.signal.throwIfAborted();
      const base = resolvePath(raw, write);
      if (
        !base ||
        base.root !== root ||
        revision !== root.revision ||
        base.path !== initial.path ||
        (pin && identity(base.path) !== pin)
      ) {
        controller.abort(denied());
        throw denied();
      }
      const next = resolvePath(target, writing);
      if (!next || next.root !== root || !within(initial.path, next.path)) {
        controller.abort(denied());
        throw denied();
      }
      return next.path;
    };
    token.assert = assert;
    return {
      path: initial.path,
      signal: controller.signal,
      assert,
      release() {
        leases.delete(token);
        pruneTimer();
      },
    };
  };
  const ensureDirectory = (raw) => {
    const ticket = lease(raw, { write: true });
    try {
      const target = ticket.assert();
      mkdirSync(target, { recursive: true });
      ticket.assert();
      return target;
    } finally {
      ticket.release();
    }
  };
  const read = (raw, options) => {
    const ticket = lease(raw);
    let fd;
    try {
      const target = ticket.assert();
      fd = openSync(target, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
      if (
        !fstatSync(fd).isFile() ||
        identity(target) !==
          String(fstatSync(fd, { bigint: true }).dev) +
            ":" +
            String(fstatSync(fd, { bigint: true }).ino) +
            ":" +
            String(fstatSync(fd, { bigint: true }).birthtimeNs)
      )
        throw denied();
      ticket.assert();
      const result = readFileSync(fd, options);
      ticket.assert();
      return result;
    } finally {
      if (fd !== undefined) closeSync(fd);
      ticket.release();
    }
  };
  const write = (raw, data, options) => {
    const dir = dirname(resolve(raw)),
      ticket = lease(dir);
    let temp;
    try {
      const target = ticket.assert(raw, { write: true });
      temp = join(ticket.path, ".realhub-write-" + randomUUID() + ".tmp");
      ticket.assert(temp, { write: true });
      writeFileSync(
        temp,
        data,
        typeof options === "string"
          ? { encoding: options, flag: "wx" }
          : { ...options, flag: "wx" },
      );
      ticket.assert(raw, { write: true });
      ticket.assert(temp);
      renameSync(temp, target);
      temp = undefined;
      return target;
    } finally {
      if (temp)
        try {
          ticket.assert(temp);
          unlinkSync(temp);
        } catch {}
      ticket.release();
    }
  };
  return {
    generation: () => generation,
    assertGeneration(expected) {
      if (closed || expected !== generation) throw denied();
    },
    check,
    lease,
    read,
    write,
    ensureDirectory,
    assertWrite(raw) {
      const row = resolvePath(raw, true);
      if (!row) throw denied();
      return row.path;
    },
    activePaths() {
      return roots.filter(validate).map((r) => r.canonical);
    },
    snapshot() {
      for (const r of roots) validate(r);
      return {
        generation,
        persistent: !saveError,
        roots: roots.map(({ id, source, state, revision, enabled }) => ({
          id,
          path: source,
          state,
          revision,
          enabled,
        })),
        active: roots.filter((r) => r.enabled).length,
        pending: leases.size,
      };
    },
    change(id, expected, enabled) {
      const r = roots.find((r) => r.id === id);
      if (!r || r.revision !== expected || typeof enabled !== "boolean")
        throw Error("Folder access changed. Refresh before choosing again.");
      if (enabled) {
        if (saveError) throw Error("Repair the local folder policy before granting access.");
        if (realpathSync(r.source) !== r.canonical || identity(r.source) !== r.pin) throw denied();
      }
      r.enabled = enabled;
      r.state = enabled ? "approved" : "revoked";
      r.revision++;
      emit(r);
      try {
        persist();
      } catch (error) {
        if (enabled) {
          r.enabled = false;
          r.state = "policy-unreadable";
          r.revision++;
          emit(r);
        }
        throw error;
      }
      return this.snapshot();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    close() {
      closed = true;
      generation++;
      clearInterval(timer);
      for (const t of leases) t.controller.abort(denied());
      leases.clear();
      listeners.clear();
    },
  };
}
