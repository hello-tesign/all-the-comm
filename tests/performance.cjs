const {chromium}=require('playwright');
const fs=require('node:fs/promises');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();const results=[];
 try{
  for(const route of ['/','/en/','/contact/','/en/contact/']){
   const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
   const cdp=await page.context().newCDPSession(page);
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:500000,uploadThroughput:125000});
   await page.addInitScript(()=>{window.__vitals={lcp:0,cls:0};new PerformanceObserver(l=>{for(const e of l.getEntries())window.__vitals.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__vitals.cls+=e.value}).observe({type:'layout-shift',buffered:true})});
   await page.goto((process.env.TEST_URL||'http://127.0.0.1:4183')+route,{waitUntil:'load'});await page.waitForTimeout(5000);
   const value=await page.evaluate(()=>({...window.__vitals,resources:performance.getEntriesByType('resource').map(r=>({name:new URL(r.name).pathname,bytes:r.transferSize})),width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
   value.route=route;value.lcp=Math.round(value.lcp);value.cls=Number(value.cls.toFixed(4));
   value.noThreeOnContact=!route.includes('contact')||!value.resources.some(r=>r.name.includes('brand-scene'));
   value.pass=value.lcp<=2500&&value.cls<=0.1&&value.noThreeOnContact&&value.width===value.scrollWidth;
   results.push(value);await page.close();
  }
 }finally{await browser.close()}
 const summary={environment:'Local Chromium lab, cold cache, 390×844, CPU 4×, 4Mbps/80ms network emulation; not field Core Web Vitals',passed:results.filter(x=>x.pass).length,total:results.length,results};
 await fs.writeFile('qa/renewal-2026-10-12/performance.json',JSON.stringify(summary,null,2));console.log(JSON.stringify({...summary,results:results.map(({resources,...v})=>({...v,bytes:resources.reduce((n,r)=>n+r.bytes,0)}))},null,2));assert(results.every(x=>x.pass),'Local performance budget failed');
})().catch(e=>{console.error(e);process.exitCode=1});
