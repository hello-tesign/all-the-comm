const fs=require('fs');let s=fs.readFileSync('src/evidence-content.mjs','utf8');fs.copyFileSync('src/evidence-content.mjs','qa/editorial-2026-10-13/before/source/src__evidence-content.mjs');
const pairs=[
 ["import {diverseSample} from './diverse-samples.mjs';","import {diverseSample} from './diverse-samples.mjs';\nimport {services} from './data/site.mjs';"],
 ["const workTiles=[","const workTiles=["],
 ["{src:kings,alt:'Kings 가맹 모집 웹사이트의 실제 제작 화면'","{src:'/evidence/expansion/kings-menu-grid.png',alt:'Kings 메뉴를 사진과 설명으로 소개한 실제 제작 화면'"],
 ["{src:kfood,alt:'먹거리사전의 품목 탐색과 소싱 대시보드'","{src:'/evidence/expansion/kfood-map.png',alt:'먹거리사전의 월별 품목과 산지 지도 화면'"],
 ["title:'가맹을 고민하는 사람에게,\\n판단에 필요한 정보를.',desc:'브랜드 소개부터 메뉴, 운영 정보와 상담까지 이어지는 웹.',note:'Kings · 제작자 웹 프로젝트'","title:'Kings\\n브랜드·가맹 모집 웹',desc:'메뉴 소개와 가맹 정보를 담은 브랜드 웹사이트.',note:'제작자 프로젝트'"],
 ["title:'크게 보고, 비교하고.\\n선택에 집중하는 화면.',desc:'상품 탐색부터 이미지 확대와 옵션 선택까지 이어지는 인터랙션.',note:'EzyLens · 인터랙티브 UI/UX 시제품'","title:'EzyLens\\n커머스 UI/UX',desc:'상품 비교와 옵션 선택을 구현한 쇼핑 화면.',note:'UI/UX 시제품'"],
 ["title:'흩어진 품목 정보를,\\n다음 업무로 연결합니다.',desc:'월별 품목과 소싱 정보를 한 작업 공간에서 찾고 검토하는 대시보드.',note:'먹거리사전 · 개발 MVP'","title:'먹거리사전\\n산지 탐색 도구',desc:'월별 품목과 생산지를 지도에서 검색하는 화면.',note:'개발 MVP'"],
 ['고객의 선택을 만드는<br><em>전략과 크리에이티브.</em>','브랜드 전략부터<br><em>광고·홍보·웹까지.</em>'],
 ['제품을 알리고, 서비스를 이해시키고,<br>문의와 구매로 이어지는 경험을 만듭니다.','기업에 필요한 마케팅을<br>기획하고, 만들고, 운영합니다.'],
 ["export const evidenceBenefit=id=>examples[id]?.benefit||sampleMeta[id]?.[2]||'';","export const evidenceBenefit=id=>services.find(service=>service.id===id)?.summary||'';"],
 ['브랜드의 강점을, 선택의 이유로.','Kings · 브랜드 웹'],['관심 다음에 할 일이 보이도록.','SoulReset · 여행 서비스 웹'],['한 권의 생각을, 끝까지 읽히는 구성으로.','세일즈 리허설 · 저술·편집'],['지금 확인할 일과, 다음 처리할 일이 보이도록.','정보 운영 대시보드'],['많은 정보에서, 검토할 후보를 찾도록.','먹거리사전 · 탐색 도구'],
 ['처음 방문하는 고객의 질문에서 시작합니다.','병원 방문 안내 콘텐츠'],['기술의 차이를, 이해할 수 있는 이야기로.','신제품 보도자료'],['공간의 분위기를, 방문하고 싶은 장면으로.','브랜드 필름 콘티'],['지나치는 순간에도, 한 문장이 남도록.','문화 캠페인 포스터'],['브랜드의 설명을, 일상의 경험으로.','크리에이터 협업 브리프'],
 ['<span>${e.caption}</span>',''],
 ['고객이 찾는 정보를 먼저 구조화합니다.','정보 분류와 탐색 화면'],['어떤 자료를 근거로, 무엇을 말할지 정합니다.','자료 수집과 원고 편집'],['내용에 맞는 형식으로 세부를 완성합니다.','본문과 도해 편집'],['담당자에게 작업의 맥락까지 전달합니다.','작업·검수 기록 관리'],
 ["const words=['질문을 정확하게.','방향을 선명하게.','표현을 구체적으로.','다음 실행까지.'];","const words=['현황 분석','제작 계획','제작·검토','납품·보고'];"],
 ['관심 서비스 선택 → 문의 작성 → 참고자료 첨부. 현재 사이트의 실제 상담 화면입니다.','서비스 선택과 자료 첨부를 지원하는 프로젝트 문의 화면.'],
 ['상담에서 함께 정할 것','상담 안내'],['지금의 상황부터<br>들려주세요.','의뢰 범위와 일정'],['필요한 업무와 우선순위,<br>예산·일정에 맞는 범위,<br>확인할 결과와 다음 단계.','진행할 업무, 예산과 희망 일정을 알려 주세요.']
];for(const[from,to]of pairs){if(!s.includes(from))console.log('NOT FOUND',from);else s=s.replaceAll(from,to);}
s=s.replace(/<p class="hero-promise">[\s\S]*?<\/p>/,'');
s=s.replace(/export function evidenceAbout\(\)\{[^\n]+/,'export function evidenceAbout(){return \'<div class="agency-editorial"><p>ALL THE COMMUNICATION</p><strong>기획 · 제작 · 운영</strong><div><span>브랜드 전략</span><span>콘텐츠·디자인</span><span>광고·언론홍보</span><span>웹·디지털 개발</span></div></div>\';}');
s=s.replace(/export function evidenceHomeAbout\(\)\{[^\n]+/,'export function evidenceHomeAbout(){return \'<div class="agency-editorial editorial-light"><p>INTEGRATED MARKETING</p><strong>마케팅의 기획부터<br>제작과 운영까지.</strong></div>\';}');
fs.writeFileSync('src/evidence-content.mjs',s);
let b=fs.readFileSync('scripts/build-renewal.mjs','utf8');b=b.replace(":evidenceVisual(['strategy','digital','content','design','video','media','influencer','it','pr'][i],'team')",":''");b=b.replace('<span>함께 만드는 것</span>','<span>주요 산출물</span>');fs.writeFileSync('scripts/build-renewal.mjs',b);
let app=fs.readFileSync('src/app.js','utf8');if(!app.includes('document.body.dataset.caseSlug=slug;'))app=app.replace("if(slug)fetch('/api/projects/'", "if(slug)document.body.dataset.caseSlug=slug;\n if(slug)fetch('/api/projects/'");fs.writeFileSync('src/app.js',app);
