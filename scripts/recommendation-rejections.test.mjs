import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/')) return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c); try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;} } });
const r=await import('../src/lib/videos/recommendation-rejections.ts');
const {rankYoutubeRecommendations}=await import('../src/lib/remote/youtube-recommendations.ts');
const {createYoutubeRankingProcessor}=await import('../src/lib/remote/youtube-ranking-protocol.ts');
const {prepareTwitchRecommendationScore}=await import('../src/lib/videos/twitch-recommendations.ts');
const {prepareGuide,answerGuideQuery}=await import('../src/lib/videos/guide-picks.ts');
const {describeRoomMedia}=await import('../src/lib/multiplayer/room-media.ts');
const {buildRoomSessionFile}=await import('../src/lib/multiplayer/room-session-file.ts');
const turn=async()=>{}, now=1768478400000;
const video=(id,creator='creator-a',kind='youtube')=>({id,name:'Racing lesson '+id,path:'',extension:'mp4',mime:'video/mp4',size:0,folderId:(kind==='twitch'?'tw:':'yt:')+creator,addedAt:now-86400000,genre:'racing',remote:{kind,videoId:id,channelId:creator,channelName:creator,live:false,youtubeType:'upload',publishedSource:'provider',publishedPrecision:'instant'}});
const a=video('aaaaaaaaaaa'),b=video('bbbbbbbbbbb'),c=video('ccccccccccc','creator-b');
const reject=(ledger,scope,target,label=target)=>r.changeRejection(ledger,{scope,target,label,at:now},false,now);
const titleLedger=reject(r.EMPTY_REJECTIONS,'title',r.titleRejectionTarget(a));
const ytTaste=(ledger)=>({recommendationRejections:ledger,tags:{},favorites:{},likes:{},history:[],viewCounts:{},ratingOf:()=>0,tagIsLiked:()=>false,tagHasHeartHistory:()=>false,ratingPreference:()=>0,watchScore:()=>0,creatorIsLiked:()=>false,creatorRating:()=>0,now,limit:10,shuffle:()=>0});

test('title identity covers aliases without spreading evidence to creator, topics, or providers',()=>{
 const penalty=r.createRejectionPenalty(titleLedger),alias={...a,id:'alias'};
 assert.equal(penalty(a),40);assert.equal(penalty(alias),40);assert.equal(penalty(b),0);assert.equal(penalty(c),0);assert.equal(penalty(video(a.id,'creator-a','twitch')),0);
 assert.equal(r.creatorRejectionTarget({...a,remote:undefined}), 'local:yt:creator-a');
});
test('creator scope respects provider identity; canonical topic evidence crosses sources without mechanical tag matching',()=>{
 const ledger=reject(titleLedger,'creator',r.creatorRejectionTarget(a));const penalty=r.createRejectionPenalty(ledger);
 assert.equal(penalty(a),64);assert.equal(penalty(b),24);assert.equal(penalty(c),0);assert.equal(penalty(video(b.id,'creator-a','twitch')),0);
 const topics=r.createRejectionPenalty(reject(r.EMPTY_REJECTIONS,'topic','technology'));
 assert.equal(topics({...c,name:'Wooden object',genre:undefined},['tech']),16);
 assert.equal(topics({...c,name:'Wooden object',genre:undefined},['source-youtube','creator-technology']),0);
 assert.equal(topics({...c,remote:undefined,name:'Software tutorial'},[]),16);
});
test('explicit title/creator favorites and hearted topics protect candidates without deleting choices',()=>{
 const ledger=reject(reject(titleLedger,'creator',r.creatorRejectionTarget(a)),'topic','racing'); const penalty=r.createRejectionPenalty(ledger);
 assert.equal(penalty(a,[],{favorite:true}),0);assert.equal(penalty(a,[],{creatorFavorite:true}),0);assert.equal(penalty(c,[],{tagIsLiked:()=>true}),0);assert.equal(ledger.entries.length,3);
 assert.equal(penalty(a,[],{tagIsLiked:()=>true}),64);
});
test('bounded ledger validates imports, keeps recent unique choices, and never silently evicts a new personal choice',()=>{
 for(const bad of [null,{}, {version:2,updatedAt:1,entries:[]}, {version:1,updatedAt:NaN,entries:[]}])assert.deepEqual(r.normalizeRejections(bad),r.EMPTY_REJECTIONS);
 const entries=Array.from({length:512},(_,i)=>({scope:'title',target:'local:'+i,label:'Fixture '+i,at:i}));
 const ledger=r.normalizeRejections({version:1,updatedAt:1000,entries});assert.equal(ledger.entries.length,512);
 assert.throws(()=>reject(ledger,'topic','racing'),/512-choice limit/);assert.equal(ledger.entries.length,512);
 const removed=r.changeRejection(ledger,entries[0],true,1001);assert.equal(removed.entries.length,511);assert.equal(reject(removed,'topic','racing').entries.length,512);
 const invalid=r.normalizeRejections({version:1,updatedAt:1,entries:[{...entries[0],target:''},{...entries[1],scope:'invalid'},{...entries[2],scope:'topic',target:'tech'},entries[3],{...entries[3],at:99}]});assert.equal(invalid.entries.length,1);assert.equal(invalid.entries[0].at,99);
});
test('Undo restores prior ranking evidence exactly and newest empty state wins over stale durable mirror',()=>{
 const removed=r.changeRejection(titleLedger,titleLedger.entries[0],true,now);assert.deepEqual(removed.entries,[]);assert(removed.updatedAt>titleLedger.updatedAt);
 assert.deepEqual(r.newestRejections(titleLedger,removed),removed);assert.deepEqual(r.newestRejections(removed,titleLedger),removed);
 const ids=ledger=>rankYoutubeRecommendations([a,b,c],ytTaste(ledger)).map(v=>v.id);
 assert.deepEqual(ids(removed),ids(r.EMPTY_REJECTIONS));assert.notDeepEqual(ids(titleLedger),ids(r.EMPTY_REJECTIONS));
 assert.equal(r.changeRejection(titleLedger,titleLedger.entries[0],false,now),titleLedger);
});
test('real YouTube ranker applies title-only penalty; creator diversity still leaves another creator available',()=>{
 const base=rankYoutubeRecommendations([a,b,c],ytTaste(r.EMPTY_REJECTIONS));const changed=rankYoutubeRecommendations([a,b,c],ytTaste(titleLedger));
 assert.equal(base[0].id,a.id);assert.equal(changed[0].id,b.id);assert(changed.some(v=>v.id===a.id));
 const favored=ytTaste(titleLedger);favored.favorites[a.id]=true;assert.deepEqual(rankYoutubeRecommendations([a,b,c],favored),rankYoutubeRecommendations([a,b,c],{...favored,recommendationRejections:r.EMPTY_REJECTIONS}));
});
test('YouTube worker reset carries negatives, supports favorites, and discards prior choices on a clean reset',()=>{
 const outputs=[];const process=createYoutubeRankingProcessor(ids=>outputs.push(ids));
 const run=ledger=>{process({type:'reset',recommendationRejections:ledger,creatorLikes:{},creatorFavorites:{},creatorRatings:{},heartedTags:[],historicTags:[]});process({type:'append',rows:[a,b,c].map(video=>({video,tags:[],rating:0,favorite:false,liked:false,marks:0,watch:0,plays:0}))});process({type:'candidates',ids:[a.id,b.id,c.id]});process({type:'ready'});return outputs.at(-1);};
 const baseline=run(r.EMPTY_REJECTIONS);const changed=run(titleLedger);assert(changed.indexOf(b.id)<changed.indexOf(a.id));assert.deepEqual(run(r.EMPTY_REJECTIONS),baseline);
});
test('Twitch scoring subtracts only explicit scopes and restores favorite score exactly',async()=>{
 const rows=[a,b,c].map(v=>({...v,folderId:'tw:'+v.remote.channelId,remote:{...v.remote,kind:'twitch',videoId:'123'+v.id}}));
 const ledger=reject(r.EMPTY_REJECTIONS,'title',r.titleRejectionTarget(rows[0]));
 const taste={tags:{},favorites:{},likes:{},viewCounts:{},rating:()=>0,watchScore:()=>0,now};
 const baseline=await prepareTwitchRecommendationScore(rows,taste,undefined,turn),changed=await prepareTwitchRecommendationScore(rows,{...taste,recommendationRejections:ledger},undefined,turn);
 assert.equal(changed(rows[0]),baseline(rows[0])-40);assert.equal(changed(rows[1]),baseline(rows[1]));
 const saved=await prepareTwitchRecommendationScore(rows,{...taste,recommendationRejections:ledger,favorites:{[rows[0].id]:true}},undefined,turn);const baselineFavorite=await prepareTwitchRecommendationScore(rows,{...taste,favorites:{[rows[0].id]:true}},undefined,turn);assert.equal(saved(rows[0]),baselineFavorite(rows[0]));
});
test('Guide personal and explicit-query orders apply choices but retain search matches and visibility boundaries',async()=>{
 const input={videos:[a,b,c],tags:{},favorites:{},likes:{},history:[]};
 const before=await prepareGuide(input,417,now,turn),after=await prepareGuide({...input,recommendationRejections:titleLedger},417,now,turn);
 assert.equal(after.picks.at(-1).id,a.id);assert(after.picks.some(v=>v.id===a.id));
 const query=await answerGuideQuery({...input,recommendationRejections:titleLedger},'racing',417,now,turn);assert.equal(query.picks.at(-1).id,a.id);
 const restored=await prepareGuide({...input,recommendationRejections:r.EMPTY_REJECTIONS},417,now,turn);assert.deepEqual(restored,before);
 const hidden=await prepareGuide({...input,hidden:{[b.id]:true},recommendationRejections:titleLedger},417,now,turn);assert(!hidden.picks.some(v=>v.id===b.id));
});
test('Watch Together public media and session exports cannot serialize private rejection evidence',()=>{
 const polluted={...a,recommendationRejections:titleLedger,remote:{...a.remote,recommendationRejections:titleLedger}};
 const media=describeRoomMedia(polluted),session=buildRoomSessionFile({played:[],current:polluted,upcoming:[]});
 for(const output of [media,session]){const json=JSON.stringify(output);assert(!json.includes('recommendationRejections'));assert(!json.includes('updatedAt'));assert(!json.includes('scope'));}
});

test('preview recommendation scores honor the prepared negative evidence without changing visibility or tag training',async()=>{
 const {rankPreview}=await import('../src/lib/videos/preview-ranking.ts');
 const row=(id,penalty=0)=>({id,folderId:'shared',kind:'youtube',creator:'same',tags:['racing'],rating:0,creatorRating:0,creatorLiked:false,live:false,eligible:true,rejectionPenalty:penalty});
 const rows=[row('target'),row('candidate-a'),row('candidate-b')];
 const baseline=rankPreview(rows,'target',0,[]);const changed=rankPreview([rows[0],row('candidate-a',40),rows[2]],'target',0,[]);
 assert(changed.related.indexOf('candidate-b')<baseline.related.indexOf('candidate-b'));assert.deepEqual(changed.tagScores,baseline.tagScores);
 assert.deepEqual(rankPreview(rows,'target',0,[]),baseline);
 const privateRows=rows.map(row=>({...row,adult:true}));assert.deepEqual(rankPreview(privateRows,'target',0,[]),rankPreview(privateRows.map(row=>({...row,rejectionPenalty:64})),'target',0,[]),'public rejection choices cannot change private/adult suggestions');
});
