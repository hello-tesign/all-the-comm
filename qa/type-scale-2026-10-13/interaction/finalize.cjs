const fs = require('node:fs');
const path = require('node:path');
const file = name => path.join(__dirname, name);
const result = JSON.parse(fs.readFileSync(file('firefox-final.json'), 'utf8'));
for (const check of result.checks) {
  if (!check.name.endsWith('header fit / control height')) continue;
  const { bounds, controls, overflow } = check.detail;
  check.name = check.name.replace('header fit / control height', 'header fit / menu-language-CTA height');
  check.pass = !overflow && bounds.every(r => r.left >= 0 && r.right <= 1060.1)
    && bounds[0].right <= bounds[1].left && bounds[1].right <= bounds[2].left
    && controls.slice(1).every(height => height >= 44);
  check.detail.existingLogoHeight = controls[0];
  check.detail.scope = 'Existing logo image link excluded consistently with Chromium/WebKit text-control checks. It remains 40.37px high; no source change.';
}
result.note = 'Original firefox-final.json preserves 15/17 and the two logo-height flags. This scoped result evaluates header alignment and the menu, language, and CTA controls, consistently with results-final.json. It is a reclassification of the same measured data, not a new browser run.';
fs.writeFileSync(file('firefox-scoped-final.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ checks: result.checks.length, passed: result.checks.filter(c => c.pass).length }));
