// Korean page-depth content. Images retain the scope of the documented creator projects.
const media = '/evidence/expansion/';
const caseLink = (slug, label) => `<a class="depth-case-link" href="/works/project/${slug}/">${label}</a>`;

export function teamProof() {
  return `<section class="team-proof page-depth" aria-labelledby="team-proof-title">
  <div class="shell">
    <header class="depth-heading">
      <div><p class="eyebrow">EXPERTISE IN PRACTICE</p><h2 id="team-proof-title">책을 만들 때도,<br>웹을 만들 때도.</h2></div>
      <p>내용의 순서와 표현의 방식, 실제로 쓰이는 화면까지.<br> 서로 맞닿은 일을 함께 살펴야 결과물이 제 역할을 합니다.</p>
    </header>

    <article class="team-spread team-spread-book" aria-labelledby="team-book-title">
      <figure class="team-proof-image team-proof-page">
        <a href="/works/project/sales-rehearsal/" aria-label="세일즈 리허설의 내지와 전체 작업 보기"><img src="${media}book-editorial-story.webp" alt="세일즈 리허설 263쪽, 장 제목과 사진·캡션·본문을 편집한 실제 내지" width="1352" height="2000" loading="lazy" decoding="async"></a>
        <figcaption>세일즈 리허설 · 강승구 저술·편집<br>제작자 프로젝트 / 340쪽 책 PDF</figcaption>
      </figure>
      <div class="team-proof-copy">
        <p class="depth-kicker">원고 구성 · 저술 · 편집 디자인</p>
        <h3 id="team-book-title">한 페이지의 위계는<br>원고의 구조에서 시작합니다.</h3>
        <p>『세일즈 리허설』은 영업의 판단과 연습을 다룬 책입니다. 개념과 사례, 실습이 이어지도록 8부·33장으로 구성하고, 독자가 지금 읽는 내용의 위치를 지면에서도 알 수 있게 편집했습니다.</p>
        <dl class="team-role-notes">
          <div><dt>구성과 저술</dt><dd>무엇을 먼저 설명할지 정하고, 개념을 이해할 사례와 질문을 연결합니다.</dd></div>
          <div><dt>편집과 디자인</dt><dd>제목·부제·사진·본문의 역할을 나누고 글자의 크기와 여백으로 읽는 순서를 만듭니다.</dd></div>
          <div><dt>함께 확인할 것</dt><dd>목차의 흐름, 본문의 위계, 도해와 실습 양식이 같은 내용을 설명하는지 살핍니다.</dd></div>
        </dl>
        <p class="depth-deliverable"><strong>작업에 남는 것</strong>원고 구조와 본문 · 내지 편집 · 설명 도해 · 실습 워크시트</p>
        ${caseLink('sales-rehearsal', '책의 구성과 내지 살펴보기')}
      </div>
    </article>

    <article class="team-spread team-spread-web" aria-labelledby="team-web-title">
      <div class="team-proof-copy">
        <p class="depth-kicker">브랜드 메시지 · 메뉴 정보 · 웹 UI</p>
        <h3 id="team-web-title">메뉴를 보여주는 화면에,<br>판단할 정보도 담습니다.</h3>
        <p>Kings의 웹은 브랜드를 처음 접하는 사람과 가맹을 검토하는 사람이 함께 읽습니다. 메뉴 사진으로 관심을 만든 뒤, 구성과 특징을 비교하고 사업 정보를 찾아갈 수 있도록 설계했습니다.</p>
        <dl class="team-role-notes">
          <div><dt>콘텐츠와 브랜드</dt><dd>브랜드의 설명을 메뉴 이름과 특징, 방문자가 궁금해할 정보로 구체화합니다.</dd></div>
          <div><dt>디자인과 개발</dt><dd>사진·설명·정보의 위치를 맞추고 메뉴 탐색에서 운영 정보와 상담으로 이동하는 화면을 만듭니다.</dd></div>
          <div><dt>함께 확인할 것</dt><dd>메뉴를 비교할 기준이 보이는지, 필요한 사업 정보로 이동할 수 있는지 검토합니다.</dd></div>
        </dl>
        ${caseLink('kings-franchise', '브랜드에서 가맹 상담까지 살펴보기')}
      </div>
      <figure class="team-proof-image team-proof-screen">
        <a href="/works/project/kings-franchise/" aria-label="Kings 메뉴 웹의 전체 작업 보기"><img src="${media}kings-menu-grid.png" alt="Kings 메뉴의 사진·가격·특징을 비교할 수 있도록 구성한 실제 웹 제작 화면" width="1440" height="1000" loading="lazy" decoding="async"></a>
        <figcaption>Kings · 브랜드·가맹 모집 웹<br>제작자 프로젝트 / 메뉴 정보와 탐색 화면</figcaption>
      </figure>
    </article>

    <div class="team-collaboration">
      <h3>필요한 역할부터<br>함께 정합니다.</h3>
      <div><p>원고가 있다면 구성과 편집부터, 브랜드 방향이 정해져 있다면 콘텐츠와 화면 제작부터 시작할 수 있습니다. 한 프로젝트 전체를 맡기거나 기존 팀에 필요한 업무를 더하는 방식으로 범위를 정합니다.</p><p>착수할 때는 맡을 산출물, 자료를 제공할 담당자, 중간 확인 시점과 최종 전달 형태를 함께 정리합니다.</p><a class="depth-case-link" href="/contact/">함께할 업무 이야기하기</a></div>
    </div>
  </div>
  </section>`;
}

export function contactGuide() {
  return `<section class="contact-guide page-depth" aria-labelledby="contact-guide-title">
  <div class="shell">
    <header class="depth-heading">
      <div><p class="eyebrow">WHERE TO START</p><h2 id="contact-guide-title">고객이 찾는 화면,<br>담당자가 쓰는 도구.</h2></div>
      <p>업무를 더 잘 처리하는 도구가 필요한지,<br> 고객이 상품을 고르는 화면이 필요한지.<br> 지금의 상황을 알면 의뢰 범위도 구체적으로 정할 수 있습니다.</p>
    </header>

    <div class="contact-reference-spread">
      <article class="contact-reference" aria-labelledby="contact-tool-title">
        <figure><a href="/works/project/kfood-dashboard/" aria-label="먹거리사전 산지 지도 작업 자세히 보기"><img src="${media}kfood-map.png" alt="지역 지도와 월별 품목을 연결한 먹거리사전의 산지 탐색 화면" width="1440" height="1000" loading="lazy" decoding="async"></a><figcaption>먹거리사전 · 산지와 품목 탐색 / 개발 MVP</figcaption></figure>
        <div class="contact-reference-copy"><p class="depth-kicker">업무 도구 · 대시보드</p><h3 id="contact-tool-title">찾는 데 쓰는 시간을,<br>판단하는 데 쓰고 싶다면.</h3><p>흩어진 정보와 반복하는 업무부터 알려주세요. 먹거리사전에서는 월별 품목과 산지 지도를 연결해, 검토할 정보를 찾아가는 작업 화면을 만들었습니다.</p><p class="depth-deliverable"><strong>함께 정할 범위</strong>정보 분류 · 검색과 필터 · 지도와 목록 · 담당자의 처리 흐름</p>${caseLink('kfood-dashboard', '업무 도구 제작 사례 보기')}</div>
      </article>
      <article class="contact-reference" aria-labelledby="contact-commerce-title">
        <figure><a href="/works/project/sojukdoo-concept/" aria-label="소적두 고객별 상품 탐색 작업 자세히 보기"><img src="${media}redbean-audiences.png" alt="일반 소비자와 카페사업자의 목적에 따라 상품 탐색을 나눈 소적두 웹 화면" width="1440" height="1000" loading="lazy" decoding="async"></a><figcaption>소적두 · 고객별 상품 탐색 / 커머스 제작 목업</figcaption></figure>
        <div class="contact-reference-copy"><p class="depth-kicker">브랜드 웹 · 커머스 UI</p><h3 id="contact-commerce-title">같은 상품도,<br>찾아온 목적은 다르니까.</h3><p>누가 어떤 상황에서 상품을 고르는지부터 살핍니다. 소적두의 제작 화면은 집에서 즐길 소비자와 매장에서 사용할 사업자의 탐색을 나눴습니다.</p><p class="depth-deliverable"><strong>함께 정할 범위</strong>브랜드 메시지 · 상품 분류 · 고객별 탐색 · 상세 정보 · 문의와 구매 동선</p>${caseLink('sojukdoo-concept', '브랜드·커머스 제작 사례 보기')}</div>
      </article>
    </div>

    <section class="contact-brief" aria-labelledby="contact-brief-title">
      <div><p class="eyebrow">A USEFUL FIRST BRIEF</p><h3 id="contact-brief-title">이 네 가지가 있으면<br>더 구체적으로 이야기할 수 있습니다.</h3><p>정리된 기획서가 없어도 괜찮습니다.<br>가지고 계신 자료에서부터 시작합니다.</p></div>
      <dl>
        <div><dt>지금 해결할 일</dt><dd>현재의 불편, 바꾸고 싶은 상황, 이번 작업에서 가장 먼저 달라져야 할 것.</dd></div>
        <div><dt>고객과 이용 장면</dt><dd>누가 어떤 상황에서 읽고, 보고, 선택하는지. 현재 고객이 자주 묻는 질문도 도움이 됩니다.</dd></div>
        <div><dt>이미 갖고 있는 자료</dt><dd>현재 사이트·채널 주소, 회사·상품 소개, 원고와 이미지, 기존 디자인 자료.</dd></div>
        <div><dt>일정과 의사결정 조건</dt><dd>원하는 완료 시점과 예산 범위, 함께 확인할 담당자, 먼저 진행해야 할 업무.</dd></div>
      </dl>
    </section>

    <section class="contact-faq" aria-labelledby="contact-faq-title">
      <div><p class="eyebrow">BEFORE WE BEGIN</p><h3 id="contact-faq-title">의뢰 전에<br>많이 궁금한 것들.</h3></div>
      <div class="contact-faq-answers">
        <details open><summary>예산이나 제작 범위가 아직 정해지지 않았습니다.</summary><p>목적과 우선순위, 현재 준비된 자료부터 알려주세요. 먼저 필요한 산출물과 작업 순서를 나누고, 일정과 예산에 맞춰 이번에 진행할 범위를 협의합니다.</p></details>
        <details><summary>기존 사내 팀이나 다른 제작사와 함께 진행할 수 있나요?</summary><p>가능합니다. 기존 팀이 맡는 일과 새로 필요한 역할을 먼저 구분합니다. 자료 공유 방식, 확인 담당자, 수정과 전달 범위를 정해 함께 진행합니다.</p></details>
        <details><summary>완료한 뒤에는 무엇을 전달받나요?</summary><p>제작물의 성격에 따라 최종 파일과 운영에 필요한 자료를 정합니다. 편집 가능한 원본, 이미지 사용 범위, 관리 권한, 안내 문서 등 필요한 인계 항목을 착수 단계에서 협의합니다.</p></details>
        <details><summary>일부 업무만 맡기거나 작은 범위부터 시작해도 되나요?</summary><p>원고 편집, 특정 페이지 제작, 콘텐츠 구성처럼 필요한 업무부터 의논할 수 있습니다. 이후 작업과 연결될 수 있도록 목적과 최종 활용처를 함께 확인합니다.</p></details>
      </div>
    </section>
  </div>
  </section>`;
}
