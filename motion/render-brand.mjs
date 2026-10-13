import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const english = process.argv.includes('--lang=en');
const compositionName = english ? 'brand-ribbon-en' : 'brand-ribbon';
const composition = path.join(root, 'motion', compositionName);
const output = path.join(root, 'public', 'motion');
const suffix = english ? '-en' : '';
const entry = 'index.html';
await mkdir(path.join(composition, 'vendor'), { recursive: true });
await mkdir(output, { recursive: true });
await mkdir(path.join(root,'motion','qa'), { recursive: true });
await copyFile(require.resolve('gsap/dist/gsap.min.js'), path.join(composition, 'vendor', 'gsap.min.js'));
await copyFile(path.join(root,'public','fonts','Manrope.ttf'),path.join(composition,'vendor','Manrope.ttf'));
await copyFile(path.join(root,'public','fonts','PretendardSite.woff2'),path.join(composition,'vendor','PretendardSite.woff2'));
await copyFile(path.join(root,'public','brand','logo-symbol.svg'),path.join(composition,'vendor','logo-symbol.svg'));
if (english) {
  const translated = (await readFile(path.join(root,'motion','brand-ribbon','index.html'),'utf8'))
    .replace('<html lang="ko">','<html lang="en">')
    .replace('하나의 방향으로 연결하는<br>전략, 디자인, 그리고 실행.','Strategy, design and execution.<br>Connected by one clear direction.')
    .replace('회사 심볼에서 확장한 세 겹의 곡선','Three spatial curves derived from the company symbol')
    .replace('alt="올더커뮤니케이션 공식 심볼"','alt="All The Communication official symbol"');
  await writeFile(path.join(composition,entry),translated);
}

const server=http.createServer(async(req,res)=>{
  try {
    const requested=decodeURIComponent(req.url.split('?')[0]);
    const file=path.resolve(composition,requested==='/'?entry:'.'+requested);
    if (!file.startsWith(composition+path.sep)) {res.writeHead(403);res.end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.woff2')?'font/woff2':file.endsWith('.ttf')?'font/ttf':'text/html');
    res.end(await readFile(file));
  } catch {res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true});
try{
  console.log('Poster: browser ready');
  const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await page.goto(`http://127.0.0.1:${server.address().port}/`, {waitUntil:'domcontentloaded',timeout:30000});
  console.log('Poster: document ready');
  await page.evaluate(async()=>{await document.fonts.ready;return true});
  console.log('Poster: fonts ready');
  for (const seconds of [0,1,3,6.5,7.9]) {
    await page.evaluate(t=>{window.__brandSeek(t);},seconds);
    await page.screenshot({path:path.join(root,'motion','qa',`film${suffix}-${seconds}.png`)});
  }
  await page.evaluate(()=>{window.__brandSeek(3);});
  await page.screenshot({path:path.join(output,`brand-poster${suffix}.png`)});
}finally{await browser.close();server.close();}
const sharp = require('sharp');
await sharp(path.join(output,`brand-poster${suffix}.png`)).webp({quality:90,effort:6}).toFile(path.join(output,`brand-poster${suffix}.webp`));

function command(args) {
  return new Promise((resolve, reject) => {
    const cli = path.join(root, 'node_modules', 'hyperframes', 'bin', 'hyperframes.mjs');
    const localTools = [
      path.join(root,'motion','tooling','node_modules','@ffmpeg-installer','win32-x64'),
      path.join(root,'motion','tooling','node_modules','@ffprobe-installer','win32-x64'),
    ];
    const child = spawn(process.execPath, [cli, ...args], { cwd: composition, stdio: 'inherit', windowsHide: true,
      env: {...process.env, PATH: [...localTools, process.env.PATH || process.env.Path || ''].join(path.delimiter)} });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`HyperFrames exited ${code}`)));
  });
}
await command(['lint', '.']);
await command(['render', '.', '--composition', entry, '--output', path.join(output, `brand-film${suffix}.mp4`), '--fps', '30', '--workers', '2']);
await writeFile(path.join(output, `brand-film${suffix}.json`), JSON.stringify({
  composition: 'brand-ribbon', locale: english ? 'en' : 'ko', duration: 8, fps: 30, width: 1920, height: 1080,
  authoring: 'Custom HTML, SVG, GSAP timeline; rendered with HyperFrames',
  source: `motion/${compositionName}/${entry}`,
}, null, 2) + '\n');
