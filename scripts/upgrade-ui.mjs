import { readFileSync, writeFileSync } from 'node:fs';
const edit = (path, change) => writeFileSync(path, change(readFileSync(path, 'utf8')));
edit('src/components/library/hub-sections.tsx', s => {
  s = s.replace('  Settings2,', '  Settings2,\n  Star,');
  s = s.replace('type LocalItem =', 'import { XTimeline } from "./x-timeline";\n\ntype LocalItem =');
  s = s.replace('  const [photos, setPhotos]', '  const [ratingFilter, setRatingFilter] = useState("all");\n  const [photos, setPhotos]');
  s = s.replace('JSON.stringify(Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating }) => [id, { path, people, tags, album, favorite, rating }])))', 'JSON.stringify({ ...JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}"), ...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating }) => [id, { path, people, tags, album, favorite, rating }])) })');
  s = s.replace('(!favoritesOnly || photo.favorite) &&', '(!favoritesOnly || photo.favorite) &&\n        (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) &&');
  s = s.replace('[photoSearch, selectedPerson, favoritesOnly, photoSort, discoveryFilter]', '[photoSearch, selectedPerson, favoritesOnly, photoSort, discoveryFilter, ratingFilter]');
  s = s.replace('title="A private people shelf."', 'title="Your photos. Your favorites."');
  s = s.replace('      <div className="mt-6 flex flex-col gap-3 rounded-lg', `      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4"><Star className="size-4 text-accent"/><span className="mr-2 text-sm font-medium">Rating desk</span>{[["all", "All ratings"], ["unrated", "Needs a rating"], ["3", "3+ stars"], ["4", "4+ stars"], ["5", "5 stars"]].map(([value, label]) => <Button key={value} size="sm" variant={ratingFilter === value ? "default" : "secondary"} onClick={() => setRatingFilter(value)}>{label}</Button>)}<span className="text-xs text-muted">{photos.filter((photo) => photo.rating > 0).length} of {photos.length} rated</span></div>
      <div className="mt-6 flex flex-col gap-3 rounded-lg`);
  const stars = `<PhotoStars name={photo.name} rating={photo.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, rating } : item))} />`;
  s = s.replace(/<div className="mt-2 flex gap-1">\{\[1,2,3,4,5\].*?<\/div>/, stars);
  s = s.replace('<div className="relative min-h-0 flex-1"><img src={focusedPhoto.url}', '<PhotoStars name={focusedPhoto.name} rating={focusedPhoto.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, rating } : item))} /><div className="relative min-h-0 flex-1"><img src={focusedPhoto.url}');
  const start = s.indexOf('export function SocialSection()');
  const end = s.indexOf('export function WatchRoomSection()', start);
  s = s.slice(0, start) + `export function SocialSection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
      const saved = Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
      setAccounts(saved);
      const last = localStorage.getItem("reelcase.x-active") ?? "";
      setActive(saved.includes(last) ? last : saved[0] ?? "");
    } catch { /* empty shelf */ }
  }, []);
  const choose = (account: string) => { setActive(account); try { localStorage.setItem("reelcase.x-active", account); } catch { /* session only */ } };
  const save = (next: string[]) => { setAccounts(next); try { localStorage.setItem("reelcase.x-accounts", JSON.stringify(next)); } catch { setError("Storage is full. Account changes will last for this session only."); } };
  const add = () => {
    const value = handle.trim().replace(/^https?:\\/\\/(?:www\\.)?(?:x|twitter)\\.com\\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
    if (!/^[a-z0-9_]{1,15}$/.test(value)) { setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores)."); return; }
    if (accounts.length >= 50 && !accounts.includes(value)) { setError("Your shelf holds 50 accounts. Remove one before adding another."); return; }
    setError(""); save([...new Set([...accounts, value])]); choose(value); setHandle("");
  };
  return <HubShell eyebrow="Social desk" icon={<X className="size-4" />} title="Keep your people close." copy="Save X profiles, switch between public timelines, and pick up where you left off. Private posts and account likes require access on X.">
    <form className="mt-6 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); add(); }}><Input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@handle or X profile URL" aria-label="X account handle"/><Button type="submit" disabled={!handle.trim()}>Add account</Button></form>
    {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    <Input className="mt-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a saved account" aria-label="Search saved X accounts"/>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => <div key={account} className={"flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface")}><button type="button" aria-pressed={active === account} onClick={() => choose(account)} className="min-w-0 flex-1 p-3 text-left"><span className="block truncate text-lg font-semibold">@{account}</span><span className="text-xs text-muted">Public profile</span></button><Button variant="ghost" size="icon" aria-label={"Remove @" + account} onClick={() => { const next = accounts.filter((value) => value !== account); save(next); if (active === account) choose(next[0] ?? ""); }}><X className="size-4"/></Button></div>)}</div>
    {!accounts.length && <p className="mt-6 rounded-lg border border-border p-8 text-muted">Add your first account to build your reading shelf.</p>}
    {active && <XTimeline key={active} account={active}/>}
  </HubShell>;
}

` + s.slice(end);
  s += `\nfunction PhotoStars({ name, rating, onChange }: { name: string; rating: number; onChange: (rating: number) => void }) {
  return <div className="mt-2 flex flex-wrap items-center gap-1" role="group" aria-label={"Rating for " + name}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent" aria-label={"Rate " + name + " " + value + " stars"} aria-pressed={rating === value} onClick={() => onChange(value)}><Star className={"size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted")}/></button>)}{rating > 0 && <button type="button" className="min-h-11 px-2 text-xs text-muted" aria-label={"Clear rating for " + name} onClick={() => onChange(0)}>Clear</button>}</div>;
}\n`;
  return s;
});
edit('src/styles.css', s => s.replace('--font-display: "Instrument Serif", ui-serif, Georgia, "Times New Roman", serif;', '--font-display: "Figtree", ui-sans-serif, system-ui, sans-serif;').replace('#0c0b0a', '#0b0e13').replace('#141312', '#11161e').replace('#1c1a18', '#1b222d').replace('#f3eee6', '#edf2f7').replace('#9c948a', '#a5b1c1').replace('#6f6860', '#8290a3').replaceAll('#e8e0d4', '#b9d5f0') + `
/* Shared editorial shell: crisp typography, quiet panels, visible focus. */
.font-display { font-weight: 600; letter-spacing: -0.035em; }
main > section, main > div > section { min-width: 0; }
button, a, input { -webkit-tap-highlight-color: transparent; }
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
.discovery-heading { font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.08; }
.media-shelf { content-visibility: auto; contain-intrinsic-size: auto 290px; }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
`);
edit('src/components/library/browse.tsx', s => s.replace('<section className="mb-8">', '<section className="media-shelf mb-8">'));

