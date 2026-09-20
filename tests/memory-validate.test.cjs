const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateMemoryInput } = require('../.test-build/memory-validate.js');

test('accepts a minimal valid memory and falls back to a URL-derived title', () => {
  const result = validateMemoryInput({ url: 'https://example.com/shoes/black-runner' });
  assert.equal('error' in result, false);
  assert.equal(result.value.url, 'https://example.com/shoes/black-runner');
  assert.equal(result.value.title, 'example.com/shoes/black-runner');
});

test('keeps a provided title instead of the fallback', () => {
  const result = validateMemoryInput({ url: 'https://example.com', title: '  검은 러닝화  ' });
  assert.equal(result.value.title, '검은 러닝화');
});

test('rejects missing, non-https, or local/private URLs', () => {
  for (const url of [undefined, '', 'http://example.com', 'https://localhost/page', 'https://127.0.0.1/page', 'https://192.168.0.1/page', 'not-a-url']) {
    assert.equal(validateMemoryInput({ url }).error, 'invalid_url');
  }
});

test('rejects a title over 500 characters instead of silently truncating', () => {
  const result = validateMemoryInput({ url: 'https://example.com', title: 'a'.repeat(501) });
  assert.equal(result.error, 'invalid_title');
});

test('rejects oversized optional text fields', () => {
  assert.equal(validateMemoryInput({ url: 'https://example.com', summary: 'a'.repeat(4001) }).error, 'invalid_summary');
  assert.equal(validateMemoryInput({ url: 'https://example.com', content: 'a'.repeat(12001) }).error, 'invalid_content');
  assert.equal(validateMemoryInput({ url: 'https://example.com', source: 'a'.repeat(256) }).error, 'invalid_source');
  assert.equal(validateMemoryInput({ url: 'https://example.com', category: 'a'.repeat(51) }).error, 'invalid_category');
});

test('validates image_url the same way as url, but treats it as optional', () => {
  assert.equal(validateMemoryInput({ url: 'https://example.com', image_url: 'http://example.com/a.png' }).error, 'invalid_image_url');
  const result = validateMemoryInput({ url: 'https://example.com', image_url: '' });
  assert.equal('image_url' in result.value, false);
});

test('rejects too many tags, non-string tags, and oversized tag payloads', () => {
  assert.equal(validateMemoryInput({ url: 'https://example.com', tags: Array.from({ length: 31 }, (_, i) => `t${i}`) }).error, 'invalid_tags');
  assert.equal(validateMemoryInput({ url: 'https://example.com', tags: ['ok', 1] }).error, 'invalid_tags');
  assert.equal(validateMemoryInput({ url: 'https://example.com', tags: [Array.from({ length: 4000 }, () => 'x').join('')] }).error, 'invalid_tags');
});

test('validates visited_at as a parseable date when present', () => {
  assert.equal(validateMemoryInput({ url: 'https://example.com', visited_at: 'not-a-date' }).error, 'invalid_visited_at');
  assert.equal(validateMemoryInput({ url: 'https://example.com', visited_at: '2026-09-20T00:00:00Z' }).value.visited_at, '2026-09-20T00:00:00Z');
});

test('rejects non-object metadata and oversized metadata payloads', () => {
  assert.equal(validateMemoryInput({ url: 'https://example.com', metadata: [] }).error, 'invalid_metadata');
  assert.equal(validateMemoryInput({ url: 'https://example.com', metadata: 'x' }).error, 'invalid_metadata');
  assert.equal(validateMemoryInput({ url: 'https://example.com', metadata: { note: 'x'.repeat(8000) } }).error, 'invalid_metadata');
  assert.equal(validateMemoryInput({ url: 'https://example.com', metadata: { price: 189000, currency: 'KRW' } }).value.metadata.currency, 'KRW');
});

test('rejects a non-object request body', () => {
  for (const body of [null, 'string', 42, ['array']]) assert.equal(validateMemoryInput(body).error, 'invalid_body');
});
