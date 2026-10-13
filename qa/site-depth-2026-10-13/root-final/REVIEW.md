# 새 사례 이미지 모션과 화면 폭 검수

ABOUT의 실제 웹 2개, TEAM의 책·메뉴 웹, CONTACT의 업무 도구·커머스 화면을 Chromium·Firefox·WebKit에서 직접 스크롤해 확인했다.

- 여섯 이미지 프레임의 진입 효과가 작동하고 종료 후 clip-path가 해제된다.
- 원본 비율, opacity 1, transform none을 유지한다. 캡처 내부는 움직이지 않는다.
- 동작 줄이기 전환 시 애니메이션 스타일을 해제한다.
- 1920 / 1280 / 1024px에서 ABOUT의 shell은 최대1280px이고 가로 넘침이 없다.
- 브라우저별 결과 `chromium-results.json`, `firefox-results.json`, `webkit-results.json`의 모든 조건이 통과했다. 18장 PNG 중 Chromium ABOUT/TEAM/CONTACT, Firefox ABOUT, WebKit TEAM을 직접 시각 확인했다.
- Firefox 최초 sandbox newPage 오류는 앱 진입 이전의 실행 환경 오류다. 허용된 격리 실행으로 다시 검사해 성공했다. 최초 `interrupted.json`은 보존했다.

사이트의636개 통합 검사와 이 표적 검사를 합산하지 않는다. 외부 배포·문의 제출 없음.
