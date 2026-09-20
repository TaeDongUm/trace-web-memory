import { supabaseServer } from '@/lib/supabase/server';
import { authConfig, sameOrigin } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const config = authConfig(process.env);
  if (!config) return Response.json({ error: 'auth_unavailable' }, { status: 503, headers });
  if (!sameOrigin(request, config.origin)) return Response.json({ error: 'forbidden' }, { status: 403, headers });

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return Response.json({ error: 'invalid_id' }, { status: 400, headers });

  const client = (await supabaseServer())!;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

  const { data, error } = await client.from('memories').delete().eq('id', id).eq('user_id', user.id).select('id');
  if (error) return Response.json({ error: 'delete_failed' }, { status: 503, headers });
  if (!data.length) return Response.json({ error: 'not_found' }, { status: 404, headers });

  return Response.json({ deleted: true }, { headers });
}
