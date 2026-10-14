// Packs the Korean site into one offline HTML file for review without a server.
// Requires the local server (npm start) with the reviewed portfolio data loaded.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin=process.env.SINGLE_HTML_ORIGIN||'http://127.0.0.1:4173';
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Export reads the local review server only.');
const out=path.resolve(root,process.env.SINGLE_HTML_OUT||'deliverables/ALL-THE-COMM-ko.html');
const site='https://allthecom.co.kr';
// Asset paths must start at a URL boundary so absolute meta URLs stay untouched.
const ASSET=/(?<![\w.\-/])\/(?:(?:brand|evidence|portfolio|fonts|motion|media)\/[^"'()\s,<>\\]+|favicon\.svg)/g;

async function get(url){const r=await fetch(origin+url,{headers:{Accept:'*/*'}});return r;}
async function text(url){const r=await get(url);if(!r.ok)throw Error(`${url}: ${r.status}`);return r.text();}

const {projects}=JSON.parse(await text('/api/projects'));
const routes=['/','/about/','/process/','/team/','/works/','/contact/','/privacy/',...projects.map(p=>`/works/project/${p.slug}/`)];
const api={'/api/projects':JSON.stringify({projects})};
for(const p of projects)api[`/api/projects/${p.slug}`]=await text(`/api/projects/${encodeURIComponent(p.slug)}`);

const styles={};
async function page(url){
 let html=await text(url);
 for(const [tag,href] of html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)){styles[href]??=await text(href);html=html.replace(tag,`<!--atc-style:${href}-->`);}
 html=html.replace(/<link rel="(?:preload|modulepreload)"[^>]*>/g,'').replace(/<script type="module" src="\/app\.js"><\/script>/,'<!--atc-script-->');
 if(!html.includes('<!--atc-script-->'))throw Error(`App script tag not found: ${url}`);
 return html.replace(/<head>/,'<head><!--atc-boot-->');
}
const pages={};
for(const url of routes)pages[url]=await page(url);
pages['/404/']=await page('/404.html');

// One bundle without code splitting; location reads go through the offline router.
const stub={name:'ko-no-3d',setup(b){b.onResolve({filter:/brand-scene\.js$/},()=>({path:'brand-scene',namespace:'stub'}));b.onLoad({filter:/.*/,namespace:'stub'},()=>({contents:'export function initBrandScene(){throw Error("3D scene is English-only")}'}));}};
// Embedded images are object URLs, so the media URL guard must also accept blob: and data:.
const offlineMedia={name:'offline-media',setup(b){b.onLoad({filter:/[\\/]src[\\/]app\.js$/},async args=>{const source=await fs.readFile(args.path,'utf8'),guard="['http:','https:'].includes(u.protocol)";if(!source.includes(guard))throw Error('safeURL guard changed; update the offline export.');return {contents:source.replace(guard,"['http:','https:','blob:','data:'].includes(u.protocol)"),loader:'js',resolveDir:path.dirname(args.path)};});}};
const bundle=await build({entryPoints:[path.join(root,'src/app.js')],bundle:true,minify:true,format:'iife',target:'es2022',write:false,logLevel:'warning',plugins:[stub,offlineMedia],
 define:{'location.pathname':'__ATC_LOC.pathname','location.search':'__ATC_LOC.search','location.origin':'__ATC_LOC.origin'}});
const script=bundle.outputFiles[0].text;

const refs=new Set();
for(const source of [...Object.values(pages),...Object.values(styles),...Object.values(api),script])for(const [m] of source.matchAll(ASSET))refs.add(m);
// Uploaded case media often repeats a source image; identical files are stored once.
const assets={},aliases={},seen=new Map();let bytes=0;const missing=[];
for(const ref of [...refs].sort()){
 const r=await get(ref);const type=(r.headers.get('content-type')||'').split(';')[0];
 if(!r.ok||!type||type==='text/html'){missing.push(ref);continue;}
 const data=Buffer.from(await r.arrayBuffer()),hash=createHash('sha256').update(type).update(data).digest('hex');
 if(seen.has(hash)){aliases[ref]=seen.get(hash);continue;}
 seen.set(hash,ref);bytes+=data.length;assets[ref]=[type,data.toString('base64')];
}
const icon=assets['/brand/logo-symbol.svg'];

const data={pages,styles,script,api,assets,aliases,site,redirects:{'/work/':'/works/','/work/all-the-comm/':'/works/project/all-the-comm/','/services/':'/works/#services','/journal/':'/about/','/journal/before-the-media/':'/process/','/journal/one-brand-many-formats/':'/works/project/all-the-comm/','/journal/report-to-next-action/':'/process/'}};
const json=JSON.stringify(data).replace(/</g,'\\u003c');
const shell=await fs.readFile(path.join(root,'scripts/components/single-html-shell.html'),'utf8');
const html=shell.replace('<!--atc-icon-->',icon?`<link rel="icon" href="data:${icon[0]};base64,${icon[1]}">`:'').replace('<!--atc-data-->',()=>`<script type="application/json" id="atc-data">${json}</script>`);
await fs.mkdir(path.dirname(out),{recursive:true});
await fs.writeFile(out,html);
console.log(JSON.stringify({file:path.relative(root,out),pages:Object.keys(pages).length,projects:projects.length,assets:Object.keys(assets).length,aliases:Object.keys(aliases).length,assetBytes:bytes,fileBytes:Buffer.byteLength(html),missing},null,1));
