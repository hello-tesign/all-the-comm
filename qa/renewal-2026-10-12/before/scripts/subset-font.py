from pathlib import Path
import sys
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / '.build-tools' / 'python'))
from fontTools import subset
from fontTools.ttLib import TTFont
texts = []
for base in ['src', 'scripts']:
    for p in (root / base).rglob('*'):
        if p.suffix in ['.json', '.js', '.mjs', '.css']:
            texts.append(p.read_text(encoding='utf-8'))
text = ''.join(texts) + ''.join(chr(i) for i in range(32,127))
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
font = TTFont(root / 'public/fonts/PretendardVariable.woff2')
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
font.flavor = 'woff2'
target = root / 'public/fonts/PretendardSite.woff2'
font.save(target)
print(f'Site subset: {target.stat().st_size:,} bytes; full Korean fallback preserved.')
