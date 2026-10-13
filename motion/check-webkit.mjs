import {webkit} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await webkit.launch({headless:true});
const errors=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:980}});
  page.on('pageerror',e=>errors.push({type:'pageerror',text:e.message}));
  page.on('console',m=>{if(m.type()==='error')errors.push({type:'console',text:m.text()})});
  for(let pass=0;pass<2;pass++){
    await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
    await page.waitForTimeout(1200);
    console.log('home renderer',await page.locator('.hero-art').getAttribute('data-renderer'));
    await page.goto('http://127.0.0.1:4173/about/',{waitUntil:'networkidle'});
    await page.waitForTimeout(500);
  }
  await writeFile('motion/qa/webkit-lifecycle.json',JSON.stringify({errors},null,2));
  console.log(JSON.stringify({errors}));
}finally{await browser.close();}
