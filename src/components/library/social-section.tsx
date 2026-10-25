import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XTimeline } from "./x-timeline";
import { X_ADULT_SEED_HANDLES } from "@/lib/videos/x-adult-seed-accounts";
import { HubShell } from './hub-shared';

export function SocialSection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [lastRead, setLastRead] = useState<Record<string, number>>({});
  const [topic, setTopic] = useState<{ label: string; query: string } | null>(null);
  const defaultTopics = useMemo(() => [{ label: "Movies & TV", query: "movies OR tv" }, { label: "Anime", query: "anime" }, { label: "Gaming", query: "gaming" }, { label: "Live creators", query: "twitch streamer" }], []);
  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
      let saved = Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
      // One-time seed from curated helper list. Never re-add after the user clears or removes accounts.
      const seededFlag = localStorage.getItem("reelcase.x-adult-seeded") === "1";
      if (!saved.length && !seededFlag) {
        saved = [...new Set(X_ADULT_SEED_HANDLES)].slice(0, 50);
        localStorage.setItem("reelcase.x-accounts", JSON.stringify(saved));
        localStorage.setItem("reelcase.x-adult-seeded", "1");
      } else if (!seededFlag) {
        localStorage.setItem("reelcase.x-adult-seeded", "1");
      }
      setAccounts(saved);
      const last = localStorage.getItem("reelcase.x-active") ?? "";
      setActive(saved.includes(last) ? last : saved[0] ?? "");
      if (!saved.length) setTopic(defaultTopics[0]);
      const reads: unknown = JSON.parse(localStorage.getItem("reelcase.x-last-read") ?? "{}");
      if (reads && typeof reads === "object") setLastRead(reads as Record<string, number>);
    } catch { /* empty shelf */ }
  }, []);
  const choose = (account: string) => { const at = Date.now(); setTopic(null); setActive(account); setLastRead((current) => { const next = { ...current, [account]: at }; try { localStorage.setItem("reelcase.x-last-read", JSON.stringify(next)); } catch { /* session only */ } return next; }); try { localStorage.setItem("reelcase.x-active", account); } catch { /* session only */ } };
  const save = (next: string[]) => { setAccounts(next); try { localStorage.setItem("reelcase.x-accounts", JSON.stringify(next)); } catch { setError("Storage is full. Account changes will last for this session only."); } };
  const add = () => {
    const value = handle.trim().replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
    if (!/^[a-z0-9_]{1,15}$/.test(value)) { setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores)."); return; }
    if (accounts.length >= 50 && !accounts.includes(value)) { setError("Your shelf holds 50 accounts. Remove one before adding another."); return; }
    setError(""); save([...new Set([...accounts, value])]); choose(value); setHandle("");
  };
  return <HubShell eyebrow="Social desk" icon={<X className="size-4" />} title="Keep your people close." copy="Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Realhub through X’s official widget; private posts and account likes stay on X.">
    <form className="mt-6 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); add(); }}><Input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@handle or X profile URL" aria-label="X account handle"/><Button type="submit" disabled={!handle.trim()}>Add account</Button></form>
    {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    <Input className="mt-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a saved account" aria-label="Search saved X accounts"/>
    <section className="mt-5 rounded-lg bg-elevated p-4 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Public topic views</p><p className="mt-1 text-sm text-muted">Explore these X searches separately from your saved people. X supplies the public timeline; open the topic if it is unavailable.</p><div className="mt-3 flex flex-wrap gap-2">{defaultTopics.map((item) => <Button key={item.label} size="sm" variant={topic?.label === item.label ? "default" : "secondary"} onClick={() => { setTopic(item); setActive(""); }}>{item.label}</Button>)}</div></section>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => <div key={account} className={"flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface")}><button type="button" aria-pressed={active === account} onClick={() => choose(account)} className="min-w-0 flex-1 p-3 text-left"><span className="block truncate text-lg font-semibold">@{account}</span><span className="text-xs text-muted">{lastRead[account] ? `Read ${new Date(lastRead[account]).toLocaleDateString()}` : "Public profile"}</span></button><Button variant="ghost" size="icon" aria-label={"Remove @" + account} onClick={() => { const next = accounts.filter((value) => value !== account); save(next); if (active === account) choose(next[0] ?? ""); }}><X className="size-4"/></Button></div>)}</div>
    {!accounts.length && <p className="mt-6 rounded-lg border border-border p-5 text-sm text-muted">Showing the default public topic view below. Add a profile to create a personal reading shelf; if X blocks embedded posts, the Open topic/profile button is the reliable fallback.</p>}
    {(active || topic) && <XTimeline key={topic ? `topic:${topic.label}` : active} account={active || undefined} topic={topic ?? undefined}/>}
  </HubShell>;
}
