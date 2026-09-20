import { supabaseServer } from '@/lib/supabase/server';
import { authConfig, sameOrigin } from '@/lib/auth-config';
import { validateMemoryInput } from '@/lib/memory-validate';
import { structureMemory } from '@/lib/ai-structure';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 20_000;

export async function GET() {
  const headers = { 'Cache-Control': 'private, no-store' };
  const client = await supabaseServer();
  if (!client) return Response.json({ error: 'auth_unavailable' }, { status: 503, headers });
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const { data, error } = await client.from('memories').select('id,title,url,summary,category,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  if (error) return Response.json({ error: 'memories_unavailable' }, { status: 503, headers });
  return Response.json({ memories: data }, { headers });
}

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const config = authConfig(process.env);
  if (!config) return Response.json({ error: 'auth_unavailable' }, { status: 503, headers });
  if (!sameOrigin(request, config.origin)) return Response.json({ error: 'forbidden' }, { status: 403, headers });

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) return Response.json({ error: 'payload_too_large' }, { status: 413, headers });

  const client = (await supabaseServer())!;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid_json' }, { status: 400, headers }); }

  const validated = validateMemoryInput(body);
  if ('error' in validated) return Response.json({ error: validated.error }, { status: 400, headers });

  // AI 구조화는 호출자가 이미 요약을 보내지 않았을 때만 시도한다. 실패해도
  // structureMemory는 null을 반환하므로 아래 저장은 URL/제목 기반으로 그대로 진행된다.
  let structured = false;
  if (validated.value.summary === undefined) {
    const ai = await structureMemory({ title: validated.value.title, url: validated.value.url, content: validated.value.content });
    if (ai?.summary) { validated.value.summary = ai.summary; structured = true; }
    if (ai?.category && validated.value.category === undefined) { validated.value.category = ai.category; structured = true; }
    if (ai?.tags && validated.value.tags === undefined) { validated.value.tags = ai.tags; structured = true; }
  }

  const { data, error } = await client.from('memories').insert(validated.value).select('id,title,url,summary,category,tags,created_at').single();
  if (error) return Response.json({ error: 'save_failed' }, { status: 503, headers });

  return Response.json({ memory: data, structured }, { status: 201, headers });
}
