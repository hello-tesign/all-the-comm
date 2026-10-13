import fs from 'node:fs/promises';
import {project as source} from '../src/data/site.mjs';
const origin='http://127.0.0.1:4173';
const password=(await fs.readFile('.private/server/local-admin-password.txt','utf8')).trim();
const response=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!response.ok)throw Error('Local administrator sign-in failed');
const auth=await response.json();
const headers={Origin:origin,'Content-Type':'application/json',Cookie:response.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const r=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await r.json();if(!r.ok)throw Error(`Local project update failed: ${r.status}`);return result;}
try{
 const existing=(await api('/api/admin/projects')).projects.find(p=>p.slug==='all-the-comm');
 if(!existing)throw Error('Existing self-project was not found');
 const current=(await api('/api/admin/projects/'+existing.id)).project;
 await fs.mkdir('.private/backups',{recursive:true});
 await fs.writeFile('.private/backups/before-evidence-selfcase-2026-10-12.json',JSON.stringify(current,null,2),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
 const copy=Object.fromEntries(['summary','problem','strategy','execution','result','coverImage'].map(key=>[key,source[key]]));
 await api('/api/admin/projects/'+existing.id,'PUT',{...current,...copy});
 console.log('Updated existing local self-project Korean narrative and cover. Other projects and inquiries preserved.');
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
