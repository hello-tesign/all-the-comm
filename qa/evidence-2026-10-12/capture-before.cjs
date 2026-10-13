const fs = require('node:fs/promises');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, 'before');
const pages = ['/', '/about/', '/process/', '/team/', '/works/', '/contact/', '/privacy/', '/works/project/all-the-comm/'];
const abstract = ['hero-art', 'hero-art__fallback', 'brand-canvas', 'glass-plane', 'service-symbol', 'work-art', 'work-screen', 'work-poster', 'process-word', 'channel-composition', 'channel-sheet', 'about-brand', 'principle-mark', 'chapter-art', 'chapter-orbit', 'discipline-art', 'discipline-word', 'discipline-lens', 'discipline-orbit'];
(async()=>{
  await fs.mkdir(root,{recursive:true});
  const result = { date:new Date().toISOString(), scope:'Read-only public SSR baseline before image replacement', pages:[] };
  for(const locale of ['ko','en']) for(const page of pages){
    const route = (locale === 'en' ? '/en' : '') + page;
    const response = await fetch('http://127.0.0.1:4173'+route);
    const html = await response.text();
    const slug = locale+'-'+(page.replace(/^\/+|\/+$/g,'').replaceAll('/','-')||'home');
    await fs.writeFile(path.join(root,slug+'.html'),html);
    const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap(m=>m[1].split(/\s+/));
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(m=>({src:m[0].match(/\bsrc="([^"]*)"/)?.[1],alt:m[0].match(/\balt="([^"]*)"/)?.[1]}));
    const headings = [...html.matchAll(/<(h[12])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(m=>({tag:m[1],text:m[2].replace(/<br\s*\/?\s*>/g,'\n').replace(/<[^>]*>/g,'')}));
    result.pages.push({locale,route,status:response.status,sha256:createHash('sha256').update(html).digest('hex'),images,headings,abstract:Object.fromEntries(abstract.map(key=>[key,key==='brand-canvas'?(html.includes('id="brand-canvas"')?1:0):classes.filter(c=>c===key).length]))});
  }
  await fs.writeFile(path.join(root,'baseline.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result.pages.map(p=>({route:p.route,status:p.status,images:p.images.length,abstract:p.abstract}))));
})().catch(error=>{console.error(error);process.exitCode=1});
