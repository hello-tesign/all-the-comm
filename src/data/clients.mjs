// 올더커뮤니케이션이 작업한 고객사 32곳 (2026-10-14 사용자 제공).
// corevibe.co.kr 파트너 배너의 로고 30개와 현대트랜시스·업박스 로고 2개입니다. 파일은 public/clients/.
// 공식 로고 파일이 있는 곳만 로고로, 나머지는 이름 워드마크로 보여 줍니다. corevibe 파일 중 글자로 흉내 낸
// SVG(부평열린안과·정형외과 차원·환타·국제사이버대학교·한우물·미즈여성아동병원·마더케이)는 공식 로고가 아니라서 쓰지 않습니다.
// 분류는 이름으로 분명한 것만 나눕니다: 병원·의원·제약 → 의료·헬스케어, 대학·신문·교육 → 교육·미디어, 나머지 → 기업·브랜드.
export const clientGroups = [['medical', '의료·헬스케어'], ['brand', '기업·브랜드'], ['edu', '교육·미디어']];

import { existsSync } from 'node:fs';
const dir = new URL('../../public/clients/', import.meta.url);
const logo = key => ['svg', 'png'].map(ext => `${key}.${ext}`).find(f => existsSync(new URL(f, dir)));

// 홈 로고 띠는 이 순서로 흐릅니다(분야가 번갈아 보이도록 섞음).
export const clients = [
  ['현대트랜시스', 'hyundai_transys', 'brand'],
  ['강남더블유안과', 'gangnam_w', 'medical'],
  ['웅진씽크빅', 'woongjin_thinkbig', 'edu'],
  ['지멘스', 'siemens', 'brand'],
  ['새빛안과병원', 'saebit', 'medical'],
  ['환타', 'fanta', 'brand'],
  ['국제사이버대학교', 'gukje_univ', 'edu'],
  ['한샘오젠', 'hanssem_ozen', 'brand'],
  ['삼익제약', 'samik_pharm', 'medical'],
  ['마더케이', 'mother_k', 'brand'],
  ['함소아의원', 'hamsoa', 'medical'],
  ['고양신문', 'goyang_news', 'edu'],
  ['지오엠씨', 'geomc', 'brand'],
  ['리드힐병원', 'leadheal', 'medical'],
  ['타코닉', 'taconic', 'brand'],
  ['미즈여성아동병원', 'miz_hospital', 'medical'],
  ['업박스', 'upbox', 'brand'],
  ['민족의학신문', 'minjok', 'edu'],
  ['참진한의원', 'chamjin', 'medical'],
  ['가구톡세상', 'gagutok', 'brand'],
  ['리샘한의원', 'resam', 'medical'],
  ['동서메이케어', 'dongseo', 'brand'],
  ['부평열린안과', 'bupyeong_eye', 'medical'],
  ['더고든', 'thegordon', 'brand'],
  ['상계바론정형외과', 'sanggyebaron', 'medical'],
  ['알트레노띠', 'altrenotti', 'brand'],
  ['미래연여성의원', 'miraeyeon', 'medical'],
  ['단단', 'dandan', 'brand'],
  ['새하늘치과', 'saehaneul', 'medical'],
  ['한우물', 'hanumul', 'brand'],
  ['유재활의학과', 'yoorehab', 'medical'],
  ['정형외과 차원', 'chawon', 'medical']
].map(([name, key, group]) => { const file = logo(key); return { name, key, group, src: file ? `/clients/${file}` : null }; });
