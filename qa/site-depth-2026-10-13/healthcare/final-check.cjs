const {chromium,firefox,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const output=path.join(__dirname,'final');
fs.mkdirSync(output,{recursive:true});
const results={scope:'Read-only healthcare path, final integrated build',base,routes:[],checks:[],errors:[],blockedWrites:[]};
const check=(route,name,pass,detail)=>results.checks.push({route,name,pass:Boolean(pass),detail});
const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};};
(async()=>{
 for(const [browserName,type]of Object.entries({chromium,firefox,webkit}).filter(([name])=>!process.env.BROWSERS||process.env.BROWSERS.split(',').includes(name))){
  let browser;
  try{browser=await type.launch();}catch(error){results.errors.push({browser:browserName,launch:error.message});continue;}
  try{
   for(const width of [1440,390]){
    const route=browserName+'-'+width;
    const context=await browser.newContext({viewport:{width,height:width===390?844:1000},locale:'ko-KR'});
    await context.route('**/*',r=>{
     if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();
     results.blockedWrites.push({route,method:r.request().method(),url:r.request().url()});return r.abort();
    });
    const page=await context.newPage();
    page.on('pageerror',error=>results.errors.push({route,error:error.message}));
    const row={route,width};
    const view=async(selector)=>page.locator(selector).evaluate(el=>{
     const r=el.getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect();
     return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,headerBottom:h.bottom,viewportHeight:innerHeight,viewportWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollY};
    });
    try{
     await page.goto(base+'/',{waitUntil:'networkidle'});
     const homeLink=page.locator('.healthcare-home a');
     row.homeHref=await homeLink.getAttribute('href');
     check(route,'HOME links to healthcare section',row.homeHref==='/about/#healthcare-expertise',row.homeHref);
     await homeLink.click();
     await page.waitForURL('**/about/#healthcare-expertise');
     await page.waitForLoadState('networkidle');
     await page.evaluate(()=>document.fonts.ready);
     await page.waitForTimeout(1500);
     row.about=await view('#healthcare-about-title');
     row.aboutText=await page.locator('.healthcare-about').innerText();
     row.bodyRhythm=await page.locator('.healthcare-about-intro p').last().evaluate(el=>{const c=getComputedStyle(el);return{fontSize:c.fontSize,lineHeight:c.lineHeight,ratio:parseFloat(c.lineHeight)/parseFloat(c.fontSize)};});
     check(route,'ABOUT exact anchor URL',new URL(page.url()).hash==='#healthcare-expertise',page.url());
     check(route,'ABOUT healthcare title clears fixed header',row.about.top>=row.about.headerBottom-2,row.about);
     check(route,'ABOUT healthcare title fully visible on arrival',row.about.bottom<=row.about.viewportHeight+2,row.about);
     check(route,'ABOUT no horizontal overflow',row.about.scrollWidth<=width,row.about.scrollWidth);
     check(route,'ABOUT professional experience readable',row.aboutText.includes('의학전문기자와')&&row.aboutText.includes('병원 홍보팀장')&&row.aboutText.includes('출신의 경험'),null);
     check(route,'ABOUT partners preserve past-source label',row.aboutText.includes('소개해 온 의료 분야 파트너')&&row.aboutText.includes('기존 홈페이지의 파트너 소개에서'),null);
     await page.screenshot({path:path.join(output,route+'-about-arrival.png')});
     row.aboutHref=await page.locator('.healthcare-about-link').getAttribute('href');
     check(route,'ABOUT links to hospital tab',row.aboutHref==='/works/#hospital',row.aboutHref);
     await page.locator('.healthcare-about-link').click();
     await page.waitForURL('**/works/#hospital');
     await page.waitForLoadState('networkidle');
     await page.waitForTimeout(1000);
     row.hospitalTab=await view('[data-service-choice=hospital]');
     row.hospitalSelected=await page.locator('[data-service-choice=hospital]').getAttribute('aria-selected');
     row.hospitalPanelVisible=await page.locator('[data-service-panel=hospital]').isVisible();
     check(route,'WORKS hospital tab selected',row.hospitalSelected==='true',row.hospitalSelected);
     check(route,'WORKS hospital panel visible',row.hospitalPanelVisible,null);
     check(route,'WORKS selected tab clears header',row.hospitalTab.top>=row.hospitalTab.headerBottom-2,row.hospitalTab);
     check(route,'WORKS selected tab visible on arrival',row.hospitalTab.bottom<=row.hospitalTab.viewportHeight+2,row.hospitalTab);
     check(route,'WORKS no horizontal overflow',row.hospitalTab.scrollWidth<=width,row.hospitalTab.scrollWidth);
     check(route,'WORKS editorial example identified',await page.locator('.healthcare-service').innerText().then(t=>t.includes('기획 구성 예시')&&t.includes('의료진 인터뷰 질문지')),null);
     await page.screenshot({path:path.join(output,route+'-hospital-arrival.png')});
     const inquiryLink=page.locator('[data-service-panel=hospital] .capability-copy a');
     row.inquiryHref=await inquiryLink.getAttribute('href');
     check(route,'WORKS consultation carries hospital service',row.inquiryHref==='/contact/?service=hospital',row.inquiryHref);
     await inquiryLink.click();
     await page.waitForURL('**/contact/?service=hospital');
     await page.waitForLoadState('networkidle');
     row.hospitalChecked=await page.locator('input[name=services][value=hospital]').isChecked();
     check(route,'CONTACT hospital checkbox selected',row.hospitalChecked,null);
     const label=page.locator('label').filter({has:page.locator('input[name=services][value=hospital]')});
     await label.scrollIntoViewIfNeeded();
     await page.waitForTimeout(300);
     row.contact=await view('input[name=services][value=hospital]');
     row.contactLabel=await label.evaluate(el=>{const r=el.getBoundingClientRect(),h=document.querySelector('.site-header').getBoundingClientRect();return{top:r.top,bottom:r.bottom,headerBottom:h.bottom,viewportHeight:innerHeight};});
     check(route,'CONTACT chosen service not obscured',row.contactLabel.top>=row.contactLabel.headerBottom-2&&row.contactLabel.bottom<=row.contactLabel.viewportHeight+2,row.contactLabel);
     check(route,'CONTACT no horizontal overflow',row.contact.scrollWidth<=width,row.contact.scrollWidth);
     await page.screenshot({path:path.join(output,route+'-contact-selection.png')});
    }catch(error){results.errors.push({route,error:error.message});check(route,'path completes',false,error.message);}
    finally{results.routes.push(row);await context.close();}
   }
  }finally{await browser.close();}
  fs.writeFileSync(path.join(output,process.env.BROWSERS?'results-'+process.env.BROWSERS.replaceAll(',','-')+'.json':'results.json'),JSON.stringify(results,null,2));
 }
 results.summary={routes:results.routes.length,checks:results.checks.length,passed:results.checks.filter(x=>x.pass).length,failed:results.checks.filter(x=>!x.pass).length,errors:results.errors.length,writeRequests:results.blockedWrites.length};
 fs.writeFileSync(path.join(output,process.env.BROWSERS?'results-'+process.env.BROWSERS.replaceAll(',','-')+'.json':'results.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify({summary:results.summary,failures:results.checks.filter(x=>!x.pass),errors:results.errors},null,2));
 if(results.summary.failed||results.summary.errors||results.summary.writeRequests)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
