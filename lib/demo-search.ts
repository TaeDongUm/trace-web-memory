import { DEMO_TODAY, type DemoMemory } from "./demo-data";
export type SearchHit = { memory: DemoMemory; reasons: string[]; missing: string[]; score: number };
const groups = [
  ["러닝화", "운동화", "런닝화", "running", "shoe"], ["검정", "검정색", "검은", "블랙", "black"],
  ["흰색", "하얀", "화이트", "white"], ["빨강", "빨간", "레드", "red"],
  ["맥북", "macbook"], ["노트북", "laptop"], ["페가수스", "pegasus"],
  ["취업", "채용", "구직", "job"], ["면접", "interview"], ["리액트", "react"],
];
function normalize(text: string) {
  let value = text.normalize("NFKC").toLowerCase();
  for (const [canonical, ...aliases] of groups) for (const alias of aliases.sort((a,b) => b.length-a.length)) value = value.replaceAll(alias, canonical);
  return value;
}
type Clue = { label: string; matches: (m: DemoMemory) => boolean; reason: (m: DemoMemory) => string; weight: number; topic?: boolean };
export function searchMemories(memories: DemoMemory[], query: string): SearchHit[] {
  if (!query.trim()) return memories.map(memory => ({ memory, reasons: [`${memory.savedAt}에 저장한 데모 기억`], missing: [], score: 0 })).sort((a,b) => b.memory.savedAt.localeCompare(a.memory.savedAt));
  let remaining = normalize(query);
  const clues: Clue[] = [];
  const priceMatch = remaining.match(/(\d+(?:\.\d+)?)\s*만\s*원\s*(대|이하|미만|이상|초과|정도|쯤)?/);
  if (priceMatch) {
    const price = Number(priceMatch[1]) * 10000, operator = priceMatch[2] || "정도";
    const lower = operator === "대" || operator === "이상" || operator === "초과" ? price : operator === "이하" || operator === "미만" ? 0 : price * .8;
    const band = price >= 100000 ? 100000 : 10000;
    const upper = operator === "대" ? price + band : operator === "이상" || operator === "초과" ? Infinity : operator === "이하" || operator === "미만" ? price : price * 1.2;
    clues.push({ label: priceMatch[0], weight: 2, matches: m => m.price !== undefined && (operator === "초과" ? m.price > lower : m.price >= lower) && (operator === "대" || operator === "미만" ? m.price < upper : m.price <= upper), reason: m => `가격 기록 ${m.price?.toLocaleString("ko-KR")}원 · ${priceMatch[0]} 조건` });
    remaining = remaining.replace(priceMatch[0], " ");
  }
  const timeMatch = remaining.match(/(\d+)\s*일\s*전|어제|오늘|지난주|최근|며칠\s*전/);
  if (timeMatch) {
    const end = Date.parse(`${DEMO_TODAY}T00:00:00Z`);
    const exact = timeMatch[1] ? Number(timeMatch[1]) : timeMatch[0] === "어제" ? 1 : timeMatch[0] === "오늘" ? 0 : null;
    clues.push({ label: timeMatch[0], weight: 1, matches: m => {
      const age = (end - Date.parse(`${m.savedAt}T00:00:00Z`)) / 86400000;
      return exact !== null ? age === exact : timeMatch[0] === "지난주" ? age >= 7 && age < 14 : age >= 0 && age <= 7;
    }, reason: m => `${m.savedAt} 저장 · 데모 기준일 ${DEMO_TODAY}` });
    remaining = remaining.replace(timeMatch[0], " ");
  }
  const kindMatch = remaining.match(/유튜브|youtube|동영상|영상|아티클|블로그|글|쇼핑|github|깃허브|저장소/);
  if (kindMatch) {
    const kind = /유튜브|youtube|영상/.test(kindMatch[0]) ? "유튜브" : /쇼핑/.test(kindMatch[0]) ? "쇼핑" : /github|깃허브|저장소/.test(kindMatch[0]) ? "개발" : "아티클";
    clues.push({ label: `${kind} 유형`, weight: 2, matches: m => m.category === kind, reason: () => `콘텐츠 유형: ${kind}` });
    remaining = remaining.replace(kindMatch[0], " ");
  }
  remaining = remaining.replace(/관련해서|관련된|관련|설명했던|설명한|설명|봤던|보았던|전에|저번에|지난번에|찾아줘|찾아주세요|찾아|보여줘|기억나는|페이지|그때|어떤|추천해줘|정도|쯤|약/g, " ");
  const tokens = [...new Set(remaining.split(/[^\p{L}\p{N}]+/u).map(t => t.replace(/(에서|으로|했던|이었던|였던|에|을|를|은|는|이|가)$/, "")).filter(t => t.length > 1))];
  for (const token of tokens) clues.push({ label: token, weight: 4, topic: true, matches: m => normalize(`${m.title} ${m.summary} ${m.tags.join(" ")} ${m.source} ${m.color ?? ""}`).includes(token), reason: m => {
    const tag = m.tags.find(tag => normalize(tag).includes(token));
    return tag ? `저장된 태그: ${tag}` : `제목·요약에서 “${token}” 단서를 찾았어요.`;
  } });
  if (!clues.length) return [];
  const topics = clues.filter(c => c.topic);
  return memories.flatMap(memory => {
    if (topics.length && !topics.some(c => c.matches(memory))) return [];
    const matched = clues.filter(c => c.matches(memory));
    if (!matched.length) return [];
    const missing = clues.filter(c => !c.matches(memory)).map(c => c.label);
    const score = matched.reduce((sum,c) => sum+c.weight, 0) / clues.reduce((sum,c) => sum+c.weight, 0);
    return [{ memory, reasons: matched.map(c => c.reason(memory)), missing, score }];
  }).sort((a,b) => a.missing.length === 0 && b.missing.length > 0 ? -1 : b.missing.length === 0 && a.missing.length > 0 ? 1 : b.score-a.score || b.memory.savedAt.localeCompare(a.memory.savedAt));
}
export function relatedMemories(memories: DemoMemory[], selected: DemoMemory) { return memories.filter(m => m.id !== selected.id && m.topic === selected.topic); }
