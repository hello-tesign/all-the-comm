// Static snapshot for hosts without the Node server (Vercel): every page, the
// published cases, their API responses and media. Case data is rebuilt from the
// reviewed portfolio scripts in a throwaway data folder, never from .private.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist'),out=path.join(root,'static-site');
const port=4173,origin=`http://127.0.0.1:${port}`;
const env={...process.env,HOST:'127.0.0.1',PORT:String(port)};
for(const key of ['ADMIN_PASSWORD','PUBLIC_ORIGIN','PROJECT_SEED_FILE'])delete env[key];
const node=(args,cwd=root)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{cwd,env,stdio:'inherit'});child.on('exit',code=>code===0?resolve():reject(Error(`${path.basename(args[0])} exited with ${code}`)));});

await node([path.join(root,'scripts/build.mjs')]);
await new Promise((resolve,reject)=>{const probe=net.createServer().once('error',()=>reject(Error(`Port ${port} is in use. Stop the local server first; the snapshot starts its own isolated server.`))).listen(port,'127.0.0.1',()=>probe.close(resolve));});

const work=await fs.mkdtemp(path.join(os.tmpdir(),'atc-static-'));
// The portfolio scripts read the admin password from ./.private and images from ./public,
// and write their backups and records under the throwaway folder.
await fs.symlink(path.join(root,'public'),path.join(work,'public'),'junction');
await fs.mkdir(path.join(work,'qa','editorial-2026-10-13'),{recursive:true});
const server=spawn(process.execPath,[path.join(root,'scripts/server.mjs')],{cwd:root,env:{...env,DATA_DIR:path.join(work,'.private','server')},stdio:['ignore','ignore','inherit']});
const stopped=new Promise(resolve=>server.once('exit',resolve));
try{
 for(let i=0;;i++){try{if((await fetch(origin+'/api/health')).ok)break;}catch{}if(i>100||server.exitCode!==null)throw Error('Snapshot server did not start');await new Promise(r=>setTimeout(r,100));}
 for(const script of ['import-portfolio','update-selfcase-evidence','publish-diverse-portfolio','publish-refined-portfolio','publish-editorial-portfolio'])await node([path.join(root,'scripts',script+'.mjs')],work);

 const get=async url=>{const r=await fetch(origin+url);if(!r.ok)throw Error(`${url}: ${r.status}`);return r;};
 const text=async url=>(await get(url)).text();
 const write=async(file,data)=>{const target=path.join(out,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);};
 await fs.rm(out,{recursive:true,force:true});
 await fs.cp(dist,out,{recursive:true});
 // Case pages exist only for published slugs, as on the server.
 for(const dir of ['works/project','en/works/project'])await fs.rm(path.join(out,dir),{recursive:true,force:true});

 // Uploaded media has no extension on the server; static hosting needs one for its type.
 const MEDIA=/\/media\/projects\/[a-f0-9-]{36}\/[a-f0-9-]{36}(?![\w.-])/g,media=new Map();
 const withMedia=async source=>{
  for(const [ref] of source.matchAll(MEDIA))if(!media.has(ref)){
   const r=await get(ref),ext={'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[r.headers.get('content-type')];
   if(!ext)throw Error(`Unexpected media type: ${ref}`);
   media.set(ref,ref+ext);await write(ref.slice(1)+ext,Buffer.from(await r.arrayBuffer()));
  }
  return source.replace(MEDIA,ref=>media.get(ref));
 };

 const ko=JSON.parse(await text('/api/projects')).projects,en=JSON.parse(await text('/api/projects?lang=en')).projects;
 await write('data/projects/ko.json',await withMedia(JSON.stringify({projects:ko})));
 await write('data/projects/en.json',await withMedia(JSON.stringify({projects:en})));
 for(const {slug} of ko){
  await write(`data/projects/${slug}/ko.json`,await withMedia(await text(`/api/projects/${slug}`)));
  await write(`works/project/${slug}/index.html`,await withMedia(await text(`/works/project/${slug}/`)));
 }
 for(const {slug} of en){
  await write(`data/projects/${slug}/en.json`,await withMedia(await text(`/api/projects/${slug}?lang=en`)));
  await write(`en/works/project/${slug}/index.html`,await withMedia(await text(`/en/works/project/${slug}/`)));
 }
 await write('sitemap.xml',await text('/sitemap.xml'));
 console.log(JSON.stringify({output:path.relative(root,out),koCases:ko.length,enCases:en.length,media:media.size}));
}finally{
 server.kill();await stopped;
 // Remove the link itself first so cleanup can never reach the real public folder.
 const link=path.join(work,'public');
 await fs.unlink(link).catch(()=>fs.rmdir(link)).catch(()=>{});
 await fs.rm(work,{recursive:true,force:true});
}
