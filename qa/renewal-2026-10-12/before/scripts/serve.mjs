import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.png':'image/png','.webm':'video/webm'};
http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  let pathname=decodeURIComponent(url.pathname);
  let target=path.resolve(root,'.'+pathname);
  if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try {if((await fs.stat(target)).isDirectory())target=path.join(target,'index.html');}
  catch {target=path.join(root,'404.html');res.statusCode=404;}
  const file=await fs.readFile(target);
  res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Cache-Control','no-cache');
  res.end(file);
 }catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('ALL THE COMM preview: http://127.0.0.1:'+(process.env.PORT||4173)));
