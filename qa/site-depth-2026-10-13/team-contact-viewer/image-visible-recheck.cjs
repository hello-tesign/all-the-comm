const {webkit}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');
(async()=>{
 const out=path.join(__dirname,'final'),checks=[],errors=[],writes=[];
 const browser=await webkit.launch(),context=await browser.newContext({viewport:{width:1440,height:900},locale:'ko-KR'});
 await context.route('**/*',r=>{if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();writes.push(r.request().url());return r.abort();});
 const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
 for(const name of ['team','contact']){
  await page.goto('http://127.0.0.1:4173/'+name+'/',{waitUntil:'networkidle'});const wrapper=name==='team'?'.team-proof':'.contact-guide';
  for(const img of await page.locator(wrapper+' img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>Promise.race([i.decode(),new Promise(resolve=>setTimeout(resolve,3000))]));await page.waitForFunction(src=>{const i=[...document.images].find(i=>i.getAttribute('src')===src);return i?.complete&&i.naturalWidth>0;},await img.getAttribute('src'));}
  await page.waitForTimeout(700);const detail=await page.locator(wrapper+' img').evaluateAll(es=>es.map(i=>{const r=i.getBoundingClientRect();return{loaded:i.complete&&i.naturalWidth>0,src:i.getAttribute('src'),natural:[i.naturalWidth,i.naturalHeight],rendered:[r.width,r.height],ratio:Math.abs(r.width/r.height-i.naturalWidth/i.naturalHeight)<.005};}));
  checks.push({name:'webkit-'+name+'-1440 original image ratios',passed:detail.length===2&&detail.every(i=>i.loaded&&i.ratio),detail});
  await page.screenshot({path:path.join(out,'webkit-'+name+'-1440-visible-image-recheck.png')});
 }
 await browser.close();const retest={date:new Date().toISOString(),checks,errors,writes};await fs.writeFile(path.join(out,'image-visible-recheck.json'),JSON.stringify(retest,null,2));
 const final=JSON.parse(await fs.readFile(path.join(out,'results-before-lazy-visibility.json'),'utf8'));
 for(const replacement of checks){const index=final.checks.findIndex(c=>c.name===replacement.name);if(index<0)throw Error('Unknown check');final.checks[index]={...replacement,recheckedAt:retest.date};}
 final.recheck={path:'image-visible-recheck.json',reason:'Reveal lazy images in viewport before measuring natural dimensions',date:retest.date};final.errors.push(...errors);final.writes.push(...writes);
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify(final,null,2));
 console.log(JSON.stringify({rechecked:checks.length,uniqueChecks:final.checks.length,passed:final.checks.filter(c=>c.passed).length,failed:final.checks.filter(c=>!c.passed),errors,writes},null,2));if(checks.some(c=>!c.passed)||errors.length||writes.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
