// Korean editorial examples. Creator work and proposed deliverables stay labelled.
const photo='/evidence/sojukdoo-product.jpg';
const commerce='/portfolio/site-sojukdoo-commerce.png';
const gift='/portfolio/site-sojukdoo-gift.png';
const service='/portfolio/site-soulreset.png';
const workflow='/portfolio/saas-tesign-workflow.png';
const editor='/portfolio/saas-ea-editor.png';
const radar='/portfolio/site-tesign-radar.png';
const arrow='<span aria-hidden="true">↗</span>';
const imageDimensions={"/evidence/allthecomm-inquiry.png": [1548, 2142], "/evidence/sojukdoo-making.jpg": [1518, 998], "/evidence/sojukdoo-product.jpg": [900, 900], "/portfolio/saas-ea-editor.png": [1600, 1050], "/portfolio/saas-tesign-workflow.png": [1440, 1558], "/portfolio/site-sojukdoo-commerce.png": [1440, 900], "/portfolio/site-sojukdoo-gift.png": [1440, 900], "/portfolio/site-soulreset.png": [1440, 900], "/portfolio/site-tesign-radar.png": [1440, 1000]};
const picture=(src,alt,cls='')=>{const [w,h]=imageDimensions[src]||[1440,900];return `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy" width="${w}" height="${h}">`;};

export function evidenceHero(){
 const scenes=[
  {src:photo,alt:'소적두 기존 단팥빵 상품 사진',label:'제품의 매력',title:'제품의 좋은 점이\n고르는 이유가 되도록.',desc:'상품을 보여주는 사진에서 브랜드의 한 문장, 구매 화면까지.',note:'소적두 · 기존 상품 사진 / 연결 사례는 브랜드·커머스 개발 콘셉트',href:'/works/project/sojukdoo-concept/',link:'브랜드·커머스 구상 보기',kind:'photo'},
  {src:service,alt:'SoulReset 서비스 소개와 여행 경험 탐색을 담은 실제 제작 화면',label:'서비스의 경험',title:'궁금했던 서비스가\n상담하고 싶은 경험으로.',desc:'처음 발견한 순간부터 서비스 이해와 문의까지 흐름을 설계합니다.',note:'SoulReset · 제작자 프로젝트 / 서비스 웹사이트',href:'/works/project/soulreset/',link:'서비스 웹사이트 보기',kind:'screen'},
  {src:workflow,alt:'요청과 콘텐츠 검수, 납품 상태를 연결하는 Tesign OS 제작 화면',label:'운영의 효율',title:'반복되는 업무에도\n이어지는 기준이 있도록.',desc:'자료와 제작, 검수와 다음 실행을 하나의 업무 흐름으로 연결합니다.',note:'Tesign OS · 제작자 내부 도구 / 검수용 데이터',href:'/works/project/tesign-workflow/',link:'업무 도구 제작 보기',kind:'screen'}
 ];
 return `<section class="home-hero evidence-home-hero"><div class="shell evidence-hero-layout"><div class="hero-copy"><p class="eyebrow">ALL THE COMMUNICATION</p><h1>좋은 사업을,<br><em>선택받는 브랜드로.</em></h1><p class="hero-description">제품의 매력을 전하는 콘텐츠,<br>고객의 질문에 답하는 홈페이지,<br>다음 실행을 찾는 광고와 홍보.</p><div class="hero-ctas"><a class="button" href="/works/#projects">작업으로 확인하기${arrow}</a><a class="text-link" href="/contact/">우리 회사 이야기하기${arrow}</a></div><p class="hero-promise">전략 · 디자인 · 콘텐츠 · 광고 · 디지털 · PR<br>필요한 일들을 하나의 방향으로 연결합니다.</p></div><div class="evidence-hero" data-evidence-hero><div class="evidence-hero-frames">${scenes.map((s,i)=>`<article class="evidence-hero-frame evidence-hero-${s.kind}" id="evidence-scene-${i}" role="tabpanel" aria-labelledby="evidence-choice-${i}"${i?' hidden':''}><div class="evidence-hero-image"><img src="${s.src}" alt="${s.alt}" width="${imageDimensions[s.src][0]}" height="${imageDimensions[s.src][1]}" ${i?'loading="lazy"':'fetchpriority="high"'}></div><div class="evidence-hero-caption"><p>${s.note}</p><h2>${s.title.replace('\n','<br>')}</h2><span>${s.desc}</span><a href="${s.href}">${s.link}${arrow}</a></div></article>`).join('')}</div><div class="evidence-hero-choices" role="tablist" aria-label="어떤 과제를 함께 풀까요">${scenes.map((s,i)=>`<button id="evidence-choice-${i}" data-evidence-select="${i}" role="tab" aria-controls="evidence-scene-${i}" aria-selected="${i===0}" tabindex="${i?-1:0}"><span>0${i+1}</span>${s.label}</button>`).join('')}</div></div></div></section>`;
}

const examples={
 strategy:{src:gift,alt:'팥 한 상자 선물 패키지와 커머스 콘셉트 제작 화면',label:'브랜드·커머스 개발 콘셉트',title:'같은 제품도, 어떤 이유로 기억될까요?',caption:'소적두 · 제품의 특징을 이름·패키지·구매 화면으로 연결',href:'/works/project/sojukdoo-concept/',benefit:'제품의 차이가 잘 보이지 않을 때, 선택할 이유부터 정리합니다.'},
 digital:{src:service,alt:'SoulReset의 서비스 소개와 상담으로 이어지는 웹 제작 화면',label:'제작자 프로젝트 · 서비스 웹',title:'관심 다음에 할 일이 보이도록.',caption:'SoulReset · 서비스 탐색에서 문의로 이어지는 화면',href:'/works/project/soulreset/',benefit:'유입 이후 고객이 무엇을 읽고 어디서 문의할지 함께 설계합니다.'},
 content:{src:commerce,alt:'제품의 특징을 사진과 한 문장으로 전하는 소적두 커머스 콘셉트',label:'제작자 콘셉트 · 브랜드 콘텐츠',title:'설명보다 먼저, 제품의 매력이 보이게.',caption:'소적두 · 제품 표현과 메시지를 연결한 제작 콘셉트',href:'/works/project/sojukdoo-concept/',benefit:'웹·SNS·홍보물마다 달랐던 표현을 같은 브랜드의 목소리로 맞춥니다.'},
 it:{src:workflow,alt:'콘텐츠의 요청부터 검수와 납품을 관리하는 내부 도구 화면',label:'제작자 내부 도구 · 검수용 데이터',title:'담당자의 다음 일이 분명해지도록.',caption:'Tesign OS · 자료와 검수, 납품 기록을 잇는 작업 환경',href:'/works/project/tesign-workflow/',benefit:'고객의 이용 흐름과 담당자의 반복 업무를 함께 개선합니다.'},
 consulting:{src:radar,alt:'디지털 도구의 탐색과 비교를 돕는 TESIGN Radar 제작 화면',label:'제작자 프로젝트 · 정보 설계',title:'선택지가 많을수록, 판단 기준은 명확하게.',caption:'TESIGN Radar · 정보를 찾고 비교하는 탐색 서비스',href:'/works/project/tesign-radar/',benefit:'새로운 사업의 고객·제안·실행 범위를 구체적인 계획으로 정리합니다.'}
};

function sample(kind){
 if(kind==='hospital')return `<div class="sample-output sample-care"><small>병원 콘텐츠 구성 예시</small><h4>처음 방문하는 분께.</h4><p class="sample-lead">방문 전에 궁금한 내용을<br>쉽게 찾을 수 있도록.</p><div class="care-questions"><p><b>예약은 어떻게 하나요?</b><span>예약 방법과 상담 연락처를 한곳에.</span></p><p><b>방문 전 무엇을 준비하나요?</b><span>병원에서 확인한 준비사항을 명확하게.</span></p><p><b>어디로 가면 되나요?</b><span>진료시간·위치·주차 안내를 함께.</span></p></div><footer>진료정보는 의료진 확인 후 게시 · 가상 구성 예시</footer></div>`;
 if(kind==='pr')return `<div class="sample-output sample-press"><small>보도자료 자체 예시 · 가상 브랜드</small><p class="press-kicker">오후식탁 — 신제품 제안</p><h4>혼자 먹는 오후에도,<br>남기지 않는 간식.</h4><p class="press-lead">가상 브랜드 ‘오후식탁’이 한 번에 먹기 좋은 소포장 단팥빵을 제안한다. 혼자 먹을 때 남는 양에 주목해, 제품 구성과 보관 안내를 함께 설계한 콘셉트다.</p><p>제품의 특징을 나열하기보다 소비자가 겪는 불편에서 이야기를 시작한다. 제품 사진과 구성 정보를 함께 제공해 독자가 달라지는 경험을 구체적으로 이해하도록 한다.</p><footer>가상 신제품의 보도자료 작성 예시 · 실제 출시·기사·보도 실적 아님</footer></div>`;
 if(kind==='video')return `<div class="sample-output sample-film"><small>제품 영상 콘티 예시 · 15초</small><div class="film-stills">${[0,1,2].map((n)=>`<div class="film-still-${n}">${picture(photo,['빵의 단면을 가까이 보여주는 촬영 구성','기존 단팥빵 제품의 전체 모습을 보여주는 촬영 구성','제품과 다음 행동을 연결하는 엔드 프레임 시안'][n])}${n===2?'<em>당신의 오후에,<br>단팥 한 입.</em>':''}<span>${['00—04″ · 단면으로 시선 잡기','04—10″ · 제품을 보여주기','10—15″ · 제품 탐색 제안'][n]}</span></div>`).join('')}</div><h4>한 입 전에,<br>눈이 먼저 기억하도록.</h4><p>질감을 가까이 보여준 뒤 제품 전체를 소개하고,<br>마지막 장면에서 제품 탐색을 제안합니다.</p><footer>기존 상품 사진을 사용한 콘티 예시 · 촬영·집행 실적 아님</footer></div>`;
 if(kind==='media')return `<div class="sample-output sample-ad">${picture(photo,'소적두 기존 팥 디저트 상품 이미지')}<div class="sample-ad-copy"><small>광고 소재 구성 예시</small><h4>잠깐의 쉼,<br>단팥 한 입.</h4><p>제품의 한 가지 매력을<br>한눈에 읽히는 메시지로.</p></div><footer>자체 카피·소재 시안 · 매체 집행 실적 아님</footer></div>`;
 return `<div class="sample-output sample-creator">${picture(photo,'제품 경험 콘텐츠 구성을 위한 기존 상품 사진')}<div><small>크리에이터 협업 브리프 예시</small><h4>제품 설명을,<br>나의 경험으로.</h4><p>누가 공감할 이야기인가.<br>어떤 순간에 사용할 제품인가.<br>경험 뒤 어떤 행동을 제안할까.</p><footer>협업 기획 예시 · 실제 크리에이터 수주 실적 아님</footer></div></div>`;
}

const sampleMeta={
 hospital:['방문 전의 질문에 먼저 답합니다.','진료의 장점뿐 아니라 환자가 찾는 정보를 알기 쉽게 정리합니다.'],
 pr:['좋은 소식을, 전할 이유가 있는 이야기로.','기자의 확인과 독자의 이해에 필요한 사실·자료·메시지를 준비합니다.'],
 video:['짧은 영상에도, 기억할 이유는 분명하게.','영상의 길이보다 중요한 장면과 행동을 먼저 정합니다.'],
 media:['고객이 지나가는 곳에, 읽히는 메시지를.','목표와 생활 동선에 맞는 매체·메시지·집행 범위를 정합니다.'],
 influencer:['팔로워 수보다, 우리 제품과의 접점부터.','브랜드의 고객과 맞는 경험을 중심으로 협업을 기획합니다.']
};

export const evidenceBenefit=id=>examples[id]?.benefit||sampleMeta[id]?.[1]||'';
export function evidenceVisual(id){
 const e=examples[id];
 return `<div class="evidence-visual" data-evidence-kind="${id}"><figure>${e?`<a class="evidence-image-link" href="${e.href}">${picture(e.src,e.alt,'evidence-screen')}</a><figcaption><small>${e.label}</small><strong>${e.title}</strong><span>${e.caption}</span><a href="${e.href}">작업 자세히 보기 ${arrow}</a></figcaption>`:`${sample(id)}<figcaption><strong>${sampleMeta[id][0]}</strong><span>제공할 결과물을 이해하기 위한 자체 구성 예시입니다.</span></figcaption>`}</figure></div>`;
}
export function evidenceAbout(){return `<figure class="evidence-about-photo">${picture('/evidence/sojukdoo-making.jpg','소적두의 기존 브랜드 자료에 담긴 제조 현장 사진')}<figcaption><span>고객의 일에서</span><strong>말할 이유를 찾고,<br>고객이 만날 장면을 만듭니다.</strong><small>소적두 기존 제조 현장 사진 · 올더 구성원 사진이 아닙니다</small><a href="/works/project/sojukdoo-concept/">브랜드·커머스 구상 살펴보기 ${arrow}</a></figcaption></figure>`;}
export function evidenceHomeAbout(){return `<div class="evidence-connected"><figure>${picture(gift,'소적두 선물 패키지 커머스 콘셉트')}<figcaption>브랜드와 패키지 · 개발 콘셉트</figcaption></figure><figure>${picture(editor,'Review Atelier 콘텐츠 편집 시제품 화면')}<figcaption>콘텐츠 제작과 검수 · 프로토타입</figcaption></figure><p>고객이 보는 화면과<br>그 뒤에서 운영되는 일까지.</p></div>`;}
export function evidenceChapter(i){
 const entries=[
 [photo,'소적두 기존 상품 사진','제품과 고객을 이해하는 출발점','기존 상품 사진 · 분석 대상 예시'],
 [gift,'소적두 선물 브랜드와 커머스 방향 제안','어떤 이유로 기억될지 정합니다','소적두 브랜드·패키지 개발 콘셉트'],
 [commerce,'소적두 커머스 구현 화면','정한 방향을 실제 화면으로 만듭니다','제작자 웹 콘셉트 · 구매 UI 시안'],
 [workflow,'콘텐츠 검수·납품 이력을 관리하는 Tesign OS','검수한 내용이 다음 작업에도 남도록','별도 제작자 내부 도구 · 검수용 데이터']
 ];
 const e=entries[i];return `<div class="chapter-art evidence-chapter"><figure>${picture(e[0],e[1],i===0?'evidence-photo':'evidence-screen')}<figcaption><strong>${e[2]}</strong><span>${e[3]}</span></figcaption></figure></div>`;
}
export function evidenceProcessPreview(i){const imgs=[photo,gift,commerce,workflow];return `<figure class="process-preview-evidence">${picture(imgs[i],['기존 상품 사진','브랜드 방향 제안 화면','커머스 개발 콘셉트','검수 기록을 관리하는 도구 화면'][i])}<figcaption>${['기존 상품 사진 · 분석 대상 예시','소적두 브랜드·패키지 개발 콘셉트','제작자 웹 콘셉트 · 구매 UI 시안','별도 제작자 내부 도구 · 검수용 데이터'][i]}</figcaption></figure>`;}
export function evidenceSelfArt(){return `<div class="portfolio-shot evidence-self-shot">${picture('/evidence/allthecomm-inquiry.png','올더커뮤니케이션의 서비스 선택과 프로젝트 문의 입력 화면','project-image-real')}</div>`;}
export function evidenceSelfFilm(){return `<figure class="evidence-self-detail">${picture('/evidence/allthecomm-inquiry.png','상담할 서비스를 선택하고 참고자료를 첨부하는 실제 문의 화면')}<figcaption>관심 서비스 선택 → 문의 작성 → 참고자료 첨부. 현재 사이트의 실제 상담 화면입니다.</figcaption></figure>`;}
export function evidenceContactNote(){return `<div class="contact-next"><p class="eyebrow">상담에서 함께 정할 것</p><h2>지금의 상황부터<br>들려주세요.</h2><p>필요한 업무와 우선순위,<br>예산·일정에 맞는 범위,<br>확인할 결과와 다음 단계.</p></div>`;}
