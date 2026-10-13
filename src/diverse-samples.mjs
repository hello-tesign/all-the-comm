// Original concept deliverables. Names, launch claims and client results are not invented.
// Reference imagery keeps visible provenance, including the existing generated beauty concept.
const photos = {
  culture: ['/evidence/diverse/botanic-skywalk.webp', 1400, 1050],
  beauty: ['/evidence/diverse/beauty-ritual.webp', 1536, 1024],
  travel: ['/evidence/diverse/botanic-garden.webp', 1800, 1350],
  detail: ['/evidence/diverse/place-soakru.webp', 1200, 794],
};

const image = (key, alt, cls = '') => {
  const [src, width, height] = photos[key];
  return `<img class="${cls}" src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async">`;
};
const label = (format) => `<div class="ds-edition"><span>${format}</span><span>자체 콘셉트</span></div>`;
const spaceCredit = () => `<p class="ds-photo-credit">사진 레퍼런스: <a href="https://commons.wikimedia.org/wiki/File:%EC%84%9C%EC%9A%B8%EC%8B%9D%EB%AC%BC%EC%9B%90_%EC%8A%A4%EC%B9%B4%EC%9D%B4%EC%9B%8C%ED%81%AC.jpg" target="_blank" rel="noopener noreferrer">서울식물원 스카이워크 · Tjwlgns</a> / <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · 화면에 맞게 크롭</p>`;
const filmCredit = () => `<p class="ds-photo-credit">장소 사진으로 구성한 콘티 · 화면에 맞게 크롭<br><a href="https://commons.wikimedia.org/wiki/File:%EC%84%9C%EC%9A%B8%EC%8B%9D%EB%AC%BC%EC%9B%90_%EC%95%BC%EC%99%B8.jpg" target="_blank" rel="noopener noreferrer">야외 정원</a>·<a href="https://commons.wikimedia.org/wiki/File:%EC%84%9C%EC%9A%B8%EC%8B%9D%EB%AC%BC%EC%9B%90_%EC%8A%A4%EC%B9%B4%EC%9D%B4%EC%9B%8C%ED%81%AC.jpg" target="_blank" rel="noopener noreferrer">온실</a>: Tjwlgns / <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · <a href="https://www.gangseo.seoul.kr/gs040501/271821" target="_blank" rel="noopener noreferrer">소악루: 서울특별시 강서구</a> / <a href="https://www.kogl.or.kr/info/licenseType1.do" target="_blank" rel="noopener noreferrer">공공누리 제1유형</a></p>`;

const samples = {
  hospital: () => `<div class="diverse-sample diverse-sample--hospital">
    ${label('PATIENT GUIDE · 방문 안내')}
    <div class="ds-care-title"><span class="ds-care-index" aria-hidden="true">01</span><h4>처음 오시는 길이<br>조금 더 편하도록.</h4></div>
    <p class="ds-care-intro">예약한 날, 찾을 곳, 도착한 뒤의 순서.<br>방문 전에 필요한 안내를 한 장에 담았습니다.</p>
    <dl class="ds-care-steps">
      <div><dt><span>방문 전</span>예약 내용을 확인해 주세요.</dt><dd>예약 문자에서 날짜·시간·진료과를 확인해 주세요. 변경이 필요하다면 예약한 병원으로 연락해 주세요.</dd></div>
      <div><dt><span>오시는 길</span>건물과 출입구를 확인해 주세요.</dt><dd>병원에서 보내드린 위치·주차 안내를 확인하시면 접수처를 찾는 데 도움이 됩니다.</dd></div>
      <div><dt><span>도착 후</span>접수처에서 예약을 알려주세요.</dt><dd>안내에 따라 접수한 뒤 대기해 주세요. 도움이 필요하면 가까운 직원에게 말씀해 주세요.</dd></div>
    </dl>
    <p class="ds-care-foot">방문 안내 리플릿 <span>예약 → 위치 확인 → 접수</span></p>
  </div>`,

  pr: () => `<div class="diverse-sample diverse-sample--pr">
    ${label('PRESS MATERIAL · 원고 시안')}
    <p class="ds-press-desk">제조 · 산업용 조명 <span>PRODUCT NOTE</span></p>
    <h4>작업대가 바뀌어도,<br>조명은 그대로.</h4>
    <p class="ds-press-deck">헤드와 고정부를 따로 바꾸는<br>모듈형 작업등 제안</p>
    <div class="ds-press-body"><p>작업 환경이 달라질 때 조명 전체를 교체해야 할까. 이 제품 제안은 작업대의 형태와 쓰임에 맞춰 필요한 부분을 바꿀 수 있다는 생각에서 출발했다.</p><p>광원 헤드, 관절, 고정부를 분리해 구성하고, 설치할 자리와 작업 방식에 따라 조합을 선택하도록 했다. 제품 소개 자료에는 구성 부품과 조립 순서, 사용 환경을 함께 담는다.</p></div>
    <div class="ds-press-quote"><span>기자가 바로 확인할 자료</span><p>제품 구조 · 교체 과정 · 사용 장면</p></div>
    <p class="ds-press-end">신제품 PR 패키지 <span>보도자료 / 제품 사진 기획 / 팩트시트</span></p>
  </div>`,

  media: () => `<div class="diverse-sample diverse-sample--media">
    ${label('CULTURE · 옥외 포스터')}
    <p class="ds-poster-series">도시 산책 전시</p>
    <h4>도시를<br><span>다시</span> 보다.</h4>
    <div class="ds-poster-photo">${image('culture', '도시 산책 전시 포스터의 공간 사진 레퍼런스')}<p>걷다 보면,<br>새로운 장면.</p></div>
    <div class="ds-poster-bottom"><p>익숙한 길에서 발견한<br>빛과 모양에 관한 전시</p><span>WALK<br>AND SEE</span></div>
    ${spaceCredit()}
  </div>`,

  influencer: () => `<div class="diverse-sample diverse-sample--influencer">
    ${label('BEAUTY · 크리에이터 브리프')}
    <div class="ds-creator-grid"><div class="ds-creator-photo">${image('beauty', '뷰티 콘텐츠 톤을 제안하는 무브랜드 보틀 정물의 생성형 콘셉트 이미지')}<p>지금의 루틴에,<br>자연스럽게.</p></div>
    <div class="ds-creator-copy"><p class="ds-mini-label">CREATIVE DIRECTION</p><h4>설명 대신,<br>사용하는 순간.</h4><p class="ds-creator-premise">제품을 소개하는 말보다<br>일상에서 손이 가는 이유를 보여주세요.</p>
    <ol class="ds-creator-shots"><li><span>OPEN</span><p>외출을 준비하는 테이블.<br>평소 쓰던 물건 사이로 시작.</p></li><li><span>SHOW</span><p>손에 덜어 질감을 가까이.<br>자연광 아래의 색과 움직임.</p></li><li><span>CLOSE</span><p>개인의 사용감을 짧게.<br>제품 정보로 이어지는 마무리.</p></li></ol></div></div>
    <p class="ds-creator-note">릴스 협업 구성 <span>협찬 표기 · 사용 장면 · 개인의 언어</span></p>
    <p class="ds-photo-credit">뷰티 콘텐츠 톤 참고 · 생성형 콘셉트 이미지</p>
  </div>`,

  video: () => `<div class="diverse-sample diverse-sample--video">
    ${label('TRAVEL FILM · 20초 콘티')}
    <h4>하루를,<br>천천히 펼치다.</h4>
    <div class="ds-film-lead">${image('travel', '서울식물원 야외 정원 전경, 여행 필름의 산책 시작 장면 레퍼런스')}<div><span>01 / 00—06″</span><p>산책을 나서면, 다른 속도.</p></div></div>
    <div class="ds-film-sequence"><div>${image('detail', '소악루의 건축과 주변 풍경, 여행 필름의 잠시 머무는 장면 레퍼런스')}<span>02 / 06—14″</span><p>빛이 머무는 자리를 따라.</p></div><div>${image('culture', '서울식물원 스카이워크, 여행 필름의 마지막 온실 산책 장면 레퍼런스')}<span>03 / 14—20″</span><p>오늘은, 여기까지.</p></div></div>
    <div class="ds-film-notes"><p><span>CAMERA</span>고정 숏 → 디테일 → 느린 이동</p><p><span>SOUND</span>바람 소리, 발걸음, 공간의 잔향</p></div>
    ${filmCredit()}
  </div>`,
};

export function diverseSample(kind) {
  return Object.hasOwn(samples, kind) ? samples[kind]() : '';
}
