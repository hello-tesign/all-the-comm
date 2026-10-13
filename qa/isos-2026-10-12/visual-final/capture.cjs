const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const out = __dirname;
const base = 'http://127.0.0.1:4173';
const records = [], errors = [], blockedWrites = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'no-preference'});
  await context.route('**/*', route => {
    const method = route.request().method();
    if (!['GET','HEAD','OPTIONS'].includes(method)) { blockedWrites.push({method,url:route.request().url()}); return route.abort(); }
    return route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  async function shot(name) { await page.screenshot({path:path.join(out,name+'.png')}); }
  async function move(selector, top=160) {
    await page.locator(selector).first().evaluate((el,top) => scrollTo({top:el.getBoundingClientRect().top+scrollY-top,behavior:'instant'}),top);
    await wait(1300);
  }
  async function record(label) {
    records.push({label,...await page.evaluate(() => ({url:location.href,scrollY,viewport:[innerWidth,innerHeight],width:document.documentElement.scrollWidth,activeStep:document.querySelector('.process-chapters')?.dataset.activeStep,activeRole:document.querySelector('.discipline-nav [aria-selected=true]')?.textContent,sceneReady:document.documentElement.className,images:[...document.querySelectorAll('main img')].filter(x=>{const r=x.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}).map(x=>({src:x.currentSrc,loaded:x.complete&&x.naturalWidth>0,width:x.clientWidth,height:x.clientHeight,fit:getComputedStyle(x).objectFit})),stage:(()=>{let e=document.querySelector('.process-cinema');if(!e)return null;let r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,position:getComputedStyle(e).position,links:[...e.querySelectorAll('a')].map(x=>{let r=x.getBoundingClientRect();let hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {text:x.textContent,top:r.top,bottom:r.bottom,reachable:r.top>=0&&r.bottom<=innerHeight,uncovered:!!hit&&x.contains(hit)}})}})()}))});
  }
  for (const [label,url] of [['about','/about/'],['process','/process/'],['team','/team/'],['works','/works/'],['home','/'],['contact','/contact/'],['privacy','/privacy/']]) {
    await page.goto(base+url,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await wait(1800);
    await shot(label+'-top'); await record(label+' top');
    if(label==='about') {
      await move('.about-story',125); await shot('about-reading'); await record('about reading');
      await move('.principles-section',145); await shot('about-principles');
    }
    if(label==='process') {
      for(let i=1;i<=4;i++) { await move('#step-'+i,160); await shot('process-step-'+i); await record('process step '+i); }
      await page.locator('.process-cinema-nav a').nth(1).click(); await wait(1400); await shot('process-nav-click'); await record('process nav click');
      for(const height of [700,600]) {
        await page.setViewportSize({width:1440,height}); await move('#step-2',160); await shot('process-short-'+height); await record('process short '+height);
      }
      await page.setViewportSize({width:1440,height:1000});
    }
    if(label==='team') {
      await move('.discipline-stage',155); await shot('team-role-1'); await record('team role 1');
      await page.locator('.discipline-nav button').nth(6).click(); await wait(220); await shot('team-switch-220ms');
      await wait(1200); await shot('team-role-7'); await record('team role 7');
      await page.locator('.discipline-nav button').nth(8).focus(); await page.keyboard.press('Enter'); await wait(1200); await shot('team-role-9'); await record('team role 9');
    }
    if(label==='works'||label==='home') {
      await move('#projects',145); await shot(label+'-projects-heading'); await record(label+' projects heading');
      const cards=page.locator('[data-project-card]');
      for(let i=0;i<Math.min(await cards.count(),3);i++) { await move('[data-project-card]:nth-child('+(i+1)+')',150); await shot(label+'-project-'+(i+1)); await record(label+' project '+(i+1)); }
    }
    if(label==='contact') { await move('#inquiry-form',140); await page.locator('input[name=company]').focus(); await wait(300); await shot('contact-form'); await record('contact form'); }
    if(label==='privacy') { await move('.policy',150); await shot('privacy-reading'); await record('privacy reading'); }
  }
  await fs.writeFile(path.join(out,'observations.json'),JSON.stringify({generated:new Date().toISOString(),records,errors,blockedWrites},null,2));
  await browser.close();
  console.log(JSON.stringify({records:records.length,errors,blockedWrites:blockedWrites.length,out}));
})().catch(error=>{console.error(error);process.exitCode=1});
