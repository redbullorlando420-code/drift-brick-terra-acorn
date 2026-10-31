import { createLocalId } from "@/lib/local-id";
import { useMemo, useState } from "react";
import { ExternalLink, PackageSearch, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HubShell } from "./hub-shared";
import { readTrackedPackages, type TrackedPackage } from "@/lib/workspace-shortcuts";

export function ShopSection() {
  const [query, setQuery] = useState("");
  const [packages, setPackages] = useState<TrackedPackage[]>(() => {
    try {
      return readTrackedPackages(
        JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]"),
      );
    } catch {
      return [];
    }
  });
  const [saveError, setSaveError] = useState("");
  const [packageTitle, setPackageTitle] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [tracking, setTracking] = useState("");
  const savePackages = (next: TrackedPackage[]) => {
    setPackages(next);
    try {
      localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(next));
      setSaveError("");
    } catch {
      setSaveError(
        "Could not save packages. Your changes are available in this session. Free browser storage and retry before leaving this page.",
      );
    }
  };
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
      {
        name: "Etsy",
        href: `https://www.etsy.com/search?q=${encoded}`,
        detail: "Search handmade & niche shops",
      },
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
        {saveError && (
          <div role="alert" className="mb-4 text-sm text-danger">
            <p>{saveError}</p>
            <Button
              className="mt-2 min-h-11"
              variant="secondary"
              onClick={() => savePackages(packages)}
            >
              Retry saving packages
            </Button>
          </div>
        )}
        <div>
          <p className="flex items-center gap-2 font-display text-2xl text-fg">
            <PackageSearch className="size-5 text-accent" />
            Package tracking
          </p>
          <p className="mt-1 text-sm text-muted">
            A private local list for orders you are expecting. Tracking opens the carrier lookup in
            a new page; no retailer account is connected.
          </p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]">
          <Input
            value={packageTitle}
            onChange={(event) => setPackageTitle(event.target.value)}
            placeholder="Package or order name"
            aria-label="Package name"
          />
          <Input
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            placeholder="Carrier"
            aria-label="Carrier"
          />
          <Input
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
            placeholder="Tracking number (optional)"
            aria-label="Tracking number"
          />
          <Button
            onClick={() => {
              if (!packageTitle.trim()) return;
              savePackages([
                {
                  id: createLocalId("package-"),
                  title: packageTitle.trim(),
                  carrier: carrier.trim() || "Carrier",
                  tracking: tracking.trim(),
                  status: "Ordered",
                },
                ...packages,
              ]);
              setPackageTitle("");
              setTracking("");
            }}
          >
            Add package
          </Button>
        </div>
        {packages.length ? (
          <div className="mt-4 space-y-2">
            {packages.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3"
              >
                <div className="min-w-0 flex-1 basis-40 break-words">
                  <p className="text-sm font-medium text-fg">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.carrier}
                    {item.tracking ? ` · ${item.tracking}` : ""}
                  </p>
                </div>
                <select
                  aria-label={`Delivery status for ${item.title}`}
                  value={item.status}
                  onChange={(event) =>
                    savePackages(
                      packages.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, status: event.target.value as TrackedPackage["status"] }
                          : entry,
                      ),
                    )
                  }
                  className="min-h-11 max-w-full rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"
                >
                  <option>Ordered</option>
                  <option>Shipped</option>
                  <option>Out for delivery</option>
                  <option>Delivered</option>
                </select>
                {item.tracking && (
                  <a
                    href={`https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg"
                  >
                    Track
                  </a>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => savePackages(packages.filter((entry) => entry.id !== item.id))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No packages yet. Add an order to keep its delivery status beside your shopping
            shortcuts.
          </p>
        )}
      </section>
    </HubShell>
  );
}
