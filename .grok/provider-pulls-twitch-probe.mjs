const endpoint='https://gql.twitch.tv/gql';
for(const login of ['notyoda','twitch']){
 const query='query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:100,type:ARCHIVE){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds viewCount publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}';
 const r=await fetch(endpoint,{method:'POST',headers:{'client-id':'kd1unb4b3q4t58fwlpcbzcbnm76a8fp','content-type':'application/json'},body:JSON.stringify({query,variables:{login}}),signal:AbortSignal.timeout(12000)});console.log(JSON.stringify({login,status:r.status,body:await r.json()}));
}
