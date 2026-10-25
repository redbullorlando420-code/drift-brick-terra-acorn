import { createLocalId } from "@/lib/local-id";
import { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PrivateWebShortcut = { id: string; name: string; url: string };

const PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";

export function PrivateWebShortcuts() {
  const [links, setLinks] = useState<PrivateWebShortcut[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
      return Array.isArray(saved) ? saved.filter((item): item is PrivateWebShortcut => typeof item?.name === "string" && typeof item?.url === "string") : [];
    } catch { return []; }
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const save = (next: PrivateWebShortcut[]) => { setLinks(next); localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next)); };
  const add = () => {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
      save([...links, { id: createLocalId("link-"), name: name.trim() || parsed.hostname, url: parsed.toString() }]);
      setName(""); setUrl("");
    } catch { setUrl(""); }
  };
  return <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private web shortcuts</p><h2 className="mt-2 font-display text-2xl text-fg">Your saved destinations</h2><p className="mt-1 text-xs leading-5 text-muted">Add only links you trust. These are saved only in this browser and open when you press Launch.</p><div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Shortcut name"/><Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" aria-label="Shortcut URL"/><Button disabled={!url.trim()} onClick={add}>Save shortcut</Button></div>{links.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{links.map((link) => <div key={link.id} className="flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{link.name}</p><p className="truncate text-xs text-muted">{link.url}</p></div><Button size="sm" onClick={() => window.location.assign(link.url)}><Rocket className="size-3"/>Launch</Button><Button size="sm" variant="secondary" onClick={() => save(links.filter((item) => item.id !== link.id))}>Remove</Button></div>)}</div>}</section>;
}
