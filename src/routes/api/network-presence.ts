import { createFileRoute } from "@tanstack/react-router";
import { handleNetworkPresence } from "@/lib/network-presence.server";

const handle = ({ request }: { request: Request }) => handleNetworkPresence(request);

export const Route = createFileRoute("/api/network-presence")({
  server: { handlers: { GET: handle, POST: handle } },
});
