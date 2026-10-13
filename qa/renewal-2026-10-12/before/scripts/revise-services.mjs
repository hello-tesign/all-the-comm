import fs from 'node:fs/promises';
const p=new URL('./build.mjs',import.meta.url);
let s=await fs.readFile(p,'utf8');
if(!s.includes("from './components/services.mjs'"))s="import {homeServices,serviceVisual} from './components/services.mjs';\n"+s;
s=s.replace(/<section class="services-section shell">[\s\S]*?<\/section>/,'${homeServices(services)}');
s=s.replace('</h2></div><div class="service-content">','</h2>${serviceVisual(s.id)}</div><div class="service-content">');
await fs.writeFile(p,s);
