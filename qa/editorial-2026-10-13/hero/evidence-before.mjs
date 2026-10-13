// Korean work selection: every industry and deliverable has its own material.
import {diverseSample} from './diverse-samples.mjs';
import {services} from './data/site.mjs';
const retail='/evidence/diverse/ezylens-studio.png',community='/evidence/diverse/jonghae-home.png';
const culture='/portfolio/concept-city-culture.png',patient='/portfolio/concept-patient-guide.png';
const service='/portfolio/site-soulreset.png',workflow='/portfolio/saas-tesign-workflow.png',editor='/portfolio/saas-ea-editor.png',radar='/portfolio/site-tesign-radar.png';
const book='/evidence/expansion/book-part-opener.webp',bookPage='/evidence/expansion/book-judgment-loop.webp',kfood='/evidence/expansion/kfood-dashboard.png',kings='/evidence/expansion/kings-home.png',dashboard='/evidence/expansion/operations-dashboard.png',redbean='/evidence/expansion/redbean-home.png';
const arrow='<span aria-hidden="true">↗</span>';
const imageDimensions={[retail]:[1440,965],[community]:[1440,1000],[culture]:[1200,1200],[patient]:[1200,1200],[service]:[1440,900],[workflow]:[1440,1558],[editor]:[1600,1050],[radar]:[1440,1000],'/evidence/allthecomm-inquiry.png':[1548,2142],'/evidence/diverse/eyewear-product.jpg':[1500,1500]};
Object.assign(imageDimensions,{[book]:[1352,2000],[bookPage]:[1352,2000],[kfood]:[1440,1000],[kings]:[1440,1000],[redbean]:[1440,1000],[dashboard]:[1282,946],'/evidence/expansion/kings-menu-grid.png':[1440,1000],'/evidence/expansion/kfood-map.png':[1440,1000]});
const picture=(src,alt,cls='',eager=false)=>{const [w,h]=imageDimensions[src]||[1440,900];return `<img class="${cls}" src="${src}" alt="${alt}" ${eager?'fetchpriority="high"':'loading="lazy"'} width="${w}" height="${h}">`;};
const workTiles=[
 {src:'/evidence/expansion/kings-menu-grid.png',alt:'Kings 메뉴를 사진과 설명으로 소개한 실제 제작 화면',label:'Kings · 가맹 모집 웹',kind:'franchise'},
 {src:retail,alt:'EzyLens의 상품 탐색과 옵션 선택 UI/UX 설계 화면',label:'EzyLens · UI/UX 설계',kind:'ux'},
 {src:'/evidence/expansion/kfood-map.png',alt:'먹거리사전의 월별 품목과 산지 지도 화면',label:'먹거리사전 · 대시보드 개발',kind:'sourcing'}
];
function tiles(indices,eager=false){return indices.map(n=>{const t=workTiles[n];return `<figure class="agency-work-tile tile-${t.kind}">${picture(t.src,t.alt,'',eager)}<figcaption>${t.label}</figcaption></figure>`;}).join('');}
export function evidenceHero(){
 const scenes=[
  {tiles:[0],label:'브랜드 웹',title:'Kings\n브랜드·가맹 모집 웹',desc:'메뉴 소개와 가맹 정보를 담은 브랜드 웹사이트.',note:'제작자 프로젝트',href:'/works/project/kings-franchise/',link:'가맹 모집 웹 살펴보기'},
  {tiles:[1],label:'UI/UX 설계',title:'EzyLens\n커머스 UI/UX',desc:'상품 비교와 옵션 선택을 구현한 쇼핑 화면.',note:'UI/UX 시제품',href:'/works/project/ezylens-studio/',link:'UI/UX 설계 살펴보기'},
  {tiles:[2],label:'대시보드 개발',title:'먹거리사전\n산지 탐색 도구',desc:'월별 품목과 생산지를 지도에서 검색하는 화면.',note:'개발 MVP',href:'/works/project/kfood-dashboard/',link:'대시보드 개발 살펴보기'}
 ];
 return `<section class="home-hero evidence-home-hero agency-home-hero"><div class="shell evidence-hero-layout"><div class="hero-copy"><p class="eyebrow">ALL THE COMMUNICATION</p><h1>브랜드 전략부터<br><em>광고·홍보·웹까지.</em></h1><p class="hero-description">기업에 필요한 마케팅을<br>기획하고, 만들고, 운영합니다.</p><div class="hero-ctas"><a class="button" href="/works/#projects">프로젝트 보기${arrow}</a><a class="text-link" href="/contact/">프로젝트 문의${arrow}</a></div></div><div class="evidence-hero" data-evidence-hero><div class="evidence-hero-frames">${scenes.map((s,i)=>`<article class="evidence-hero-frame evidence-hero-screen agency-hero-scene" id="evidence-scene-${i}" role="tabpanel" aria-labelledby="evidence-choice-${i}"${i?' hidden':''}><div class="agency-work-mosaic mosaic-${i}" aria-label="${s.label} 작업 모음">${tiles(s.tiles,i===0)}</div><div class="evidence-hero-caption"><p>${s.note}</p><h2>${s.title.replace('\n','<br>')}</h2><span>${s.desc}</span><a href="${s.href}">${s.link}${arrow}</a></div></article>`).join('')}</div><div class="evidence-hero-choices" role="tablist" aria-label="대표 제작 분야">${scenes.map((s,i)=>`<button id="evidence-choice-${i}" data-evidence-select="${i}" role="tab" aria-controls="evidence-scene-${i}" aria-selected="${i===0}" tabindex="${i?-1:0}"><span>0${i+1}</span>${s.label}</button>`).join('')}</div></div></div></section>`;
}
const examples={
 design:{src:bookPage,alt:'세일즈 리허설의 설명 도해와 본문 편집',label:'출판 · 저술·편집',title:'세일즈 리허설 · 본문 편집',caption:'세일즈 리허설 · 본문과 도해의 편집',href:'/works/project/sales-rehearsal/',benefit:'글자와 이미지, 여백의 순서로 읽는 경험을 설계합니다.'},
 strategy:{src:redbean,alt:'소적두의 브랜드 메시지와 제품 탐색을 연결한 웹',label:'푸드 · 브랜드 웹 제작',title:'소적두 · 브랜드·커머스',caption:'소적두 · 메시지에서 상품 탐색으로 이어지는 웹',href:'/works/project/sojukdoo-concept/',benefit:'사업의 강점과 고객의 선택 기준을 브랜드의 언어와 접점으로 구체화합니다.'},
 digital:{src:service,alt:'SoulReset 여행 서비스 소개와 문의 흐름',label:'여행 · 서비스 웹 제작',title:'SoulReset · 여행 서비스 웹',caption:'SoulReset · 서비스 탐색에서 문의로 이어지는 화면',href:'/works/project/soulreset/',benefit:'유입 이후 고객이 무엇을 읽고 어디서 문의할지 함께 설계합니다.'},
 content:{src:book,alt:'세일즈 리허설의 실제 파트 시작면',label:'출판 · 340쪽 저술·편집',title:'세일즈 리허설 · 저술·편집',caption:'세일즈 리허설 · 원고 구성, 도해와 내지 편집',href:'/works/project/sales-rehearsal/',benefit:'원고의 구조부터 제목과 본문, 이미지와 도해까지 읽는 목적에 맞게 편집합니다.'},
 it:{src:dashboard,alt:'정보 수집과 발행 현황을 모니터링하는 운영 대시보드',label:'업무 시스템 · 운영 대시보드',title:'정보 운영 대시보드',caption:'정보 운영 대시보드 · 수집·발행 현황과 작업 모니터링',href:'/works/project/content-operations/',benefit:'웹·UI/UX·대시보드부터 담당자의 관리 업무까지 실제 이용 흐름에 맞춰 개발합니다.'},
 consulting:{src:kfood,alt:'먹거리사전의 품목 및 소싱 정보 탐색 화면',label:'식품 · 품목 탐색 MVP',title:'먹거리사전 · 탐색 도구',caption:'먹거리사전 · 품목과 소싱 정보의 탐색 구조',href:'/works/project/kfood-dashboard/',benefit:'새로운 사업의 고객·제안·실행 범위를 구체적인 계획으로 정리합니다.'}
};
const sampleMeta={
 hospital:['의료 · 방문 안내 콘텐츠','병원 방문 안내 콘텐츠','의학전문기자와 병원 홍보팀장 출신의 경험을 바탕으로, 병원 전략부터 의료 콘텐츠·언론홍보·채널 운영까지 연결합니다.'],
 pr:['제조·B2B · 신제품 PR 원고','신제품 보도자료','기자의 확인과 독자의 이해에 필요한 사실·자료·메시지를 준비합니다.'],
 video:['여행·공간 · 브랜드 필름 콘티','브랜드 필름 콘티','영상의 목적에 맞춰 장면·소리·다음 행동을 구체적으로 설계합니다.'],
 media:['문화 · 도시 산책 전시 포스터','문화 캠페인 포스터','목표와 생활 동선에 맞는 매체·메시지·집행 범위를 정합니다.'],
 influencer:['뷰티 · 크리에이터 협업 브리프','크리에이터 협업 브리프','브랜드의 고객과 맞는 경험을 중심으로 협업을 기획합니다.']
};
export const evidenceBenefit=id=>services.find(service=>service.id===id)?.summary||'';
export function evidenceVisual(id,context='works'){if(context==='team')return roleFocus(id);const e=examples[id],s=sampleMeta[id];return `<div class="evidence-visual" data-evidence-kind="${id}"><figure>${e?`<a class="evidence-image-link" href="${e.href}">${picture(e.src,e.alt,'evidence-screen')}</a><figcaption><small>${e.label}</small><strong>${e.title}</strong><a href="${e.href}">작업 자세히 보기 ${arrow}</a></figcaption>`:`${diverseSample(id)}<figcaption><small>${s[0]} · 자체 콘셉트</small><strong>${s[1]}</strong>${id==='hospital'||id==='media'?`<a href="/works/project/${id==='hospital'?'patient-guide':'city-culture'}/">제안의 구성 살펴보기 ${arrow}</a>`:''}</figcaption>`}</figure></div>`;}
const roleQuestions={strategy:['고객은 왜\n우리를 선택할까?','제품의 강점과 고객의 선택 기준을 연결하는 역할.'],digital:['관심이 생긴 뒤,\n어디로 가야 할까?','검색과 채널, 랜딩과 문의까지 이어서 살피는 역할.'],content:['무엇을 남기고,\n무엇을 덜어낼까?','자료의 중심을 찾고 읽는 순서를 만드는 역할.'],design:['첫눈에 무엇이\n읽혀야 할까?','정보의 중요도를 글자와 여백, 화면으로 드러내는 역할.'],video:['어느 장면이\n기억에 남을까?','메시지를 장면과 소리, 리듬으로 구체화하는 역할.'],media:['고객의 하루 중,\n어디에서 만날까?','생활 동선과 매체의 맥락에 맞춰 접점을 고르는 역할.'],influencer:['누구의 경험이\n설득력이 있을까?','브랜드와 사람 사이의 자연스러운 맥락을 찾는 역할.'],it:['다음 행동이\n바로 보이는가?','사용자의 선택과 담당자의 처리를 연결하는 역할.'],pr:['이 소식을 왜\n지금 전해야 할까?','자료에서 뉴스의 이유를 찾고 사실을 확인하는 역할.']};
function roleFocus(id){const q=roleQuestions[id];return '<div class="role-focus"><small>우리가 먼저 묻는 질문</small><strong>'+q[0].replace('\n','<br>')+'</strong><p>'+q[1]+'</p></div>';}
export function evidenceAbout(){return '<div class="agency-editorial"><p>ALL THE COMMUNICATION</p><strong>기획 · 제작 · 운영</strong><div><span>브랜드 전략</span><span>콘텐츠·디자인</span><span>광고·언론홍보</span><span>웹·디지털 개발</span></div></div>';}
export function evidenceHomeAbout(){return '<div class="agency-editorial editorial-light"><p>INTEGRATED MARKETING</p><strong>마케팅의 기획부터<br>제작과 운영까지.</strong></div>';}
const processEntries=[
 [radar,'TESIGN Radar의 정보 탐색과 분류 화면','정보 분류와 탐색 화면','정보 탐색 설계 · TESIGN Radar'],
 [editor,'Review Atelier에서 자료와 원고를 연결해 기획·편집하는 제작 화면','자료 수집과 원고 편집','콘텐츠 기획·편집 도구 · Review Atelier 시제품'],
 [bookPage,'세일즈 리허설의 본문과 설명 도해 편집','본문과 도해 편집','저술·편집 · 세일즈 리허설'],
 [workflow,'검수와 납품 기록을 관리하는 Tesign OS','작업·검수 기록 관리','내부 업무 도구 · 검수용 데이터']
];
export function evidenceChapter(i){const e=processEntries[i];return `<div class="chapter-art evidence-chapter"><figure>${picture(e[0],e[1],'evidence-screen')}<figcaption><strong>${e[2]}</strong><span>${e[3]}</span></figcaption></figure></div>`;}
export function evidenceProcessPreview(i){const words=['현황 분석','제작 계획','제작·검토','납품·보고'];return '<div class="process-preview-question"><small>0'+(i+1)+'</small><strong>'+words[i]+'</strong></div>';}
export function evidenceSelfArt(){return `<div class="portfolio-shot evidence-self-shot">${picture('/evidence/allthecomm-inquiry.png','올더커뮤니케이션의 서비스 선택과 프로젝트 문의 입력 화면','project-image-real')}</div>`;}
export function evidenceSelfFilm(){return `<figure class="evidence-self-detail">${picture('/evidence/allthecomm-inquiry.png','상담할 서비스를 선택하고 참고자료를 첨부하는 실제 문의 화면')}<figcaption>서비스 선택과 자료 첨부를 지원하는 프로젝트 문의 화면.</figcaption></figure>`;}
export function evidenceContactNote(){return `<div class="contact-next"><p class="eyebrow">상담 안내</p><h2>의뢰 범위와 일정</h2><p>진행할 업무, 예산과 희망 일정을 알려 주세요.</p></div>`;}
