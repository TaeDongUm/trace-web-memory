const { test } = require('node:test');
const assert = require('node:assert/strict');
const { searchMemories } = require('../.test-build/memory-search.js');

const memories = [
  { id: '1', title: 'Nike Pegasus 42', url: 'https://example.com/1', summary: '블랙 컬러의 로드 러닝화.', category: '쇼핑', tags: ['러닝화', '검정', '페가수스'], created_at: '2026-09-17T00:00:00Z' },
  { id: '2', title: 'MCP 소개', url: 'https://example.com/2', summary: 'MCP를 소개하는 글.', category: '아티클', tags: ['MCP', 'AI'], created_at: '2026-09-16T00:00:00Z' },
  { id: '3', title: 'MacBook Air M3', url: 'https://example.com/3', summary: null, category: null, tags: [], created_at: '2026-09-14T00:00:00Z' },
];

test('empty query returns everything, most recent first, without inventing a reason', () => {
  const hits = searchMemories(memories, '');
  assert.deepEqual(hits.map((h) => h.memory.id), ['1', '2', '3']);
  assert.deepEqual(hits[0].reasons, []);
});

test('matches by tag and reports which saved field it came from', () => {
  const hits = searchMemories(memories, '검정 러닝화');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].memory.id, '1');
  assert.ok(hits[0].reasons.some((r) => r.includes('검정')));
});

test('matches by title/summary text when there is no matching tag', () => {
  const hits = searchMemories(memories, 'MCP 설명한 글');
  assert.equal(hits[0].memory.id, '2');
});

test('a query with only filler words or unknown tokens returns no results, not a guess', () => {
  assert.deepEqual(searchMemories(memories, '그때 봤던 페이지'), []);
  assert.deepEqual(searchMemories(memories, '존재하지않는단어'), []);
});

test('ranks a memory matching every token above one matching only some', () => {
  const hits = searchMemories(memories, '검정 페가수스 존재하지않는단어');
  assert.equal(hits[0].memory.id, '1');
  assert.ok(hits[0].matchedCount < hits[0].totalTokens);
});

test('handles null summary/category and empty tags without throwing', () => {
  const hits = searchMemories(memories, '맥북');
  assert.equal(hits[0].memory.id, '3');
});
