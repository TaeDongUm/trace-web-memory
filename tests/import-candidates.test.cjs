const { test } = require('node:test');
const assert = require('node:assert/strict');
const { suggestSensitive, IMPORT_CANDIDATES } = require('../.test-build/import-candidates.js');

test('flags common sensitive domains/paths (banking, mail, health)', () => {
  assert.equal(suggestSensitive('https://obank.kbstar.com/quics?page=login'), true);
  assert.equal(suggestSensitive('https://mail.google.com/mail/u/0/#inbox'), true);
  assert.equal(suggestSensitive('https://www.nhis.or.kr/health/check-result'), true);
});

test('does not flag ordinary public pages', () => {
  assert.equal(suggestSensitive('https://nextjs.org/docs/app'), false);
  assert.equal(suggestSensitive('https://www.youtube.com/watch?v=abc'), false);
});

test('treats an unparseable URL as sensitive (fail closed)', () => {
  assert.equal(suggestSensitive('not-a-url'), true);
});

test('candidate list matches its own sensitivity suggestions for the demo set', () => {
  const flagged = IMPORT_CANDIDATES.filter((c) => suggestSensitive(c.url));
  assert.ok(flagged.length >= 3, 'expected at least the bank/mail/health examples to be flagged');
});
