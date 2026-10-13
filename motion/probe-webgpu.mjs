import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const output=path.resolve('motion/qa-webgpu');await mkdir(output,{recursive:true});
let source=await readFile('src/motion.js','utf8');
source=source.replace("from 'three';","from 'three/webgpu';").replace('function initBrandScene()','async function initBrandScene()').replace('new THREE.WebGLRenderer(','new THREE.WebGPURenderer(').replace("  renderer.setClearColor",'  await renderer.init();\n  renderer.setClearColor').replace('export function initMotion()','export async function initMotion()').replace('const disposeScene = initBrandScene();','const disposeScene = await initBrandScene();');
await writeFile(path.join(output,'source.js'),source);
await build({entryPoints:[path.join(output,'source.js')],bundle:true,format:'esm',outfile:path.join(output,'motion.js'),minify:true});
await writeFile(path.join(output,'index.html'),`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;background:#061c25}.hero-art{width:900px;height:800px;background:radial-gradient(ellipse at center,#0d343d,transparent 67%)}canvas{width:100%;height:100%;display:block}</style><div class="hero-art"><canvas id="brand-canvas"></canvas><div class="hero-art__fallback"></div></div><script type="module">import{initMotion}from'./motion.js';await initMotion();document.body.dataset.ready='true'</script>`);
const server=http.createServer(async(req,res)=>{try{const file=path.join(output,req.url==='/'?'index.html':req.url);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(4187,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:900,height:800},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:4187/');
await page.waitForFunction(()=>document.body.dataset.ready==='true',{timeout:20000}).catch(e=>errors.push(e.message));
await page.waitForTimeout(1000);await page.screenshot({path:path.join(output,'hero.png')});
console.log(JSON.stringify({errors,gpu:await page.evaluate(()=>!!navigator.gpu)}));
}finally{await browser.close();server.close();}
