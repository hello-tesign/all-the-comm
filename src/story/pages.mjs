// 국문 하위 페이지(ABOUT · PROCESS · TEAM · WORKS · CONTACT). 홈 스토리와 같은 디자인 언어를 씁니다.
// 고객 요구 콘텐츠(회사 소개·업무 기준 5, 과정 4단계, 역할 9, 서비스 10·프로젝트, 문의서)는 그대로 두고
// 화면 구성만 바꿨습니다. 자체 판단으로 더한 문구는 docs/home-story-2026-10-13.md에 표시합니다.
import { portfolio } from '../data/portfolio.mjs';
import { brandWork } from '../data/portfolio-brand-work.mjs';
import { cardImage } from './showcase.mjs';
import { clients, clientGroups } from '../data/clients.mjs';

const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const projects = [...portfolio, ...brandWork];
// 브랜드 의뢰 작업의 연작: WORKS 서비스 미리보기에서 두 장을 나란히 꽉 채워 보여 줍니다.
const series = { 'bugak-branding': ['bugak/01', 'bugak/03'], 'sojukdoo-concept': ['sojukdoo-ads/02', 'sojukdoo-ads/09'], 'eyewear-campaign': ['eyewear/01', 'eyewear/10'], 'w-oil-campaign': ['w-oil/11', 'w-oil/06'] };
const showKey = { 'jonghae-community': 'jonghae', soulreset: 'soulreset', 'ezylens-studio': 'ezylens', 'city-culture': 'city', 'kings-franchise': 'kings', 'sales-rehearsal': 'book', 'tesign-radar': 'radar', 'patient-guide': 'patient', 'review-atelier': 'atelier', 'kfood-dashboard': 'kfood' };
const posterKeys = new Set(['city', 'book', 'patient']);
const tints = ['#59e3c6', '#c9a77a', '#8fb7ff', '#f2b45c', '#c1a3ff', '#7be0b8'];

export function subPages({ services, stages, roles, principles, company, arrow }) {
  const icon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const link = (href, label, cls = 'st-textlink') => `<a class="${cls}" href="${href}">${label}${arrow}</a>`;
  const btn = (href, label, cls = 'st-btn-ink') => `<a class="st-btn ${cls}" href="${href}"><span>${label}</span>${arrow}</a>`;

  // 작업 화면 보드: 화면 캡처는 브라우저 프레임, 포스터·책은 실물 배치
  const board = (slug, i = 0, { caption = true, eager = false } = {}) => {
    const p = projects.find(x => x.slug === slug); if (!p) throw Error('Unknown project ' + slug);
    if (series[slug]) return `<figure class="sb-board is-series"><a class="sb-board-link" href="/works/project/${slug}/" aria-label="${E(p.title)} 프로젝트 보기">${series[slug].map(f => `<img src="/evidence/brand-work/${f}.webp" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`).join('')}</a>${caption ? `<figcaption><small>${E(p.type)}</small><b>${E(p.title)}</b><span>${E(p.summary)}</span></figcaption>` : ''}</figure>`;
    const key = showKey[slug], poster = key ? posterKeys.has(key) : false;
    const src = key ? `/showcase/${key}.webp` : p.coverImage;
    return `<figure class="sb-board${poster ? ' is-poster' : ''}" style="--tint:${tints[i % tints.length]}">
     <a class="sb-board-link" href="/works/project/${slug}/" aria-label="${E(p.title)} 프로젝트 보기"><span class="sb-board-frame">${poster ? '' : '<i class="sb-chrome" aria-hidden="true"></i>'}<img src="${src}" alt="${E(p.title)} 작업 화면" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></span></a>
     ${caption ? `<figcaption><small>${E(p.type)}</small><b>${E(p.title)}</b><span>${E(p.summary)}</span></figcaption>` : ''}
    </figure>`;
  };

  // 공통 히어로: 페이지 번호 · 큰 제목 · 로고 실루엣 창(페이지마다 다른 장면) · 목차
  const hero = ({ label, title, lead, art, index }) => `
<section class="sb-hero">
 <div class="st-shell sb-hero-grid">
  <div class="sb-hero-copy">
   <p class="sb-kicker"><i></i>${label}</p>
   <h1 class="sb-title">${title.map((line, i) => `<span class="st-line"><span>${line}</span></span>`).join('')}</h1>
   <p class="sb-lead">${lead}</p>
  </div>
  <div class="st-mark sb-mark" aria-hidden="true"><span class="st-mark-ring r3"></span><span class="st-mark-ring r2"></span><span class="st-mark-ring r1"></span><div class="st-mark-window">${art}</div></div>
 </div>
 <nav class="st-shell sb-index" aria-label="페이지 목차">${index.map(([id, t], i) => `<a href="#${id}"><small>${pad(i + 1)}</small>${t}</a>`).join('')}</nav>
</section>`;

  const reel = keys => {
    const col = (arr, cls) => `<div class="st-reel ${cls}">${[...arr, ...arr].map(k => `<img src="${cardImage(k, 450)}" alt="" width="450" height="600" decoding="async">`).join('')}</div>`;
    return col(keys.filter((_, i) => i % 2 === 0), 'up') + col(keys.filter((_, i) => i % 2), 'down');
  };
  const head = (eyebrow, h2, aside = '') => `<div class="sb-head"><div><p class="st-eyebrow">${eyebrow}</p><h2 class="st-h2" data-st-words>${h2}</h2></div>${aside ? `<p class="sb-aside">${aside}</p>` : ''}</div>`;
  const ctaBand = (title, body, href, label) => `
<section class="sb-cta st-dark">
 <div class="st-shell sb-cta-grid"><h2 class="st-h2" data-st-words>${title}</h2><div><p>${body}</p>${btn(href, label, 'sb-btn-mint')}</div></div>
</section>`;

  /* ---------------- ABOUT ---------------- */
  const partners = ['강남더블유안과', '리드힐', '리샘', '새빛', '참진한의원', '함소아의원'];
  const about = `<div class="st sb" data-sub="about">
${hero({ label: 'ABOUT US', title: ['사업을 이해하는 기획,', '<em>현장을 아는 실행.</em>'], lead: '브랜드·콘텐츠·광고·PR·웹을 맡는 종합광고대행사입니다.<br>마케팅팀이 없는 회사에는 외부의 마케팅팀이 되고, 있는 회사에는 부족한 손이 됩니다.', art: `<div class="sb-pillars">${[['기획', 'PLAN'], ['제작', 'MAKE'], ['운영', 'RUN']].map(([k, en], i) => `<span style="--i:${i}"><small>${en}</small>${k}</span>`).join('')}<b>한 팀</b></div>`, index: [['about-role', '하는 일'], ['about-health', '의료 분야 배경'], ['about-principles', '일하는 기준'], ['about-company', '회사 정보']] })}
<section id="about-role" class="st-sec st-light">
 <div class="st-shell">
  ${head('WHY WE ARE HERE', '기업의 마케팅을 맡는 <em>외부 팀.</em>', '전담 마케팅팀이 필요한 기업, 제작 역량을 보완하려는 사내 팀과 일합니다. 전략 수립부터 콘텐츠·디자인 제작, 광고와 홍보 운영까지 프로젝트에 필요한 업무를 맡습니다.')}
  <div class="sb-equation st-rv" role="list">
   ${[['기획', ['시장·고객 분석', '브랜드 전략', '핵심 메시지']], ['제작', ['콘텐츠·디자인', '영상', '웹·디지털 개발']], ['운영', ['광고·매체 집행', '언론홍보', '채널 운영·보고']]].map(([w, items], i) => `<div class="sb-eq-term" role="listitem"><b>${w}</b><ul>${items.map(x => `<li>${x}</li>`).join('')}</ul></div>${i < 2 ? '<span class="sb-eq-op" aria-hidden="true">+</span>' : ''}`).join('')}
   <span class="sb-eq-op" aria-hidden="true">=</span>
   <div class="sb-eq-result" role="listitem"><b>한 팀</b><span>전담 창구 하나로 연결</span></div>
  </div>
 </div>
</section>
<section id="about-health" class="st-sec st-paper">
 <div class="st-shell">
  ${head('의료 분야의 전문 배경', '의학 취재와 병원 홍보, <em>현장에서 쌓은 경험.</em>', '의학 취재와 병원 홍보 경력을 바탕으로 병원의 외부 홍보팀 역할을 맡습니다. 진료 분야와 의료진의 전문성, 환자의 질문을 파악해 콘텐츠·언론홍보·채널 운영을 기획합니다.')}
  <ol class="sb-cols">
   ${[['질환 콘텐츠와 공식 채널 운영', '질환·치료 정보를 환자의 질문 순서로 정리하고 홈페이지, 블로그, SNS용 콘텐츠를 제작합니다.'], ['의료진 인터뷰와 영상 기획', '의료진의 설명을 담을 질문지와 영상 구성을 기획합니다. 환자가 궁금해하는 내용을 중심으로 편집합니다.'], ['언론홍보와 광고 운영', '보도자료, 미디어 대응과 의학전문 기자간담회를 기획합니다. 온라인·지역 광고를 운영하고 진행 내용과 결과를 보고합니다.']].map(([t, b], i) => `<li class="st-rv" style="--d:${i * 90}ms"><small>${pad(i + 1)}</small><h3>${t}</h3><p>${b}</p></li>`).join('')}
  </ol>
  <div class="sb-partners"><p><b>의료 분야 파트너</b><span>기존 홈페이지에 소개된 파트너</span></p><ul>${partners.map(x => `<li>${x}</li>`).join('')}</ul>${link('/works/#hospital', '의료 분야 업무 보기')}</div>
 </div>
</section>
<section id="about-principles" class="st-sec st-paper">
 <div class="st-shell">
  ${head('WHAT WE BELIEVE', '일하는 기준 <em>다섯 가지.</em>')}
  <ol class="sb-rows">${principles.map(([t, , b], i) => `<li class="st-rv"><small>${pad(i + 1)}</small><h3>${t}</h3><p>${b}</p></li>`).join('')}</ol>
 </div>
</section>
<section id="about-company" class="st-sec st-light">
 <div class="st-shell sb-company">
  <div><p class="st-eyebrow">COMPANY</p><h2 class="st-h2" data-st-words>회사 <em>정보.</em></h2></div>
  <dl class="sb-facts">${[['회사', company.legalName], ['대표', company.representative], ['위치', company.address], ['연락', `<a href="mailto:${company.email}">${company.email}</a><br><a href="tel:${company.phone.replace(/-/g, '')}">${company.phone}</a>`], ['상담', company.hours]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
 </div>
</section>
${ctaBand('회사 소개서가 <em>필요하신가요?</em>', '서비스 범위와 진행 방식을 정리한 자료를 보내 드립니다. 맡길 일이 정해졌다면 바로 상담도 가능합니다.', '/contact/?service=other', '소개 자료 요청')}
</div>`;

  /* ---------------- PROCESS ---------------- */
  const checks = [
    [['사업 목표와 우선순위', '현재 채널과 보유 자료', '경쟁 브랜드와 고객'], ['착수 미팅', '자료 공유', '현황 조사']],
    [['핵심 고객과 메시지', '예산 범위', '확인할 지표'], ['콘셉트 검토 회의', '채널·일정 확정', '제작 범위 합의']],
    [['시안 검토 일정', '수정 범위와 승인 담당', '집행 승인'], ['시안 검토', '수정 반영', '광고·채널 집행']],
    [['확인 지표와 보고 주기', '다음 단계의 목표'], ['결과 리뷰', '개선안 논의', '자료·권한 인계']]
  ];
  // 단계마다 아이콘과 산출물 무드보드(실제 작업 이미지 + 미니 차트). 목록 내용은 아래 열에만 둡니다.
  const stageLook = [
    { ic: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3L21 21M8 13v-2M10.5 13V8.5M13 13v-3.5"/>', main: 'analysis', extra: `<span class="sb-mood-bars">${[58, 86, 40, 72].map((h, k) => `<i style="--h:${h}%;--k:${k}"></i>`).join('')}</span>` },
    { ic: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>', main: 'strategy', side: 'strategy-b', tall: true },
    { ic: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 7l3 3"/>', main: 'make', side: 'make-b' },
    { ic: '<path d="M4 4v16h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>', main: 'report', extra: `<span class="sb-mood-line"><svg viewBox="0 0 120 50"><path d="M4 42L28 30L50 34L74 18L96 22L116 6" pathLength="1"/></svg></span>` }
  ];
  const colIcons = ['<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8l1.5 1.5L12 7M8 14l1.5 1.5L12 13M14.5 8.5H17M14.5 14.5H17"/>', '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2M15 14.8c2.6-.2 4.6 1.3 5.2 4.2"/>', '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>'];
  const shareIcons = ['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>', '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>', '<path d="M4 8h13l-3-3M20 16H7l3 3"/>'];
  const mood = (l, i) => `<figure class="sb-mood st-rv${l.tall ? ' is-tall' : ''}" style="--tint:${tints[i % tints.length]}" aria-hidden="true"><img class="sb-mood-main" src="/showcase/process/${l.main}.webp" alt="" loading="lazy" decoding="async">${l.side ? `<img class="sb-mood-side" src="/showcase/process/${l.side}.webp" alt="" loading="lazy" decoding="async">` : ''}${l.extra || ''}</figure>`;
  const process = `<div class="st sb" data-sub="process">
${hero({ label: 'OUR PROCESS', title: ['시작부터 납품까지,', '<em>분명한 과정.</em>'], lead: '네 단계마다 무엇을 확인하고, 함께 무엇을 하고, 무엇을 전달하는지 미리 정합니다.<br>모든 단계는 한 명의 담당자가 연결합니다.', art: `<div class="sb-dial"><svg viewBox="0 0 400 400"><circle class="base" cx="200" cy="200" r="140"/><circle class="arc" cx="200" cy="200" r="140" pathLength="100"/></svg>${stages.map((s, i) => `<span class="sb-dial-node" style="--a:${i * 90}deg;--i:${i}"><small>${pad(i + 1)}</small>${E(s.label)}</span>`).join('')}<div class="sb-dial-core"><b>4</b><span>단계 · 1 담당자</span></div></div>`, index: [['process-steps', '네 단계'], ['process-share', '공유하는 것'], ['process-start', '시작하기']] })}
<section id="process-steps" class="st-sec st-light">
 <div class="st-shell sb-steps">
  <aside class="sb-steps-rail" aria-hidden="true"><div class="sb-rail-sticky"><span class="sb-rail-ic">${stageLook.map((l, i) => `<i class="${i ? '' : 'on'}">${icon(l.ic)}</i>`).join('')}</span><b data-sb-step>01</b><span data-sb-step-label>${E(stages[0].label)}</span><i class="sb-rail-bar"><s></s></i><ol>${stages.map((s, i) => `<li class="${i ? '' : 'on'}">${E(s.label)}</li>`).join('')}</ol></div></aside>
  <div class="sb-steps-list">
   ${stages.map((s, i) => `<article class="sb-step" data-sb-step-i="${i}" data-label="${E(s.label)}">
    <div class="sb-step-top">
     <div>
      <div class="sb-step-head"><span class="sb-step-ic">${icon(stageLook[i].ic)}</span><p class="st-eyebrow">${pad(i + 1)} · ${E(s.label)}</p></div>
      <h2 class="sb-step-title">${E(s.title)}</h2>
      <p class="sb-step-body">${E(s.body)}</p>
     </div>
     ${mood(stageLook[i], i)}
    </div>
    <div class="sb-step-cols">
     <div><h3>${icon(colIcons[0])}확인할 내용</h3><ul>${checks[i][0].map(x => `<li>${x}</li>`).join('')}</ul></div>
     <div><h3>${icon(colIcons[1])}함께 하는 일</h3><ul>${checks[i][1].map(x => `<li>${x}</li>`).join('')}</ul></div>
     <div class="sb-out"><h3>${icon(colIcons[2])}전달하는 결과</h3><ul>${s.outputs.map(x => `<li>${E(x)}</li>`).join('')}</ul></div>
    </div>
   </article>`).join('')}
  </div>
 </div>
</section>
<section id="process-share" class="st-sec st-paper">
 <div class="st-shell">
  ${head('목표는 분명하게. 진행은 투명하게.', '진행하는 동안 <em>공유하는 것.</em>', '목표와 예산에 맞춰 기획하고, 진행과 결과를 함께 확인합니다.')}
  <ol class="sb-rows has-ic">${[['진행 상황', '일정과 진행 단계, 다음에 확인할 일을 담당자에게 정기적으로 공유합니다.'], ['수정 요청', '요청 내용과 반영 여부를 기록으로 남겨 같은 수정이 반복되지 않게 합니다.'], ['집행 내역', '광고·매체 집행은 금액과 기간, 결과를 함께 보고합니다.'], ['변경 사항', '추가 요청은 비용·일정·작업 범위를 먼저 확인하고 합의한 뒤 반영합니다.']].map(([t, b], i) => `<li class="st-rv"><small><span class="sb-row-ic">${icon(shareIcons[i])}</span>${pad(i + 1)}</small><h3>${t}</h3><p>${b}</p></li>`).join('')}</ol>
 </div>
</section>
<div id="process-start">${ctaBand('목표 · 예산 · 일정부터 <em>함께 정합니다.</em>', '아직 범위가 정해지지 않았어도 괜찮습니다. 목적과 준비된 자료를 보내 주시면 첫 단계부터 함께 정리합니다.', '/contact/', '프로젝트 상담')}</div>
</div>`;

  /* ---------------- TEAM ---------------- */
  // 역할 카드: 라인 아이콘 + 대표 산출물 썸네일(없으면 아이콘 타일). 산출물 목록은 WORKS 업무별 안내에 있으므로 반복하지 않고 연결만 합니다.
  const roleLook = [
    ['strategy', 'bugak', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 12l7-7M15.5 4.5H19v3.5"/>'],
    ['digital', '', '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 13l3-3 3 2 4-5M8 21h8M12 17v4"/>'],
    ['content', 'book', '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'],
    ['content', 'coffee', '<path d="M12 3l6 8.5L12 21l-6-9.5z"/><circle cx="12" cy="12" r="1.8"/><path d="M12 3v7.2"/>'],
    ['video', '', '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.2v5.6l4.8-2.8z"/>'],
    ['media', 'woil', '<rect x="3" y="4" width="18" height="11" rx="1.5"/><path d="M8 15v5M16 15v5M6 20h12M7 9.5h7"/>'],
    ['influencer', '', '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20c.8-3.6 3.4-5.5 6.5-5.5 1.3 0 2.5.3 3.5.9"/><path d="M18 13l1.1 2.3 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z"/>'],
    ['it', 'jonghae', '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M9.5 8.3L7 10.8l2.5 2.5M14.5 8.3l2.5 2.5-2.5 2.5M8 21h8M12 17v4"/>'],
    ['pr', '', '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 12.5h7M7 16h4"/>']
  ];
  const roleKeys = ['전략', '디지털', '콘텐츠', '디자인', '영상', '미디어', '인플루언서', 'IT', '언론홍보'];
  const matrix = [
    ['브랜드 런칭', [2, 1, 1, 2, 1, 0, 1, 0, 1]],
    ['병원 개원 홍보', [2, 2, 2, 1, 1, 1, 0, 1, 2]],
    ['홈페이지 리뉴얼', [1, 1, 1, 2, 0, 0, 0, 2, 0]],
    ['시즌 캠페인', [1, 2, 1, 1, 2, 2, 2, 0, 1]]
  ];
  const team = `<div class="st sb" data-sub="team">
${hero({ label: 'TEAM', title: ['한 프로젝트,', '<em>아홉 가지 전문성.</em>'], lead: '프로젝트의 목적에 맞춰 필요한 역할을 연결합니다.<br>아홉 명이나 아홉 개 부서가 아니라, 아홉 가지 수행 역할입니다.', art: `<div class="sb-orbit">${roles.map(([ko], i) => `<span style="--a:${i * 40}deg;--i:${i}">${E(ko)}</span>`).join('')}<div class="sb-orbit-core"><b>1</b><span>전담 창구</span></div></div>`, index: [['team-roles', '아홉 가지 역할'], ['team-matrix', '프로젝트별 구성']] })}
<section id="team-roles" class="st-sec st-light">
 <div class="st-shell">
  ${head('THE PEOPLE BEHIND THE WORK', '역할마다 <em>맡는 일.</em>', '프로젝트에 따라 담당 역할과 협업 범위를 정합니다. 역할을 누르면 해당 업무의 제공 내용으로 이어집니다.')}
  <ol class="sb-role-grid">${roles.map(([ko, en, body], i) => { const [id, thumb, ic] = roleLook[i]; return `<li class="sb-role st-rv" style="--d:${(i % 3) * 80}ms;--tint:${tints[i % tints.length]}">
   <a href="/works/#${id}">
    <span class="sb-role-media${thumb ? '' : ' is-icon'}" aria-hidden="true">${thumb ? `<img src="${cardImage(thumb, 450)}" alt="" loading="lazy" decoding="async">` : icon(ic)}</span>
    <span class="sb-role-head"><span class="sb-role-ic">${icon(ic)}</span><small>${pad(i + 1)}</small><em>${E(en)}</em></span>
    <b>${E(ko)}</b>
    <span class="sb-role-txt">${E(body)}</span>
   </a>
  </li>`; }).join('')}</ol>
 </div>
</section>
<section id="team-matrix" class="st-sec st-paper">
 <div class="st-shell">
  ${head('TEAM BY PROJECT', '프로젝트마다 <em>다른 구성.</em>', '같은 회사라도 일의 목적에 따라 움직이는 역할이 다릅니다. 아래는 구성 예시이며, 착수 전에 실제 범위로 정합니다.')}
  <div class="sb-matrix-wrap st-rv"><table class="sb-matrix">
   <caption class="st-sr">프로젝트 유형별 역할 구성 예시 (●주도, ○참여)</caption>
   <thead><tr><td></td>${roleKeys.map(k => `<th scope="col">${k}</th>`).join('')}</tr></thead>
   <tbody>${matrix.map(([name, row]) => `<tr><th scope="row">${name}</th>${row.map((v, i) => `<td data-label="${roleKeys[i]}"><span class="dot d${v}" aria-label="${['해당 없음', '참여', '주도'][v]}"></span></td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>
  <p class="sb-legend"><span class="dot d2"></span>주도 <span class="dot d1"></span>참여 · 구성 예시</p>
 </div>
</section>
${ctaBand('프로젝트 전체부터 <em>개별 업무까지.</em>', '원고 편집, 콘텐츠 제작, 웹 개발 등 기존 팀에 필요한 업무만 맡길 수 있습니다. 착수 전에 산출물과 검토 시점을 협의합니다.', '/contact/', '업무 문의')}
</div>`;

  /* ---------------- WORKS (서비스 10 + 프로젝트 목록) ---------------- */
  const related = { strategy: 'bugak-branding', digital: 'sojukdoo-concept', content: 'eyewear-campaign', media: 'w-oil-campaign', hospital: 'patient-guide', consulting: 'kfood-dashboard', it: 'jonghae-community' };
  const preview = (s, i) => related[s.id] ? board(related[s.id], i, { caption: false }) : `<div class="sb-board sb-board-empty" style="--tint:${tints[i % tints.length]}"><b>${E(s.ko)}</b><span>관련 사례를 준비하고 있습니다.<br>범위와 방식은 상담으로 먼저 안내해 드립니다.</span></div>`;
  const detail = (s, i, hidden = i > 0) => `<div class="sb-svc-detail" data-for="${s.id}"${hidden ? ' hidden' : ''}>
    ${preview(s, i)}
    <div class="sb-svc-text"><small>${pad(i + 1)} · ${E(s.en)}</small><h3>${E(s.ko)}</h3><p>${E(s.summary)}</p><ul>${s.items.map(x => `<li>${E(x)}</li>`).join('')}</ul>
     <div class="sb-svc-act">${related[s.id] ? link(`/works/project/${related[s.id]}/`, '관련 작업 보기') : ''}${link(`/contact/?service=${s.id}`, '이 업무 상담')}</div></div>
   </div>`;
  const worksTop = `<div class="st sb" data-sub="works">
${hero({ label: 'WORKS', title: ['마케팅의 전 과정,', '<em>필요한 업무부터.</em>'], lead: '브랜드 기획부터 콘텐츠, 광고 운영, 웹 개발까지.<br>업무별 제공 내용과 실제 제작물을 확인하세요.', art: reel(['eyewear', 'jonghae', 'coffee', 'woil', 'soulreset', 'bugak', 'kings', 'microplastic']), index: [['services', `제공 서비스 ${services.length}`], ['projects', '프로젝트'], ['clients', `고객사 ${clients.length}`]] })}
<section id="services" class="st-sec st-light" data-capabilities-index>
 <div class="st-shell">
  ${head('OUR CAPABILITIES', `열 가지 업무, <em>한 팀의 연결.</em>`, '업무에 마우스를 올리거나 눌러 보세요. 제공 내용과 관련 작업, 상담으로 이어집니다.')}
  <div class="sb-services">
   <ol class="sb-svc-list">${services.map((s, i) => `<li id="svc-${s.id}"><button type="button" class="sb-svc" data-id="${s.id}" aria-pressed="${i === 0}" aria-controls="sb-svc-panel"><small>${pad(i + 1)}</small><b>${E(s.ko)}</b><i aria-hidden="true"></i></button><div class="sb-svc-inline">${detail(s, i, false)}</div></li>`).join('')}</ol>
   <div class="sb-svc-panel" id="sb-svc-panel" aria-live="polite"><div class="sb-svc-sticky">${services.map((s, i) => detail(s, i)).join('')}</div></div>
  </div>
 </div>
</section>
</div>`;

  // 고객사(WORKS): 홈의 흐르는 띠와 달리 분야별로 멈춰 있는 로고 표. 로고 아래에 이름을 둡니다.
  // 프로젝트 목록(기존 마크업) 뒤에 붙으므로 토큰을 쓰도록 .st로 감쌉니다. data-sub가 없어 등장 효과 없이 바로 보입니다.
  const worksClients = `<div class="st sb"><section id="clients" class="st-sec st-paper sb-clients">
 <div class="st-shell">
  ${head('CLIENTS', `함께한 고객사 <em>${clients.length}곳.</em>`, '병원·제약부터 제조 기업, 교육기관과 언론사까지 함께 일했습니다.')}
  ${clientGroups.map(([id, label]) => { const list = clients.filter(c => c.group === id); return `<div class="sb-client-group st-rv">
   <h3><b>${label}</b><small>${list.length}</small></h3>
   <ul class="sb-client-grid">${list.map(c => `<li>${c.src ? `<span class="sb-client-logo"><img src="${c.src}" alt="${E(c.name)} 로고" loading="lazy" decoding="async"></span><span class="sb-client-name">${E(c.name)}</span>` : `<span class="sb-client-logo is-name"><b>${E(c.name)}</b></span>`}</li>`).join('')}</ul>
  </div>`; }).join('')}
 </div>
</section></div>`;

  /* ---------------- CONTACT ---------------- */
  const chat = `<div class="sb-chat"><p class="me">홈페이지 리뉴얼과 SNS 운영을 같이 맡길 수 있을까요?</p><p class="us">가능합니다. 현재 채널과 자료부터 함께 보겠습니다.</p><p class="us">편한 상담 시간을 알려 주세요.</p><small>대화 예시</small></div>`;
  const contact = contactForm => `<div class="st sb" data-sub="contact">
${hero({ label: 'CONTACT', title: ['필요한 일을', '<em>말씀해 주세요.</em>'], lead: '회사 소개와 필요한 업무를 남겨 주세요. 범위가 정해지지 않았어도 괜찮습니다.<br>준비된 자료가 있다면 함께 첨부해 주세요.', art: chat, index: [['contact-form', '문의서'], ['contact-brief', '준비 자료'], ['contact-faq', '자주 묻는 질문']] })}
<section id="contact-form" class="st-sec st-light">
 <div class="st-shell sb-contact">
  <aside class="sb-contact-aside">
   <p class="st-eyebrow">LET’S TALK</p>
   <a class="sb-channel" href="mailto:${company.email}"><small>이메일</small>${company.email}</a>
   <a class="sb-channel" href="tel:${company.phone.replace(/-/g, '')}"><small>전화</small>${company.phone}</a>
   <p class="sb-hours">${company.hours}<br>${company.address}</p>
   <ol class="sb-flow">${['문의 접수', '담당자 회신·상담', '제안서·견적', '착수'].map((s, i) => `<li><small>${pad(i + 1)}</small>${s}</li>`).join('')}</ol>
  </aside>
  <div class="sb-form">${contactForm}</div>
 </div>
</section>
<section id="contact-brief" class="st-sec st-paper">
 <div class="st-shell">
  ${head('A USEFUL FIRST BRIEF', '의뢰 준비 <em>자료.</em>', '아래 항목 중 준비된 내용만 보내 주세요.')}
  <ol class="sb-rows">${[['해결할 일', '현재의 문제, 작업 목적과 우선순위.'], ['주요 고객', '대상 고객, 이용 상황과 자주 받는 질문.'], ['현재 자료', '사이트·채널 주소, 소개서, 원고, 이미지와 디자인 자료.'], ['일정·예산', '희망 완료일, 예산 범위와 검토 담당자.']].map(([t, b], i) => `<li class="st-rv"><small>${pad(i + 1)}</small><h3>${t}</h3><p>${b}</p></li>`).join('')}</ol>
 </div>
</section>
<section id="contact-faq" class="st-sec st-light">
 <div class="st-shell sb-faq-grid">
  <div><p class="st-eyebrow">BEFORE WE BEGIN</p><h2 class="st-h2" data-st-words>자주 묻는 <em>질문.</em></h2></div>
  <div class="sb-faq">${[['예산이나 제작 범위가 미정이어도 문의할 수 있나요?', '가능합니다. 목적과 우선순위, 준비된 자료를 보내주세요. 필요한 산출물과 작업 순서를 검토한 뒤 일정·예산에 맞는 범위를 협의합니다.'], ['기존 팀이나 다른 제작사와 협업할 수 있나요?', '가능합니다. 각 팀의 업무, 자료 공유 방식, 검토 담당자와 수정·전달 범위를 협의합니다.'], ['완료 후 어떤 자료를 받나요?', '최종 파일, 편집 원본, 사용 권한, 관리 권한과 안내 문서 중 필요한 항목을 착수 전에 협의합니다. 제공 범위는 업무에 따라 다릅니다.'], ['일부 업무만 맡길 수 있나요?', '원고 편집, 특정 페이지 제작, 콘텐츠 구성 등 필요한 업무부터 맡길 수 있습니다. 사용할 곳과 최종 산출물을 먼저 확인합니다.']].map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${q}<i aria-hidden="true"></i></summary><p>${a}</p></details>`).join('')}</div>
 </div>
</section>
</div>`;

  return { about, process, team, worksTop, worksClients, contact };
}
