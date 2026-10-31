import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {spawn} from 'node:child_process';
import {mkdtempSync,readdirSync,copyFileSync,mkdirSync,writeFileSync,readFileSync,realpathSync,rmSync} from 'node:fs';
import {resolve,join,sep} from 'node:path';
const parent=realpathSync(resolve('.grok')),root=mkdtempSync(join(parent,'companion-http-')),program=join(root,'program'),approved=join(root,'approved'),downloads=join(approved,'downloads');
mkdirSync(program);mkdirSync(downloads,{recursive:true});
for(const file of readdirSync('companion'))if(file.endsWith('.mjs'))copyFileSync(join('companion',file),join(program,file));
const receipt={id:'http-receipt',key:'BaW_jenozKc',source:'youtube',url:'https://www.youtube.com/watch?v=BaW_jenozKc',title:'HTTP restart fixture',status:'running',detail:'Old running state',progress:50,path:downloads,engine:'yt-dlp',browser:'firefox',createdAt:Date.now(),updatedAt:Date.now(),attempt:1};
const manifest=join(downloads,'.realhub-downloads.json');writeFileSync(manifest,JSON.stringify({version:2,jobs:[receipt]}));
const port=await new Promise((resolvePort,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolvePort(port));});});
let child,output='';
try{
 child=spawn(process.execPath,[join(program,'reelcase-companion.mjs')],{cwd:program,windowsHide:true,env:{...process.env,PATH:'',USERPROFILE:join(root,'no-desktop'),OneDrive:'',OneDriveConsumer:'',REELCASE_ALLOWED_ROOTS:approved,REELCASE_DOWNLOAD_DIR:downloads,REELCASE_COMPANION_PORT:String(port),REELCASE_APP_ORIGIN:'http://127.0.0.1:8080',YT_DLP_PATH:'',YOUTUBE_DL_PATH:''},stdio:['ignore','pipe','pipe']});
 await new Promise((yes,no)=>{const timeout=setTimeout(()=>no(Error('Isolated Companion startup timeout: '+output.slice(-1000))),20000);const read=data=>{output=(output+data).slice(-4000);if(output.includes('Companion listening')){clearTimeout(timeout);yes();}};child.stdout.on('data',read);child.stderr.on('data',read);child.once('exit',code=>{clearTimeout(timeout);no(Error('Isolated service exited '+code+': '+output));});});
 const request=(path,body,origin='http://127.0.0.1:8080')=>fetch('http://127.0.0.1:'+port+path,{method:body?'POST':'GET',headers:{origin,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(5000)});
 const beforeHealth=readdirSync(approved).sort();const health=await(await request('/health')).json();assert.deepEqual(readdirSync(approved).sort(),beforeHealth,'health does not create directories');assert.equal(health.inspection.schema,1);assert.match(health.inspection.configurationRef,/^[a-f0-9]{64}$/);assert.equal(health.inspection.tools.ytDlp,null);assert.equal(health.inspection.destinations.downloads,true);assert.equal(health.version,19);assert.deepEqual(health.protocol,{major:1,minor:0});assert(health.capabilities.includes('task-receipts'));assert.equal(health.roots,1);
 const before=await(await request('/tasks')).json();assert.equal(before.jobs[0].status,'interrupted');assert.equal(before.jobs[0].id,receipt.id);assert.equal(before.jobs[0].url,undefined);assert.equal(before.recovery.active,0);
 assert.equal((await request('/tasks',undefined,'https://untrusted.invalid')).status,403);
 const resume=await request('/tasks/http-receipt/resume',{});assert.equal(resume.status,400);assert.match((await resume.json()).error,/Configure.*downloader/);
 const cancelled=await(await request('/tasks/http-receipt/cancel',{})).json();assert.equal(cancelled.job.status,'cancelled');assert.equal(JSON.parse(readFileSync(manifest)).jobs[0].status,'cancelled');
 const youtube=await(await request('/youtube/downloads')).json();assert.equal(youtube.taskRecovery,true);assert.equal(youtube.jobs[0].status,'cancelled');assert.equal(youtube.configured,false);
 console.log(JSON.stringify({ok:true,checks:['isolated real HTTP service advertises protocol 1 and task receipts','restart exposes interrupted work with no active process','public receipts omit URLs and enforce the origin gate','missing downloader blocks resume without native execution','cancel writes the same receipt atomically and YouTube reads the same outcome'],limitations:'Disposable copied Companion, approved temporary root and empty executable PATH. No user service was restarted, tool installed, model loaded, media downloaded or signed-in session read.'},null,2));
}finally{
 if(child&&child.exitCode===null){const exited=new Promise(res=>child.once('exit',res));child.kill();await Promise.race([exited,new Promise(res=>setTimeout(res,8000))]);if(child.exitCode===null){child.kill('SIGKILL');await exited;}}
 assert(realpathSync(root).startsWith(parent+sep+'companion-http-'));rmSync(root,{recursive:true,force:true});
}
