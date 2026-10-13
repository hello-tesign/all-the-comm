const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
let pw;try{pw=require('playwright')}catch{pw=require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const out=path.join(__dirname,'../qa/final');fs.mkdirSync(out,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../dist/build-manifest.json')));
const results=[];const failures=[];
function check(name,pass,detail=''){results.push({name,pass,detail});if(!pass)failures.push({name,detail});}
(async()=>{
for(const engine of ['chromium','firefox','webkit']){
 console.log('Starting browser: '+engine);
 const browser=await pw[engine].launch({headless:true,timeout:30000});
 try{
 const widths=engine==='chromium'?[360,390,768,1024,1440,1920]:[390,1440];
 for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:width<760?844:1000},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];const external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(base)&&/^https?:/.test(r.url()))external.push(r.url());});
 for(const route of manifest.pages){
  const response=await page.goto(base+route,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  check(`${engine}/${width}${route} status`,response.status()===200,String(response.status()));
  const facts=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,h1:document.querySelectorAll('h1').length,title:document.title,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,hiddenText:[...document.querySelectorAll('[data-reveal]')].some(e=>getComputedStyle(e).opacity==='0')}));
  check(`${engine}/${width}${route} layout`,facts.overflow<=1&&facts.h1===1&&facts.broken===0&&!facts.hiddenText,JSON.stringify(facts));
  if(width===390&&['/','/services/','/about/','/contact/','/work/all-the-comm/'].includes(route))await page.screenshot({path:path.join(out,`${engine}-mobile-${route.replaceAll('/','_')||'home'}.png`),fullPage:true});
  if(engine==='chromium'&&width===1440&&['/','/contact/','/services/'].includes(route))await page.screenshot({path:path.join(out,'desktop-'+route.replaceAll('/','_')+'.png'),fullPage:true});
 }
 check(`${engine}/${width} no JS errors`,errors.length===0,JSON.stringify(errors));
 check(`${engine}/${width} no third-party requests`,external.length===0,JSON.stringify(external));
 await context.close();console.log(`${engine} ${width}px: route checks complete`);
 }
 console.log(engine+': menu and inquiry interactions');
 const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();page.setDefaultTimeout(10000);
 await page.goto(base);await page.getByRole('button',{name:'메뉴',exact:true}).click();
 check(`${engine} mobile menu opens`,await page.locator('#mobile-menu').evaluate(d=>d.open));
 check(`${engine} mobile menu expanded`,await page.locator('.menu-toggle').getAttribute('aria-expanded')==='true');
 await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle'),null,{timeout:3000});
 check(`${engine} Escape closes and restores focus`,await page.evaluate(()=>!document.querySelector('#mobile-menu').open&&document.activeElement===document.querySelector('.menu-toggle')));
 await page.goto(base+'/contact/?service=design');
 check(`${engine} service preselected`,await page.locator('input[value="design"]').isChecked());
 await page.locator('.form-submit').click();
 check(`${engine} invalid form blocked`,await page.locator('.draft-result').isHidden());
 await page.getByRole('textbox',{name:'회사·기관명'}).fill('QA 검증용 회사');
 await page.getByRole('textbox',{name:'이름',exact:false}).fill('테스트 담당자');
 await page.getByRole('textbox',{name:'회신 이메일'}).fill('qa@example.com');
 await page.getByRole('textbox',{name:'프로젝트 이야기'}).fill('브랜드 홈페이지와 콘텐츠 제작에 대해 상담하고 싶습니다. 테스트이며 실제 발송하지 않습니다.');
 let writes=0;page.on('request',r=>{if(['POST','PUT','PATCH'].includes(r.method()))writes++;});
 await page.locator('.form-submit').click();
 const mail=await page.locator('#open-email').getAttribute('href');
 check(`${engine} prepared email has correct content`,mail.startsWith('mailto:allthecom1@gmail.com?')&&decodeURIComponent(mail).includes('QA 검증용 회사')&&decodeURIComponent(mail).includes('디자인·홈페이지'));
 check(`${engine} no false delivery and no server write`,writes===0&&(await page.locator('.draft-result').innerText()).includes('직접 보내주세요'));
 const downloadPromise=page.waitForEvent('download');await page.locator('#download-inquiry').click();const download=await downloadPromise;
 check(`${engine} inquiry text download`,download.suggestedFilename()==='ALL-THE-COMM-project-inquiry.txt');
 await context.close();
 }finally{await browser.close();}
}
const browser=await pw.chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:path.join(out,'motion'),size:{width:1440,height:1000}}});const page=await context.newPage();
 await page.goto(base);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
 const art=page.locator('[data-art]');const start=await art.evaluate(e=>getComputedStyle(e.querySelector('.art-letter')).transform);
 await page.mouse.move(1200,700);await page.evaluate(()=>scrollTo(0,450));await page.waitForTimeout(200);
 const end=await art.evaluate(e=>getComputedStyle(e.querySelector('.art-letter')).transform);
 check('hero motion responds to scroll/pointer',start!==end);
 await page.locator('.motion-toggle').click();const paused=await art.evaluate(e=>e.style.getPropertyValue('--art-p'));await page.evaluate(()=>scrollTo(0,200));await page.waitForTimeout(100);
 check('motion pause preserves frame',paused===await art.evaluate(e=>e.style.getPropertyValue('--art-p')));
 await page.locator('.motion-toggle').click();
 const scene=page.locator('[data-expression]');const position=await scene.evaluate(e=>e.offsetTop);
 for(const [i,offset] of [0,200,500].entries()){await page.evaluate(y=>scrollTo(0,y),position+offset);await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`motion-scene-${i}.png`)});}
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(250);await page.screenshot({path:path.join(out,'desktop-top.png')});
 await context.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const fallback=await nojs.newPage();
 await fallback.goto(base+'/contact/');check('no-JS contact uses safe direct links',await fallback.locator('#inquiry-form').isHidden()&&await fallback.locator('a[href="mailto:allthecom1@gmail.com"]').count()>0);
 await fallback.goto(base);check('no-JS main content and menu available',await fallback.locator('h1').isVisible()&&await fallback.locator('.desktop-nav').isVisible());await nojs.close();
 const page2=await browser.newPage();let notFound=await page2.goto(base+'/does-not-exist/');check('404 page and HTTP status',notFound.status()===404&&await page2.locator('h1').count()===1);
 const allLinks=new Set();for(const route of manifest.pages){await page2.goto(base+route);for(const href of await page2.locator('a[href]').evaluateAll(els=>els.map(e=>e.getAttribute('href'))))if(href.startsWith('/'))allLinks.add(href);}
 for(const href of allLinks){const url=new URL(href,base);const response=await page2.request.get(url.href);check('internal link '+href,response.ok(),String(response.status()));if(url.hash){await page2.goto(url.href);check('anchor exists '+href,await page2.locator(url.hash).count()===1);}}
 const og=await page2.request.get(base+'/og.png');check('social sharing image exists',og.ok()&&(og.headers()['content-type']||'').includes('image/'));
 const probe=await page2.request.get(base+'/%2e%2e%2fpackage.json');check('preview does not expose project source',probe.status()!==200);
}finally{await browser.close();}
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({total:results.length,passed:results.filter(r=>r.pass).length,failed:failures.length,results},null,2));
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.pass).length,failures},null,2));process.exitCode=failures.length?1:0;
})().catch(e=>{console.error(e);process.exitCode=1;fs.writeFileSync(path.join(out,'run-error.txt'),String(e.stack));});
