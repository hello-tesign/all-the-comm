import fs from 'node:fs/promises';
import {portfolio} from '../src/data/portfolio.mjs';
import {project as selfProject} from '../src/data/site.mjs';

const origin='http://127.0.0.1:4173';
const password=(await fs.readFile('.private/server/local-admin-password.txt','utf8')).trim();
const login=await fetch(origin+'/api/admin/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password})});
if(!login.ok)throw Error('Local sign-in failed');
const auth=await login.json();
const headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie').split(';')[0],'X-CSRF-Token':auth.csrf};
async function api(url,method='GET',data){const response=await fetch(origin+url,{method,headers,body:data?JSON.stringify(data):undefined});const result=await response.json();if(!response.ok)throw Error(`${method} ${url}: ${response.status}`);return result;}
const englishSnapshot=p=>Object.fromEntries(Object.entries(p).filter(([key])=>key.endsWith('En')||key==='englishPublished'));
try{
 const before=(await api('/api/admin/projects')).projects;
 await fs.mkdir('.private/backups',{recursive:true});
 await fs.writeFile('.private/backups/before-editorial-2026-10-13.json',JSON.stringify(before,null,2),{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});
 const records=[];
 for(const source of [...portfolio,selfProject]){
  const existing=before.find(p=>p.slug===source.slug);
  if(!existing)throw Error('Missing existing project '+source.slug);
  const {project:current}=await api('/api/admin/projects/'+existing.id);
  const fields=Object.fromEntries(['title','summary','scope','problem','strategy','execution','result','coverImage'].filter(key=>source[key]!==undefined).map(key=>[key,source[key]]));
  if(source.slug!=='all-the-comm')fields.featured=['jonghae-community','soulreset','sales-rehearsal'].includes(source.slug);
  fields.images=current.images.map(image=>{const edit=source.gallery?.find(item=>item.alt===image.alt);return edit?{...image,caption:edit.caption}:image;});
  const {project:updated}=await api('/api/admin/projects/'+current.id,'PUT',{...current,...fields});
  if(JSON.stringify(englishSnapshot(current))!==JSON.stringify(englishSnapshot(updated)))throw Error('English fields changed '+source.slug);
  if(updated.images.length!==current.images.length)throw Error('Existing gallery changed '+source.slug);
  if(source.slug==='sales-rehearsal'&&!updated.images.some(image=>image.alt==='세일즈 리허설의 원본 표지')){
   const bytes=await fs.readFile('public/evidence/expansion/book-cover.webp');
   await api('/api/admin/projects/'+updated.id+'/media','POST',{name:'book-cover.webp',type:'image/webp',dataBase64:bytes.toString('base64'),alt:'세일즈 리허설의 원본 표지',caption:'표지'});
  }
  records.push({slug:source.slug,title:updated.title,englishPreserved:true,originalImagesPreserved:true});
 }
 const projects=(await api('/api/admin/projects')).projects;
 const order=['soulreset','sales-rehearsal','jonghae-community','kings-franchise','sojukdoo-concept','ezylens-studio','content-operations','kfood-dashboard','review-atelier','tesign-radar','tesign-workflow','patient-guide','city-culture','all-the-comm'];
 await api('/api/admin/projects/reorder','POST',{ids:[...order.map(slug=>projects.find(p=>p.slug===slug)?.id).filter(Boolean),...projects.filter(p=>!order.includes(p.slug)).map(p=>p.id)]});
 const after=(await api('/api/admin/projects')).projects;
 const proof={scope:'Local editorial update; no inquiry submission or external deployment.',projects:records,total:after.length,featured:after.filter(p=>p.featured&&p.slug!=='all-the-comm').map(p=>p.slug),bookGallery:after.find(p=>p.slug==='sales-rehearsal').images.length};
 await fs.writeFile('qa/editorial-2026-10-13/published-local.json',JSON.stringify(proof,null,2));
 console.log(JSON.stringify({updated:records.length,total:proof.total,featured:proof.featured,bookGallery:proof.bookGallery}));
}finally{await api('/api/admin/logout','POST',{}).catch(()=>{});}
