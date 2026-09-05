import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";
import type { PeerRow, RtcPollResponse, SignalRow } from "./p2p";

const id = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
const signal = z.object({ op: z.literal("signal"), room: id, from: id, to: id, kind: z.enum(["offer", "answer", "ice"]), payload: z.unknown().refine((value) => value !== undefined && JSON.stringify(value).length <= 32768) });
const post = z.discriminatedUnion("op", [signal, z.object({ op: z.literal("leave"), room: id, peer: id })]);
const globalRef = globalThis as typeof globalThis & { __reelcaseRtcSchema?: Promise<void> };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
function ensure(sql: Sql) {
  globalRef.__reelcaseRtcSchema ??= Promise.all([
    sql.query("CREATE TABLE IF NOT EXISTS webrtc_peers (room TEXT NOT NULL, peer_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (room, peer_id))"),
    sql.query("CREATE TABLE IF NOT EXISTS webrtc_signals (id BIGSERIAL PRIMARY KEY, room TEXT NOT NULL, to_peer TEXT NOT NULL, from_peer TEXT NOT NULL, kind TEXT NOT NULL, payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"),
    sql.query("CREATE INDEX IF NOT EXISTS webrtc_signals_inbox ON webrtc_signals (room, to_peer, id)"),
  ]).then(() => undefined).catch((error) => { globalRef.__reelcaseRtcSchema = undefined; throw error; });
  return globalRef.__reelcaseRtcSchema;
}
async function prune(sql: Sql) {
  await Promise.all([sql.query("DELETE FROM webrtc_peers WHERE last_seen < now() - interval '30 seconds'"), sql.query("DELETE FROM webrtc_signals WHERE created_at < now() - interval '60 seconds'")]);
}
export async function handleSignaling(request: Request): Promise<Response> {
  try {
    const sql = await getSql(); await ensure(sql);
    if (request.method === "GET") {
      const url = new URL(request.url);
      const parsed = z.object({ room: id, peer: id, name: z.string().max(64).default(""), since: z.coerce.number().int().min(0).default(0) }).safeParse({ room: url.searchParams.get("room"), peer: url.searchParams.get("peer"), name: url.searchParams.get("name") ?? "", since: url.searchParams.get("since") ?? 0 });
      if (!parsed.success) return json({ error: "invalid query" }, 400);
      const { room, peer, name, since } = parsed.data;
      if (since === 0 || Math.random() < 0.02) await prune(sql);
      await sql.query("INSERT INTO webrtc_peers (room, peer_id, name, last_seen) VALUES ($1, $2, $3, now()) ON CONFLICT (room, peer_id) DO UPDATE SET name = EXCLUDED.name, last_seen = now()", [room, peer, name]);
      const [peers, signals] = await Promise.all([
        sql.query<{ peer_id: string; name: string }>("SELECT peer_id, name FROM webrtc_peers WHERE room = $1 AND last_seen > now() - interval '30 seconds' ORDER BY peer_id LIMIT 8", [room]),
        sql.query<{ id: number; from_peer: string; kind: SignalRow["kind"]; payload: unknown }>("SELECT id, from_peer, kind, payload FROM webrtc_signals WHERE room = $1 AND to_peer = $2 AND id > $3 ORDER BY id LIMIT 200", [room, peer, since]),
      ]);
      const result: RtcPollResponse = { peers: peers.map((row): PeerRow => ({ id: row.peer_id, name: row.name })), signals: signals.map((row) => ({ id: Number(row.id), from: row.from_peer, kind: row.kind, payload: row.payload })) };
      return json(result);
    }
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
    const parsed = post.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ error: "invalid request" }, 400);
    if (parsed.data.op === "leave") await sql.query("DELETE FROM webrtc_peers WHERE room = $1 AND peer_id = $2", [parsed.data.room, parsed.data.peer]);
    else await sql.query("INSERT INTO webrtc_signals (room, to_peer, from_peer, kind, payload) VALUES ($1, $2, $3, $4, $5)", [parsed.data.room, parsed.data.to, parsed.data.from, parsed.data.kind, JSON.stringify(parsed.data.payload)]);
    return json({ ok: true });
  } catch (error) { console.error("[rtc] signaling error", error); return json({ error: "signaling failed" }, 500); }
}
