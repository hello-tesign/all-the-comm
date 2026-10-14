// 작업물 쇼케이스 — 3D 회랑 + 3D 플립 카드. 앞면은 3:4로 꽉 채운 작업 이미지, 뒷면은 프로젝트 요약입니다.
// 브랜드 의뢰 작업(일러스트·포스터·패키지)과 실제 웹사이트만 고릅니다. 프로토타입·자체 콘셉트는 WORKS에만 둡니다.
// 소적두는 WORKS 개별 사례 전용이므로 제외합니다. 이미지는 public/showcase/card/ (3:4, 웹은 왼쪽 위 기준 크롭).
import { portfolio } from '../data/portfolio.mjs';
import { brandWork } from '../data/portfolio-brand-work.mjs';

const projects = [...portfolio, ...brandWork];
const picks = [
  ['eyewear-campaign', 'eyewear', 'art'],
  ['coffee-package', 'coffee', 'art'],
  ['jonghae-community', 'jonghae', 'web', 'jonghae.or.kr'],
  ['w-oil-campaign', 'woil', 'art'],
  ['bugak-branding', 'bugak', 'art'],
  ['soulreset', 'soulreset', 'web', 'soulreset.kr'],
  ['microplastic-tee', 'microplastic', 'art'],
  ['sales-rehearsal', 'book', 'art'],
  ['kings-franchise', 'kings', 'web', 'kings franchise'],
  ['graphic-tee', 'graphictee', 'art']
];
const tints = ['#59e3c6', '#2f6bff', '#c9a77a', '#4fa3ff', '#f2b45c', '#8a6a4f', '#e86f52', '#b7a58f', '#2f7a4f', '#7be0b8'];

const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const showcaseItems = picks.map(([slug, img, kind, url], i) => {
  const p = projects.find(x => x.slug === slug);
  if (!p) throw Error('Unknown showcase project: ' + slug);
  return { slug, img, kind, url, tint: tints[i], title: p.title, type: p.type, industry: p.industry, summary: p.summary, scope: String(p.scope || '').split(' · ').filter(Boolean).slice(0, 4) };
});

// 3:4 card image, also used by the hero reels and TEAM thumbnails.
export const cardImage = (key, size = 900) => `/showcase/card/${key}${size === 450 ? '-450' : ''}.webp`;

const frame = it => `${it.kind === 'web' ? `<div class="sc-chrome"><i></i><i></i><i></i><span>${E(it.url)}</span></div>` : ''}<img class="sc-img" src="${cardImage(it.img)}" srcset="${cardImage(it.img, 450)} 450w,${cardImage(it.img)} 900w" sizes="(max-width:760px) 80vw,400px" alt="" loading="lazy" decoding="async">`;

export function showcase({ arrow }) {
  const items = showcaseItems;
  return `
<section id="st-gallery" class="st-pin st-gallery" data-scene="gallery" data-chapter="06|작업물" style="--h:${120 + items.length * 34}">
 <div class="st-sticky">
  <div class="sc-head st-shell">
   <div><p class="st-eyebrow">SELECTED WORK</p><h2 class="st-h2">작업을, <em>정면에서.</em></h2></div>
   <p class="sc-note">브랜드 광고·패키지부터 웹사이트까지, 직접 기획하고 만든 작업입니다.<br>가운데 작업을 누르면 뒤집혀 수행 범위가 보입니다.</p>
  </div>
  <div class="sc-stage" data-sc-stage>
   <div class="sc-glow" aria-hidden="true"></div>
   <ul class="sc-ring" aria-label="작업물 ${items.length}건">
    ${items.map((it, i) => `<li class="sc-item" data-i="${i}" style="--tint:${it.tint}">
     <div class="sc-flip">
      <div class="sc-face sc-front${it.kind === 'web' ? ' is-web' : ''}">
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
     <span class="sc-shade" aria-hidden="true"></span>
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
