// 국문 HOME 스크롤 스토리. 고객 요구 순서(역할 → 서비스 8 → 사례 → 과정 → 근거 → 상담)를 유지하고,
// 사이 장면은 올더커뮤니케이션의 판단으로 채운 더미 콘텐츠입니다. 목록은 docs/home-story-2026-10-13.md.
// 시각 언어: 로고 심볼의 실루엣(오른쪽 아래만 각진 원)을 창·도형·성장 단계로 반복합니다.
import { featuredCase } from './sample-cases.mjs';
import { showcase, showcaseItems, cardImage } from './showcase.mjs';

const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');

export function homeStory({ homeServices, stages, arrow }) {
  const go = (href, label, cls = '') => `<a class="st-btn ${cls}" href="${href}"><span>${label}</span>${arrow}</a>`;

  // 01 — 회사의 역할. 로고 실루엣 창 안에서 실제 작업 화면이 흐르고, 스크롤하면 창이 화면 전체로 열립니다.
  const reel = showcaseItems;
  const col = (list, cls) => `<div class="st-reel ${cls}">${[...list, ...list].map(it => `<img src="${cardImage(it.img, 450)}" alt="" width="450" height="600" decoding="async">`).join('')}</div>`;
  const hero = `
<section id="st-hero" class="st-pin" data-scene="hero" data-chapter="01|회사의 역할" style="--h:250">
 <div class="st-sticky">
  <div class="st-hero-grid st-shell">
   <div class="st-hero-copy">
    <p class="st-kicker"><i></i>ALL THE COMMUNICATION · 종합광고대행사</p>
    <h1 class="st-hero-title"><span class="st-line"><span>마케팅팀이 없어도,</span></span><span class="st-line"><span><em>마케팅은</em> 멈추지 않게.</span></span></h1>
    <p class="st-hero-lead">전략·디자인·콘텐츠·광고·IT·언론홍보까지.<br>기업에 필요한 마케팅을 한 팀이 기획하고 실행합니다.</p>
    <div class="st-hero-cta">${go('/contact/', '프로젝트 상담', 'st-btn-ink')}${go('#st-services', '제공 서비스 보기', 'st-btn-line')}</div>
   </div>
   <div class="st-mark" aria-hidden="true">
    <span class="st-mark-ring r3"></span><span class="st-mark-ring r2"></span><span class="st-mark-ring r1"></span>
    <div class="st-mark-window">${col(reel.filter((_, i) => i % 2 === 0), 'up')}${col(reel.filter((_, i) => i % 2), 'down')}</div>
   </div>
  </div>
  <div class="st-hero-end"><p>기획부터 운영까지,<br><em>한 팀이 끝까지.</em></p></div>
  <div class="st-hero-foot st-shell" aria-hidden="true"><span>SCROLL</span><i></i></div>
 </div>
</section>`;

  // 02 — 이런 회사와 일합니다. 고민 문장에 선이 그어지고 답이 이어집니다.
  const pains = [
    ['담당자 한 명이 모든 일을 떠안고 있다면', '전담 창구가 업무를 나눠 맡습니다.'],
    ['업체마다 다른 목소리를 내고 있다면', '모든 채널이 한 방향으로 말합니다.'],
    ['집행 뒤에 남는 기록이 없다면', '다음 결정에 쓸 보고서를 남깁니다.']
  ];
  const why = `
<section id="st-why" class="st-pin st-light" data-scene="why" data-chapter="02|이런 회사와 일합니다" style="--h:250">
 <div class="st-sticky">
  <div class="st-shell">
   <p class="st-eyebrow">WHO WE WORK WITH</p>
   <h2 class="st-why-title">마케팅이 필요한데, <em>마케팅팀이 없다면.</em></h2>
   <ol class="st-pains">${pains.map(([q, a], i) => `<li class="st-pain-row"><small>${pad(i + 1)}</small><p><span class="st-pain">${q}</span><span class="st-answer">${a}</span></p></li>`).join('')}</ol>
  </div>
 </div>
</section>`;

  // 03 — 흩어진 마케팅. 엉킨 선(업체별 발주)이 한 팀을 지나 하나의 선으로 정리됩니다. 도형은 story.js가 그립니다.
  const tangle = `
<section id="st-tangle" class="st-pin st-paper" data-scene="tangle" data-chapter="03|흩어진 마케팅" style="--h:260">
 <div class="st-sticky">
  <div class="st-shell st-tangle-head">
   <p class="st-eyebrow">WITHOUT ONE TEAM</p>
   <h2 class="st-h2 st-swap"><span class="a">흩어지면, <em class="warn">비용이 쌓입니다.</em></span><span class="b">한 팀이 이으면, <em>하나로 움직입니다.</em></span></h2>
   <p class="st-costs-m">업체별로 따로 맡기면 — 메시지 불일치 · 중복 제작비 · 소통 지연 · 일정 충돌 · 보고 공백 · 기회 손실</p>
  </div>
  <svg class="st-net" data-st-net role="img" aria-label="여섯 업체에 따로 맡기면 메시지 불일치, 중복 제작비, 소통 지연, 일정 충돌, 보고 공백, 기회 손실이 생깁니다. 한 팀이 연결하면 하나의 흐름으로 정리됩니다."></svg>
 </div>
</section>`;

  // 04 — 서비스 8. 문장 속 업무를 눌러 고르면 상담 링크에 그대로 담깁니다.
  const services = `
<section id="st-services" class="st-sec st-light" data-chapter="04|제공 서비스">
 <div class="st-shell">
  <p class="st-eyebrow">OUR CAPABILITIES · ${homeServices.length}</p>
  <p class="st-sentence" data-st-sentence>저희는 ${homeServices.map((s, i) => `<button type="button" class="st-word" data-id="${s.id}" aria-pressed="false" aria-controls="st-svc-detail"><sup>${pad(i + 1)}</sup>${E(s.ko)}</button>`).join('<span class="st-comma">, </span>')}<span class="st-dimtext">까지, 필요한 업무만 골라 한 팀에 맡길 수 있습니다.</span></p>
  <div class="st-svc-detail" id="st-svc-detail" aria-live="polite">
   ${homeServices.map((s, i) => `<div class="st-svc-row" data-for="${s.id}"${i ? ' hidden' : ''}>
    <b class="st-svc-n">${pad(i + 1)}</b>
    <div><h3>${E(s.ko)}</h3><p>${E(s.summary)}</p></div>
    <p class="st-svc-items">${s.items.map(E).join('<i>/</i>')}</p>
    <a class="st-textlink" href="/works/#${s.id}">자세히 보기${arrow}</a>
   </div>`).join('')}
  </div>
  <div class="st-pick" data-st-pick>
   <p><b data-st-pick-n>0</b><span data-st-pick-t>업무를 눌러 골라 보세요. 고른 업무가 상담 신청서에 담깁니다.</span></p>
   <a class="st-btn st-btn-ink" href="/contact/" data-st-pick-go><span>선택한 업무로 상담하기</span>${arrow}</a>
  </div>
 </div>
</section>`;

  // 05 — 대표 사례(SAMPLE). 실제 납품 사례 자료가 오면 sample-cases.mjs를 교체합니다.
  const fc = featuredCase;
  const caseScene = `
<section id="st-case" class="st-pin st-dark" data-scene="case" data-chapter="05|대표 사례" style="--h:320">
 <div class="st-sticky">
  <div class="st-case-bg" aria-hidden="true"></div>
  <div class="st-shell st-case-grid">
   <div>
    <p class="st-tag">${E(fc.tag)}</p>
    <h2 class="st-h2 st-case-title">${E(fc.title)}<br><em>${E(fc.accent)}</em></h2>
    <ol class="st-beats">${fc.beats.map((b, i) => `<li class="st-beat${i ? '' : ' on'}"><small>${E(b.k)}</small><p>${E(b.t)}</p></li>`).join('')}</ol>
    <p class="st-case-scope">${fc.scope.map(E).join(' · ')}</p>
   </div>
   <div class="st-clock" aria-hidden="true"><small>PROJECT CLOCK</small><b data-st-week>W+1</b></div>
  </div>
  <svg class="st-route" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
   <path id="st-route-path" class="st-route-base" d="M40 250 C 220 250 260 170 420 180 S 640 250 760 190 S 960 60 1160 70"/>
   <path class="st-route-live" d="M40 250 C 220 250 260 170 420 180 S 640 250 760 190 S 960 60 1160 70"/>
  </svg>
  <div class="st-wps" aria-hidden="true">${fc.points.map(p => `<span class="st-wp" data-at="${p.at}"><i></i>${E(p.label)}</span>`).join('')}<span class="st-cardot"></span></div>
  <p class="st-case-note">실제 납품 사례로 교체 예정인 구성 예시입니다.</p>
 </div>
</section>`;

  // 07 — 진행 과정
  const cycle = `
<section id="st-cycle" class="st-pin st-paper" data-scene="cycle" data-chapter="07|진행 과정" style="--h:300">
 <div class="st-sticky">
  <div class="st-shell st-cycle-grid">
   <div>
    <p class="st-eyebrow">OUR PROCESS</p>
    <ul class="st-phr">${stages.map((s, i) => `<li class="${i ? '' : 'on'}"><small>${pad(i + 1)}</small>${E(s.title)}</li>`).join('')}</ul>
    <div class="st-panes">${stages.map((s, i) => `<div class="st-pane${i ? '' : ' on'}"><p>${E(s.body)}</p><p class="st-pane-out">${s.outputs.map(E).join('<i>/</i>')}</p></div>`).join('')}</div>
    <a class="st-textlink" href="/process/">함께 일하는 과정${arrow}</a>
   </div>
   <div class="st-wheel" aria-hidden="true">
    <svg viewBox="0 0 400 400"><circle class="st-wheel-base" cx="200" cy="200" r="150"/><circle class="st-wheel-prog" cx="200" cy="200" r="150" pathLength="100"/></svg>
    ${stages.map((s, i) => `<span class="st-node${i ? '' : ' on'}" style="--a:${i * 90}deg"><small>${pad(i + 1)}</small>${E(s.label)}</span>`).join('')}
    <div class="st-wheel-core"><b>1</b><span>전담 창구</span></div>
   </div>
  </div>
 </div>
</section>`;

  // 08 — 선택할 이유. 단어가 켜진 뒤 로고 실루엣이 화면을 채웁니다.
  const manifestoWords = ['한', '팀이,', '처음부터', '끝까지,', '책임지고', '연결합니다.'];
  const manifesto = `
<section id="st-mani" class="st-pin st-paper" data-scene="mani" data-chapter="08|선택할 이유" style="--h:260">
 <div class="st-sticky st-center">
  <div class="st-mani-mark" aria-hidden="true"></div>
  <p class="st-mani-words" aria-label="${manifestoWords.join(' ')}">${manifestoWords.map(w => `<span aria-hidden="true">${w}</span>`).join(' ')}</p>
 </div>
</section>
<section id="st-nums" class="st-sec st-dark">
 <div class="st-shell">
  <dl class="st-nums">
   ${[[10, '업무 영역', '전략부터 언론홍보까지'], [9, '수행 역할', '프로젝트별 전문 인력 구성'], [4, '진행 단계', '분석 · 전략 · 실행 · 보고'], [1, '전담 창구', '모든 소통을 한곳에서']].map(([n, k, s]) => `<div class="st-num st-rv"><dt><b data-st-count="${n}">${n}</b></dt><dd><span>${k}</span><small>${s}</small></dd></div>`).join('')}
  </dl>
 </div>
</section>`;

  // 09 — 맡기는 방식 비교. 표로 한 번에 읽고, 올더커뮤니케이션 열은 띠로 강조합니다.
  const cols = ['업체별 개별 발주', '단일 분야 대행사', '올더커뮤니케이션'];
  const lenses = [
    ['소통 창구', ['업체 수만큼', '분야별 1곳', '전담 창구 1곳']],
    ['메시지', ['업체마다 해석', '해당 분야 안에서만', '전 채널 한 방향']],
    ['일정', ['담당자가 직접 조율', '다른 업체와 별도', '통합 일정표로 관리']],
    ['보고', ['업체별 문서', '분야 지표 위주', '하나의 보고서와 다음 제안']],
    ['예산', ['항목별 개별 견적', '분야 예산만 관리', '목적 기준으로 배분']]
  ];
  const compare = `
<section id="st-compare" class="st-sec st-light" data-chapter="09|맡기는 방식 비교">
 <div class="st-shell">
  <p class="st-eyebrow">WHO DOES WHAT</p>
  <h2 class="st-h2" data-st-words>따로 맡길 때와, <em>한 팀에 맡길 때.</em></h2>
  <table class="st-table st-rv">
   <caption class="st-sr">마케팅 업무를 맡기는 세 가지 방식 비교</caption>
   <thead><tr><td></td>${cols.map((c, i) => `<th scope="col"${i === 2 ? ' class="us"' : ''}>${c}</th>`).join('')}</tr></thead>
   <tbody>${lenses.map(([k, v], r) => `<tr style="--r:${r}"><th scope="row">${k}</th>${v.map((x, i) => `<td data-label="${cols[i]}"${i === 2 ? ' class="us"' : ''}>${x}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
 </div>
</section>`;

  // 10 — 시작하는 방법. 로고 실루엣이 단계별로 커집니다.
  const levels = [
    ['LV.1', '단건 프로젝트', '브랜드 디자인·영상·홈페이지처럼 범위가 분명한 제작부터.'],
    ['LV.2', '캠페인 운영', '시즌·출시·행사에 맞춰 광고·콘텐츠·홍보를 묶어 운영합니다.'],
    ['LV.3', '외부 마케팅팀', '월 단위로 전략부터 운영·보고까지 맡기는 전담 체계.']
  ];
  const grow = `
<section id="st-grow" class="st-pin st-paper" data-scene="grow" data-chapter="10|시작하는 방법" style="--h:250">
 <div class="st-sticky">
  <div class="st-shell st-grow-grid">
   <div>
    <p class="st-eyebrow">HOW TO START</p>
    <h2 class="st-h2">작게 시작해서,<br><em>필요한 만큼.</em></h2>
    <p class="st-lead">처음부터 전부 맡길 필요는 없습니다. 한 건의 제작으로 시작해 운영과 전담 체계로 넓혀 갑니다. 앞 단계의 자료와 기록은 그대로 이어집니다.</p>
    <ol class="st-levels">${levels.map(([lv, t, b], i) => `<li class="st-level${i ? '' : ' on'}" data-lv="${i + 1}"><b>${lv}</b><div><h3>${t}</h3><p>${b}</p></div></li>`).join('')}</ol>
   </div>
   <div class="st-grow-art" aria-hidden="true">${levels.map(([lv, t], i) => `<span class="st-g g${i + 1}${i ? '' : ' on'}"><small>${lv}</small>${t}</span>`).reverse().join('')}</div>
  </div>
 </div>
</section>`;

  // 11 — 상담 시작
  const asks = [
    ['마케팅 진단 상담', '현재 채널과 자료를 함께 보고, 먼저 할 일을 정리합니다.', '/contact/?service=strategy'],
    ['프로젝트 견적 문의', '필요한 업무와 일정, 예산 범위를 알려 주세요.', '/contact/'],
    ['회사 소개 자료 요청', '서비스 범위와 진행 방식을 정리한 자료를 보내 드립니다.', '/contact/?service=other']
  ];
  const next = `
<section id="st-next" class="st-sec st-light" data-chapter="11|상담 시작">
 <div class="st-shell">
  <p class="st-eyebrow">NEXT STEP</p>
  <h2 class="st-next-title" data-st-words>어디서부터 맡길지, <em>함께 정합니다.</em></h2>
  <ol class="st-asks">${asks.map(([t, d, href], i) => `<li class="st-rv" style="--d:${i * 90}ms"><a href="${href}"><small>${pad(i + 1)}</small><b>${t}</b><span>${d}</span>${arrow}</a></li>`).join('')}</ol>
 </div>
</section>`;

  const hud = `<div class="st-hud" aria-hidden="true"><div class="st-prog"><s></s></div><p class="st-chap"><b data-st-chapn>01</b><i></i><span data-st-chapt>회사의 역할</span></p></div>`;

  return `<div class="st" data-story>${hud}${hero}${why}${tangle}${services}${caseScene}${showcase({ arrow })}${cycle}${manifesto}${compare}${grow}${next}</div>`;
}
