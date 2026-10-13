# ALL THE COMMUNICATION — Design system 3.0

2026-10-12 · 정식 자료 S03/S04와 사용자 피드백을 반영한 구현 기준.

## Identity

종합광고대행사. 병원 경험은 역량 중 하나다. 고객 사례·수치·인력은 만들어내지 않는다. 브랜드 원본은 수신 AI의 민트 시그니처. 겹친 곡선과 일정한 간격을 공간·빛·프레임으로 확장하되 로고 비율은 보존한다.

기성 템플릿, 번호와 가로선으로 나열한 서비스 목록, 모든 섹션에 반복하는 카드, 범용 아이콘 팩, 허위 실적 타일을 쓰지 않는다. ui-ux-pro-max의 자동 팔레트·Bento 추천은 이 프로젝트의 직접 피드백과 다르므로 채택하지 않는다. 접근성·반응형·모션 정리 규칙만 적용한다.

## Foundations

- Ink #061C25, deeper #031218, mint #59E3C6, ice #C9F2EF, paper #F3F6F3, white #FFFFFF.
- Ink surface text #EFF8F5, muted #A6C5C5. Paper text #092A31, muted #526A6D.
- Brand colors are web application choices derived from the supplied mint logo, not a claim of official brand-guide HEX values.
- Pretendard Variable: Korean; Manrope: Latin. Self-hosted. Body 16–18px, line-height 1.65; Korean titles keep-all, deliberate responsive line breaks. Titles clamp 42–100px.
- Content width 1440px; gutters clamp(22px,4.5vw,80px). Desktop 12 columns, tablet 8, mobile 4. Section spacing clamp(88px,9vw,160px).
- Control radius 999px; input 12px; selected glass surface 24–36px. Not every block uses a surface.
- Focus ring mint on ink, deep teal on paper. Interactive targets ≥44px.

## Compositions

1. Hero: restrained type on ink, custom illuminated interlocking arch sculpture. Message and actions always in HTML. Motion never gates reading.
2. Services: one large glass stage with selectable capabilities and bespoke SVG motion. Eight homepage summaries, ten WORKS services. No report rows.
3. Work: screenshot-led gallery with a full-width lead and two-column supporting works. Creator projects, prototypes, concepts and the agency self-project retain explicit classifications. Show actual captured interfaces at their original proportions; use the full-size viewer for reading detail. Never present creator work as an unverified agency client commission.
4. Process: four deliberate chapters / selectable stage with meaningful outputs. Mobile flows vertically.
5. About / Team: typographic editorial composition, role selection, no stock portraits or invented departments.
6. Contact: clearly labeled form, service multi-selection, visible consent, real durable inbox receipt.

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
