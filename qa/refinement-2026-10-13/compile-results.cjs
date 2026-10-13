const fs=require('node:fs/promises');
const path=require('node:path');
const folder=__dirname;
async function main(){
 const names=['final/results.json','viewer-final/viewer-results.json','process-final/process-results.json'];
 const results=await Promise.all(names.map(async file=>({file,...JSON.parse(await fs.readFile(path.join(folder,file),'utf8'))})));
 const unique=new Map(),history=[],runs=[];
 const canon=name=>{
  const simple={ 'Viewer target no runtime errors':'No runtime JavaScript errors','Viewer target no console errors':'No console errors','Viewer target no write requests':'No inquiry or other write requests' };
  if(simple[name])return simple[name];
  if(name.endsWith(' after actual animation completion'))return name.replace(' after actual animation completion','');
  const m=name.match(/^(chromium|firefox|webkit) ([a-z-]+) (.+)$/);if(!m||!['kfood-dashboard','kings-franchise','content-operations','sales-rehearsal','ezylens-studio','sojukdoo-concept'].includes(m[2]))return name;
  const prefix=m[1]+' case '+m[2],tail=m[3];
  if(tail==='HTTP and actual case')return prefix+' HTTP 200';
  if(tail==='all cover and gallery viewer controls')return prefix+' cover and all gallery images have viewer controls';
  const shot=tail.match(/^image (\d+) (.+)$/);if(!shot)return name;
  const n=shot[1],kind=shot[2];
  if(kind==='fit opens actual loaded source')return prefix+' image '+n+' opens actual capture';
  if(kind==='Escape restores trigger focus')return prefix+' image '+n+' Escape and focus return';
  if(kind==='fit retains dashboard mask')return prefix+' dashboard branding masked viewer fit';
  if(kind==='original retains dashboard mask')return prefix+' dashboard branding masked viewer original';
  if(kind==='original uses intrinsic dimensions'&&m[2]==='content-operations')return prefix+' dashboard original displays intrinsic pixel size';
  return prefix+' image '+n+' '+kind;
 };
 for(const result of results){let added=0,replaced=0;for(const check of result.checks){const key=canon(check.name),old=unique.get(key);if(old){replaced++;history.push({key,previous:old.source,previousPassed:old.passed,latest:result.file,latestPassed:check.passed});}else added++;unique.set(key,{...check,name:key,source:result.file,rawName:check.name});}runs.push({file:result.file,date:result.date,rawPassed:result.passed,rawFailed:result.failed,rawChecks:result.checks.length,newUniqueChecks:added,repeatedOrReplacementChecks:replaced,errors:result.errors.length,consoleErrors:result.consoleErrors.length,writes:result.writes.length});}
 const checks=[...unique.values()],failed=checks.filter(c=>!c.passed),screenshots=[];for(const dir of['final','viewer-final','process-final'])for(const file of await fs.readdir(path.join(folder,dir)))if(file.endsWith('.png'))screenshots.push(dir+'/'+file);
 const summary={date:new Date().toISOString(),scope:'Local 4173 desktop refinement before subsequent hospital-strength content work: six Korean main routes, six changed case pages, six-case viewer checks, PROCESS editorial-image substitution, English baseline and functional parity. Chromium/Firefox/WebKit at 1440x900. No live deployment, real inquiry submission, mail delivery, or existing IAB manipulation.',passed:checks.length-failed.length,failed:failed.length,total:checks.length,runs,sourceFailurePreservation:'Original raw result files remain unchanged, including first-pass/ and final/results.json. Latest condition-based EN outcomes replace three original timing assertions. Viewer or PROCESS repeats are mapped to existing semantic checks rather than added twice.',checks,replacements:history,screenshots,errors:results.flatMap(r=>r.errors),consoleErrors:results.flatMap(r=>r.consoleErrors),writes:results.flatMap(r=>r.writes)};
 await fs.writeFile(path.join(folder,'final-summary.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify({passed:summary.passed,failed:summary.failed,total:summary.total,runs,screenshots:screenshots.length},null,2));if(failed.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
