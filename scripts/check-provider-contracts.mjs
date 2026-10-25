import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {validateYoutubeFeed,validateYoutubeItems,validateYoutubeLiveContent,YoutubeContractError} from '../src/lib/remote/youtube-contract.ts';
export function checkProviderContracts(){
 const fixture=JSON.parse(readFileSync(new URL('../fixtures/provider-contracts/youtube.json',import.meta.url),'utf8'));
 return fixture.cases.map(c=>{let error;try{if(c.surface==='feed')validateYoutubeFeed(c.input,c.channelId);else if(c.surface==='catalog')validateYoutubeItems(c.input);else validateYoutubeLiveContent(c.input);}catch(e){error=e;}
 return {name:c.name,surface:c.surface,expected:c.expect,ok:c.expect==='reject'?error instanceof YoutubeContractError:!error,...(error?{reason:error instanceof YoutubeContractError?error.reason:'unexpected-validator-error'}:{})};
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const rows=checkProviderContracts();console.log(JSON.stringify({ok:rows.every(r=>r.ok),checks:rows},null,2));process.exitCode=rows.every(r=>r.ok)?0:1;}
