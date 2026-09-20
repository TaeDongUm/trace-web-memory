const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseSearchTerms, interpretMemoryQuery } = require('../.test-build/ai-search.js');
const { blockedPageReason } = require('../.test-build/privacy-filter.js');

test('blocks sensitive pages and secret URLs before import but accepts public docs', () => {
  for (const url of ['https://mail.google.com/inbox', 'https://example.com/?token=abc', 'https://example.com/?access_token=abc', 'https://user:pass@example.com', 'https://example.com/%6Cogin', 'https://health.example.com/results']) assert.ok(blockedPageReason(url));
  assert.equal(blockedPageReason('https://react.dev/learn', 'React documentation'), null);
  assert.ok(blockedPageReason('https://example.com/post', '건강 검진 결과'));
});
test('search output rejects malformed, excessive and sensitive keywords', () => {
  assert.deepEqual(parseSearchTerms({ terms: ['MCP', '연결', 'MCP'] }), ['MCP', '연결']);
  for (const value of [null, {}, { terms: [] }, { terms: [12] }, { terms: [''] }, { terms: Array(7).fill('term') }, { terms: ['access_token=secret'] }]) assert.equal(parseSearchTerms(value), null);
});
test('AI parsing succeeds with valid response and falls back on failures without exposing the key', async () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalFetch = global.fetch;
  process.env.GEMINI_API_KEY = 'test-only';
  try {
    global.fetch = async (url, options) => {
      assert.ok(!url.includes('test-only'));
      assert.equal(options.headers['x-goog-api-key'], 'test-only');
      assert.ok(!options.body.includes('memories'));
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify({ terms: ['MCP', '도구'] }) }] } }] }) };
    };
    assert.deepEqual(await interpretMemoryQuery('MCP 도구 연결 글'), ['MCP', '도구']);
    global.fetch = async () => ({ ok: false });
    assert.equal(await interpretMemoryQuery('맥북'), null);
    global.fetch = async () => { throw new Error('network'); };
    assert.equal(await interpretMemoryQuery('맥북'), null);
    global.fetch = async () => { assert.fail('sensitive query must not be sent'); };
    assert.equal(await interpretMemoryQuery('access_token=secret'), null);
    delete process.env.GEMINI_API_KEY;
    assert.equal(await interpretMemoryQuery('맥북'), null);
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = originalKey;
  }
});
