import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
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
