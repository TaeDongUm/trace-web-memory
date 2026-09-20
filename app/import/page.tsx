import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import TraceExperience from '../components/TraceExperience';

export const dynamic = 'force-dynamic';
export default async function ImportPage() {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await client.from('memories').select('id,title,url,summary,category,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  return <TraceExperience authenticated memories={data ?? []} loadError={Boolean(error)} initialCollect />;
}
