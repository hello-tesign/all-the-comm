// Korean page-depth content. Images retain the scope of the documented creator projects.
const media = '/evidence/expansion/';
const caseLink = (slug, label) => `<a class="depth-case-link" href="/works/project/${slug}/">${label}</a>`;

export function teamProof() {
  return `<section class="team-proof page-depth" aria-labelledby="team-proof-title">
  <div class="shell">
    <header class="depth-heading">
      <div><p class="eyebrow">EXPERTISE IN PRACTICE</p><h2 id="team-proof-title">저술·편집과<br>브랜드 웹 제작.</h2></div>
      <p>원고 구성부터 지면 편집까지,<br> 브랜드 소개부터 가맹 상담 화면까지 제작했습니다.</p>
    </header>

    <article class="team-spread team-spread-book" aria-labelledby="team-book-title">
      <figure class="team-proof-image team-proof-page">
        <a href="/works/project/sales-rehearsal/" aria-label="세일즈 리허설의 내지와 전체 작업 보기"><img src="${media}book-editorial-story.webp" alt="세일즈 리허설 263쪽, 장 제목과 사진·캡션·본문을 편집한 실제 내지" width="1352" height="2000" loading="lazy" decoding="async"></a>
        <figcaption>강승구 저술·편집 · 340쪽 PDF</figcaption>
      </figure>
      <div class="team-proof-copy">
        <p class="depth-kicker">원고 구성 · 저술 · 편집 디자인</p>
        <h3 id="team-book-title">세일즈 리허설</h3>
        <p>영업의 판단과 연습을 다룬 책입니다. 8부와 33장의 개념·사례·실습을 집필하고 본문, 도해, 워크시트의 지면을 편집했습니다.</p>
        <dl class="team-role-notes">
          <div><dt>저술</dt><dd>목차, 개념 설명, 사례와 실습 질문.</dd></div>
          <div><dt>편집 디자인</dt><dd>제목·본문의 위계와 사진·도해 배치.</dd></div>
          <div><dt>검토</dt><dd>목차 순서, 본문과 도해·실습의 일치.</dd></div>
        </dl>
        <p class="depth-deliverable"><strong>제작물</strong>원고 · 내지 · 도해 · 실습 워크시트</p>
        ${caseLink('sales-rehearsal', '프로젝트 보기')}
      </div>
    </article>

    <article class="team-spread team-spread-web" aria-labelledby="team-web-title">
      <div class="team-proof-copy">
        <p class="depth-kicker">브랜드 메시지 · 메뉴 정보 · 웹 UI</p>
        <h3 id="team-web-title">Kings</h3>
        <p>브랜드 소개, 메뉴 탐색, 사업 정보와 가맹 상담 화면을 제작했습니다. 메뉴는 사진과 가격·특징을 비교하는 구성으로 설계했습니다.</p>
        <dl class="team-role-notes">
          <div><dt>콘텐츠</dt><dd>브랜드 소개, 메뉴 특징, 가맹 안내.</dd></div>
          <div><dt>디자인·개발</dt><dd>사진·정보 배치와 메뉴·상담 화면.</dd></div>
          <div><dt>검토</dt><dd>메뉴 비교 기준, 사업 정보의 탐색 경로.</dd></div>
        </dl>
        ${caseLink('kings-franchise', '프로젝트 보기')}
      </div>
      <figure class="team-proof-image team-proof-screen">
        <a href="/works/project/kings-franchise/" aria-label="Kings 메뉴 웹의 전체 작업 보기"><img src="${media}kings-menu-grid.png" alt="Kings 메뉴의 사진·가격·특징을 비교할 수 있도록 구성한 실제 웹 제작 화면" width="1440" height="1000" loading="lazy" decoding="async"></a>
        <figcaption>제작자 프로젝트 · 메뉴 소개 화면</figcaption>
      </figure>
    </article>

    <div class="team-collaboration">
      <h3>프로젝트 전체부터<br>개별 업무까지.</h3>
      <div><p>원고 편집, 콘텐츠 제작, 웹 개발 등 기존 팀에 필요한 업무만 맡길 수 있습니다. 착수 전에 산출물, 자료 담당자, 검토 시점과 전달 형식을 협의합니다.</p><a class="depth-case-link" href="/contact/">업무 문의</a></div>
    </div>
  </div>
  </section>`;
}

export function contactGuide() {
  return `<section class="contact-guide page-depth" aria-labelledby="contact-guide-title">
  <div class="shell">
    <header class="depth-heading">
      <div><p class="eyebrow">WHERE TO START</p><h2 id="contact-guide-title">업무 도구와<br>커머스 제작.</h2></div>
      <p>담당자의 정보 탐색 도구와 고객용 상품 화면.<br> 제작 범위를 참고할 수 있는 두 사례입니다.</p>
    </header>

    <div class="contact-reference-spread">
      <article class="contact-reference" aria-labelledby="contact-tool-title">
        <figure><a href="/works/project/kfood-dashboard/" aria-label="먹거리사전 산지 지도 작업 자세히 보기"><img src="${media}kfood-map.png" alt="지역 지도와 월별 품목을 연결한 먹거리사전의 산지 탐색 화면" width="1440" height="1000" loading="lazy" decoding="async"></a><figcaption>개발 MVP · 산지 탐색 화면</figcaption></figure>
        <div class="contact-reference-copy"><p class="depth-kicker">업무 도구 · 대시보드</p><h3 id="contact-tool-title">먹거리사전</h3><p>월별 품목과 산지 지도를 조회하는 작업 화면을 개발했습니다. 검색·필터와 지도·목록으로 필요한 정보를 찾는 구조입니다.</p><p class="depth-deliverable"><strong>의뢰 범위 예시</strong>정보 분류 · 검색·필터 · 지도·목록 · 업무 흐름 설계</p>${caseLink('kfood-dashboard', '프로젝트 보기')}</div>
      </article>
      <article class="contact-reference" aria-labelledby="contact-commerce-title">
        <figure><a href="/works/project/sojukdoo-concept/" aria-label="소적두 고객별 상품 탐색 작업 자세히 보기"><img src="${media}redbean-audiences.png" alt="일반 소비자와 카페사업자의 목적에 따라 상품 탐색을 나눈 소적두 웹 화면" width="1440" height="1000" loading="lazy" decoding="async"></a><figcaption>커머스 제작 목업 · 고객별 상품 탐색</figcaption></figure>
        <div class="contact-reference-copy"><p class="depth-kicker">브랜드 웹 · 커머스 UI</p><h3 id="contact-commerce-title">소적두</h3><p>일반 소비자와 카페사업자의 구매 목적을 구분한 커머스 화면입니다. 고객별 상품 탐색과 상세 정보의 구성을 제작했습니다.</p><p class="depth-deliverable"><strong>의뢰 범위 예시</strong>브랜드 메시지 · 상품 분류 · 고객별 탐색 · 상세 화면</p>${caseLink('sojukdoo-concept', '프로젝트 보기')}</div>
      </article>
    </div>

    <section class="contact-brief" aria-labelledby="contact-brief-title">
      <div><p class="eyebrow">A USEFUL FIRST BRIEF</p><h3 id="contact-brief-title">의뢰 준비 자료.</h3><p>아래 항목 중 준비된 내용만 보내주세요.</p></div>
      <dl>
        <div><dt>해결할 일</dt><dd>현재의 문제, 작업 목적과 우선순위.</dd></div>
        <div><dt>주요 고객</dt><dd>대상 고객, 이용 상황과 자주 받는 질문.</dd></div>
        <div><dt>현재 자료</dt><dd>사이트·채널 주소, 소개서, 원고, 이미지와 디자인 자료.</dd></div>
        <div><dt>일정·예산</dt><dd>희망 완료일, 예산 범위와 검토 담당자.</dd></div>
      </dl>
    </section>

    <section class="contact-faq" aria-labelledby="contact-faq-title">
      <div><p class="eyebrow">BEFORE WE BEGIN</p><h3 id="contact-faq-title">자주 묻는 질문.</h3></div>
      <div class="contact-faq-answers">
        <details open><summary>예산이나 제작 범위가 미정이어도 문의할 수 있나요?</summary><p>가능합니다. 목적과 우선순위, 준비된 자료를 보내주세요. 필요한 산출물과 작업 순서를 검토한 뒤 일정·예산에 맞는 범위를 협의합니다.</p></details>
        <details><summary>기존 팀이나 다른 제작사와 협업할 수 있나요?</summary><p>가능합니다. 각 팀의 업무, 자료 공유 방식, 검토 담당자와 수정·전달 범위를 협의합니다.</p></details>
        <details><summary>완료 후 어떤 자료를 받나요?</summary><p>최종 파일, 편집 원본, 사용 권한, 관리 권한과 안내 문서 중 필요한 항목을 착수 전에 협의합니다. 제공 범위는 업무에 따라 다릅니다.</p></details>
        <details><summary>일부 업무만 맡길 수 있나요?</summary><p>원고 편집, 특정 페이지 제작, 콘텐츠 구성 등 필요한 업무부터 맡길 수 있습니다. 사용할 곳과 최종 산출물을 먼저 확인합니다.</p></details>
      </div>
    </section>
  </div>
  </section>`;
}
