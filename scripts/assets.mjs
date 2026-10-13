import fs from 'node:fs/promises';
const root = new URL('../public/fonts/', import.meta.url);
await fs.mkdir(root,{recursive:true});
const files = [
 ['PretendardVariable.woff2','https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'],
 ['Pretendard-LICENSE.txt','https://raw.githubusercontent.com/orioncactus/pretendard/main/LICENSE'],
 ['Manrope.ttf','https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/Manrope%5Bwght%5D.ttf'],
 ['Manrope-LICENSE.txt','https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt']
];
for (const [name,url] of files) {
 const response=await fetch(url); if(!response.ok) throw new Error(name+': '+response.status);
 const buffer=Buffer.from(await response.arrayBuffer());
 await fs.writeFile(new URL(name,root),buffer); console.log(name,buffer.length);
}
