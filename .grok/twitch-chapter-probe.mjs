const query=async(query,variables)=>{const r=await fetch('https://gql.twitch.tv/gql',{method:'POST',headers:{'client-id':'kd1unb4b3q4t58fwlpcbzcbnm76a8fp','content-type':'application/json'},body:JSON.stringify({query,variables}),signal:AbortSignal.timeout(12000)});const data=await r.json();return {status:r.status,...data};};
const recent=await query('query($login:String!){user(login:$login){videos(first:1,type:ARCHIVE){edges{node{id lengthSeconds}}}}}',{login:process.argv[2]||'twitch'});
const id=recent.data?.user?.videos?.edges?.[0]?.node?.id;
if(!id){console.log(JSON.stringify({stage:'latest',status:recent.status,errors:recent.errors?.map(e=>e.message),available:false}));process.exitCode=1;}else{
const result=await query('query($id:ID!){video(id:$id){id lengthSeconds moments(momentRequestType:VIDEO_CHAPTER_MARKERS){edges{node{id positionMilliseconds durationMilliseconds description}}}}}',{id});
console.log(JSON.stringify({stage:'chapters',status:result.status,id,errors:result.errors?.map(e=>e.message),length:result.data?.video?.lengthSeconds,chapters:result.data?.video?.moments?.edges?.length,first:result.data?.video?.moments?.edges?.[0]?.node},null,2));
}
