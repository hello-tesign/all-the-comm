from pathlib import Path
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.opc.constants import RELATIONSHIP_TYPE as RT

root=Path(__file__).resolve().parent
source=root/'기획서_tree.md'
dest=root.parents[1]/'deliverables'/'planning-2026-10-12'
dest.mkdir(parents=True,exist_ok=True)
doc=Document()
doc.settings.odd_and_even_pages_header_footer=False
sec=doc.sections[0]
sec.different_first_page_header_footer=False
sec.page_width=Inches(8.5);sec.page_height=Inches(11)
sec.top_margin=Inches(.65);sec.bottom_margin=Inches(.65)
sec.left_margin=Inches(.72);sec.right_margin=Inches(.72)
sec.header_distance=Inches(.28);sec.footer_distance=Inches(.3)
for grid in list(sec._sectPr.findall(qn('w:docGrid'))):sec._sectPr.remove(grid)
for style in doc.styles:
    for border in list(style.element.iter(qn('w:pBdr'))):border.getparent().remove(border)
    if style.type == 1:
        ppr=style.element.get_or_add_pPr()
        snap=OxmlElement('w:snapToGrid');snap.set(qn('w:val'),'0');ppr.append(snap)

def font(style,size,bold=False):
    s=doc.styles[style];s.font.name='Malgun Gothic';s.font.size=Pt(size);s.font.bold=bold;s.font.italic=False;s.font.color.rgb=RGBColor(0,0,0)
    rpr=s.element.get_or_add_rPr();fonts=rpr.find(qn('w:rFonts'))
    if fonts is None:fonts=OxmlElement('w:rFonts');rpr.insert(0,fonts)
    for key in list(fonts.attrib):
        if 'Theme' in key:del fonts.attrib[key]
    for role in ['ascii','hAnsi','eastAsia','cs']:fonts.set(qn('w:'+role),'Malgun Gothic')
font('Normal',11);font('Title',25,True);font('Subtitle',12);font('Heading 1',17,True);font('Heading 2',12.5,True)
normal=doc.styles['Normal'].paragraph_format
normal.line_spacing=Pt(15.5);normal.space_after=Pt(6);normal.space_before=Pt(0)
for name in ['Heading 1','Heading 2']:
    f=doc.styles[name].paragraph_format;f.space_before=Pt(11);f.space_after=Pt(7);f.keep_with_next=True;f.line_spacing=Pt(22 if name=='Heading 1' else 18)
doc.styles['Title'].paragraph_format.space_after=Pt(10)
doc.styles['Title'].paragraph_format.line_spacing=Pt(31)

header=sec.header.paragraphs[0]
header.text='올더커뮤니케이션  홈페이지 개편 기획'
header.style='Normal'
for r in header.runs:r.font.size=Pt(8);r.font.color.rgb=RGBColor(0,0,0)
footer=sec.footer.paragraphs[0];footer.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=footer.add_run('2026 10 12   |   ');r.font.size=Pt(8)
field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)

def inline(p,text):
    for i,part in enumerate(re.split(r'\*\*(.*?)\*\*',text)):
        for j,chunk in enumerate(re.split(r'(https?://\S+)',part)):
            if j%2:
                link=OxmlElement('w:hyperlink');link.set(qn('r:id'),p.part.relate_to(chunk,RT.HYPERLINK,is_external=True))
                rr=OxmlElement('w:r');pr=OxmlElement('w:rPr');color=OxmlElement('w:color');color.set(qn('w:val'),'000000');pr.append(color);rr.append(pr)
                t=OxmlElement('w:t');t.text=chunk;rr.append(t);link.append(rr);p._p.append(link)
            else:
                r=p.add_run(chunk)
                if i%2:r.bold=True

def paragraph(text,style=None):
    p=doc.add_paragraph(style=style);inline(p,text)
    if text.startswith('근거  '):
        for r in p.runs:r.font.size=Pt(8.5);r.font.color.rgb=RGBColor.from_string('555555')
        p.paragraph_format.space_before=Pt(5)
    return p

def table(lines):
    rows=[[s.strip() for s in line.strip().strip('|').split('|')] for line in lines]
    rows=[r for r in rows if not all(re.match(r'^:?-+:?$',x) for x in r)]
    n=len(rows[0]);t=doc.add_table(rows=0,cols=n);t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
    ratios={2:[.30,.70],3:[.22,.28,.50],4:[.18,.36,.27,.19],5:[.26,.12,.13,.13,.36]}[n]
    # Three-column tables with a compact final field need different geometry.
    if rows[0][-1]=='메인 연결':ratios=[.25,.60,.15]
    if rows[0][0]=='순서':ratios=[.19,.40,.41]
    if rows[0][1] in ['제안 작업량','필수 여부']:ratios=[.25,.19,.56]
    if rows[0][0]=='우선순위':ratios=[.17,.39,.44]
    if rows[0][0]=='화면과 제안 경로':ratios=[.29,.31,.40]
    custom={'서비스 ID':[.16,.45,.39],'구분':[.21,.50,.29],'관찰':[.30,.24,.46],
            '장면':[.18,.48,.34],'디자인 평가 항목':[.34,.10,.56],
            '요구':[.30,.31,.39],'단계':[.21,.41,.38]}
    if rows[0][0] in custom:ratios=custom[rows[0][0]]
    for col,ratio in zip(t.columns,ratios):col.width=Inches(7.06*ratio)
    for i,row in enumerate(rows):
        cells=t.add_row().cells
        trpr=t.rows[-1]._tr.get_or_add_trPr()
        cant=OxmlElement('w:cantSplit');trpr.append(cant)
        if i==0:
            repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
        for j,(cell,text) in enumerate(zip(cells,row)):
            cell.width=Inches(7.06*ratios[j]);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            tcpr=cell._tc.get_or_add_tcPr()
            mar=OxmlElement('w:tcMar')
            for side,val in [('top',95),('bottom',95),('left',105),('right',105)]:
                el=OxmlElement('w:'+side);el.set(qn('w:w'),str(val));el.set(qn('w:type'),'dxa');mar.append(el)
            tcpr.append(mar)
            borders=OxmlElement('w:tcBorders')
            for side in ['top','left','bottom','right']:
                el=OxmlElement('w:'+side);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');el.set(qn('w:color'),'D9D9D9');borders.append(el)
            tcpr.append(borders)
            shading=OxmlElement('w:shd');shading.set(qn('w:fill'),'333333' if i==0 else ('F4F4F4' if i%2==0 else 'FFFFFF'));tcpr.append(shading)
            p=cell.paragraphs[0];inline(p,text);p.paragraph_format.space_after=Pt(0);p.paragraph_format.line_spacing=Pt(14)
            if i==0 or (n==5 and j in [1,2,3]) or rows[0][j]=='배점':p.alignment=WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:run.font.size=Pt(10);run.font.bold=i==0;run.font.color.rgb=RGBColor.from_string('FFFFFF' if i==0 else '000000')
    gap=doc.add_paragraph();gap.paragraph_format.space_after=Pt(5);gap.paragraph_format.space_before=Pt(0);gap.paragraph_format.line_spacing=Pt(2)
    gap.add_run('').font.size=Pt(1)

def codeblock(lines):
    p=doc.add_paragraph()
    p.paragraph_format.line_spacing=Pt(15)
    p.paragraph_format.space_before=Pt(4)
    p.paragraph_format.space_after=Pt(10)
    p.paragraph_format.keep_together=True
    r=p.add_run('\n'.join(lines));r.font.name='Consolas';r.font.size=Pt(10.5)
    fonts=r._r.get_or_add_rPr().find(qn('w:rFonts'));fonts.set(qn('w:eastAsia'),'Malgun Gothic')

lines=source.read_text(encoding='utf-8').splitlines()
i=0
while i<len(lines):
    line=lines[i].strip()
    if not line:i+=1;continue
    if line.startswith('```'):
        block=[];i+=1
        while i<len(lines) and not lines[i].startswith('```'):block.append(lines[i]);i+=1
        codeblock(block)
    elif line=='<!-- page -->':doc.add_page_break()
    elif line.startswith('# '):paragraph(line[2:].replace(' 홈페이지','\n홈페이지',1),'Title')
    elif line.startswith('## '):paragraph(line[3:],'Heading 1')
    elif line.startswith('### '):paragraph(line[4:],'Heading 2')
    elif line.startswith('|'):
        rows=[]
        while i<len(lines) and lines[i].strip().startswith('|'):rows.append(lines[i]);i+=1
        table(rows);continue
    elif line.startswith('- '):
        p=paragraph('• '+line[2:]);p.paragraph_format.left_indent=Inches(.12);p.paragraph_format.first_line_indent=Inches(-.12)
    elif line.startswith('정식 요청 분석'):paragraph(line,'Subtitle')
    else:paragraph(line)
    i+=1

doc.core_properties.title='올더커뮤니케이션 홈페이지 개편 기획서'
doc.core_properties.subject='정식 요청 분석, 사이트 트리, 디자인시스템 및 모션 설계'
doc.core_properties.author='올더커뮤니케이션 리뉴얼 기획'
doc.core_properties.keywords='홈페이지, 기획, 자료분석, 2026-10-12'
filename=dest/'올더커뮤니케이션_자료분석_홈페이지기획서_2026-10-12.docx'
doc.save(filename)
(dest/'올더커뮤니케이션_자료분석_홈페이지기획서_2026-10-12.md').write_text(source.read_text(encoding='utf-8'),encoding='utf-8')
print(str(filename).encode('ascii','backslashreplace').decode())
