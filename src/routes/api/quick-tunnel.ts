import { createFileRoute } from "@tanstack/react-router";
import { spawn, type ChildProcess } from "node:child_process";

type TunnelState = { process?: ChildProcess; url?: string; error?: string; starting?: boolean };
const globalTunnel = globalThis as typeof globalThis & { reelcaseQuickTunnel?: TunnelState };
const state = globalTunnel.reelcaseQuickTunnel ??= {};

function localRequest(request: Request) {
  if (process.env.VERCEL) return false;
  const host = request.headers.get("host")?.toLowerCase() ?? "";
  const loopback = /^(?:localhost|127\.0\.0\.1|\[::1\]):8080$/.test(host);
  if (request.headers.has("cf-connecting-ip") || request.headers.has("cf-ray") || request.headers.has("x-forwarded-host")) return false;
  const origin = request.headers.get("origin");
  return loopback && (!origin || origin === `http://${host}` || origin === `https://${host}`);
}

function response(request: Request) {
  if (!localRequest(request)) return Response.json({ error: "Quick Tunnel can only be controlled on the host computer." }, { status: 403 });
  return Response.json({ running: Boolean(state.url && state.process && !state.process.killed), starting: Boolean(state.starting), url: state.url ?? null, error: state.error ?? null }, { headers: { "cache-control": "no-store" } });
}

function startTunnel() {
  if (state.process || state.starting) return;
  state.starting = true;
  state.url = undefined;
  state.error = undefined;
  const child = spawn("cloudflared", ["tunnel", "--url", "http://127.0.0.1:8080"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  state.process = child;
  const capture = (chunk: Buffer) => {
    const output = chunk.toString();
    const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com\b/i);
    if (match) { state.url = match[0]; state.starting = false; state.error = undefined; }
    else if (/failed to|error|fatal/i.test(output) && !state.url) state.error = output.trim().slice(0, 240);
  };
  child.stdout?.on("data", capture);
  child.stderr?.on("data", capture);
  child.on("error", (error) => {
    state.error = (error as NodeJS.ErrnoException).code === "ENOENT" ? "Install cloudflared on this computer to start a trial tunnel." : error.message;
    state.starting = false;
    if (state.process === child) state.process = undefined;
  });
  child.on("exit", (code) => {
    if (state.process === child) {
      state.process = undefined;
      state.url = undefined;
      state.starting = false;
      if (code && !state.error) state.error = `cloudflared exited with code ${code}.`;
    }
  });
}

export const Route = createFileRoute("/api/quick-tunnel")({
  server: {
    handlers: {
      GET: ({ request }) => response(request),
      POST: async ({ request }) => {
        if (!localRequest(request)) return response(request);
        const body = await request.json().catch(() => ({})) as { action?: string };
        if (body.action === "start") startTunnel();
        else if (body.action === "stop") {
          state.process?.kill();
          state.process = undefined;
          state.url = undefined;
          state.starting = false;
          state.error = undefined;
        } else return Response.json({ error: "Unknown action." }, { status: 400 });
        return response(request);
      },
    },
  },
});
