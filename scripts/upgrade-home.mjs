import { readFileSync, writeFileSync } from 'node:fs';
const path = 'src/components/library/library-app.tsx';
let s = readFileSync(path, 'utf8');
s = s.replace('import { SidebarNav }', 'import { DiscoveryDesk, LiveDesk } from "./discovery-desk";\nimport { SidebarNav }');
s = s.replace('  const [liveColumns, setLiveColumns] = useState(4);', '  const [twitchFilter, setTwitchFilter] = useState("all");');
s = s.replace(/  const favoriteLiveVideos = useMemo\(.*?\n/, '');
s = s.replace(/  useEffect\(\(\) => \{ const sync = \(\) => setLiveColumns.*?\n/, '');
s = s.replace('    if (!follows.length) return;', '    if (!hydrated || !follows.length) return;');
s = s.replace('      const { wentLive, newVideos } = await refreshFollows();', '      if (document.hidden || !navigator.onLine) return;\n      if (Date.now() - useLibrary.getState().remoteCheckedAt < 90_000) return;\n      const { wentLive, newVideos } = await refreshFollows();');
s = s.replace('void tick(), 250', 'void tick(), 1500');
s = s.replace('[follows.length, refreshFollows, pushNotice]', '[hydrated, follows.length, refreshFollows, pushNotice]');
s = s.replace('              {!hasUserFolders && sourceId === "home" && (', '              {sourceId === "home" && !query && <DiscoveryDesk videos={videos} />}\n              {!hasUserFolders && sourceId === "home" && (');
s = s.replace('              {sourceId === "home" && !query && featured && <Billboard video={featured} />}','');
s = s.replace('                  <TitleRail title="Twitch sorted" videos={sortedTwitch} variant="rail" />', `                  <div className="mb-5 flex flex-wrap gap-2">{[["all", "All Twitch"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([value, label]) => <Button key={value} variant={twitchFilter === value ? "default" : "secondary"} onClick={() => setTwitchFilter(value)}>{label}{value === "all" ? "" : " · " + twitchVideos.filter((video) => value === "favorites" ? favorites[video.id] : likes[video.id]).length}</Button>)}</div>
                  {twitchFilter === "all" ? <><TitleRail title="Favorite Twitch videos" videos={sortedTwitch.filter((video) => favorites[video.id])} variant="rail"/><TitleRail title="Liked on Twitch" videos={sortedTwitch.filter((video) => likes[video.id])} variant="rail"/></> : null}
                  {twitchFilter !== "all" && !sortedTwitch.some((video) => twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]) && <p className="mb-6 rounded-lg border border-border p-6 text-muted">Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits.</p>}
                  <TitleRail title={twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos"} videos={sortedTwitch.filter((video) => twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]))} variant="rail" />
                  {twitchFilter === "all" && <>`);
s = s.replace('                  {!twitchVideos.length && (', '                  </>}\n                  {!twitchVideos.length && (');
const start = s.indexOf('              {sourceId === "live" && browsing && (');
const end = s.indexOf('              {sourceId === "movies" && browsing && (', start);
s = s.slice(0, start) + '              {sourceId === "live" && browsing && <LiveDesk videos={liveVideos} />}\n\n' + s.slice(end);
writeFileSync(path, s);
