export type ImportCandidate = {
  id: string;
  title: string;
  url: string;
  source: string;
  visitedAt: string; // YYYY-MM-DD
};

// 은행/결제/메일/건강 등 민감할 수 있는 도메인·경로 키워드. 완전한 탐지가
// 아니라 "애매하면 우선 제외"를 위한 로컬 사전 필터 샘플이다(가이드 8번 원칙).
const SENSITIVE_KEYWORDS = ['bank', 'pay', 'mail', 'login', 'account', 'health', 'medical', '은행', '결제', '메일', '건강', '병원'];

export function suggestSensitive(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url);
    const haystack = `${hostname}${pathname}`.toLowerCase();
    return SENSITIVE_KEYWORDS.some((keyword) => haystack.includes(keyword));
  } catch {
    return true; // 형식을 알 수 없는 주소는 안전하지 않은 쪽으로 판단한다.
  }
}

// 실제 방문 기록(chrome.history) 자동 스캔은 다음 단계 계획으로 남겨두고,
// 지금은 "가져오기 검토 화면"의 상호작용(기간 선택 -> 후보 검토 -> 민감/제외
// -> 확정 -> 검색)을 실제로 눌러볼 수 있도록 예시 후보로 시연한다.
export const IMPORT_CANDIDATES: ImportCandidate[] = [
  { id: 'c1', title: 'Next.js App Router 문서', url: 'https://nextjs.org/docs/app', source: 'nextjs.org', visitedAt: '2026-09-18' },
  { id: 'c2', title: '리액트 서버 컴포넌트란', url: 'https://react.dev/reference/rsc/server-components', source: 'react.dev', visitedAt: '2026-09-18' },
  { id: 'c3', title: '국민은행 인터넷뱅킹 로그인', url: 'https://obank.kbstar.com/quics?page=login', source: 'kbstar.com', visitedAt: '2026-09-19' },
  { id: 'c4', title: 'Gmail 받은편지함', url: 'https://mail.google.com/mail/u/0/#inbox', source: 'mail.google.com', visitedAt: '2026-09-19' },
  { id: 'c5', title: '무신사 겨울 코트 모음전', url: 'https://www.musinsa.com/main/musinsa/recommend', source: 'musinsa.com', visitedAt: '2026-09-19' },
  { id: 'c6', title: '건강검진 결과 조회', url: 'https://www.nhis.or.kr/health/check-result', source: 'nhis.or.kr', visitedAt: '2026-09-20' },
  { id: 'c7', title: 'TypeScript 5.7 릴리스 노트', url: 'https://devblogs.microsoft.com/typescript/announcing-typescript-5-7', source: 'devblogs.microsoft.com', visitedAt: '2026-09-20' },
  { id: 'c8', title: '가벼운 캠핑 의자 추천 영상', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', source: 'youtube.com', visitedAt: '2026-09-20' },
];
