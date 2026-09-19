export type DemoMemory = {
  id: string;
  title: string;
  source: string;
  domain: string;
  viewed: string;
  category: "쇼핑" | "유튜브" | "아티클" | "개발";
  summary: string;
  tags: string[];
  accent: string;
};

export const demoMemories: DemoMemory[] = [
  {
    id: "nike-pegasus-42",
    title: "Nike Pegasus 42",
    source: "Nike",
    domain: "nike.com",
    viewed: "3일 전",
    category: "쇼핑",
    summary: "검정 컬러의 데일리 러닝화. 약 19만원대였고 쿠셔닝을 강조한 제품.",
    tags: ["러닝화", "검정", "20만원대", "쿠셔닝"],
    accent: "shoe",
  },
  {
    id: "pegasus-review",
    title: "페가수스 42 실착 리뷰",
    source: "YouTube",
    domain: "youtube.com",
    viewed: "4일 전",
    category: "유튜브",
    summary: "페가수스 42 착화감과 사이즈 선택을 비교한 리뷰 영상.",
    tags: ["러닝화", "페가수스", "리뷰"],
    accent: "video",
  },
  {
    id: "mcp-guide",
    title: "MCP 한 번에 정리 (2026)",
    source: "YouTube",
    domain: "youtube.com",
    viewed: "5일 전",
    category: "유튜브",
    summary: "Model Context Protocol의 기본 개념과 실제 활용 흐름을 설명한 영상.",
    tags: ["MCP", "AI", "개발"],
    accent: "dark",
  },
  {
    id: "macbook-air",
    title: "MacBook Air M3 리뷰",
    source: "Velog",
    domain: "velog.io",
    viewed: "6일 전",
    category: "아티클",
    summary: "개발용 노트북 관점에서 성능, 배터리, 휴대성을 정리한 후기.",
    tags: ["맥북", "리뷰", "개발"],
    accent: "blue",
  },
  {
    id: "running-shoes",
    title: "2026 러닝화 추천 BEST 5",
    source: "Brunch",
    domain: "brunch.co.kr",
    viewed: "5일 전",
    category: "아티클",
    summary: "가격대와 용도별 러닝화를 비교한 추천 글. 페가수스 포함.",
    tags: ["러닝화", "추천", "비교"],
    accent: "sand",
  },
  {
    id: "langchain-example",
    title: "langchain-example",
    source: "GitHub",
    domain: "github.com",
    viewed: "1주 전",
    category: "개발",
    summary: "LangChain 기반 간단한 검색/요약 예제 저장소.",
    tags: ["LangChain", "Python", "AI"],
    accent: "code",
  }
];
