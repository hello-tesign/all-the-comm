from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import json, hashlib, shutil, difflib

root=Path(__file__).resolve().parent
source=Path('C:/Users/home/Downloads')
out=root/'sources'; out.mkdir(parents=True,exist_ok=True)
names=['올더커뮤니케이션_홈페이지_개편_실행요약.docx',
       '올더커뮤니케이션_홈페이지_개편_실행요약 (1).docx',
       '올더커뮤니케이션_홈페이지_개편_실행요약 (2).docx',
       '올더커뮤니케이션_홈페이지_개편_업무지시서.docx',
       '올더로고-0523-fin-수정.ai','KakaoTalk_20261011_121904837.png']
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
data=[]
for i,name in enumerate(names,1):
    file=source/name
    shutil.copy2(file,out/name)
    record={'id':f'S{i:02}','name':name,'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
    if file.suffix=='.docx':
        with ZipFile(file) as z:
            document=ET.fromstring(z.read('word/document.xml'))
            paragraphs=[]
            for p in document.findall('.//w:body//w:p',ns):
                text=''.join((t.text or '') for t in p.findall('.//w:t',ns))
                if text.strip():paragraphs.append({'id':f'P{len(paragraphs)+1:03}','text':text})
            record.update(paragraphs=paragraphs,table_count=len(document.findall('.//w:tbl',ns)),image_parts=[n for n in z.namelist() if n.startswith('word/media/')],tracked_insertions=len(document.findall('.//w:ins',ns)),tracked_deletions=len(document.findall('.//w:del',ns)),metadata=z.read('docProps/core.xml').decode('utf-8') if 'docProps/core.xml' in z.namelist() else '')
            (root/f'{record["id"]}.txt').write_text('\n'.join(f'[{p["id"]}] {p["text"]}' for p in paragraphs),encoding='utf-8')
    data.append(record)
(root/'source-inventory.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
for a,b in [(0,1),(1,2),(0,2)]:
    diff='\n'.join(difflib.unified_diff([p['text'] for p in data[a]['paragraphs']],[p['text'] for p in data[b]['paragraphs']],fromfile=data[a]['name'],tofile=data[b]['name'],lineterm=''))
    (root/f'diff-S{a+1:02}-S{b+1:02}.txt').write_text(diff,encoding='utf-8')
print(json.dumps([{k:v for k,v in r.items() if k not in ['paragraphs','metadata']} for r in data],ensure_ascii=False,indent=2))
