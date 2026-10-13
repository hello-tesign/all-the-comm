import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const files={};
async function walk(dir){
 for(const item of await fs.readdir(dir,{withFileTypes:true})){
  const target=path.join(dir,item.name);
  if(item.isDirectory())await walk(target);
  else files[path.relative(root,target).replaceAll('\\','/')]=createHash('sha256').update(await fs.readFile(target)).digest('hex');
 }
}
await walk(path.join(root,'dist'));
const general=JSON.parse(await fs.readFile(path.join(root,'qa/final/results.json')));
const glass=JSON.parse(await fs.readFile(path.join(root,'qa/round-02-glass/results.json')));
if(general.failed||glass.failed)throw new Error('Cannot package a build with failed QA.');
await fs.writeFile(path.join(root,'deliverables/release-manifest.json'),JSON.stringify({revision:'2026-10-02-glass-v2',generatedAt:new Date().toISOString(),state:'local-reviewed-build-not-live',checks:{general:general.passed,glass:glass.passed},files},null,2));
console.log(`Recorded ${Object.keys(files).length} deployment files; ${general.passed+glass.passed} checks passed.`);
