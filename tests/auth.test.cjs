const { test } = require('node:test');
const assert = require('node:assert/strict');
const { authConfig, sameOrigin } = require('../.test-build/auth-config.js');
const valid = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example', SITE_URL: 'http://127.0.0.1:3000' };
test('missing configuration and private keys fail closed', () => {
  assert.equal(authConfig({}), null);
  for (const key of ['sb_secret_test', 'eyJ.service_role', '']) assert.equal(authConfig({ ...valid, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key }), null);
});
test('canonical origin rejects insecure remote URLs, credentials and redirect paths', () => {
  assert.equal(authConfig(valid).origin, valid.SITE_URL);
  for (const site of ['http://trace.example', 'https://user:pass@trace.example', 'https://trace.example/evil', 'https://trace.example?next=evil', 'not-url']) assert.equal(authConfig({ ...valid, SITE_URL: site }), null);
  assert.equal(authConfig({ ...valid, SITE_URL: 'https://trace.example' }).origin, 'https://trace.example');
  assert.equal(authConfig({ ...valid, NEXT_PUBLIC_SUPABASE_URL: 'http://example.supabase.co' }), null);
});
test('auth mutations require exact Origin, including port', () => {
  for (const origin of ['https://evil.example', 'http://127.0.0.1:3001', 'null']) assert.equal(sameOrigin(new Request('http://127.0.0.1:3000', { headers: { origin } }), valid.SITE_URL), false);
  assert.equal(sameOrigin(new Request(valid.SITE_URL), valid.SITE_URL), false);
  assert.equal(sameOrigin(new Request(valid.SITE_URL, { headers: { origin: valid.SITE_URL } }), valid.SITE_URL), true);
});
