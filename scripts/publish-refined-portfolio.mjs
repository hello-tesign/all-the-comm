import fs from 'node:fs/promises';
import {expansionPortfolio,redbeanUpdate} from '../src/data/portfolio-expansion.mjs';
import {diversePortfolio} from '../src/data/portfolio-diverse.mjs';
const origin='http://127.0.0.1:4173';
const password=(await fs.readFile('.private/server/local-admin-password.txt','utf8')).trim();
const login=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Local sign-in failed');
const auth=await login.json(),headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const r=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok)throw Error(`${method} ${url}: ${r.status} ${result.error||''}`);return result;}
try{
 const before=(await api('/api/admin/projects')).projects;
 await fs.mkdir('.private/backups',{recursive:true});
 await fs.writeFile('.private/backups/before-refinement-2026-10-13.json',JSON.stringify(before,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const sources=[...expansionPortfolio,diversePortfolio.find(p=>p.slug==='ezylens-studio'),{slug:'sojukdoo-concept',...redbeanUpdate}];
 for(const source of sources){
  if(!(await fetch(origin+source.coverImage)).ok)throw Error('Missing cover '+source.slug);
  const {gallery=[],...fields}=source;
  let current=before.find(p=>p.slug===source.slug);
  if(current){current=(await api('/api/admin/projects/'+current.id)).project;current=(await api('/api/admin/projects/'+current.id,'PUT',{...current,...fields})).project;}
  else current=(await api('/api/admin/projects','POST',fields)).project;
  for(const media of gallery){
   if(current.images?.some(i=>i.name===media.file))continue;
   const bytes=await fs.readFile('public/evidence/expansion/'+media.file);
   await api('/api/admin/projects/'+current.id+'/media','POST',{name:media.file,type:media.file.endsWith('.webp')?'image/webp':'image/png',dataBase64:bytes.toString('base64'),alt:media.alt,caption:media.caption});
  }
 }
 // The landing page has its own selection; the archive keeps every case.
 const featured=['jonghae-community','soulreset','patient-guide'];
 for(const p of (await api('/api/admin/projects')).projects){
  if(p.slug==='all-the-comm')continue; // English uses the existing self project.
  if(p.featured!==featured.includes(p.slug)){const {project}=await api('/api/admin/projects/'+p.id);await api('/api/admin/projects/'+p.id,'PUT',{...project,featured:featured.includes(p.slug)});}
 }
 const all=(await api('/api/admin/projects')).projects;
 const order=['ezylens-studio','content-operations','sales-rehearsal','kfood-dashboard','kings-franchise','jonghae-community','soulreset','sojukdoo-concept','city-culture','patient-guide','review-atelier','tesign-radar','tesign-workflow','all-the-comm'];
 const ids=[...order.map(slug=>all.find(p=>p.slug===slug)?.id).filter(Boolean),...all.filter(p=>!order.includes(p.slug)).map(p=>p.id)];
 await api('/api/admin/projects/reorder','POST',{ids});
 console.log(JSON.stringify({updated:sources.map(p=>p.slug),total:all.length,scope:'Local Korean content only; inquiries and existing case media retained.'}));
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
