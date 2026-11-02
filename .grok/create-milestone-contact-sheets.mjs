import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
const prefix=process.argv[2]??'screenshots/all-pages-fixed-dev';
const audit=JSON.parse(await readFile(prefix+'.json','utf8'));
for(const mobile of [false,true]) {
 const cols=mobile?6:5,w=mobile?195:288,h=mobile?422:200,cell=h+28,overlays=[];
 for(const [i,p]of audit.pages.entries()) {
  const img=await sharp(prefix+'-'+(mobile?'mobile':'desktop')+'-'+p.id+'.png').resize(w,h,{fit:'contain',background:'#0b0b0f'}).toBuffer();
  overlays.push({input:img,left:(i%cols)*w,top:Math.floor(i/cols)*cell+28});
  overlays.push({input:Buffer.from('<svg width="'+w+'" height="28"><rect width="100%" height="100%" fill="#202632"/><text x="8" y="19" fill="white" font-size="14">'+p.name+'</text></svg>'),left:(i%cols)*w,top:Math.floor(i/cols)*cell});
 }
 await sharp({create:{width:w*cols,height:Math.ceil(audit.pages.length/cols)*cell,channels:3,background:'#0b0b0f'}}).composite(overlays).png().toFile(prefix+'-'+(mobile?'mobile':'desktop')+'-contact.png');
}
