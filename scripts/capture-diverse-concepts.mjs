import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {diverseSample} from '../src/diverse-samples.mjs';
await fs.mkdir('qa/diversity-2026-10-13/concepts',{recursive:true});
await fs.cp('public/evidence/diverse','dist/evidence/diverse',{recursive:true});
const css=await fs.readFile('src/diverse-samples.css','utf8');
const browser=await chromium.launch();
const results=[];
try{
 const page=await browser.newPage({viewport:{width:1200,height:1200},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 for(const [kind,file] of [['media','concept-city-culture.png'],['hospital','concept-patient-guide.png']]){
  const html=`<!doctype html><html lang="ko"><head><base href="http://127.0.0.1:4173/"><meta charset="UTF-8"><style>@font-face{font-family:Pretendard;src:url('/fonts/PretendardVariable.woff2')}*{box-sizing:border-box}body{margin:0}#cover{position:relative;width:1200px;height:1200px;overflow:hidden;background:${kind==='media'?'#e2f13c':'#e4ebe4'}}#paper{position:absolute;left:0;top:0;width:680px;transform-origin:top left}a{color:inherit}${css}</style></head><body><main id="cover"><div id="paper">${diverseSample(kind)}</div></main></body></html>`;
  await page.setContent(html,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});
  const result=await page.evaluate(()=>{const paper=document.querySelector('#paper'),box=paper.getBoundingClientRect();const scale=Math.min(1120/box.width,1120/box.height);paper.style.transform=`scale(${scale})`;paper.style.left=(1200-box.width*scale)/2+'px';paper.style.top=(1200-box.height*scale)/2+'px';return {size:[1200,1200],paper:[box.width,box.height],scale,images:[...document.images].map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0}))};});
  if(result.images.some(img=>!img.loaded))throw Error('Concept image missing');
  await page.locator('#cover').screenshot({path:'public/portfolio/'+file});
  await fs.writeFile('qa/diversity-2026-10-13/concepts/'+kind+'.html',html);
  results.push({kind,file,...result});
 }
 await fs.writeFile('qa/diversity-2026-10-13/concepts/results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
}finally{await browser.close();}
