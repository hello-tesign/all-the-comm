import fs from 'node:fs/promises';
import {portfolio} from '../src/data/portfolio.mjs';
import {diversePortfolio} from '../src/data/portfolio-diverse.mjs';
const origin='http://127.0.0.1:4173';
const password=(await fs.readFile('.private/server/local-admin-password.txt','utf8')).trim();
const login=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Local administrator sign-in failed');
const auth=await login.json();
const headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const r=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok)throw Error(`${method} ${url}: ${r.status}`);return result;}
try{
 const before=(await api('/api/admin/projects')).projects;
 await fs.mkdir('.private/backups',{recursive:true});
 await fs.writeFile('.private/backups/before-diversity-2026-10-13.json',JSON.stringify(before,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const changes=[];
 for(const source of diversePortfolio){
  if(!(await fetch(origin+source.coverImage)).ok)throw Error('Missing reviewed case cover: '+source.slug);
  const existing=before.find(p=>p.slug===source.slug);
  if(existing){changes.push({slug:source.slug,action:'kept-existing'});continue;}
  const {gallery,...fields}=source;
  await api('/api/admin/projects','POST',fields);
  changes.push({slug:source.slug,action:'created-ko-only'});
 }
 const food=before.find(p=>p.slug==='sojukdoo-concept');
 if(food&&food.featured){const {project}=await api('/api/admin/projects/'+food.id);await api('/api/admin/projects/'+food.id,'PUT',{...project,featured:false});changes.push({slug:food.slug,action:'retained-case-removed-home-feature'});}
 const all=(await api('/api/admin/projects')).projects;
 const ids=[...portfolio.map(p=>all.find(x=>x.slug===p.slug)?.id).filter(Boolean),...all.filter(p=>!portfolio.some(x=>x.slug===p.slug)).map(p=>p.id)];
 await api('/api/admin/projects/reorder','POST',{ids});
 console.log(JSON.stringify({changes,total:all.length,scope:'Local Korean case selection. Existing cases and inquiries preserved.'},null,2));
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
