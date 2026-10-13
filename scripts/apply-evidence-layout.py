from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'scripts/build-renewal.mjs'
s=p.read_text(encoding='utf-8')
def swap(old,new):
    global s
    if old not in s: raise RuntimeError('Missing source: '+old[:80])
    s=s.replace(old,new,1)
swap("const root=fileURLToPath", "import {evidenceHero,evidenceVisual,evidenceBenefit,evidenceAbout,evidenceHomeAbout,evidenceChapter,evidenceProcessPreview,evidenceSelfArt,evidenceSelfFilm,evidenceContactNote} from '../src/evidence-content.mjs';\nconst root=fileURLToPath")
swap("'isos-motion.css','scroll-story.css'", "'isos-motion.css','scroll-story.css','evidence.css','evidence-motion.css'")
swap('<body class="${cls}" data-locale=', '<body class="${cls}${en?\'\':\' evidence-site\'}" data-locale=')
start=s.index('<div class="capability-visual">')
end=s.index('<div class="capability-copy">',start)
old=s[start:end]
s=s[:start]+"${en?`"+old+"`:evidenceVisual(s.id)}"+s[end:]
swap("<p>${t(s.summary,s.summaryEn)}</p><ul>","<p>${t(evidenceBenefit(s.id),s.summaryEn)}</p><ul>")
swap('function workArt(){return `','function workArt(){if(!en)return evidenceSelfArt();return `')
swap('const hero=`','const hero=en?`')
swap('</div></section>`;\n add(\'/\'', '</div></section>`:evidenceHero();\n add(\'/\'')
old='<div class="process-word" aria-hidden="true">${s.word}<span>.</span></div>'
swap(old,"${en?`"+old+"`:evidenceProcessPreview(i)}")
start=s.index('<div class="channel-composition"')
end=s.index('<div><p class="eyebrow">ALL THE EXPERTISE.',start)
old=s[start:end]
s=s[:start]+"${en?`"+old+"`:evidenceHomeAbout()}"+s[end:]
old='<div class="about-brand"><img src="/brand/logo-symbol.svg" alt="" width="400" height="399"><span>ALL THE<br>PERSPECTIVES.</span></div>'
swap(old,"${en?`"+old+"`:evidenceAbout()}")
old='<span class="principle-mark" aria-hidden="true">${[\'◜\',\'◝\',\'◞\',\'◟\',\'○\'][i]}</span>'
swap(old,"${en?`"+old+"`:''}")
old='<div class="chapter-art" aria-hidden="true"><span>${s.word}</span><div class="chapter-orbit">${mark([\'focus\',\'orbit\',\'layers\',\'signal\'][i])}</div></div>'
swap(old,"${en?`"+old+"`:evidenceChapter(i)}")
start=s.index('<div class="discipline-art"')
end=s.index('<div class="discipline-copy">',start)
old=s[start:end]
s=s[:start]+"${en?`"+old+"`:evidenceVisual(['strategy','digital','content','content','video','media','influencer','it','pr'][i])}"+s[end:]
old='<img src="/brand/logo-symbol.svg" width="180" height="180" alt=""/>'
swap(old,"${en?`"+old+"`:evidenceContactNote()}")
start=s.index('<div class="case-film"><video')
end=s.index('<div class="case-story">',start)
old=s[start:end]
# Keep this wrapper for the existing server's dynamic-case replacement contract.
s=s[:start]+"<div class=\"case-film\">${en?`"+old[len('<div class="case-film">'):-len('</div>')]+"`:evidenceSelfFilm()}</div>"+s[end:]
swap("t('시작은,<br>우리의 곡선에서.'", "t('고객의 질문에서,<br>상담까지.'")
p.write_text(s,encoding='utf-8')
print('Korean evidence layout integrated; English branches preserved.')
