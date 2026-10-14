// 국문 하위 페이지(ABOUT · PROCESS · TEAM · WORKS · CONTACT). 홈 스토리와 같은 디자인 언어를 씁니다.
// 고객 요구 콘텐츠(회사 소개·업무 기준 5, 과정 4단계, 역할 9, 서비스 10·프로젝트, 문의서)는 그대로 두고
// 화면 구성만 바꿨습니다. 자체 판단으로 더한 문구는 docs/home-story-2026-10-13.md에 표시합니다.
import { portfolio } from '../data/portfolio.mjs';
import { showcaseItems } from './showcase.mjs';

const E = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const showKey = { 'jonghae-community': 'jonghae', soulreset: 'soulreset', 'ezylens-studio': 'ezylens', 'city-culture': 'city', 'kings-franchise': 'kings', 'sales-rehearsal': 'book', 'tesign-radar': 'radar', 'patient-guide': 'patient', 'review-atelier': 'atelier', 'kfood-dashboard': 'kfood' };
const posterKeys = new Set(['city', 'book', 'patient']);
const tints = ['#59e3c6', '#c9a77a', '#8fb7ff', '#f2b45c', '#c1a3ff', '#7be0b8'];

export function subPages({ services, stages, roles, principles, company, arrow }) {
  const link = (href, label, cls = 'st-textlink') => `<a class="${cls}" href="${href}">${label}${arrow}</a>`;
  const btn = (href, label, cls = 'st-btn-ink') => `<a class="st-btn ${cls}" href="${href}"><span>${label}</span>${arrow}</a>`;

  // 작업 화면 보드: 화면 캡처는 브라우저 프레임, 포스터·책은 실물 배치
  const board = (slug, i = 0, { caption = true, eager = false } = {}) => {
    const p = portfolio.find(x => x.slug === slug); if (!p) throw Error('Unknown project ' + slug);
    const key = showKey[slug], poster = key ? posterKeys.has(key) : false;
    const src = key ? `/showcase/${key}.webp` : p.coverImage;
    return `<figure class="sb-board${poster ? ' is-poster' : ''}" style="--tint:${tints[i % tints.length]}">
     <a class="sb-board-link" href="/works/project/${slug}/" aria-label="${E(p.title)} 프로젝트 보기"><span class="sb-board-frame">${poster ? '' : '<i class="sb-chrome" aria-hidden="true"></i>'}<img src="${src}" alt="${E(p.title)} 작업 화면" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></span></a>
     ${caption ? `<figcaption><small>${E(p.type)}</small><b>${E(p.title)}</b><span>${E(p.summary)}</span></figcaption>` : ''}
    </figure>`;
  };

  // 공통 히어로: 페이지 번호 · 큰 제목 · 로고 실루엣 창(페이지마다 다른 장면) · 목차
  const hero = ({ n, label, title, lead, art, index }) => `
<section class="sb-hero">
 <div class="st-shell sb-hero-grid">
  <div class="sb-hero-copy">
   <p class="sb-kicker"><b>${pad(n)}</b><i></i>${label}</p>
   <h1 class="sb-title">${title.map((line, i) => `<span class="st-line"><span>${line}</span></span>`).join('')}</h1>
   <p class="sb-lead">${lead}</p>
  </div>
  <div class="st-mark sb-mark" aria-hidden="true"><span class="st-mark-ring r3"></span><span class="st-mark-ring r2"></span><span class="st-mark-ring r1"></span><div class="st-mark-window">${art}</div></div>
 </div>
 <nav class="st-shell sb-index" aria-label="페이지 목차">${index.map(([id, t], i) => `<a href="#${id}"><small>${pad(i + 1)}</small>${t}</a>`).join('')}</nav>
</section>`;

  const reel = list => {
    const items = list.map(k => showcaseItems.find(s => s.img === k)).filter(Boolean);
    const col = (arr, cls) => `<div class="st-reel ${cls}">${[...arr, ...arr].map(it => `<img src="/showcase/${it.img}-600.webp" alt="" width="600" height="375" decoding="async">`).join('')}</div>`;
    return col(items.slice(0, 3), 'up') + col(items.slice(2), 'down');
  };
  const head = (eyebrow, h2, aside = '') => `<div class="sb-head"><div><p class="st-eyebrow">${eyebrow}</p><h2 class="st-h2" data-st-words>${h2}</h2></div>${aside ? `<p class="sb-aside">${aside}</p>` : ''}</div>`;
  const ctaBand = (title, body, href, label) => `
<section class="sb-cta st-dark">
 <div class="st-shell sb-cta-grid"><h2 class="st-h2" data-st-words>${title}</h2><div><p>${body}</p>${btn(href, label, 'sb-btn-mint')}</div></div>
</section>`;

  /* ---------------- ABOUT ---------------- */
  const partners = ['강남더블유안과', '리드힐', '리샘', '새빛', '참진한의원', '함소아의원'];
  const about = `<div class="st sb" data-sub="about">
${hero({ n: 1, label: 'ABOUT US', title: ['사업을 이해하는 기획,', '<em>현장을 아는 실행.</em>'], lead: '브랜드·콘텐츠·광고·PR·웹을 맡는 종합광고대행사입니다.<br>마케팅팀이 없는 회사에는 외부의 마케팅팀이 되고, 있는 회사에는 부족한 손이 됩니다.', art: reel(['jonghae', 'soulreset', 'kings', 'radar', 'ezylens']), index: [['about-role', '하는 일'], ['about-health', '의료 분야 배경'], ['about-work', '제작 사례'], ['about-principles', '일하는 기준'], ['about-company', '회사 정보']] })}
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
<section id="about-work" class="st-sec st-light">
 <div class="st-shell">
  ${head('제작 사례', '기관과 서비스의 <em>웹사이트 제작.</em>', '기관 소개와 자료 공개, 여행 정보와 상담. 방문 목적에 맞춰 정보 구조와 화면을 제작한 두 사례입니다.')}
  <div class="sb-boards two">${board('jonghae-community', 0)}${board('soulreset', 1)}</div>
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
  <div><p class="st-eyebrow">OUR DIRECTION</p><h2 class="st-h2" data-st-words>기업의 마케팅을 <em>기획하고 실행합니다.</em></h2><p class="sb-aside">마케팅팀이 없어도 마케팅이 멈추지 않도록, 처음 상담부터 운영과 보고까지 같은 팀이 맡습니다.</p></div>
  <dl class="sb-facts">${[['회사', company.legalName], ['대표', company.representative], ['위치', company.address], ['연락', `<a href="mailto:${company.email}">${company.email}</a><br><a href="tel:${company.phone.replace(/-/g, '')}">${company.phone}</a>`], ['상담', company.hours]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
 </div>
</section>
${ctaBand('어디서부터 맡길지, <em>함께 정합니다.</em>', '필요한 업무와 일정, 준비된 자료를 알려 주세요. 담당자가 범위를 함께 정리합니다.', '/contact/', '프로젝트 상담')}
</div>`;

  /* ---------------- PROCESS ---------------- */
  const checks = [
    [['사업 목표와 우선순위', '현재 채널과 보유 자료', '경쟁 브랜드와 고객'], ['착수 미팅', '자료 공유', '현황 조사']],
    [['핵심 고객과 메시지', '예산 범위', '확인할 지표'], ['콘셉트 검토 회의', '채널·일정 확정', '제작 범위 합의']],
    [['시안 검토 일정', '수정 범위와 승인 담당', '집행 승인'], ['시안 검토', '수정 반영', '광고·채널 집행']],
    [['확인 지표와 보고 주기', '다음 단계의 목표'], ['결과 리뷰', '개선안 논의', '자료·권한 인계']]
  ];
  const process = `<div class="st sb" data-sub="process">
${hero({ n: 2, label: 'OUR PROCESS', title: ['시작부터 납품까지,', '<em>분명한 과정.</em>'], lead: '네 단계마다 무엇을 확인하고, 함께 무엇을 하고, 무엇을 전달하는지 미리 정합니다.<br>모든 단계는 한 명의 담당자가 연결합니다.', art: `<div class="sb-dial"><svg viewBox="0 0 400 400"><circle class="base" cx="200" cy="200" r="140"/><circle class="arc" cx="200" cy="200" r="140" pathLength="100"/></svg>${stages.map((s, i) => `<span class="sb-dial-node" style="--a:${i * 90}deg;--i:${i}"><small>${pad(i + 1)}</small>${E(s.label)}</span>`).join('')}<div class="sb-dial-core"><b>4</b><span>단계 · 1 담당자</span></div></div>`, index: [['process-steps', '네 단계'], ['process-share', '공유하는 것'], ['process-start', '시작하기']] })}
<section id="process-steps" class="st-sec st-light">
 <div class="st-shell sb-steps">
  <aside class="sb-steps-rail" aria-hidden="true"><div class="sb-rail-sticky"><b data-sb-step>01</b><span data-sb-step-label>${E(stages[0].label)}</span><i class="sb-rail-bar"><s></s></i><ol>${stages.map((s, i) => `<li class="${i ? '' : 'on'}">${E(s.label)}</li>`).join('')}</ol></div></aside>
  <div class="sb-steps-list">
   ${stages.map((s, i) => `<article class="sb-step" data-sb-step-i="${i}" data-label="${E(s.label)}">
    <p class="st-eyebrow">${pad(i + 1)} · ${E(s.label)}</p>
    <h2 class="sb-step-title">${E(s.title)}</h2>
    <p class="sb-step-body">${E(s.body)}</p>
    <div class="sb-step-cols">
     <div><h3>확인할 내용</h3><ul>${checks[i][0].map(x => `<li>${x}</li>`).join('')}</ul></div>
     <div><h3>함께 하는 일</h3><ul>${checks[i][1].map(x => `<li>${x}</li>`).join('')}</ul></div>
     <div class="sb-out"><h3>전달하는 결과</h3><ul>${s.outputs.map(x => `<li>${E(x)}</li>`).join('')}</ul></div>
    </div>
   </article>`).join('')}
  </div>
 </div>
</section>
<section id="process-share" class="st-sec st-paper">
 <div class="st-shell">
  ${head('목표는 분명하게. 진행은 투명하게.', '진행하는 동안 <em>공유하는 것.</em>', '목표와 예산에 맞춰 기획하고, 진행과 결과를 함께 확인합니다. 목표·예산·일정부터 함께 정합니다.')}
  <ol class="sb-rows">${[['진행 상황', '일정과 진행 단계, 다음에 확인할 일을 담당자에게 정기적으로 공유합니다.'], ['수정 요청', '요청 내용과 반영 여부를 기록으로 남겨 같은 수정이 반복되지 않게 합니다.'], ['집행 내역', '광고·매체 집행은 금액과 기간, 결과를 함께 보고합니다.'], ['변경 사항', '추가 요청은 비용·일정·작업 범위를 먼저 확인하고 합의한 뒤 반영합니다.']].map(([t, b], i) => `<li class="st-rv"><small>${pad(i + 1)}</small><h3>${t}</h3><p>${b}</p></li>`).join('')}</ol>
 </div>
</section>
<div id="process-start">${ctaBand('목표 · 예산 · 일정부터 <em>함께 정합니다.</em>', '아직 범위가 정해지지 않았어도 괜찮습니다. 목적과 준비된 자료를 보내 주시면 첫 단계부터 함께 정리합니다.', '/contact/', '프로젝트 상담')}</div>
</div>`;

  /* ---------------- TEAM ---------------- */
  const roleItems = [services[0].items, services[1].items, services[2].items, ['웹·배너·브랜드 그래픽', '카탈로그·인쇄 홍보물', '패키지·사인 디자인'], services[3].items, services[4].items, services[5].items, services[8].items, services[9].items];
  const roleKeys = ['전략', '디지털', '콘텐츠', '디자인', '영상', '미디어', '인플루언서', 'IT', '언론홍보'];
  const matrix = [
    ['브랜드 런칭', [2, 1, 1, 2, 1, 0, 1, 0, 1]],
    ['병원 개원 홍보', [2, 2, 2, 1, 1, 1, 0, 1, 2]],
    ['홈페이지 리뉴얼', [1, 1, 1, 2, 0, 0, 0, 2, 0]],
    ['시즌 캠페인', [1, 2, 1, 1, 2, 2, 2, 0, 1]]
  ];
  const team = `<div class="st sb" data-sub="team">
${hero({ n: 3, label: 'TEAM', title: ['한 프로젝트,', '<em>아홉 가지 전문성.</em>'], lead: '프로젝트의 목적에 맞춰 필요한 역할을 연결합니다.<br>아홉 명이나 아홉 개 부서가 아니라, 아홉 가지 수행 역할입니다.', art: `<div class="sb-orbit">${roles.map(([ko], i) => `<span style="--a:${i * 40}deg;--i:${i}">${E(ko)}</span>`).join('')}<div class="sb-orbit-core"><b>1</b><span>전담 창구</span></div></div>`, index: [['team-roles', '아홉 가지 역할'], ['team-matrix', '프로젝트별 구성'], ['team-work', '제작물']] })}
<section id="team-roles" class="st-sec st-light">
 <div class="st-shell">
  ${head('THE PEOPLE BEHIND THE WORK', '역할마다 <em>맡는 일.</em>', '역할을 열면 주요 산출물을 볼 수 있습니다. 프로젝트에 따라 담당 역할과 협업 범위를 정합니다.')}
  <div class="sb-roles">${roles.map(([ko, en, body], i) => `<details class="role-item sb-role"${i ? '' : ' open'}>
   <summary><small>${pad(i + 1)}</small><b>${E(ko)}</b><span>${E(body)}</span><i aria-hidden="true"></i></summary>
   <div class="sb-role-body"><h3>주요 산출물</h3><ul>${roleItems[i].map(x => `<li>${E(x)}</li>`).join('')}</ul><em>${E(en)}</em></div>
  </details>`).join('')}</div>
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
<section id="team-work" class="st-sec st-light">
 <div class="st-shell">
  ${head('EXPERTISE IN PRACTICE', '저술·편집과 <em>브랜드 웹 제작.</em>', '원고 구성부터 지면 편집까지, 브랜드 소개부터 가맹 상담 화면까지 제작했습니다.')}
  <div class="sb-boards two">${board('sales-rehearsal', 3)}${board('kings-franchise', 4)}</div>
 </div>
</section>
${ctaBand('프로젝트 전체부터 <em>개별 업무까지.</em>', '원고 편집, 콘텐츠 제작, 웹 개발 등 기존 팀에 필요한 업무만 맡길 수 있습니다. 착수 전에 산출물과 검토 시점을 협의합니다.', '/contact/', '업무 문의')}
</div>`;

  /* ---------------- WORKS (서비스 10 + 프로젝트 목록) ---------------- */
  const related = { strategy: 'sojukdoo-concept', digital: 'jonghae-community', content: 'sales-rehearsal', media: 'city-culture', hospital: 'patient-guide', consulting: 'kfood-dashboard', it: 'ezylens-studio' };
  const preview = (s, i) => related[s.id] ? board(related[s.id], i, { caption: false }) : `<div class="sb-board sb-board-empty" style="--tint:${tints[i % tints.length]}"><b>${E(s.ko)}</b><span>관련 사례를 준비하고 있습니다.<br>범위와 방식은 상담으로 먼저 안내해 드립니다.</span></div>`;
  const detail = (s, i, hidden = i > 0) => `<div class="sb-svc-detail" data-for="${s.id}"${hidden ? ' hidden' : ''}>
    ${preview(s, i)}
    <div class="sb-svc-text"><small>${pad(i + 1)} · ${E(s.en)}</small><h3>${E(s.ko)}</h3><p>${E(s.summary)}</p><ul>${s.items.map(x => `<li>${E(x)}</li>`).join('')}</ul>
     <div class="sb-svc-act">${related[s.id] ? link(`/works/project/${related[s.id]}/`, '관련 작업 보기') : ''}${link(`/contact/?service=${s.id}`, '이 업무 상담')}</div></div>
   </div>`;
  const worksTop = `<div class="st sb" data-sub="works">
${hero({ n: 4, label: 'WORKS', title: ['마케팅의 전 과정,', '<em>필요한 업무부터.</em>'], lead: '브랜드 기획부터 콘텐츠, 광고 운영, 웹 개발까지.<br>업무별 제공 내용과 실제 제작물을 확인하세요.', art: reel(['ezylens', 'kfood', 'atelier', 'jonghae', 'radar']), index: [['services', `제공 서비스 ${services.length}`], ['projects', '프로젝트']] })}
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

  /* ---------------- CONTACT ---------------- */
  const chat = `<div class="sb-chat"><p class="me">홈페이지 리뉴얼과 SNS 운영을 같이 맡길 수 있을까요?</p><p class="us">가능합니다. 현재 채널과 자료부터 함께 보겠습니다.</p><p class="us">편한 상담 시간을 알려 주세요.</p><small>대화 예시</small></div>`;
  const contact = contactForm => `<div class="st sb" data-sub="contact">
${hero({ n: 5, label: 'CONTACT', title: ['필요한 일을', '<em>말씀해 주세요.</em>'], lead: '회사 소개와 필요한 업무를 남겨 주세요. 범위가 정해지지 않았어도 괜찮습니다.<br>준비된 자료가 있다면 함께 첨부해 주세요.', art: chat, index: [['contact-form', '문의서'], ['contact-brief', '준비 자료'], ['contact-faq', '자주 묻는 질문']] })}
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

  return { about, process, team, worksTop, contact };
}
