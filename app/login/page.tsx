import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const client = await supabaseServer();
  if (client) {
    const { data: { user } } = await client.auth.getUser();
    if (user) redirect('/home');
  }
  const { error } = await searchParams;
  return <main className="account-page"><section className="account-card">
    <Link className="brand" href="/">◉ Trace</Link>
    <span className="eyebrow">나만의 기억 공간</span>
    <h1>기억을 이어서 찾아보세요.</h1>
    <p>로그인만으로 방문 기록을 수집하지 않아요. 직접 선택한 공개 페이지를 기억하는 공간입니다.</p>
    {error && <p role="alert">로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
    {client ? <form action="/auth/sign-in" method="post"><button className="primary-button" type="submit">Google로 계속하기</button></form>
      : <p role="status" className="account-notice">로그인 연결을 준비하고 있어요. 지금은 데모에서 기억 검색을 체험할 수 있어요.</p>}
    <Link className="secondary-button" href="/demo">로그인 없이 데모 체험</Link>
  </section></main>;
}
