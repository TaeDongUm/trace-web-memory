import { supabaseServer } from '@/lib/supabase/server';
import { authConfig, sameOrigin } from '@/lib/auth-config';
import { interpretMemoryQuery } from '@/lib/ai-search';
import { hasSensitiveText } from '@/lib/privacy-filter';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const config = authConfig(process.env);
  if (!config) return Response.json({ error: 'auth_unavailable' }, { status: 503, headers });
  if (!sameOrigin(request, config.origin)) return Response.json({ error: 'forbidden' }, { status: 403, headers });
  const client = (await supabaseServer())!;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: 'invalid_query' }, { status: 400, headers });
  let query: string;
  try {
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return Response.json({ error: 'payload_too_large' }, { status: 413, headers }); }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (typeof body.query !== 'string' || !body.query.trim() || body.query.length > 200) throw new Error('invalid_query');
    query = body.query.trim();
  } catch { return Response.json({ error: 'invalid_query' }, { status: 400, headers }); }
  if (hasSensitiveText(query)) return Response.json({ terms: [], mode: 'basic' }, { headers });
  const terms = await interpretMemoryQuery(query);
  return Response.json({ terms: terms ?? [], mode: terms ? 'ai' : 'basic' }, { headers });
}
