# ALL THE COMMUNICATION — 홈페이지 리뉴얼 v3

2026-10-13. 정식 자료 S03/S04를 기준으로 종합광고대행사의 장기 홈페이지를 구현했습니다.

## 현재 작업 원칙

국문 세부 수정에 집중하고, 영문은 국문 확정 후 한 번에 동기화합니다. 현재 영문은 이전 구현 상태입니다. 기준은 `docs/LOCALIZATION_WORKFLOW.md`입니다.

## 확인 주소

- 국문: http://127.0.0.1:4173/
- 영문: http://127.0.0.1:4173/en/
- 관리: http://127.0.0.1:4173/admin/

같은 PC의 로컬 서버 주소입니다. 실제 allthecom.co.kr 운영 서버로 배포한 상태는 아닙니다. 외부 검토용 임시 주소는 아래 Vercel 항목을 참고합니다.

## 실행

Node.js 20 이상에서 실행합니다. 빌드에 npm 의존성이 필요하며, 서버 자체는 Node 표준 라이브러리를 사용합니다.

```sh
npm ci
npm run build
npm start
```

처음 실행하면 `.private/server/local-admin-password.txt`에 무작위 로컬 관리자 비밀번호가 생성됩니다. 비밀번호 값·문의·첨부는 공개 파일이나 소스 배포에 포함하지 않습니다. 자세한 운영 설정과 영속 저장 조건은 `docs/admin-server.md`를 참고합니다.

### 단일 HTML 미리보기

서버 실행 중에 `npm run export:single`을 실행하면 `deliverables/ALL-THE-COMM-ko.html` 한 파일이 생성됩니다. 국문 전체 페이지, 공개된 사례, 이미지·폰트·영상을 내장하며 더블클릭하면 서버 없이 열립니다. 문의 전송·영문·관리자는 제외합니다. 사례 데이터는 실행 중인 서버의 공개 사례를 그대로 사용합니다.

### 임시 공유 주소 (Vercel)

https://wee-hwan.vercel.app/ — 정식 공개 전 검토용입니다. `main`에 푸시하면 Vercel이 `npm run build:static`으로 정적 사본(`static-site/`)을 만들어 자동 배포합니다. 사례는 `.private`가 아니라 검토된 포트폴리오 스크립트로 다시 만들며, 모든 응답에 `X-Robots-Tag: noindex, nofollow`를 붙여 검색에 노출하지 않습니다. 서버가 없으므로 문의 전송과 관리자는 동작하지 않습니다.

## 구현 범위

- KO/EN 주요 페이지 8개씩: HOME / ABOUT / PROCESS / TEAM / WORKS / 프로젝트 상세 / CONTACT / 개인정보. 각 언어 404와 동적 사례 셸을 추가로 생성합니다.
- 상단 5개 메뉴와 별도 상담 CTA. HOME 8개 서비스, WORKS 10개 서비스, TEAM 9개 역할.
- 공식 로고 벡터, 맞춤 글라스 장면과 아이콘, Three.js 입체 심볼, GSAP, 브라우저 View Transitions, 직접 구성한 HyperFrames 8초 브랜드 영상 KO/EN.
- 3D 모듈은 홈에서만 로드합니다. GPU가 없으면 정적 대체 장면, 동작 줄이기 설정과 사용자 일시정지, 화면 밖·숨김 탭에서는 렌더링 중단.
- 국문 PC 전체에 제목 마스크·문장 강조·SVG 전개·대표 사례 프레임·푸터 반응을 연결했습니다. PROCESS는 네 단계의 원문과 하나의 고정 장면을 연결하며, ABOUT·TEAM·CONTACT는 각각 다른 첫 화면 구성을 사용합니다. 서비스·역할 선택의 본문은 즉시 읽힙니다.
- 최신 사용자 피드백에 따라 국문 본문의 추상 3D·글라스 아이콘·장식 단어·브랜드 조형 영상은 실상품/제조 사진, 제작 화면, 구체적인 콘텐츠 예시로 교체했습니다. 위 3D/영상 기술의 설명은 이전 구현 및 유지 중인 영문에 해당합니다. 모션은 실제 자료의 프레임과 읽기/선택에 연결합니다.
- 문의는 관리자 접수함에 실제 저장됩니다. 비공개 첨부, 동의, 입력 검증, 중복 확인, 실패 시 입력 보존이 있습니다. 자동 이메일은 연결하지 않았습니다.
- 관리자 사례 등록·수정·삭제·공개·정렬·대표 노출·이미지 업로드와 한·영 본문. 공개 사례만 목록·상세·이미지·sitemap에 반영합니다.

국문 포트폴리오는 현재 10건입니다. EzyLens 아이웨어 시제품, 도시 산책 전시 콘셉트, 종해문화진흥원 웹, 의료 방문 안내 콘셉트를 추가했습니다. 기존 소적두 콘셉트·SoulReset·Review Atelier·TESIGN Radar·Tesign OS·자사 리뉴얼도 유지합니다. 각 사례의 제작자 프로젝트·자체 콘셉트·프로토타입 상태를 명시하며 외부 고객 수주나 수치 성과로 표시하지 않습니다.

10월 14일 사용자가 제공한 브랜드 의뢰 작업을 추가했습니다. 김부각 브랜딩, 커피 패키지, 아이웨어 캠페인, 마이크로플라스틱 티셔츠, 그래픽 티셔츠, 여성용 오일 캠페인 6건을 새로 넣고, 소적두 사례에 SNS 광고 14종을 더해 ‘소적두 브랜딩’으로 묶었습니다. 고객 요청에 따라 브랜드명은 표기하지 않으며, 원본은 `src/data/portfolio-brand-work.mjs`와 `public/evidence/brand-work/`, 로컬 등록은 `node scripts/publish-brand-work.mjs`입니다.

10월 13일 사용자 지적에 따라 소적두는 WORKS 개별 사례로만 소개합니다. 홈·ABOUT·PROCESS·TEAM·전역 서비스의 식품 소재 반복을 제거하고 다른 업종과 작업물로 교체했습니다. 홈 대표 사례는 리테일·문화·공익의 세 건으로 편집했습니다. 편집 기준은 `docs/diversity-plan-2026-10-13.md`, 자산 근거는 `docs/diverse-assets-2026-10-13.md`입니다.

신규 9건은 국문에만 공개합니다. 관리자 ‘영문에도 공개’가 해제된 사례는 영문 목록·직접 주소·API·sitemap에 포함되지 않습니다. 캡처 출처는 `docs/portfolio-site-sources.md`, `docs/portfolio-saas-sources.md`, `docs/diverse-assets-2026-10-13.md`에 기록했습니다.

## 편집 기준

| 파일 | 역할 |
|---|---|
| design-system/MASTER.md | 색·글자·간격·컴포넌트·모션·품질 기준 |
| planning/2026-10-12/기획서_tree.md | 정식 자료 분석과 정보구조의 근거 |
| src/data/site.mjs | 서비스·과정·역할과 초기 자사 사례 |
| src/data/company.json | 회사 사실·연락처 |
| scripts/build-renewal.mjs | 한·영 페이지 생성 |
| src/styles.css, src/styles-team.css | 반응형 디자인 |
| src/app.js | 탐색·필터·문의 접수 |
| src/data/portfolio.mjs, scripts/import-portfolio.mjs | 검토한 국문 사례와 로컬 관리자 API 등록 |
| src/portfolio.css, src/portfolio-motion.js, src/portfolio-motion.css | 실제 캡처 구성·확대 보기·국문 PC 모션 |
| src/motion.js, src/brand-scene.js | GSAP와 필요할 때 로드하는 3D |
| src/isos-motion.js/css, src/scroll-story.js/css | 국문 PC 전역 모션·페이지별 구성·업무과정 장면 |
| src/evidence-content.mjs, src/evidence.css | 고객 과제·실제 자료·자체 예시 중심의 국문 콘텐츠와 구성 |
| src/evidence-motion.js/css | 실제 이미지의 프레임 전개와 안전한 종료/복원 |
| src/agency-composition.css, src/diverse-samples.mjs/css | 다업종 작업 모음과 서로 다른 형식의 제안 결과물 |
| src/data/portfolio-diverse.mjs | 리테일·문화·기관·의료 신규 사례와 수행 범위 |
| src/story/ (home-story.mjs, story.js, story.css, showcase.mjs, sample-cases.mjs) | 국문 HOME 스크롤 스토리·3D 작업물 회랑. 더미·교체 목록은 docs/home-story-2026-10-13.md |
| src/story/pages.mjs, sub.css, sub.js | 국문 ABOUT·PROCESS·TEAM·WORKS·CONTACT. 구성과 판단 문구는 docs/subpages-2026-10-14.md |
| src/story/frames.css | 작업 캡처 프레젠테이션 보드(WORKS 목록·사례 표지·서비스 시각물) |
| docs/agency-reference-decisions.md, docs/evidence-visual-assets.md | 20개 참고 사이트 확인 범위와 이미지 출처 |
| motion/ | 직접 제작한 HyperFrames 소스와 영상 검수 기록 |
| scripts/server.mjs, src/admin/ | API·영속 저장·관리 화면 |
| qa/HANDOFF.md | 최종 검증과 실제 운영 전 확인 사항 |

`dist`는 생성 결과이므로 직접 수정하지 않습니다. 데이터 폴더 최초 생성 시에만 `src/data/content.json`을 시드로 읽습니다. 이미 접수한 데이터·등록한 사례는 빌드가 덮어쓰지 않습니다. 이후 사례 편집은 관리자에서 수행합니다.

새 로컬 데이터 저장소에 제작자 프로젝트·자체 콘셉트 9개를 넣으려면 서버 실행 후 `npm run portfolio:import`를 실행합니다. 동일 slug의 기존 사례는 유지합니다. `-- --refresh-copy` 옵션은 10월 12일 등록 출처 표시가 있는 기존 5개 사례의 설명 본문만 소스와 동기화하므로 관리자에서 수정한 문구가 있으면 사용하지 않습니다. 이번 기존 저장소에는 `node scripts/publish-diverse-portfolio.mjs`로 신규 4건·대표 여부·순서를 반영했습니다. 사용자 문의와 원본 프로젝트는 수정하지 않습니다.

## 서버 없이 전체 화면 확인 (한 파일 미리보기)

배포 없이 모든 메뉴를 눌러 볼 수 있는 HTML 한 파일을 만듭니다. 사례 데이터를 등록한 로컬 서버가 실행 중이어야 합니다.

```sh
PREVIEW_URL=http://127.0.0.1:4183 npm run preview:build    # → dist-preview/site-preview.html
npm run test:preview -- dist-preview/site-preview.html     # Playwright 검수
```

- 국문·영문의 주요 페이지와 사례 상세, 404를 모두 담습니다.
- 위쪽 도구 막대에서 메뉴를 바꾸고, PC·노트북·모바일 크기를 고르고, 앞뒤로 이동할 수 있습니다.
- 전체 페이지 목록에는 확인한 페이지가 표시됩니다.
- 문의서는 실제로 전송·저장되지 않습니다. 영상은 대표 이미지로 보입니다.



브라우저 검사는 별도 DATA_DIR와 4183 포트로 서버를 실행합니다. 사용자 미리보기 4173에는 합성 문의를 보내지 않습니다.

```sh
npm test
npm run test:story
npm run test:pages
npm run test:server
npm run test:motion
node tests/full-flow.cjs
node tests/performance.cjs
npm run test:portfolio
npm run test:isos
npm run test:isos:polish
npm run test:evidence
npm run test:diversity
```

`npm test`는 4183 서버가 필요합니다. 서버·full-flow 검사는 자체 격리 서버를 사용합니다. 모션 검사는 4173에서 읽기 검사를 합니다. 결과 파일의 실제 통과 수를 기준으로 하며, 과거 346개 검사를 이번 버전의 검증으로 재사용하지 않습니다. 내부 디자인 점수는 외부 심사나 수상 수준 인증이 아닙니다.

`test:portfolio`는 4173 국문 PC의 읽기 전용 검사입니다. 2026-10-12 최종 실행에서 Chromium·Firefox·WebKit의 필터·상세·이미지 확대·키보드 복귀·캡처 비율과 영문 비공개 조건 등 140항목을 통과했습니다. `qa/portfolio-2026-10-12/results.json` 참조.

`test:isos`는 4173 국문 PC 8개 화면의 전역 모션과 탐색을 Chromium·Firefox·WebKit에서 확인합니다. 2026-10-12 통합 검사 413개 통과, 런타임 오류·쓰기 요청 시도 0건. 첫 Firefox 실행의 sandbox 시작 오류와 승인된 재실행 기록은 `qa/isos-2026-10-12/final/`에 함께 보존했습니다. 시각 평가는 `qa/isos-2026-10-12/visual-final/REVIEW.md`로 별도 기록합니다. 모바일·영문은 새 효과의 제외 조건만 확인했고 해당 단계의 완성을 뜻하지 않습니다.

시각 검수 후 마지막 세 가지 수정은 `test:isos:polish`로 별도 검증했습니다. 3브라우저 179/179 통과: 서비스·TEAM 선택 즉시 읽기, 1060/1440px WORKS 탭 배열과 키보드, 한국어 첨부 표시·안전한 파일명·선택/초기화/초점·파일 선택창. `qa/isos-2026-10-12/final/polish-results.json` 참조. 원래 413개 결과와 마지막 변경분의 증거를 구분해 보존합니다.

10월 12일 자료·이미지 교체의 검증은 `qa/evidence-2026-10-12/final/results.json`입니다. 당시 전체 검사 후 변경한 경로를 다시 확인한 통합 기록으로 601/601 통과, Chromium·Firefox·WebKit 국문 9경로씩 27페이지, 런타임 오류·쓰기 시도 0건입니다. 각 원본과 결합 기준은 같은 폴더 `README.md`에 보존합니다. 이 기록과 과거 413/179 검사는 이번 다업종 개편의 검증 수에 합치지 않습니다.

10월 13일 다업종 편집은 `npm run test:diversity`로 확인합니다. 현재 히어로의 여러 이미지, 소적두 전역 제외, 국문 대표 세 건, 업종별 서비스 결과물, 새 사례의 구분, 탭·키보드·이미지·넘침을 확인합니다. `test:evidence`의 옛 기대 문구는 변경 전 버전의 재현용입니다. 최신 증빙은 `qa/diversity-2026-10-13/`이며, 모듈 단독 증거는 `qa/diverse-2026-10-13/samples/`로 구분합니다.

이번 결과는 3브라우저 기본 회귀 548/548, 신규 4사례 상세·확대·상담 연결 50/50, HTTP 31/31, 마지막 이미지 비율 14/14입니다. 각 결과를 별도 파일로 보존했으며 런타임 오류·상담/쓰기 시도는 0건입니다. 시각 검수는 44화면을 별도로 확인했습니다. 기존 소적두 사례는 WORKS 목록에서 한 건으로 남고, 홈과 전역 자료에는 등장하지 않습니다.

10월 12일 실제 화면 모션은 별도 114/114, 당시 히어로 3장면의 높이·캡션 보완은 56/56을 통과했습니다. 시각 검수는 `qa/evidence-2026-10-12/visual/REVIEW.md`, 참고 20선의 확인 범위와 채택 원칙은 `docs/agency-reference-decisions.md`입니다. 테스트 통과를 목표 디자인 점수 90점이나 사용자 승인으로 바꾸지 않습니다. 국문 모바일 전체 고도화와 영문 동기화는 이후 순서입니다.

## 운영 반영

정적 dist 폴더만 업로드하면 관리자·문의 접수가 동작하지 않습니다. Node 프로세스와 영속 DATA_DIR, HTTPS 역방향 프록시가 필요합니다. `ADMIN_PASSWORD`는 최소 16자 비밀 설정, `PUBLIC_ORIGIN`은 실제 HTTPS 주소로 지정합니다. 기존 사이트·DB·DNS를 임의로 덮어쓰지 않습니다.

실제 운영 호스팅·도메인·회사의 관리자 계정·문의 확인 절차·백업·개인정보 보관 및 삭제 주기를 확정한 후 운영 환경에서 별도 검수해야 합니다. 로컬 문의 수신 검증은 실제 이메일 수신 또는 운영 배포의 증거가 아닙니다.
