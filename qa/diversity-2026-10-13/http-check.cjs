const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const base=process.env.TEST_URL||'http://127.0.0.1:4173';
const out=path.join(__dirname,'final');
const routes=['/','/about/','/process/','/team/','/works/','/contact/'];
const checks=[],pages=[],assets=[];
const check=(name,pass,detail)=>checks.push({name,passed:!!pass,detail});
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const urls=new Set();
 for(const route of routes){const response=await fetch(base+route),html=await response.text();const refs=[...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map(m=>m[1]);refs.filter(u=>u.startsWith('/')&&!u.startsWith('//')).forEach(u=>urls.add(u));const food=[...html.matchAll(/<img\b[^>]*(?:sojukdoo|소적두)[^>]*>/g)].map(m=>m[0]);const foodText=(html.match(/소적두|단팥|팥부터|팥 한 상자/g)||[]);check(route+' HTTP 200',response.status===200,response.status);check(route+' SSR has no global Sojukdoo or red-bean imagery/text',food.length===0&&foodText.length===0,{food,foodText});pages.push({route,status:response.status,title:html.match(/<title>(.*?)<\/title>/)?.[1],sha256:crypto.createHash('sha256').update(html).digest('hex'),images:refs});}
 const response=await fetch(base+'/api/projects');const {projects=[]}=await response.json();const featured=projects.filter(p=>p.featured&&p.slug!=='all-the-comm').slice(0,3);check('Public portfolio API responds 200',response.status===200,response.status);check('Home featured projection has three cases and Sojukdoo is unfeatured',featured.length===3&&featured.every(p=>p.slug!=='sojukdoo-concept')&&projects.find(p=>p.slug==='sojukdoo-concept')?.featured===false,featured.map(p=>({slug:p.slug,order:p.order,industry:p.industry})));check('Sojukdoo remains one portfolio record',projects.filter(p=>p.slug==='sojukdoo-concept').length===1,projects.map(p=>p.slug));for(const p of projects)if(p.coverImage?.startsWith('/')&&!p.coverImage.startsWith('//'))urls.add(p.coverImage);
 for(const url of urls){const r=await fetch(base+url),bytes=Buffer.from(await r.arrayBuffer()),type=r.headers.get('content-type')||'';const item={url,status:r.status,type,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};assets.push(item);check('Image resource '+url,r.status===200&&type.startsWith('image/')&&bytes.length>0,item);}
 const result={date:new Date().toISOString(),scope:'Read-only source HTTP and public project data checks. Not browser rendering proof.',base,passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,pages,projects:projects.map(({slug,industry,featured,order,services,coverImage})=>({slug,industry,featured,order,services,coverImage})),assets};await fs.writeFile(path.join(out,'http-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({passed:result.passed,failed:result.failed,pages:pages.length,assets:assets.length}));if(result.failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
