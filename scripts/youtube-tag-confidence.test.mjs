
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {youtubeTextTags,automaticYoutubeTags,compactYoutubeTagEvidence,youtubeTagEvidence,YOUTUBE_TEXT_TAG_VERSION}=await import('../src/lib/videos/youtube-text-tags.ts');
const {confidenceBand,sourceBit}=await import('../src/lib/videos/youtube-tag-confidence.ts');
const {prepareYoutubeTagReview}=await import('../src/lib/videos/youtube-tag-review.ts');
const {catalogCard}=await import('../src/lib/videos/catalog-card.ts');
const data=JSON.parse(readFileSync(new URL('./fixtures/youtube-tag-confidence.json',import.meta.url),'utf8'));
const video=(row={})=>({id:'yt:BaW_jenozKc',folderId:'yt:creator',path:'youtube',extension:'yt',mime:'video/youtube',size:0,addedAt:0,name:row.title??'Python workshop',description:row.description??'#Travel',remote:{kind:'youtube',videoId:'BaW_jenozKc',channelName:'Unrelated music creator',youtubeKeywords:row.keywords??['Travel']}});
test('labeled metadata corpus calibrates confidence bands and excludes promotional high-confidence interests',()=>{
 assert.equal(data.version,1);assert.equal(data.cases.length,24);let high=0,correctHigh=0,matched=0;
 const results=data.cases.map(row=>{const item=video(row),evidence=youtubeTextTags(item),i=evidence.tags.indexOf(row.tag),actual=i<0?'absent':confidenceBand(evidence.scores[i]);assert.equal(actual,row.expected,row.id+': '+row.reason);matched++;if(actual==='high'){high++;if(row.expected==='high')correctHigh++;}assert.equal(automaticYoutubeTags(item).includes(row.tag),row.expected==='high',row.id+' automatic admission');return {id:row.id,expected:row.expected,actual,score:i<0?null:evidence.scores[i]};});
 const report={ok:true,version:1,cases:results.length,matched,highConfidencePrecision:correctHigh/high,highConfidenceCases:high,results,limitation:'Small reviewed synthetic English/Unicode adversarial fixture set; evidence scores are not probabilities or broad language accuracy claims.'};
 writeFileSync(new URL('../screenshots/tag-confidence-calibration.json',import.meta.url),JSON.stringify(report,null,2));
});
test('distinct source masks distinguish creator, chapter, title, hashtag and prose without inflating repeated fields',()=>{
 const row=video({title:'Python workshop',description:'Python examples.\n00:00 Python\n#Python #Python',keywords:['Python','Python']});
 const a=youtubeTextTags(row),i=a.tags.indexOf('python');assert.equal(a.signals[i],31);assert.equal(a.scores[i],96);
 const repeated=youtubeTextTags(video({title:row.name,description:row.description.repeat(8),keywords:['Python']}));assert.equal(repeated.scores[repeated.tags.indexOf('python')],96);
 assert.equal(a.signals[i]&sourceBit('chapter'),sourceBit('chapter'));
});
test('compact scores survive real JSON/card reloads; browse records never contain full evidence excerpts',()=>{
 const full=video(),result=youtubeTextTags(full);full.remote.youtubeTagsCheckedAt=1;full.remote.youtubeTagSummary=compactYoutubeTagEvidence(result);const row=JSON.parse(JSON.stringify(catalogCard(full)));
 assert.equal(row.description,undefined);assert.deepEqual(youtubeTextTags(row),result);assert(!JSON.stringify(row.remote.youtubeTagSummary).includes('excerpt'));assert.equal(row.remote.youtubeTagSummary.scores.length,result.tags.length);
 assert(youtubeTagEvidence(full,'travel').some(e=>e.source==='video-tag'&&e.excerpt==='Travel'));
 const changed={...row,name:'Different listing'};assert(youtubeTextTags(changed).scores.every(score=>score<80));
});
test('explicit acceptance retains exact confidence provenance and does not rewrite manual or unrelated values',()=>{
 const row=video(),e=youtubeTextTags(row);row.remote.youtubeTagsCheckedAt=1;row.remote.youtubeTagSummary=compactYoutubeTagEvidence(e);
 const tags=['manual-choice'],provenance={tags:{'manual-choice':'manual'},lockedFields:['category'],category:'manual'},base={tags,provenance,summary:row.remote.youtubeTagSummary,checkedAt:1};
 const next=prepareYoutubeTagReview(row,tags,provenance,base,['travel'],123);assert.deepEqual(next.tags,['manual-choice','travel']);assert.equal(next.provenance.tags.travel,'youtube-review');assert.equal(next.provenance.tags['manual-choice'],'manual');assert.deepEqual(next.provenance.lockedFields,['category']);assert.equal(next.provenance.youtubeReviews.travel.score,55);assert.equal(next.provenance.youtubeReviews.travel.at,123);assert.deepEqual(tags,['manual-choice']);assert.equal(provenance.youtubeReviews,undefined);
 const chapter=video({title:'Workshop notes',description:'00:00 Cake and decorating',keywords:[]});chapter.remote.youtubeTagsCheckedAt=1;chapter.remote.youtubeTagSummary=compactYoutubeTagEvidence(youtubeTextTags(chapter));const chapterReview=prepareYoutubeTagReview(chapter,undefined,undefined,{tags:undefined,provenance:undefined,summary:chapter.remote.youtubeTagSummary,checkedAt:1},['cake-decorating']);assert.equal(chapterReview.reviewed,1);assert(youtubeTagEvidence(chapter,'cake-decorating').some(proof=>proof.source==='chapter'&&proof.excerpt.includes('and')));
 const reloaded=JSON.parse(JSON.stringify(next.provenance));assert.deepEqual(reloaded.youtubeReviews,next.provenance.youtubeReviews);
});
test('changed tags, metadata, locks, unknown candidates and full tag fields refuse stale acceptance',()=>{
 const row=video(),e=youtubeTextTags(row);row.remote.youtubeTagsCheckedAt=1;row.remote.youtubeTagSummary=compactYoutubeTagEvidence(e);const tags=['keep'],provenance={tags:{keep:'manual'}},base={tags,provenance,summary:row.remote.youtubeTagSummary,checkedAt:1};
 assert.throws(()=>prepareYoutubeTagReview(row,['later'],provenance,base,['travel']),/changed/);
 assert.throws(()=>prepareYoutubeTagReview(row,tags,{...provenance,lockedFields:['tags']},base,['travel']),/locked/);
 assert.throws(()=>prepareYoutubeTagReview({...row,remote:{...row.remote,youtubeTagsCheckedAt:2}},tags,provenance,base,['travel']),/changed/);
 assert.throws(()=>prepareYoutubeTagReview(row,tags,provenance,base,['forged']),/no longer/);
 const crowded=Array.from({length:32},(_,i)=>'manual-'+i);assert.throws(()=>prepareYoutubeTagReview(row,crowded,provenance,{...base,tags:crowded},['travel']),/limit/);
 assert.throws(()=>prepareYoutubeTagReview({...row,remote:{...row.remote,live:true}},tags,provenance,base,['travel']),/stream ends/);
});
test('description-only unrelated topics and hashtags cannot enter automatic topics; approved saved tags remain available to ordinary topic interpretation',async()=>{
 const {topicsForVideo}=await import('../src/lib/videos/topics.ts');const row=video({title:'Quiet afternoon',description:'Music music music. #anime',keywords:['Music']});assert.deepEqual(youtubeTextTags(row).descriptionTopics,[]);assert.deepEqual(topicsForVideo(row),[]);assert.deepEqual(topicsForVideo(row,['music']),['music']);
});
test('malformed compact scores are conservative, lists and excerpts remain bounded',()=>{
 const row=video({description:'Python details '.repeat(10000),keywords:Array.from({length:100},(_,i)=>'custom '+i)}),e=youtubeTextTags(row);assert(e.tags.length<=28);for(const tag of e.tags){const proof=youtubeTagEvidence(row,tag);assert(proof.length<=3);assert(proof.every(p=>p.excerpt.length<=120));}
 const crowded=video({title:'Python workshop',description:Array.from({length:12},(_,i)=>'#noise'+i).join(' '),keywords:Array.from({length:40},(_,i)=>'unrelated phrase '+i)});assert(automaticYoutubeTags(crowded).includes('python'),'weak dumps cannot crowd a stronger title entity out of the candidate cap');
 const long=video({title:'Ordinary '.repeat(30)+'Python workshop',description:''});assert(youtubeTagEvidence(long,'python').find(p=>p.source==='title').excerpt.includes('Python'));
 const compact=catalogCard({...row,remote:{...row.remote,youtubeTagSummary:{version:YOUTUBE_TEXT_TAG_VERSION,sources:{python:'title'},scores:[Infinity],signals:[-1],topics:[]}}});assert.equal(youtubeTextTags(compact).scores[0],0);
});
