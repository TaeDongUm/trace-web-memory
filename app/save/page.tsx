import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import AutoSave from './AutoSave';

export const dynamic = 'force-dynamic';

export default async function Save({ searchParams }: { searchParams: Promise<{ url?: string; title?: string }> }) {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const params = await searchParams;
  return <main className="account-page"><section className="account-card">
    <Link className="brand" href="/">◉ Trace</Link>
    <span className="eyebrow">확장 프로그램 저장</span>
    <h1>이 페이지를 기억에 저장하고 있어요.</h1>
    <AutoSave url={params.url ?? ''} title={params.title ?? ''} />
    <Link className="secondary-button" href="/home">나만의 기억으로 이동</Link>
  </section></main>;
}
