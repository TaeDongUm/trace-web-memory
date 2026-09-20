import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import MemoryWorkspace from '../home/MemoryWorkspace';

export const dynamic = 'force-dynamic';
export default async function ImportPage() {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await client.from('memories').select('id,title,url,summary,category,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  return <MemoryWorkspace memories={data ?? []} loadError={Boolean(error)} initialImport />;
}
