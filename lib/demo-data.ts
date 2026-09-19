export type Category = "쇼핑" | "유튜브" | "아티클" | "개발";
export type DemoMemory = {
  id: string; title: string; source: string; url: string; savedAt: string;
  category: Category; summary: string; tags: string[]; accent: string;
  price?: number; color?: string; topic: string;
};
// Public links; saved dates and topic groups are a fictional demonstration.
export const DEMO_TODAY = "2026-09-20";
export const demoMemories: DemoMemory[] = [
  { id: "nike-pegasus-42", title: "Nike Pegasus 42", source: "Nike",
    url: "https://www.nike.com/kr/t/페가수스-42-남성-로드-러닝화-hzTwdMlw/IB1873-001",
    savedAt: "2026-09-17", category: "쇼핑", summary: "블랙 컬러의 로드 러닝화. 쿠셔닝을 살펴본 상품 페이지.",
    tags: ["러닝화", "검정", "쿠셔닝", "페가수스"], accent: "shoe", price: 169000, color: "검정", topic: "running" },
  { id: "pegasus-story", title: "페가수스 42의 쿠셔닝 이야기", source: "Nike Newsroom",
    url: "https://about.nike.com/ko/newsroom/releases/42", savedAt: "2026-09-17", category: "아티클",
    summary: "나이키가 소개하는 페가수스 42의 설계와 러닝 경험.", tags: ["러닝화", "페가수스", "쿠셔닝"], accent: "shoe", topic: "running" },
  { id: "mcp-guide", title: "MCP 소개 — Model Context Protocol", source: "Anthropic",
    url: "https://www.anthropic.com/news/model-context-protocol", savedAt: "2026-09-16", category: "아티클",
    summary: "AI와 데이터·도구를 연결하는 MCP를 소개한 공식 글.", tags: ["MCP", "AI", "프로토콜"], accent: "dark", topic: "mcp" },
  { id: "mcp-video", title: "MCP 설치와 활용 튜토리얼", source: "YouTube · All About AI",
    url: "https://www.youtube.com/watch?v=KiNyvT02HJM", savedAt: "2026-09-16", category: "유튜브",
    summary: "MCP 설정과 도구 사용 흐름을 살펴보는 영상.", tags: ["MCP", "AI", "튜토리얼"], accent: "video", topic: "mcp" },
  { id: "macbook-air", title: "MacBook Air M3 공개", source: "Apple Newsroom",
    url: "https://www.apple.com/newsroom/2024/03/apple-unveils-the-new-13-and-15-inch-macbook-air-with-the-powerful-m3-chip/",
    savedAt: "2026-09-14", category: "아티클", summary: "M3 맥북 에어의 성능과 휴대성을 소개한 공식 발표.",
    tags: ["맥북", "노트북", "M3"], accent: "blue", topic: "macbook" },
  { id: "macbook-specs", title: "MacBook Air M3 기술 사양", source: "Apple Support",
    url: "https://support.apple.com/en-us/118551", savedAt: "2026-09-14", category: "아티클",
    summary: "13형 맥북 에어의 디스플레이와 메모리 등 사양을 확인한 페이지.", tags: ["맥북", "노트북", "사양"], accent: "blue", topic: "macbook" },
  { id: "career-video", title: "개발자 기술 면접 준비 — 이진 트리 알고리즘", source: "YouTube · freeCodeCamp",
    url: "https://www.youtube.com/watch?v=fAAZixBzIAI", savedAt: "2026-09-19", category: "유튜브",
    summary: "Binary Tree Algorithms for Technical Interviews. 취업 준비 중 살펴보는 알고리즘 강의.",
    tags: ["취업", "면접", "알고리즘", "이진 트리"], accent: "video", topic: "career" },
  { id: "langchain", title: "LangChain 공식 저장소", source: "GitHub",
    url: "https://github.com/langchain-ai/langchain", savedAt: "2026-09-10", category: "개발",
    summary: "에이전트 개발에 사용하는 LangChain의 소스 저장소.", tags: ["LangChain", "Python", "AI"], accent: "code", topic: "ai-tools" },
  { id: "mcp-sdk", title: "MCP TypeScript SDK", source: "GitHub",
    url: "https://github.com/modelcontextprotocol/typescript-sdk", savedAt: "2026-09-16", category: "개발",
    summary: "MCP 서버와 클라이언트를 만들기 위한 공식 TypeScript SDK.", tags: ["MCP", "TypeScript", "SDK"], accent: "code", topic: "mcp" },
  { id: "react-guide", title: "React 빠르게 시작하기", source: "React",
    url: "https://react.dev/learn", savedAt: "2026-09-08", category: "개발",
    summary: "컴포넌트와 상태 등 React의 기본 개념을 살펴보는 문서.", tags: ["React", "리액트", "컴포넌트"], accent: "code", topic: "react" },
];
export const exampleQueries = ["저번에 봤던 20만원대 검은 운동화", "MCP 설명했던 글", "최근에 본 취업 관련 영상", "맥북 관련해서 봤던 페이지"];
export function savedLabel(memory: DemoMemory) { return `${memory.savedAt.slice(5).replace("-", "/")} 저장`; }
