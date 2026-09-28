#!/usr/bin/env node
/**
 * Minimal local host for a Vercel/Nitro build. `vite preview` cannot serve the
 * Vercel function output on Windows, so production QA uses the same function
 * and static files that the deployment receives.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const staticRoot = resolve(root, ".vercel", "output", "static");
const port = Number(process.env.REELCASE_VERCEL_QA_PORT ?? 8082);
const functionUrl = pathToFileURL(resolve(root, ".vercel", "output", "functions", "__server.func", "index.mjs")).href;
const { default: handler } = await import(functionUrl);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function staticFileFor(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  const candidate = resolve(staticRoot, `.${decoded}`);
  if (candidate !== staticRoot && !candidate.startsWith(`${staticRoot}${sep}`)) return null;
  return existsSync(candidate) && statSync(candidate).isFile() ? candidate : null;
}

const server = createServer(async (req, res) => {
  const origin = `http://${req.headers.host ?? `127.0.0.1:${port}`}`;
  const url = new URL(req.url ?? "/", origin);
  const staticFile = staticFileFor(url.pathname);
  if (staticFile) {
    const mime = mimeTypes[extname(staticFile).toLowerCase()];
    if (mime) res.setHeader("content-type", mime);
    createReadStream(staticFile).pipe(res);
    return;
  }
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    // Undici deliberately manages `Host` for an outbound Request. Preserve the
    // inbound scope separately so Vercel route handlers see the same host they
    // receive after a real proxy hop.
    headers.set("x-forwarded-host", req.headers.host ?? `127.0.0.1:${port}`);
    const method = req.method ?? "GET";
    const request = new Request(url, {
      method,
      headers,
      ...(method === "GET" || method === "HEAD" ? {} : { body: req, duplex: "half" }),
    });
    const response = await handler.fetch(request, { waitUntil: () => undefined });
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    res.statusCode = 500;
    res.end(`Vercel QA server error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[vercel-qa] http://127.0.0.1:${port}/`);
});
