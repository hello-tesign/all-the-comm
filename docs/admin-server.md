# 홈페이지 서버와 운영 화면

2026-10-12 구현. 문의는 이 서버의 비공개 접수함에 실제 저장된다. 이메일 자동 발송은 구현·연결하지 않았으며, 접수 완료가 이메일 수신 완료를 의미하지 않는다. `/admin/`에서 접수 내용을 확인한다.

## 실행과 데이터

Node.js 20 이상. 외부 런타임 패키지 없이 실행한다.

```sh
node scripts/build.mjs
node scripts/server.mjs
```

기본 주소는 `http://127.0.0.1:4173/`, 관리 화면은 `/admin/`이다. 기본 데이터 폴더는 `.private/server`이며 공개 정적 파일인 `dist`와 분리돼 있다. 폴더에는 문의 원문·첨부·사례·로컬 관리자 비밀번호가 포함되므로 Git, 일반 소스 ZIP, 공개 호스팅 파일 목록에 포함하지 않는다.

| 환경변수 | 기본값·용도 |
|---|---|
| PORT | 4173. 테스트는 4183/4184 |
| HOST | 127.0.0.1. 기본 실행은 같은 PC에서만 접속 가능 |
| DATA_DIR | `.private/server`의 절대 경로. 운영 시 영속 저장 볼륨 지정 |
| ADMIN_PASSWORD | 관리자 비밀번호, 최소 16자. 운영 환경의 비밀 설정으로 제공 |
| PUBLIC_ORIGIN | 외부 운영 주소. 예: `https://allthecom.co.kr` |
| PROJECT_SEED_FILE | 기본 `src/data/content.json`. 데이터 폴더가 처음 생성될 때 자사 사례 1건만 초기 등록 |

로컬에서 ADMIN_PASSWORD가 없으면 무작위 비밀번호를 생성해 데이터 폴더의 `local-admin-password.txt`에 보관한다. 콘솔에는 파일 경로만 안내하고 비밀번호를 출력하지 않는다. 관리 화면도 비밀번호를 노출하지 않는다. 운영에서는 환경변수 비밀번호를 설정하고 운영체제의 접근 권한으로 데이터 폴더를 제한한다. Windows에서는 POSIX 파일 mode가 NTFS 사용자 권한 설정을 대신하지 않는다.

공개 인터페이스에 바인딩하려면 16자 이상의 ADMIN_PASSWORD와 HTTPS PUBLIC_ORIGIN이 필요하다. 서버 자체는 HTTP를 제공하므로 앞단에서 HTTPS를 종료하는 역방향 프록시를 사용한다. 프록시는 원래 Host 헤더를 보존해야 한다. 설정한 운영 주소 이외의 Host·Origin은 거절한다. 요청 본문 한도는 15MB이며 프록시 한도도 이를 고려해야 한다.

서버는 **데이터 폴더당 프로세스 1개**를 전제로 한다. 잠금 파일로 동시 사용을 차단하며 JSON 전체 쓰기를 순서대로 처리한다. 임시 파일을 동기화한 뒤 이름을 변경해 확정한다. 첨부도 저장된 뒤에 접수 기록을 확정한다. 서버 재시작 후 문의와 사례가 유지되는 흐름을 검증했다. 기존 데이터가 손상되면 덮어쓰지 않고 시작을 중단한다.

서버리스 함수의 임시 파일 시스템이나 컨테이너의 비영속 경로에 DATA_DIR를 두면 안 된다. 다중 서버·다중 작성자로 확대할 때는 트랜잭션 데이터베이스·공유 파일 저장소·공유 세션/제한 저장소로 변경해야 한다.

## 관리자 사용 순서

1. `/admin/`에서 지정된 비밀번호로 로그인한다.
2. 문의 접수함에서 상세·첨부를 확인하고 `새 문의 / 진행 중 / 처리 완료` 상태를 변경한다.
3. 프로젝트에서 새 사례를 등록한다. 초안은 제목과 주소만으로 저장할 수 있다.
4. 고객명·수행 범위·과제·전략·실행·결과·수행 분야를 채우고 이미지를 등록한다.
5. 이미지 설명과 캡션을 쓰고 대표 이미지를 선택한다. 원본 공개 권한을 확인한 뒤 공개 확인에 체크한다.
6. 공개 상태를 변경하고 저장한다. 홈페이지의 프로젝트 API와 목록·상세에 즉시 반영된다. 순서는 위/아래 버튼으로 변경한다.

프로젝트를 비공개로 바꾸면 공개 API·직접 프로젝트 주소·업로드 이미지 접근에서 함께 제외된다. `/index.html` 직접 주소와 대소문자·중복 슬래시 변형도 같은 공개 검사를 적용한다. 공용 상세 템플릿은 프로젝트 식별자 없이 공개하지 않는다. 삭제하면 데이터 목록과 공개 페이지에서 제외된다. 삭제된 사례의 이미지 파일은 복구·보관 검토를 위해 저장 폴더에 남으며 외부에서는 접근할 수 없다. 파일 삭제와 개인정보 보관·파기 주기는 회사 운영 기준에 맞춰 별도로 수행한다.

비공개 사례 이미지의 관리자 미리보기는 로그인 세션이 있어야 열린다. 프로젝트 이미지는 PNG/JPG/WebP, 파일당 3MB, 사례당 20개까지 등록한다. 대표 이미지는 업로드 이미지 또는 공개 권한이 확인된 HTTPS/사이트 내부 주소를 지정할 수 있다. 임의 HTML·스크립트·SVG 업로드는 허용하지 않는다.

초기 공개 사례는 회사가 실제 제작한 자사 리뉴얼이다. 외부 고객·성과를 자동 생성하지 않는다. 영문 제목·요약·고객명·유형·업종·수행 범위·과제·전략·실행·결과를 직접 입력할 수 있다. 영어 자동 번역은 하지 않는다. 비어 있는 항목은 국문 원문으로 표시되므로 영문 공개 전 작성·검토가 필요하다.

## API 규약

### 문의

`GET /api/services`는 10개 서비스와 other, 첨부 제한을 반환한다.

허용 서비스 ID는 `strategy, digital, content, video, media, influencer, hospital, consulting, it, pr, other`이다.

`POST /api/inquiries`는 JSON과 같은 사이트의 Origin이 필요하다.

```json
{
  "company": "회사명",
  "name": "담당자명",
  "phone": "010-0000-0000",
  "email": "name@example.com",
  "services": ["strategy", "it"],
  "message": "현재 상황과 필요한 업무를 10자 이상 입력합니다.",
  "consent": true,
  "budget": "선택",
  "schedule": "선택",
  "locale": "ko",
  "website": "",
  "submissionKey": "브라우저에서_생성한_고유_UUID",
  "attachments": [
    {"name": "brief.pdf", "type": "application/pdf", "dataBase64": "BASE64_BYTES"}
  ]
}
```

company/name/phone/email/services/message/consent/submissionKey는 필수다. `locale`은 ko/en이며 생략 시 ko. `website`는 스팸 확인용 빈 필드다. 파일은 PDF/JPG/PNG만, 최대 3개·각각 3MB다. 파일 이름의 확장자·선언 MIME·실제 파일 서명을 함께 검사한다. 파일 전체 악성코드 검사나 콘텐츠 무해화를 제공하는 것은 아니므로 관리자도 출처를 확인하고 다운로드 파일을 열어야 한다.

성공은 `201 {ok:true,id,receivedAt,duplicate:false,delivery:"administrator-inbox"}`다. 동일 요청의 재시도는 같은 접수 번호로 `200`을 반환한다. 같은 키의 다른 내용은 409. 최근 동일 내용의 중복 접수도 줄인다. 제출 성공 뒤에만 새 submissionKey로 교체한다. 실패하면 원래 입력을 유지하고 같은 요청 키로 재시도한다.

오류는 `{ok:false,error,fields:{fieldName:"설명"}}`이다. 입력 오류 422, 권한/출처 오류 403, 너무 큰 요청 413, 속도 제한 429, 저장 오류 500을 구분한다. 성공 응답 전에 저장을 확정하며, 이메일 발송 성공처럼 안내하지 않는다.

현재 속도 제한은 연결된 IP별 시도 20회/15분, 새 문의 5회/15분이다. 프록시를 거치면 서버가 보는 프록시 IP가 기준이므로 공개 운영 환경에서 실제 사용자 IP 전달 정책과 제한 수치를 함께 조정해야 한다. 임의의 X-Forwarded-For를 기본으로 신뢰하지 않는다.

### 공개 프로젝트

- `GET /api/projects` → `{projects:[...]}`, 공개 순서대로 반환.
- `GET /api/projects/{slug}` → `{project:{...}}`. 비공개·존재하지 않는 사례는 404.
- 공통 필드: `id, slug, title, titleEn, summary, summaryEn, client, clientEn, type, typeEn, year, period, industry, industryEn, services[], scope, scopeEn, problem, problemEn, strategy, strategyEn, decision, execution, executionEn, result, resultEn, featured, order, coverImage, cover, images[], videoUrls[], updatedAt`.
- `decision`은 `strategy`와 같은 값을 제공하는 호환 별칭이며 `cover`도 `coverImage`의 별칭이다.
- 이미지 항목: `{id,url,alt,caption}`. 이미지 경로는 `/media/projects/{projectId}/{mediaId}`.
- 공개 프로젝트 경로 `/works/project/{slug}/`는 `dist/works/project/index.html` 공용 셸을 사용한다. 영문은 `dist/en/works/project/index.html`. 해당 slug가 공개 상태일 때만 셸을 반환한다. 서버가 실제 프로젝트의 제목·설명·공유 정보·canonical·언어별 주소·본문을 이스케이프해 채우므로 JavaScript 실행 전에도 다른 자사 사례로 표시되지 않는다.
- `/sitemap.xml`은 공개 사례의 국문·영문 경로를 동적으로 포함한다. 현재 사이트의 두 언어 제작 범위를 전제로 한다.

### 관리자

- `POST /api/admin/login {password}` → HttpOnly·SameSite=Strict 세션 쿠키와 csrf 토큰. HTTPS 운영에서는 Secure 쿠키.
- `GET /api/admin/session` → csrf 토큰. `POST /api/admin/logout` → 세션 폐기.
- 관리자 변경 요청은 Origin, 세션 쿠키, `X-CSRF-Token`을 모두 검증한다.
- 문의: `GET /api/admin/inquiries`, `GET /api/admin/inquiries/{id}`, `PATCH .../{id} {status}`.
- 첨부: `GET /api/admin/inquiries/{id}/attachments/{attachmentId}`. 로그인 필수이며 다운로드 전용으로 반환.
- 사례: `GET/POST /api/admin/projects`, `GET/PUT/DELETE /api/admin/projects/{id}`.
- 순서: `POST /api/admin/projects/reorder {ids:[모든 사례 ID]}`.
- 이미지: `POST /api/admin/projects/{id}/media {name,type,dataBase64,alt?,caption?}`.

세션은 최대 8시간, 비활성 30분 후 만료한다. 서버 재시작·비밀번호 변경 후에는 다시 로그인한다. 로그인 실패 속도도 제한한다. 세션과 요청 제한은 메모리 기반이며 현재 단일 프로세스 운영에 맞춘 구현이다.

## 운영과 검증

백업은 서버를 중지한 상태에서 DATA_DIR 전체(기록+첨부+이미지)를 접근 제한된 저장소로 복사한다. 복구 시 원본을 보존한 상태에서 별도 폴더로 먼저 읽기·로그인·사례·첨부를 확인한다. ZIP을 공개 dist에 두지 않는다.

```sh
node tests/server-api.cjs
node tests/server-admin.cjs
node tests/full-flow.cjs
```

검사마다 별도의 합성 데이터 폴더를 사용한다. 실제 회사 접수함을 변경하거나 외부 메일을 보내지 않는다. API 검사는 입력·권한·CSRF·첨부·중복·영속 저장·재시작·비공개·공개·순서·제한을 확인한다. 관리자 브라우저 검사는 실제 로그인·문의 확인·상태 변경·사례 편집·이미지 업로드·공개·모바일 화면을 확인한다. 결과는 `qa/server/`에 기록한다. 통합 검사는 실제 국문·영문 문의에서 관리자 확인·첨부 다운로드까지, 사례 등록에서 공개 WORKS·상세·영문 본문·서버 HTML·비공개 404까지 연결한다. 통합 증거는 `qa/full-flow/`에 남긴다.

아직 확인하지 않은 외부 운영 항목은 실제 호스팅의 영속 디스크·HTTPS 프록시·백업·담당자 접근, 이메일 알림 연결, 운영 개인정보 보관 기준이다. 로컬 접수와 관리자 확인은 실제 동작하지만 이 항목들이 완료된 것으로 표시하지 않는다.
