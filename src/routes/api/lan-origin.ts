import { createFileRoute } from "@tanstack/react-router";
import { networkInterfaces } from "node:os";

const isPrivateV4 = (address: string) => {
  const parts = address.split(".").map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
    && (parts[0] === 10 || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168));
};

export const Route = createFileRoute("/api/lan-origin")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        if (process.env.VERCEL || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname.toLowerCase()))
          return Response.json({ origins: [] }, { headers: { "cache-control": "no-store" } });
        const candidates = Object.entries(networkInterfaces()).filter(([name]) => !/nord|vpn|tun|tap|wireguard|veth|virtual|hyper-v|loopback|wsl|docker|tailscale|zerotier/i.test(name)).flatMap(([name, rows]) =>
          (rows ?? []).filter((row) => row.family === "IPv4" && !row.internal && isPrivateV4(row.address))
            .map((row) => ({ name, address: row.address })),
        );
        candidates.sort((a, b) => Number(/ethernet|wi-?fi|wlan/i.test(b.name)) - Number(/ethernet|wi-?fi|wlan/i.test(a.name)));
        const origins = [...new Set(candidates.map(({ address }) => `${url.protocol}//${address}${url.port ? `:${url.port}` : ""}`))].slice(0, 4);
        return Response.json({ origins }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
