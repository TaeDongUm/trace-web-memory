export type StructuredMemory = { summary?: string; category?: string; tags?: string[] };

const MODEL = 'gemini-3.6-flash';
const TIMEOUT_MS = 8000;
const MAX_CONTENT_CHARS = 2000;

const byteLength = (value: string) => Buffer.byteLength(value, 'utf8');

export function sanitizeStructuredMemory(parsed: unknown): StructuredMemory {
  const result: StructuredMemory = {};
  if (typeof parsed !== 'object' || parsed === null) return result;
  const obj = parsed as Record<string, unknown>;

  if (typeof obj.summary === 'string') {
    const summary = obj.summary.trim();
    if (summary.length > 0 && summary.length <= 4000) result.summary = summary;
  }
  if (typeof obj.category === 'string') {
    const category = obj.category.trim();
    if (category.length > 0 && category.length <= 50) result.category = category;
  }
  if (Array.isArray(obj.tags)) {
    const tags = obj.tags
      .filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0 && tag.trim().length <= 50)
      .map((tag) => tag.trim())
      .slice(0, 30);
    if (tags.length > 0 && byteLength(JSON.stringify(tags)) <= 4000) result.tags = tags;
  }
  return result;
}

// 최소 입력(제목/주소/본문 일부)만 보내고, 확인되지 않은 값은 만들지 말라고 명시한다.
// 실패·타임아웃·형식 오류는 모두 null로 통일해 호출부가 URL/제목 기반 저장으로 안전하게 전환하게 한다.
export async function structureMemory(input: { title: string; url: string; content?: string }): Promise<StructuredMemory | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const excerpt = (input.content ?? '').slice(0, MAX_CONTENT_CHARS);
  const prompt = [
    '아래는 사용자가 저장하려는 공개 웹페이지 정보다.',
    '주어진 제목/주소/본문에서 실제로 확인되는 내용만 사용해 한국어로 요약·분류·태그를 만들어라.',
    '확인할 수 없는 내용은 추측해서 채우지 말고 비워두거나 생략해라.',
    '요약에 주소를 그대로 옮겨 적지 말고, 본문이 없으면 제목만으로 간결하게 설명해라.',
    '',
    `제목: ${input.title}`,
    `주소: ${input.url}`,
    excerpt ? `본문 일부: ${excerpt}` : '',
  ].filter(Boolean).join('\n');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
            responseSchema: {
              type: 'OBJECT',
              properties: {
                summary: { type: 'STRING' },
                category: { type: 'STRING' },
                tags: { type: 'ARRAY', items: { type: 'STRING' } },
              },
            },
          },
        }),
      },
    );
    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string') return null;
    return sanitizeStructuredMemory(JSON.parse(text));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
