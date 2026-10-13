from pathlib import Path
from collections import Counter
import json
import hashlib
from pypdf import PdfReader
from PIL import Image

out = Path(__file__).parent
ai = Path(r'C:\Users\home\Downloads\올더로고-0523-fin-수정.ai')
png = Path(r'C:\Users\home\Downloads\KakaoTalk_20261011_121904837.png')
r = PdfReader(ai)
info = {
    'ai_file': str(ai),
    'ai_bytes': ai.stat().st_size,
    'ai_sha256': hashlib.sha256(ai.read_bytes()).hexdigest(),
    'pdf_compatible_header': ai.read_bytes()[:8].decode('ascii'),
    'pages': len(r.pages),
    'page_size_points': [list(map(float,p.mediabox)) for p in r.pages],
    'embedded_fonts': [bool(p['/Resources'].get('/Font')) for p in r.pages],
    'extractable_text': [p.extract_text() for p in r.pages],
    'metadata': dict(r.metadata),
    'colorspaces': {str(k):str(v.get_object()) for k,v in r.pages[0]['/Resources']['/ColorSpace'].get_object().items()},
    'png_file': str(png),
    'png_sha256': hashlib.sha256(png.read_bytes()).hexdigest(),
    'png_size': list(Image.open(png).size),
    'raster_colors_not_brand_spec': {}
}
for f in ['logo-artboard.png','logo-artboard-2.png']:
    colors = Counter(Image.open(out/f).convert('RGB').getdata()).most_common(8)
    info['raster_colors_not_brand_spec'][f] = [{'rgb':list(c),'hex':'#%02x%02x%02x'%c,'pixels':n} for c,n in colors]
(out/'asset-metadata.json').write_text(json.dumps(info, ensure_ascii=False, indent=2),encoding='utf-8')
print(json.dumps(info,ensure_ascii=False,indent=2))
