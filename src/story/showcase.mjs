// 작업물 쇼케이스 — 3D 회랑 + 3D 플립 카드. 앞면은 다듬은 화면 프레임, 뒷면은 프로젝트 요약입니다.
// 소적두는 WORKS 개별 사례 전용이므로 제외합니다. 이미지 원본은 public/showcase/ (16:10 상단 기준 크롭).
import { portfolio } from '../data/portfolio.mjs';

const picks = [
  ['jonghae-community', 'jonghae', 'web', 'jonghae.or.kr'],
  ['soulreset', 'soulreset', 'web', 'soulreset.kr'],
  ['ezylens-studio', 'ezylens', 'web', 'ezylens.studio'],
  ['city-culture', 'city', 'poster', ''],
  ['kings-franchise', 'kings', 'web', 'kings franchise'],
  ['sales-rehearsal', 'book', 'poster', ''],
  ['tesign-radar', 'radar', 'web', 'tesign radar'],
  ['patient-guide', 'patient', 'poster', ''],
  ['review-atelier', 'atelier', 'app', 'review atelier'],
  ['kfood-dashboard', 'kfood', 'app', 'kfood dashboard']
];
const tints = ['#59e3c6', '#c9a77a', '#8fb7ff', '#f2b45c', '#e86f52', '#b7c4c9', '#7be0b8', '#9ad0e6', '#c1a3ff', '#ffd27a'];

const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const showcaseItems = picks.map(([slug, img, kind, url], i) => {
  const p = portfolio.find(x => x.slug === slug);
  if (!p) throw Error('Unknown showcase project: ' + slug);
  return { slug, img, kind, url, tint: tints[i], title: p.title, type: p.type, industry: p.industry, summary: p.summary, scope: String(p.scope || '').split(' · ').filter(Boolean).slice(0, 4) };
});

const frame = it => {
  if (it.kind === 'poster') return `<div class="sc-poster"><img src="/showcase/${it.img}.webp" alt="" loading="lazy" decoding="async"></div>`;
  return `<div class="sc-browser"><div class="sc-chrome"><i></i><i></i><i></i><span>${E(it.url)}</span></div><img src="/showcase/${it.img}.webp" srcset="/showcase/${it.img}-600.webp 600w,/showcase/${it.img}.webp 1200w" sizes="(max-width:760px) 80vw,520px" alt="" width="1200" height="750" loading="lazy" decoding="async"></div>`;
};

export function showcase({ arrow }) {
  const items = showcaseItems;
  return `
<section id="st-gallery" class="st-pin st-gallery" data-scene="gallery" data-chapter="06|작업물" style="--h:${120 + items.length * 34}">
 <div class="st-sticky">
  <div class="sc-head st-shell">
   <div><p class="st-eyebrow">SELECTED WORK</p><h2 class="st-h2">작업을, <em>정면에서.</em></h2></div>
   <p class="sc-note">제작자 프로젝트·자체 콘셉트·프로토타입을 함께 보여 드립니다.<br>가운데 작업을 누르면 뒤집혀 수행 범위가 보입니다.</p>
  </div>
  <div class="sc-stage" data-sc-stage>
   <div class="sc-glow" aria-hidden="true"></div>
   <ul class="sc-ring" aria-label="작업물 ${items.length}건">
    ${items.map((it, i) => `<li class="sc-item" data-i="${i}" style="--tint:${it.tint}">
     <div class="sc-flip">
      <div class="sc-face sc-front">
       ${frame(it)}
       <button type="button" class="sc-turn" aria-pressed="false" aria-label="${E(it.title)} 뒷면 보기"><span>뒤집어 보기</span></button>
      </div>
      <div class="sc-face sc-back" aria-hidden="true">
       <small>${E(it.type)}</small>
       <h3>${E(it.title)}</h3>
       <p>${E(it.summary)}</p>
       <ul>${it.scope.map(s => `<li>${E(s)}</li>`).join('')}</ul>
       <span class="sc-ind">${E(it.industry)}</span>
       <div class="sc-back-act"><a href="/works/project/${it.slug}/" tabindex="-1">프로젝트 보기${arrow}</a><button type="button" class="sc-unturn" tabindex="-1">앞면</button></div>
      </div>
     </div>
    </li>`).join('')}
   </ul>
  </div>
  <div class="sc-foot st-shell">
   <p class="sc-cap" aria-live="polite"><b data-sc-title>${E(items[0].title)}</b><span data-sc-type>${E(items[0].type)}</span></p>
   <div class="sc-ctrl"><button type="button" data-sc-prev aria-label="이전 작업">←</button><span data-sc-count>01 / ${String(items.length).padStart(2, '0')}</span><button type="button" data-sc-next aria-label="다음 작업">→</button></div>
   <a class="st-textlink" href="/works/#projects">전체 프로젝트${arrow}</a>
  </div>
 </div>
</section>`;
}
