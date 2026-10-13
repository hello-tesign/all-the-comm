const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const base='http://127.0.0.1:4173';
const out=path.join(__dirname,'before');
const routes=['/en/','/en/about/','/en/process/','/en/team/','/en/works/','/en/contact/','/en/privacy/','/en/works/project/all-the-comm/'];
(async()=>{await fs.mkdir(out,{recursive:true});const pages=[];for(const route of routes){const response=await fetch(base+route),html=await response.text();const file=route.replace(/^\/+|\/+$/g,'').replaceAll('/','-')+'.html';await fs.writeFile(path.join(out,file),html);pages.push({route,file,status:response.status,sha256:crypto.createHash('sha256').update(html).digest('hex')});}const response=await fetch(base+'/api/projects?lang=en'),data=await response.json();const projects=(data.projects||[]).map(({slug,titleEn,summaryEn,englishPublished,services,coverImage,featured,order})=>({slug,titleEn,summaryEn,englishPublished,services,coverImage,featured,order}));await fs.writeFile(path.join(out,'baseline.json'),JSON.stringify({date:new Date().toISOString(),scope:'GET-only English HTML and public portfolio baseline before new build. No browser or mutations.',pages,projects},null,2));console.log(JSON.stringify({pages:pages.length,statuses:pages.map(p=>p.status),englishProjects:projects.length}));})().catch(e=>{console.error(e);process.exitCode=1;});
