// Reviewed Korean portfolio sources; English is held until the Korean edition is final.
import {expansionPortfolio,redbeanUpdate} from './portfolio-expansion.mjs';
import {diversePortfolio} from './portfolio-diverse.mjs';
export const portfolio = [
  ...expansionPortfolio,
  ...diversePortfolio,
  {
    "year": "2026",
    "status": "published",
    "englishPublished": false,
    "publicationConfirmed": true,
    "publicationNote": "2026-10-12 사용자가 직접 제작한 사이트/SaaS와 콘셉트 사례의 캡처 활용을 허용함. 제작자 포트폴리오로 표기. portfolio-captures-2026-10-12",
    "videoUrls": [],
    "slug": "sojukdoo-concept",
    "title": "소적두 — 팥부터.",
    "client": "소적두 브랜드·커머스 콘셉트",
    "type": "제작자 콘셉트",
    "industry": "푸드 · 브랜드 · 커머스",
    "featured": false,
    "services": [
      "strategy",
      "content",
      "it"
    ],
    "coverImage": "/portfolio/site-sojukdoo-commerce.png",
    "summary": "팥의 식감에서 브랜드 언어를 찾고, 패키지와 쇼핑 경험까지 연결한 개발 콘셉트.",
    "scope": "브랜드 방향 · 슬로건 · 패키지 콘셉트 · 커머스 UI · 상품 상세 · 디자인시스템",
    "problem": "팥을 사용한 제품의 장점을 긴 설명 없이 전달하고, 브랜드를 기억하는 순간부터 상품을 고르는 과정까지 일관된 경험을 만드는 과제를 설정했습니다.",
    "strategy": "‘팥부터.’라는 짧은 메시지를 중심에 두었습니다. 알갱이가 씹히는 빵과 고운 팥을 쓰는 떡의 차이를 제품 단면과 글자로 표현하고, 팥빛과 종이의 질감을 웹·패키지에 연결했습니다.",
    "execution": "브랜드 방향과 패키지 시안을 개발하고 쇼핑몰, 상품 상세, 장바구니와 주문서 미리보기를 구현했습니다. 화면의 주인공을 제품과 메시지로 정하고, 메뉴와 구매 동선의 밀도를 조절했습니다.",
    "result": "브랜드의 한 문장을 제품 표현과 구매 화면까지 이어지는 디자인시스템으로 구체화했습니다. 웹·상품 상세·패키지의 표현 기준을 함께 제안했습니다.\n\n개발 콘셉트 · 제품·패키지 이미지는 생성형 시안이며 가격과 구성은 개발 가정입니다.",
    "gallery": [
      {
        "file": "site-sojukdoo-gift.png",
        "alt": "소적두 팥 한 상자 선물 패키지·커머스 콘셉트",
        "caption": "같은 브랜드의 선물 패키지 방향. 제품과 패키지는 개발 콘셉트입니다."
      }
    ]
  },
  {
    "year": "2026",
    "status": "published",
    "englishPublished": false,
    "publicationConfirmed": true,
    "publicationNote": "2026-10-12 사용자가 직접 제작한 사이트/SaaS와 콘셉트 사례의 캡처 활용을 허용함. 제작자 포트폴리오로 표기. portfolio-captures-2026-10-12",
    "videoUrls": [],
    "slug": "soulreset",
    "title": "SoulReset",
    "client": "SoulReset",
    "type": "제작자 프로젝트",
    "industry": "여행 · 서비스 웹사이트",
    "featured": true,
    "services": [
      "content",
      "it"
    ],
    "coverImage": "/portfolio/site-soulreset.png",
    "summary": "서울 여행의 분위기와 서비스 선택, 상담을 연결한 웹사이트.",
    "scope": "서비스 웹 UI · 스토리 슬라이더 · Shopify 테마 · 반응형 화면 · 상담 문의 흐름",
    "problem": "여행의 분위기를 전하면서 서비스 선택과 상담 방법을 명확히 안내해야 했습니다.",
    "strategy": "여정의 장면과 짧은 문장으로 시작해 에디션, 일정과 상담을 구분했습니다.",
    "execution": "Shopify 기반 서비스 화면, 히어로 스토리, 반응형 구조와 단계별 문의 흐름을 제작했습니다.",
    "result": "여행의 장면과 서비스 탐색, 상담 동선을 하나의 사이트로 구현했습니다.\n\n제작자 프로젝트 · 2026.10.12 공개 웹 화면입니다.",
    "gallery": []
  },
  {
    "year": "2026",
    "status": "published",
    "englishPublished": false,
    "publicationConfirmed": true,
    "publicationNote": "2026-10-12 사용자가 직접 제작한 사이트/SaaS와 콘셉트 사례의 캡처 활용을 허용함. 제작자 포트폴리오로 표기. portfolio-captures-2026-10-12",
    "videoUrls": [],
    "slug": "review-atelier",
    "title": "Review Atelier",
    "client": "EA / Review Atelier",
    "type": "제작자 프로토타입",
    "industry": "콘텐츠 · 편집 소프트웨어",
    "featured": false,
    "services": [
      "it",
      "content"
    ],
    "coverImage": "/portfolio/saas-ea-editor.png",
    "summary": "제품 자료부터 원고 편집·근거 검수·출력까지 다루는 작업 화면.",
    "scope": "제품·자료 입력 · 원고 편집 UI · 수정 이력 · 근거 검수 · HTML 출력",
    "problem": "제품 자료와 원고, 수정 이력과 출력을 오가며 작업 상태를 확인해야 했습니다.",
    "strategy": "자료 입력, 편집, 근거 검수, HTML 출력을 나누되 같은 제품과 원고를 이어 쓰게 했습니다.",
    "execution": "자료 입력, 원고 편집, 수정 이력, 근거 검수와 채널별 출력 화면을 구현했습니다.",
    "result": "원고의 편집·확인 상태를 살펴보며 출력하는 작업 화면을 제작했습니다.\n\n구현 프로토타입 · 가상 제품과 시연용 원고를 사용한 데모 화면입니다.",
    "gallery": []
  },
  {
    "year": "2026",
    "status": "published",
    "englishPublished": false,
    "publicationConfirmed": true,
    "publicationNote": "2026-10-12 사용자가 직접 제작한 사이트/SaaS와 콘셉트 사례의 캡처 활용을 허용함. 제작자 포트폴리오로 표기. portfolio-captures-2026-10-12",
    "videoUrls": [],
    "slug": "tesign-radar",
    "title": "TESIGN Radar",
    "client": "TESIGN Radar",
    "type": "제작자 프로젝트",
    "industry": "콘텐츠 · 디지털 서비스",
    "featured": false,
    "services": [
      "content",
      "it"
    ],
    "coverImage": "/portfolio/site-tesign-radar.png",
    "summary": "디지털 도구의 용도와 사용법을 읽고 비교·저장하는 서비스.",
    "scope": "정보 구조 · 도구 콘텐츠 편집 · 웹 UI · 탐색·저장·컬렉션 · 공식 사용 페이지 연결",
    "problem": "많은 디지털 도구 중 자신에게 필요한 것을 판단하고 사용해 볼 정보가 필요했습니다.",
    "strategy": "용도와 사용법 중심의 설명에 비교·저장·공식 페이지 이동을 연결했습니다.",
    "execution": "도구 수집·편집 흐름과 공개 웹 UI, 용도별 탐색, 컬렉션과 저장 기능을 구현했습니다.",
    "result": "도구를 발견하고 비교·저장한 뒤 공식 사이트로 이동하는 탐색 서비스를 제작했습니다.\n\n제작자 프로젝트 · 화면에 수록된 도구는 외부 제품을 소개하는 큐레이션 콘텐츠입니다.",
    "gallery": []
  },
  {
    "year": "2026",
    "status": "published",
    "englishPublished": false,
    "publicationConfirmed": true,
    "publicationNote": "2026-10-12 사용자가 직접 제작한 사이트/SaaS와 콘셉트 사례의 캡처 활용을 허용함. 제작자 포트폴리오로 표기. portfolio-captures-2026-10-12",
    "videoUrls": [],
    "slug": "tesign-workflow",
    "title": "Tesign OS",
    "client": "Tesign OS",
    "type": "제작자 프로젝트 · 내부 도구",
    "industry": "콘텐츠 · 운영 소프트웨어",
    "featured": false,
    "services": [
      "it",
      "content"
    ],
    "coverImage": "/portfolio/saas-tesign-workflow.png",
    "summary": "요청·자료·제작·검수·납품 이력을 연결한 콘텐츠 운영 도구.",
    "scope": "업무 흐름 설계 · 브랜드·제품 자료 · 채널별 결과물 · 검수·납품 이력 · 후속 제작 연결",
    "problem": "채널별 결과물이 달라도 제품의 사실과 표현 기준을 이어가며 작업 상태를 추적해야 했습니다.",
    "strategy": "요청 접수부터 자료 확인, 생성, 검수와 납품까지 한 흐름으로 묶었습니다.",
    "execution": "브랜드·제품 자료, 채널별 결과물과 검수·납품 이력을 연결했습니다.",
    "result": "최종 검수본을 기준으로 후속 제작을 이어가는 내부 작업 환경을 구성했습니다.\n\n내부 도구 · 2026.09.22 검수용 데이터 화면이며, 화면 속 점수는 내부 테스트 값입니다.",
    "gallery": []
  }
].map(p=>p.slug==='sojukdoo-concept'?{...p,...redbeanUpdate}:({...p,featured:['jonghae-community','soulreset','sales-rehearsal'].includes(p.slug)}));
