import { build } from 'esbuild';
import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {spawn} from 'node:child_process';

const root = process.cwd();
const output = path.join(root, 'motion', 'qa');
await mkdir(output, {recursive:true});
await build({entryPoints:['src/motion.js'],bundle:true,format:'esm',outfile:path.join(output,'motion.js'),minify:true});
await writeFile(path.join(output,'index.html'), `<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;background:#061c25;color:#d1eee8}.hero-art{position:relative;width:900px;height:800px;background:radial-gradient(ellipse at center,#0d343d,transparent 67%)}canvas{width:100%;height:100%;display:block}.hero-art__fallback{position:absolute;inset:0}[data-renderer=webgl] .hero-art__fallback{display:none}button{position:fixed;bottom:16px;left:16px;color:inherit;background:none;border:1px solid;padding:8px}</style><div class="hero-art"><canvas id="brand-canvas"></canvas><div class="hero-art__fallback"></div></div><button data-motion-toggle><span data-motion-label>Motion on</span></button><script type="module">import{initMotion}from'./motion.js';initMotion()</script>`);
const server = http.createServer(async(req,res)=>{
  try{const file=path.join(output,req.url==='/'?'index.html':req.url);const bytes=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(bytes)}catch{res.writeHead(404);res.end()}
});
await new Promise(resolve=>server.listen(4186,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:900,height:800},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4186/');
await page.waitForFunction(()=>document.querySelector('.hero-art')?.dataset.renderer);
await page.waitForTimeout(1000);
await page.screenshot({path:path.join(output,'hero-desktop.png')});
console.log(JSON.stringify({renderer:await page.locator('.hero-art').getAttribute('data-renderer'),errors}));
await browser.close();
if(process.argv.includes('--test')) {
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['tests/motion.cjs'],{stdio:'inherit',windowsHide:true,env:{...process.env,MOTION_URL:'http://127.0.0.1:4186'}});
    child.on('exit',code=>code===0?resolve():reject(new Error(`Motion test exited ${code}`)));
  });
}
server.close();
