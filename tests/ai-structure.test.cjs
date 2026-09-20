const { test } = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeStructuredMemory } = require('../.test-build/ai-structure.js');

test('keeps well-formed summary, category, and tags', () => {
  const result = sanitizeStructuredMemory({ summary: '검정 러닝화 리뷰', category: '쇼핑', tags: ['운동화', '러닝'] });
  assert.deepEqual(result, { summary: '검정 러닝화 리뷰', category: '쇼핑', tags: ['운동화', '러닝'] });
});

test('drops fields the model left empty or omitted, instead of inventing values', () => {
  assert.deepEqual(sanitizeStructuredMemory({ summary: '   ' }), {});
  assert.deepEqual(sanitizeStructuredMemory({}), {});
  assert.deepEqual(sanitizeStructuredMemory(null), {});
  assert.deepEqual(sanitizeStructuredMemory('not-json-object'), {});
});

test('ignores fields with the wrong type instead of coercing them', () => {
  const result = sanitizeStructuredMemory({ summary: 123, category: ['쇼핑'], tags: 'not-an-array' });
  assert.deepEqual(result, {});
});

test('rejects an oversized summary or category rather than truncating', () => {
  assert.deepEqual(sanitizeStructuredMemory({ summary: 'a'.repeat(4001) }), {});
  assert.deepEqual(sanitizeStructuredMemory({ category: 'a'.repeat(51) }), {});
});

test('filters out non-string, empty, or overlong tags and caps the list at 30', () => {
  const tags = ['ok', '', 42, 'a'.repeat(51), ...Array.from({ length: 40 }, (_, i) => `t${i}`)];
  const result = sanitizeStructuredMemory({ tags });
  assert.equal(result.tags.length, 30);
  assert.ok(result.tags.every((tag) => typeof tag === 'string' && tag.length > 0 && tag.length <= 50));
});

test('trims whitespace around summary, category, and each tag', () => {
  const result = sanitizeStructuredMemory({ summary: '  요약  ', category: ' 쇼핑 ', tags: [' 태그 '] });
  assert.deepEqual(result, { summary: '요약', category: '쇼핑', tags: ['태그'] });
});
