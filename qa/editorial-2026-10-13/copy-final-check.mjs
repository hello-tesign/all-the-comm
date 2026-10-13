import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const files=['about-process.mjs','team-contact.mjs','healthcare.mjs'];
const normalizeText=html=>html.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const attributes=(html,name)=>[...html.matchAll(new RegExp('\\s'+name+'=["\\\']([^"\\\']*)["\\\']','g'))].map(m=>m[1]);
const images=html=>[...html.matchAll(/<img\b[^>]*>/g)].map(m=>({src:attributes(m[0],'src')[0]||'',alt:attributes(m[0],'alt')[0]||''}));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const reports=[];
for(const file of files){
 const old=await import(pathToFileURL(path.resolve('qa/copy-edit-2026-10-13/original',file)).href);
 const now=await import(pathToFileURL(path.resolve('src/page-depth',file)).href);
 const names=Object.keys(old).filter(key=>typeof old[key]==='function');
 if(!equal(names,Object.keys(now).filter(key=>typeof now[key]==='function')))throw Error('Exported functions changed: '+file);
 for(const name of names){
  const before=old[name](),after=now[name]();
  const beforeText=normalizeText(before),afterText=normalizeText(after);
  const beforeAttrs={ids:attributes(before,'id'),hrefs:attributes(before,'href'),images:images(before)};
  const afterAttrs={ids:attributes(after,'id'),hrefs:attributes(after,'href'),images:images(after)};
  reports.push({file,function:name,beforeChars:beforeText.length,afterChars:afterText.length,reductionPercent:Number(((1-afterText.length/beforeText.length)*100).toFixed(2)),preservation:Object.fromEntries(Object.keys(beforeAttrs).map(k=>[k,equal(beforeAttrs[k],afterAttrs[k])])),beforeAttributes:beforeAttrs,afterAttributes:afterAttrs});
 }
}
const beforeChars=reports.reduce((n,r)=>n+r.beforeChars,0),afterChars=reports.reduce((n,r)=>n+r.afterChars,0);
const original=JSON.parse(fs.readFileSync('qa/copy-edit-2026-10-13/module-copy-comparison.json','utf8'));
const originalCountingMethodReproduced=original.beforeChars===beforeChars&&reports.every(r=>original.reports.find(p=>p.file===r.file&&p.function===r.function)?.beforeChars===r.beforeChars);
const result={scope:'Final Korean page-depth modules only: all seven exported HTML functions counted once. Counts include headings, captions, list labels and visible text glyphs; exclude tags and attributes. Same tag stripping and whitespace normalization applied to both versions. Not total website copy or portfolio copy.',method:"html.replace(/<[^>]*>/g, ' ').replace(/\\s+/g, ' ').trim().length",baseline:'qa/copy-edit-2026-10-13/original/*.mjs',final:'src/page-depth/*.mjs',originalCountingMethodReproduced,beforeChars,afterChars,reductionChars:beforeChars-afterChars,reductionPercent:Number(((1-afterChars/beforeChars)*100).toFixed(2)),allIdsHrefsImagesPreserved:reports.every(r=>Object.values(r.preservation).every(Boolean)),reports};
fs.writeFileSync('qa/editorial-2026-10-13/copy-final.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({beforeChars,afterChars,reductionPercent:result.reductionPercent,originalCountingMethodReproduced,allIdsHrefsImagesPreserved:result.allIdsHrefsImagesPreserved,functions:reports.map(({file,function:name,beforeChars,afterChars,reductionPercent,preservation})=>({file,function:name,beforeChars,afterChars,reductionPercent,preservation}))},null,2));
