const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const path=require('node:path');
const out=path.resolve(__dirname,'references');
const sites=[['plus-x','https://www.plus-ex.com/'],['dfy','https://dfy.co.kr/'],['innocean','https://www.innocean.com/'],['basic-dept','https://www.basicagency.com'],['instrument','https://instrument.com/'],['collins','https://wearecollins.com/']];
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch(); const results=[];
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',locale:'en-US'});
 await context.route('**/*',route=>['GET','HEAD','OPTIONS'].includes(route.request().method())?route.continue():route.abort());
 async function inspect([name,url]){
  const page=await context.newPage();const r={name,url,date:new Date().toISOString(),errors:[]};
  page.on('pageerror',e=>r.errors.push(e.message));
  const timer=setTimeout(()=>page.close().catch(()=>{}),30000);
  try{
   try{const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});r.status=response?.status();}catch(e){r.navigationError=e.message;}
   await page.waitForTimeout(3500);
   r.finalUrl=page.url();r.title=await page.title();
   r.top=await snapshot(page);await page.screenshot({path:path.join(out,name+'-top.png'),timeout:5000});
   await page.evaluate(()=>scrollTo({top:Math.max(0,(document.documentElement.scrollHeight-innerHeight)*.45),behavior:'instant'}));
   await page.waitForTimeout(1600);r.middle=await snapshot(page);await page.screenshot({path:path.join(out,name+'-middle.png'),timeout:5000});
   r.captured=!r.finalUrl.startsWith('chrome-error:') && !!(r.top.bodyText.trim() || r.top.images.length || r.top.videos.length || r.top.canvases);
  }catch(e){r.captureError=e.message;}finally{clearTimeout(timer);await page.close().catch(()=>{});results.push(r);console.log(name+': '+(r.captured?'captured':'blocked'));}
 }
 async function snapshot(page){return page.evaluate(()=>({scrollY,scrollHeight:document.documentElement.scrollHeight,bodyText:document.body.innerText.slice(0,12000),headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>e.innerText).filter(Boolean).slice(0,30),images:[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.width>50}).map(i=>({alt:i.alt,src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),videos:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc,autoplay:v.autoplay,muted:v.muted,paused:v.paused,readyState:v.readyState})),canvases:document.querySelectorAll('canvas').length,animations:document.getAnimations().length,links:[...document.querySelectorAll('a[href]')].map(a=>({text:a.innerText.trim(),href:a.href})).filter(a=>a.text).slice(0,55)}));}
 for(let i=0;i<sites.length;i+=2)await Promise.all(sites.slice(i,i+2).map(inspect));
 await browser.close();await fs.writeFile(path.join(out,'results.json'),JSON.stringify({scope:'Public GET-only visual review; no assets reused; per-site time limit 30 seconds',results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
