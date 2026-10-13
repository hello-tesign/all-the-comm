import fs from 'node:fs/promises';
import path from 'node:path';
import {portfolio} from '../src/data/portfolio.mjs';
const origin=process.env.PORTFOLIO_URL||'http://127.0.0.1:4173';
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('This reviewed import is restricted to the local site.');
const password=process.env.ADMIN_PASSWORD||(await fs.readFile(path.resolve('.private/server/local-admin-password.txt'),'utf8')).trim();
const login=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Administrator sign-in failed; no portfolio data changed.');
const auth=await login.json(),cookie=login.headers.get('set-cookie').split(';')[0];
const headers={Origin:origin,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const r=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok)throw Error(`${method} ${url}: ${r.status} ${result.error||''}`);return result;}
const before=(await api('/api/admin/projects')).projects;
const imported=[];
try{
 for(const source of portfolio){
  const existing=before.find(p=>p.slug===source.slug);
  if(existing){
   if(process.argv.includes('--refresh-copy')&&existing.publicationNote?.includes('portfolio-captures-2026-10-12')){
    const {project:current}=await api('/api/admin/projects/'+existing.id);
    const copy=Object.fromEntries(['summary','problem','strategy','execution','result'].map(key=>[key,source[key]]));
    await api('/api/admin/projects/'+existing.id,'PUT',{...current,...copy});
    imported.push({slug:source.slug,action:'refreshed-imported-copy'});
   }else imported.push({slug:source.slug,action:'kept-existing'});
   continue;
  }
  const {gallery,...fields}=source;
  const {project}=await api('/api/admin/projects','POST',fields);
  let current=(await api('/api/admin/projects/'+project.id)).project;
  for(const image of gallery||[]){const bytes=await fs.readFile(path.resolve('public/portfolio',image.file)).catch(error=>{if(error.code!=='ENOENT')throw error;return fs.readFile(path.resolve('public/evidence/expansion',image.file));});await api(`/api/admin/projects/${project.id}/media`,'POST',{name:image.file,type:image.file.endsWith('.webp')?'image/webp':'image/png',dataBase64:bytes.toString('base64'),alt:image.alt,caption:image.caption});}
  current=(await api('/api/admin/projects/'+project.id)).project;
  await api('/api/admin/projects/'+project.id,'PUT',{...current,images:current.images.map((image,i)=>({...image,alt:gallery?.[i]?.alt||image.alt,caption:gallery?.[i]?.caption||image.caption}))});
  imported.push({slug:source.slug,action:'created-ko-only'});
 }
 const all=(await api('/api/admin/projects')).projects;
 const ordered=[...portfolio.map(p=>all.find(x=>x.slug===p.slug)?.id).filter(Boolean),...all.filter(p=>!portfolio.some(x=>x.slug===p.slug)).map(p=>p.id)];
 await api('/api/admin/projects/reorder','POST',{ids:ordered});
 console.log(JSON.stringify({projects:imported,count:all.length,scope:'Local Korean portfolio. Existing inquiries and projects retained.'},null,2));
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
