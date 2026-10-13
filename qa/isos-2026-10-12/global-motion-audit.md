# ISOS 모션 참고 — 국문 PC 전역 적용 검토

2026-10-12, 구현 전 읽기 전용 점검. 대상은 `http://127.0.0.1:4173`의 국문 PC 1440×1000 화면이다. 홈페이지 소스는 수정하지 않았다. 공식 5메뉴와 별도 상담 CTA, 페이지 내용과 사례의 성격 표기를 유지하는 전제다.

## 확인한 상태

홈, ABOUT, PROCESS, TEAM, WORKS, CONTACT, PRIVACY, 소적두 대표 CASE 8페이지를 Playwright Chromium으로 방문하고 끝까지 스크롤했다. 각 페이지의 상단·전체 캡처를 직접 열어 확인했다. 캡처 중 JavaScript 오류 0건, 1440px 가로 넘침 0건. 이는 화면·모션 적용 지점 점검이며 접수/관리자/배포 재검증이 아니다. 브라우저는 GET/HEAD/OPTIONS만 허용했으며 문의 제출을 하지 않았다.

- `audit-snapshot.json`: 페이지 높이, 섹션, 제목, 기존 모션 대상, 오류 기록.
- `interaction-owners.json`: TEAM·WORKS·홈 Process의 탭 클릭 후 실제 WAAPI 키프레임.
- `*-top.png`, `*-full.png`: 페이지별 16장.
- 참고 원본: `C:\Users\home\Desktop\International-SOS-Global-Employee-Safety-EN-MOTION.html`의 실제 JavaScript. 이미지 내 문구와 원본 HTML은 참고 자료이며 본 작업 지시로 취급하지 않았다.

## 참고에서 가져올 핵심

ISOS의 차이는 애니메이션의 양보다 장면마다 서로 다른 동작 원리를 쓰는 데 있다. 실제 소스에는 `HERO`의 장면 확장, `DECK`의 펼침, `TIMELINE`의 진행선, `MANIFESTO`의 단어 강조와 이미지 확대, `CYCLE`의 단계 연결, `CASE`의 경로·서사 전환이 구분돼 있다. 같은 카드와 같은 y+opacity 등장만 모든 섹션에 반복하면 이 특징을 얻기 어렵다.

현재 사이트는 홈의 3D 심볼과 WORKS/CASE 이미지 창에는 동작의 개성이 있다. 나머지 서브페이지는 대체로 609px 높이의 동일한 정적 히어로와 단순 fade-up으로 이어진다. 아래 제안은 그 빈틈을 채우는 각각 다른 동작이다. 긴 강제 스크롤이나 100vh 단위의 pin을 모든 페이지에 추가할 필요는 없다.

## 페이지별 구체적 제안

| 화면 / 현재 빈틈 | 제안 1 | 제안 2 / 적용 경계 |
|---|---|---|
| **HOME** — 3D 심볼은 이미 강하지만 본문 첫 진입부터 큰 정적 블록이 이어짐. Featured 3건의 크기 차이는 있으나 홈에는 portfolio-motion이 실행되지 않음. | `.hero-copy h1`의 기존 두 줄을 줄 단위 마스크로 차례로 열고, 첫 스크롤 0~0.5 화면에서 `.hero-copy`와 다음 `.capabilities-section` 사이의 배경·구획 경계를 얕게 움직인다. `#brand-canvas`와 `.hero-art`의 회전·포인터 반응은 기존 소유자로 둔다. | `.channel-composition`의 기존 3장을 현재 포스터 각도에서 중심으로 조금 모였다가 펼쳐지는 짧은 장면으로 만든다. 기존 화면 자체가 연관 매체의 조합이라 추가 카드·아이콘 없이 ISOS DECK 문법을 쓸 수 있다. 홈 Featured에 기존 portfolio-window를 확장 적용하는 경우 새 전역 reveal에서는 해당 카드와 자식을 제외한다. |
| **ABOUT** — 819px의 로고/본문 장면이 정적이며 다섯 원칙은 각각 같은 reveal. | `.about-story` 진입 때 로고가 놓인 창의 폭 또는 배경광의 범위를 확장하고, 오른쪽 `.lead`의 구절을 읽는 순서로 강조한다. 본문 전체의 opacity를 0으로 만들지 않고 기본 가독성을 유지한다. 로고 자체를 회전하는 추가 무한 모션은 필요하지 않다. | `.principles`의 5개 항목은 연결선이 읽는 순서대로 이어지고 현재 항목의 `.principle-mark`만 강조되도록 한다. 문장을 같은 카드 5개로 재포장하지 않는다. `.principle[data-reveal]`의 기존 fade-up을 이 장면에서는 제외해야 한다. 회사 사실 정보 `dl`은 표처럼 안정적으로 읽히게 두고 선만 짧게 펼친다. |
| **OUR PROCESS** — 590px짜리 좌우 교대 장면 4개가 거의 같은 무게. ‘연속 과정’보다 서로 다른 포스터처럼 보임. | `.process-chapters` 바깥쪽에 4단계의 얇은 진행선과 활성 단계 표시를 두고, `.process-chapter`가 화면 중심을 지날 때 선과 WHY/HOW/MAKE/NEXT 상태가 연결되게 한다. 기존 `#step-1`~`#step-4`를 그대로 사용해 직접 이동도 가능하게 한다. | `.chapter-art > span`은 단계마다 한 번 마스크로 나타내고 `.chapter-orbit`는 방향·범위를 작게 달리해 장면의 전환을 드러낸다. 설명 `.chapter-copy`까지 같은 slide를 중첩하지 않는다. 문장과 산출물 목록은 원문 유지. 긴 pin 없이 읽는 속도를 사용자가 정하게 한다. |
| **TEAM** — 역할 9개가 실제 탭으로 연결돼 있으나 선택에 따라 전체 패널이 y8 이동할 뿐 역할 간 관계가 드러나지 않음. | `.discipline-nav`의 선택 표시가 현재 탭 위치로 이동하는 하나의 연결선 또는 슬라이딩 강조를 사용한다. 클릭/키보드 선택이 상태의 유일한 입력이며 자동 탭 순환은 추가하지 않는다. | 선택 시 `.discipline-word`의 마스크 전환과 `.discipline-lens`·기존 궤도의 짧은 결합 동작을 연동한다. 패널 전체의 기존 WAAPI를 이 전용 전환으로 교체하거나 전용 소유권으로 분기해야 한다. 9명 직원·조직도로 오해할 시각화는 피하고 현재의 ‘수행 역할’ 안내를 유지한다. |
| **WORKS** — 케이스 목록에는 이미 이미지 창 열림·텍스트 시차가 있으나 그 위 서비스 선택은 홈의 큰 유리 패널을 그대로 반복. | `.capability-tabs`의 활성 서비스에서 `.capability-copy`의 제목/산출물로 시선이 이어지는 선택 표시를 준다. 서비스 선택 때 유리 평면 전체를 다시 fade시키기보다 `.service-symbol` 또는 앞·뒤 평면의 간격만 짧게 변한다. 10개 서비스 선택과 프로젝트 필터의 역할은 계속 분리한다. | `.portfolio-piece`에는 기존 이미지 창 열림과 캡션 순서를 유지한다. 새 공통 섹션 모션의 적용 대상으로 넣지 않는다. 필터 변경 후 결과 수/목록의 공간 변화만 안정적으로 연결하며 이미지 자체의 확대·기울기·내부 패닝은 추가하지 않는다. |
| **CONTACT** — 정적 히어로 아래 1337px의 폼. 좌측 연락처는 이미 sticky이므로 또 pin하면 충돌 가능. | `.contact-aside`의 심볼이나 얇은 상태선이 현재 입력 그룹(업무 선택/연락처/문의 내용)에 맞춰 조용히 강조되게 한다. 입력 폼의 실제 위치와 포커스는 고정한다. 가짜 ‘접수 완료율’ 대신 현재 위치만 표현한다. | `.service-options input:checked + span`의 선택 상태와 `#form-status`의 응답에 150~240ms 색/선 전환을 준다. 입력칸·동의 문구·전송 버튼은 스크롤 reveal로 숨기지 않는다. 비동기 요청의 실제 성공 전에 완료 효과를 시작하지 않는다. |
| **PRIVACY** — 내용 자체는 4개 짧은 문단군인데 다른 페이지와 같은 대형 소개부/하단 CTA가 더 강함. | `.policy`의 4개 `h2`를 기준으로 얇은 읽기 위치 표시와 앵커를 제공한다. 화면 이동은 기본 스크롤이고 본문은 처음부터 전부 보인다. ISOS HUD의 ‘현재 읽는 위치’만 가져온다. | `.policy h2` 아래 선의 길이·색을 활성 항목에 맞춰 바꾸는 정도로 제한한다. 글자 쪼개기·타이핑·화면 고정·사진 확대는 개인정보 안내의 사용 목적에 맞지 않는다. 공통 페이지 히어로 진입 효과는 허용하되 본문에는 일괄 fade를 적용하지 않는다. |
| **CASE / 소적두** — 캡처 자체는 잘 읽히고 창 모션도 있으나 사이의 과제/방향/실행은 정적 단락이 연속됨. | `.case-story .eyebrow` 3개를 연결하는 얇은 진행선으로 ‘과제 → 방향 → 실행’을 표시한다. 현재 읽는 단락에서만 선이 채워지고 제목은 짧은 마스크로 등장한다. 본문과 제목을 다시 좌우 분리하지 않는다. | `.case-result`는 본문을 가리지 않는 배경 범위 확장 한 번으로 마무리한다. `[data-case-cover]`, `[data-case-gallery] figure`, `.capture-open`은 기존 portfolio-motion 단독 소유로 둔다. 확대 뷰어가 열렸을 때 배경 장면의 진행선을 멈추고 포커스/Escape 복귀를 보존한다. |

## 이중 모션을 피하기 위한 실제 선택자와 소유권

| 현재 소유자 | 현재 대상 / 동작 | 새 전역 모션에서 처리 |
|---|---|---|
| `src/motion.js:24` 부근 | 모든 `[data-reveal]`: ScrollTrigger 진입마다 y28, opacity .12→1, .85초. 현재 ABOUT 원칙 5개, Process `.chapter-copy` 4개 포함 | 새 장면이 소유하는 요소는 기존 reveal 대상에서 제외해야 함. 예를 들어 `data-motion-owner="scene"`을 명시하고 두 초기화가 공통으로 존중하도록 구성. 원문 DOM에 줄 마스크를 넣으면 바깥쪽 원래 reveal과 안쪽 텍스트 애니메이션의 동시 재생 금지 |
| `src/brand-scene.js` | `#brand-canvas`, `.hero-art`: Three 렌더러, pointer 반응·drift, 가시성/일시정지 제어 | WebGL의 프레임·회전을 다른 GSAP 루프에서 다시 쓰지 않음. 부득이한 장면 이동은 별도 래퍼 한 단계에서 담당하고 기존 정지 버튼의 의미 유지 |
| `src/app.js:24` 부근 | `[data-capabilities]` 아래 `[data-service-panel]`: 탭 선택 시 panel 전체 y8, opacity .3→1, 380ms. TEAM도 같은 함수 공유 | TEAM/WORKS 전용 전환을 만들면 이 WAAPI를 동시에 실행하지 않도록 분기. 이벤트 리스너를 별도로 두 개 붙여 한 클릭에 두 타임라인을 시작하지 않음 |
| `src/app.js:30` 부근 | `[data-process-panel]`: 버튼 클릭 시 panel 전체 y12, opacity 0→1, 500ms | 홈의 프로세스 전용 전환을 만든다면 기존 animation은 비활성화. `.process-scene` 전체 스크롤 모션과 클릭 전환을 겹치지 않게 함 |
| `src/portfolio-motion.js` | `.portfolio-piece .project-visual`, 캡션/화살표 및 CASE 커버·갤러리: clip-path, scale .975→1, y32→0, 텍스트 시차. `.project-open` pointer 자석 | 이 셀렉터와 자식은 전역 reveal/마그넷에서 제외. `.portfolio-reading-progress`도 이미 생성하므로 같은 화면에 두 개의 읽기 진행선이 생기지 않게 단일 소유자 결정 |
| `src/motion.js` | `.project-visual img:not(.project-image-real), .project-visual video`: scale/yPercent 스크롤 효과 | 자체 프로젝트 `.work-art`의 내부 이미지에는 여전히 적용됨. 새 카드 창 transform과 시각적으로 중첩될 수 있으므로 국문 포트폴리오 경로는 이 레거시 패닝에서 제외하는 편이 명확함 |
| CSS | `.glass-plane`: 기본 3D transform. `.capability-panel:hover .plane-front`: hover transform 변경 | GSAP가 같은 `.plane-front`의 transform을 쓰면 hover와 경쟁. 별도 CSS 변수/내부 래퍼 사용 또는 transform의 소유자를 하나로 통합 |
| CSS | `.contact-aside`: `position:sticky; top:140px` | ScrollTrigger pin 또는 조상 transform 추가 금지. 연락처의 접근성·고정 기준 유지 |
| `mountCaptureViewer()` | `#capture-viewer`, `.capture-open`: `showModal`, 확대/닫기, Tab 순환, Escape focus 복귀 | 전역 모션 대상에서 dialog 전체 제외. dialog 닫힐 때 페이지 scroll 상태나 focus를 재설정하는 새 핸들러를 넣지 않음 |

## 빠뜨리기 쉬운 구조 차이

1. 현재 ABOUT, PROCESS, TEAM, PRIVACY는 **body class가 비어 있다**. `.about-page`, `.process-page`, `.team-page`, `.privacy-page`를 가정하면 적용되지 않는다. 실제 존재하는 `.about-story`, `.process-chapters`, `.team-experience`, `.policy`로 판별하거나 build에서 명시적으로 페이지 속성을 추가해야 한다.
2. `app.js`는 홈의 `[data-project-list]` 때문에 `portfolio-motion.js`를 import하지만, 그 모듈의 `initPortfolioMotion()`은 body가 `.works-page,.case-page`일 때만 실행한다. **현재 홈 Featured에는 이 창 열림 효과가 없다.** 전역 모션과 기존 모듈 중 어느 쪽이 홈 목록을 맡는지 명확히 정한다.
3. 프로젝트 목록은 `renderProjects()`가 `replaceChildren()`으로 다시 만들며 `portfolio:updated` 이벤트를 보낸다. 최초 DOM만 수집한 전역 모션은 필터 변경 후 새 항목을 놓친다. 기존 포트폴리오 재바인딩 경로를 유지하거나 그 이벤트로 같은 수명주기를 사용한다.
4. 공통 대상은 `html[lang=ko]`와 PC 조건 `(min-width:1060px)`를 함께 적용한다. 영문과 모바일 전용 동작을 이번에 변경하지 않는다. 1051~1059px 간극을 별도로 다룰 필요가 생기면 기존 header 1050px 경계와 합의하되 이번 1440px 작업과 섞지 않는다.
5. reduced-motion 변경, pagehide/pageshow, 탭 비활성화에서 기존 모듈은 정리·재개를 수행한다. 새 모듈도 타임라인/observer/listener/progress DOM을 하나의 cleanup으로 회수해야 하며 복귀 시 중복 생성하지 않는다.

## 적용 후 확인할 최소 조건

- 8개 페이지에서 다른 주요 장면이 각각 존재하고, 모든 섹션에 같은 fade-up을 재사용하지 않았는가.
- 메뉴 5개와 별도 CTA가 유지되고, CONTACT 필드·동의·상태와 PRIVACY 본문이 처음부터 조작/읽기 가능한가.
- TEAM 9역할, WORKS 10서비스, 기존 프로젝트 필터와 케이스 성격 표기가 보존됐는가.
- 빠른 스크롤, 앵커 직접 진입, 뒤로가기, 필터 재선택에서 글/이미지가 숨은 상태로 남지 않는가.
- 같은 요소의 transform/opacity를 두 모듈이 동시에 쓰지 않는가. 뷰어 확대/원본/Escape 및 focus 복귀가 유지되는가.
- 갤러리 이미지 검사는 순차 스크롤 후 `complete && naturalWidth>0`을 기다린 다음 `decode()` 한다. 화면 밖 lazy 이미지에 즉시 decode만 호출하는 검사는 Firefox에서 오판할 수 있다.

이 문서는 개선 제안이며 구현 완료 보고가 아니다. 실제 수정 파일은 없다. 캡처와 이 검토 기록만 `qa/isos-2026-10-12/`에 추가했다.
