from pathlib import Path
import re, json, hashlib, zipfile
from pypdf import PdfReader
from lxml import etree

root=Path(__file__).resolve().parent
dest=root.parents[1]/'deliverables'/'planning-2026-10-12'
source=(root/'기획서_tree.md').read_text(encoding='utf-8')
(root/'기획서.md').write_text(source,encoding='utf-8')
audit=(root/'tree-audit.md').read_text(encoding='utf-8')
public=re.findall(r'```text\n(.*?)\n```',audit,re.S)[0].replace('/works/{project-id}/','/works/project/{slug}/')
blocks=re.findall(r'```text\n(.*?)\n```',source,re.S)
tree='# 올더커뮤니케이션 사이트·관리·디자인시스템 트리\n\n2026-10-12 · 구조 설계안 1.0\n\n정식 콘텐츠·기능은 S03 실행요약 (2)에 S04 상세 기능을 보완했다. URL과 데이터 구조는 구현 제안이다. 다국어 전체 사이트는 범위 미정이며 언어 확장 구조만 준비한다. 독립 서비스 상세 10개는 필수가 아니다.\n\n## 공개 사이트\n\n```text\n'+public+'\n```\n\n'
tree+='사례 필터: 디지털 / 콘텐츠·디자인 / 영상 / 미디어 광고 / 인플루언서 / 병원 / 전략·컨설팅 / IT / 언론홍보. 분류 9개, 전체를 포함하면 선택지 10개다. 비어 있는 분류는 숨긴다.\n\n'
for title,block in [('콘텐츠·관리·문의',blocks[2]),('언어 확장 — 조건부',blocks[3]),('디자인시스템 — 신설 규격 제안',blocks[4]),('구현과 모션 제작 — 구조 제안',blocks[5])]:
    tree+='## '+title+'\n\n```text\n'+block+'\n```\n\n'
(dest/'올더커뮤니케이션_사이트트리_2026-10-12.md').write_text(tree,encoding='utf-8')

docx=dest/'올더커뮤니케이션_자료분석_홈페이지기획서_2026-10-12.docx'
with zipfile.ZipFile(docx) as z:
    assert z.testzip() is None
    xml=etree.fromstring(z.read('word/document.xml'))
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    text=''.join(xml.xpath('//w:t/text()',namespaces=ns))
    for item in ['8','10','9','사이트맵','미리 선택하지 않고','Three.js','HyperFrames','404','개인정보']:
        assert item in text,item
    headings=xml.xpath('//w:p[w:pPr/w:pStyle[@w:val="Heading1"]]',namespaces=ns)
    assert len(headings)==15,len(headings)
pdf=PdfReader(root/'render-tree-qa'/'plan.pdf')
assert len(pdf.pages)==15,len(pdf.pages)
assert all(len(p.extract_text() or '')>500 for p in pdf.pages)
manifest={
    'date':'2026-10-12',
    'scope':'Formal source analysis, reference audit, site tree and design/motion planning. No website implementation or deployment.',
    'docx_pages':len(pdf.pages),
    'source_documents':4,
    'reference_qa':{'engine':'Playwright Chromium','conditions':['1440x1000','390x844','1440x1000 reduced motion'],'external_requests_blocked':True,'live_form_submission':False},
    'artifacts':[{'name':p.name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(dest.iterdir()) if p.suffix in ['.docx','.md']]
}
(dest/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(pdf.pages),'headings':len(headings),'artifacts':len(manifest['artifacts'])}))
