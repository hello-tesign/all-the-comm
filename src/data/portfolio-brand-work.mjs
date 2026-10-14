// Commissioned brand work supplied on 2026-10-14 (Drive "회사소개" folder and chat).
// The client asked not to name the brands; copy describes only what the images show.
const base={year:'',status:'published',englishPublished:false,publicationConfirmed:true,featured:false,videoUrls:[],
 publicationNote:'2026-10-14 사용자 제공 브랜드 의뢰 작업 이미지. 고객명 비표기 요청. brand-work-2026-10-14'};
const shots=(folder,captions)=>captions.map(([alt,caption],i)=>({file:`${folder}/${String(i+1).padStart(2,'0')}.webp`,alt,caption}));
const cover=(folder,n)=>`/evidence/brand-work/${folder}/${String(n).padStart(2,'0')}.webp`;

export const brandWork=[
 {...base,slug:'bugak-branding',title:'김부각 브랜딩',client:'스낵 브랜드',type:'브랜드 의뢰 작업 · 광고 일러스트 · 패키지',industry:'식품 · 스낵',services:['strategy','content','media'],coverImage:cover('bugak',1),
 summary:'김부각을 튜브·배·보트·돛으로 바꾼 광고 포스터와 김스낵 패키지.',
 scope:'광고 콘셉트 · 합성 일러스트 · 헤드라인 · 포스터 4종 · 패키지 2종',
 problem:'간식 김부각을 맥주 안주, 여가, 아이 간식의 장면과 연결해야 했습니다.',
 strategy:'제품 조각을 장면 속 탈것으로 바꾸고, 노란 배경·세리프 헤드라인·우측 하단 제품을 반복해 시리즈로 묶었습니다.',
 execution:'수영장, 맥주 거품, 급류, 바다를 배경으로 포스터 4종을 합성하고 일러스트 패키지 2종을 제작했습니다.',
 result:'광고 포스터 4종과 패키지 2종을 완성했습니다.\n\n브랜드 의뢰로 제작한 작업이며, 매체 집행 범위나 판매 성과는 표기하지 않습니다.',
 gallery:shots('bugak',[['수영장 위 김부각 튜브 포스터','Enjoy leisure time'],['맥주 거품 위 김부각 배 포스터','Good beer must have good snacks'],['급류 위 김부각 보트 포스터','Motivated protein for children'],['김부각 돛을 단 범선 포스터','Good beer must have good snacks'],['해안 풍경 일러스트의 김스낵 패키지','패키지 · Raw kelp'],['인물 일러스트의 김스낵 패키지','패키지 · Original']]).slice(1)},

 {...base,slug:'coffee-package',title:'커피 패키지',client:'커피 브랜드',type:'브랜드 의뢰 작업 · 패키지 디자인 · 일러스트',industry:'식음료 · 커피',services:['strategy','content'],coverImage:cover('coffee',4),
 summary:'블렌드마다 색과 인물 콜라주를 바꾼 커피 패키지 라벨 시리즈.',
 scope:'패키지 라벨 · 콜라주 일러스트 · 블렌드별 색 체계 · 향미 정보 구성 · 라벨 9종',
 problem:'여러 블렌드를 한 브랜드로 묶으면서 제품마다 다른 향미를 구분해 보여야 했습니다.',
 strategy:'로고와 정보 영역의 배치는 고정하고, 블렌드마다 배경색과 인물 콜라주를 바꿨습니다.',
 execution:'원산지·로스팅·가공 방식과 신맛·쓴맛·단맛·바디·향미 지표를 담은 정보 영역, 블렌드별 콜라주 일러스트로 라벨 9종을 제작했습니다.',
 result:'블렌드 6종의 라벨 9종을 완성했습니다.\n\n브랜드 의뢰로 제작한 패키지 디자인이며, 판매 성과는 표기하지 않습니다.',
 gallery:shots('coffee',[['미스터 사이공 라벨','미스터 사이공'],['팜스 디카페인 라벨, 자주색 버전','팜스 디카페인'],['팜스 디카페인 라벨, 하늘색 버전','팜스 디카페인 · 색상 변형'],['블루문 라벨','블루문'],['팜스클래식 라벨','팜스클래식'],['팜스家 라벨, 남색 버전','팜스家'],['팜스家 라벨, 갈색 버전','팜스家 · 색상 변형'],['팜스家 라벨, 초록 버전','팜스家 · 색상 변형'],['골든선셋 라벨','골든선셋']]).filter((_,i)=>i!==3)},

 {...base,slug:'eyewear-campaign',title:'아이웨어 캠페인',client:'아이웨어 브랜드',type:'브랜드 의뢰 작업 · 캠페인 포스터',industry:'패션 · 아이웨어',services:['content','media'],coverImage:cover('eyewear',10),
 summary:'FIT·CHIC·WIT 메시지를 모델마다 다른 장면으로 풀어낸 제품 포스터 시리즈.',
 scope:'캠페인 메시지 · 제품 합성 · 3D 오브젝트 · 포스터 15종 · 제품 정보 표기',
 problem:'모델마다 다른 소재와 형태를 한 브랜드의 캠페인으로 보여 줘야 했습니다.',
 strategy:'착용감·스타일·위트를 뜻하는 FIT·CHIC·WIT를 공통 메시지로 두고, 모델마다 다른 오브젝트와 색을 배정했습니다.',
 execution:'낙하산, 열기구, 미로, 엑스레이 해골, 금빛 마네킹 같은 장면으로 포스터 15종을 만들고 모델명·소재·무게를 함께 표기했습니다.',
 result:'모델별 포스터 15종을 완성했습니다.\n\n브랜드 의뢰로 제작한 작업이며, 판매 성과는 표기하지 않습니다.',
 gallery:shots('eyewear',[['민트 배경 3D 오브젝트와 안경 포스터','CE4065-1 Jasmin'],['FIT CHIC WIT 정면 포스터','FIT · CHIC · WIT'],['FIT CHIC WIT 측면 포스터','FIT · CHIC · WIT · Side'],['금속 파이프와 안경 포스터','CE4065-2 Jasmin'],['엑스레이 해골에 씌운 선글라스 포스터','CS4066-2 Invalides'],['낙하산이 된 안경 포스터','CE4134 Brochant'],['마네킹 손이 든 안경 포스터','CE4134-2 Brochant'],['미로로 그린 안경 포스터','CS4134 Brochant'],['격자 공간 위 안경 포스터','CS4057-2 Pont Neuf'],['금빛 렌즈를 쓴 마네킹 포스터','CS4068-4 Saint Martin'],['열기구에 매달린 안경 포스터','CE4134-2 Brochant'],['떠 있는 선글라스와 금빛 타일 포스터','CS4079-2 Jules Joffrin'],['안경테 클로즈업 포스터','CE4158 Cansier Daubenton'],['붉은 배경 안경 포스터','CE5106-1 Orphée'],['액자 속 안경 포스터','CE4105-1 Place de Clichy']]).filter((_,i)=>i!==9)},

 {...base,slug:'microplastic-tee',title:'마이크로플라스틱 티셔츠',client:'의류 브랜드',type:'브랜드 의뢰 작업 · 티셔츠 그래픽',industry:'패션 · 환경 메시지',services:['content'],coverImage:cover('microplastic',1),
 summary:'해양 생물을 점으로 그려 미세플라스틱 문제를 전하는 티셔츠 그래픽.',
 scope:'그래픽 콘셉트 · 점묘 일러스트 · 타이포그래피 · 티셔츠 목업 · 그래픽 11종',
 problem:'미세플라스틱의 해로움을 입고 다닐 수 있는 그래픽으로 전해야 했습니다.',
 strategy:'작은 점을 미세플라스틱 입자에 빗대어 불가사리·해마·게·복어 같은 해양 생물을 그렸습니다.',
 execution:'생물마다 색 조합과 헤드라인을 바꾼 그래픽 11종을 만들고 티셔츠 목업에 적용했습니다.',
 result:'티셔츠 그래픽 11종과 목업을 완성했습니다.\n\n브랜드 의뢰로 제작한 작업이며, 판매 성과는 표기하지 않습니다.',
 gallery:shots('microplastic',[['불가사리 그래픽을 적용한 티셔츠 목업','티셔츠 목업'],['불가사리 점묘 그래픽','Balance the Ocean'],['해마 점묘 그래픽','The Coolest Dads in the Ocean'],['게 점묘 그래픽','Crustacean Conundrum'],['물고기 점묘 그래픽, 분홍','Micro Plastic'],['바다거북 점묘 그래픽','Micro Plastic'],['고둥 점묘 그래픽','Shells in Peril'],['물고기 점묘 그래픽, 주황','Save the Macro'],['가오리 점묘 그래픽','가오리'],['복어 점묘 그래픽','Micro Menace'],['해마 꼬리 점묘 그래픽','Tiny Particles, Mighty Harm'],['나뭇잎해룡 점묘 그래픽','Microplastic Peril']]).slice(1)},

 {...base,slug:'graphic-tee',title:'그래픽 티셔츠',client:'의류 브랜드',type:'브랜드 의뢰 작업 · 티셔츠 그래픽',industry:'패션 · 의류',services:['content'],coverImage:cover('graphic-tee',1),
 summary:'빈티지·영화·음악·별자리를 주제로 한 티셔츠 그래픽.',
 scope:'그래픽 콘셉트 · 사진 합성 · 기하 일러스트 · 타이포그래피 · 티셔츠 목업',
 problem:'주제가 서로 다른 그래픽을 하나의 티셔츠 라인으로 보여야 했습니다.',
 strategy:'주제마다 표현 방식을 달리하고, 단색 바탕과 중앙 배치로 라인 전체의 형식을 맞췄습니다.',
 execution:'빈티지 사진 합성, 영화 오마주, 음표로 그린 자동차, 별자리 4종 기하 일러스트를 만들어 티셔츠 목업에 적용했습니다.',
 result:'티셔츠 그래픽 7종을 완성했습니다.\n\n브랜드 의뢰로 제작한 작업이며, 판매 성과는 표기하지 않습니다.',
 gallery:shots('graphic-tee',[['선글라스 렌즈 속 기수 합성 티셔츠','Homage to Vintage'],['붉은 렌즈 그래픽 티셔츠','I Code, Therefore AI Am'],['음표로 그린 자동차 그래픽','Highway Star'],['전갈자리 기하 일러스트','Scorpio'],['쌍둥이자리 기하 일러스트','Gemini'],['양자리 기하 일러스트','Aries'],['궁수자리 기하 일러스트','Sagittarius']]).slice(1)},

 {...base,slug:'w-oil-campaign',title:'여성용 오일 캠페인',client:'여성 케어 브랜드',type:'브랜드 의뢰 작업 · 광고 캠페인',industry:'뷰티 · 여성 케어',services:['content','media'],coverImage:cover('w-oil',6),
 summary:'제품병을 가족·친구의 자리에 앉힌 ‘우리는 가족이다’ 광고 시리즈.',
 scope:'캠페인 메시지 · 3D 공간 연출 · 인물 합성 · 광고 9종 · 시트 마스크 광고 2종',
 problem:'여성용 오일을 일상에 늘 함께하는 존재로 보여 줘야 했습니다.',
 strategy:'제품병을 머리로 한 인물을 엄마·친구·동료의 자리에 두고, 장면마다 단색 공간과 소품을 바꿨습니다.',
 execution:'사무실, 침실, 거실, 식탁, 거리, 비행기, 테니스 코트, 웨딩, 공연 장면으로 광고 9종을 만들고 같은 브랜드의 시트 마스크 광고 2종을 제작했습니다.',
 result:'광고 9종과 시트 마스크 광고 2종을 완성했습니다.\n\n브랜드 의뢰로 제작한 작업이며, 매체 집행이나 판매 성과는 표기하지 않습니다.',
 gallery:shots('w-oil',[['사무실 장면 광고','우리는 가족이다 · 사무실'],['침실 장면 광고','우리는 가족이다 · 침실'],['거실 장면 광고','우리는 가족이다 · 거실'],['식탁 장면 광고','우리는 가족이다 · 식탁'],['거리 벤치 장면 광고','우리는 가족이다 · 거리'],['비행기 좌석 장면 광고','우리는 가족이다 · 비행기'],['테니스 코트 장면 광고','우리는 가족이다 · 테니스'],['웨딩 장면 광고','우리는 가족이다 · 웨딩'],['공연 장면 광고','우리는 가족이다 · 공연'],['시계와 책 속 인물의 시트 마스크 광고','시트 마스크 광고'],['회중시계 속 인물의 시트 마스크 광고','시트 마스크 광고']]).filter((_,i)=>i!==5)},
];

// The existing 소적두 case keeps its web screens and gains the commissioned SNS ads.
export const sojukdooBranding={slug:'sojukdoo-concept',title:'소적두 브랜딩',type:'브랜드 의뢰 작업 · SNS 광고 · 커머스 목업',services:['strategy','content','digital','it'],coverImage:cover('sojukdoo-ads',2),
 summary:'국산 팥·콩 제품을 일상의 장면에 빗댄 SNS 광고와 커머스 화면.',
 scope:'SNS 광고 14종 · 합성 이미지 · 카피 · 제품 배치 · 홈페이지 UI · 제품 분류 · 고객별 탐색',
 problem:'팥차, 팥잼, 콩·팥 간편식처럼 제품마다 다른 쓰임을 짧은 피드 이미지로 전해야 했습니다.',
 strategy:'제품마다 한 장면을 정해 콩과 팥을 운동 기구, 태극기, 모래시계 같은 사물로 바꿔 보여 줬습니다.',
 execution:'SNS용 정사각형 광고 14종을 합성 이미지로 제작하고, 브랜드 소개에서 제품 분류·고객별 탐색으로 이어지는 커머스 화면을 정적 목업으로 만들었습니다.',
 result:'SNS 광고 14종과 커머스 화면 목업을 제작했습니다.\n\n광고는 브랜드 의뢰로 제작했습니다. 커머스 화면은 정적 목업이며 실제 주문·결제 연동이나 구매·광고 성과를 의미하지 않습니다.',
 gallery:shots('sojukdoo-ads',[['투구하는 야구 선수와 검은콩 광고','콩으로 한끼 · 야구'],['거대한 검은콩을 미는 남성 광고','콩으로 한끼'],['검은콩 바벨을 든 남성 광고','콩으로 한끼 · 역도'],['붉은 통로를 흐르는 팥 광고','팥차'],['팥으로 그린 태극기 광고','국산팥'],['팥이 담긴 포장 판 광고','팥차'],['설탕이 팥으로 바뀌는 모래시계 광고','팥잼'],['육상 트랙 광고','팥잼'],['검은콩 앞 손 그림자 광고','콩으로 한끼'],['팥이 담긴 캡슐 광고','팥으로 한끼'],['팥 위에서 스트레칭하는 여성 광고','팥으로 한끼'],['팥에 다리를 올린 여성 광고','팥으로 한끼'],['설탕 단면의 딸기 광고','팥잼'],['엑스레이 속 팥 광고','소적두 · 엑스레이']]).filter((_,i)=>i!==1)};
