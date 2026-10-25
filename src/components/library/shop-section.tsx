import { createLocalId } from "@/lib/local-id";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, PackageSearch, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HubShell } from './hub-shared';

export function ShopSection() {
  const [query, setQuery] = useState("");
  type Package = { id: string; title: string; carrier: string; tracking: string; status: "Ordered" | "Shipped" | "Out for delivery" | "Delivered" };
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageTitle, setPackageTitle] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [tracking, setTracking] = useState("");
  useEffect(() => { try { setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]") as Package[]); } catch { setPackages([]); } }, []);
  useEffect(() => { try { localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages)); } catch { /* storage unavailable */ } }, [packages]);
  const encoded = encodeURIComponent(query.trim());
  const stores = useMemo(
    () => [
      { name: "Amazon", href: `https://www.amazon.com/s?k=${encoded}`, detail: "Search Amazon" },
      {
        name: "Walmart",
        href: `https://www.walmart.com/search?q=${encoded}`,
        detail: "Search Walmart",
      },
      {
        name: "eBay",
        href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
        detail: "Search eBay",
      },
      { name: "Etsy", href: `https://www.etsy.com/search?q=${encoded}`, detail: "Search handmade & niche shops" },
      { name: "Diipoo", href: `https://diipoo.com/?s=${encoded}`, detail: "Search Diipoo deals" },
    ],
    [encoded],
  );
  return (
    <HubShell
      eyebrow="Shopping shortcuts"
      icon={<ShoppingBag className="size-4" />}
      title="Find gear for your setup"
      copy="Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search film gear, printer parts, controllers…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stores.map((store) => (
          <a
            key={store.name}
            href={store.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
          >
            <p className="font-display text-2xl text-fg">{store.name}</p>
            <p className="mt-1 text-sm text-muted">
              {query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Open search <ExternalLink className="size-4" />
            </span>
          </a>
        ))}
      </div>
      <section className="mt-7 rounded-lg bg-elevated p-5 shadow-border">
        <div><p className="flex items-center gap-2 font-display text-2xl text-fg"><PackageSearch className="size-5 text-accent" />Package tracking</p><p className="mt-1 text-sm text-muted">A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected.</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]"><Input value={packageTitle} onChange={(event) => setPackageTitle(event.target.value)} placeholder="Package or order name" aria-label="Package name" /><Input value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Carrier" aria-label="Carrier" /><Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking number (optional)" aria-label="Tracking number" /><Button onClick={() => { if (!packageTitle.trim()) return; setPackages((items) => [{ id: createLocalId("package-"), title: packageTitle.trim(), carrier: carrier.trim() || "Carrier", tracking: tracking.trim(), status: "Ordered" }, ...items]); setPackageTitle(""); setTracking(""); }}>Add package</Button></div>
        {packages.length ? <div className="mt-4 space-y-2">{packages.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3"><div className="min-w-36 flex-1"><p className="text-sm font-medium text-fg">{item.title}</p><p className="text-xs text-muted">{item.carrier}{item.tracking ? ` · ${item.tracking}` : ""}</p></div><select value={item.status} onChange={(event) => setPackages((items) => items.map((entry) => entry.id === item.id ? { ...entry, status: event.target.value as Package["status"] } : entry))} className="h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><option>Ordered</option><option>Shipped</option><option>Out for delivery</option><option>Delivered</option></select>{item.tracking && <a href={`https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`} target="_blank" rel="noreferrer" className="rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg">Track</a>}<Button size="sm" variant="secondary" onClick={() => setPackages((items) => items.filter((entry) => entry.id !== item.id))}>Remove</Button></div>)}</div> : <p className="mt-4 text-sm text-muted">No packages yet. Add an order to keep its delivery status beside your shopping shortcuts.</p>}
      </section>
    </HubShell>
  );
}
