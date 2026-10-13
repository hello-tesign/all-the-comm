const {chromium,firefox,webkit}=require('playwright');
const fs=require('node:fs/promises');const path=require('node:path');
const base=process.env.TEST_URL||'http://127.0.0.1:4173',out=path.resolve(__dirname,'final');
const checks=[],errors=[],writes=[],pages=[],panels=[];let currentPage,label='startup';
const routes=process.env.TEST_ROUTES?process.env.TEST_ROUTES.split(','):['/','/about/','/process/','/team/','/works/','/contact/','/privacy/','/works/project/all-the-comm/','/works/project/sojukdoo-concept/'];
const abstract='.hero-art,.hero-art__fallback,#brand-canvas,.glass-plane,.service-symbol,.work-art,.work-screen,.work-poster,.process-word,.channel-composition,.channel-sheet,.about-brand,.principle-mark,.chapter-orbit,.discipline-art,.discipline-word,.discipline-lens,.discipline-orbit';
function check(name,passed,detail){checks.push({name,passed:!!passed,...(detail===undefined?{}:{detail})});if(!passed)console.error('FAIL '+name+' '+JSON.stringify(detail));}
async function go(page,url){const response=await page.goto(base+url,{waitUntil:'load'});await page.waitForTimeout(1500);check(label+' HTTP 200',response.status()===200,response.status());}
async function loadImages(locator){return locator.evaluateAll(async imgs=>Promise.all(imgs.map(async img=>{if(!img.complete)await new Promise(resolve=>{const finish=()=>{clearTimeout(timer);img.removeEventListener('load',finish);img.removeEventListener('error',finish);resolve();};const timer=setTimeout(finish,2500);img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});});await Promise.race([img.decode().catch(()=>{}),new Promise(r=>setTimeout(r,2500))]);return {src:img.getAttribute('src'),alt:img.alt,loaded:img.complete&&img.naturalWidth>0};})));}
async function allShownImages(page){
 const images=page.locator('main img');const checked=[];
 for(let i=0;i<await images.count();i++){const image=images.nth(i);if(!await image.isVisible())continue;await image.scrollIntoViewIfNeeded();checked.push(...await loadImages(image));}
 check(label+' all displayed content images load with alt',checked.every(i=>i.loaded&&i.alt.trim()),checked.filter(i=>!i.loaded||!i.alt.trim()));return checked;
}
async function selected(page,buttons,index,panelSelector){
 const state=await buttons.evaluateAll((items,{index,panelSelector})=>({selected:items.filter(b=>b.getAttribute('aria-selected')==='true').map(b=>b.id),expected:items[index].id,focus:items[index]===document.activeElement,tabStops:items.filter(b=>b.tabIndex===0).length,visible:[...document.querySelectorAll(panelSelector)].filter(p=>!p.hidden&&p.checkVisibility()).map(p=>p.id),controlled:items[index].getAttribute('aria-controls')}),{index,panelSelector});
 return state.selected.length===1&&state.selected[0]===state.expected&&state.tabStops===1&&state.visible.length===1&&state.visible[0]===state.controlled;
}
async function hero(page){
 const buttons=page.locator('[data-evidence-select]'),frames='.evidence-hero-frame';
 check(label+' hero has three meaningful scenes',await buttons.count()===3&&await page.locator(frames).count()===3);
 const expected=['소적두','SoulReset','Tesign OS'];
 for(let i=0;i<3;i++){await buttons.nth(i).click();const panel=page.locator(frames).nth(i);const text=await panel.innerText();const images=await loadImages(panel.locator('img'));
  check(label+' hero scene '+(i+1)+' selected and labelled',await selected(page,buttons,i,frames)&&text.includes(expected[i])&&/기존|제작자|콘셉트|검수용/.test(text),text);
  check(label+' hero scene '+(i+1)+' real image and case link',images.length===1&&images.every(p=>p.loaded&&p.alt)&&!!await panel.locator('a[href^="/works/project/"]').count(),images);
  check(label+' hero scene '+(i+1)+' stable height and readable caption',await panel.evaluate(el=>{const box=el.getBoundingClientRect(),caption=el.querySelector('.evidence-hero-caption').getBoundingClientRect();return Math.abs(box.height-640)<2&&caption.top>=box.top-1&&caption.bottom<=box.bottom+1;}));
 }
 for(const [key,index] of [['Home',0],['ArrowRight',1],['End',2],['ArrowRight',0],['ArrowLeft',2]]){await page.keyboard.press(key);check(label+' hero keyboard '+key+' reaches '+index,await selected(page,buttons,index,frames)&&await buttons.nth(index).evaluate(el=>el===document.activeElement));}
 await buttons.first().click();await page.evaluate(()=>scrollTo(0,0));
}
async function capabilities(page,isTeam=false){
 const tabs=page.locator('[data-capabilities] [role=tab]'), expectedCount=isTeam?9:page.url().endsWith('/works/')?10:8;
 check(label+' capability count '+expectedCount,await tabs.count()===expectedCount);
 const roleKinds=['strategy','digital','content','content','video','media','influencer','it','pr'];
 for(let i=0;i<expectedCount;i++){
  await tabs.nth(i).click();const control=await tabs.nth(i).getAttribute('aria-controls'),panel=page.locator('#'+control),kind=await panel.locator('[data-evidence-kind]').getAttribute('data-evidence-kind');
  const expectedKind=isTeam?roleKinds[i]:await tabs.nth(i).getAttribute('data-service-choice');
  const text=await panel.innerText(),images=await loadImages(panel.locator('.evidence-visual img'));
  const sampleCount=await panel.locator('.sample-output').count();
  const detail={index:i,kind,expectedKind,title:await panel.locator('h3').innerText(),text,images,sampleCount};panels.push({label,...detail});
  check(label+' panel '+i+' matches task and one selected',kind===expectedKind&&await selected(page,tabs,i,'[data-service-panel]'),detail);
  check(label+' panel '+i+' concrete output with honest status',/예시|제작자|콘셉트|내부 도구/.test(text)&&(images.length>0||sampleCount===1)&&images.every(p=>p.loaded&&p.alt.trim()),detail);
  const copy=await panel.locator('.capability-copy,.discipline-copy').evaluate(el=>{let p=el;while(p){if(Number(getComputedStyle(p).opacity)!==1)return false;p=p.parentElement;}return el.checkVisibility()&&el.getBoundingClientRect().height>0;});
  check(label+' panel '+i+' answer text fully visible',copy);
 }
 await tabs.last().focus();for(const [key,index] of [['Home',0],['ArrowRight',1],['End',expectedCount-1]]){await page.keyboard.press(key);check(label+' capability keyboard '+key,await selected(page,tabs,index,'[data-service-panel]')&&await tabs.nth(index).evaluate(el=>el===document.activeElement));}
 await tabs.first().click();
}
async function processStages(page){
 const articles=page.locator('.process-chapter'),arts=page.locator('.evidence-chapter');
 check(label+' four original stages and four evidence scenes',await articles.count()===4&&await arts.count()===4&&await page.locator('.process-cinema-nav a').count()===4);
 const expected=['기존 상품 사진','브랜드·패키지','웹 콘셉트','검수용 데이터'];
 for(let i=0;i<4;i++){
  await articles.nth(i).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-innerHeight*.3,behavior:'instant'}));await page.waitForTimeout(160);
  const art=arts.nth(i),text=await art.innerText(),images=await loadImages(art.locator('img'));
  check(label+' stage '+(i+1)+' active evidence matches caption',await page.locator('.process-chapters').getAttribute('data-active-step')===String(i+1)&&await art.evaluate(el=>el.classList.contains('is-current'))&&text.includes(expected[i]),text);
  check(label+' stage '+(i+1)+' image loads',images.length===1&&images.every(p=>p.loaded&&p.alt.trim()),images);
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);
 check(label+' live reduced restores four inline images',await page.locator('.process-cinema,.process-cinema-nav,.site-reading-progress').count()===0&&await page.locator('.process-chapter > .chapter-art.evidence-chapter').count()===4);
 check(label+' reduced removes motion modules',await page.evaluate(()=>!document.documentElement.classList.contains('evidence-motion-enabled')&&!document.documentElement.classList.contains('isos-story-enabled')));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(160);
 check(label+' restoring motion has one scene and line',await page.locator('.process-cinema').count()===1&&await page.locator('.site-reading-progress').count()===1&&await arts.count()===4);
}
async function reducedHome(page){
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(120);await page.locator('[data-evidence-select]').nth(2).click();
 check(label+' reduced hero selection remains usable',await selected(page,page.locator('[data-evidence-select]'),2,'.evidence-hero-frame')&&await page.locator('.evidence-motion-media,.is-evidence-revealing').count()===0);
 const clip=await page.locator('.evidence-hero-frame').nth(2).locator('img').evaluate(el=>({clip:getComputedStyle(el).clipPath,opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform}));
 check(label+' reduced scene is unmasked and opaque',clip.clip==='none'&&clip.opacity==='1'&&clip.transform==='none',clip);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(120);await page.locator('[data-evidence-select]').first().click();
}
async function homeProcess(page){
 const buttons=page.locator('[data-process-step]'),items=page.locator('[data-process-panel]');
 check(label+' home process retains four steps',await buttons.count()===4&&await items.count()===4);
 for(let i=0;i<4;i++){
  await buttons.nth(i).click();const panel=items.nth(i),caption=await panel.locator('figcaption').innerText(),images=await loadImages(panel.locator('img'));
  check(label+' home process '+(i+1)+' selected output loads',await buttons.nth(i).getAttribute('aria-pressed')==='true'&&await items.evaluateAll(es=>es.filter(e=>!e.hidden).length)===1&&images.length===1&&images.every(image=>image.loaded&&image.alt.trim()),images);
  check(label+' home process '+(i+1)+' example provenance is visible',/기존.*사진|분석 대상|콘셉트|검수용|내부 도구/.test(caption),caption);
 }
 await buttons.first().click();
}
async function selfViewer(page){
 const buttons=page.locator('[data-case-cover] .capture-open,.case-film .capture-open');
 check(label+' both self case captures can enlarge',await buttons.count()===2);
 for(let i=0;i<await buttons.count();i++){
  const button=buttons.nth(i),src=await button.locator('img').evaluate(el=>el.currentSrc||el.src);await button.click();
  check(label+' self viewer '+i+' opens correct capture',await page.locator('#capture-viewer').isVisible()&&await page.locator('#capture-viewer img').getAttribute('src')===src);
  await page.keyboard.press('Escape');
  check(label+' self viewer '+i+' Escape restores focus',!await page.locator('#capture-viewer').isVisible()&&await button.evaluate(el=>el===document.activeElement));
 }
}
async function englishBaseline(){
 const baseline=JSON.parse(await fs.readFile(path.resolve(__dirname,'before/baseline.json'),'utf8'));
 for(const old of baseline.pages.filter(p=>p.locale==='en')){
  const response=await fetch(base+old.route),html=await response.text(),classes=[...html.matchAll(/class="([^"]*)"/g)].flatMap(m=>m[1].split(/\s+/));
  const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>({src:m[0].match(/\bsrc="([^"]*)"/)?.[1],alt:m[0].match(/\balt="([^"]*)"/)?.[1]}));
  const headings=[...html.matchAll(/<(h[12])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(m=>({tag:m[1],text:m[2].replace(/<br\s*\/?\s*>/g,'\n').replace(/<[^>]*>/g,'')}));
  const counts=Object.fromEntries(Object.keys(old.abstract).map(k=>[k,k==='brand-canvas'?(html.includes('id="brand-canvas"')?1:0):classes.filter(c=>c===k).length]));
  check('EN SSR '+old.route+' original headings images and graphic inventory preserved',response.status===200&&JSON.stringify(images)===JSON.stringify(old.images)&&JSON.stringify(headings)===JSON.stringify(old.headings)&&JSON.stringify(counts)===JSON.stringify(old.abstract),{headingsEqual:JSON.stringify(headings)===JSON.stringify(old.headings),imagesEqual:JSON.stringify(images)===JSON.stringify(old.images),countsEqual:JSON.stringify(counts)===JSON.stringify(old.abstract)});
 }
}
async function run(){await fs.mkdir(out,{recursive:true});
 const wanted=new Set((process.env.TEST_BROWSERS||'chromium,firefox,webkit').split(','));
 for(const [engineName,engine]of Object.entries({chromium,firefox,webkit})){if(!wanted.has(engineName))continue;label=engineName+' startup';const browser=await engine.launch();try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',locale:'ko-KR'});await context.route('**/*',r=>{if(['GET','HEAD','OPTIONS'].includes(r.request().method()))return r.continue();writes.push({method:r.request().method(),url:r.request().url()});return r.abort();});
  const page=await context.newPage();currentPage=page;page.on('pageerror',e=>errors.push({engine:engineName,url:page.url(),message:e.message}));
  for(const route of routes){label=engineName+' '+route;await go(page,route);
   check(label+' meaningful imagery mode active',await page.locator('body.evidence-site').count()===1);
   check(label+' no abstract decorative constructs',await page.locator(abstract).count()===0,await page.locator(abstract).evaluateAll(es=>es.map(e=>e.className||e.id)));
   check(label+' official five menus and separate CTA',JSON.stringify(await page.locator('.desktop-nav>a').allTextContents())===JSON.stringify(['ABOUT US','OUR PROCESS','TEAM','WORKS','CONTACT'])&&await page.locator('.header-cta').count()===1);
   if(route==='/'){await hero(page);await reducedHome(page);await capabilities(page);await homeProcess(page);}
   if(route==='/works/')await capabilities(page);
   if(route==='/team/')await capabilities(page,true);
   if(route==='/process/')await processStages(page);
   if(route==='/works/project/all-the-comm/'){check(label+' self case uses actual enquiry output and no brand film',await page.locator('[data-case-cover] img[src*="allthecomm-inquiry"],.case-film img[src*="allthecomm-inquiry"]').count()===2&&await page.locator('.case-film video').count()===0);await selfViewer(page);}
   const images=await allShownImages(page);
   if(route==='/works/project/all-the-comm/'){
    const dimensions=await page.locator('[data-case-cover] img,.case-film img').evaluateAll(imgs=>imgs.map(img=>({width:img.getAttribute('width'),height:img.getAttribute('height'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight})));
    check(label+' enquiry captures reserve the correct intrinsic proportions',dimensions.length===2&&dimensions.every(i=>i.width>0&&i.height>0&&Math.abs(Number(i.width)/Number(i.height)-i.naturalWidth/i.naturalHeight)<.001),dimensions);
    const cover=await page.locator('[data-case-cover]').evaluate(el=>{const box=el.getBoundingClientRect(),img=el.querySelector('img').getBoundingClientRect();return {inside:img.top>=box.top-1&&img.bottom<=box.bottom+1&&img.left>=box.left-1&&img.right<=box.right+1,container:{width:box.width,height:box.height},image:{width:img.width,height:img.height}};});
    check(label+' self cover photograph stays within its visible frame',cover.inside,cover);
   }
   check(label+' no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,engineName+'-'+(route.replace(/^\/+|\/+$/g,'').replaceAll('/','-')||'home')+'.png')});pages.push({engine:engineName,route,images});
  }
  if(process.env.TEST_SKIP_EN!=='1'){
   label=engineName+' EN home';await go(page,'/en/');check(label+' old hero and eight symbols retained',await page.locator('#brand-canvas').count()===1&&await page.locator('.service-symbol').count()===8&&await page.locator('[data-evidence-hero],.evidence-visual').count()===0&&await page.locator('html.evidence-motion-enabled').count()===0);
   label=engineName+' EN process';await go(page,'/en/process/');check(label+' old four stages retained',await page.locator('.chapter-orbit').count()===4&&await page.locator('.process-cinema,.evidence-chapter').count()===0);
  }
  console.log(engineName+' evidence UI completed');
 }finally{await browser.close();}}
 if(process.env.TEST_SKIP_EN!=='1')await englishBaseline();check('No browser JavaScript errors',errors.length===0,errors);check('No inquiry or mutation attempted',writes.length===0,writes);
}
run().catch(async error=>{check(label+' execution completed',false,error.stack||error.message);if(currentPage)await currentPage.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}).finally(async()=>{await fs.mkdir(out,{recursive:true});const result={date:new Date().toISOString(),scope:'Local meaningful imagery UI only, GET-only; no inquiry submission or store modification',base,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,errors,writes,pages,panels};await fs.writeFile(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:result.passed,failed:result.failed,pages:pages.length,errors:errors.length,writes:writes.length}));if(result.failed)process.exitCode=1;});
