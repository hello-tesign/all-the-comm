const fs = require('node:fs/promises');
const path = require('node:path');
const origin = 'http://127.0.0.1:4173';
const routes = ['/', '/about/', '/process/', '/team/', '/works/', '/contact/'];
const out = path.join(__dirname, 'before');
const strip = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
(async () => {
  await fs.mkdir(out, {recursive:true});
  const pages = [];
  for (const route of routes) {
    const response = await fetch(origin + route);
    const html = await response.text();
    const name = route.replace(/^\/|\/$/g, '').replaceAll('/', '-') || 'home';
    await fs.writeFile(path.join(out, name + '.html'), html);
    const images = [...html.matchAll(/<img\b[^>]*>/g)].map(m => ({
      src: m[0].match(/\bsrc="([^"]+)"/)?.[1] || '',
      alt: m[0].match(/\balt="([^"]*)"/)?.[1] || ''
    }));
    const foodImages = images.filter(i=>/sojukdoo|소적두/.test(i.src+' '+i.alt));
    const foodLinks = [...html.matchAll(/<a\b[^>]*href="([^"#]*sojukdoo[^"#]*)"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>({href:m[1],label:strip(m[2])}));
    pages.push({route,status:response.status,title:strip(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||''),images:images.length,foodImages,foodLinks,foodNameCount:(html.match(/소적두/g)||[]).length,foodAssetReferenceCount:(html.match(/sojukdoo/g)||[]).length,serviceChoices:(html.match(/data-service-choice=/g)||[]).length,processChapters:(html.match(/class="process-chapter"/g)||[]).length,heroChoices:(html.match(/data-evidence-select=/g)||[]).length});
  }
  const res = await fetch(origin+'/api/projects');
  const data = await res.json();
  const projects = (data.projects||[]).map(({id,slug,title,industry,featured,order,services,coverImage})=>({id,slug,title,industry,featured,order,services,coverImage}));
  const result = {capturedAt:new Date().toISOString(),scope:'GET-only HTTP/source baseline. No browser rendering or mutation.',pages,projects,homeFeaturedUnderCurrentApp:projects.filter(p=>p.featured).slice(0,6)};
  await fs.writeFile(path.join(out,'baseline.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({pages:pages.map(({route,foodImages,foodLinks,foodNameCount,foodAssetReferenceCount})=>({route,foodImages:foodImages.length,foodLinks:foodLinks.length,foodNameCount,foodAssetReferenceCount})),featured:result.homeFeaturedUnderCurrentApp.map(p=>p.slug)},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
