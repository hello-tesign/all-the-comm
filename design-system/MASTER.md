# ALL THE COMMUNICATION — Design system 3.0

2026-10-13 · 정식 자료 S03/S04와 사용자 피드백을 반영한 구현 기준.

최신 우선순위: 상위 구조를 유지하고 문구·사례 편집을 정돈한다. 아래 Foundations/Compositions와 `docs/editorial-direction-2026-10-13.md`가 현재 기준이다. 과거 이력의 조형·유리층·과대 제목·첫 사례 전체 폭 배치는 현재 국문에 적용하지 않는다. FreeFrontend의 일정한 이미지 규격과 정보 위계를 참고했으며 템플릿을 복제하지 않았다.

## Identity

종합광고대행사. 병원 경험은 역량 중 하나다. 고객 사례·수치·인력은 만들어내지 않는다. 브랜드 원본은 수신 AI의 민트 시그니처. 겹친 곡선과 일정한 간격을 공간·빛·프레임으로 확장하되 로고 비율은 보존한다.

기성 템플릿, 번호와 가로선으로 나열한 서비스 목록, 모든 섹션에 반복하는 카드, 범용 아이콘 팩, 허위 실적 타일을 쓰지 않는다. ui-ux-pro-max의 자동 팔레트·Bento 추천은 이 프로젝트의 직접 피드백과 다르므로 채택하지 않는다. 접근성·반응형·모션 정리 규칙만 적용한다.

## Foundations

- Korean editorial surfaces: white #FFFFFF, soft gray #F7F8F8, image frame #EEF0F0. Ink #061C25 and restrained deep teal headings; mint #59E3C6 remains a brand accent. Dark footer is retained. Earlier navy/mint section alternation is superseded.
- Ink surface text #EFF8F5, muted #A6C5C5. Paper text #092A31, muted #526A6D.
- Brand colors are web application choices derived from the supplied mint logo, not a claim of official brand-guide HEX values.
- Pretendard Variable: Korean; Manrope: Latin. Self-hosted. Korean desktop (1060px+) body 18px, line-height 1.6 (allowed 1.4–1.7); Korean titles keep-all, deliberate responsive line breaks. Desktop page titles 56–72px, section headings 40–48px, service titles 36px, case titles 28px, captions 14px. Each existing size advances one step on the scale in `src/desktop-typography.css`. The main company hero H1 retains its exact 72–96px fluid scale. Mobile, English and lettering inside portfolio artwork keep their previous sizes.
- Korean content max-width 1280px; gutters desktop 32px, tablet 24px, mobile 16px. Layout spacing uses 8 / 16 / 24 / 32 / 48 / 64px. Section spacing desktop 96px, tablet 80px, mobile 64px. Large gaps are multiples of 8px.
- Korean controls use radius 8px, portfolio media frames 12px, enlarged-image dialogs 16px. Editorial images and unboxed sections retain their natural edges; radius is not a reason to add cards. Primary buttons and inputs are 48px tall; text links have at least a 44px target.
- Focus ring mint on ink, deep teal on paper. Numeric foundations remain in `src/design-rhythm.css`; `src/editorial-presentation.css` implements the current editorial composition and the final Korean-only `src/desktop-typography.css` supplies the desktop type scale. English remains in its existing design until the Korean edition is approved.

## Compositions

1. Korean homepage hero: company identity and a single licensed audience photograph, with the slogan “전략은 명확하게. 표현은 강렬하게.” and two direct service/contact actions. No case study, product, creator interface or carousel in this hero. Desktop headline may reach 96px as the primary brand exception; ordinary page titles are capped at 72px after the desktop type-scale revision. ABOUT and WORKS have text-led introduction heroes with short scope lines. PROCESS, TEAM and CONTACT keep concise content-first introductions. See `docs/brand-hero-2026-10-13.md`.
2. Korean services: selectable work with actual screens or explicitly labelled, concrete deliverable examples. Eight homepage summaries, ten WORKS services. No glass-plane or decorative icon substitute for the work.
3. Work: equal two-column screenshot gallery, with three equal featured previews on the desktop homepage. ABOUT/TEAM/CONTACT case pairs use the same 16:10 preview frame, 24px inset and contained original images. Mobile flows in one column. Case name, short description and attribution follow a consistent order. Creator projects, prototypes, concepts and the agency self-project retain explicit classifications. Use the full-size viewer for reading detail. Never present creator work as an unverified agency client commission.
4. Process: four deliberate chapters / selectable stage with meaningful outputs. Mobile flows vertically.
5. About / Team: typography, clearly attributed source imagery and actual/illustrative outputs for each role. No invented team portraits, decorative lenses or orbital icons.
6. Contact: clearly labeled form, service multi-selection, visible consent, real durable inbox receipt.

### PROCESS 요약 영역 — 사용자 피드백 우선

2026-10-13: 사용자는 단계별 산출물/고객 검토의 4열 화면을 보고서·아마추어 수준이라고 지적하고 글라스 효과와 짧은 글을 명시했다. 이 영역에서는 앞선 글라스 일괄 배제 규칙보다 이 지시를 우선한다. 긴 착수·산출물·인계 세 영역을 하나의 반투명 글라스 장면으로 압축한다. 단계마다 핵심 문장 하나만 사용하고, 기존 자료의 분석→전략→실행→보고·개선을 유지한다. 확인하지 않은 산출물명·고객 검토 절차는 삭제한다. 마지막 단계는 성과 분석·개선이며 웹 납품 안내로 대체하지 않는다. 블러24px·얇은 하이라이트·겹친 투명 면을 사용하며, 포인터 반응은4px 이내·동작 줄이기에서 정지한다. 구현은 `src/page-depth/process-glass.css`, 국문에만 적용한다.

## Components and states

Header 5 menus + separate CTA, logo home, KO/EN counterpart links. Mobile dialog focus trap, Escape and return focus. Buttons default/hover/focus/disabled/loading. Service tabs selected/keyboard/mobile. Project filters empty/error states. Form idle/invalid/submitting/success/failure; preserve input on failure. Attachment validation precedes upload. All new dynamic text rendered safely.

## Motion

Three.js custom material/geometry; GSAP/ScrollTrigger scene transitions; native View Transitions where supported; CSS/WAAPI for small transitions. HyperFrames hand-authored brand film. No catalog preset or generated site template.

Interaction 120–180ms; state 240–360ms; entrance 600–900ms. Main easing cubic-bezier(.22,1,.36,1). WebGL/WebGPU quality scales by viewport and DPR. Suspend offscreen/hidden tab. Dispose on navigation. Reduced motion switches live: static sculpture frame, no scrub/tilt, all text visible. Visible pause control. Autoplay video muted, inline, pausable; fallback poster. No scroll hijacking or forced loading intro.

## Content and language

KO and EN use the same service/project identity and counterpart routes. Real company info uses provided/current public source. Inquiry API accepts locale. English cases are authored where available; do not silently manufacture translated client claims. User-provided facts remain traceable.

## Quality gate

Playwright Chromium/Firefox/WebKit, PC/mobile; routes, tabs, menu, responsive layout, forms, real local inbox, admin publishing, no console errors, reduced motion and motion pause. Capture start/middle/end and inspect visual hierarchy. Score rubric: identity25, typography/composition20, motion20, marketing/content20, usability/performance15. Internal score is not an award, independent certification or live-deployment proof. Record evidence and unresolved external gates honestly.

## Refinement workflow — 2026-10-12

사용자 결정: 국문을 먼저 완성한다. 세부 수정마다 영문 카피·개별 레이아웃을 병행하지 않는다. 현재 영문을 유지하고 국문 확정 후 일괄 번역·반응형·기능 검수한다. 공통 코드 결함 수정은 공통에 반영하되 영문 확정으로 보지 않는다. docs/LOCALIZATION_WORKFLOW.md 참조.

추가 결정: ISOS는 최소 완성도 참고다. 동일한 디자인이나 효과 목록을 재현하는 것이 목표가 아니다. 기법 선택은 제작자가 판단하고, 회사의 정체성·실제 작업·읽기·탐색을 기준으로 완성도를 높인다. 전체 국문 PC에 일관된 수준을 적용하되 각 페이지의 주요 장면은 내용에 맞게 다르게 설계한다.

## Portfolio motion — Korean desktop

참조: 사용자가 제공한 `International-SOS-Global-Employee-Safety-EN-MOTION.html`. 캡처 내부 UI를 움직이지 않고 프레임 전체가 열리는 전개, 제목과 설명의 순차 등장, 읽기 진행 표시를 적용한다.

- 적용: 국문 홈의 대표 사례, WORKS와 캡처 상세, 1060px 이상, 동작 줄이기 미설정.
- 프레임: 32px 진입, scale .975→1, 마스크 9%/4.5%/12%→0, 1120ms power4.inOut. 이 장면은 기본 입장 시간보다 긴 편집용 예외다.
- 텍스트: 24px 진입, 740ms power3.out, 75ms 간격. 우측 장면은 100ms 간격 차이.
- 화살표: fine pointer에서 최대 7px 반응. 캡처 자체의 확대·기울기·이동은 없다.
- 읽기 진행선: 3px, 해당 영역에서만 표시. 필터 갱신 후 중복 없이 재결합.
- 화면 밖·숨김 탭·페이지 이탈에서 모션을 정리하고 동작 줄이기 설정 변경 시 즉시 정적 내용으로 복귀한다.
- 상세 캡처는 전체 보기·원본 크기·닫기를 제공한다. Escape와 초점 복귀를 보장한다.

## Site-wide choreography — Korean desktop

구현 파일은 `src/isos-motion.js/css`, `src/scroll-story.js/css`. 전역 기준은 1060px 이상 국문, 동작 줄이기 미설정이다. 영문·모바일은 확정된 제작 순서에 따라 후속 단계에서 설계한다.

| 장면 | 표현과 목적 |
|---|---|
| 전체 제목 | 단어 마스크로 문장 리듬을 보여준다. 기존 br/em, 실제 원문과 접근성 의미를 보존한다. 55ms 순차 간격은 최대 8단계로 제한한다. |
| 홈 | 기존 맞춤 3D를 유지하고 대표 사례 3개에도 실제 캡처 창 열림을 연결한다. 채널별 타이포그래피 레이어는 원래 위치로 정착한다. |
| 회사소개 | 본문 단어 강조가 읽는 위치를 따라간다. 기본 문장도 충분한 대비를 유지하며 글을 숨기지 않는다. |
| 업무과정 | 좌측의 한 고정 장면과 우측 4개의 원문을 연결한다. 단계에 따라 조형·색·SVG 선이 이어지고 4개 링크로 바로 이동할 수 있다. |
| 서비스·팀 | 사용자가 선택한 패널의 유리층과 선만 순차 전개한다. 제목·설명·산출물·CTA는 선택 즉시 읽힌다. 자동 순환하지 않고 기존 키보드/해시 탐색을 유지한다. |
| 사례 상세 | 제목과 기존 캡처 전개·확대 보기를 연결한다. 캡처 내부 글자는 움직이지 않는다. |
| 상담 | 제목과 선택/입력에만 피드백을 준다. 입력칸 위치와 작성 내용은 그대로 유지한다. |
| 개인정보 | 제목과 읽기 위치만 강화한다. 법적 본문에는 단계적 숨김이나 고정 장면을 적용하지 않는다. |
| 마무리 | 푸터의 초대 문장과 화살표가 함께 나타나고, 포인터/키보드 접근 때 입장 연출을 즉시 끝낸다. |

전체 읽기 진행선은 한 줄만 보인다. 포트폴리오의 별도 선은 전역 진행선이 활성화된 동안 숨긴다. 기존 `[data-reveal]` 및 패널 WAAPI와 신규 모션이 같은 대상에 동시에 적용되지 않도록 소유 범위를 분리한다. 기본 HTML은 JavaScript 없이도 읽을 수 있으며 동작 줄이기·화면 크기 변경·페이지 이탈에서는 감싼 글자와 고정 장면을 원래 구조로 복원한다.

### 페이지별 구성과 즉각적인 응답

국문 PC의 ABOUT은 밝은 2열 제목/소개, PROCESS는 윤곽선 제목과 네 단계 장면, TEAM은 민트 배경의 중앙 타이포그래피, CONTACT는 밝은 2열 진입을 사용한다. 페이지마다 같은 첫 장면을 반복하지 않는다. 이 정적 구성은 동작 줄이기에서도 유지한다.

WORKS 서비스 10개는 의도된 5열×2행으로 정돈한다. TEAM 역할명은 15px이며 각 설명에는 기존 서비스 자료에서 확인한 산출물 세 가지를 연결한다. 선택할 때 본문 opacity를 낮추지 않는다. CONTACT 첨부는 원래 파일 입력의 키보드·선택 동작을 유지하면서 한국어 선택 표현과 실제 파일명을 표시한다. 파일명은 HTML로 해석하지 않는다.

## 사용자 수정 기준 — 이미지의 의미가 우선

2026-10-12 최신 피드백이 위의 과거 모션/조형 지침보다 우선한다. “소비자가 자기네 회사에 도움이 되겠다고 판단”할 수 없는 이미지와 효과는 제외한다. 앞선 90점은 이 기준을 충족했다는 승인으로 취급하지 않는다.

- 국문 본문의 입체 심볼·글라스 아이콘·궤도·거대 장식 단어·채널 슬로건 패널·문의 로고·추상 브랜드 영상은 실제 자료 또는 내용으로 교체했다. 식별을 위한 헤더·푸터 로고와 탐색 화살표는 유지한다.
- 실제 상품 사진, 제조 사진, 제작자 화면, 개발 콘셉트, 자체 원고/소재 예시를 각각 정확하게 표시한다. 실제 수주나 검증된 성과로 오해시키는 수치·인용·고객 로고를 만들지 않는다.
- 히어로는 따뜻한 사진/종이 바탕(#f0ece3), 기존 잉크·민트의 탐색과 연결한다. 화면 캡처는 원본 비율, 사진 크롭은 실제 제품이나 장면의 의미를 보존한다.
- 이미지 원본 크기를 width/height에 기록해 로딩 전후의 비율을 고정한다. 문의 캡처는 DPR2의 실제 빈 폼(1548×2142)이며 두 상세 이미지 모두 확대·원본 보기·Escape·초점 복귀를 제공한다.
- `src/evidence-content.mjs`에서 고객 과제·사례·예시의 관계를 정의하고 `src/evidence.css`로 산출물에 맞는 비율을 부여한다. 모든 것을 같은 카드와 상징으로 바꾸지 않는다.
- `src/evidence-motion.js/css`는 프레임 경계만 짧게 연다. 제목/본문/탭은 움직이지 않는다. 자동 교대가 없으며 reduce/숨김/화면 밖/종료 시 정리한다. 업무과정의 기존 스크롤 연결은 자료의 변화에 사용한다.
- 모바일은 내용 교체에 필요한 기초 배치·깨짐만 확인한다. 영어는 이전 표현을 유지하며 한국어 확정 이후 일괄 반영한다.

참고 20선의 현재 확인 범위와 채택 이유: `docs/agency-reference-decisions.md`. 실제 사진/자료의 출처: `docs/evidence-visual-assets.md`.

## 2026-10-13 — 종합대행사의 사례 편집

사용자가 소적두 소재의 전역 반복을 지적했다. 실사라는 이유만으로 한 업체의 제품·웹·공정을 여러 서비스와 회사 소개에 돌려 쓰지 않는다. 위 10월 12일 소재 선정은 이번 기준으로 대체한다.

- 소적두는 WORKS의 개별 사례 및 해당 상세에만 사용한다. 홈 대표 선정과 전역 비주얼에서 제외한다.
- 첫 화면은 리테일·문화·여행처럼 서로 다른 사업과 작업물이 함께 보여야 한다. 실제 사진, 제작자 웹, 자체 캠페인 콘셉트의 관계를 짧게 표시한다.
- 서비스는 결과물의 형식까지 달라야 한다. 의료 안내물, 제조업 PR 원고, 문화 포스터, 뷰티 브리프, 여행 콘티를 서로 다른 문법으로 구성한다. 같은 상품의 재크롭이나 업종명 교체만으로 다양성을 주장하지 않는다.
- 콘텐츠 역할에는 기관의 활동 편집, 디자인 역할에는 안내물의 정보 위계를 보여준다. 팀 역할별 차이를 자료에서도 설명한다.
- 홈 대표 사례는 국문에서 세 건으로 제한한다. 관리자 featured·순서를 사용하되 자사 리뉴얼은 해당 국문 대표 목록에서 제외한다. 영문 선정 동작은 유지한다.
- `src/agency-composition.css`는 작업 모음 구성, `src/diverse-samples.mjs/css`는 업종별 제안 결과물, `src/data/portfolio-diverse.mjs`는 새 사례의 수행 범위와 상태를 정의한다.
- 내용의 편중은 기능 검사 통과로 해결되지 않는다. 실제 화면의 산업·내용·형식 분포를 별도로 검토한다.

## 2026-10-13 — 반복 축소와 실제 신규 자료

이번 사용자 피드백은 위의 같은 날짜 초기 사례 배치보다 우선한다.

- 큰 하단 초대 문구를 모든 페이지에 반복하지 않는다. 홈만 28–38px 한 줄 CTA를 두고 내부 페이지는 연락처·법적 정보로 축소한다. 국문 전용 스타일로 영문 현행을 보존한다.
- 한 사례의 대표 노출 위치를 먼저 정한다. 홈은 대표 작업, WORKS는 분야별 사례와 전체 아카이브, PROCESS는 단계별 다른 제작 자료를 사용한다. 목록→상세와 업무 범위 확인에 필요한 재사용을 제외하고 반복을 줄인다.
- 홈의 과정 미리보기는 목적 중심으로 유지한다. ABOUT·TEAM의 이미지 제외는 후속 사용자 지시로 폐기했다. 각 페이지의 다른 질문을 설명하는 실제 제작 화면과 사례를 사용하며 장식 아이콘·유리 카드로 빈자리를 채우지 않는다.
- EzyLens는 UI/UX 설계·인터랙티브 시제품이다. 상품 브랜드의 전략·브랜딩 수주로 확대하지 않는다.
- 책은 실제 판형과 원래 비율을 유지하고 표지·내지·도해·실습 페이지를 확대할 수 있게 한다. 저술·편집 범위와 저자 크레디트를 존중한다.
- 운영 대시보드는 문자·수치의 정확도가 우선이다. 생성 편집으로 원문이 바뀌면 채택하지 않는다. 원본 이미지와 CSS 표시 영역으로 브랜드 부분만 제외한다.
- 최신 배치표와 출처는 `qa/refinement-2026-10-13/CONTENT-PLACEMENT.md` 및 같은 폴더의 웹·책 조사 문서에 기록했다.

## 2026-10-13 — 전체 콘텐츠 구도와 숫자 체계

앞선 ABOUT·TEAM 이미지 제외 방침은 폐기한다. `docs/site-content-architecture-2026-10-13.md`의 전체 구도에 따라 실제 제작 사례를 분배하고 의료 커뮤니케이션의 전문 배경을 보강한다. HOME은 강점 요약, ABOUT은 전문 배경과 실제 웹 사례 두 개, PROCESS는 단계별 산출물과 검수·인계, TEAM은 책·브랜드 웹의 역할 연결, CONTACT는 도구·커머스 사례와 의뢰 준비자료를 보여준다. WORKS의 14사례는 보존한다.

의료 분야는 제공 문서 S04 P213–214, S03 P049/P055와 보존된 기존 홈페이지의 파트너 소개를 근거로 한다. 의학전문기자·병원 홍보팀장 출신의 경험은 회사의 전문 배경으로 표현하며, 특정 개인의 경력이나 현재 계약·성과로 확대하지 않는다. 출처는 `qa/refinement-2026-10-13/healthcare-source-audit.md`.

숫자 체계는 위 Foundations의 2026-10-13 기준이 우선한다. `src/design-rhythm.css`가 기존 국문 표현에 최종 적용되며, `src/page-depth/` 세 모듈도 같은 간격·행간을 사용한다. 모듈별 독립 검증은 통합 사이트 검증으로 간주하지 않는다. 통합 근거는 `qa/site-depth-2026-10-13/`에 별도 기록한다.
