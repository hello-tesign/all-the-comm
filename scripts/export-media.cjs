const fs=require('node:fs');const path=require('node:path');
let pw;try{pw=require('playwright')}catch{pw=require('C:/Users/home/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const {chromium}=pw;
const root=path.join(__dirname,'..');const out=path.join(root,'deliverables/social');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 const sources=fs.readdirSync(path.join(root,'dist/social')).filter(n=>/^\d\d-.*\.html$/.test(n));
 for(const file of sources){await page.goto('http://127.0.0.1:4173/social/'+file);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(out,file.replace('.html','.png'))});}
 await page.setViewportSize({width:1200,height:630});await page.goto('http://127.0.0.1:4173/social/og.html');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(root,'public/og.png')});fs.copyFileSync(path.join(root,'public/og.png'),path.join(root,'dist/og.png'));await page.close();
 for(let i=1;i<=3;i++){
  const context=await browser.newContext({viewport:{width:1080,height:1920},recordVideo:{dir:path.join(out,'recordings'),size:{width:1080,height:1920}}});
  const motion=await context.newPage();await motion.goto('http://127.0.0.1:4173/social/motion-'+i+'.html');await motion.evaluate(()=>document.fonts.ready);
  await motion.waitForTimeout(8200);const video=motion.video();await context.close();await video.saveAs(path.join(out,'motion-'+i+'.webm'));await video.delete();
 }
 console.log('Exported 9 PNG posts (1080×1350), 3 WebM motion studies (1080×1920), and OG image.');
}finally{await browser.close();}})();
