export type SearchableMemory = {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  category: string | null;
  tags: string[];
  created_at: string;
};

export type MemorySearchHit = {
  memory: SearchableMemory;
  reasons: string[];
  matchedCount: number;
  totalTokens: number;
};

const FILLER = /관련해서|관련된|관련|설명했던|설명한|설명|봤던|보았던|전에|저번에|지난번에|찾아줘|찾아주세요|찾아|보여줘|기억나는|페이지|그때|어떤|추천해줘|정도|쯤|약/g;

// 흔한 한/영 동의어를 하나의 표준 표기로 합쳐서, 제목이 영문이어도
// 한국어 질의로 찾을 수 있게 한다(예: "맥북" 질의가 "MacBook" 제목과 매칭).
const SYNONYM_GROUPS = [
  ['맥북', 'macbook'], ['노트북', 'laptop'], ['러닝화', '운동화', 'running', 'shoe'],
  ['검정', '검정색', '검은', '블랙', 'black'], ['흰색', '하얀', '화이트', 'white'],
  ['빨강', '빨간', '레드', 'red'], ['취업', '채용', '구직', 'job'], ['면접', 'interview'],
];

const normalize = (text: string) => {
  let value = text.normalize('NFKC').toLowerCase();
  for (const [canonical, ...aliases] of SYNONYM_GROUPS) {
    for (const alias of [...aliases].sort((a, b) => b.length - a.length)) value = value.replaceAll(alias, canonical);
  }
  return value;
};

function tokenize(query: string): string[] {
  const cleaned = normalize(query).replace(FILLER, ' ');
  return [...new Set(
    cleaned.split(/[^\p{L}\p{N}]+/u)
      .map((token) => token.replace(/(에서|으로|했던|이었던|였던|에|을|를|은|는|이|가)$/, ''))
      .filter((token) => token.length > 1),
  )];
}

// 저장된 title/summary/category/tags에서만 근거를 찾는다. 확신 점수를 지어내지
// 않기 위해 matchedCount/totalTokens 원본 수치만 반환하고, 부분 일치 여부는
// 호출부가 판단한다(전부 일치 vs 일부만 일치).
export function searchMemories(memories: SearchableMemory[], query: string): MemorySearchHit[] {
  const sorted = [...memories].sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (!query.trim()) {
    return sorted.map((memory) => ({ memory, reasons: [], matchedCount: 0, totalTokens: 0 }));
  }

  const tokens = tokenize(query);
  if (!tokens.length) return [];

  return sorted
    .flatMap((memory) => {
      const haystack = normalize(`${memory.title} ${memory.summary ?? ''} ${memory.category ?? ''} ${memory.tags.join(' ')}`);
      const matchedTokens = tokens.filter((token) => haystack.includes(token));
      if (!matchedTokens.length) return [];
      const reasons = matchedTokens.map((token) => {
        const tag = memory.tags.find((t) => normalize(t).includes(token));
        return tag ? `저장된 태그: ${tag}` : `제목·요약에서 "${token}" 단서를 찾았어요.`;
      });
      return [{ memory, reasons, matchedCount: matchedTokens.length, totalTokens: tokens.length }];
    })
    .sort((a, b) => b.matchedCount - a.matchedCount || b.memory.created_at.localeCompare(a.memory.created_at));
}
