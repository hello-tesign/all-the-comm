import fs from 'node:fs/promises';
import {brandWork,sojukdooBranding} from '../src/data/portfolio-brand-work.mjs';
const origin='http://127.0.0.1:4173';
const password=(await fs.readFile('.private/server/local-admin-password.txt','utf8')).trim();
const login=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Local sign-in failed');
const auth=await login.json(),headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const r=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok)throw Error(`${method} ${url}: ${r.status} ${result.error||''}`);return result;}
try{
 const before=(await api('/api/admin/projects')).projects;
 await fs.mkdir('.private/backups',{recursive:true});
 await fs.writeFile('.private/backups/before-brand-work-2026-10-14.json',JSON.stringify(before,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const records=[];
 for(const source of [...brandWork,sojukdooBranding]){
  if(!(await fetch(origin+source.coverImage)).ok)throw Error('Missing cover '+source.slug);
  const {gallery=[],...fields}=source;
  let current=before.find(p=>p.slug===source.slug);
  if(current){current=(await api('/api/admin/projects/'+current.id)).project;current=(await api('/api/admin/projects/'+current.id,'PUT',{...current,...fields})).project;}
  else current=(await api('/api/admin/projects','POST',fields)).project;
  let added=0;
  for(const media of gallery){
   if(current.images?.some(i=>i.name===media.file))continue;
   const bytes=await fs.readFile('public/evidence/brand-work/'+media.file);
   await api('/api/admin/projects/'+current.id+'/media','POST',{name:media.file,type:'image/webp',dataBase64:bytes.toString('base64'),alt:media.alt,caption:media.caption});
   added++;
  }
  records.push({slug:source.slug,images:added});
 }
 // Commissioned work alternates with the existing cases so WORKS keeps a mix of industries.
 const all=(await api('/api/admin/projects')).projects;
 const order=['soulreset','sales-rehearsal','jonghae-community','w-oil-campaign','kings-franchise','eyewear-campaign','sojukdoo-concept','coffee-package','ezylens-studio','bugak-branding','content-operations','microplastic-tee','kfood-dashboard','graphic-tee','review-atelier','tesign-radar','tesign-workflow','patient-guide','city-culture','all-the-comm'];
 const ids=[...order.map(slug=>all.find(p=>p.slug===slug)?.id).filter(Boolean),...all.filter(p=>!order.includes(p.slug)).map(p=>p.id)];
 await api('/api/admin/projects/reorder','POST',{ids});
 console.log(JSON.stringify({updated:records,total:all.length,scope:'Local Korean cases only; inquiries and other cases retained.'}));
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
