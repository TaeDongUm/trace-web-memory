const test = require('node:test');
const assert = require('node:assert/strict');
const { demoMemories } = require('../.test-build/demo-data.js');
const { searchMemories, relatedMemories } = require('../.test-build/demo-search.js');
const search = query => searchMemories(demoMemories, query);
test('five core queries find distinct relevant memories', () => {
  for (const [query, id] of [
    ['저번에 봤던 20만원대 검은 운동화', 'nike-pegasus-42'],
    ['전에 본 검정색 러닝화', 'nike-pegasus-42'],
    ['MCP 설명했던 글', 'mcp-guide'],
    ['최근에 본 취업 관련 영상', 'career-video'],
    ['맥북 관련해서 봤던 페이지', 'macbook-air'],
  ]) assert.equal(search(query)[0]?.memory.id, id, query);
});
test('unknown and punctuation queries never return a fabricated result', () => {
  for (const query of ['최근에 본 우주여행 잠수함', '존재하지않는기억', '???']) assert.equal(search(query).length, 0, query);
});
test('empty search lists all memories, latest first', () => {
  assert.equal(search('   ').length, 10);
  assert.equal(search('')[0].memory.id, 'career-video');
});
test('price mismatch is exposed, not an invented reason', () => {
  const hit = search('20만원대 검정 운동화')[0];
  assert.ok(hit.missing.includes('20만원대'));
  assert.ok(!hit.reasons.some(reason => reason.includes('가격 기록')));
  assert.ok(search('약 20만원 검정 운동화')[0].reasons.some(reason => reason.includes('169,000')));
});
test('price boundaries are inclusive/exclusive as stated', () => {
  const base = demoMemories[0];
  const fixtures = [199999, 200000, 299999, 300000].map(price => ({ ...base, id: String(price), price }));
  const full = query => searchMemories(fixtures, query).filter(hit => !hit.missing.length).map(hit => hit.memory.price);
  assert.deepEqual(full('20만원대'), [200000, 299999]);
  assert.deepEqual(full('20만원 미만'), [199999]);
  assert.deepEqual(full('20만원 이하'), [199999, 200000]);
});
test('time clues use the disclosed fixed demo date', () => {
  assert.equal(search('어제')[0].memory.id, 'career-video');
  assert.equal(search('오늘').length, 0);
  assert.equal(search('3일 전 검은 운동화')[0].missing.length, 0);
  assert.ok(search('지난주').every(hit => ['langchain', 'react-guide'].includes(hit.memory.id)));
});
test('partial colors are labelled and related topics do not cross', () => {
  assert.ok(search('빨간 운동화')[0].missing.includes('빨강'));
  assert.deepEqual(relatedMemories(demoMemories, demoMemories[0]).map(m => m.id), ['pegasus-story']);
});
test('all memories have unique IDs and individual HTTPS source URLs', () => {
  assert.equal(new Set(demoMemories.map(m => m.id)).size, 10);
  for (const memory of demoMemories) { const url = new URL(memory.url); assert.equal(url.protocol, 'https:'); assert.notEqual(url.pathname, '/'); }
});
