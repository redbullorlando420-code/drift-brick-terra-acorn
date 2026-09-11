import { z } from "zod";
import { getSql, type Sql } from "@/lib/db";

const device = z.object({
  id: z.string().uuid(),
  label: z.string().trim().min(1).max(48),
  kind: z.enum(["desktop", "mobile"]),
});

type PresenceRow = { device_id: string; label: string; device_kind: "desktop" | "mobile"; last_seen: Date | string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

function scopeFor(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  return host.toLowerCase().slice(0, 255);
}

async function activeDevices(sql: Sql, scope: string) {
  await sql.query("DELETE FROM reelcase_network_presence WHERE last_seen < now() - interval '90 seconds'");
  const rows = await sql.query<PresenceRow>("SELECT device_id, label, device_kind, last_seen FROM reelcase_network_presence WHERE scope = $1 AND last_seen > now() - interval '90 seconds' ORDER BY last_seen DESC LIMIT 24", [scope]);
  return rows.map((row) => ({ id: row.device_id, label: row.label, kind: row.device_kind, lastSeen: new Date(row.last_seen).getTime() }));
}

export async function handleNetworkPresence(request: Request) {
  try {
    const scope = scopeFor(request);
    if (!scope) return json({ error: "missing host" }, 400);
    const sql = await getSql();
    if (request.method === "GET") return json({ devices: await activeDevices(sql, scope) });
    if (request.method !== "POST") return json({ error: "method not allowed" }, 405);
    const parsed = device.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ error: "invalid device" }, 400);
    const { id, label, kind } = parsed.data;
    await sql.query("INSERT INTO reelcase_network_presence (scope, device_id, label, device_kind, last_seen) VALUES ($1, $2, $3, $4, now()) ON CONFLICT (scope, device_id) DO UPDATE SET label = EXCLUDED.label, device_kind = EXCLUDED.device_kind, last_seen = now()", [scope, id, label, kind]);
    return json({ devices: await activeDevices(sql, scope) });
  } catch (error) {
    console.error("[network-presence] failed", error);
    return json({ error: "network presence failed" }, 500);
  }
}
