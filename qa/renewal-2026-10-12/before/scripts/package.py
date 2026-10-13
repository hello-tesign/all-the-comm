"""Package reviewed website files and editable source with QA evidence."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
import json

root = Path(__file__).resolve().parents[1]
destination = root / 'deliverables'
manifest = json.loads((destination / 'release-manifest.json').read_text(encoding='utf-8'))
website = destination / 'ALL-THE-COMM-website-v2.zip'
with ZipFile(website) as archive:
    for file, expected in manifest['files'].items():
        actual = hashlib.sha256(archive.read(file.removeprefix('dist/'))).hexdigest()
        if actual != expected:
            raise ValueError(f'Deployment archive mismatch: {file}')

source = destination / 'ALL-THE-COMM-source-v2.zip'
with ZipFile(source, 'w', ZIP_DEFLATED) as archive:
    for folder in ['src', 'scripts', 'public', 'tests', 'design-system']:
        for file in (root / folder).rglob('*'):
            if file.is_file():
                archive.write(file, file.relative_to(root).as_posix())
    for file in ['README.md', 'package.json', 'qa/HANDOFF.md',
                 'qa/final/results.json', 'qa/round-02-glass/results.json',
                 'qa/round-02-glass/chromium-1440-services.png',
                 'qa/round-02-glass/chromium-390-services.png']:
        archive.write(root / file, file)
with ZipFile(source) as archive:
    assert archive.testzip() is None
    assert 'qa/HANDOFF.md' in archive.namelist()
print(f'Verified {len(manifest["files"])} deployment file hashes and {len(archive.namelist())} source entries.')
