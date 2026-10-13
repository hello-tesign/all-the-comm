# 올더커뮤니케이션 공식 로고 웹 자산

제공된 `올더로고-0523-fin-수정.ai`의 PDF 호환 벡터를 Poppler/Cairo로 직접 추출했다. 글자·심볼·비율을 새로 그리지 않았다. 세 구성 모두 SVG 내부 래스터 이미지가 없고, 지정 시그니처 외의 다른 아트보드 요소가 출력되지 않는 크롭이다. 투명 배경이며 폰트를 별도로 설치하지 않아도 원래 아웃라인이 표시된다.

| 구성 | SVG viewBox | 원본색 | 어두운 배경용 | 전체 백색 |
|---|---|---|---|---|
| 국문 가로형 | 417 × 91 | logo-horizontal.svg | logo-horizontal-on-dark.svg | logo-horizontal-white.svg |
| 심볼 | 286 × 285 | logo-symbol.svg | logo-symbol-on-dark.svg | logo-symbol-white.svg |
| 영문·국문 세로형 | 817 × 622 | logo-stacked.svg | logo-stacked-on-dark.svg | logo-stacked-white.svg |

`-on-dark`는 원본의 민트 글자와 그라데이션 심볼을 보존하고 어두운 회색 글자만 백색으로 바꾼 적용안이다. `-white`는 모든 보이는 면을 백색으로 바꾸되 원본의 선·글자 형태와 투명한 간격을 유지한 적용안이다. 두 적용안은 제공된 원본 안에 있었던 기존 버전으로 표시하지 않는다.

원본색 PNG 대체 자산도 제공한다.

- logo-horizontal.png: 1251 × 273, RGBA 투명
- logo-symbol.png: 858 × 855, RGBA 투명
- logo-stacked.png: 2451 × 1866, RGBA 투명

## 적용

헤더 예:

```html
<a href="/" aria-label="올더커뮤니케이션 홈">
  <img src="/brand/logo-horizontal-on-dark.svg"
       width="260" height="57" alt="올더커뮤니케이션">
</a>
```

실제 비율은 417/91이다. CSS에는 `height:auto;object-fit:contain`을 적용하고 강제로 늘리거나 그라데이션 위에 새 색을 덮지 않는다. `<img>` 방식 사용을 권장한다. SVG를 여러 번 HTML 안에 직접 삽입할 때는 clipPath/gradient ID가 중복되지 않도록 각각 접두사를 붙인다.

- 데스크톱 가로형 260–320px, 모바일 약200–220px를 출발점으로 검수한다. 이는 신규 적용 제안이며 공식 최소규격은 아니다.
- 가로형의 작은 영문 보조줄은 축소 시 읽기 어려워진다. 180px 이하로 더 줄이는 대신 심볼을 사용하고 링크의 접근성 이름으로 회사명을 제공하는 방법을 검토한다.
- 심볼은 16/24/32/48/80px에서 시각 검수했다. 16px에서는 내부 간격의 표현이 제한되므로 favicon은 SVG 또는32px 이상 원본으로 제공한다.
- 밝은 배경은 원본색, navy `#061c25` 배경은 `-on-dark` 또는 `-white`를 사용한다. 원본색은 웹 디자인의 새 강조색 `#59e3c6`로 임의 치환하지 않는다.
- 사진·장식으로만 쓰이면 `alt=""`, 회사 홈 링크 안에 쓰이면 실제 회사명으로 접근성 이름을 제공한다.

## 검수 및 재생성

`preview.html`과 `preview.png`는 검수용 색상·크기 비교표다. 실제 사이트에서 사용하는 파일은 위 표의 로고 자산만으로 충분하다. `manifest.json`에는 출처 해시, PDF 페이지와 크롭 좌표, 파일 크기가 기록돼 있다.

`scripts/prepare-brand.py`로 재생성한다. 검토한 원본 해시와 다르면 잘못된 영역을 잘라내지 않도록 중단한다. 원본 AI는 수정하지 않는다.

검수: Chromium의 실제 SVG 로딩13개 성공, 전체 SVG에 내장 래스터 이미지0개. 320px·220px 가로형, 밝음·어두움 배경, 전체백색과 심볼 소형 크기를 눈으로 확인했다. 원본 민트색을 새 색으로 추정하거나 재작성하지 않았다.
