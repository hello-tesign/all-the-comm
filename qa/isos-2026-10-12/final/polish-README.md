# 마지막 세 변경 표적 검증

확인일: 2026-10-12. 대상: `http://127.0.0.1:4173`. 앱 소스와 서버는 수정하지 않았다.

**179개 통과 / 기능 실패 0 / 브라우저 JavaScript 오류 0 / 문의·쓰기 요청 시도 0.** Chromium, Firefox, WebKit 각 59개와 공통 검사 2개를 합친 결과다. 기존 `results.json`의 413개 통과는 별도 기록으로 보존했다.

- WORKS 1440px·1060px의 서비스 탭 10개가 5열×2행에 표시되고 글자와 페이지의 가로 넘침이 없었다. 방향키·Home·End 선택 및 단일 패널 표시를 확인했다.
- WORKS의 두 서비스와 TEAM의 두 역할을 클릭한 다음 RAF 및 220ms 시점에 제목·설명·CTA와 모든 조상의 opacity가 1이고, 요소가 표시되며 overflow 조상에 잘리지 않는 것을 확인했다. 18회 탭 선택의 원시 측정값은 JSON의 `samples`에 있다.
- 국문 PC 상담 폼은 원래 multiple file input을 유지했다. 메모리상의 한글·장문·HTML 모양 파일명 3개를 선택해 이름이 정확하게 유지되고 `textContent`로만 표시되는지 확인했다. 긴 이름에서도 가로 넘침이 없었다.
- Tab 키로 원래 파일 입력에 접근할 수 있고 포커스 표시가 보였다. 실제 filechooser 이벤트와 multiple 속성을 확인했다. 파일 선택 후 다른 입력 값이 유지되고 `form.reset()` 후 원래 입력과 표시가 초기화됐다.
- 국문 390px과 영문 1440px은 기본 파일 입력을 표시했다. 새 국문 PC 표시 UI는 모바일에서 숨겨지고 영문에는 생성되지 않았다.

## 실행 증거

- 재현 스크립트: `tests/isos-polish.cjs`.
- 통합 결과: `polish-results.json`.
- 첫 실행: `polish-chromium-initial-with-sandbox-error.json`.
- Firefox/WebKit 완료: `polish-firefox-webkit-results.json`.
- 스크린샷 9장: 브라우저별 WORKS 1440px/1060px 2장과 첨부파일 선택 상태 1장.

최초 샌드박스 실행에서 Chromium 59개는 통과했으나 Firefox가 페이지 생성 전 `_page` undefined 환경 오류로 시작하지 못했다. 원래 실패 기록을 보존하고 승인된 로컬 GET 전용 실행에서 Firefox·WebKit 검사를 완료했다. 통합 결과는 Chromium의 성공한 페이지 검사와 후속 Firefox·WebKit 결과를 합쳤다. 사이트 기능 실패를 성공으로 바꾼 항목은 없다.

모든 브라우저에서 GET/HEAD/OPTIONS 이외의 요청을 차단했고 제출 버튼을 누르지 않았다. 이 결과는 로컬 UI의 마지막 변경 검증이며 문의 저장 API, 외부 이메일, 배포를 새로 검증한 결과가 아니다.
