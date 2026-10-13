// Company-level healthcare experience: supplied S04 P213–214 and S03 P049/P055.
// The archived partner names do not establish current contracts or campaign results.
const partners=['강남더블유안과','리드힐','리샘','새빛','참진한의원','함소아의원'];

export function healthcareHome(){
 return `<section class="healthcare-home" aria-labelledby="healthcare-home-title"><div class="shell healthcare-home-inner"><div><p class="healthcare-kicker">의료 커뮤니케이션</p><h2 id="healthcare-home-title">의학 취재와<br>병원 홍보 경험.</h2></div><div class="healthcare-home-copy"><p>질환 콘텐츠, 의료진 인터뷰,<br>언론홍보와 공식 채널 운영을 맡습니다.</p><a class="text-link" href="/about/#healthcare-expertise">의료 분야 소개 <span aria-hidden="true">↗</span></a></div></div></section>`;
}

export function healthcareAbout(){
 return `<section class="healthcare-about" id="healthcare-expertise" aria-labelledby="healthcare-about-title"><div class="shell"><div class="healthcare-about-heading"><div><p class="healthcare-kicker">의료 분야의 전문 배경</p><h2 id="healthcare-about-title">의학전문기자와<br>병원 홍보팀장<br><em>출신의 경험.</em></h2></div><div class="healthcare-about-intro"><p class="healthcare-lead">의학 취재와 병원 홍보 경력을 바탕으로<br>병원의 외부 홍보팀 역할을 맡습니다.</p><p>진료 분야와 의료진의 전문성, 환자의 질문을 파악해 콘텐츠·언론홍보·채널 운영을 기획합니다.</p></div></div><div class="healthcare-disciplines"><div><h3>질환 콘텐츠와<br>공식 채널 운영.</h3><p>질환·치료 정보를 환자의 질문 순서로 정리하고 홈페이지, 블로그, SNS용 콘텐츠를 제작합니다.</p></div><div><h3>의료진 인터뷰와<br>영상 기획.</h3><p>의료진의 설명을 담을 질문지와 영상 구성을 기획합니다. 환자가 궁금해하는 내용을 중심으로 편집합니다.</p></div><div><h3>언론홍보와<br>광고 운영.</h3><p>보도자료, 미디어 대응과 의학전문 기자간담회를 기획합니다. 온라인·지역 광고를 운영하고 진행 내용과 결과를 보고합니다.</p></div></div><div class="healthcare-partners"><div class="healthcare-partners-caption"><h3>의료 분야 파트너</h3><p>기존 홈페이지에 소개된 파트너</p></div><ul aria-label="기존 홈페이지에 소개된 의료 분야 파트너">${partners.map(name=>`<li>${name}</li>`).join('')}</ul></div><a class="text-link healthcare-about-link" href="/works/#hospital">의료 분야 업무 보기 <span aria-hidden="true">↗</span></a></div></section>`;
}

export function healthcareService(){
 return `<div class="healthcare-service" aria-labelledby="healthcare-service-title"><div class="healthcare-brief-top"><p>의료진 인터뷰 질문지</p><span>기획 구성 예시</span></div><h3 id="healthcare-service-title">진료실의 질문을 담은<br>인터뷰 기획.</h3><p class="healthcare-brief-intro">환자가 자주 묻는 내용과 의료진의 설명을 중심으로 질문지를 구성합니다.</p><dl class="healthcare-interview"><div><dt>환자의 질문</dt><dd>환자들이 가장 자주 묻는 질문은?</dd></div><div><dt>설명의 핵심</dt><dd>검사·치료에서 꼭 설명할 내용은?</dd></div><div><dt>사전 정보</dt><dd>상담 전에 알아두면 좋은 정보는?</dd></div></dl><div class="healthcare-brief-output"><h4>인터뷰 후 제작할 콘텐츠</h4><p>질환 설명, 의료진 영상, 병원 소식으로 주제를 나누고 채널별 원고와 영상을 기획합니다.</p><ul aria-label="인터뷰 이후 구성할 콘텐츠"><li>질환 콘텐츠</li><li>의료진 영상</li><li>보도자료</li><li>공식 채널</li></ul></div></div>`;
}
