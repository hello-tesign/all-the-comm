// One-time, reversible migration from literal sizes to desktop type tokens.
import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
const root = process.cwd();
const files = ['styles.css','styles-team.css','portfolio.css','scroll-story.css','evidence.css','agency-composition.css','page-depth/healthcare.css','page-depth/about-process.css','page-depth/team-contact.css','footer-refinement.css','editorial-presentation.css'];
const steps = [12,14,16,18,20,24,28,32,36,40,44,48,56,64,72,80,88,96,112,128,144,160,192,224,256,288];
const next = n => steps.find(s => s > n) ?? n + 32;
const tokens = new Map(), changes = [];
for (const file of files) {
  const source = await fs.readFile(path.join(root,'src',file),'utf8');
  if (source.includes('--type-step-')) throw Error('Migration already applied: '+file);
  const backup = path.join(root,'qa/type-scale-2026-10-13/source-before',file);
  await fs.mkdir(path.dirname(backup),{recursive:true});
  await fs.writeFile(backup,source);
  const ast = postcss.parse(source);
  ast.walkDecls('font-size', decl => {
    // The main brand headline keeps its exact responsive scale.
    if (decl.parent.selector?.includes('.agency-hero-content h1')) return;
    const original = decl.value;
    let name, value;
    const px = original.match(/^(\d+)px$/);
    const fluid = original.match(/^clamp\((\d+)px,\s*([\d.]+)vw,\s*(\d+)px\)$/);
    if (px) {
      const size = +px[1];
      if (size < 9) return; // Miniature artwork and purely decorative lettering.
      name = '--type-step-'+size;
      value = next(size)+'px';
    } else if (fluid) {
      const [,min,vw,max] = fluid;
      name = '--type-step-fluid-'+min+'-'+vw.replace('.','p')+'-'+max;
      value = `clamp(${next(+min)}px,${+(+vw*next(+max)/+max).toFixed(5)}vw,${next(+max)}px)`;
    } else return;
    tokens.set(name,{original,value});
    decl.value = `var(${name},${original})`;
    changes.push({file,selector:decl.parent.selector,original,token:name,value});
  });
  await fs.writeFile(path.join(root,'src',file),ast.toString());
}
const definitions = [...tokens].map(([name,{value}])=>`    ${name}:${value};`).join('\n');
const reset = [...tokens].map(([name])=>`    ${name}:initial;`).join('\n');
const sheet = `/* Korean desktop typography. Fallback literals preserve English and mobile.
   One step: 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32 / 36 / 40 / 44 / 48 / 56 / 64 / 72…
   The company hero H1 and typography inside portfolio artwork stay original. */
@media (min-width:1060px) {
  html[lang=ko] {
${definitions}
  }
  html[lang=ko] body {font-size:18px}
  html[lang=ko] :is(.diverse-sample,.healthcare-service,.work-screen,.work-poster,.channel-composition,.discipline-art,.chapter-art:not(.evidence-chapter)) {
    font-size:16px;
${reset}
  }
}
`;
await fs.writeFile(path.join(root,'src/desktop-typography.css'),sheet);
await fs.writeFile(path.join(root,'qa/type-scale-2026-10-13/migration.json'),JSON.stringify(changes,null,2));
console.log(JSON.stringify({files:files.length,declarations:changes.length,tokens:tokens.size}));
